import cv2
import torch
import numpy as np
import matplotlib.pyplot as plt
from ultralytics import YOLO
from PIL import Image # Cần thiết cho results.plot()

# --- Cấu hình ---
MODEL_NAME = './bestz.pt'  # 
# MODEL_NAME = 'yolov5s.pt' # Ví dụ nếu bạn muốn dùng YOLOv5 (cần tải weights nếu chưa có)
IMAGE_PATH = 'C:/Users/Public/archive/public_test/pill/image/VAIPE_P_1_1.jpg' # THAY THẾ BẰNG ĐƯỜNG DẪN ẢNH CỦA BẠN
CONF_THRESHOLD_RAW = 0.1      # Ngưỡng tin cậy thấp để xem nhiều box "thô"
IOU_THRESHOLD_RAW = 0.9       # Ngưỡng IoU cao để NMS ít loại bỏ box "thô"
CONF_THRESHOLD_FINAL = 0.25   # Ngưỡng tin cậy cho kết quả cuối cùng (mặc định)
IOU_THRESHOLD_FINAL = 0.45    # Ngưỡng IoU cho kết quả cuối cùng (mặc định)

# --- Hàm tiện ích ---
def get_class_colors(num_classes):
    """Tạo màu sắc ngẫu nhiên cho các lớp."""
    np.random.seed(42) # Để màu sắc cố định
    colors = np.random.randint(0, 255, size=(num_classes, 3), dtype="uint8")
    return [tuple(c.tolist()) for c in colors]

