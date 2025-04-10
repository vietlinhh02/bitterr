const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

// URL của endpoint detect
const PYTHON_ENDPOINT = 'http://localhost:8000/detect/';

async function testDetectEndpoint() {
  console.log(`Kiểm tra endpoint ${PYTHON_ENDPOINT} với hình ảnh mẫu...`);
  
  try {
    // Tìm một hình ảnh mẫu trong thư mục static nếu có
    const staticDir = path.join(__dirname, 'static');
    let testImagePath = null;
    
    if (fs.existsSync(staticDir)) {
      const files = fs.readdirSync(staticDir);
      // Tìm file hình ảnh đầu tiên
      const imageFile = files.find(file => /\.(jpg|jpeg|png)$/i.test(file));
      if (imageFile) {
        testImagePath = path.join(staticDir, imageFile);
      }
    }
    
    if (!testImagePath) {
      console.log('Không tìm thấy hình ảnh mẫu trong thư mục static.');
      console.log('Tạo hình ảnh mẫu đơn giản...');
      
      // Tạo một hình ảnh mẫu đơn giản (1x1 pixel)
      testImagePath = path.join(__dirname, 'temp', 'test_image.jpg');
      fs.writeFileSync(testImagePath, Buffer.from([
        0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 
        0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 
        0x00, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 
        0xff, 0xff, 0xff, 0xff, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01, 0x00, 
        0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x14, 0x00, 0x01, 0x00, 
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
        0x00, 0x00, 0x00, 0xff, 0xc4, 0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
        0x00, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f, 0x00, 0x7f, 
        0xff, 0xd9
      ]));
    }
    
    console.log(`Sử dụng hình ảnh mẫu: ${testImagePath}`);
    
    // Tạo form data
    const formData = new FormData();
    formData.append('image', fs.createReadStream(testImagePath));
    
    // Gửi request POST với hình ảnh
    const response = await axios.post(PYTHON_ENDPOINT, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      timeout: 30000, // 30 giây timeout
    });
    
    console.log('Yêu cầu thành công!');
    console.log('Status code:', response.status);
    console.log('Số lượng phát hiện:', response.data.detections ? response.data.detections.length : 0);
    
    if (response.data.image_path) {
      console.log('Đường dẫn ảnh kết quả:', response.data.image_path);
    }
    
    return true;
  } catch (error) {
    console.error('Lỗi khi test endpoint /detect/:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('Không nhận được phản hồi từ server.');
    } else {
      console.error('Lỗi:', error.message);
    }
    
    return false;
  }
}

// Chạy kiểm tra
testDetectEndpoint(); 