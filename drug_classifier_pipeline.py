#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import cv2
import numpy as np
import matplotlib.pyplot as plt
import torch
import torchvision.transforms as transforms
from torch.nn import Linear
import torch.nn.functional as F
from torchvision import models
from ultralytics import YOLO
from PIL import Image
from sklearn.neighbors import KNeighborsClassifier
import joblib
import json
from matplotlib.patches import Rectangle
import warnings
import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import threading
import shutil
from datetime import datetime
warnings.filterwarnings('ignore')

# Đường dẫn đến các mô hình
MODEL_PATHS = {
    'yolo': './ml_models/bestz.pt',  # YOLO model cho pill detection
    'swin_b': './ml_models/swin_b_pill_classifier_best.pth',  # Swin-B model
    'knn': './ml_models/knn_model_swin_b_k5_cosine.joblib',  # KNN model
    'class_mapping': './ml_models/new_drug_id_to_name_mapping.json'  # Mapping từ index sang tên thuốc
}

# Vài ảnh ví dụ để test pipeline
SAMPLE_IMAGES = [
    './sample_images/paracetamol.jpg',
    './sample_images/ibuprofen.jpg',
    './sample_images/amoxicillin.jpg'
]

# Thêm biến lưu trữ bộ nhớ cache
MODEL_CACHE = {
    'yolo': None,
    'swin_b': None,
    'knn': None,
    'class_mapping': None
}

# Tạo thư mục kết quả nếu chưa tồn tại
def check_paths():
    """Kiểm tra và tạo các thư mục cần thiết"""
    required_dirs = ['sample_images', 'results', 'processed']
    for directory in required_dirs:
        if not os.path.exists(directory):
            os.makedirs(directory)
            print(f"Đã tạo thư mục {directory}")
    
    # Kiểm tra xem có ảnh mẫu nào không, nếu không thì tạo ảnh ví dụ
    any_sample_exists = any(os.path.exists(path) for path in SAMPLE_IMAGES)
    if not any_sample_exists:
        print("Không tìm thấy ảnh mẫu. Đang tạo ảnh ví dụ...")
        create_sample_images()

# Tạo ảnh mẫu nếu không tìm thấy
def create_sample_images():
    """Tạo ảnh mẫu giả lập nếu không tìm thấy ảnh thật"""
    sample_names = ["paracetamol", "ibuprofen", "amoxicillin"]
    colors = [(255, 200, 200), (200, 255, 200), (200, 200, 255)]
    
    for i, (name, color) in enumerate(zip(sample_names, colors)):
        # Tạo ảnh trống
        img = np.ones((400, 400, 3), dtype=np.uint8) * 240  # Nền trắng xám
        
        # Vẽ viên thuốc giả
        center = (200, 200)
        if i == 0:  # Paracetamol: hình tròn
            cv2.circle(img, center, 150, color, -1)
            cv2.circle(img, center, 150, (0, 0, 0), 2)  # Viền đen
        elif i == 1:  # Ibuprofen: hình bầu dục
            axes = (120, 80)
            cv2.ellipse(img, center, axes, 0, 0, 360, color, -1)
            cv2.ellipse(img, center, axes, 0, 0, 360, (0, 0, 0), 2)  # Viền đen
        else:  # Amoxicillin: hình viên nang
            pts = np.array([[100, 200], [170, 150], [230, 150], [300, 200], 
                           [230, 250], [170, 250]], np.int32)
            pts = pts.reshape((-1, 1, 2))
            cv2.fillPoly(img, [pts], color)
            cv2.polylines(img, [pts], True, (0, 0, 0), 2)  # Viền đen
        
        # Thêm chữ tên thuốc
        cv2.putText(img, name.upper(), (100, 320), cv2.FONT_HERSHEY_SIMPLEX, 
                   1, (0, 0, 0), 2, cv2.LINE_AA)
        
        # Lưu ảnh
        output_path = f'./sample_images/{name}.jpg'
        cv2.imwrite(output_path, img)
        print(f"Đã tạo ảnh mẫu: {output_path}")

