# Ứng Dụng Tra Cứu Thông Tin Thuốc FDA

Đây là phần frontend của ứng dụng tra cứu thông tin thuốc từ FDA, được xây dựng bằng React và Material-UI.

## Tính năng

- **Tìm kiếm thuốc** theo tên hoặc thành phần
- **Hiển thị danh sách** kết quả tìm kiếm
- **Xem chi tiết** thông tin thuốc
- **Chat với AI** về thông tin thuốc
- **Nhận diện thuốc** từ ảnh
- **Tìm kiếm sản phẩm** từ nhà thuốc Long Châu
- **Giao diện responsive**, thân thiện với người dùng

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

```
src/
├── components/       # Chứa các component React
├── contexts/         # Context API để quản lý state
├── services/         # Service để gọi API
├── utils/            # Các utility function
├── App.js            # Component root
└── index.js          # Entry point
```

## API Backend

Ứng dụng sử dụng các API sau từ backend:

| Endpoint | Mô tả |
|----------|-------|
| `GET /api/drug/search?query=keyword` | Tìm kiếm thuốc theo tên |
| `GET /api/drug/:id` | Lấy thông tin chi tiết của thuốc |
| `GET /api/longchau/search?keyword=text` | Tìm kiếm sản phẩm Long Châu |
| `POST /api/gemini/ask` | Chat với AI về thuốc |
| `POST /api/detect/image` | Nhận diện thuốc từ ảnh |

## Công nghệ sử dụng

- **React**: Thư viện UI
- **Material-UI**: Component library
- **React Router**: Quản lý route
- **Axios**: Gọi API
- **React Markdown**: Hiển thị nội dung markdown
- **Remark GFM**: Hỗ trợ GitHub Flavored Markdown