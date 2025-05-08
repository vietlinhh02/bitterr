# -*- coding: utf-8 -*-
import os
import sys
import time
import torch
import numpy as np
import cv2
import uuid
import json
# THÊM: ImageOps để xử lý EXIF orientation
from PIL import Image, ImageDraw, ImageFont, ExifTags, ImageOps
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse, FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import joblib
from ultralytics import YOLO
import logging
import traceback # Để in chi tiết lỗi
from sklearn.neighbors import KNeighborsClassifier

# Thiết lập logging
logging.basicConfig(level=logging.INFO,
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Thiết lập đường dẫn
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")
TEMP_DIR = os.path.join(BASE_DIR, "temp")

# Đảm bảo thư mục tồn tại
os.makedirs(STATIC_DIR, exist_ok=True)
os.makedirs(TEMP_DIR, exist_ok=True)

# Cấu hình mô hình (Đảm bảo các đường dẫn này đúng)
YOLO_MODEL_PATH = os.path.join(BASE_DIR, "bestz.pt")
SWIN_MODEL_PATH = os.path.join(BASE_DIR, "swin_b_pill_classifier_best_downloaded.pth")
KNN_FEATURES_PATH = os.path.join(BASE_DIR, "knn_features_swin_b.npy")
KNN_LABELS_PATH = os.path.join(BASE_DIR, "knn_labels_swin_b.npy")
CLASS_MAP_PATH = os.path.join(BASE_DIR, "class_to_idx_swin_b.json")
KNN_MODEL_PATH = os.path.join(BASE_DIR, "knn_model_swin_b_k5_cosine.joblib") # Sử dụng khoảng cách cosine

# Import các hàm từ z.py (hoặc file chứa các hàm helper của bạn)
try:
    sys.path.append(BASE_DIR)
    # Đảm bảo các hàm này có trong file z.py hoặc file tương ứng
    from z import (get_swin_feature_extractor, load_class_mapping,
                   get_validation_transforms, run_yolo_detection as run_yolo_detection_original)
    Z_IMPORTED = True
except ImportError as e:
    logger.error(f"Không thể import các hàm từ z.py: {e}. Sử dụng định nghĩa cục bộ nếu có.")
    Z_IMPORTED = False
    # Định nghĩa lại các hàm cần thiết nếu import lỗi (để script chạy được)
    # --- Định nghĩa lại các hàm bị thiếu ---
    # ... (Bạn cần copy các hàm get_swin_feature_extractor, load_class_mapping,
    #      get_validation_transforms, run_yolo_detection từ script trước vào đây nếu z.py không tồn tại)
    # Ví dụ (cần hoàn thiện):
    def get_validation_transforms(img_size=224):
        from torchvision import transforms # Import trong hàm
        imagenet_mean = [0.485, 0.456, 0.406]; imagenet_std = [0.229, 0.224, 0.225]
        return transforms.Compose([
            transforms.Resize(int(img_size * 256 / 224)), transforms.CenterCrop(img_size),
            transforms.ToTensor(), transforms.Normalize(imagenet_mean, imagenet_std)
        ])
    # ... (Thêm các hàm khác nếu cần) ...

# Khởi tạo ứng dụng
app = FastAPI(title="Pill Detection API", description="API nhận diện thuốc", version="1.0.0")

# CORS middleware
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# Static files
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# Biến toàn cục
yolo_model = None
feature_extractor = None
knn_model = None
class_to_idx = None
idx_to_class = None
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
logger.info(f"Sử dụng thiết bị: {device}")

# Lớp Pydantic cho kết quả
class Detection(BaseModel):
    box_id: int
    bbox: List[int]
    yolo_confidence: float
    medication_name: Optional[str] = None
    medication_id: Optional[str] = None
    confidence: Optional[float] = None

class DetectionResult(BaseModel):
    detections: List[Detection]
    image_path: str

# --- Các hàm xử lý ---

def extract_features(image_pil, feature_extractor_model, device_):
    """Trích xuất đặc trưng từ ảnh PIL - phiên bản tối ưu hiệu suất."""
    if image_pil is None or feature_extractor_model is None: return None
    try:
        transform = get_validation_transforms() # Lấy transform
        # Đảm bảo ảnh là RGB
        if image_pil.mode != 'RGB': image_pil = image_pil.convert('RGB')
        
        # Sử dụng cache_img để tránh việc resize và crop nhiều lần
        # Tính toán hash của ảnh - sử dụng kích thước và vị trí trung tâm ảnh
        w, h = image_pil.size
        # Simple hash for caching
        img_hash = f"{w}_{h}_{hash(image_pil.tobytes()[:1000])}"  # Chỉ lấy 1000 bytes đầu để tính hash nhanh
        
        # Dùng biến static cho cache để tối ưu bộ nhớ
        if not hasattr(extract_features, "cache"):
            extract_features.cache = {}
        
        # Kiểm tra cache
        if img_hash in extract_features.cache:
            return extract_features.cache[img_hash]
            
        # Nếu không có trong cache, thực hiện trích xuất
        # Sử dụng with torch.no_grad() và inference mode để tăng tốc độ
        with torch.no_grad(), torch.inference_mode():
            image_tensor = transform(image_pil).unsqueeze(0).to(device_)
            features = feature_extractor_model(image_tensor)
            
        features_np = features.cpu().numpy()
        
        # Lưu vào cache khi kích thước cache chưa quá lớn
        if len(extract_features.cache) < 50:  # Giới hạn kích thước cache
            extract_features.cache[img_hash] = features_np
            
        return features_np
    except Exception as e:
        logger.error(f"Lỗi trích xuất đặc trưng: {e}")
        return None
        
def run_yolo_detection(yolo_model, image_input, confidence_threshold):
    """Runs YOLO detection on an image path or PIL image object.
    
    Bản cải tiến:
    - Tiền xử lý ảnh nhẹ hơn để tăng tốc độ
    - Tối ưu các tham số YOLO cho tốc độ cao hơn
    - Thuật toán xử lý hậu kỳ hiệu quả hơn
    """
    results_list = []
    if yolo_model is None:
        logger.error("YOLO model not loaded.")
        return results_list
    
    input_type = "path" if isinstance(image_input, str) else "PIL object"
    logger.info(f"Running YOLO detection on {input_type} (conf_thresh={confidence_threshold})...")
    start_time = time.time()
    
    try:
        # Chuyển đổi input sang định dạng phù hợp để tiền xử lý
        if isinstance(image_input, str):
            # Nếu là đường dẫn, đọc ảnh trực tiếp bằng PIL thay vì OpenCV để giảm chuyển đổi
            try:
                img_pil = Image.open(image_input).convert('RGB')
                process_needed = True
            except Exception as e:
                logger.error(f"Lỗi khi đọc ảnh: {e}")
                return []
        else:
            # Sử dụng PIL Image trực tiếp
            img_pil = image_input
            if img_pil.mode != 'RGB':
                img_pil = img_pil.convert('RGB')
            process_needed = True
        
        # === TIỀN XỬ LÝ NHẸ HƠN ĐỂ TĂNG TỐC ĐỘ ===
        if process_needed:
            # Chuyển thành numpy array - chỉ chuyển một lần
            img_np = np.array(img_pil)
            
            # 1. Chỉ áp dụng cải thiện độ tương phản cơ bản
            img_cv = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
            
            # 2. Sử dụng CLAHE nhẹ nhàng hơn (chỉ áp dụng cho kênh V trong HSV thay vì LAB)
            img_hsv = cv2.cvtColor(img_cv, cv2.COLOR_BGR2HSV)
            h, s, v = cv2.split(img_hsv)
            
            # Áp dụng CLAHE nhanh hơn với gridSize nhỏ hơn
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(4, 4))
            v_eq = clahe.apply(v)
            
            # 3. Tái tạo ảnh mà không cần nhiều bước chuyển đổi
            img_hsv = cv2.merge([h, s, v_eq])
            img_enhanced = cv2.cvtColor(img_hsv, cv2.COLOR_HSV2BGR)
            
            # 4. Bỏ qua bước giảm nhiễu (rất tốn thời gian) - chỉ áp dụng khi thực sự cần thiết
            # Thay vào đó, dùng Gaussian Blur nhẹ nhàng và nhanh hơn nhiều
            img_enhanced = cv2.GaussianBlur(img_enhanced, (3, 3), 0)
            
            # 5. Chuyển lại sang PIL Image để chạy YOLO
            enhanced_pil = Image.fromarray(cv2.cvtColor(img_enhanced, cv2.COLOR_BGR2RGB))
        else:
            # Nếu không cần xử lý, sử dụng ảnh gốc
            enhanced_pil = img_pil
        
        # === PHÁT HIỆN VỚI YOLO - CẢI THIỆN TỐC ĐỘ ===
        low_conf = max(0.1, confidence_threshold * 0.7)  # Nâng ngưỡng thấp để xử lý ít box hơn
        high_iou = 0.7  # Giảm IoU để NMS loại bỏ nhiều box trùng lặp hơn
        
        # Thêm tham số để tăng tốc độ dự đoán
        predictions = yolo_model.predict(
            source=enhanced_pil,
            conf=low_conf,
            iou=high_iou,
            verbose=False,
            agnostic_nms=True,
            max_det=30,  # Giảm số lượng box tối đa
            half=True    # Sử dụng half precision (FP16) để tăng tốc độ
        )

        # Xử lý kết quả từ YOLO
        raw_results = []
        if predictions and len(predictions) > 0:
            boxes = predictions[0].boxes  # Access the Boxes object for the first image
            if boxes is not None and len(boxes) > 0:
                for box in boxes:
                    bbox_coords = box.xyxy[0].cpu().numpy()
                    confidence = float(box.conf[0].cpu().numpy())
                    class_id = int(box.cls[0].cpu().numpy()) if box.cls is not None else -1
                    
                    # Lọc ngay tại đây để giảm xử lý sau này
                    if confidence >= confidence_threshold:
                        raw_results.append({
                            'bbox': bbox_coords.tolist(),
                            'confidence': confidence,
                            'class_id': class_id
                        })
                    
        # Sắp xếp theo độ tin cậy (giảm dần) ngay từ đầu
        raw_results = sorted(raw_results, key=lambda x: x['confidence'], reverse=True)
        
        # === XỬ LÝ HẬU KỲ TỐI ƯU ===
        # Nếu số lượng box nhỏ (≤ 3), bỏ qua thuật toán nhóm box phức tạp 
        # và chỉ chuyển đổi định dạng cho output
        if len(raw_results) <= 3:
            for box in raw_results:
                results_list.append({
                    'bbox': [int(coord) for coord in box['bbox']],
                    'confidence': round(box['confidence'], 4),
                    'class_id': box['class_id']
                })
        else:
            # Chỉ áp dụng thuật toán nhóm box khi có nhiều box
            def calculate_iou(box1, box2):
                """Tính IoU giữa hai box."""
                x1_1, y1_1, x2_1, y2_1 = box1
                x1_2, y1_2, x2_2, y2_2 = box2
                
                # Kiểm tra nhanh trước khi tính toán chi tiết
                if x1_1 > x2_2 or x2_1 < x1_2 or y1_1 > y2_2 or y2_1 < y1_2:
                    return 0.0
                    
                # Tính diện tích giao nhau
                x_left = max(x1_1, x1_2)
                y_top = max(y1_1, y1_2)
                x_right = min(x2_1, x2_2)
                y_bottom = min(y2_1, y2_2)
                
                intersection_area = (x_right - x_left) * (y_bottom - y_top)
                
                # Tính diện tích mỗi box
                box1_area = (x2_1 - x1_1) * (y2_1 - y1_1)
                box2_area = (x2_2 - x1_2) * (y2_2 - y1_2)
                
                # Tính IoU
                iou = intersection_area / float(box1_area + box2_area - intersection_area)
                return iou

            def group_boxes_optimized(boxes, iou_threshold=0.3):
                """Phiên bản tối ưu của thuật toán nhóm box."""
                if not boxes or len(boxes) <= 1:
                    return [[0]] if len(boxes) == 1 else []
                    
                n = len(boxes)
                used = [False] * n
                groups = []
                
                # Tạo danh sách center points cho kiểm tra nhanh
                centers = [(box['bbox'][0] + box['bbox'][2]) / 2 for box in boxes]
                
                for i in range(n):
                    if used[i]:
                        continue
                        
                    current_group = [i]
                    used[i] = True
                    x_center_i = centers[i]
                    
                    # Tính toán giới hạn khoảng cách trung tâm
                    box_width = boxes[i]['bbox'][2] - boxes[i]['bbox'][0]
                    max_center_dist = box_width * 1.5  # Ngưỡng khoảng cách trung tâm
                    
                    for j in range(i+1, n):
                        if used[j]:
                            continue
                        
                        # Kiểm tra khoảng cách giữa các tâm box - rất nhanh
                        if abs(centers[j] - x_center_i) > max_center_dist:
                            continue
                        
                        # Chỉ tính IoU khi khoảng cách tâm đủ gần
                        iou = calculate_iou(boxes[i]['bbox'], boxes[j]['bbox'])
                        
                        if iou > iou_threshold:
                            current_group.append(j)
                            used[j] = True
                            
                    groups.append(current_group)
                    
                return groups
                
            # Sử dụng thuật toán nhóm box được tối ưu
            box_groups = group_boxes_optimized(raw_results, iou_threshold=0.3)
            
            for group in box_groups:
                if len(group) == 1:
                    # Nếu chỉ có một box, thêm trực tiếp
                    box = raw_results[group[0]]
                    results_list.append({
                        'bbox': [int(coord) for coord in box['bbox']],
                        'confidence': round(box['confidence'], 4),
                        'class_id': box['class_id']
                    })
                else:
                    # Nếu có nhiều box trong nhóm
                    group_boxes = [raw_results[i] for i in group]
                    
                    # Luôn sử dụng max_conf để tăng tốc độ xử lý
                    max_conf_box = max(group_boxes, key=lambda x: x['confidence'])
                    
                    # Kiểm tra nhanh: nếu boxes khác nhau đáng kể về kích thước,
                    # thì đây có thể là các thuốc riêng biệt
                    size_diff = False
                    max_area = 0
                    min_area = float('inf')
                    
                    for box in group_boxes:
                        area = (box['bbox'][2] - box['bbox'][0]) * (box['bbox'][3] - box['bbox'][1])
                        max_area = max(max_area, area)
                        min_area = min(min_area, area)
                    
                    # Nếu box lớn nhất > gấp đôi box nhỏ nhất, coi là khác nhau
                    if max_area > min_area * 2 and len(group_boxes) <= 3:
                        for box in group_boxes:
                            results_list.append({
                                'bbox': [int(coord) for coord in box['bbox']],
                                'confidence': round(box['confidence'], 4),
                                'class_id': box['class_id']
                            })
                    else:
                        # Nếu không, chỉ giữ lại box có confidence cao nhất
                        results_list.append({
                            'bbox': [int(coord) for coord in max_conf_box['bbox']],
                            'confidence': round(max_conf_box['confidence'], 4),
                            'class_id': max_conf_box['class_id']
                        })
        
        end_time = time.time()
        elapsed = end_time - start_time
        logger.info(f"YOLO detection completed in {elapsed:.2f} seconds. Found {len(results_list)} boxes.")
        return results_list
    except Exception as e:
        logger.error(f"Exception during YOLO detection: {e}")
        traceback.print_exc()
        return []