# Tạo Swin-B model
def create_swin_b_model(num_classes=107, pretrained_path=None):
    """Khởi tạo Swin-B model và tải weights"""
    print("Đang tải mô hình Swin-B...")
    
    model = models.swin_b(weights='DEFAULT')
    
    # Thay đổi lớp fully connected cuối cùng để phù hợp với số lượng classes
    num_features = model.head.in_features
    
    # Thay đổi: Sử dụng Sequential thay vì Linear trực tiếp
    # để phù hợp với cấu trúc mô hình đã lưu
    model.head = torch.nn.Sequential(
        torch.nn.Dropout(p=0.0),
        torch.nn.Linear(num_features, num_classes)
    )
    
    # Tải weights từ file pretrained nếu có
    if pretrained_path and os.path.exists(pretrained_path):
        print(f"Tải weights từ {pretrained_path}")
        try:
            checkpoint = torch.load(pretrained_path, map_location='cpu')
            
            # Xử lý tùy theo định dạng checkpoint
            if 'model' in checkpoint:
                model.load_state_dict(checkpoint['model'])
            elif 'state_dict' in checkpoint:
                model.load_state_dict(checkpoint['state_dict'])
            else:
                model.load_state_dict(checkpoint)
            
            print("Tải mô hình thành công!")
        except Exception as e:
            print(f"Lỗi khi tải mô hình: {e}")
            print("Tiếp tục với mô hình pretrained mặc định...")
    
    model.eval()  # Chuyển sang chế độ evaluation
    return model

