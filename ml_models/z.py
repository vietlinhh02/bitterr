# -*- coding: utf-8 -*-
"""
SCRIPT INFERENCE: YOLO Detection + Swin Feature Extraction + KNN Classification

1. Tải mô hình YOLO.
2. Tải mô hình Swin Transformer (đã train, bỏ head) làm feature extractor.
3. Tải dữ liệu features và labels đã tính toán trước (.npy).
4. Tải/Huấn luyện (fit) mô hình KNN từ dữ liệu features/labels.
5. Tải bản đồ lớp (class map).
6. Chạy YOLO trên ảnh test để lấy bounding box.
7. Với mỗi box:
    a. Crop ảnh.
    b. Trích xuất đặc trưng bằng Swin feature extractor.
    c. Dự đoán lớp bằng KNN.
8. (Tùy chọn) Vẽ kết quả lên ảnh.
"""

# --- Imports ---
import os
import torch
import torchvision.transforms as transforms
import torchvision.models as models
import torch.nn as nn
from PIL import Image, ImageDraw, ImageFont, ExifTags, ImageOps # Thêm ExifTags, ImageOps
import json
import argparse
import sys
import time
import cv2
import numpy as np
from ultralytics import YOLO
from sklearn.neighbors import KNeighborsClassifier # KNN
import joblib # Để tải KNN model
import gc
import traceback

# --- Configuration ---
# Mặc định - sẽ được ghi đè bởi args
DEFAULT_MODEL_NAME = 'swin_b' # PHẢI khớp với model đã dùng để tạo features
DEFAULT_FEATURE_EXTRACTOR_WEIGHTS_PATH = f"/kaggle/working/{DEFAULT_MODEL_NAME}_pill_classifier_best_downloaded.pth" # File weights Swin ĐÃ TRAIN
DEFAULT_KNN_FEATURES_PATH = f"/kaggle/working/knn_features_{DEFAULT_MODEL_NAME}.npy" # File features đã lưu
DEFAULT_KNN_LABELS_PATH = f"/kaggle/working/knn_labels_{DEFAULT_MODEL_NAME}.npy"   # File labels đã lưu
DEFAULT_KNN_MODEL_PATH_TEMPLATE = "/kaggle/working/knn_model_{model_name}_k{k}.joblib" # Template đường dẫn model KNN
DEFAULT_CLASS_MAP_PATH = f"/kaggle/working/class_to_idx_{DEFAULT_MODEL_NAME}.json" # File class map đã lưu
DEFAULT_YOLO_MODEL_PATH = 'bestz.pt' # Path to your YOLO model (ví dụ)
DEFAULT_IMAGE_PATH = 'test_image.jpg'
DEFAULT_KNN_K = 5 # Số neighbors cho KNN

# --- Helper Functions ---

# Hàm tải Swin Feature Extractor (Giống script prepare_knn_data)
def get_swin_feature_extractor(model_name, weights_path, num_classes_original, device):
    """Tải Swin, bỏ head, load weights ĐÃ TRAIN."""
    print(f"INFO: Creating Swin Feature Extractor '{model_name}'...")
    model_fn = None
    if model_name == 'swin_t': model_fn = models.swin_t
    elif model_name == 'swin_s': model_fn = models.swin_s
    elif model_name == 'swin_b': model_fn = models.swin_b
    elif model_name == 'swin_v2_t': model_fn = models.swin_v2_t
    elif model_name == 'swin_v2_s': model_fn = models.swin_v2_s
    elif model_name == 'swin_v2_b': model_fn = models.swin_v2_b
    else: raise ValueError(f"Unsupported Swin architecture: {model_name}")

    if not weights_path or not os.path.exists(weights_path):
        print(f"ERROR: Trained weights file not found at '{weights_path}' for feature extractor. Cannot proceed.")
        return None
    print(f"INFO: Loading trained weights from {weights_path} to build feature extractor...")
    try:
        # Load vào model tạm với cấu trúc GỐC
        model_temp = model_fn(weights=None)
        num_ftrs_orig = model_temp.head.in_features
        # Tái tạo cấu trúc head gốc (PHẢI GIỐNG LÚC TRAIN)
        model_temp.head = nn.Sequential(
             nn.Dropout(p=0.3), # Giả sử dropout là 0.3 lúc train
             nn.Linear(num_ftrs_orig, num_classes_original)
        )
        model_temp.load_state_dict(torch.load(weights_path, map_location=torch.device('cpu'))) # Load vào CPU trước

        # Tạo feature extractor sạch và bỏ head
        feature_extractor = model_fn(weights=None)
        feature_extractor.head = nn.Identity()

        # Copy weights, bỏ qua head
        feature_extractor.load_state_dict(model_temp.state_dict(), strict=False)
        del model_temp; gc.collect()
        feature_extractor.to(device); feature_extractor.eval()
        print(f"INFO: Feature extractor '{model_name}' ready on {device}.")
        return feature_extractor
    except Exception as e:
        print(f"ERROR: Failed to load weights or prepare feature extractor: {e}")
        traceback.print_exc(); return None

