# image_recognition.py
# -*- coding: utf-8 -*-

import os
import glob
import random
import numpy as np
import matplotlib.pyplot as plt
import cv2
from PIL import Image, ImageDraw, ImageFont
import torch
import time
import yaml

from ultralytics import YOLO
from transformers import TrOCRProcessor, VisionEncoderDecoderModel
import google.generativeai as genai

# --- CÀI ĐẶT ---
# Thiết lập seed
seed = 1
random.seed(seed)
np.random.seed(seed)
torch.manual_seed(seed)
if torch.cuda.is_available():
    torch.cuda.manual_seed(seed)

# Cấu hình API key cho Gemini (thay YOUR_GEMINI_API_KEY bằng key thực của bạn)
genai.configure(api_key="AIzaSyCeugBJ5eD2w-9ssumI4CH8zAyqYSD9qQs")
gemini_model = genai.GenerativeModel('gemini-1.5-pro')

# Khởi tạo TrOCR Processor và Model (sử dụng model "microsoft/trocr-large-handwritten")
processor = TrOCRProcessor.from_pretrained("microsoft/trocr-large-handwritten")
trocr_model = VisionEncoderDecoderModel.from_pretrained("microsoft/trocr-large-handwritten")
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
trocr_model.to(device)

# Đường dẫn tới folder chứa dataset (chỉnh sửa cho phù hợp nếu cần)
IMAGE_FOLDER = "./test_images"  # hoặc đường dẫn đầy đủ
image_paths = glob.glob(os.path.join(IMAGE_FOLDER, "*.jpg"))
if len(image_paths) == 0:
    raise ValueError(f"Không tìm thấy ảnh nào trong folder: {IMAGE_FOLDER}")

# --- HÀM XỬ LÝ ---

def verify_with_gemini(combined_text):
    """
    Gửi đoạn text gộp cho Gemini xác minh.
    Trả về một tuple: (is_correct, gemini_response)
    """
    prompt = f"""
Bạn là một dược sĩ. Dưới đây là danh sách tên thuốc được trích xuất từ hình ảnh.
Hãy kiểm tra xem các tên thuốc này có chính xác hay không. Nếu có tên thuốc nào sai chính tả, hãy cung cấp cách viết đúng.
Sau đó, đối với các tên thuốc đã được sửa, hãy phân tích và liệt kê những tương tác thuốc nguy hiểm nếu có,
và cung cấp mô tả ngắn gọn về từng loại thuốc.

Đoạn text được gộp:
'{combined_text}'
"""
    try:
        response = gemini_model.generate_content(prompt)
        if response and response.text:
            # Giả sử nếu phản hồi có hơn 10 từ, coi là có ý nghĩa
            is_correct = len(response.text.split()) > 10
            return is_correct, response.text
        else:
            return False, "Gemini không đưa ra phản hồi."
    except Exception as e:
        print(f"Lỗi khi xác minh với Gemini: {e}")
        return False, f"Lỗi: {e}"

def apply_trocr_and_verify(image_path, results):
    """
    Với mỗi ảnh:
        - Duyệt qua các bounding box (dự đoán từ YOLO).
        - Cắt vùng ảnh và chạy OCR bằng TrOCR cho từng bounding box.
        - Ghi chú bounding box và text lên ảnh gốc (sử dụng PIL với font hỗ trợ tiếng Việt).
        - Gộp văn bản và gửi cho Gemini xác minh.
    Trả về:
        - Danh sách các kết quả OCR cho từng bounding box: (x_min, y_min, x_max, y_max, extracted_text)
        - Tuple: (combined_text, is_correct, gemini_response)
    """
    # Đọc ảnh bằng OpenCV
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError(f"Không mở được ảnh: {image_path}")

    # Chuyển ảnh sang PIL Image để vẽ với font hỗ trợ tiếng Việt
    annotated_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    annotated_image_pil = Image.fromarray(annotated_image)
    draw = ImageDraw.Draw(annotated_image_pil)

    # Cố gắng tải font hỗ trợ tiếng Việt (ví dụ "arial.ttf"). Nếu không tìm thấy, dùng font mặc định.
    try:
        font = ImageFont.truetype("arial.ttf", size=20)
    except Exception as e:
        print("Không tìm thấy font 'arial.ttf', sử dụng font mặc định của PIL. (Có thể không hỗ trợ tiếng Việt tốt)")
        font = ImageFont.load_default()

    individual_results = []
    aggregated_texts = []  # Lưu các đoạn text trích xuất từ từng bounding box

    # Duyệt qua từng kết quả từ YOLO
    for result in results:
        for box in result.boxes:
            # Lấy tọa độ bounding box: [x_min, y_min, x_max, y_max]
            x_min, y_min, x_max, y_max = map(int, box.xyxy[0].cpu().numpy())
            # Cắt ảnh theo bounding box
            cropped_img = image[y_min:y_max, x_min:x_max]
            # Chuyển sang PIL Image và đổi màu từ BGR sang RGB
            pil_crop = Image.fromarray(cv2.cvtColor(cropped_img, cv2.COLOR_BGR2RGB))
            # Tiền xử lý ảnh cho TrOCR
            pixel_values = processor(pil_crop, return_tensors="pt").pixel_values.to(device)
            # Sinh output text từ model
            generated_ids = trocr_model.generate(pixel_values)
            extracted_text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
            individual_results.append((x_min, y_min, x_max, y_max, extracted_text))
            aggregated_texts.append(extracted_text)
            
            # Vẽ bounding box bằng PIL
            draw.rectangle([(x_min, y_min), (x_max, y_max)], outline=(0, 255, 0), width=2)
            # Vẽ text OCR lên ảnh (đảm bảo vị trí không bị tràn ra ngoài)
            text_position = (x_min, max(y_min - 25, 0))
            draw.text(text_position, extracted_text, fill=(0, 255, 0), font=font)

            # Hiển thị ảnh vùng đã nhận diện cùng với text (nếu muốn)
            plt.figure(figsize=(4,4))
            plt.imshow(pil_crop)
            plt.title(f"Text: {extracted_text}")
            plt.axis("off")
            plt.show()

    combined_text = " ".join(aggregated_texts)
    is_correct, gemini_response = verify_with_gemini(combined_text)

    # Hiển thị ảnh kết quả đã được vẽ bounding box và text overlay
    plt.figure(figsize=(10, 10))
    plt.imshow(annotated_image_pil)
    plt.title("Ảnh kết quả với OCR và text overlay")
    plt.axis("off")
    plt.show()

    print("Phản hồi từ Gemini:")
    print(gemini_response)
    
    return individual_results, (combined_text, is_correct, gemini_response)

def main():
    # Tải mô hình YOLO (nếu đã huấn luyện, dùng file weights đã lưu; ở đây ví dụ dùng weights từ "runs/detect/yolo11n3/weights/best.pt")
    yolo_model = YOLO("runs/detect/yolo11n3/weights/best.pt")  # Đảm bảo file model tồn tại

    # Chọn một ảnh mẫu (ví dụ ảnh thứ 10 trong danh sách)
    image_path = image_paths[min(10, len(image_paths)-1)]
    print(f"Đang xử lý ảnh: {image_path}")

    # Dự đoán bounding box bằng YOLO
    results = yolo_model.predict(image_path)
    # Áp dụng OCR và xác minh qua Gemini, đồng thời vẽ các bounding box và text lên ảnh
    _ = apply_trocr_and_verify(image_path, results)

if __name__ == "__main__":
    main()