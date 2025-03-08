import os
import yaml
import glob
import random
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import cv2

from PIL import Image
import torch
from ultralytics import YOLO
sns.set_theme(style="darkgrid", rc={"axes.unicode_minus": False})


def main ():
    # ---------------------------
    # HIỂN THỊ KẾT QUẢ TRAINING
    # ---------------------------
    # Nếu quá trình training thành công, file results.png sẽ được lưu trong folder kết quả
    results_image_path = os.path.join("runs", "detect", "yolo11n", "results.png")
    if os.path.exists(results_image_path):
        img = Image.open(results_image_path)
        plt.figure(figsize=(8, 8))
        plt.imshow(img)
        plt.title("Kết quả Training")
        plt.axis("off")
        plt.show()
    else:
        print(f"Không tìm thấy file kết quả tại: {results_image_path}")

    # ---------------------------
    # CHẠY DỰ ĐOÁN TRÊN VÀI ẢNH MẪU
    # ---------------------------
    # Tìm các ảnh test trong dataset (điều chỉnh đường dẫn cho phù hợp)
    test_image_paths = glob.glob(os.path.join(config["test"], "images", "*.jpg"))
    if len(test_image_paths) == 0:
        raise ValueError("Không tìm thấy ảnh trong folder test.")

    # Tải mô hình đã được huấn luyện
    # Ví dụ: file weights được lưu tại "runs/detect/yolo11n4/weights/best.pt"
    trained_model_path = os.path.join("runs", "detect", "yolo11n4", "weights", "best.pt")
    if not os.path.exists(trained_model_path):
        raise FileNotFoundError(f"Không tìm thấy file weights: {trained_model_path}")

    yolo_trained = YOLO(trained_model_path)

    # Chọn một số ảnh mẫu để chạy dự đoán (ở đây lấy 4 ảnh)
    n = 4
    selected_paths = test_image_paths[:n]
    results = yolo_trained.predict(selected_paths)

    for i in range(n):
        r = results[i]
        # Sử dụng hàm plot() của ultralytics để vẽ bounding box lên ảnh
        result_img = r.plot()
        img = Image.fromarray(result_img)
        plt.figure(dpi=100)
        plt.imshow(img)
        plt.title(f"Kết quả dự đoán - Ảnh {i+1}")
        plt.axis("off")
        plt.tight_layout()
        plt.show()

if __name__ == '__main__':
    # Nếu cần hỗ trợ freeze khi đóng gói thành executable, có thể thêm:
    # from multiprocessing import freeze_support
    # freeze_support()
    main()
