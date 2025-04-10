const axios = require('axios');

// URL của Python server
const PYTHON_SERVER_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

async function checkServerStatus() {
  console.log(`Kiểm tra kết nối đến Python server tại ${PYTHON_SERVER_URL}...`);
  
  try {
    // Gửi yêu cầu GET đến root endpoint
    const response = await axios.get(PYTHON_SERVER_URL, {
      timeout: 5000 // 5 giây timeout
    });
    
    console.log('Kết nối thành công!');
    console.log('Status code:', response.status);
    console.log('Response:', response.data ? 'Có dữ liệu phản hồi' : 'Không có dữ liệu phản hồi');
    
    return true;
  } catch (error) {
    console.error('Không thể kết nối đến Python server:');
    
    if (error.response) {
      // Server trả lại response với status code không phải 2xx
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      // Yêu cầu được gửi nhưng không nhận được response
      console.error('Không nhận được phản hồi từ server.');
      console.error('Kiểm tra xem Python server đã được khởi động chưa?');
    } else {
      // Có lỗi khi thiết lập yêu cầu
      console.error('Lỗi:', error.message);
    }
    
    return false;
  }
}

// Chạy kiểm tra
checkServerStatus().then(isRunning => {
  if (!isRunning) {
    console.log('\nCác bước khắc phục:');
    console.log('1. Chạy "node start_server.js" để khởi động Python server');
    console.log('2. Kiểm tra logs để tìm lỗi trong Python server');
    console.log('3. Kiểm tra cài đặt dependencies trong requirements.txt');
    console.log('4. Kiểm tra port 8000 đã được sử dụng bởi ứng dụng khác chưa');
  }
}); 