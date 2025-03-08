# Ứng Dụng Tra Cứu Thông Tin Thuốc FDA

Đây là phần frontend của ứng dụng tra cứu thông tin thuốc từ FDA, được xây dựng bằng React và Material-UI.

## Tính năng

- Tìm kiếm thuốc theo tên hoặc thành phần
- Hiển thị danh sách kết quả tìm kiếm
- Xem chi tiết thông tin thuốc
- Giao diện responsive, thân thiện với người dùng

## Cài đặt

1. Cài đặt các dependencies:
   ```bash
   npm install
   ```

2. Chạy ứng dụng ở môi trường development:
   ```bash
   npm start
   ```

3. Build ứng dụng cho production:
   ```bash
   npm run build
   ```

## Cấu trúc dự án

- `src/components`: Chứa các component React
- `src/services`: Chứa các service để gọi API
- `public`: Chứa các file tĩnh

## API Backend

Ứng dụng sử dụng các API sau từ backend:

- `GET /api/drug/search?query=keyword`: Tìm kiếm thuốc theo tên
- `GET /api/drug/search-by-ingredients?ingredients=ingredient1,ingredient2`: Tìm kiếm thuốc theo thành phần

## Công nghệ sử dụng

- React
- Material-UI
- React Router
- Axios 