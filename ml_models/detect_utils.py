# detect_utils.py
import os
import random
import numpy as np
import cv2
from PIL import Image
import torch

from ultralytics import YOLO
from transformers import TrOCRProcessor, VisionEncoderDecoderModel

# Thiết lập seed
seed = 1
random.seed(seed)
np.random.seed(seed)
torch.manual_seed(seed)
if torch.cuda.is_available():
    torch.cuda.manual_seed(seed)

# Khởi tạo TrOCR Processor và Model
processor = TrOCRProcessor.from_pretrained("microsoft/trocr-base-printed")
trocr_model = VisionEncoderDecoderModel.from_pretrained("microsoft/trocr-base-printed")
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
trocr_model.to(device)

def detect_and_ocr(image_path, yolo_model):
    """
    Chạy YOLO model trên ảnh để detect bounding boxes,
    sau đó chạy TrOCR trên từng bounding box.

    Trả về:
        List of tuples: [(x_min, y_min, x_max, y_max, ocr_text), ...]
        Hoặc [] nếu không có detection.
    """
    image = cv2.imread(image_path)
    if image is None:
        raise ValueError(f"Không mở được ảnh: {image_path}")

    results = yolo_model.predict(image_path)
    ocr_results = []

    for result in results:
        for box in result.boxes:
            x_min, y_min, x_max, y_max = map(int, box.xyxy[0].cpu().numpy())
            cropped_img = image[y_min:y_max, x_min:x_max]
            pil_crop = Image.fromarray(cv2.cvtColor(cropped_img, cv2.COLOR_BGR2RGB))

            pixel_values = processor(pil_crop, return_tensors="pt").pixel_values.to(device)
            generated_ids = trocr_model.generate(pixel_values)
            extracted_text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]

            ocr_results.append((x_min, y_min, x_max, y_max, extracted_text))

    # if not ocr_results:  # Không cần kiểm tra ở đây
    #     print("No detections from YOLO.") # Không print ở đây
    return ocr_results  # Luôn trả về ocr_results (có thể rỗng)