# Hàm tải Class Mapping (Giống script prepare_knn_data)
def load_class_mapping(json_path):
    """Tải ánh xạ class_to_idx và tạo idx_to_class."""
    print(f"INFO: Loading class mapping from: {json_path}")
    if not os.path.exists(json_path):
        print(f"ERROR: Class mapping file not found at {json_path}")
        return None, None, 0 # Trả về giá trị lỗi
    try:
        with open(json_path, 'r') as f: class_to_idx = json.load(f)
        idx_to_class = {v: k for k, v in class_to_idx.items()} # Tạo map ngược
        num_classes = len(class_to_idx)
        print(f"INFO: Loaded mapping for {num_classes} classes.")
        return class_to_idx, idx_to_class, num_classes
    except Exception as e:
        print(f"ERROR: Failed to load/process class mapping file: {e}")
        return None, None, 0

# Hàm lấy Transforms (Giống script prepare_knn_data)
def get_validation_transforms(img_size=224):
    """Lấy validation transforms (dùng cho cả feature extraction và inference)."""
    imagenet_mean = [0.485, 0.456, 0.406]; imagenet_std = [0.229, 0.224, 0.225]
    return transforms.Compose([
        transforms.Resize(int(img_size * 256 / 224)), transforms.CenterCrop(img_size),
        transforms.ToTensor(), transforms.Normalize(imagenet_mean, imagenet_std)
    ])

# Hàm chạy YOLO (Giống script test_swin_with_yolo, chấp nhận PIL object)
def run_yolo_detection(yolo_model, image_input, confidence_threshold):
    """Runs YOLO detection on an image path or PIL image object."""
    results_list = []
    if yolo_model is None: print("ERROR: YOLO model not loaded."); return results_list
    input_type = "path" if isinstance(image_input, str) else "PIL object"
    print(f"INFO: Running YOLO detection on {input_type} (conf_thresh={confidence_threshold})...")
    start_time = time.time()
    try:
        predictions = yolo_model.predict(source=image_input, conf=confidence_threshold, verbose=False)
        if predictions and len(predictions) > 0:
            boxes = predictions[0].boxes
            if boxes is not None and len(boxes) > 0:
                for box in boxes:
                    bbox_coords_int = box.xyxy[0].cpu().numpy().astype(int)
                    confidence = float(box.conf[0].cpu().numpy())
                    class_id = int(box.cls[0].cpu().numpy()) if box.cls is not None else -1
                    results_list.append({'bbox': bbox_coords_int.tolist(),'confidence': round(confidence, 4),'class_id': class_id})
        end_time = time.time(); elapsed = end_time - start_time
        print(f"INFO: YOLO detection completed in {elapsed:.2f} seconds. Found {len(results_list)} boxes.")
        return results_list
    except Exception as e: print(f"ERROR: Exception during YOLO detection: {e}"); traceback.print_exc(); return []

