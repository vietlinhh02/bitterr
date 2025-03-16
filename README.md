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