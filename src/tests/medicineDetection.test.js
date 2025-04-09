/**
 * Test cho API nhận diện thuốc sử dụng Gemini
 * Chạy test: npm test -- --testPathPattern=medicineDetection.test.js
 */

const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../app');

describe('Medicine Detection API', () => {
  // Test cho API nhận diện thuốc
  describe('POST /api/medicine-detection/detect', () => {
    it('Trả về lỗi nếu không có hình ảnh được gửi lên', async () => {
      const res = await request(app)
        .post('/api/medicine-detection/detect')
        .expect('Content-Type', /json/)
        .expect(400);
      
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Vui lòng tải lên hình ảnh thuốc');
    });

    it('Nhận diện thuốc thành công với hình ảnh hợp lệ', async () => {
      // Kiểm tra nếu tệp hình ảnh mẫu tồn tại
      const imagePath = path.join(__dirname, '../public/test-images/medicine-sample.jpg');
      if (!fs.existsSync(imagePath)) {
        console.warn('Không tìm thấy hình ảnh mẫu, bỏ qua test này');
        return;
      }

      const res = await request(app)
        .post('/api/medicine-detection/detect')
        .attach('image', imagePath)
        .expect('Content-Type', /json/);
      
      // Chỉ kiểm tra status code vì kết quả phân tích có thể khác nhau
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
    });
  });

  // Test cho API tìm kiếm thuốc
  describe('POST /api/medicine-detection/search', () => {
    it('Trả về lỗi nếu không có hình ảnh', async () => {
      const res = await request(app)
        .post('/api/medicine-detection/search')
        .field('query', 'Tìm thuốc paracetamol')
        .expect('Content-Type', /json/)
        .expect(400);
      
      expect(res.body.success).toBe(false);
    });

    it('Trả về lỗi nếu không có truy vấn tìm kiếm', async () => {
      // Kiểm tra nếu tệp hình ảnh mẫu tồn tại
      const imagePath = path.join(__dirname, '../public/test-images/medicine-sample.jpg');
      if (!fs.existsSync(imagePath)) {
        console.warn('Không tìm thấy hình ảnh mẫu, bỏ qua test này');
        return;
      }

      const res = await request(app)
        .post('/api/medicine-detection/search')
        .attach('image', imagePath)
        .expect('Content-Type', /json/)
        .expect(400);
      
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Vui lòng cung cấp truy vấn tìm kiếm');
    });
  });

  // Test trong môi trường thật không nên gọi API của Gemini quá nhiều
  // vì có thể vượt quá giới hạn và phát sinh chi phí
  it.skip('Tạo thư mục test-images nếu chưa tồn tại', () => {
    const testImagesDir = path.join(__dirname, '../public/test-images');
    if (!fs.existsSync(testImagesDir)) {
      fs.mkdirSync(testImagesDir, { recursive: true });
    }
    expect(fs.existsSync(testImagesDir)).toBe(true);
  });
}); 