def draw_boxes_and_labels(image, boxes_data, class_names, colors, title_prefix=""):
    """Vẽ bounding boxes, class labels và confidence lên ảnh."""
    img_draw = image.copy()
    for i in range(boxes_data.shape[0]):
        x1, y1, x2, y2, conf, cls_idx = boxes_data[i]
        cls_idx = int(cls_idx)
        label = f"{class_names[cls_idx]} {conf:.2f}"
        color = colors[cls_idx % len(colors)] # Dùng modulo để tránh lỗi nếu số class nhiều hơn màu

        cv2.rectangle(img_draw, (int(x1), int(y1)), (int(x2), int(y2)), color, 2)
        cv2.putText(img_draw, label, (int(x1), int(y1) - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
    return img_draw

# --- Main Script ---
if __name__ == "__main__":
    # 1. Tải model
    try:
        model = YOLO(MODEL_NAME)
        print(f"Đã tải model: {MODEL_NAME}")
    except Exception as e:
        print(f"Lỗi khi tải model: {e}")
        print("Hãy chắc chắn rằng bạn đã cài đặt 'ultralytics' và model weights tồn tại.")
        exit()

    class_names = model.names
    colors = get_class_colors(len(class_names))

    # 2. Tải ảnh đầu vào
    img_bgr = cv2.imread(IMAGE_PATH)
    if img_bgr is None:
        print(f"Lỗi: Không thể đọc ảnh từ '{IMAGE_PATH}'. Vui lòng kiểm tra đường dẫn.")
        exit()
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    H, W, _ = img_rgb.shape

    # 3. Lấy các dự đoán "thô" (trước NMS hoặc NMS rất nhẹ nhàng)
    # verbose=False để không in log của ultralytics ra console
    results_raw = model.predict(img_rgb, conf=CONF_THRESHOLD_RAW, iou=IOU_THRESHOLD_RAW, verbose=False)
    # boxes.data chứa [x1, y1, x2, y2, conf, class_id]
    raw_boxes_data = results_raw[0].boxes.data.cpu().numpy() if results_raw[0].boxes is not None else np.array([])
    print(f"Số lượng bounding boxes 'thô' (conf>{CONF_THRESHOLD_RAW}, iou>{IOU_THRESHOLD_RAW}): {len(raw_boxes_data)}")

    # 4. Lấy các dự đoán cuối cùng (sau NMS chuẩn)
    results_final = model.predict(img_rgb, conf=CONF_THRESHOLD_FINAL, iou=IOU_THRESHOLD_FINAL, verbose=False)
    final_boxes_data = results_final[0].boxes.data.cpu().numpy() if results_final[0].boxes is not None else np.array([])
    print(f"Số lượng bounding boxes cuối cùng (conf>{CONF_THRESHOLD_FINAL}, iou>{IOU_THRESHOLD_FINAL}): {len(final_boxes_data)}")


    # --- Chuẩn bị các ảnh để hiển thị ---

    # Ảnh 1: Ảnh gốc
    img_input_display = img_rgb.copy()

    # Ảnh 2: Ảnh với bounding boxes "thô" + confidence + class
    img_raw_boxes_display = draw_boxes_and_labels(img_rgb, raw_boxes_data, class_names, colors)

    # Ảnh 3: Confidence/Probability Map (Heatmap đơn giản dựa trên confidence của các box thô)
    # Đây là một cách trực quan hóa đơn giản, không phải là feature map thực sự từ CNN.
    # Nó cho thấy vùng nào có nhiều dự đoán với confidence cao.
    confidence_heatmap = np.zeros((H, W), dtype=np.float32)
    if len(raw_boxes_data) > 0:
        for x1, y1, x2, y2, conf, _ in raw_boxes_data:
            # Cộng dồn confidence vào vùng của bounding box
            # Để tránh các box chồng chéo làm giá trị quá lớn, có thể dùng np.maximum
            # confidence_heatmap[int(y1):int(y2), int(x1):int(x2)] = np.maximum(
            #     confidence_heatmap[int(y1):int(y2), int(x1):int(x2)], conf
            # )
            # Hoặc cộng dồn để xem mật độ
            confidence_heatmap[int(y1):int(y2), int(x1):int(x2)] += conf

        # Chuẩn hóa heatmap về 0-1 nếu cần (nếu dùng cộng dồn)
        if confidence_heatmap.max() > 0:
            confidence_heatmap = np.clip(confidence_heatmap, 0, confidence_heatmap.max()) # Giới hạn giá trị
            # confidence_heatmap /= confidence_heatmap.max() # Chuẩn hóa

    # Ảnh 4: Ảnh với các phát hiện cuối cùng (sau NMS)
    # Sử dụng hàm plot() có sẵn của ultralytics cho tiện
    img_final_detections_pil = results_final[0].plot(conf=True, labels=True) # Trả về ảnh PIL
    img_final_detections_display = cv2.cvtColor(np.array(img_final_detections_pil), cv2.COLOR_RGB2BGR)
    img_final_detections_display = cv2.cvtColor(img_final_detections_display, cv2.COLOR_BGR2RGB) # Chuyển lại RGB cho matplotlib


    # --- Hiển thị bằng Matplotlib ---
    fig, axs = plt.subplots(2, 2, figsize=(15, 12))
    fig.suptitle(f"Phân tích hoạt động YOLO ({MODEL_NAME}) trên '{IMAGE_PATH}'", fontsize=16)

    axs[0, 0].imshow(img_input_display)
    axs[0, 0].set_title("1. Ảnh đầu vào (Input Image)")
    axs[0, 0].axis('off')

    axs[0, 1].imshow(img_raw_boxes_display)
    axs[0, 1].set_title(f"2. BBoxes thô + Conf + Class (Conf>{CONF_THRESHOLD_RAW})")
    axs[0, 1].axis('off')

    # Hiển thị confidence heatmap
    # Bạn có thể chồng heatmap lên ảnh gốc để dễ nhìn hơn
    img_rgb_float = img_rgb.astype(np.float32) / 255.0
    heatmap_display_overlay = cv2.applyColorMap(np.uint8(255 * confidence_heatmap / (confidence_heatmap.max() + 1e-6)), cv2.COLORMAP_JET)
    heatmap_display_overlay = cv2.cvtColor(heatmap_display_overlay, cv2.COLOR_BGR2RGB)
    # Trộn ảnh gốc với heatmap
    alpha = 0.5 # Độ trong suốt của heatmap
    superimposed_img = cv2.addWeighted(heatmap_display_overlay, alpha, img_rgb, 1 - alpha, 0)

    axs[1, 0].imshow(superimposed_img)
    # axs[1, 0].imshow(confidence_heatmap, cmap='viridis') # Hoặc chỉ heatmap
    axs[1, 0].set_title("3. Confidence Heatmap (từ BBoxes thô)")
    axs[1, 0].axis('off')

    axs[1, 1].imshow(img_final_detections_display)
    axs[1, 1].set_title(f"4. Phát hiện cuối cùng (Final Detections - NMS applied)")
    axs[1, 1].axis('off')

    plt.tight_layout(rect=[0, 0, 1, 0.96]) # Điều chỉnh layout để tiêu đề chính không bị che
    plt.show()

    print("Hoàn thành! Đã hiển thị các bước xử lý của YOLO.")