def predict_with_knn(features_np, knn_classifier, idx_to_class_map):
    """Dự đoán lớp từ features bằng KNN - phiên bản tối ưu hiệu suất."""
    if features_np is None or knn_classifier is None or idx_to_class_map is None: return None
    try:
        if features_np.shape[0] != 1:
            logger.error(f"Input features có shape không hợp lệ: {features_np.shape}")
            return None
            
        # Cache KNN predictions để tránh dự đoán lặp lại cùng một vector
        # Tạo hash key từ vector feature
        feature_hash = hash(features_np.tobytes())
        
        # Dùng biến static cho cache để tối ưu bộ nhớ
        if not hasattr(predict_with_knn, "cache"):
            predict_with_knn.cache = {}
            
        # Kiểm tra cache
        if feature_hash in predict_with_knn.cache:
            return predict_with_knn.cache[feature_hash]
            
        # Nếu không có trong cache, thực hiện dự đoán
        pred_class_idx = knn_classifier.predict(features_np)[0]
        probabilities = knn_classifier.predict_proba(features_np)[0]
        class_index_in_knn = np.where(knn_classifier.classes_ == pred_class_idx)[0]
        confidence = probabilities[class_index_in_knn[0]] if len(class_index_in_knn) > 0 else 0.0
        
        # Kiểm tra độ tin cậy - nếu dưới 40% thì coi như không có dữ liệu
        if confidence < 0.4:
            result = {
                "medication_name": "Không có dữ liệu về thuốc",
                "medication_id": str(pred_class_idx),
                "confidence": float(confidence)
            }
        else:
            # Lấy tên thuốc từ idx_to_class map
            medication_name_str = idx_to_class_map.get(pred_class_idx)
            
            # Kiểm tra nếu không tìm thấy thuốc trong database
            if medication_name_str is None:
                medication_name_str = "Không có dữ liệu về thuốc"
                
            result = {
                "medication_name": medication_name_str,
                "medication_id": str(pred_class_idx),
                "confidence": float(confidence)
            }
            
        # Lưu vào cache khi kích thước cache chưa quá lớn
        if len(predict_with_knn.cache) < 100:  # Giới hạn kích thước cache
            predict_with_knn.cache[feature_hash] = result
            
        return result
    except Exception as e:
        logger.error(f"Lỗi dự đoán KNN: {e}")
        return None

