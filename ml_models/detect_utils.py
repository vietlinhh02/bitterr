# detect_utils.py
import os
import random
import numpy as np
import cv2
from PIL import Image
import torch
import warnings
from ultralytics import YOLO
import google.generativeai as genai

# Thiết lập seed
seed = 1
random.seed(seed)
np.random.seed(seed)
torch.manual_seed(seed)
if torch.cuda.is_available():
    torch.cuda.manual_seed(seed)

# Khởi tạo PaddleOCR với hỗ trợ tiếng Việt (nếu có thể)
try:
    from paddleocr import PaddleOCR
    ocr = PaddleOCR(use_angle_cls=True, lang="vi", use_gpu=torch.cuda.is_available())
    paddle_available = True
except ImportError:
    warnings.warn("PaddleOCR không khả dụng. Sẽ sử dụng Tesseract OCR thay thế.")
    paddle_available = False
    try:
        import pytesseract
        # Đường dẫn đến Tesseract OCR (chỉ cần trên Windows)
        if os.name == 'nt':  # Windows
            pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
    except ImportError:
        warnings.warn("Cả PaddleOCR và Tesseract đều không khả dụng. OCR sẽ không hoạt động.")

# Cấu hình Gemini API (nếu có thể)
gemini_available = False
try:
    # Thay YOUR_GEMINI_API_KEY bằng API key thực của bạn
    # Nếu không có API key, hãy để trống "" để bỏ qua xác minh Gemini
    api_key = ""  # Thay bằng API key thực hoặc để trống
    if api_key:
        genai.configure(api_key=api_key)
        gemini_model = genai.GenerativeModel('gemini-1.5-pro')
        gemini_available = True
    else:
        warnings.warn("API key Gemini không được cung cấp. Tính năng xác minh sẽ bị tắt.")
except Exception as e:
    warnings.warn(f"Không thể cấu hình Gemini API: {e}")

def preprocess_image(image):
    """
    Tiền xử lý ảnh để cải thiện chất lượng OCR
    """
    try:
        # Chuyển sang grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Tăng độ tương phản
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        contrast = clahe.apply(gray)
        
        # Khử nhiễu
        denoised = cv2.fastNlMeansDenoising(contrast)
        
        # Làm sắc nét
        sharpened = cv2.filter2D(denoised, -1, np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]]))
        
        return sharpened
    except Exception as e:
        warnings.warn(f"Lỗi khi tiền xử lý ảnh: {e}")
        return image  # Trả về ảnh gốc nếu có lỗi

def verify_with_gemini(text):
    """
    Xác minh kết quả OCR bằng Gemini
    """
    if not gemini_available or not text:
        return None
        
    prompt = f"""
Bạn là một dược sĩ. Đây là tên thuốc được trích xuất từ ảnh: '{text}'
1. Kiểm tra xem tên thuốc này có chính xác không. Nếu sai, hãy sửa lại.
2. Cung cấp mô tả ngắn về thuốc này.
"""
    try:
        response = gemini_model.generate_content(prompt)
        if response and hasattr(response, 'text'):
            return response.text
        return None
    except Exception as e:
        warnings.warn(f"Lỗi khi xác minh với Gemini: {e}")
        return None

def perform_ocr_with_tesseract(image):
    """
    Thực hiện OCR bằng Tesseract
    """
    try:
        text = pytesseract.image_to_string(image, lang='vie')
        return text.strip()
    except Exception as e:
        warnings.warn(f"Lỗi khi thực hiện OCR với Tesseract: {e}")
        return ""

# Cache để lưu kết quả OCR
ocr_cache = {}

def detect_and_ocr(image_path, yolo_model):
    """
    Chạy YOLO model trên ảnh để detect bounding boxes,
    sau đó chạy OCR trên từng bounding box.
    Kết quả được xác minh qua Gemini nếu có thể.

    Trả về:
        List of tuples: [(x_min, y_min, x_max, y_max, ocr_text, verified_text), ...]
        Hoặc [] nếu không có detection.
    """
    # Kiểm tra cache
    if image_path in ocr_cache:
        return ocr_cache[image_path]

    image = cv2.imread(image_path)
    if image is None:
        raise ValueError(f"Không mở được ảnh: {image_path}")

    results = yolo_model.predict(image_path)
    ocr_results = []

    for result in results:
        for box in result.boxes:
            x_min, y_min, x_max, y_max = map(int, box.xyxy[0].cpu().numpy())
            
            # Cắt và tiền xử lý vùng ảnh
            cropped_img = image[y_min:y_max, x_min:x_max]
            processed_img = preprocess_image(cropped_img)
            
            # Thực hiện OCR
            extracted_text = ""
            if paddle_available:
                try:
                    paddle_result = ocr.ocr(processed_img, cls=True)
                    if paddle_result and paddle_result[0]:
                        # Ghép các từ thành một chuỗi
                        extracted_text = " ".join([word[1][0] for line in paddle_result for word in line])
                except Exception as e:
                    warnings.warn(f"Lỗi khi sử dụng PaddleOCR: {e}")
            
            # Nếu PaddleOCR không khả dụng hoặc không trả về kết quả, thử dùng Tesseract
            if not extracted_text and 'pytesseract' in globals():
                extracted_text = perform_ocr_with_tesseract(processed_img)
            
            # Nếu vẫn không có kết quả, bỏ qua bounding box này
            if not extracted_text:
                continue
                
            # Xác minh bằng Gemini
            verified_text = verify_with_gemini(extracted_text)
            
            ocr_results.append((x_min, y_min, x_max, y_max, extracted_text, verified_text))

    # Lưu vào cache
    ocr_cache[image_path] = ocr_results
    
    return ocr_results