# BiiterNCKH - Ứng Dụng Tra Cứu Thông Tin Thuốc Thông Minh

## Tổng Quan
BiiterNCKH là một ứng dụng web hiện đại được thiết kế để cung cấp thông tin thuốc chính xác và dễ tiếp cận cho người dùng Việt Nam. Ứng dụng kết hợp dữ liệu từ nhiều nguồn uy tín và công nghệ AI tiên tiến để mang đến trải nghiệm tra cứu thuốc tốt nhất.

## Tính Năng Chính
- 🔍 **Tra cứu thuốc FDA**: Tìm kiếm thông tin chi tiết về thuốc từ cơ sở dữ liệu FDA
- 🖼️ **Nhận diện thuốc từ ảnh**: Sử dụng AI để nhận diện thuốc từ hình ảnh
- 🏪 **Tìm kiếm sản phẩm Long Châu**: Tra cứu thông tin sản phẩm từ nhà thuốc Long Châu
- 💬 **Chat với AI**: Tương tác với AI để nhận thông tin về thuốc và tư vấn sức khỏe
- 👤 **Quản lý tài khoản**: Đăng ký, đăng nhập và quản lý thông tin cá nhân
- 📱 **Thiết kế đáp ứng**: Giao diện tối ưu trên mọi thiết bị

## 🛠️ Công Nghệ Sử Dụng
- **Frontend:** React.js, Material-UI, React Router
- **Backend:** Node.js, Express.js
- **Cơ sở dữ liệu:** MongoDB
- **AI & ML:** TensorFlow, OpenAI API
- **Xác thực:** JWT (JSON Web Tokens)
- **API:** RESTful API, GraphQL
- **Triển khai:** Docker, AWS

## 📥 Cài Đặt

### Yêu Cầu Hệ Thống
- Node.js (v14.0.0 trở lên)
- npm hoặc yarn
- MongoDB (v4.0 trở lên)
- Python 3.8+ (cho các mô hình ML)

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
- API keys (OpenAI, FDA, v.v.)
- Cấu hình JWT
- Cổng máy chủ

4. **Chạy ứng dụng**
```bash
# Chạy backend và frontend cùng lúc (development)
npm run dev

# Hoặc chạy riêng
# Backend
npm run server

# Frontend
npm run client
```

## 📂 Cấu Trúc Dự Án
```
bitterr/
├── frontend/                # Mã nguồn frontend
│   ├── public/              # Tài nguyên tĩnh
│   └── src/                 # Mã nguồn React
│       ├── components/      # Các component UI
│       │   ├── common/      # Component dùng chung
│       │   └── home/        # Component trang chủ
│       ├── contexts/        # React contexts
│       ├── pages/           # Các trang
│       │   └── footer/      # Trang footer
│       └── services/        # Dịch vụ API
├── src/                     # Mã nguồn backend
│   ├── controllers/         # Xử lý logic
│   ├── models/              # Mô hình dữ liệu
│   ├── routes/              # Định tuyến API
│   ├── middleware/          # Middleware
│   └── utils/               # Tiện ích
├── ml_models/               # Mô hình machine learning
├── uploads/                 # Thư mục lưu trữ tệp tải lên
├── .env                     # Biến môi trường
└── package.json             # Cấu hình npm
```

## 📱 Trang và Tính Năng

### Trang Chính
- **Trang chủ**: Giới thiệu tổng quan về ứng dụng
- **Đăng nhập/Đăng ký**: Quản lý tài khoản người dùng

### Tính Năng Chính
- **Tra cứu thuốc FDA**: Tìm kiếm và xem thông tin chi tiết về thuốc
- **Nhận diện thuốc từ ảnh**: Tải lên hình ảnh để nhận diện thuốc
- **Tìm kiếm Long Châu**: Tra cứu sản phẩm từ nhà thuốc Long Châu
- **Chat với AI**: Tương tác với AI để nhận thông tin và tư vấn

### Trang Thông Tin
- **Blog**: Bài viết về kiến thức y dược
- **Cơ sở dữ liệu**: Thông tin về nguồn dữ liệu thuốc
- **Hướng dẫn sử dụng**: Hướng dẫn chi tiết về cách sử dụng ứng dụng
- **FAQ**: Câu hỏi thường gặp
- **Về chúng tôi**: Thông tin về công ty và đội ngũ
- **Liên hệ**: Form liên hệ và thông tin liên lạc
- **Điều khoản sử dụng**: Điều khoản pháp lý
- **Chính sách bảo mật**: Thông tin về cách xử lý dữ liệu người dùng

## 🤝 Đóng Góp
1. Fork dự án
2. Tạo nhánh tính năng (`git checkout -b feature/amazing-feature`)
3. Commit thay đổi (`git commit -m 'Add some amazing feature'`)
4. Push lên nhánh (`git push origin feature/amazing-feature`)
5. Mở Pull Request

## 📄 Giấy Phép
Phân phối theo Giấy phép MIT. Xem `LICENSE` để biết thêm thông tin.

## 📞 Liên Hệ
- Email: support@biiterr.com
- Website: [www.biiterr.com](https://www.biiterr.com)
- Địa chỉ: 123 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh

## 🙏 Lời Cảm Ơn
- FDA cho cơ sở dữ liệu thuốc
- Long Châu cho dữ liệu sản phẩm
- OpenAI cho API ChatGPT
- Cộng đồng mã nguồn mở cho các thư viện và công cụ