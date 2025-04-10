const { spawn } = require('child_process');
const path = require('path');

// Port mặc định
const PORT = process.env.PYTHON_PORT || 8000;

// Đường dẫn đến app.py
const pythonScriptPath = path.join(__dirname, 'app.py');

console.log(`Khởi động Python ML server trên port ${PORT}...`);
console.log(`Script path: ${pythonScriptPath}`);

// Spawn Python process
const pythonProcess = spawn('python', [pythonScriptPath]);

// Xử lý output
pythonProcess.stdout.on('data', (data) => {
  console.log(`[Python] ${data.toString().trim()}`);
});

// Xử lý lỗi
pythonProcess.stderr.on('data', (data) => {
  console.error(`[Python Error] ${data.toString().trim()}`);
});

// Xử lý khi đóng
pythonProcess.on('close', (code) => {
  if (code !== 0) {
    console.error(`Python process exited with code ${code}`);
  }
  console.log('ML server đã đóng');
});

// Bắt sự kiện tắt để dọn dẹp
process.on('SIGINT', () => {
  console.log('Nhận tín hiệu SIGINT - Đóng Python server...');
  pythonProcess.kill('SIGINT');
  process.exit(0);
});

console.log('Server ML đang chạy. Nhấn Ctrl+C để dừng.'); 