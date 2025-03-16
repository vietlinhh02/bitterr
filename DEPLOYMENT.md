# Hướng Dẫn Triển Khai BiiterNCKH

Tài liệu này hướng dẫn cách triển khai ứng dụng BiiterNCKH lên môi trường sản xuất.

## Yêu Cầu Hệ Thống

- Docker và Docker Compose
- Node.js v16+ (cho môi trường phát triển)
- MongoDB (được xử lý thông qua Docker)

## Bước 1: Chuẩn Bị Biến Môi Trường

Tạo file `.env` ở thư mục gốc với các biến sau:

```
# MongoDB
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your_secure_password

# JWT
JWT_SECRET=your_jwt_secret_key

# API Keys
OPENAI_API_KEY=your_openai_api_key
GOOGLE_API_KEY=your_google_api_key
GOOGLE_CLOUD_PROJECT=your_google_cloud_project_id

# Other configs
NODE_ENV=production
PORT=5000
```

## Bước 2: Triển Khai với Docker Compose

Chạy lệnh sau để xây dựng và khởi động các dịch vụ:

```bash
docker-compose up -d
```

Lệnh này sẽ:
1. Khởi động MongoDB
2. Xây dựng và khởi động backend
3. Xây dựng và khởi động frontend với Nginx

Ứng dụng sẽ có sẵn tại `http://localhost` hoặc địa chỉ IP của máy chủ.

## Bước 3: Kiểm Tra Hệ Thống

Sau khi triển khai, hãy kiểm tra:

1. Frontend tải thành công tại `http://localhost`
2. API backend hoạt động tại `http://localhost/api`
3. Kết nối đến MongoDB thành công (kiểm tra logs)

```bash
# Xem logs của backend
docker-compose logs -f backend
```

## Bước 4: Sao Lưu Dữ Liệu

Thiết lập sao lưu định kỳ cho MongoDB:

```bash
# Tạo thư mục sao lưu
mkdir -p backups

# Sao lưu database
docker exec -i $(docker-compose ps -q mongodb) mongodump --authenticationDatabase admin -u admin -p your_secure_password --db bitterr --out /data/db/backups/$(date +"%Y-%m-%d")

# Sao chép sao lưu ra khỏi container
docker cp $(docker-compose ps -q mongodb):/data/db/backups/$(date +"%Y-%m-%d") ./backups/
```

## Cập Nhật Ứng Dụng

Để cập nhật ứng dụng lên phiên bản mới:

```bash
# Pull thay đổi mới
git pull origin main

# Xây dựng lại và khởi động lại các container
docker-compose up -d --build
```

## Xử Lý Sự Cố

### Kết nối đến MongoDB thất bại

Kiểm tra thông tin đăng nhập MongoDB trong file .env và đảm bảo volume dữ liệu không bị hỏng:

```bash
docker-compose logs mongodb
```

### API Backend không phản hồi

Kiểm tra logs của backend:

```bash
docker-compose logs backend
```

### Vấn đề về Nginx/Frontend

Kiểm tra cấu hình Nginx và logs:

```bash
docker-compose logs frontend
docker exec -it $(docker-compose ps -q frontend) cat /var/log/nginx/error.log
```
