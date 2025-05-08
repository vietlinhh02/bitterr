# -*- coding: utf-8 -*-
"""
SCRIPT TEST: YOLO Detection + Swin Transformer Direct Classification

Sử dụng model Swin đã fine-tune đầy đủ (bao gồm head) để phân loại trực tiếp.
1. Tải model YOLO.
2. Tải model Swin Transformer ĐÃ FINE-TUNE (bao gồm cả lớp head).
3. Tải class map.
4. Duyệt qua thư mục ảnh test.
5. Với mỗi ảnh:
    a. Xử lý EXIF orientation.
    b. Chạy YOLO detection trên ảnh đã xử lý.
    c. Với mỗi box: Crop ảnh từ ảnh đã xử lý, tiền xử lý, đưa qua Swin để lấy dự đoán lớp trực tiếp.
6. Lưu kết quả dự đoán (ảnh, box, lớp dự đoán, confidence) vào file CSV.
7. (Tùy chọn) Vẽ kết quả lên ảnh.
"""
import os
import sys
import time
import torch
import torch.nn as nn
import numpy as np
import cv2
import uuid
import json
from PIL import Image, ImageOps, ImageDraw, ImageFont # Thêm ImageOps
from torchvision import models, transforms
from ultralytics import YOLO
import argparse
import csv
from tqdm import tqdm
import logging
import traceback
import gc

# --- Logging ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- Configuration & Paths (Mặc định cho máy tính cục bộ) ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__)) # Thư mục chứa script này

DEFAULT_MODEL_NAME = 'swin_b' # PHẢI KHỚP VỚI KIẾN TRÚC CỦA FILE .pth
DEFAULT_YOLO_MODEL_PATH = os.path.join(BASE_DIR, 'bestz.pt')
# QUAN TRỌNG: Đường dẫn đến file .pth của Swin ĐÃ TRAIN ĐẦY ĐỦ
DEFAULT_SWIN_MODEL_PATH = os.path.join(BASE_DIR, 'swin_b_pill_classifier_best_downloaded.pth')
# File map lớp được tạo ra khi train Swin
DEFAULT_CLASS_MAP_PATH = os.path.join(BASE_DIR, f'class_to_idx_{DEFAULT_MODEL_NAME}.json')
# Thư mục chứa ảnh test - ***QUAN TRỌNG: THAY ĐỔI ĐƯỜNG DẪN NÀY***
DEFAULT_TEST_IMAGE_DIR = os.path.join(BASE_DIR, 'public_test_images') # Ví dụ
# File CSV lưu kết quả
DEFAULT_OUTPUT_CSV = os.path.join(BASE_DIR, f'results_yolo_swin_direct_{DEFAULT_MODEL_NAME}.csv')
# Thư mục lưu ảnh có vẽ kết quả (nếu bật --draw-output)
DEFAULT_OUTPUT_IMG_DIR = os.path.join(BASE_DIR, f'results_yolo_swin_direct_{DEFAULT_MODEL_NAME}_images')
# Số lớp gốc (sẽ được cập nhật)
NUM_CLASSES_ORIGINAL_DEFAULT = 107

# --- Helper Functions ---

def load_swin_classifier(model_name, weights_path, num_classes, device):
    """Tải model Swin ĐÃ FINE-TUNE với lớp head phân loại."""
    logger.info(f"Loading Swin Classifier '{model_name}'...")
    model_fn = None
    if model_name == 'swin_t': model_fn = models.swin_t
    elif model_name == 'swin_s': model_fn = models.swin_s
    elif model_name == 'swin_b': model_fn = models.swin_b
    elif model_name == 'swin_v2_t': model_fn = models.swin_v2_t
    elif model_name == 'swin_v2_s': model_fn = models.swin_v2_s
    elif model_name == 'swin_v2_b': model_fn = models.swin_v2_b
    else: raise ValueError(f"Unsupported Swin architecture: {model_name}")

    if not weights_path or not os.path.exists(weights_path):
        logger.error(f"Trained Swin weights file not found: '{weights_path}'"); return None
    logger.info(f"Loading trained weights from: {weights_path}")
    try:
        # Tạo model với cấu trúc head gốc (giống lúc train)
        model = model_fn(weights=None) # Không cần pre-trained ImageNet
        num_ftrs = model.head.in_features
        # Tái tạo chính xác cấu trúc head đã dùng khi train (ví dụ dropout 0.3)
        model.head = nn.Sequential(
            nn.Dropout(p=0.3),
            nn.Linear(num_ftrs, num_classes) # Số lớp gốc
        )
        # Load state dict
        model.load_state_dict(torch.load(weights_path, map_location=device))
        model.to(device); model.eval() # Chuyển sang eval mode
        logger.info(f"Swin Classifier '{model_name}' loaded successfully to {device}.")
        return model
    except Exception as e:
        logger.error(f"Failed to load Swin Classifier weights: {e}"); traceback.print_exc(); return None

