# Hệ thống Detect và OCR Thuốc

Hệ thống này sử dụng YOLO để phát hiện hộp thuốc và OCR để nhận diện tên thuốc, sau đó xác minh kết quả bằng Gemini AI.

## Cài đặt

### 1. Cài đặt các thư viện Python

```bash
pip install -r requirements.txt
```

### 2. Cài đặt Tesseract OCR (dự phòng nếu PaddleOCR không hoạt động)

#### Windows:
1. Tải Tesseract OCR từ: https://github.com/UB-Mannheim/tesseract/wiki
2. Cài đặt vào `C:\Program Files\Tesseract-OCR\`
3. Cài đặt gói Python: `pip install pytesseract`

#### Linux:
```bash
sudo apt-get update
sudo apt-get install tesseract-ocr
sudo apt-get install tesseract-ocr-vie  # Hỗ trợ tiếng Việt
pip install pytesseract
```

### 3. Cài đặt PaddleOCR

Nếu gặp vấn đề khi cài đặt PaddleOCR từ requirements.txt, hãy thử các lệnh sau:

#### Phiên bản CPU:
```bash
pip install paddlepaddle -i https://mirror.baidu.com/pypi/simple
pip install paddleocr
```

#### Phiên bản GPU (nếu có CUDA):
```bash
# Cho CUDA 11.2
pip install paddlepaddle-gpu==2.4.2.post112 -f https://www.paddlepaddle.org.cn/whl/linux/mkl/avx/stable.html
# Hoặc cho CUDA 10.2
pip install paddlepaddle-gpu==2.4.2.post102 -f https://www.paddlepaddle.org.cn/whl/linux/mkl/avx/stable.html
```

### 4. Cấu hình Gemini API

Đăng ký API key tại: https://ai.google.dev/
Sau đó cập nhật API key trong file `detect_utils.py`:

```python
genai.configure(api_key="YOUR_GEMINI_API_KEY")
```

## Chạy ứng dụng

```bash
python app.py
```

Ứng dụng sẽ chạy tại: http://localhost:5001

## API Endpoints

### POST /detect/upload

Upload ảnh để phát hiện và OCR.

**Request:**
- Form data với key `image` chứa file ảnh (jpg, jpeg, png)

**Response:**
```json
{
  "message": "Detection successful",
  "results": [
    {
      "bbox": [x_min, y_min, x_max, y_max],
      "text": "Tên thuốc được OCR",
      "verified_text": "Thông tin xác minh từ Gemini (nếu có)"
    }
  ]
}
```

## Cải tiến

Hệ thống đã được cải tiến với:
1. Tiền xử lý ảnh (grayscale, tăng độ tương phản, khử nhiễu, làm sắc nét)
2. Hỗ trợ nhiều OCR engine (PaddleOCR và Tesseract)
3. Xác minh kết quả bằng Gemini AI
4. Caching để tăng tốc độ xử lý 