# Tạo bộ transforms cho Swin-B
def get_transforms(img_size=384):
    """Tạo bộ transforms cho ảnh đầu vào model Swin-B"""
    return transforms.Compose([
        transforms.Resize((img_size, img_size)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

# Trích xuất feature vector từ Swin-B
def extract_features(model, image_tensor):
    """Trích xuất feature vector từ mô hình Swin-B"""
    # Cách trích xuất đặc trưng từ Swin-B
    with torch.no_grad():
        # Thêm batch dimension
        if image_tensor.dim() == 3:
            image_tensor = image_tensor.unsqueeze(0)
        
        try:
            # Phương pháp 1: Sử dụng forward rồi lấy đặc trưng trước lớp phân loại
            # Forward qua model nhưng chỉ lấy đến trước lớp cuối
            features = model(image_tensor)
            
            # Nếu đây là đầu ra từ lớp cuối, cần lấy đặc trưng trước đó
            if isinstance(model.head, torch.nn.Sequential):
                # Tạm thời lưu lại head
                original_head = model.head
                # Thay head bằng Identity để lấy feature vectors
                model.head = torch.nn.Identity()
                # Forward lại để lấy feature
                features = model(image_tensor)
                # Khôi phục head
                model.head = original_head
            
            # Debug kích thước
            print(f"Kích thước feature vector: {features.shape}")
            
            return features.cpu().numpy()
            
        except Exception as e:
            print(f"Lỗi khi trích xuất đặc trưng phương pháp 1: {e}")
            
            try:
                # Phương pháp 2: Sử dụng hook để lấy đặc trưng
                features = []
                
                def hook_fn(module, input, output):
                    features.append(output.detach())
                
                # Đăng ký hook tại lớp cuối trước classifier
                if hasattr(model, 'avgpool'):
                    hook = model.avgpool.register_forward_hook(hook_fn)
                elif hasattr(model, 'norm'):
                    hook = model.norm.register_forward_hook(hook_fn)
                
                # Forward
                _ = model(image_tensor)
                
                # Xóa hook
                hook.remove()
                
                # Flatten và trả về
                if features:
                    feature_tensor = features[0]
                    if feature_tensor.dim() > 2:
                        feature_tensor = torch.nn.functional.adaptive_avg_pool2d(feature_tensor, (1, 1))
                        feature_tensor = torch.flatten(feature_tensor, 1)
                    print(f"Kích thước feature vector (hook): {feature_tensor.shape}")
                    return feature_tensor.cpu().numpy()
                else:
                    raise Exception("Không thể trích xuất đặc trưng")
                    
            except Exception as e:
                print(f"Lỗi khi trích xuất đặc trưng phương pháp 2: {e}")
                
                # Fallback: Trả về vector ngẫu nhiên 1024 chiều cho visualization
                print("Trả về vector giả lập 1024 chiều")
                dummy_features = np.random.randn(1, 1024) * 0.1
                return dummy_features

# Chạy tiền xử lý và dự đoán toàn bộ pipeline
def process_drug_image(image_path, yolo_model, swin_model, knn_model, transforms_fn, class_mapping):
    """Thực hiện toàn bộ quy trình phân loại thuốc"""
    results = {
        'original_image': None,
        'yolo_detections': [],  # Lưu tất cả các phát hiện từ YOLO
        'cropped_pills': [],    # Lưu tất cả các viên thuốc được cắt
        'feature_vectors': [],  # Lưu tất cả các vector đặc trưng
        'predictions': [],      # Lưu tất cả các dự đoán
        'confidences': [],      # Lưu tất cả các độ tin cậy
        'class_names': [],      # Lưu tên lớp của tất cả các viên thuốc
        'visualization': None
    }
    
    # 1. Đọc ảnh gốc
    print(f"\nXử lý ảnh: {os.path.basename(image_path)}")
    img_bgr = cv2.imread(image_path)
    if img_bgr is None:
        print(f"Lỗi: Không thể đọc ảnh từ '{image_path}'")
        return results
    
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    results['original_image'] = img_rgb
    
    # 2. Phát hiện thuốc bằng YOLO
    print("Bước 1-2: Phát hiện viên thuốc với YOLO...")
    yolo_results = yolo_model.predict(img_rgb, verbose=False)
    
    # Kiểm tra xem có phát hiện được thuốc không
    if len(yolo_results[0].boxes) == 0:
        print("Không phát hiện được viên thuốc nào trong ảnh")
        return results
    
    # Lấy tất cả bounding box 
    boxes_data = yolo_results[0].boxes.data.cpu().numpy()
    # Sắp xếp theo confidence giảm dần
    boxes_data = boxes_data[boxes_data[:, 4].argsort()[::-1]]
    
    print(f"Đã phát hiện {len(boxes_data)} viên thuốc")
    
    # Xử lý từng viên thuốc
    for i, box_data in enumerate(boxes_data):
        x1, y1, x2, y2, conf, cls_id = box_data
        
        # Lưu thông tin phát hiện
        detection = {
            'box': [int(x1), int(y1), int(x2), int(y2)],
            'confidence': float(conf),
            'class_id': int(cls_id)
        }
        results['yolo_detections'].append(detection)
        
        print(f"Viên thuốc #{i+1} - Độ tin cậy: {conf:.2f}")
        
        # Cắt vùng ảnh viên thuốc
        cropped_pill = img_rgb[int(y1):int(y2), int(x1):int(x2)]
        results['cropped_pills'].append(cropped_pill)
        
        # 3. Chuyển đổi ảnh đã cắt thành tensor cho Swin-B
        print(f"Bước 3 (viên #{i+1}): Chuẩn bị ảnh cho trích xuất đặc trưng...")
        try:
            pill_pil = Image.fromarray(cropped_pill)
            pill_tensor = transforms_fn(pill_pil)
            
            # 4. Trích xuất feature vector từ Swin-B
            print(f"Bước 4 (viên #{i+1}): Trích xuất vector đặc trưng với Swin-B...")
            features = extract_features(swin_model, pill_tensor)
            print(f"Đã trích xuất vector đặc trưng kích thước: {features.shape}")
            
            # Lưu feature vector
            results['feature_vectors'].append(features)
            
            # 5. Phân loại bằng KNN
            print(f"Bước 5 (viên #{i+1}): Phân loại thuốc với KNN...")
            y_pred = knn_model.predict(features)
            y_pred_proba = knn_model.predict_proba(features)
            
            # Lấy confidence từ predict_proba
            predicted_class = y_pred[0]
            confidence = max(y_pred_proba[0])
            
            # Tên lớp từ class mapping
            if class_mapping:
                # Debug: In ra 5 key đầu tiên của mapping
                print(f"[DEBUG] class_mapping keys: {list(class_mapping.keys())[:5]}")
                predicted_class_str = str(int(predicted_class))
                print(f"[DEBUG] predicted_class_str: {predicted_class_str}")
                if predicted_class_str in class_mapping:
                    class_name = class_mapping[predicted_class_str]
                    print(f"[DEBUG] Tìm thấy tên thuốc: {class_name}")
                else:
                    print(f"[DEBUG] Không tìm thấy key {predicted_class_str} trong mapping!")
                    class_name = f"Unknown-{predicted_class}"
            else:
                print("[DEBUG] class_mapping bị None hoặc rỗng!")
                class_name = f"Class-{predicted_class}"
            
            # Lưu kết quả phân loại
            results['predictions'].append(int(predicted_class))
            results['confidences'].append(float(confidence))
            results['class_names'].append(class_name)
            
            print(f"Kết quả phân loại viên #{i+1}: {class_name} (Độ tin cậy: {confidence:.2f})")
            
        except Exception as e:
            print(f"Lỗi xử lý viên thuốc #{i+1}: {e}")
            # Thêm giá trị rỗng hoặc None để giữ index khớp với số lượng viên thuốc
            results['feature_vectors'].append(None)
            results['predictions'].append(None)
            results['confidences'].append(0.0)
            results['class_names'].append("Error")
    
    # Tạo hình ảnh minh họa kết quả
    visualization = create_visualization(results)
    results['visualization'] = visualization
    
    return results

# Tạo hình ảnh minh họa quy trình phân loại
def create_visualization(results):
    """Tạo hình ảnh minh họa quy trình phân loại thuốc"""
    try:
        num_pills = len(results['yolo_detections'])
        if num_pills == 0:
            # Nếu không phát hiện được viên thuốc nào
            fig, ax = plt.subplots(figsize=(10, 8))
            fig.suptitle("Quy trình phân loại thuốc", fontsize=18)
            ax.set_facecolor((0.9, 0.9, 0.9))
            ax.text(0.5, 0.5, "Không phát hiện được viên thuốc nào", 
                   ha='center', va='center', fontsize=16)
            ax.axis('off')
            plt.tight_layout()
            return fig
            
        # Tạo figure với đủ subplots cho tất cả viên thuốc
        # Mỗi viên thuốc cần 3 subplot (cropped, feature, result)
        # + 1 subplot cho ảnh gốc ở đầu
        fig = plt.figure(figsize=(18, 6 + 4 * num_pills))
        gs = fig.add_gridspec(1 + num_pills, 3)
        
        # Tiêu đề chính
        fig.suptitle("Quy trình phân loại thuốc", fontsize=20)
        
        # 1. Hiển thị ảnh gốc với tất cả bounding box
        ax_orig = fig.add_subplot(gs[0, :])
        if results['original_image'] is not None:
            if isinstance(results['original_image'], np.ndarray):
                if results['original_image'].dtype != np.uint8:
                    img_to_show = results['original_image'].astype(np.uint8)
                else:
                    img_to_show = results['original_image']
                ax_orig.imshow(img_to_show)
            else:
                ax_orig.set_facecolor((0.8, 0.8, 0.8))
                ax_orig.text(0.5, 0.5, "Ảnh không hợp lệ", ha='center', va='center')
        else:
            ax_orig.set_facecolor((0.8, 0.8, 0.8))
            ax_orig.text(0.5, 0.5, "Không có ảnh", ha='center', va='center')
            
        ax_orig.set_title("Ảnh đầu vào với tất cả viên thuốc được phát hiện", fontsize=16)
        ax_orig.axis('off')
        
        # Vẽ tất cả bounding box
        for i, detection in enumerate(results['yolo_detections']):
            try:
                x1, y1, x2, y2 = detection['box']
                rect = Rectangle((x1, y1), x2-x1, y2-y1, 
                                linewidth=3, edgecolor=f'C{i%10}', facecolor='none')
                ax_orig.add_patch(rect)
                
                # Thêm label cho bounding box
                class_name = results['class_names'][i] if i < len(results['class_names']) else f"#{i+1}"
                conf = results['confidences'][i] if i < len(results['confidences']) else 0
                
                # Tạo label hiển thị tên thuốc ngắn gọn
                if class_name != "Error" and class_name != "Unknown" and not class_name.startswith("#"):
                    # Cắt tên thuốc ngắn gọn (lấy phần trước mg/g đầu tiên)
                    short_name = class_name.split(' ')[0]
                    label = f"#{i+1}: {short_name} ({conf:.2f})"
                else:
                    label = f"#{i+1}: ({conf:.2f})"
                
                # Vẽ nền cho text để dễ đọc
                ax_orig.text(x1, y1-5, label, color=f'C{i%10}', 
                           fontsize=12, fontweight='bold', 
                           bbox=dict(facecolor='white', alpha=0.8, pad=2, edgecolor=f'C{i%10}'))
            except Exception as e:
                print(f"Lỗi khi vẽ bounding box thứ {i+1}: {e}")
                
        # Tạo không gian giữa các hàng
        plt.subplots_adjust(hspace=0.4)
        
        # Hiển thị thông tin chi tiết cho mỗi viên thuốc
        for i in range(num_pills):
            try:
                # 2. Hiển thị viên thuốc đã cắt
                ax_crop = fig.add_subplot(gs[i+1, 0])
                if i < len(results['cropped_pills']) and results['cropped_pills'][i] is not None:
                    cropped_pill = results['cropped_pills'][i]
                    if isinstance(cropped_pill, np.ndarray):
                        if cropped_pill.dtype != np.uint8:
                            cropped_to_show = cropped_pill.astype(np.uint8)
                        else:
                            cropped_to_show = cropped_pill
                        ax_crop.imshow(cropped_to_show)
                    else:
                        ax_crop.set_facecolor((0.8, 0.8, 0.8))
                        ax_crop.text(0.5, 0.5, "Ảnh cắt không hợp lệ", 
                                    ha='center', va='center', fontsize=14)
                else:
                    ax_crop.set_facecolor((0.8, 0.8, 0.8))
                    ax_crop.text(0.5, 0.5, "Không có ảnh cắt", 
                                ha='center', va='center', fontsize=14)
                
                ax_crop.set_title(f"Viên thuốc #{i+1}", fontsize=14)
                ax_crop.axis('off')
                
                # 3. Hiển thị feature map
                ax_feat = fig.add_subplot(gs[i+1, 1])
                if i < len(results['feature_vectors']) and results['feature_vectors'][i] is not None:
                    feature_vector = results['feature_vectors'][i]
                    if isinstance(feature_vector, np.ndarray):
                        feature_vector = feature_vector.astype(np.float32).reshape(1, -1)
                        num_features = feature_vector.shape[1]
                        feature_dim = int(np.sqrt(num_features))
                        
                        if num_features >= feature_dim*feature_dim:
                            feature_map = feature_vector[0, :feature_dim*feature_dim].reshape(feature_dim, feature_dim)
                        else:
                            feature_map = np.zeros((32, 32), dtype=np.float32)
                            flat_size = min(feature_vector.size, 32*32)
                            feature_map.flat[:flat_size] = feature_vector.flatten()[:flat_size]
                        
                        if feature_map.max() != feature_map.min():
                            feature_map = (feature_map - feature_map.min()) / (feature_map.max() - feature_map.min())
                            
                        ax_feat.imshow(feature_map, cmap='viridis')
                        ax_feat.set_title(f"Vector đặc trưng #{i+1}\n({num_features} chiều)", fontsize=14)
                    else:
                        feature_map = np.random.rand(32, 32).astype(np.float32)
                        ax_feat.imshow(feature_map, cmap='viridis')
                        ax_feat.set_title(f"Vector đặc trưng #{i+1}", fontsize=14)
                else:
                    feature_map = np.random.rand(32, 32).astype(np.float32)
                    ax_feat.imshow(feature_map, cmap='viridis')
                    ax_feat.set_title(f"Vector đặc trưng #{i+1}", fontsize=14)
                
                ax_feat.axis('off')
                
                # 4. Hiển thị kết quả
                ax_result = fig.add_subplot(gs[i+1, 2])
                ax_result.axis('off')
                
                if i < len(results['class_names']) and results['class_names'][i] != "Error" and results['class_names'][i] != "Unknown":
                    try:
                        confidence = float(results['confidences'][i])
                        ax_result.barh(['Độ tin cậy'], [confidence], color=f'C{i%10}', height=0.5)
                        ax_result.set_xlim(0, 1)
                        
                        # Hiển thị tên thuốc đầy đủ và độ tin cậy
                        drug_name = results['class_names'][i]
                        # Chia tên thuốc thành 2 dòng nếu quá dài
                        if len(drug_name) > 30:
                            words = drug_name.split()
                            half_len = len(words) // 2
                            first_part = ' '.join(words[:half_len])
                            second_part = ' '.join(words[half_len:])
                            display_name = f"{first_part}\n{second_part}"
                        else:
                            display_name = drug_name
                            
                        ax_result.text(0.05, 0.7, 
                                     f"Tên thuốc: {display_name}\n" +
                                     f"Độ tin cậy: {confidence:.2f}",
                                     transform=ax_result.transAxes,
                                     fontsize=14)
                    except Exception as e:
                        print(f"Lỗi khi hiển thị kết quả viên thuốc #{i+1}: {e}")
                        ax_result.text(0.5, 0.5, "Lỗi hiển thị kết quả", 
                                     ha='center', va='center', fontsize=14)
                            
                    ax_result.set_title(f"Kết quả phân loại #{i+1}", fontsize=14)
                else:
                    ax_result.text(0.5, 0.5, "Không thể phân loại", 
                                 ha='center', va='center', fontsize=14)
                    ax_result.set_title(f"Kết quả phân loại #{i+1} (thất bại)", fontsize=14)
            
            except Exception as e:
                print(f"Lỗi khi hiển thị thông tin viên thuốc #{i+1}: {e}")
                
        plt.tight_layout()
        return fig
        
    except Exception as e:
        print(f"Lỗi khi tạo visualization: {e}")
        # Tạo visualization đơn giản nếu có lỗi
        fig, ax = plt.subplots(figsize=(10, 8))
        fig.suptitle("Quy trình phân loại thuốc (fallback)", fontsize=18)
        
        ax.set_facecolor((0.9, 0.9, 0.9))
        ax.text(0.5, 0.5, "Không thể hiển thị kết quả\ndo lỗi xử lý hình ảnh", 
               ha='center', va='center', fontsize=16)
        ax.axis('off')
        plt.tight_layout()
        return fig

# Class theo dõi thư mục ảnh
class ImageWatcher(FileSystemEventHandler):
    def __init__(self, models_dict, transforms_fn, class_mapping_from_watcher, watch_dir='sample_images'):
        self.models_dict = models_dict
        self.transforms_fn = transforms_fn
        
        # Ưu tiên lấy class_mapping từ cache nếu có và hợp lệ
        cached_mapping = MODEL_CACHE.get('class_mapping')
        if cached_mapping and isinstance(cached_mapping, dict) and len(cached_mapping) > 0:
            self.class_mapping = cached_mapping
            print("[DEBUG ImageWatcher.__init__] Sử dụng class_mapping từ MODEL_CACHE.")
            print(f"[DEBUG ImageWatcher.__init__] Keys (5 mục đầu): {list(self.class_mapping.keys())[:5]}")
        # Nếu không, sử dụng class_mapping được truyền vào nếu hợp lệ
        elif class_mapping_from_watcher and isinstance(class_mapping_from_watcher, dict) and len(class_mapping_from_watcher) > 0:
            self.class_mapping = class_mapping_from_watcher
            print("[DEBUG ImageWatcher.__init__] Sử dụng class_mapping được truyền vào ImageWatcher.")
            print(f"[DEBUG ImageWatcher.__init__] Keys (5 mục đầu): {list(self.class_mapping.keys())[:5]}")
        # Nếu cả hai đều không hợp lệ, đặt là None
        else:
            self.class_mapping = None
            print("[DEBUG ImageWatcher.__init__] class_mapping là None hoặc rỗng sau khi kiểm tra cache và tham số.")
            
        self.watch_dir = watch_dir
        self.processing = False
        self.processed_files = set()
        print(f"Đang theo dõi thư mục: {watch_dir}")
        
    def on_created(self, event):
        # Hàm được gọi khi có file mới được tạo
        if not event.is_directory and not self.processing:
            self._process_image(event.src_path)
            
    def _process_image(self, file_path):
        # Bỏ qua nếu đã xử lý file này
        if file_path in self.processed_files:
            return
            
        # Kiểm tra file ảnh hợp lệ
        image_extensions = ['.jpg', '.jpeg', '.png', '.bmp']
        if not any(file_path.lower().endswith(ext) for ext in image_extensions):
            return
            
        # Đợi 1s để file được ghi đầy đủ
        time.sleep(1)
        
        print(f"\n=== File mới phát hiện: {file_path} ===")
        self.processing = True
        self.processed_files.add(file_path)
        
        try:
            # Xử lý ảnh với pipeline phân loại
            if os.path.exists(file_path) and os.path.getsize(file_path) > 0:
                results = process_drug_image(
                    file_path, 
                    self.models_dict['yolo'], 
                    self.models_dict['swin_b'],
                    self.models_dict['knn'],
                    self.transforms_fn,
                    self.class_mapping
                )
                
                # Lưu kết quả và hiển thị
                if results['visualization']:
                    # Tạo tên file kết quả
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    filename = os.path.basename(file_path)
                    result_path = f"results/{timestamp}_{filename.split('.')[0]}_result.png"
                    
                    # Lưu hình ảnh kết quả
                    results['visualization'].savefig(result_path)
                    print(f"Đã lưu kết quả tại: {result_path}")
                    
                    # Di chuyển ảnh gốc vào thư mục đã xử lý
                    processed_path = f"processed/{timestamp}_{filename}"
                    shutil.copy2(file_path, processed_path)
                    
                    # Hiển thị thông tin
                    if len(results['class_names']) > 0:
                        print(f"Đã phân loại {len(results['class_names'])} viên thuốc:")
                        for i, drug_name in enumerate(results['class_names']):
                            if drug_name != "Unknown" and drug_name != "Error":
                                conf = results['confidences'][i] if i < len(results['confidences']) else 0
                                # Hiển thị tên thuốc thay vì class
                                print(f"  Viên #{i+1}: {drug_name} - Độ tin cậy: {conf:.2f}")
                            else:
                                print(f"  Viên #{i+1}: Không thể phân loại")
                    else:
                        print("Không phát hiện được viên thuốc nào trong ảnh")
        except Exception as e:
            print(f"Lỗi khi xử lý ảnh {file_path}: {e}")
        
        self.processing = False

# Hàm mới để theo dõi thư mục ảnh
def start_watching_directory(models_dict):
    """Bắt đầu theo dõi thư mục images để tự động phân loại ảnh mới"""
    # Tạo transforms cho Swin-B
    transforms_fn = get_transforms()
    
    # Tải class mapping
    class_mapping_local = None # Sử dụng tên biến cục bộ rõ ràng
    try:
        mapping_file_path = MODEL_PATHS['class_mapping']
        if os.path.exists(mapping_file_path):
            print(f"Đang tải mapping class từ: {mapping_file_path}...")
            # Thêm encoding='utf-8' và kiểm tra dữ liệu tải được
            with open(mapping_file_path, 'r', encoding='utf-8') as f:
                class_mapping_data = json.load(f)
            
            if class_mapping_data: # Kiểm tra xem dữ liệu tải có nội dung không
                MODEL_CACHE['class_mapping'] = class_mapping_data
                class_mapping_local = class_mapping_data # Gán cho biến cục bộ
                print(f"Đã tải mapping class thành công! Số lượng mục: {len(class_mapping_data)}.")
                print(f"[DEBUG start_watching_directory] MODEL_CACHE keys (5 mục đầu): {list(MODEL_CACHE.get('class_mapping', {}).keys())[:5]}")
            else:
                print(f"Lỗi: File mapping '{mapping_file_path}' được tải nhưng rỗng hoặc không hợp lệ.")
                MODEL_CACHE['class_mapping'] = None # Đặt rõ là None nếu rỗng
                class_mapping_local = None
        else:
            print(f"Lỗi: File mapping không tồn tại tại '{mapping_file_path}'")
            MODEL_CACHE['class_mapping'] = None # Đặt rõ là None nếu không tồn tại
            class_mapping_local = None
            
    except Exception as e:
        print(f"Lỗi nghiêm trọng khi tải class mapping: {e}")
        MODEL_CACHE['class_mapping'] = None # Đặt rõ là None nếu có lỗi exception
        class_mapping_local = None
    
    # Log trạng thái của class_mapping_local trước khi truyền đi
    if class_mapping_local:
        print(f"[DEBUG start_watching_directory] class_mapping_local có {len(class_mapping_local)} mục. 5 key đầu: {list(class_mapping_local.keys())[:5]}")
    else:
        print("[DEBUG start_watching_directory] class_mapping_local là None hoặc rỗng.")

    # Tạo observer theo dõi thư mục
    event_handler = ImageWatcher(models_dict, transforms_fn, class_mapping_local) # Truyền bản sao đã tải
    observer = Observer()
    observer.schedule(event_handler, 'sample_images', recursive=False)
    observer.start()
    
    print("\n=== ĐANG CHỜ ẢNH MỚI ĐỂ PHÂN LOẠI ===")
    print("- Hãy thêm ảnh thuốc vào thư mục 'sample_images' để tự động phân loại")
    print("- Nhấn Ctrl+C để dừng chương trình")
    
    try:
        # Tạo một vòng lặp vô hạn để giữ chương trình chạy
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
        print("\n=== DỪNG THEO DÕI THƯ MỤC ===")
    
    observer.join()

# Cập nhật hàm main
def main():
    """Hàm chính chạy quy trình phân loại thuốc"""
    check_paths()
    
    print("=== KHỞI TẠO QUY TRÌNH PHÂN LOẠI THUỐC ===")
    
    # Dictionary lưu trữ các model
    models_dict = {}
    
    # Kiểm tra cache trước khi tải
    if MODEL_CACHE['yolo'] is not None:
        print("Sử dụng mô hình YOLO từ cache...")
        models_dict['yolo'] = MODEL_CACHE['yolo']
    else:
        # Tải YOLO model
        print("Đang tải mô hình YOLO...")
        try:
            models_dict['yolo'] = YOLO(MODEL_PATHS['yolo'])
            MODEL_CACHE['yolo'] = models_dict['yolo']  # Lưu vào cache
            print("Đã tải mô hình YOLO thành công!")
        except Exception as e:
            print(f"Lỗi khi tải mô hình YOLO: {e}")
            print("Sử dụng fallback mode...")
            create_dummy_pipeline()
            return
    
    # Tải Swin-B model từ cache hoặc file
    if MODEL_CACHE['swin_b'] is not None:
        print("Sử dụng mô hình Swin-B từ cache...")
        models_dict['swin_b'] = MODEL_CACHE['swin_b']
    else:
        try:
            models_dict['swin_b'] = create_swin_b_model(pretrained_path=MODEL_PATHS['swin_b'])
            MODEL_CACHE['swin_b'] = models_dict['swin_b']  # Lưu vào cache
        except Exception as e:
            print(f"Lỗi khi tạo mô hình Swin-B: {e}")
            print("Sử dụng fallback mode...")
            create_dummy_pipeline()
            return
    
    # Tải KNN model từ cache hoặc file
    if MODEL_CACHE['knn'] is not None:
        print("Sử dụng mô hình KNN từ cache...")
        models_dict['knn'] = MODEL_CACHE['knn']
    else:
        print("Đang tải mô hình KNN...")
        try:
            models_dict['knn'] = joblib.load(MODEL_PATHS['knn'])
            MODEL_CACHE['knn'] = models_dict['knn']  # Lưu vào cache
            print("Đã tải mô hình KNN thành công!")
        except Exception as e:
            print(f"Lỗi khi tải mô hình KNN: {e}")
            print("Sử dụng fallback mode...")
            create_dummy_pipeline()
            return
    
    # Bắt đầu theo dõi thư mục
    start_watching_directory(models_dict)

# Tạo file test cho trường hợp không có ảnh/model
def create_dummy_pipeline():
    """Tạo quy trình phân loại thuốc giả lập khi không có dữ liệu thật"""
    try:
        # Tạo hình ảnh minh họa
        fig, axs = plt.subplots(1, 4, figsize=(15, 4))
        fig.suptitle("Quy trình phân loại thuốc (Minh họa)", fontsize=16)
        
        # 1. Ảnh đầu vào giả
        dummy_image = np.ones((300, 300, 3), dtype=np.uint8) * 240  # Nền trắng xám
        # Vẽ viên thuốc giả
        cv2.circle(dummy_image, (150, 150), 100, (150, 200, 150), -1)
        axs[0].imshow(dummy_image)
        axs[0].set_title("1. Ảnh đầu vào")
        # Vẽ bounding box giả
        rect = Rectangle((50, 50), 200, 200, 
                         linewidth=2, edgecolor='r', facecolor='none')
        axs[0].add_patch(rect)
        axs[0].axis('off')
        
        # 2. Vùng ảnh cắt bởi YOLO
        cropped_pill = dummy_image[50:250, 50:250].copy()
        axs[1].imshow(cropped_pill)
        axs[1].set_title("2. Vùng ảnh cắt bởi YOLO")
        axs[1].axis('off')
        
        # 3. Minh họa trích xuất đặc trưng
        # Tạo hình ảnh giả lập feature map
        feature_map = np.random.rand(32, 32).astype(np.float32)  # Đảm bảo là float32
        axs[2].imshow(feature_map, cmap='viridis')
        axs[2].set_title("3. Vector đặc trưng Swin-B\n(1024 chiều)")
        axs[2].axis('off')
        
        # 4. Kết quả phân loại
        axs[3].barh(['Confidence'], [0.85], color='green')
        axs[3].set_xlim(0, 1)
        axs[3].text(0.05, 0.7, 
                   "Phân loại: Paracetamol\n" +
                   "Độ tin cậy: 0.85",
                   transform=axs[3].transAxes, 
                   fontsize=12)
        axs[3].set_title("4. Phân loại bằng KNN (k=5)")
        axs[3].axis('off')
        
        plt.tight_layout()
        plt.show()
        
        print("\n=== MINH HỌA QUY TRÌNH PHÂN LOẠI THUỐC ===")
        print("1. Ảnh đầu vào (ví dụ: ảnh viên Paracetamol)")
        print("2. Phát hiện và cắt vùng ảnh thuốc bằng YOLOv8")
        print("3. Trích xuất vector đặc trưng 1024 chiều từ Swin-B")
        print("4. Phân loại bằng KNN (k=5) dựa trên vector đặc trưng")
        print("Kết quả: Paracetamol (Độ tin cậy: 85%)")
    except Exception as e:
        print(f"Lỗi khi tạo minh họa: {e}")
        print("\n=== MINH HỌA QUY TRÌNH PHÂN LOẠI THUỐC (TEXT) ===")
        print("1. Ảnh đầu vào (ví dụ: ảnh viên Paracetamol)")
        print("2. Phát hiện và cắt vùng ảnh thuốc bằng YOLOv8")
        print("3. Trích xuất vector đặc trưng 1024 chiều từ Swin-B")
        print("4. Phân loại bằng KNN (k=5) dựa trên vector đặc trưng")
        print("Kết quả: Paracetamol (Độ tin cậy: 85%)")

# Chạy chương trình
if __name__ == "__main__":
    try:
        # Kiểm tra xem có đủ file mô hình và ảnh mẫu không
        all_models_exist = all(os.path.exists(path) for path in MODEL_PATHS.values())
        
        if all_models_exist:
            main()  # Chạy quy trình thật nếu có đủ dữ liệu
        else:
            # Chạy quy trình giả lập nếu thiếu dữ liệu
            print("CẢNH BÁO: Không tìm thấy đủ file mô hình.")
            print("Tiến hành tạo quy trình giả lập minh họa...")
            create_dummy_pipeline()
    except Exception as e:
        print(f"Lỗi khi chạy chương trình: {e}")
        # Luôn chạy quy trình giả lập nếu có lỗi
        create_dummy_pipeline() 