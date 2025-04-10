# ML Server cho Nhận diện Thuốc

ML Server này cung cấp API nhận diện thuốc từ hình ảnh sử dụng mô hình YOLO và SwinTransformer.

## Yêu cầu hệ thống

- Python 3.8+ 
- Node.js 14+
- Đủ RAM (ít nhất 4GB, khuyến nghị 8GB+)
- GPU là tùy chọn nhưng sẽ cải thiện hiệu suất đáng kể

## Cài đặt

### 1. Cài đặt dependencies Python

```bash
pip install -r requirements.txt
```

### 2. Cài đặt dependencies Node.js

```bash
npm install
```

## Cấu trúc thư mục

- `app.py` - Ứng dụng FastAPI chính 
- `server.js` - Wrapper Node.js để khởi động Python server
- `start_server.js` - Script nâng cao để khởi động và theo dõi Python server
- `check_server.js` - Công cụ kiểm tra trạng thái của Python server
- `test_endpoint.js` - Công cụ test API endpoint
- `static/` - Thư mục chứa ảnh đã xử lý (sẽ được tạo tự động)
- `temp/` - Thư mục lưu trữ tạm thời (sẽ được tạo tự động)
- Các file model: `bestz.pt`, `knn_model_swin_b_k5.joblib`, v.v.

## Khởi động server

```bash
node start_server.js
```

Server sẽ chạy mặc định trên cổng 8000. Bạn có thể truy cập trang web demo tại `http://localhost:8000`.

## Kiểm tra server

Để kiểm tra xem server có đang chạy không:

```bash
node check_server.js
```

## Test API endpoint

```bash
node test_endpoint.js
```

## API Endpoints

### Nhận diện Thuốc

**URL**: `/detect/`  
**Method**: `POST`  
**Content-Type**: `multipart/form-data`

**Request Body**:
- `image`: File hình ảnh chứa viên thuốc cần nhận diện

**Success Response**:
- **Code**: 200
- **Content**:
  ```json
  {
    "detections": [
      {
        "box_id": 0,
        "bbox": [x1, y1, x2, y2],
        "yolo_confidence": 0.95,
        "medication_name": "Tên thuốc",
        "medication_id": "Mã thuốc",
        "confidence": 0.85
      }
    ],
    "image_path": "/static/result_xyz.jpg"
  }
  ```

## Xử lý lỗi thường gặp

### 1. Python server không khởi động

Kiểm tra:
- Python đã được cài đặt và trong PATH
- Tất cả các dependencies đã được cài đặt
- Port 8000 không bị chiếm bởi ứng dụng khác

### 2. Lỗi "Import Error" khi khởi động Python

Chạy lại lệnh cài đặt dependencies:
```bash
pip install -r requirements.txt
```

### 3. Lỗi "No module named 'ultralytics'"

Cài đặt thư viện YOLO:
```bash
pip install ultralytics
```

### 4. Lỗi "CUDA out of memory"

Nếu sử dụng GPU, hãy thử:
- Giảm batch size trong config
- Đóng các ứng dụng khác đang sử dụng GPU
- Chuyển sang chế độ CPU bằng cách sửa app.py:
  ```python
  # Thay vì:
  device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
  
  # Sử dụng:
  device = torch.device("cpu")
  ```

### 5. Không thể kết nối từ backend Node.js

Kiểm tra:
- Python server đang chạy (sử dụng check_server.js)
- Cấu hình CORS trong app.py cho phép kết nối từ origin của bạn
- URL được cấu hình đúng trong controller backend Node.js

## Liên hệ hỗ trợ

Nếu gặp vấn đề, vui lòng liên hệ qua email hoặc tạo issue trên GitHub repository. 