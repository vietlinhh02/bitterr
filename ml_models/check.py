# -*- coding: utf-8 -*-
"""
SCRIPT TEST: YOLO + Swin Features + Best Classifier + CAM Proxy Visualization
OUTPUT: Lưu ảnh gốc với bbox/text, ảnh crop gốc, và ảnh heatmap riêng biệt.
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
import joblib
from sklearn.neighbors import KNeighborsClassifier # Chỉ để type hint
import argparse
import csv
from tqdm import tqdm
import logging
import traceback
import gc

# --- Cài đặt thư viện Grad-CAM ---
try:
    from pytorch_grad_cam import GradCAM, HiResCAM, GradCAMPlusPlus, ScoreCAM, LayerCAM
    from pytorch_grad_cam.utils.image import show_cam_on_image, scale_cam_image # scale_cam_image có thể không cần nữa
    from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget
    GRADCAM_AVAILABLE = True
except ImportError:
    print("="*50); print("LỖI: Thư viện 'pytorch-grad-cam' chưa cài đặt."); print("Chạy: pip install grad-cam ttach"); print("="*50)
    GRADCAM_AVAILABLE = False

# --- Logging ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- Configuration & Paths ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_MODEL_NAME = 'swin_b'
DEFAULT_YOLO_MODEL_PATH = os.path.join(BASE_DIR, 'bestz.pt')
DEFAULT_SWIN_WEIGHTS_PATH = os.path.join(BASE_DIR, 'swin_b_pill_classifier_best_downloaded.pth')
DEFAULT_BEST_CLASSIFIER_PATH = os.path.join(BASE_DIR, f'best_classifier_{DEFAULT_MODEL_NAME}.joblib')
DEFAULT_CLASS_MAP_PATH = os.path.join(BASE_DIR, f'class_to_idx_{DEFAULT_MODEL_NAME}.json')
DEFAULT_TEST_IMAGE_DIR = os.path.join(BASE_DIR, 'public_test_images') # <-- THAY ĐỔI
DEFAULT_OUTPUT_CSV = os.path.join(BASE_DIR, f'results_yolo_best_classifier_separate_{DEFAULT_MODEL_NAME}.csv')
# Thư mục output chính
DEFAULT_OUTPUT_DIR = os.path.join(BASE_DIR, f'results_yolo_best_classifier_separate_{DEFAULT_MODEL_NAME}_outputs')
# Các thư mục con bên trong thư mục output chính
DEFAULT_OUTPUT_PRED_IMG_DIR = os.path.join(DEFAULT_OUTPUT_DIR, 'predictions_on_original')
DEFAULT_OUTPUT_CROP_DIR = os.path.join(DEFAULT_OUTPUT_DIR, 'original_crops')
DEFAULT_OUTPUT_HEATMAP_DIR = os.path.join(DEFAULT_OUTPUT_DIR, 'heatmaps')

NUM_CLASSES_ORIGINAL_DEFAULT = 107

# --- Helper Functions ---
# (Giữ nguyên các hàm load_swin_classifier, get_swin_feature_extractor, load_class_mapping,
#  get_inference_transforms, run_yolo_detection, extract_single_feature, predict_with_classifier)
def load_swin_classifier(model_name, weights_path, num_classes, device):
    logger.info(f"Loading Swin Classifier '{model_name}' for CAM...")
    model_fn = None
    if model_name == 'swin_t': model_fn = models.swin_t
    elif model_name == 'swin_s': model_fn = models.swin_s
    elif model_name == 'swin_b': model_fn = models.swin_b
    # ... (thêm swin_v2) ...
    else: raise ValueError(f"Unsupported Swin architecture: {model_name}")
    if not weights_path or not os.path.exists(weights_path): logger.error(f"Weights not found: '{weights_path}'"); return None
    try:
        model = model_fn(weights=None)
        num_ftrs = model.head.in_features
        model.head = nn.Sequential(nn.Dropout(p=0.3), nn.Linear(num_ftrs, num_classes))
        model.load_state_dict(torch.load(weights_path, map_location=device))
        model.to(device); model.eval()
        logger.info(f"Swin Classifier '{model_name}' loaded successfully.")
        return model
    except Exception as e: logger.error(f"Failed to load Swin Classifier: {e}"); traceback.print_exc(); return None

def get_swin_feature_extractor(model_name, weights_path, num_classes_original, device):
    logger.info(f"Loading Swin Feature Extractor '{model_name}'...")
    # ... (Copy code hàm này) ...
    model_fn = None
    if model_name == 'swin_t': model_fn = models.swin_t
    elif model_name == 'swin_s': model_fn = models.swin_s
    elif model_name == 'swin_b': model_fn = models.swin_b
    # ... (thêm swin_v2) ...
    else: raise ValueError(f"Unsupported Swin architecture: {model_name}")
    if not weights_path or not os.path.exists(weights_path): logger.error(f"Weights not found: '{weights_path}'"); return None
    try:
        model_temp = model_fn(weights=None)
        num_ftrs_orig = model_temp.head.in_features
        model_temp.head = nn.Sequential(nn.Dropout(p=0.3), nn.Linear(num_ftrs_orig, num_classes_original))
        model_temp.load_state_dict(torch.load(weights_path, map_location=torch.device('cpu')))
        feature_extractor = model_fn(weights=None)
        feature_extractor.head = nn.Identity()
        feature_extractor.load_state_dict(model_temp.state_dict(), strict=False)
        del model_temp; gc.collect()
        feature_extractor.to(device); feature_extractor.eval()
        logger.info(f"Feature extractor '{model_name}' ready.")
        return feature_extractor
    except Exception as e: logger.error(f"Failed to load feature extractor: {e}"); traceback.print_exc(); return None

def load_class_mapping(json_path):
    logger.info(f"Loading class mapping from: {json_path}")
    if not os.path.exists(json_path): logger.error(f"Class map not found: {json_path}"); return None, None, 0
    try:
        with open(json_path, 'r') as f: class_to_idx = json.load(f)
        idx_to_class = {int(v): k for k, v in class_to_idx.items()}
        num_classes = len(class_to_idx)
        logger.info(f"Loaded mapping for {num_classes} classes.")
        return class_to_idx, idx_to_class, num_classes
    except Exception as e: logger.error(f"Failed to load class map: {e}"); return None, None, 0

def get_inference_transforms(img_size=224):
    mean = [0.485, 0.456, 0.406]; std = [0.229, 0.224, 0.225]
    return transforms.Compose([
        transforms.Resize(int(img_size * 256 / 224)), transforms.CenterCrop(img_size),
        transforms.ToTensor(), transforms.Normalize(mean, std)])

def run_yolo_detection(yolo_model, image_input, confidence_threshold):
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
    if image_pil_crop is None or model is None: return None
    try:
        if image_pil_crop.mode != 'RGB': image_pil_crop = image_pil_crop.convert('RGB')
        input_tensor = transform(image_pil_crop).unsqueeze(0).to(device)
        with torch.no_grad():
            features = model(input_tensor)
        return features.cpu().numpy()
    except Exception as e: logger.error(f"Feature extraction error for crop: {e}"); return None

def predict_with_classifier(classifier_model, features_np):
    if features_np is None or classifier_model is None: return None, None
    try:
        if features_np.shape[0] != 1: return None, None
        pred_idx = classifier_model.predict(features_np)[0]
        pred_conf = 0.0
        if hasattr(classifier_model, "predict_proba"):
            probabilities = classifier_model.predict_proba(features_np)[0]
            try:
                classes_list = classifier_model.classes_.tolist() if isinstance(classifier_model.classes_, np.ndarray) else classifier_model.classes_
                class_index_in_model = classes_list.index(pred_idx)
                pred_conf = probabilities[class_index_in_model]
            except (ValueError, IndexError): pred_conf = 0.0
        return int(pred_idx), float(pred_conf)
    except Exception as e: logger.error(f"Classifier prediction error: {e}"); traceback.print_exc(); return None, None

# --- Main Execution ---
if __name__ == "__main__":
    if not GRADCAM_AVAILABLE: logger.error("pytorch-grad-cam not installed."); sys.exit(1)

    parser = argparse.ArgumentParser(description="YOLO + Swin Features + Best Classifier + Separate CAM Viz")
    parser.add_argument('--image-dir', type=str, default=DEFAULT_TEST_IMAGE_DIR)
    parser.add_argument('--yolo-model', type=str, default=DEFAULT_YOLO_MODEL_PATH)
    parser.add_argument('--yolo-conf', type=float, default=0.25)
    parser.add_argument('--swin-weights-path', type=str, default=DEFAULT_SWIN_WEIGHTS_PATH)
    parser.add_argument('--swin-model-name', type=str, default=DEFAULT_MODEL_NAME)
    parser.add_argument('--classifier-model-path', type=str, default=DEFAULT_BEST_CLASSIFIER_PATH)
    parser.add_argument('--class-map-path', type=str, default=DEFAULT_CLASS_MAP_PATH)
    parser.add_argument('--output-csv', type=str, default=DEFAULT_OUTPUT_CSV)
    parser.add_argument('--draw-output', action='store_true', help="Save images: original with preds, crops, and heatmaps.")
    parser.add_argument('--output-dir', type=str, default=DEFAULT_OUTPUT_DIR, help="Main directory for saving all outputs.")
    parser.add_argument('--device', type=str, default='auto')
    parser.add_argument('--classifier-conf-threshold', type=float, default=0.0)
    parser.add_argument('--target-layer-index', type=int, default=-2)
    parser.add_argument('--cam-method', type=str, default='LayerCAM', choices=['GradCAM', 'HiResCAM', 'GradCAMPlusPlus', 'ScoreCAM', 'LayerCAM'])
    parser.add_argument('--cam-target', type=str, default='swin_pred', choices=['swin_pred', 'classifier_pred'],
                        help="Generate CAM based on Swin's top prediction or the final classifier's prediction.")


    args = parser.parse_args()

    # --- Tạo các thư mục output con ---
    output_pred_img_dir = os.path.join(args.output_dir, 'predictions_on_original')
    output_crop_dir = os.path.join(args.output_dir, 'original_crops')
    output_heatmap_dir = os.path.join(args.output_dir, 'heatmaps')
    if args.draw_output:
        os.makedirs(output_pred_img_dir, exist_ok=True)
        os.makedirs(output_crop_dir, exist_ok=True)
        os.makedirs(output_heatmap_dir, exist_ok=True)

    # Setup Device
    if args.device == 'auto': device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    else: device = torch.device(args.device)
    logger.info(f"Using device: {device}")

    # Load Class Map
    class_to_idx, idx_to_class, num_classes = load_class_mapping(args.class_map_path)
    if idx_to_class is None: sys.exit(1)
    if num_classes == 0: num_classes = NUM_CLASSES_ORIGINAL_DEFAULT; logger.warning(f"Using default num_classes: {num_classes}")

    # Load YOLO
    if not os.path.exists(args.yolo_model): logger.error(f"YOLO model not found: {args.yolo_model}"); sys.exit(1)
    try: yolo_model = YOLO(args.yolo_model); logger.info("YOLO model loaded.")
    except Exception as e: logger.error(f"Failed to load YOLO: {e}"); sys.exit(1)

    # Load Swin Feature Extractor
    feature_extractor = get_swin_feature_extractor(args.swin_model_name, args.swin_weights_path, num_classes, device)
    if feature_extractor is None: sys.exit(1)

    # Load Swin Classifier (Đầy đủ) - Dùng cho CAM
    swin_classifier_full = load_swin_classifier(args.swin_model_name, args.swin_weights_path, num_classes, device)
    if swin_classifier_full is None: sys.exit(1)

    # Load Best Classifier (KNN/SVM/MLP)
    if not os.path.exists(args.classifier_model_path): logger.error(f"Best classifier model not found: {args.classifier_model_path}"); sys.exit(1)
    try: best_classifier = joblib.load(args.classifier_model_path); logger.info(f"Loaded best classifier ({type(best_classifier).__name__}).")
    except Exception as e: logger.error(f"Failed to load best classifier: {e}"); sys.exit(1)

    # --- Xác định Target Layer cho CAM ---
    try:
        if hasattr(swin_classifier_full, 'features') and isinstance(swin_classifier_full.features, nn.Sequential):
             target_layers = [swin_classifier_full.features[args.target_layer_index]]
             logger.info(f"Using CAM target layer: model.features[{args.target_layer_index}]")
        # ... (Thêm các trường hợp khác) ...
        else: logger.warning("Using entire Swin classifier as CAM target layer."); target_layers = [swin_classifier_full]
        if not isinstance(target_layers[0], nn.Module): raise TypeError("Not valid nn.Module")
    except Exception as e_layer: logger.error(f"Error selecting CAM target layer: {e_layer}"); target_layers = [swin_classifier_full]

    # --- Chuẩn bị CAM ---
    cam_generator = None
    if args.draw_output and GRADCAM_AVAILABLE:
        cam_algorithm = None
        if args.cam_method == 'GradCAM': cam_algorithm = GradCAM
        elif args.cam_method == 'LayerCAM': cam_algorithm = LayerCAM
        # ... (Thêm các lựa chọn CAM khác) ...
        else: logger.warning(f"Unsupported CAM method: {args.cam_method}. Using LayerCAM."); cam_algorithm = LayerCAM
        try:
            # Dùng model Swin ĐẦY ĐỦ để tạo CAM
            cam_generator = cam_algorithm(model=swin_classifier_full, target_layers=target_layers)
            logger.info(f"Initialized CAM generator ({args.cam_method}).")
        except Exception as e_cam_init: logger.error(f"Failed to initialize CAM: {e_cam_init}"); cam_generator = None

    # Prepare output
    if not os.path.isdir(args.image_dir): logger.error(f"Test image directory not found: {args.image_dir}"); sys.exit(1)
    results_list = []
    inference_transform = get_inference_transforms()

    # Process images
    image_files = [f for f in os.listdir(args.image_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.webp'))]
    logger.info(f"Found {len(image_files)} images in {args.image_dir}")
    total_start_time = time.time()

    for filename in tqdm(image_files, desc="Processing Images"):
        image_path = os.path.join(args.image_dir, filename)
        img_basename = os.path.splitext(filename)[0] # Lấy tên file không có đuôi

        try:
            img_pil_original = Image.open(image_path)
            img_pil_corrected = ImageOps.exif_transpose(img_pil_original).convert('RGB')
            yolo_detections = run_yolo_detection(yolo_model, img_pil_corrected, args.yolo_conf)

            img_to_draw_predictions = None # Ảnh gốc để vẽ bbox/text
            if args.draw_output:
                 try: img_np = np.array(img_pil_corrected); img_to_draw_predictions = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
                 except Exception as e_cv: logger.error(f"Error converting PIL->CV2 for {filename}: {e_cv}"); img_to_draw_predictions = None

            if not yolo_detections:
                 results_list.append({'image_filename': filename, 'box_id': -1, 'bbox': None, 'yolo_confidence': None,
                                      'predicted_class_id': None, 'predicted_class_name': 'NO_DETECTION', 'classifier_confidence': None,
                                      'cam_target_idx': None}) # Thêm cột mới
                 continue

            img_results_for_drawing = []

            for i, det in enumerate(yolo_detections):
                bbox = det['bbox']; yolo_conf = det['confidence']
                x1, y1, x2, y2 = map(int, bbox)
                img_w, img_h = img_pil_corrected.size
                x1c, y1c, x2c, y2c = max(0, x1), max(0, y1), min(img_w, x2), min(img_h, y2)
                if x1c >= x2c or y1c >= y2c: continue

                cropped_pil = None
                try: cropped_pil = img_pil_corrected.crop((x1c, y1c, x2c, y2c))
                except Exception as e_crop: logger.warning(f"Crop failed {filename}, box {i}: {e_crop}"); continue
                if cropped_pil.size[0] == 0 or cropped_pil.size[1] == 0: continue

                # 1. Extract features
                features_np = extract_single_feature(feature_extractor, cropped_pil, inference_transform, device)

                # 2. Predict with Best Classifier
                pred_idx, pred_conf = predict_with_classifier(best_classifier, features_np)
                pred_class_name = idx_to_class.get(pred_idx, f"UnknownIdx:{pred_idx}") if pred_idx is not None else "N/A"

                # 3. Generate CAM (nếu cần vẽ)
                cam_target_idx_used = None # Index lớp dùng để tạo CAM
                if args.draw_output and cam_generator is not None:
                    try:
                        input_tensor_crop = inference_transform(cropped_pil).unsqueeze(0).to(device)
                        cam_target_idx_for_viz = None

                        if args.cam_target == 'classifier_pred' and pred_idx is not None:
                             cam_target_idx_for_viz = pred_idx # Dùng dự đoán của best classifier làm target CAM
                             logger.debug(f"Box {i}: Using Best Classifier pred ({pred_idx}) as CAM target.")
                        else: # Mặc định hoặc nếu classifier_pred lỗi, dùng Swin pred
                             with torch.no_grad():
                                 output_swin = swin_classifier_full(input_tensor_crop)
                                 cam_target_idx_for_viz = torch.argmax(output_swin, dim=1).item()
                             logger.debug(f"Box {i}: Using Swin top pred ({cam_target_idx_for_viz}) as CAM target.")

                        if cam_target_idx_for_viz is not None:
                            cam_target_idx_used = cam_target_idx_for_viz # Lưu lại index đã dùng
                            targets_cam = [ClassifierOutputTarget(cam_target_idx_for_viz)]
                            grayscale_cam = cam_generator(input_tensor=input_tensor_crop, targets=targets_cam,
                                                          aug_smooth=True, eigen_smooth=True)
                            if grayscale_cam is not None:
                                grayscale_cam = grayscale_cam[0, :]
                                # --- LƯU ẢNH CROP GỐC ---
                                crop_filename = f"{img_basename}_box{i}_crop.jpg"
                                crop_path = os.path.join(output_crop_dir, crop_filename)
                                try: cropped_pil.save(crop_path); logger.debug(f"  Saved crop: {crop_path}")
                                except Exception as e_save_c: logger.warning(f"  Failed saving crop {crop_path}: {e_save_c}")

                                # --- TẠO VÀ LƯU HEATMAP RIÊNG ---
                                heatmap_colored = cv2.applyColorMap(np.uint8(255 * grayscale_cam), cv2.COLORMAP_VIRIDIS)
                                heatmap_resized = cv2.resize(heatmap_colored, (x2c - x1c, y2c - y1c)) # Resize về kích thước crop
                                heatmap_filename = f"{img_basename}_box{i}_heatmap_target_{cam_target_idx_used}.jpg"
                                heatmap_path = os.path.join(output_heatmap_dir, heatmap_filename)
                                try: cv2.imwrite(heatmap_path, heatmap_resized); logger.debug(f"  Saved heatmap: {heatmap_path}")
                                except Exception as e_save_h: logger.warning(f"  Failed saving heatmap {heatmap_path}: {e_save_h}")
                            else: logger.warning(f"CAM generation returned None for box {i}")
                        else: logger.warning(f"Could not determine CAM target index for box {i}")

                    except Exception as e_cam: logger.error(f"Error generating CAM for box {i}: {e_cam}")

                # 4. Store result
                result_data = {
                    'image_filename': filename, 'box_id': i, 'bbox': bbox,
                    'yolo_confidence': round(yolo_conf, 5),
                    'predicted_class_id': pred_idx,
                    'predicted_class_name': pred_class_name,
                    'classifier_confidence': round(pred_conf, 5) if pred_conf is not None else None,
                    'cam_target_idx': cam_target_idx_used # Lưu index lớp dùng cho CAM
                }
                results_list.append(result_data)
                # Chỉ lưu để vẽ nếu dự đoán thành công và đạt ngưỡng
                if pred_idx is not None and pred_conf is not None and pred_conf >= args.classifier_conf_threshold:
                     img_results_for_drawing.append(result_data)

            # --- VẼ BBOX VÀ TEXT LÊN ẢNH GỐC LỚN ---
            if args.draw_output and img_to_draw_predictions is not None:
                for res in img_results_for_drawing:
                    bbox = res['bbox']; pred_name = res['predicted_class_name']; pred_conf = res['classifier_confidence']
                    if bbox and pred_name != "N/A" and pred_conf is not None:
                        x1d, y1d, x2d, y2d = map(int, bbox)
                        color = (0, 255, 0) # Green
                        cv2.rectangle(img_to_draw_predictions, (x1d, y1d), (x2d, y2d), color, 2)
                        display_name = (pred_name[:15] + '..') if len(pred_name) > 17 else pred_name
                        label = f"B{res['box_id']}:{display_name}({pred_conf:.2f})"
                        font=cv2.FONT_HERSHEY_SIMPLEX; scale=0.5; thick=1
                        (tw,th),bl = cv2.getTextSize(label,font,scale,thick)
                        tx=x1d; ty=y1d-10
                        if ty<th+bl: ty=y2d+th+bl
                        bg_y1=ty-th-bl; bg_y2=ty+bl; bg_x1=tx; bg_x2=tx+tw
                        h_cv,w_cv=img_to_draw_predictions.shape[:2]
                        bg_x1=max(0,bg_x1);bg_y1=max(0,bg_y1);bg_x2=min(w_cv,bg_x2);bg_y2=min(h_cv,bg_y2)
                        if bg_x2>bg_x1 and bg_y2>bg_y1:
                            cv2.rectangle(img_to_draw_predictions,(bg_x1,bg_y1),(bg_x2,bg_y2),color,-1)
                            if bg_x2<tx+tw: tx=max(0,bg_x2-tw)
                            cv2.putText(img_to_draw_predictions,label,(tx,ty),font,scale,(0,0,0),thick,cv2.LINE_AA)

                # Lưu ảnh gốc đã vẽ bbox/text
                pred_img_path = os.path.join(output_pred_img_dir, f"{img_basename}_predictions.jpg")
                try: cv2.imwrite(pred_img_path, img_to_draw_predictions)
                except Exception as e_save_pred: logger.error(f"Failed to save prediction image {pred_img_path}: {e_save_pred}")

        except Exception as e_img:
            logger.error(f"Failed to process image {image_path}: {e_img}")
            traceback.print_exc()
            results_list.append({'image_filename': filename, 'box_id': -2, 'bbox': None, 'yolo_confidence': None,
                                 'predicted_class_id': None, 'predicted_class_name': 'PROCESSING_ERROR', 'classifier_confidence': None,
                                 'cam_target_idx': None})
        finally:
             # Dọn dẹp
             if 'img_pil_original' in locals(): del img_pil_original
             if 'img_pil_corrected' in locals(): del img_pil_corrected
             if 'img_to_draw_predictions' in locals(): del img_to_draw_predictions
             if 'cropped_pil' in locals(): del cropped_pil
             if 'features_np' in locals(): del features_np
             if 'input_tensor_crop' in locals(): del input_tensor_crop
             if 'cam_grayscale' in locals(): del cam_grayscale
             gc.collect()
             if device.type == 'cuda': torch.cuda.empty_cache()

    total_end_time = time.time()
    logger.info(f"Finished processing all images in {total_end_time - total_start_time:.2f} seconds.")

    # Save results to CSV
    if results_list:
        try:
            abs_csv_path = os.path.abspath(args.output_csv)
            output_dir_csv = os.path.dirname(abs_csv_path)
            if output_dir_csv: os.makedirs(output_dir_csv, exist_ok=True)
            logger.info(f"Saving {len(results_list)} results to: {abs_csv_path}")
            with open(abs_csv_path, 'w', newline='', encoding='utf-8') as csvfile:
                fieldnames = ['image_filename', 'box_id', 'bbox', 'yolo_confidence',
                              'predicted_class_id', 'predicted_class_name', 'classifier_confidence',
                              'cam_target_idx'] # Thêm cột cam_target_idx
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames, extrasaction='ignore')
                writer.writeheader()
                writer.writerows(results_list)
            logger.info("CSV results saved successfully.")
        except Exception as e_csv: logger.error(f"Failed to save results to CSV at {abs_csv_path}: {e_csv}"); traceback.print_exc()
    else: logger.warning("No results generated to save.")

    logger.info(f"--- YOLO + Swin Features + Best Classifier + CAM Proxy Test Complete ---")
    logger.info(f"Outputs saved in directory: {args.output_dir}")