# --- Main Execution ---
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Detect with YOLO, extract features with Swin, classify with KNN using pre-computed data.")
    # Image Input
    parser.add_argument('--image-path', type=str, default=DEFAULT_IMAGE_PATH)
    # YOLO Args
    parser.add_argument('--yolo-model', type=str, default=DEFAULT_YOLO_MODEL_PATH)
    parser.add_argument('--yolo-conf', type=float, default=0.25)
    # Swin Feature Extractor Args
    parser.add_argument('--feature-extractor-weights-path', type=str, default=DEFAULT_FEATURE_EXTRACTOR_WEIGHTS_PATH,
                        help="Path to Swin model weights (.pth) used for feature extraction.")
    parser.add_argument('--feature-extractor-model-name', type=str, default=DEFAULT_MODEL_NAME,
                        choices=['swin_t', 'swin_s', 'swin_b', 'swin_v2_t', 'swin_v2_s', 'swin_v2_b'])
    # KNN Args (Paths to pre-computed data)
    parser.add_argument('--k', type=int, default=DEFAULT_KNN_K, help="Number of neighbors (K) for KNN.")
    parser.add_argument('--knn-features-path', type=str, default=DEFAULT_KNN_FEATURES_PATH)
    parser.add_argument('--knn-labels-path', type=str, default=DEFAULT_KNN_LABELS_PATH)
    parser.add_argument('--knn-model-path', type=str, default=None, # Sẽ tự tạo đường dẫn dựa trên template và K
                        help="Path to the pre-trained/saved KNN model (.joblib). If None, tries to load default or retrains.")
    parser.add_argument('--force-retrain-knn', action='store_true',
                        help="Force retraining of the KNN model even if a saved model exists.")
    # Class Map Path
    parser.add_argument('--class-map-path', type=str, default=DEFAULT_CLASS_MAP_PATH)
    # Other Args
    parser.add_argument('--device', type=str, default='auto', choices=['cuda', 'cpu', 'auto'])
    parser.add_argument('--draw-output', action='store_true')
    parser.add_argument('--output-dir', type=str, default='results_knn_inference')
    parser.add_argument('--classifier-conf', type=float, default=0.5, # Ngưỡng tin cậy cho KNN prediction (dựa trên predict_proba)
                         help="Minimum probability for KNN prediction to be considered confident.")

    args = parser.parse_args()

    # --- Tạo đường dẫn file model KNN dựa trên K ---
    if args.knn_model_path is None:
         args.knn_model_path = DEFAULT_KNN_MODEL_PATH_TEMPLATE.format(model_name=args.feature_extractor_model_name, k=args.k)
         print(f"INFO: Using default KNN model path: {args.knn_model_path}")

    # --- Setup Device ---
    if args.device == 'auto': device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    else: device = torch.device(args.device)
    print(f"INFO: Using device: {device}")

    # --- Load Class Mapping ---
    class_to_idx, idx_to_class, num_classes_original = load_class_mapping(args.class_map_path)
    if idx_to_class is None: sys.exit(1) # Cần idx_to_class để diễn giải kết quả KNN

    # --- Load Swin Feature Extractor ---
    # Cần số lớp gốc để load state dict đúng
    feature_extractor = get_swin_feature_extractor(args.feature_extractor_model_name,
                                                  args.feature_extractor_weights_path,
                                                  num_classes_original, # Số lớp gốc của model đã train
                                                  device)
    if feature_extractor is None: sys.exit(1)

    # --- Load Pre-computed KNN Training Data ---
    print(f"INFO: Loading pre-computed KNN features from: {args.knn_features_path}")
    if not os.path.exists(args.knn_features_path):
        print(f"ERROR: KNN features file not found: {args.knn_features_path}"); sys.exit(1)
    try: train_features = np.load(args.knn_features_path)
    except Exception as e: print(f"ERROR: Failed to load KNN features: {e}"); sys.exit(1)

    print(f"INFO: Loading pre-computed KNN labels from: {args.knn_labels_path}")
    if not os.path.exists(args.knn_labels_path):
        print(f"ERROR: KNN labels file not found: {args.knn_labels_path}"); sys.exit(1)
    try: train_labels = np.load(args.knn_labels_path)
    except Exception as e: print(f"ERROR: Failed to load KNN labels: {e}"); sys.exit(1)

    print(f"INFO: Loaded {train_features.shape[0]} training samples for KNN.")
    if train_features.shape[0] != train_labels.shape[0]:
         print("ERROR: Mismatch between number of features and labels loaded for KNN."); sys.exit(1)

    # --- Load or Train KNN Classifier ---
    knn_classifier = None
    knn_model_load_path = args.knn_model_path # Dùng đường dẫn đã xác định (có thể là default hoặc user-set)

    # Ưu tiên tải model KNN đã lưu nếu tồn tại và không ép buộc train lại
    if not args.force_retrain_knn and os.path.exists(knn_model_load_path):
        print(f"INFO: Loading pre-trained KNN model (k={args.k}) from {knn_model_load_path}")
        try:
            knn_classifier = joblib.load(knn_model_load_path)
            # Kiểm tra K của model đã tải
            if hasattr(knn_classifier, 'n_neighbors') and knn_classifier.n_neighbors != args.k:
                 print(f"WARNING: Loaded KNN model has k={knn_classifier.n_neighbors}, but requested k={args.k}. Retraining...")
                 knn_classifier = None # Ép train lại nếu K không khớp
            elif not hasattr(knn_classifier, 'predict_proba'):
                 print(f"WARNING: Loaded KNN model doesn't support predict_proba. Retraining...")
                 knn_classifier = None # Ép train lại nếu không hỗ trợ predict_proba
            else:
                 print(f"INFO: Pre-trained KNN model (k={args.k}) loaded successfully.")
        except Exception as e:
            print(f"ERROR: Failed to load KNN model: {e}. Retraining...")
            knn_classifier = None

    # Nếu không tải được hoặc bị ép train lại
    if knn_classifier is None:
        print(f"INFO: Training KNN classifier with k={args.k}...")
        start_knn_train = time.time()
        knn_classifier = KNeighborsClassifier(n_neighbors=args.k, n_jobs=-1, metric='cosine') # Thử dùng cosine distance
        # knn_classifier = KNeighborsClassifier(n_neighbors=args.k, n_jobs=-1) # Hoặc Euclidean mặc định
        knn_classifier.fit(train_features, train_labels)
        end_knn_train = time.time()
        print(f"INFO: KNN training ('fit') completed in {end_knn_train - start_knn_train:.2f} seconds.")
        # Lưu model KNN mới train
        knn_model_save_path = args.knn_model_path
        print(f"INFO: Saving trained KNN model (k={args.k}) to {knn_model_save_path}")
        try: os.makedirs(os.path.dirname(knn_model_save_path), exist_ok=True); joblib.dump(knn_classifier, knn_model_save_path)
        except Exception as e: print(f"ERROR: Failed to save KNN model: {e}")

    # --- Load YOLO Model ---
    yolo_model = None
    if not os.path.exists(args.yolo_model): print(f"ERROR: YOLO model file not found: {args.yolo_model}"); sys.exit(1)
    try: yolo_model = YOLO(args.yolo_model); print(f"INFO: YOLO model loaded from {args.yolo_model}")
    except Exception as e: print(f"ERROR: Failed to load YOLO model: {e}"); sys.exit(1)

    # --- Load Input Image & Apply EXIF Correction ---
    if not os.path.exists(args.image_path): print(f"ERROR: Input image not found: {args.image_path}"); sys.exit(1)
    try:
        print(f"INFO: Loading image: {args.image_path}")
        img = Image.open(args.image_path)
        print("INFO: Checking/Applying EXIF orientation...")
        original_pil_image = ImageOps.exif_transpose(img).convert('RGB')
        print(f"INFO: Image loaded & orientation corrected. Size: {original_pil_image.size}")
    except Exception as e: print(f"ERROR: Failed to load/correct image: {e}"); traceback.print_exc(); sys.exit(1)

    # --- Run YOLO Detection on Corrected Image ---
    print(f"INFO: Starting YOLO detection on corrected image data...")
    detected_boxes = run_yolo_detection(yolo_model, original_pil_image, args.yolo_conf)
    if not detected_boxes: print("INFO: No objects detected by YOLO. Exiting."); sys.exit(0)

    # --- Prepare for Drawing ---
    output_image_cv2 = None
    if args.draw_output:
        try:
            img_np = np.array(original_pil_image); output_image_cv2 = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
            if output_image_cv2 is None: raise ValueError("OpenCV conversion failed")
            print("INFO: Prepared OpenCV image for drawing.")
        except Exception as e: print(f"ERROR: Failed to convert PIL to OpenCV: {e}"); args.draw_output = False

    # --- Process Each Detected Box ---
    print("\n--- Classifying Detected Objects using KNN (k={}) ---".format(args.k))
    results = []
    feature_extractor.eval() # Đảm bảo model ở eval mode
    knn_transform = get_validation_transforms() # Lấy transform để xử lý crop

    for i, detection in enumerate(detected_boxes):
        bbox = detection['bbox']; yolo_conf = detection['confidence']
        x1, y1, x2, y2 = bbox
        print(f"\nProcessing Box {i} (YOLO Conf: {yolo_conf:.3f}, Coords: {bbox})...")

        # 1. Crop Image from Corrected PIL Image
        try:
            img_w, img_h = original_pil_image.size; x1_c, y1_c, x2_c, y2_c = max(0, x1), max(0, y1), min(img_w, x2), min(img_h, y2)
            if x1_c >= x2_c or y1_c >= y2_c: print(f"  WARN: Invalid crop coords. Skipping."); continue
            cropped_pil = original_pil_image.crop((x1_c, y1_c, x2_c, y2_c))
            if cropped_pil.size[0] == 0 or cropped_pil.size[1] == 0: print(f"  WARN: Crop has zero dim. Skipping."); continue
        except Exception as e: print(f"  ERROR: Failed to crop: {e}. Skipping."); continue

        # 2. Preprocess Crop & Extract Features
        features_np = None
        try:
             if cropped_pil.mode != 'RGB': cropped_pil = cropped_pil.convert('RGB')
             input_tensor = knn_transform(cropped_pil).unsqueeze(0).to(device)
             with torch.no_grad(): features_tensor = feature_extractor(input_tensor)
             features_np = features_tensor.cpu().numpy()
        except Exception as e: print(f"  ERROR: Failed feature extraction: {e}. Skipping."); continue

        # 3. KNN Prediction
        knn_pred_label_idx = -1; knn_pred_proba = 0.0; knn_pred_class_str = "N/A"
        try:
            if features_np is not None and features_np.shape[0] == 1:
                 knn_pred_label_idx = knn_classifier.predict(features_np)[0]
                 probabilities = knn_classifier.predict_proba(features_np)[0]
                 # Tìm index của lớp dự đoán trong danh sách classes_ của KNN
                 class_index_in_knn = np.where(knn_classifier.classes_ == knn_pred_label_idx)[0]
                 if len(class_index_in_knn) > 0:
                      knn_pred_proba = probabilities[class_index_in_knn[0]]
                 else:
                      print("  WARN: Predicted class not found in knn_classifier.classes_?") # Trường hợp lạ
                      knn_pred_proba = 0.0 # Gán xác suất 0 nếu không tìm thấy

                 knn_pred_class_str = idx_to_class.get(knn_pred_label_idx, f"UnknownIdx:{knn_pred_label_idx}")
                 print(f"  KNN Prediction: Class='{knn_pred_class_str}' (Idx={knn_pred_label_idx}), Prob={knn_pred_proba:.4f}")
            else: print("  ERROR: Invalid feature vector shape for KNN.")
        except Exception as e: print(f"  ERROR: Failed KNN prediction: {e}")

        # 4. Store results
        results.append({'box_id': i, 'yolo_bbox': bbox, 'yolo_confidence': yolo_conf,
                        'knn_prediction': {'class_idx': knn_pred_label_idx, 'class_id_str': knn_pred_class_str,
                                           'probability': round(knn_pred_proba, 5)}})
        # 5. Draw on Output Image
        if args.draw_output and output_image_cv2 is not None and knn_pred_label_idx != -1:
            is_confident = knn_pred_proba >= args.classifier_conf
            if is_confident or args.classifier_conf == 0.0:
                 display_class_str = (knn_pred_class_str[:15] + '..') if len(knn_pred_class_str) > 17 else knn_pred_class_str
                 label = f"B{i}: {display_class_str} ({knn_pred_proba:.2f})"
                 color = (0, 255, 0) if is_confident else (0, 165, 255)
                 x1d, y1d, x2d, y2d = map(int, bbox) # Int coords for drawing
                 cv2.rectangle(output_image_cv2, (x1d, y1d), (x2d, y2d), color, 2)
                 font = cv2.FONT_HERSHEY_SIMPLEX; font_scale = 0.5; thickness = 1
                 (tw, th), bl = cv2.getTextSize(label, font, font_scale, thickness)
                 # Adjust text position carefully
                 tx = x1d; ty = y1d - 10
                 if ty < th + bl: ty = y2d + th + bl # Draw below if too close to top
                 bg_y1 = ty - th - bl; bg_y2 = ty + bl
                 bg_x1 = tx; bg_x2 = tx + tw
                 # Clip background rectangle to image bounds
                 img_h_cv, img_w_cv = output_image_cv2.shape[:2]
                 bg_x1 = max(0, bg_x1); bg_y1 = max(0, bg_y1)
                 bg_x2 = min(img_w_cv, bg_x2); bg_y2 = min(img_h_cv, bg_y2)
                 if bg_x2 > bg_x1 and bg_y2 > bg_y1: # Only draw if valid rect
                      cv2.rectangle(output_image_cv2, (bg_x1, bg_y1), (bg_x2, bg_y2), color, -1)
                      # Adjust text position if background was clipped horizontally
                      if bg_x2 < tx + tw: tx = max(0, bg_x2 - tw)
                      cv2.putText(output_image_cv2, label, (tx, ty), font, font_scale, (0, 0, 0), thickness, cv2.LINE_AA)

    # --- Final Output ---
    print("\n--- Combined Results Summary (YOLO + Swin Features + KNN) ---")
    for res in results:
        print(f"\nBox {res['box_id']}: YOLO Conf={res['yolo_confidence']:.4f}, BBox={res['yolo_bbox']}")
        knn_res = res['knn_prediction']
        if knn_res['class_idx'] != -1:
             is_confident = knn_res['probability'] >= args.classifier_conf
             print(f"  KNN Pred: Class='{knn_res['class_id_str']}', Prob={knn_res['probability']:.4f} {'(Confident)' if is_confident else '(Low Confidence)'}")
        else: print("  KNN Prediction: Failed")

    # Save drawn image
    if args.draw_output and output_image_cv2 is not None:
        os.makedirs(args.output_dir, exist_ok=True)
        base_filename = os.path.basename(args.image_path); name, ext = os.path.splitext(base_filename)
        output_filename = f"{name}_knn_k{args.k}_pred{ext}"
        output_path = os.path.join(args.output_dir, output_filename)
        try: cv2.imwrite(output_path, output_image_cv2); print(f"\nINFO: Output image saved to: {output_path}")
        except Exception as e: print(f"\nERROR: Failed to save output image: {e}")

    print("\n--- Inference Complete ---")