def load_class_mapping(json_path):
    """Tải class map và tạo map ngược."""
    logger.info(f"Loading class mapping from: {json_path}")
    if not os.path.exists(json_path): logger.error(f"Class map not found: {json_path}"); return None, None, 0
    try:
        with open(json_path, 'r') as f: class_to_idx = json.load(f)
        # idx_to_class: map từ index (int) sang class_id (string)
        idx_to_class = {int(v): k for k, v in class_to_idx.items()}
        num_classes = len(class_to_idx)
        logger.info(f"Loaded mapping for {num_classes} classes.")
        return class_to_idx, idx_to_class, num_classes
    except Exception as e: logger.error(f"Failed to load class map: {e}"); return None, None, 0

def get_inference_transforms(img_size=224):
    """Lấy validation transforms."""
    mean = [0.485, 0.456, 0.406]; std = [0.229, 0.224, 0.225]
    return transforms.Compose([
        transforms.Resize(int(img_size * 256 / 224)), transforms.CenterCrop(img_size),
        transforms.ToTensor(), transforms.Normalize(mean, std)])

def run_yolo_detection(yolo_model, image_input, confidence_threshold):
    """Chạy YOLO detection."""
    results_list = []
    if yolo_model is None: logger.error("YOLO model not loaded."); return results_list
    input_type = "path" if isinstance(image_input, str) else "PIL object"
    try:
        predictions = yolo_model.predict(source=image_input, conf=confidence_threshold, verbose=False)
        if predictions and len(predictions) > 0:
            boxes = predictions[0].boxes
            if boxes is not None:
                for box in boxes:
                    bbox_int = box.xyxy[0].cpu().numpy().astype(int)
                    conf = float(box.conf[0].cpu().numpy())
                    cls_id = int(box.cls[0].cpu().numpy()) if box.cls is not None else -1
                    results_list.append({'bbox': bbox_int.tolist(),'confidence': round(conf, 4),'class_id': cls_id})
        return results_list
    except Exception as e: logger.error(f"YOLO detection error: {e}"); traceback.print_exc(); return []

def predict_swin_direct(model, image_pil_crop, transform, device):
    """Phân loại ảnh crop bằng Swin classifier đã train."""
    if image_pil_crop is None or model is None: return None, None
    try:
        if image_pil_crop.mode != 'RGB': image_pil_crop = image_pil_crop.convert('RGB')
        input_tensor = transform(image_pil_crop).unsqueeze(0).to(device)
        with torch.no_grad():
            outputs = model(input_tensor)
            probabilities = torch.softmax(outputs, dim=1)
            confidence, predicted_idx = torch.max(probabilities, 1)
        return predicted_idx.item(), confidence.item() # Trả về index (int) và confidence (float)
    except Exception as e:
        logger.error(f"Swin direct prediction error: {e}"); traceback.print_exc(); return None, None

