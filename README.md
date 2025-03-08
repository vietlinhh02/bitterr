# BiiterNCKH Project

## Giới thiệu
BiiterNCKH là một dự án web application được xây dựng với Node.js cho backend và React cho frontend. Dự án này tích hợp nhiều công nghệ hiện đại và API của Google để cung cấp các tính năng đa dạng.

## Cấu trúc Dự án
```
├── frontend/           # Thư mục chứa mã nguồn React frontend
├── src/               # Thư mục chứa mã nguồn Node.js backend
├── ml_models/         # Thư mục chứa các model machine learning
├── uploads/           # Thư mục lưu trữ file upload
└── runs/              # Thư mục chứa logs và data runtime
```

## Công nghệ sử dụng

### Backend
- Node.js
- Express.js
- MongoDB với Mongoose
- JWT cho authentication
- Swagger cho API documentation
- Google Cloud Translate API
- Google Generative AI
- Multer cho file upload

### Frontend
- React
- Webpack
- Các thư viện UI/UX hiện đại

## Cài đặt

### Yêu cầu hệ thống
- Node.js (phiên bản mới nhất)
- MongoDB
- NPM hoặc Yarn

### Các bước cài đặt

1. Clone repository:
```bash
git clone [repository-url]
```

2. Cài đặt dependencies cho backend:
```bash
npm install
```

3. Cài đặt dependencies cho frontend:
```bash
cd frontend
npm install
```

4. Tạo file .env trong thư mục gốc và thêm các biến môi trường cần thiết:
```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GOOGLE_API_KEY=your_google_api_key
```

## Chạy ứng dụng

### Development Mode

1. Chạy backend:
```bash
npm run dev
```

2. Chạy frontend:
```bash
cd frontend
npm start
```

### Production Mode

1. Build frontend:
```bash
cd frontend
npm run build
```

2. Chạy server:
```bash
npm start
```

## API Documentation

API documentation được tạo tự động bằng Swagger và có thể truy cập tại:
```
http://localhost:[port]/api-docs
```

## Tính năng chính
- Authentication và Authorization
- Tích hợp Google Translate API
- Tích hợp Google Generative AI
- File upload và quản lý
- RESTful API
- Swagger documentation

## License
ISC

## Tác giả
[eddiesngu] 