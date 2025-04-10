# BiiterNCKH - Ứng Dụng Tra Cứu Thông Tin Thuốc Thông Minh

BiiterNCKH là ứng dụng tra cứu thông tin thuốc thông minh, giúp người dùng tiếp cận thông tin chính xác từ nguồn dữ liệu đáng tin cậy như FDA và Long Châu.

## 🌟 Tính Năng Chính

- **Tìm kiếm thuốc FDA**: Tra cứu thông tin thuốc từ cơ sở dữ liệu FDA.
- **Nhận diện thuốc từ ảnh**: Tải lên ảnh thuốc để nhận diện thông tin thuốc.
- **Tìm kiếm sản phẩm Long Châu**: Tra cứu thông tin thuốc từ nhà thuốc Long Châu.
- **Chat với AI**: Tương tác với AI để hỏi đáp về thuốc.
- **Tìm kiếm sự kiện thuốc**: Tra cứu các sự kiện liên quan đến thuốc.
- **Quản lý hồ sơ người dùng**: Đăng ký, đăng nhập, và quản lý hồ sơ người dùng.

## 🛠️ Công Nghệ Sử Dụng

### Backend
- Node.js với Express.js
- MongoDB với Mongoose ODM
- JWT cho xác thực
- OpenAI API cho AI Chat
- Google Cloud Vision API cho nhận diện ảnh

### Frontend
- React.js
- Material-UI (MUI) cho giao diện người dùng
- Axios cho HTTP requests
- React Router cho định tuyến

## 📥 Cài Đặt

### Yêu Cầu Hệ Thống
- Node.js v16+
- MongoDB v4.4+
- NPM v7+

### Hướng Dẫn Cài Đặt
1. **Sao chép kho lưu trữ**
```bash
git clone https://github.com/yourusername/bitterr.git
cd bitterr
```

2. **Cài đặt các gói phụ thuộc**
```bash
# Cài đặt dependencies cho backend
npm install

# Cài đặt dependencies cho frontend
cd frontend
npm install
cd ..
```

3. **Thiết lập biến môi trường**
```bash
cp .env.example .env
```
Chỉnh sửa tệp `.env` với cấu hình của bạn, bao gồm:
- Thông tin kết nối MongoDB
- API keys (OpenAI, Google Cloud Vision, v.v.)
- Cấu hình JWT

4. **Khởi chạy ứng dụng trong môi trường phát triển**
```bash
# Khởi chạy backend
npm run dev

# Khởi chạy frontend (trong terminal khác)
cd frontend
npm start
```

5. **Truy cập ứng dụng**
Mở trình duyệt và truy cập `http://localhost:3000`

## 🚀 Triển Khai

Xem hướng dẫn chi tiết về cách triển khai ứng dụng trong [DEPLOYMENT.md](DEPLOYMENT.md).

## 🧪 Kiểm Thử

```bash
# Chạy kiểm thử backend
npm test

# Chạy kiểm thử frontend
cd frontend
npm test
```

## 📊 API Documentation

Tài liệu API đầy đủ có sẵn sau khi khởi chạy ứng dụng tại `http://localhost:5000/api-docs`.

## 🤝 Đóng Góp

Chúng tôi hoan nghênh mọi đóng góp. Vui lòng làm theo các bước sau:

1. Fork dự án
2. Tạo nhánh tính năng (`git checkout -b feature/amazing-feature`)
3. Commit các thay đổi (`git commit -m 'Add some amazing feature'`)
4. Push lên nhánh (`git push origin feature/amazing-feature`)
5. Mở Pull Request

## 📜 Giấy Phép

Dự án này được cấp phép theo giấy phép MIT - xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 📞 Liên Hệ