def draw_detections(image_pil, detections_list):
    """Vẽ kết quả lên ảnh PIL."""
    if image_pil is None or not detections_list: return image_pil
    draw = ImageDraw.Draw(image_pil)
    try: font = ImageFont.truetype("arial.ttf", 20)
    except IOError: font = ImageFont.load_default()

    for detection in detections_list:
        bbox = detection.get("bbox")
        knn_pred = detection.get("knn_prediction", {})
        med_name = knn_pred.get("medication_name", "Không có dữ liệu về thuốc")
        conf = knn_pred.get("confidence", 0.0)

        if bbox:
            x1, y1, x2, y2 = map(int, bbox)
            # Luôn vẽ box ngay cả khi không nhận diện được thuốc
            color = "green" if conf >= 0.5 and med_name != "Không có dữ liệu về thuốc" else "orange"
            draw.rectangle([(x1, y1), (x2, y2)], outline=color, width=3)

            label = f"{med_name} ({conf:.2f})"
            try: text_bbox = draw.textbbox((x1, y1), label, font=font) # Ước lượng kích thước
            except AttributeError: text_bbox = (x1, y1, x1+len(label)*8, y1+15) # Fallback ước lượng thô sơ
            text_w = text_bbox[2] - text_bbox[0]
            text_h = text_bbox[3] - text_bbox[1]

            text_y = y1 - text_h - 5
            if text_y < 0: text_y = y1 + 5 # Vẽ bên dưới nếu không đủ chỗ

            draw.rectangle([(x1, text_y), (x1 + text_w, text_y + text_h)], fill=color)
            draw.text((x1, text_y), label, fill="black", font=font) # Chữ đen dễ đọc hơn
    return image_pil

