FROM node:16-alpine as build

WORKDIR /app

# Sao chép package.json và package-lock.json
COPY package*.json ./

# Cài đặt dependencies
RUN npm ci

# Sao chép tất cả các file còn lại
COPY . .

# Build ứng dụng
RUN npm run build

# Sử dụng Nginx để phục vụ frontend
FROM nginx:alpine

# Sao chép build từ stage trước
COPY --from=build /app/build /usr/share/nginx/html

# Sao chép cấu hình Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