# --- Main Execution ---
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test YOLO + Swin Direct Classification (Local Version)")
    parser.add_argument('--image-dir', type=str, default=DEFAULT_TEST_IMAGE_DIR, help="Directory containing test images.")
    parser.add_argument('--yolo-model', type=str, default=DEFAULT_YOLO_MODEL_PATH)
    parser.add_argument('--yolo-conf', type=float, default=0.25)
    # Đường dẫn đến model Swin ĐÃ TRAIN ĐẦY ĐỦ
    parser.add_argument('--swin-model-path', type=str, default=DEFAULT_SWIN_MODEL_PATH,
                        help="Path to the FULLY TRAINED Swin model .pth file.")
    parser.add_argument('--swin-model-name', type=str, default=DEFAULT_MODEL_NAME,
                        choices=['swin_t', 'swin_s', 'swin_b', 'swin_v2_t', 'swin_v2_s', 'swin_v2_b'])
    parser.add_argument('--class-map-path', type=str, default=DEFAULT_CLASS_MAP_PATH)
    parser.add_argument('--output-csv', type=str, default=DEFAULT_OUTPUT_CSV)
    parser.add_argument('--draw-output', action='store_true')
    parser.add_argument('--output-img-dir', type=str, default=DEFAULT_OUTPUT_IMG_DIR)
    parser.add_argument('--device', type=str, default='auto', choices=['cuda', 'cpu', 'auto'])
    parser.add_argument('--classifier-conf-threshold', type=float, default=0.0, help="Minimum Swin confidence threshold to record/draw (0.0 = always record).")

    args = parser.parse_args()

    # Setup Device
    if args.device == 'auto': device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    else: device = torch.device(args.device)
    logger.info(f"Using device: {device}")

    # Load Class Map
    class_to_idx, idx_to_class, num_classes = load_class_mapping(args.class_map_path)
    if idx_to_class is None: sys.exit(1)
    if num_classes == 0: num_classes = NUM_CLASSES_ORIGINAL_DEFAULT; logger.warning(f"Using default num_classes: {num_classes}")

    # Load YOLO Model
    if not os.path.exists(args.yolo_model): logger.error(f"YOLO model not found: {args.yolo_model}"); sys.exit(1)
    try: yolo_model = YOLO(args.yolo_model); logger.info("YOLO model loaded.")
    except Exception as e: logger.error(f"Failed to load YOLO model: {e}"); sys.exit(1)

    # Load Swin Classifier Model (Đã fine-tune đầy đủ)
    swin_classifier = load_swin_classifier(args.swin_model_name, args.swin_model_path, num_classes, device)
    if swin_classifier is None: sys.exit(1)

    # Prepare output
    if not os.path.isdir(args.image_dir): logger.error(f"Test image directory not found: {args.image_dir}"); sys.exit(1)
    if args.draw_output: os.makedirs(args.output_img_dir, exist_ok=True)
    results_list = []
    inference_transform = get_inference_transforms()

    # Process images
    image_files = [f for f in os.listdir(args.image_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.webp'))]
    logger.info(f"Found {len(image_files)} images in {args.image_dir}")

    total_start_time = time.time()

    for filename in tqdm(image_files, desc="Processing Images"):
        image_path = os.path.join(args.image_dir, filename)
        img_results_for_drawing = []

        try:
            # Load image and correct orientation
            img_pil_original = Image.open(image_path)
            img_pil_corrected = ImageOps.exif_transpose(img_pil_original).convert('RGB')

            # Run YOLO detection
            yolo_detections = run_yolo_detection(yolo_model, img_pil_corrected, args.yolo_conf)

            img_to_draw = None
            if args.draw_output:
                 try: img_np = np.array(img_pil_corrected); img_to_draw = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
                 except Exception as e_cv: logger.error(f"Error converting PIL to CV2 for {filename}: {e_cv}"); img_to_draw = None

            if not yolo_detections:
                 results_list.append({'image_filename': filename, 'box_id': -1, 'bbox': None, 'yolo_confidence': None,
                                      'predicted_class_id': None, 'predicted_class_name': 'NO_DETECTION', 'classifier_confidence': None})
                 continue

            # Process each detection
            for i, det in enumerate(yolo_detections):
                bbox = det['bbox']; yolo_conf = det['confidence']
                x1, y1, x2, y2 = map(int, bbox)

                # Crop from corrected image
                img_w, img_h = img_pil_corrected.size
                x1c, y1c, x2c, y2c = max(0, x1), max(0, y1), min(img_w, x2), min(img_h, y2)
                if x1c >= x2c or y1c >= y2c: continue

                try: cropped_pil = img_pil_corrected.crop((x1c, y1c, x2c, y2c))
                except Exception as e_crop: logger.warning(f"Crop failed for {filename}, box {i}: {e_crop}"); continue
                if cropped_pil.size[0] == 0 or cropped_pil.size[1] == 0: continue

                # Predict using Swin Classifier DIRECTLY
                pred_idx, pred_conf = predict_swin_direct(swin_classifier, cropped_pil, inference_transform, device)

                pred_class_name = "N/A"
                if pred_idx is not None:
                    # Lấy tên lớp (string ID) từ map ngược idx_to_class
                    pred_class_name = idx_to_class.get(pred_idx, f"UnknownIdx:{pred_idx}")

                # Store result if confidence meets threshold
                if pred_conf is None or pred_conf >= args.classifier_conf_threshold:
                    result_data = {
                        'image_filename': filename,
                        'box_id': i,
                        'bbox': bbox,
                        'yolo_confidence': round(yolo_conf, 5),
                        'predicted_class_id': pred_idx, # Lưu index (int)
                        'predicted_class_name': pred_class_name, # Lưu tên lớp (string)
                        'classifier_confidence': round(pred_conf, 5) if pred_conf is not None else None
                    }
                    results_list.append(result_data)
                    # Chỉ thêm vào list để vẽ nếu dự đoán thành công và đạt ngưỡng
                    if pred_idx is not None and pred_conf is not None and pred_conf >= args.classifier_conf_threshold:
                         img_results_for_drawing.append(result_data)

            # Draw results on image if enabled
            if args.draw_output and img_to_draw is not None:
                for res in img_results_for_drawing: # Chỉ vẽ các kết quả đạt ngưỡng
                    bbox = res['bbox']; pred_name = res['predicted_class_name']; pred_conf = res['classifier_confidence']
                    if bbox and pred_name != "N/A" and pred_conf is not None: # Kiểm tra lại lần nữa cho chắc
                        x1d, y1d, x2d, y2d = map(int, bbox)
                        color = (0, 255, 0) # Màu xanh cho dự đoán hợp lệ, đạt ngưỡng
                        cv2.rectangle(img_to_draw, (x1d, y1d), (x2d, y2d), color, 2)
                        display_name = (pred_name[:15] + '..') if len(pred_name) > 17 else pred_name
                        label = f"B{res['box_id']}:{display_name}({pred_conf:.2f})"
                        font=cv2.FONT_HERSHEY_SIMPLEX; scale=0.5; thick=1
                        (tw,th),bl = cv2.getTextSize(label,font,scale,thick)
                        tx=x1d; ty=y1d-10
                        if ty<th+bl: ty=y2d+th+bl
                        bg_y1=ty-th-bl; bg_y2=ty+bl; bg_x1=tx; bg_x2=tx+tw
                        h_cv,w_cv=img_to_draw.shape[:2]
                        bg_x1=max(0,bg_x1);bg_y1=max(0,bg_y1);bg_x2=min(w_cv,bg_x2);bg_y2=min(h_cv,bg_y2)
                        if bg_x2>bg_x1 and bg_y2>bg_y1:
                            cv2.rectangle(img_to_draw,(bg_x1,bg_y1),(bg_x2,bg_y2),color,-1)
                            if bg_x2<tx+tw: tx=max(0,bg_x2-tw)
                            cv2.putText(img_to_draw,label,(tx,ty),font,scale,(0,0,0),thick,cv2.LINE_AA)
                # Save drawn image
                # Đảm bảo thư mục output tồn tại
                os.makedirs(args.output_img_dir, exist_ok=True)
                out_img_path = os.path.join(args.output_img_dir, f"{os.path.splitext(filename)[0]}_direct_pred.jpg")
                try: cv2.imwrite(out_img_path, img_to_draw)
                except Exception as e_save: logger.error(f"Failed to save drawn image {out_img_path}: {e_save}")

        except Exception as e_img:
            logger.error(f"Failed to process image {image_path}: {e_img}")
            traceback.print_exc()
            results_list.append({'image_filename': filename, 'box_id': -2, 'bbox': None, 'yolo_confidence': None,
                                 'predicted_class_id': None, 'predicted_class_name': 'PROCESSING_ERROR', 'classifier_confidence': None})
        finally:
             # Dọn dẹp bộ nhớ sau mỗi ảnh
             if 'img_pil_original' in locals(): del img_pil_original
             if 'img_pil_corrected' in locals(): del img_pil_corrected
             if 'img_to_draw' in locals(): del img_to_draw
             if 'cropped_pil' in locals(): del cropped_pil
             if 'input_tensor' in locals(): del input_tensor # Mặc dù không dùng trực tiếp nhưng có thể tạo trong predict_swin_direct
             gc.collect()
             if device.type == 'cuda': torch.cuda.empty_cache()

    total_end_time = time.time()
    logger.info(f"Finished processing all images in {total_end_time - total_start_time:.2f} seconds.")

    # Save results to CSV (Sử dụng code đã sửa lỗi đường dẫn)
    if results_list:
        try:
            abs_csv_path = os.path.abspath(args.output_csv)
            output_dir_csv = os.path.dirname(abs_csv_path)
            if output_dir_csv: os.makedirs(output_dir_csv, exist_ok=True)
            logger.info(f"Saving {len(results_list)} results to: {abs_csv_path}")
            with open(abs_csv_path, 'w', newline='', encoding='utf-8') as csvfile:
                fieldnames = ['image_filename', 'box_id', 'bbox', 'yolo_confidence',
                              'predicted_class_id', 'predicted_class_name', 'classifier_confidence']
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(results_list)
            logger.info("CSV results saved successfully.")
        except Exception as e_csv:
            logger.error(f"Failed to save results to CSV at {abs_csv_path}: {e_csv}")
            traceback.print_exc()
    else:
        logger.warning("No results generated to save.")

    logger.info(f"--- YOLO + Swin Direct Classification Test Complete ---")