- Email: support@bitterr.com
- Website: [https://bitterr.com](https://bitterr.com)
- Hotline: 1900-xxxx

## Cập nhật: Sử dụng OCR.space API 

Chúng tôi đã chuyển đổi từ hệ thống OCR tự triển khai sang sử dụng OCR.space API để tăng cường độ chính xác và đơn giản hóa quy trình nhận diện văn bản từ hình ảnh thuốc.

### Ưu điểm của OCR.space API:

1. **Độ chính xác cao** - API được tối ưu hóa cho nhận diện văn bản đa ngôn ngữ với độ chính xác cao
2. **Dễ tích hợp** - Không cần triển khai server Python riêng cho OCR
3. **Hỗ trợ tiếng Việt** - Nhận diện tốt văn bản tiếng Việt từ hình ảnh
4. **Thông tin bounding box** - Cung cấp tọa độ chính xác của từng từ được nhận diện
5. **Tốc độ xử lý nhanh** - Giảm thời gian phản hồi cho người dùng

### Cách sử dụng:

1. Đăng ký API key tại [OCR.space](https://ocr.space/OCRAPI)
2. Thêm API key vào file `.env`: `OCR_SPACE_API_KEY=your_api_key_here`
3. API sẽ tự động được sử dụng khi người dùng tải ảnh lên

## Tính năng nhận diện thuốc với Gemini AI (Mới)

Chúng tôi vừa tích hợp Google Gemini AI vào hệ thống để nâng cao khả năng nhận diện thuốc từ hình ảnh. Tính năng này giúp xác định chính xác các loại thuốc, hiển thị thông tin chi tiết và định vị vị trí của chúng trong hình ảnh.

### Ưu điểm so với hệ thống OCR trước đây

1. **Nhận diện hình dạng thuốc** - Không chỉ đọc được văn bản, Gemini còn nhận diện được hình dạng, màu sắc và các đặc điểm của viên thuốc
2. **Thông tin chi tiết hơn** - Cung cấp thông tin về thành phần hoạt tính, liều lượng và công dụng
3. **Đa ngôn ngữ** - Hiểu và xử lý thông tin bằng nhiều ngôn ngữ khác nhau
4. **Độ chính xác cao** - Dựa trên mô hình AI tiên tiến, giảm thiểu sai sót so với OCR truyền thống

### Cách sử dụng:

1. Đăng nhập vào hệ thống BiiterNCKH
2. Truy cập menu "Nhận diện thuốc Gemini AI" hoặc vào đường dẫn `/gemini-detection`
3. Tải lên hình ảnh chứa thuốc cần nhận diện
4. Nhấn nút "Nhận diện thuốc" để bắt đầu phân tích
5. Hệ thống sẽ hiển thị bounding box xung quanh các thuốc được nhận diện, kèm theo thông tin chi tiết

### Lưu ý về API key

Ứng dụng hiện sử dụng hai API key chính:
- **OCR.space API** - Cho nhận diện văn bản từ hình ảnh
- **Google Gemini API** - Cho phân tích và trả lời câu hỏi về thuốc

Vui lòng đảm bảo rằng các API key này được cấu hình đúng trong file `.env` của ứng dụng.

## Tính năng nhận diện viên thuốc với Machine Learning (Mới)

Chúng tôi vừa tích hợp thêm khả năng nhận diện viên thuốc sử dụng mô hình Machine Learning tiên tiến. Tính năng này giúp người dùng nhận diện chính xác các loại viên thuốc thông qua hình ảnh.

### Ưu điểm của mô hình ML cho nhận diện viên thuốc

1. **Nhận diện chính xác viên thuốc** - Mô hình được huấn luyện đặc biệt để nhận diện viên thuốc dựa trên hình dạng, màu sắc, và đặc điểm
2. **Hiển thị bounding box** - Đánh dấu chính xác vị trí các viên thuốc trong hình ảnh
3. **Thông tin chi tiết** - Cung cấp tên thuốc và mức độ tin cậy của nhận diện
4. **Tích hợp với hệ thống tìm kiếm** - Dễ dàng tìm kiếm thông tin chi tiết về thuốc sau khi nhận diện

### Cách sử dụng:

1. Truy cập trang "Nhận diện thuốc" (/medicine-detection)
2. Chuyển sang tab "Viên thuốc"
3. Tải lên hình ảnh chứa viên thuốc cần nhận diện
4. Nhấn "Nhận diện" để bắt đầu phân tích
5. Xem kết quả với hình ảnh có đánh dấu bounding box và thông tin thuốc
6. Có thể nhấn "Tìm tại nhà thuốc" để tìm thuốc tương ứng

### Cài đặt Python ML Server

Tính năng này yêu cầu chạy Python ML Server song song với backend Node.js:

```bash
# Di chuyển đến thư mục ml_models
cd ml_models

# Cài đặt các gói Python cần thiết
pip install -r requirements.txt

# Chạy server Python ML
python app.py

# Hoặc sử dụng Node.js để khởi động
node server.js
```

Lưu ý: Đảm bảo rằng Python server đang chạy trên port 8000 hoặc cập nhật biến môi trường `PYTHON_API_URL` trong file `.env` của backend.