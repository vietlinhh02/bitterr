# API Nhận diện Thuốc

Server API nhận diện thuốc từ hình ảnh sử dụng các mô hình AI tiên tiến bao gồm YOLO (phát hiện đối tượng) và SwinTransformer kết hợp với KNN (phân loại).

## Tính năng chính

- **Phát hiện thuốc**: Sử dụng YOLO để phát hiện vị trí viên thuốc trong ảnh
- **Phân loại thuốc**: Trích xuất đặc trưng bằng SwinTransformer và phân loại bằng KNN
- **Giao diện web**: Cung cấp UI đơn giản để tải lên và xem kết quả nhận diện
- **API đầy đủ**: Endpoint RESTful để tích hợp với các hệ thống khác

## Yêu cầu hệ thống

- **Python 3.8+** (Có cài đặt pip)
- **Node.js 14+** (Để chạy server wrapper)
- **RAM tối thiểu**: 4GB (Khuyến nghị 8GB+)
- **Dung lượng ổ cứng**: Tối thiểu 1GB trống
- **GPU** (tùy chọn): Có GPU sẽ tăng hiệu suất xử lý đáng kể

## Cài đặt và khởi động

### Cách 1: Khởi động bằng Node.js (Đề xuất)

Sử dụng script Node.js để tự động cài đặt dependencies và khởi động server:

```bash
node start_node_server.js
```

Script này sẽ:
1. Kiểm tra các file model cần thiết
2. Tự động cài đặt Python dependencies
3. Khởi động Python server
4. Mở trình duyệt web với giao diện người dùng

### Cách 2: Khởi động thủ công

#### 1. Cài đặt Python dependencies

```bash
pip install -r requirements.txt
```

#### 2. Chạy trực tiếp Python server

```bash
python app.py
```

## Cấu trúc thư mục

```
ml_models/
├── app.py                           # FastAPI server chính
├── z.py                             # Module chức năng AI
├── server.js                        # Node.js wrapper script đơn giản
├── start_node_server.js             # Node.js wrapper script nâng cao
├── requirements.txt                 # Python dependencies
├── static/                          # Thư mục chứa UI và kết quả
│   └── index.html                   # Giao diện web
├── temp/                            # Thư mục lưu trữ tạm thời
├── class_to_idx_swin_b.json         # Mapping tên thuốc và ID
├── bestz.pt                         # YOLO model (detection)
├── swin_b_pill_classifier_best.pth  # SwinTransformer model
├── knn_features_swin_b.npy          # KNN features
└── knn_labels_swin_b.npy            # KNN labels
```

## Sử dụng API

### Endpoint chính

- **Web UI**: `http://localhost:8000/`
- **Nhận diện thuốc**: `http://localhost:8000/detect/`
- **Kiểm tra sức khỏe**: `http://localhost:8000/health`
- **Thông tin API**: `http://localhost:8000/api-info`

### Sử dụng API Detect

**Request:**

```
POST /detect/
Content-Type: multipart/form-data

form-data:
  - image: [tập tin hình ảnh]
```

**Response:**

```json
{
  "detections": [
    {
      "box_id": 0,
      "bbox": [x1, y1, x2, y2],
      "yolo_confidence": 0.95,
      "medication_name": "Tên thuốc",
      "medication_id": "ID thuốc",
      "confidence": 0.85
    }
  ],
  "image_path": "/static/result_xyz.jpg"
}
```

## Kiểm tra và gỡ lỗi

### Kiểm tra server

Truy cập `http://localhost:8000/health` để kiểm tra trạng thái server.

### Lỗi thường gặp

1. **ImportError hoặc ModuleNotFoundError**
   - Nguyên nhân: Thiếu Python dependencies
   - Giải pháp: Chạy `pip install -r requirements.txt`

2. **FileNotFoundError**
   - Nguyên nhân: Không tìm thấy các file model
   - Giải pháp: Kiểm tra các file model cần thiết đã tồn tại trong thư mục

3. **CUDA out of memory**
   - Nguyên nhân: GPU không đủ bộ nhớ
   - Giải pháp: Trong app.py, thay đổi `device = torch.device("cpu")`

4. **Lỗi memory**
   - Nguyên nhân: Không đủ RAM
   - Giải pháp: Đảm bảo máy có ít nhất 4GB RAM trống

## Hỗ trợ và liên hệ

Nếu gặp vấn đề khi sử dụng API, vui lòng:

1. Kiểm tra logs của server
2. Kiểm tra các file model đã tồn tại
3. Kiểm tra Python version (nên dùng Python 3.8+)
4. Liên hệ hỗ trợ qua email hoặc tạo issue trên GitHub repository

## Giấy phép

Mã nguồn được phân phối dưới giấy phép MIT. Xem file LICENSE để biết thêm chi tiết. 