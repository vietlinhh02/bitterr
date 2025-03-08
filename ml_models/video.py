# -*- coding: utf-8 -*-
"""
File: realtime_processing_yolo_paddle_biogpt.py
Mục đích: Phát hiện hộp thuốc bằng YOLO, nhận diện văn bản thời gian thực từ
các khung đó sử dụng PaddleOCR, và xác minh kết quả qua BioGPT.
"""

import cv2
import time
import torch
import numpy as np
from ultralytics import YOLO
from paddleocr import PaddleOCR
from transformers import pipeline

# --- CÀI ĐẶT ---
# Load PaddleOCR (hỗ trợ tiếng Việt)
ocr = PaddleOCR(use_angle_cls=True, lang="vi")

# Load BioGPT (mô hình chuyên ngành y tế của Microsoft)
biogpt_pipeline = pipeline("text-generation", model="microsoft/biogpt")

# Load model YOLO (thay "path/to/your/yolo_model.pt" bằng đường dẫn đến model của bạn)
yolo_model = YOLO("runs/detect/yolo11n3/weights/best.pt")

# --- CẤU HÌNH ---
DETECT_CLASSES = []  # Để trống nếu muốn phát hiện tất cả
BOX_COLOR = (0, 255, 0)  # Xanh lá
TEXT_COLOR = (255, 255, 255)  # Trắng
OCR_INTERVAL = 1  # Chỉ OCR mỗi 1 giây
BIOGPT_INTERVAL = 10  # Chỉ gửi text đến BioGPT mỗi 10 giây


def verify_with_biogpt(combined_text):
    """
    Gửi đoạn text gộp cho BioGPT xác minh.
    """
    prompt = f"""
Bạn là một dược sĩ. Đây là danh sách tên thuốc trích xuất từ ảnh.
1. Kiểm tra xem các tên thuốc này có chính xác không. Nếu sai, hãy sửa lại.
2. Nếu có nhiều thuốc, hãy kiểm tra tương tác thuốc nguy hiểm.
3. Cung cấp mô tả ngắn cho từng loại thuốc.

Danh sách tên thuốc:
'{combined_text}'
"""
    # Sử dụng max_new_tokens thay cho max_length
    response = biogpt_pipeline(prompt, max_new_tokens=50)[0]["generated_text"]
    return response


def recognize_text_from_roi(frame, bbox):
    """
    Nhận diện văn bản từ vùng chứa (ROI) sử dụng PaddleOCR.
    """
    x1, y1, x2, y2 = [int(coord) for coord in bbox]
    roi = frame[y1:y2, x1:x2]
    
    result = ocr.ocr(roi, cls=True)
    if not result or result[0] is None:
        return ""
    
    # Ghép các từ nhận diện được thành một chuỗi
    extracted_text = " ".join([word[1][0] for line in result for word in line])
    return extracted_text


def deduplicate_drug_names(drug_names):
    """
    Loại bỏ các tên thuốc trùng lặp, giữ nguyên thứ tự xuất hiện.
    """
    unique_names = []
    for name in drug_names:
        # Loại bỏ chuỗi rỗng hoặc chỉ chứa khoảng trắng
        if name and name.strip() and name not in unique_names:
            unique_names.append(name)
    return unique_names


def stream_video():
    """
    Chạy webcam, phát hiện đối tượng bằng YOLO, nhận diện OCR trong khung
    bằng PaddleOCR, gộp kết quả, gửi cho BioGPT và in ra kết quả.
    Nhấn 'q' để thoát.
    """
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Không mở được webcam!")
        return

    # Danh sách lưu các kết quả OCR (tên thuốc) thu được
    detected_drug_names = []
    last_ocr_time = time.time()
    last_biogpt_time = time.time()
    prev_combined_text = ""

    print("Đang chạy webcam. Nhấn 'q' để thoát.")
    while True:
        ret, frame = cap.read()
        if not ret:
            print("Không nhận được frame từ webcam.")
            break

        results = yolo_model.predict(frame, classes=DETECT_CLASSES if DETECT_CLASSES else None, verbose=False)
        # Dùng biến này để lưu văn bản nhận diện của hộp hiện tại (cho hiển thị lên frame)
        current_frame_texts = []
        for result in results:
            for box in result.boxes:
                bbox = box.xyxy[0].tolist()
                x1, y1, x2, y2 = [int(coord) for coord in bbox]
                
                extracted_text = ""
                if time.time() - last_ocr_time > OCR_INTERVAL:
                    extracted_text = recognize_text_from_roi(frame, bbox)
                    # Nếu nhận diện được văn bản, lưu vào danh sách
                    if extracted_text:
                        current_frame_texts.append(extracted_text)
                    last_ocr_time = time.time()
                
                # Vẽ bounding box và văn bản lên frame
                cv2.rectangle(frame, (x1, y1), (x2, y2), BOX_COLOR, 2)
                display_text = extracted_text[:25] + "..." if len(extracted_text) > 25 else extracted_text
                cv2.putText(frame, display_text, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, TEXT_COLOR, 2)
        
        # Thêm các tên thuốc từ frame hiện tại vào danh sách tổng
        if current_frame_texts:
            detected_drug_names.extend(current_frame_texts)

        # Sau khoảng thời gian BIOGPT_INTERVAL, xử lý và gửi các tên thuốc cho BioGPT
        if time.time() - last_biogpt_time > BIOGPT_INTERVAL and detected_drug_names:
            # Loại bỏ các tên thuốc trùng lặp
            unique_drug_names = deduplicate_drug_names(detected_drug_names)
            combined_text = " ".join(unique_drug_names)
            if combined_text != prev_combined_text:
                biogpt_response = verify_with_biogpt(combined_text)
                print(f"\n=== Cập nhật lúc {time.strftime('%H:%M:%S')} ===")
                print("Text nhận diện được:")
                print(combined_text)
                print("Phản hồi từ BioGPT:")
                print(biogpt_response)
                prev_combined_text = combined_text
            # Reset danh sách cho chu kỳ mới
            detected_drug_names = []
            last_biogpt_time = time.time()

        cv2.imshow("YOLO + PaddleOCR", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()


def main():
    stream_video()


if __name__ == "__main__":
    main()
