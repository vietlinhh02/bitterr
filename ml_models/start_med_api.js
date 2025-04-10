const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Constants
const PORT = process.env.PORT || 8001; // Sử dụng cổng 8001 để không xung đột với API nhận diện thuốc
const PYTHON_PATH = process.env.PYTHON_PATH || 'python';
const BASE_DIR = __dirname;
const API_FILE = path.join(BASE_DIR, 'med_api.py');
const CSV_FILE = path.join(BASE_DIR, 'pres_df.csv');
const CLASS_MAP_FILE = path.join(BASE_DIR, 'class_to_idx_swin_b.json');

// Kiểm tra các file cần thiết
console.log('Kiểm tra các file cần thiết...');
const requiredFiles = [
    { path: API_FILE, name: 'med_api.py' },
    { path: path.join(BASE_DIR, 'medication_compare.py'), name: 'medication_compare.py' },
    { path: CSV_FILE, name: 'pres_df.csv' },
    { path: CLASS_MAP_FILE, name: 'class_to_idx_swin_b.json' }
];

let allFilesExist = true;
for (const file of requiredFiles) {
    if (!fs.existsSync(file.path)) {
        console.log(`CẢNH BÁO: Không tìm thấy file ${file.name} tại ${file.path}`);
        allFilesExist = false;
    } else {
        console.log(`✓ Đã tìm thấy ${file.name}`);
    }
}

if (!allFilesExist) {
    console.log('\n⚠️ Một số file cần thiết không tồn tại. API có thể sẽ không chạy đúng.');
    console.log('Nhấn Ctrl+C để hủy hoặc tiếp tục để thử khởi động API.');
}

// Kiểm tra thư viện pandas
console.log('\nKiểm tra các thư viện Python cần thiết...');
const checkPandas = spawn(PYTHON_PATH, ['-c', 'import pandas']);

checkPandas.stderr.on('data', (data) => {
    console.error(`Lỗi: ${data.toString().trim()}`);
    console.log('Đang cài đặt pandas...');
    
    const installPandas = spawn(PYTHON_PATH, ['-m', 'pip', 'install', 'pandas']);
    
    installPandas.stdout.on('data', (data) => {
        console.log(`[pip] ${data.toString().trim()}`);
    });
    
    installPandas.stderr.on('data', (data) => {
        console.error(`[pip error] ${data.toString().trim()}`);
    });
    
    installPandas.on('close', (code) => {
        if (code === 0) {
            console.log('✓ pandas đã được cài đặt thành công.');
            startAPI();
        } else {
            console.error(`⚠️ Không thể cài đặt pandas. Mã lỗi: ${code}`);
            console.log('API có thể sẽ không chạy đúng.');
            startAPI();
        }
    });
});

checkPandas.on('close', (code) => {
    if (code === 0) {
        console.log('✓ pandas đã được cài đặt.');
        startAPI();
    }
});

// Khởi động API
function startAPI() {
    console.log('\n=================================================================');
    console.log(`KHỞI ĐỘNG API SO SÁNH THUỐC TẠI CỔNG ${PORT}`);
    console.log('=================================================================');
    console.log(`Python path: ${PYTHON_PATH}`);
    console.log(`API file: ${API_FILE}`);
    console.log('Đang khởi động API...');
    
    // Khởi động Python server
    const pythonProcess = spawn(PYTHON_PATH, [API_FILE]);
    
    // Đặt timeout để kiểm tra server đã khởi động thành công hay chưa
    const startupTimeout = setTimeout(() => {
        console.log('\n⚠️ Cảnh báo: API khởi động chậm. Vui lòng kiểm tra logs.');
    }, 10000);
    
    pythonProcess.stdout.on('data', (data) => {
        const output = data.toString().trim();
        console.log(`[Python] ${output}`);
        
        // Nếu server đã chạy, hiển thị thông tin và xóa timeout
        if (output.includes('Application startup complete') || output.includes('Uvicorn running')) {
            clearTimeout(startupTimeout);
            console.log('\n=================================================================');
            console.log(`API ĐÃ CHẠY! Truy cập tại: http://localhost:${PORT}`);
            console.log('=================================================================');
            console.log('Nhấn Ctrl+C để dừng API.');
            
            // Tự động mở trình duyệt sau khi server đã chạy
            if (process.platform === 'win32') {
                exec(`start http://localhost:${PORT}`);
            } else if (process.platform === 'darwin') {
                exec(`open http://localhost:${PORT}`);
            } else {
                exec(`xdg-open http://localhost:${PORT}`);
            }
        }
    });
    
    pythonProcess.stderr.on('data', (data) => {
        console.error(`[Python Error] ${data.toString().trim()}`);
    });
    
    pythonProcess.on('close', (code) => {
        clearTimeout(startupTimeout);
        if (code !== 0) {
            console.error(`\n❌ Python process exited with code ${code}`);
            console.log('Gợi ý khắc phục:');
            console.log('1. Kiểm tra pandas đã được cài đặt');
            console.log('2. Kiểm tra các file dữ liệu cần thiết');
        }
        console.log('\nAPI đã dừng.');
    });
    
    // Xử lý sự kiện tắt
    process.on('SIGINT', () => {
        console.log('\nĐang dừng API...');
        clearTimeout(startupTimeout);
        pythonProcess.kill('SIGINT');
        process.exit(0);
    });
} 