# -*- coding: utf-8 -*-
"""
SCRIPT TEST: YOLO Detection + Swin Feature Extraction + Best Classifier (SVM/MLP/XGB)

Sử dụng model phân loại tốt nhất đã được huấn luyện trên đặc trưng Swin.
1. Tải model YOLO.
2. Tải model Swin (bỏ head) làm feature extractor (từ weights đã fine-tune).
3. Tải model phân loại tốt nhất (.joblib) đã được train trước đó.
4. Tải class map.
5. Duyệt qua thư mục ảnh test.
6. Với mỗi ảnh:
    a. Xử lý EXIF orientation.
    b. Chạy YOLO detection.
    c. Với mỗi box: Crop ảnh, trích xuất đặc trưng bằng Swin.
    d. Dự đoán lớp bằng model phân loại tốt nhất đã tải.
7. Lưu kết quả dự đoán vào file CSV.
8. (Tùy chọn) Vẽ kết quả lên ảnh.
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
from PIL import Image, ImageOps, ImageDraw, ImageFont
from torchvision import models, transforms
from ultralytics import YOLO
import joblib # Để tải model scikit-learn/xgboost
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

DEFAULT_MODEL_NAME = 'swin_b' # Phải khớp với model đã dùng tạo features/train classifier
DEFAULT_YOLO_MODEL_PATH = os.path.join(BASE_DIR, 'bestz.pt')
# Đường dẫn đến weights Swin ĐÃ TRAIN (dùng để tạo feature extractor)
DEFAULT_FEATURE_EXTRACTOR_WEIGHTS_PATH = os.path.join(BASE_DIR, 'swin_b_pill_classifier_best_downloaded.pth')
# Đường dẫn đến model phân loại TỐT NHẤT đã lưu (.joblib)
DEFAULT_BEST_CLASSIFIER_PATH = os.path.join(BASE_DIR, f'best_classifier_{DEFAULT_MODEL_NAME}.joblib')
# Đường dẫn đến file class map
DEFAULT_CLASS_MAP_PATH = os.path.join(BASE_DIR, f'class_to_idx_{DEFAULT_MODEL_NAME}.json')
# Thư mục chứa ảnh test - ***QUAN TRỌNG: THAY ĐỔI ĐƯỜNG DẪN NÀY***
DEFAULT_TEST_IMAGE_DIR = os.path.join(BASE_DIR, 'public_test_images') # Ví dụ: tạo thư mục này và đặt ảnh test vào
# File CSV lưu kết quả
DEFAULT_OUTPUT_CSV = os.path.join(BASE_DIR, f'results_yolo_swin_best_classifier_{DEFAULT_MODEL_NAME}.csv')
# Thư mục lưu ảnh có vẽ kết quả (nếu bật --draw-output)
DEFAULT_OUTPUT_IMG_DIR = os.path.join(BASE_DIR, f'results_yolo_swin_best_classifier_{DEFAULT_MODEL_NAME}_images')
# Số lớp gốc (sẽ được cập nhật)
NUM_CLASSES_ORIGINAL_DEFAULT = 107

# --- Helper Functions ---

def get_swin_feature_extractor(model_name, weights_path, num_classes_original, device):
    """Tải Swin, bỏ head, load weights ĐÃ TRAIN."""
    logger.info(f"Loading Swin Feature Extractor '{model_name}'...")
    model_fn = None
    if model_name == 'swin_t': model_fn = models.swin_t
    elif model_name == 'swin_s': model_fn = models.swin_s
    elif model_name == 'swin_b': model_fn = models.swin_b
    elif model_name == 'swin_v2_t': model_fn = models.swin_v2_t
    elif model_name == 'swin_v2_s': model_fn = models.swin_v2_s
    elif model_name == 'swin_v2_b': model_fn = models.swin_v2_b
    else: raise ValueError(f"Unsupported Swin architecture: {model_name}")

    if not weights_path or not os.path.exists(weights_path):
        logger.error(f"Trained weights file not found: '{weights_path}'"); return None
    logger.info(f"Loading trained weights from {weights_path}...")
    try:
        model_temp = model_fn(weights=None)
        num_ftrs_orig = model_temp.head.in_features
        # Tái tạo head gốc (giả sử dropout=0.3)
        model_temp.head = nn.Sequential(nn.Dropout(p=0.3), nn.Linear(num_ftrs_orig, num_classes_original))
        model_temp.load_state_dict(torch.load(weights_path, map_location=torch.device('cpu')))

        feature_extractor = model_fn(weights=None)
        feature_extractor.head = nn.Identity()
        feature_extractor.load_state_dict(model_temp.state_dict(), strict=False)
        del model_temp; gc.collect()

        feature_extractor.to(device); feature_extractor.eval()
        logger.info(f"Feature extractor '{model_name}' ready on {device}.")
        return feature_extractor
    except Exception as e:
        logger.error(f"Failed to load feature extractor: {e}"); traceback.print_exc(); return None

def load_class_mapping(json_path):
    """Tải class map và tạo map ngược."""
    logger.info(f"Loading class mapping from: {json_path}")
    if not os.path.exists(json_path): logger.error(f"Class map not found: {json_path}"); return None, None, 0
    try:
        with open(json_path, 'r') as f: class_to_idx = json.load(f)
        idx_to_class = {int(v): k for k, v in class_to_idx.items()} # Map từ index (int) sang class_id (string)
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

def extract_single_feature(model, image_pil_crop, transform, device):
    """Trích xuất đặc trưng cho một ảnh crop."""
    if image_pil_crop is None or model is None: return None
    try:
        if image_pil_crop.mode != 'RGB': image_pil_crop = image_pil_crop.convert('RGB')
        input_tensor = transform(image_pil_crop).unsqueeze(0).to(device)
        with torch.no_grad():
            features = model(input_tensor)
        return features.cpu().numpy()
    except Exception as e: logger.error(f"Feature extraction error for crop: {e}"); return None

def predict_with_classifier(classifier_model, features_np):
    """Dự đoán bằng model phân loại đã tải (SVM/MLP/XGB)."""
    if features_np is None or classifier_model is None: return None, None
    try:
        if features_np.shape[0] != 1: logger.warning(f"Invalid feature shape: {features_np.shape}"); return None, None
        # Dự đoán lớp (index)
        pred_idx = classifier_model.predict(features_np)[0]
        # Dự đoán xác suất (nếu có)
        pred_conf = 0.0
        if hasattr(classifier_model, "predict_proba"):
            probabilities = classifier_model.predict_proba(features_np)[0]
            try:
                # Lấy danh sách các lớp mà model biết (thứ tự quan trọng)
                classes_list = classifier_model.classes_.tolist() if isinstance(classifier_model.classes_, np.ndarray) else classifier_model.classes_
                # Tìm vị trí của lớp dự đoán trong danh sách đó
                class_index_in_model = classes_list.index(pred_idx)
                # Lấy xác suất tại vị trí đó
                pred_conf = probabilities[class_index_in_model]
            except (ValueError, IndexError) as e_proba:
                 logger.warning(f"Could not find predicted class index ({pred_idx}) in classifier's classes_ or probability array index error: {e_proba}. Confidence set to 0.")
                 pred_conf = 0.0
        else:
            logger.warning(f"Classifier {type(classifier_model).__name__} does not support predict_proba. Confidence set to 0.")
            pred_conf = 0.0 # Gán mặc định nếu không có predict_proba
        return int(pred_idx), float(pred_conf) # Đảm bảo trả về kiểu dữ liệu chuẩn
    except Exception as e:
        logger.error(f"Classifier prediction error: {e}"); traceback.print_exc(); return None, None

# --- Main Execution ---
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test YOLO + Swin Features + Best Classifier (SVM/MLP/XGB) - Local Version")
    parser.add_argument('--image-dir', type=str, default=DEFAULT_TEST_IMAGE_DIR, help="Directory containing test images.")
    parser.add_argument('--yolo-model', type=str, default=DEFAULT_YOLO_MODEL_PATH)
    parser.add_argument('--yolo-conf', type=float, default=0.25)
    parser.add_argument('--feature-extractor-weights-path', type=str, default=DEFAULT_FEATURE_EXTRACTOR_WEIGHTS_PATH)
    parser.add_argument('--feature-extractor-model-name', type=str, default=DEFAULT_MODEL_NAME,
                        choices=['swin_t', 'swin_s', 'swin_b', 'swin_v2_t', 'swin_v2_s', 'swin_v2_b'])
    parser.add_argument('--classifier-model-path', type=str, default=DEFAULT_BEST_CLASSIFIER_PATH,
                        help="Path to the saved best classifier model (.joblib).")
    parser.add_argument('--class-map-path', type=str, default=DEFAULT_CLASS_MAP_PATH)
    parser.add_argument('--output-csv', type=str, default=DEFAULT_OUTPUT_CSV)
    parser.add_argument('--draw-output', action='store_true')
    parser.add_argument('--output-img-dir', type=str, default=DEFAULT_OUTPUT_IMG_DIR)
    parser.add_argument('--device', type=str, default='auto', choices=['cuda', 'cpu', 'auto'])
    parser.add_argument('--classifier-conf-threshold', type=float, default=0.0, help="Minimum classifier probability threshold to record/draw (0.0 = always record).")

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

    # Load Swin Feature Extractor
    feature_extractor = get_swin_feature_extractor(args.feature_extractor_model_name,
                                                  args.feature_extractor_weights_path,
                                                  num_classes, device)
    if feature_extractor is None: sys.exit(1)

    # Load the BEST Classifier Model (SVM/MLP/XGB)
    if not os.path.exists(args.classifier_model_path):
        logger.error(f"Best classifier model file not found: {args.classifier_model_path}"); sys.exit(1)
    try:
        logger.info(f"Loading best classifier model from: {args.classifier_model_path}")
        best_classifier = joblib.load(args.classifier_model_path)
        logger.info(f"Best classifier ({type(best_classifier).__name__}) loaded successfully.")
    except Exception as e:
        logger.error(f"Failed to load best classifier model: {e}"); traceback.print_exc(); sys.exit(1)

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

                # Extract features using Swin
                features_np = extract_single_feature(feature_extractor, cropped_pil, inference_transform, device)

                # Predict using the loaded best classifier (SVM/MLP/XGB)
                pred_idx, pred_conf = predict_with_classifier(best_classifier, features_np)

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
                out_img_path = os.path.join(args.output_img_dir, f"{os.path.splitext(filename)[0]}_best_cls_pred.jpg")
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
             if 'features_np' in locals(): del features_np
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

    logger.info(f"--- YOLO + Swin Features + Best Classifier ({type(best_classifier).__name__}) Test Complete ---")