# --- Tải Mô hình khi Khởi động ---
def load_models():
    global yolo_model, feature_extractor, knn_model, class_to_idx, idx_to_class
    models_loaded = True
    try:
        logger.info("Bắt đầu tải các mô hình...")
        # 1. YOLO
        if not os.path.exists(YOLO_MODEL_PATH):
            logger.error(f"Không tìm thấy model YOLO: {YOLO_MODEL_PATH}")
            models_loaded = False
        else:
            logger.info(f"Tải YOLO model từ {YOLO_MODEL_PATH}")
            yolo_model = YOLO(YOLO_MODEL_PATH)

        # 2. Class Mapping
        if not os.path.exists(CLASS_MAP_PATH):
            logger.error(f"Không tìm thấy class map: {CLASS_MAP_PATH}")
            models_loaded = False
        else:
            logger.info(f"Tải class mapping từ {CLASS_MAP_PATH}")
            class_to_idx, idx_to_class, num_classes = load_class_mapping(CLASS_MAP_PATH)
            if num_classes == 0:
                 logger.warning(f"Class map file rỗng hoặc lỗi. Sử dụng số lớp mặc định.")
                 num_classes = 107 # Hoặc giá trị mặc định của bạn

        # 3. Swin Feature Extractor
        if not os.path.exists(SWIN_MODEL_PATH):
            logger.error(f"Không tìm thấy weights Swin: {SWIN_MODEL_PATH}")
            models_loaded = False
        elif models_loaded: # Chỉ tải Swin nếu class map đã load được num_classes
            logger.info(f"Tải Swin feature extractor từ {SWIN_MODEL_PATH}")
            feature_extractor = get_swin_feature_extractor("swin_b", SWIN_MODEL_PATH, num_classes, device)
            if feature_extractor is None: models_loaded = False

        # 4. KNN Model (Tải hoặc Fit)
        if not os.path.exists(KNN_FEATURES_PATH) or not os.path.exists(KNN_LABELS_PATH):
            logger.error(f"Không tìm thấy file features/labels KNN: {KNN_FEATURES_PATH} / {KNN_LABELS_PATH}")
            models_loaded = False
        elif models_loaded: # Chỉ load/fit KNN nếu các bước trước thành công
            if os.path.exists(KNN_MODEL_PATH):
                logger.info(f"Tải KNN model đã lưu từ {KNN_MODEL_PATH}")
                try:
                    knn_model = joblib.load(KNN_MODEL_PATH)
                    # Kiểm tra K nếu cần (giả sử K=5)
                    if hasattr(knn_model, 'n_neighbors') and knn_model.n_neighbors != 5:
                        logger.warning(f"K của KNN model đã lưu ({knn_model.n_neighbors}) không khớp K=5. Sẽ train lại.")
                        knn_model = None # Buộc train lại
                    elif not hasattr(knn_model, 'predict_proba'):
                        logger.warning(f"KNN model đã lưu không có predict_proba. Sẽ train lại.")
                        knn_model = None # Buộc train lại
                except Exception as e:
                    logger.error(f"Lỗi tải KNN model: {e}. Sẽ train lại.")
                    knn_model = None

            if knn_model is None:
                logger.info(f"Tạo KNN model mới (k=5) từ features và labels...")
                try:
                    train_features = np.load(KNN_FEATURES_PATH)
                    train_labels = np.load(KNN_LABELS_PATH)
                    if train_features.shape[0] != train_labels.shape[0]:
                         raise ValueError("Số lượng features và labels không khớp!")
                    logger.info(f"Đang tạo KNN model mới với metric 'cosine', K=5. Đặc trưng: {train_features.shape}")
                    knn_model = KNeighborsClassifier(n_neighbors=5, n_jobs=-1, metric='cosine')
                    knn_model.fit(train_features, train_labels)
                    logger.info("Fit KNN model thành công. Đang lưu...")
                    joblib.dump(knn_model, KNN_MODEL_PATH)
                except Exception as e:
                    logger.error(f"Lỗi khi tạo/fit/lưu KNN model: {e}")
                    traceback.print_exc()
                    knn_model = None # Đánh dấu là lỗi
                    models_loaded = False

        if models_loaded: logger.info("Tất cả mô hình đã sẵn sàng.")
        else: logger.error("Một hoặc nhiều mô hình không thể tải/tạo.")
        return models_loaded

    except Exception as e:
        logger.error(f"Lỗi nghiêm trọng khi khởi tạo mô hình: {e}")
        traceback.print_exc()
        return False

