#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script để đánh giá mô hình Swin + KNN trên Google Colab
Script này sẽ:
1. Kết nối với Google Drive
2. Tải models và dataset từ Drive
3. Giải nén các file nếu cần
4. Chạy đánh giá và hiển thị kết quả
"""

# Thêm các thư viện cần thiết
import os
import sys
import time
import zipfile
import torch
import torch.nn as nn
import numpy as np
import cv2
import json
from PIL import Image, ImageOps
from torchvision import models, transforms
import joblib
import argparse
from tqdm import tqdm
import logging
import traceback
import gc
from sklearn.metrics import classification_report, confusion_matrix
import pandas as pd
from collections import defaultdict
import matplotlib.pyplot as plt
import seaborn as sns
from google.colab import drive
import shutil

# --- Thiết lập logging ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# --- Thiết lập mặc định ---
WORKDIR = '/content/ml_models'
DRIVE_MODEL_PATH = '/content/drive/MyDrive/ml_models'  # Đường dẫn đến thư mục models trên Drive
DRIVE_DATASET_PATH = '/content/drive/MyDrive/dataset'  # Đường dẫn đến thư mục dataset trên Drive

# Tên các file cần thiết
MODEL_ZIP = 'models.zip'  # Tên file zip chứa các model
DATASET_ZIP = 'dataset.zip'  # Tên file zip chứa dataset

# Đường dẫn local sau khi giải nén
LOCAL_MODEL_DIR = os.path.join(WORKDIR, 'models')
LOCAL_DATASET_DIR = os.path.join(WORKDIR, 'dataset')

# Đường dẫn cụ thể đến các file model
SWIN_MODEL_PATH = os.path.join(LOCAL_MODEL_DIR, "swin_b_pill_classifier_best_downloaded.pth")
KNN_MODEL_PATH = os.path.join(LOCAL_MODEL_DIR, "knn_model_swin_b_k5_cosine.joblib")
CLASS_MAP_PATH = os.path.join(LOCAL_MODEL_DIR, "class_to_idx_swin_b.json")

# --- Các hàm tiện ích cho Colab ---
def mount_drive():
    """Kết nối Google Drive."""
    logger.info("Đang kết nối Google Drive...")
    try:
        drive.mount('/content/drive')
        logger.info("Đã kết nối Google Drive thành công.")
        return True
    except Exception as e:
        logger.error(f"Lỗi khi kết nối Google Drive: {e}")
        return False

def setup_working_directory():
    """Tạo thư mục làm việc."""
    logger.info(f"Tạo thư mục làm việc tại {WORKDIR}")
    os.makedirs(WORKDIR, exist_ok=True)
    os.makedirs(os.path.join(WORKDIR, 'evaluation_results'), exist_ok=True)

def download_and_extract(drive_path, local_path, file_name, extract=True):
    """Tải file từ Drive và giải nén nếu cần."""
    drive_file_path = os.path.join(drive_path, file_name)
    local_file_path = os.path.join(WORKDIR, file_name)
    
    if not os.path.exists(drive_file_path):
        logger.error(f"Không tìm thấy file {drive_file_path} trên Google Drive.")
        return False
    
    logger.info(f"Đang sao chép {file_name} từ Drive...")
    try:
        shutil.copy2(drive_file_path, local_file_path)
        logger.info(f"Đã sao chép {file_name} thành công.")
        
        if extract and file_name.endswith('.zip'):
            logger.info(f"Đang giải nén {file_name}...")
            with zipfile.ZipFile(local_file_path, 'r') as zip_ref:
                zip_ref.extractall(local_path)
            logger.info(f"Đã giải nén {file_name} thành công.")
            
        return True
    except Exception as e:
        logger.error(f"Lỗi khi tải và giải nén {file_name}: {e}")
        return False

# --- Các hàm copy từ evaluate_model.py ---
def get_swin_feature_extractor(model_name, weights_path, num_classes_original, device):
    """Tải Swin, bỏ head, load weights ĐÃ TRAIN."""
    logger.info(f"Đang tải Swin Feature Extractor '{model_name}'...")
    model_fn = None
    if model_name == 'swin_t': model_fn = models.swin_t
    elif model_name == 'swin_s': model_fn = models.swin_s
    elif model_name == 'swin_b': model_fn = models.swin_b
    elif model_name == 'swin_v2_t': model_fn = models.swin_v2_t
    elif model_name == 'swin_v2_s': model_fn = models.swin_v2_s
    elif model_name == 'swin_v2_b': model_fn = models.swin_v2_b
    else: raise ValueError(f"Kiến trúc Swin không được hỗ trợ: {model_name}")

    if not weights_path or not os.path.exists(weights_path):
        logger.error(f"Không tìm thấy file weights đã train: '{weights_path}'")
        return None
    
    logger.info(f"Đang tải weights từ {weights_path}...")
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
        logger.info(f"Feature extractor '{model_name}' đã sẵn sàng trên {device}.")
        return feature_extractor
    except Exception as e:
        logger.error(f"Lỗi khi tải feature extractor: {e}")
        traceback.print_exc()
        return None

def load_class_mapping(json_path):
    """Tải class map và tạo map ngược."""
    logger.info(f"Đang tải class mapping từ: {json_path}")
    if not os.path.exists(json_path):
        logger.error(f"Không tìm thấy file class map: {json_path}")
        return None, None, 0
    
    try:
        with open(json_path, 'r') as f:
            class_to_idx = json.load(f)
        # idx_to_class: map từ index (int) sang class_id (string)
        idx_to_class = {int(v): k for k, v in class_to_idx.items()}
        num_classes = len(class_to_idx)
        logger.info(f"Đã tải mapping cho {num_classes} lớp.")
        return class_to_idx, idx_to_class, num_classes
    except Exception as e:
        logger.error(f"Lỗi khi tải class map: {e}")
        return None, None, 0

def load_folder_to_class_mapping(mapping_path):
    """Tải ánh xạ từ số thư mục sang class ID."""
    logger.info(f"Đang tải ánh xạ folder-to-class từ: {mapping_path}")
    try:
        with open(mapping_path, 'r') as f:
            folder_to_class = json.load(f)
        logger.info(f"Đã tải ánh xạ folder-to-class thành công.")
        return folder_to_class
    except Exception as e:
        logger.error(f"Lỗi khi tải ánh xạ folder-to-class: {e}")
        logger.info("Sẽ sử dụng tên thư mục làm class ID.")
        return None

def get_validation_transforms(img_size=224):
    """Tạo transforms cho validation/inference."""
    mean = [0.485, 0.456, 0.406]
    std = [0.229, 0.224, 0.225]
    return transforms.Compose([
        transforms.Resize(int(img_size * 256 / 224)),
        transforms.CenterCrop(img_size),
        transforms.ToTensor(),
        transforms.Normalize(mean, std)
    ])

def extract_features(image_pil, feature_extractor_model, device_, transform):
    """Trích xuất đặc trưng từ ảnh PIL."""
    if image_pil is None or feature_extractor_model is None:
        return None
    
    try:
        # Đảm bảo ảnh là RGB
        if image_pil.mode != 'RGB':
            image_pil = image_pil.convert('RGB')
        
        image_tensor = transform(image_pil).unsqueeze(0).to(device_)
        with torch.no_grad():
            features = feature_extractor_model(image_tensor)
        
        return features.cpu().numpy()
    except Exception as e:
        logger.error(f"Lỗi trích xuất đặc trưng: {e}")
        # traceback.print_exc()  # Bỏ comment để debug chi tiết
        return None

def predict_with_knn(features_np, knn_classifier, idx_to_class_map):
    """Dự đoán lớp từ features bằng KNN."""
    if features_np is None or knn_classifier is None or idx_to_class_map is None:
        return None
    
    try:
        if features_np.shape[0] != 1:
            logger.error(f"Input features có shape không hợp lệ: {features_np.shape}")
            return None
        
        pred_class_idx = knn_classifier.predict(features_np)[0]
        probabilities = knn_classifier.predict_proba(features_np)[0]
        class_index_in_knn = np.where(knn_classifier.classes_ == pred_class_idx)[0]
        confidence = probabilities[class_index_in_knn[0]] if len(class_index_in_knn) > 0 else 0.0
        
        # Kiểm tra độ tin cậy - nếu dưới 40% thì coi như không có dữ liệu
        if confidence < 0.4:
            return {
                "medication_name": "Không có dữ liệu về thuốc",
                "medication_id": str(pred_class_idx),
                "confidence": float(confidence)
            }
        
        # Lấy tên từ map ngược (idx_to_class map từ int index sang string id)
        medication_name_str = idx_to_class_map.get(pred_class_idx)
        
        # Kiểm tra nếu không tìm thấy thuốc trong database
        if medication_name_str is None:
            medication_name_str = "Không có dữ liệu về thuốc"
        
        return {
            "medication_name": medication_name_str,  # Tên/ID dạng string
            "medication_id": str(pred_class_idx),    # Index dạng string
            "confidence": float(confidence)
        }
    except Exception as e:
        logger.error(f"Lỗi dự đoán KNN: {e}")
        # traceback.print_exc()  # Bỏ comment để debug chi tiết
        return None

def process_image(image_path, feature_extractor, transform, knn_model, idx_to_class):
    """Xử lý một ảnh đầu vào và trả về kết quả dự đoán."""
    try:
        # Tải và xử lý ảnh
        img_pil = Image.open(image_path)
        # Xử lý EXIF orientation (nếu có)
        img_pil_corrected = ImageOps.exif_transpose(img_pil).convert('RGB')
        
        # Trích xuất đặc trưng
        features = extract_features(img_pil_corrected, feature_extractor, device, transform)
        
        # Dự đoán với KNN
        if features is not None:
            prediction = predict_with_knn(features, knn_model, idx_to_class)
            return prediction
        else:
            logger.warning(f"Không thể trích xuất đặc trưng cho ảnh: {image_path}")
            return None
    except Exception as e:
        logger.error(f"Lỗi xử lý ảnh {image_path}: {e}")
        return None

def evaluate_dataset(data_dir, feature_extractor, transform, knn_model, idx_to_class, folder_to_class=None):
    """Đánh giá mô hình trên toàn bộ dataset."""
    if not os.path.exists(data_dir):
        logger.error(f"Không tìm thấy thư mục dữ liệu: {data_dir}")
        return None
    
    # Khởi tạo biến để theo dõi kết quả
    true_labels = []
    pred_labels = []
    confidences = []
    filenames = []
    
    # Thống kê theo loại thuốc
    class_stats = defaultdict(lambda: {'total': 0, 'correct': 0, 'avg_conf': 0.0})
    
    # Tổng số ảnh đã xử lý
    total_processed = 0
    total_correct = 0
    
    # Lặp qua cấu trúc thư mục
    for folder_name in sorted(os.listdir(data_dir)):
        folder_path = os.path.join(data_dir, folder_name)
        if not os.path.isdir(folder_path):
            continue
        
        # Lấy true class ID từ ánh xạ hoặc dùng folder_name nếu không có ánh xạ
        if folder_to_class and folder_name in folder_to_class:
            true_class_id = folder_to_class[folder_name]
        else:
            true_class_id = folder_name
        
        # Đếm tổng số ảnh trong class này
        class_total = 0
        class_correct = 0
        class_conf_sum = 0.0
        
        # Xử lý ảnh trong thư mục
        image_files = [f for f in os.listdir(folder_path) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
        
        for img_file in tqdm(image_files, desc=f"Đang xử lý thư mục {folder_name}", leave=False):
            img_path = os.path.join(folder_path, img_file)
            
            # Dự đoán
            prediction = process_image(img_path, feature_extractor, transform, knn_model, idx_to_class)
            total_processed += 1
            class_total += 1
            
            if prediction:
                pred_class_id = prediction['medication_name']
                confidence = prediction['confidence']
                
                # Lưu kết quả
                true_labels.append(true_class_id)
                pred_labels.append(pred_class_id)
                confidences.append(confidence)
                filenames.append(img_path)
                
                # Cập nhật thống kê
                class_conf_sum += confidence
                
                if pred_class_id == true_class_id:
                    total_correct += 1
                    class_correct += 1
        
        # Cập nhật thống kê class
        if class_total > 0:
            class_stats[true_class_id]['total'] = class_total
            class_stats[true_class_id]['correct'] = class_correct
            class_stats[true_class_id]['avg_conf'] = class_conf_sum / class_total
    
    # Kiểm tra nếu không có ảnh nào được xử lý
    if total_processed == 0:
        logger.error("Không có ảnh nào được xử lý. Kiểm tra lại thư mục dữ liệu.")
        return None
        
    # Tính độ chính xác tổng thể
    overall_accuracy = total_correct / total_processed if total_processed > 0 else 0
    
    # Tạo báo cáo chi tiết
    results = {
        'overall_accuracy': overall_accuracy,
        'total_processed': total_processed,
        'total_correct': total_correct,
        'class_stats': class_stats,
        'true_labels': true_labels,
        'pred_labels': pred_labels,
        'confidences': confidences,
        'filenames': filenames
    }
    
    return results

def save_results_to_csv(results, output_path='evaluation_results.csv'):
    """Lưu kết quả chi tiết vào file CSV."""
    data = {
        'filename': results['filenames'],
        'true_label': results['true_labels'],
        'pred_label': results['pred_labels'],
        'confidence': results['confidences'],
        'is_correct': [t == p for t, p in zip(results['true_labels'], results['pred_labels'])]
    }
    
    df = pd.DataFrame(data)
    df.to_csv(output_path, index=False)
    logger.info(f"Đã lưu kết quả chi tiết vào {output_path}")
    
    return df

def plot_confusion_matrix(results, output_path='confusion_matrix.png'):
    """Vẽ ma trận nhầm lẫn và lưu vào file."""
    # Lấy các lớp duy nhất
    classes = sorted(list(set(results['true_labels'] + results['pred_labels'])))
    
    # Nếu có quá nhiều lớp, có thể sẽ khó hiển thị
    if len(classes) > 50:
        logger.warning(f"Có {len(classes)} lớp, ma trận nhầm lẫn có thể khó đọc.")
    
    # Tạo ma trận nhầm lẫn
    cm = confusion_matrix(results['true_labels'], results['pred_labels'], labels=classes)
    
    # Vẽ ma trận với kích thước phù hợp
    plt.figure(figsize=(min(30, len(classes)), min(25, len(classes))))
    plt_heatmap = sns.heatmap(cm, annot=(len(classes) < 30), fmt='d', cmap='Blues', 
                              xticklabels=classes, yticklabels=classes)
    plt.title('Ma trận nhầm lẫn')
    plt.xlabel('Dự đoán')
    plt.ylabel('Thực tế')
    
    # Điều chỉnh nhãn trục để dễ đọc hơn
    if len(classes) > 10:
        plt.xticks(rotation=90)
        plt.yticks(rotation=0)
    
    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    logger.info(f"Đã lưu ma trận nhầm lẫn vào {output_path}")

def print_class_report(results):
    """In báo cáo chi tiết theo từng loại thuốc."""
    class_stats = results['class_stats']
    
    print("\n=== BÁO CÁO ĐÁNH GIÁ TỪNG LOẠI THUỐC ===")
    print(f"{'ID Thuốc':<20} {'Số ảnh':<10} {'Đúng':<10} {'Độ chính xác':<15} {'Độ tin cậy TB':<15}")
    print("-" * 75)
    
    # Sắp xếp theo độ chính xác giảm dần
    try:
        sorted_classes = sorted(
            class_stats.items(),
            key=lambda x: x[1]['correct'] / x[1]['total'] if x[1]['total'] > 0 else 0,
            reverse=True
        )
        
        for class_id, stats in sorted_classes:
            try:
                # Chuyển đổi tất cả giá trị sang kiểu dữ liệu phù hợp để tránh lỗi
                class_id_str = str(class_id)
                total = int(stats.get('total', 0))
                correct = int(stats.get('correct', 0))
                accuracy = float(correct) / float(total) if total > 0 else 0.0
                avg_conf = float(stats.get('avg_conf', 0.0))
                
                # In với xử lý an toàn
                print(f"{class_id_str[:20]:<20} {total:<10} {correct:<10} {accuracy:.2%:<15} {avg_conf:.4f}")
            except Exception as e:
                print(f"Lỗi khi in thống kê cho class {class_id}: {e}")
                print(f"{str(class_id)[:20]:<20} {'N/A':<10} {'N/A':<10} {'N/A':<15} {'N/A':<15}")
    except Exception as e:
        print(f"Lỗi khi sắp xếp và hiển thị báo cáo: {e}")
        print("Chi tiết thống kê thô:")
        for class_id, stats in class_stats.items():
            print(f"{str(class_id)}: {stats}")
    
    print("\n=== TỔNG KẾT ===")
    try:
        total_processed = int(results.get('total_processed', 0))
        total_correct = int(results.get('total_correct', 0))
        overall_accuracy = float(total_correct) / float(total_processed) if total_processed > 0 else 0.0
        
        print(f"Tổng số ảnh: {total_processed}")
        print(f"Tổng số dự đoán đúng: {total_correct}")
        print(f"Độ chính xác tổng thể: {overall_accuracy:.2%}")
    except Exception as e:
        print(f"Lỗi khi hiển thị tổng kết: {e}")
        print(f"Raw data: total_processed={results.get('total_processed')}, total_correct={results.get('total_correct')}")

# --- Hàm chính để thực hiện đánh giá ---
def run_evaluation():
    """Hàm chính thực hiện toàn bộ quy trình đánh giá."""
    # 1. Thiết lập device
    global device
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logger.info(f"Sử dụng thiết bị: {device}")
    
    # 2. Tải class mapping
    class_to_idx, idx_to_class, num_classes = load_class_mapping(CLASS_MAP_PATH)
    if idx_to_class is None:
        logger.error("Không thể tải class mapping. Dừng đánh giá.")
        return
    
    # 3. Tải folder-to-class mapping nếu có
    folder_to_class = None
    folder_map_path = os.path.join(LOCAL_MODEL_DIR, "folder_to_class.json")
    if os.path.exists(folder_map_path):
        folder_to_class = load_folder_to_class_mapping(folder_map_path)
    
    # 4. Tải Swin feature extractor
    feature_extractor = get_swin_feature_extractor("swin_b", SWIN_MODEL_PATH, num_classes, device)
    if feature_extractor is None:
        logger.error("Không thể tải Swin feature extractor. Dừng đánh giá.")
        return
    
    # 5. Tải KNN model
    logger.info(f"Đang tải KNN model từ {KNN_MODEL_PATH}")
    try:
        knn_model = joblib.load(KNN_MODEL_PATH)
    except Exception as e:
        logger.error(f"Lỗi khi tải KNN model: {e}")
        return
    
    # 6. Tạo transform
    transform = get_validation_transforms()
    
    # 7. Bắt đầu đánh giá
    logger.info(f"Bắt đầu đánh giá trên tập dữ liệu: {LOCAL_DATASET_DIR}")
    start_time = time.time()
    
    results = evaluate_dataset(LOCAL_DATASET_DIR, feature_extractor, transform, knn_model, idx_to_class, folder_to_class)
    if results is None:
        logger.error("Đánh giá thất bại. Vui lòng kiểm tra logs để biết thêm chi tiết.")
        return
    
    end_time = time.time()
    logger.info(f"Đánh giá hoàn thành trong {end_time - start_time:.2f} giây")
    
    # 8. In báo cáo kết quả
    print_class_report(results)
    
    # 9. Lưu kết quả chi tiết và biểu đồ
    output_dir = os.path.join(WORKDIR, 'evaluation_results')
    os.makedirs(output_dir, exist_ok=True)
    
    # Lưu kết quả chi tiết vào CSV
    csv_path = os.path.join(output_dir, 'evaluation_results.csv')
    df_results = save_results_to_csv(results, csv_path)
    
    # Vẽ ma trận nhầm lẫn
    cm_path = os.path.join(output_dir, 'confusion_matrix.png')
    plot_confusion_matrix(results, cm_path)
    
    # Lưu thống kê theo class
    class_stats_df = pd.DataFrame([
        {
            'class_id': class_id,
            'total_images': stats['total'],
            'correct': stats['correct'],
            'accuracy': stats['correct'] / stats['total'] if stats['total'] > 0 else 0,
            'avg_confidence': stats['avg_conf']
        }
        for class_id, stats in results['class_stats'].items()
    ])
    
    class_stats_df = class_stats_df.sort_values('accuracy', ascending=False)
    class_stats_path = os.path.join(output_dir, 'class_stats.csv')
    class_stats_df.to_csv(class_stats_path, index=False)
    logger.info(f"Đã lưu thống kê theo class vào {class_stats_path}")
    
    # 10. Lưu biểu đồ độ chính xác theo loại thuốc
    try:
        plt.figure(figsize=(15, 8))
        top_df = class_stats_df.sort_values('accuracy', ascending=False).head(20)
        sns.barplot(data=top_df, x='class_id', y='accuracy')
        plt.title('Top 20 loại thuốc có độ chính xác cao nhất')
        plt.xticks(rotation=90)
        plt.tight_layout()
        plt.savefig(os.path.join(output_dir, 'top_accuracy.png'), dpi=300)
        logger.info(f"Đã lưu biểu đồ top accuracy vào {output_dir}/top_accuracy.png")
    except Exception as e:
        logger.error(f"Lỗi khi tạo biểu đồ top accuracy: {e}")
    
    # 11. Lưu biểu đồ phân phối độ tin cậy
    try:
        plt.figure(figsize=(10, 6))
        sns.histplot(results['confidences'], bins=20)
        plt.title('Phân phối độ tin cậy')
        plt.xlabel('Độ tin cậy')
        plt.ylabel('Số lượng dự đoán')
        plt.tight_layout()
        plt.savefig(os.path.join(output_dir, 'confidence_distribution.png'), dpi=300)
        logger.info(f"Đã lưu biểu đồ phân phối độ tin cậy vào {output_dir}/confidence_distribution.png")
    except Exception as e:
        logger.error(f"Lỗi khi tạo biểu đồ phân phối độ tin cậy: {e}")
    
    logger.info(f"Tất cả kết quả đã được lưu vào thư mục: {output_dir}")
    
    # Tạo link để tải xuống kết quả
    try:
        from google.colab import files
        print("\nNhấp vào các link dưới đây để tải kết quả về máy tính của bạn:")
        print(f"1. Kết quả chi tiết: {csv_path}")
        print(f"2. Ma trận nhầm lẫn: {cm_path}")
        print(f"3. Thống kê theo class: {class_stats_path}")
    except:
        print("\nKết quả đã được lưu vào Google Drive của bạn.")

def main():
    """Hàm chính chạy toàn bộ quy trình."""
    # Kết nối Google Drive
    if not mount_drive():
        print("Không thể kết nối Google Drive. Vui lòng chạy lại notebook và cấp quyền truy cập.")
        return
    
    # Tạo thư mục làm việc
    setup_working_directory()
    
    # Tải và giải nén các file model
    model_downloaded = download_and_extract(DRIVE_MODEL_PATH, LOCAL_MODEL_DIR, MODEL_ZIP)
    if not model_downloaded:
        print(f"Không thể tải mô hình từ {DRIVE_MODEL_PATH}/{MODEL_ZIP}. Vui lòng kiểm tra lại đường dẫn.")
        return
    
    # Tải và giải nén dataset
    dataset_downloaded = download_and_extract(DRIVE_DATASET_PATH, LOCAL_DATASET_DIR, DATASET_ZIP)
    if not dataset_downloaded:
        print(f"Không thể tải dataset từ {DRIVE_DATASET_PATH}/{DATASET_ZIP}. Vui lòng kiểm tra lại đường dẫn.")
        return
    
    # Chạy đánh giá
    run_evaluation()

if __name__ == "__main__":
    main() 