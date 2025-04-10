const { spawn } = require('child_process');
const path = require('path');

// Port mặc định
const PORT = process.env.PYTHON_PORT || 8000;

// Đường dẫn đến app.py
const pythonScriptPath = path.join(__dirname, 'app.py');

console.log('=======================================');
console.log(`Khởi động Python ML server trên port ${PORT}...`);
console.log(`Script path: ${pythonScriptPath}`);
console.log('=======================================');

// Kiểm tra xem thư mục static có tồn tại không, nếu không thì tạo mới
const fs = require('fs');
const staticDir = path.join(__dirname, 'static');
if (!fs.existsSync(staticDir)) {
  console.log(`Tạo thư mục static: ${staticDir}`);
  fs.mkdirSync(staticDir, { recursive: true });
}

// Kiểm tra xem thư mục temp có tồn tại không, nếu không thì tạo mới
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  console.log(`Tạo thư mục temp: ${tempDir}`);
  fs.mkdirSync(tempDir, { recursive: true });
}

// Spawn Python process
const pythonProcess = spawn('python', [pythonScriptPath]);

// Đặt timeout để kiểm tra server đã khởi động thành công hay không
const serverStartTimeout = setTimeout(() => {
  console.log('Cảnh báo: Server không phản hồi sau 30 giây');
  console.log('Kiểm tra lại các dependencies và cấu hình');
}, 30000);

// Xử lý output
pythonProcess.stdout.on('data', (data) => {
  const output = data.toString().trim();
  console.log(`[Python] ${output}`);
  
  // Nếu nhìn thấy thông báo running, hủy timeout
  if (output.includes('Application startup complete') || output.includes('Uvicorn running')) {
    clearTimeout(serverStartTimeout);
    console.log('=======================================');
    console.log('ML Server đã khởi động thành công!');
    console.log('=======================================');
  }
});

// Xử lý lỗi
pythonProcess.stderr.on('data', (data) => {
  console.error(`[Python Error] ${data.toString().trim()}`);
});

// Xử lý khi đóng
pythonProcess.on('close', (code) => {
  clearTimeout(serverStartTimeout);
  if (code !== 0) {
    console.error(`Python process exited with code ${code}`);
    console.log('Thử kiểm tra lại các dependencies trong requirements.txt');
  }
  console.log('ML server đã đóng');
});

// Bắt sự kiện tắt để dọn dẹp
process.on('SIGINT', () => {
  console.log('Nhận tín hiệu SIGINT - Đóng Python server...');
  clearTimeout(serverStartTimeout);
  pythonProcess.kill('SIGINT');
  process.exit(0);
});

console.log('Server ML đang chạy. Nhấn Ctrl+C để dừng.'); 