# --- Khởi động và Tải Mô hình ---
@app.on_event("startup")
async def startup_event():
    if not load_models():
        logger.critical("KHỞI ĐỘNG THẤT BẠI: Không thể tải các mô hình cần thiết.")
        # Có thể thêm logic để dừng ứng dụng hoặc báo lỗi rõ ràng hơn
    else:
        logger.info("Ứng dụng đã khởi động và các mô hình đã được tải.")

# --- Endpoint Chính ---
@app.post("/detect/", response_model=DetectionResult)
async def detect_medication(image: UploadFile = File(...)):
    if yolo_model is None or feature_extractor is None or knn_model is None or idx_to_class is None:
        raise HTTPException(status_code=503, detail="Mô hình chưa sẵn sàng. Vui lòng thử lại sau hoặc kiểm tra logs.")

    request_id = str(uuid.uuid4())
    logger.info(f"Request {request_id}: Nhận ảnh '{image.filename}' (Loại: {image.content_type})")
    temp_file_path = os.path.join(TEMP_DIR, f"{request_id}_{image.filename}")
    result_image_name = f"result_{request_id}.jpg"
    result_image_path = os.path.join(STATIC_DIR, result_image_name)
    processed_pil_image = None # Ảnh đã xử lý EXIF

    try:
        # Lưu ảnh tạm thời
        contents = await image.read()
        with open(temp_file_path, "wb") as f: f.write(contents)
        logger.info(f"Request {request_id}: Đã lưu ảnh tạm thời vào {temp_file_path}")

        # *** XỬ LÝ EXIF ORIENTATION ***
        try:
            img_pil_original = Image.open(temp_file_path)
            logger.info(f"Request {request_id}: Đang kiểm tra và áp dụng EXIF orientation...")
            processed_pil_image = ImageOps.exif_transpose(img_pil_original).convert('RGB')
            logger.info(f"Request {request_id}: Đã xử lý EXIF. Kích thước ảnh: {processed_pil_image.size}")
        except Exception as e_exif:
            logger.error(f"Request {request_id}: Lỗi xử lý EXIF: {e_exif}. Thử mở lại ảnh...")
            # Nếu lỗi EXIF, thử mở lại mà không xử lý EXIF
            try: processed_pil_image = Image.open(temp_file_path).convert('RGB')
            except Exception as e_open:
                 logger.error(f"Request {request_id}: Lỗi mở lại ảnh: {e_open}")
                 raise HTTPException(status_code=400, detail=f"Không thể đọc file ảnh: {e_open}")

        if processed_pil_image is None:
             raise HTTPException(status_code=400, detail="Không thể xử lý ảnh đầu vào.")

        # *** CHẠY YOLO DETECTION TRÊN ẢNH ĐÃ XỬ LÝ EXIF ***
        logger.info(f"Request {request_id}: Bắt đầu YOLO detection...")
        # Chú ý: Truyền đối tượng PIL đã xử lý vào YOLO
        yolo_results = run_yolo_detection(yolo_model, processed_pil_image, 0.25) # Ngưỡng conf của YOLO
        logger.info(f"Request {request_id}: YOLO detection hoàn tất, tìm thấy {len(yolo_results)} box.")

        detections_output = []

        # *** XỬ LÝ TỪNG BOUNDING BOX ***
        for i, result in enumerate(yolo_results):
            bbox = result["bbox"]; yolo_confidence = result["confidence"]
            logger.info(f"Request {request_id}: Xử lý Box {i}...")

            # *** CROP TỪ ẢNH ĐÃ XỬ LÝ EXIF ***
            x1, y1, x2, y2 = map(int, bbox)
            img_w, img_h = processed_pil_image.size
            x1c, y1c, x2c, y2c = max(0, x1), max(0, y1), min(img_w, x2), min(img_h, y2)

            if x1c >= x2c or y1c >= y2c:
                logger.warning(f"Request {request_id}: Box {i} có tọa độ crop không hợp lệ sau khi clamp. Bỏ qua.")
                continue

            try: cropped_img_pil = processed_pil_image.crop((x1c, y1c, x2c, y2c))
            except Exception as e_crop:
                logger.error(f"Request {request_id}: Lỗi crop ảnh cho Box {i}: {e_crop}. Bỏ qua.")
                continue

            if cropped_img_pil.size[0] == 0 or cropped_img_pil.size[1] == 0:
                logger.warning(f"Request {request_id}: Ảnh crop cho Box {i} có kích thước 0. Bỏ qua.")
                continue

            # Trích xuất đặc trưng
            logger.debug(f"Request {request_id}: Trích xuất đặc trưng cho Box {i}...")
            features = extract_features(cropped_img_pil, feature_extractor, device)

            # Dự đoán KNN
            knn_prediction = None
            if features is not None:
                logger.debug(f"Request {request_id}: Dự đoán KNN cho Box {i}...")
                knn_prediction = predict_with_knn(features, knn_model, idx_to_class)
            else:
                logger.warning(f"Request {request_id}: Không thể trích xuất đặc trưng cho Box {i}.")

            # Tạo kết quả cho box này
            detection_data = Detection(
                box_id=i,
                bbox=bbox,
                yolo_confidence=yolo_confidence,
                # Nếu không có dự đoán KNN, cũng hiển thị "Không có dữ liệu về thuốc"
                medication_name=knn_prediction.get('medication_name', "Không có dữ liệu về thuốc") if knn_prediction else "Không có dữ liệu về thuốc",
                medication_id=knn_prediction.get('medication_id', "unknown") if knn_prediction else "unknown",
                confidence=knn_prediction.get('confidence', 0.0) if knn_prediction else 0.0
            )
            detections_output.append(detection_data)
            logger.info(f"Request {request_id}: Box {i} - KNN Pred: {knn_prediction.get('medication_name', 'Không có dữ liệu về thuốc') if knn_prediction else 'Không có dữ liệu về thuốc'}")


        # *** VẼ KẾT QUẢ LÊN ẢNH ĐÃ XỬ LÝ EXIF ***
        logger.info(f"Request {request_id}: Đang vẽ kết quả lên ảnh...")
        # Chuyển đổi sang OpenCV để vẽ (đã xử lý EXIF)
        try:
            img_to_draw_np = np.array(processed_pil_image)
            img_to_draw_cv = cv2.cvtColor(img_to_draw_np, cv2.COLOR_RGB2BGR)
        except Exception as e_cv_conv:
            logger.error(f"Request {request_id}: Lỗi chuyển đổi PIL->CV2 để vẽ: {e_cv_conv}")
            img_to_draw_cv = None # Không vẽ được

        if img_to_draw_cv is not None:
            for detection_obj in detections_output:
                 # Vẽ lên ảnh OpenCV
                 bbox = detection_obj.bbox
                 knn_pred_prob = detection_obj.confidence
                 med_name = detection_obj.medication_name
                 
                 if bbox:
                      x1, y1, x2, y2 = map(int, bbox)
                      # Đổi màu thành màu cam cho viên thuốc không có dữ liệu
                      is_unknown = med_name == "Không có dữ liệu về thuốc"
                      conf_thresh_draw = 0.5 # Ngưỡng để vẽ màu xanh
                      color = (0, 165, 255) if is_unknown else ((0, 255, 0) if knn_pred_prob >= conf_thresh_draw else (0, 165, 255))
                      cv2.rectangle(img_to_draw_cv, (x1, y1), (x2, y2), color, 2)

                      display_name = (med_name[:15] + '..') if len(med_name) > 17 else med_name
                      label = f"{display_name} ({knn_pred_prob:.2f})"
                      font = cv2.FONT_HERSHEY_SIMPLEX; scale = 0.5; thick = 1
                      (tw, th), bl = cv2.getTextSize(label, font, scale, thick)
                      tx = x1; ty = y1 - 10
                      if ty < th + bl: ty = y2 + th + bl
                      bg_y1 = ty - th - bl; bg_y2 = ty + bl; bg_x1 = tx; bg_x2 = tx + tw
                      h_cv, w_cv = img_to_draw_cv.shape[:2]
                      bg_x1=max(0, bg_x1); bg_y1=max(0, bg_y1); bg_x2=min(w_cv, bg_x2); bg_y2=min(h_cv, bg_y2)
                      if bg_x2 > bg_x1 and bg_y2 > bg_y1:
                          cv2.rectangle(img_to_draw_cv, (bg_x1, bg_y1), (bg_x2, bg_y2), color, -1)
                          if bg_x2 < tx + tw: tx = max(0, bg_x2 - tw)
                          cv2.putText(img_to_draw_cv, label, (tx, ty), font, scale, (0, 0, 0), thick, cv2.LINE_AA)

            # Lưu ảnh kết quả (dùng OpenCV)
            logger.info(f"Request {request_id}: Lưu ảnh kết quả vào {result_image_path}")
            try:
                cv2.imwrite(result_image_path, img_to_draw_cv)
            except Exception as e_save:
                 logger.error(f"Request {request_id}: Lỗi lưu ảnh kết quả: {e_save}")
                 # Nếu lỗi lưu, đường dẫn ảnh trả về có thể không hợp lệ
                 result_image_name = "error_saving_image.jpg" # Hoặc trả về lỗi
        else:
             logger.warning(f"Request {request_id}: Không thể vẽ kết quả do lỗi chuyển đổi ảnh.")
             result_image_name = "drawing_error.jpg"

        # Trả về kết quả
        logger.info(f"Request {request_id}: Hoàn tất xử lý.")
        return DetectionResult(
            detections=detections_output,
            image_path=f"/static/{result_image_name}" # Đường dẫn web tới ảnh kết quả
        )

    except HTTPException as http_exc:
        logger.warning(f"Request {request_id}: Lỗi HTTP: {http_exc.status_code} - {http_exc.detail}")
        raise http_exc # Ném lại lỗi HTTP để FastAPI xử lý
    except Exception as e:
        logger.error(f"Request {request_id}: Lỗi xử lý không xác định: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Lỗi máy chủ nội bộ: {str(e)}")
    finally:
        # Luôn xóa file tạm
        if os.path.exists(temp_file_path):
            try: os.remove(temp_file_path); logger.debug(f"Request {request_id}: Đã xóa file tạm {temp_file_path}")
            except Exception as e_del: logger.warning(f"Request {request_id}: Không thể xóa file tạm {temp_file_path}: {e_del}")

# --- Các Endpoint khác ---
@app.get("/", response_class=HTMLResponse)
async def serve_html():
    html_file_path = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(html_file_path):
        with open(html_file_path, "r", encoding="utf-8") as f: html_content = f.read()
        return HTMLResponse(content=html_content)
    else:
        return JSONResponse(status_code=404, content={
            "status": "online",
            "message": "API OK, nhưng file static/index.html không tìm thấy."
        })

@app.get("/health")
async def health_check(): return {"status": "healthy", "models_loaded": yolo_model is not None and feature_extractor is not None and knn_model is not None}

@app.get("/api-info")
async def api_info(): return {"name": "Pill Detection API", "version": "1.0.1", "endpoints": ["/detect/", "/health", "/api-info"]}

# --- Chạy Server ---
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    logger.info(f"Khởi chạy server trên cổng {port}...")
    # Thêm log_level='info' để thấy log của uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=True, log_level="info")
    # Lưu ý: Đổi "main:app" thành "tên_file_cua_ban:app" nếu bạn lưu script với tên khác