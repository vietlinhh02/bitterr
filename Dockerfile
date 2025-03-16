FROM node:16-alpine

WORKDIR /app

# Sao chép package.json và package-lock.json
COPY package*.json ./

# Cài đặt dependencies
RUN npm ci --only=production

# Sao chép tất cả các file còn lại
COPY . .

# Mở cổng cho ứng dụng
EXPOSE 5000

# Chạy ứng dụng
CMD ["node", "src/server.js"]
