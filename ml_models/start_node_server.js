const { spawn, exec } = require('child_process');
const { createInterface } = require('readline');
const path = require('path');
const fs = require('fs');

// Constants
const PORT = process.env.PORT || 8000;
const PYTHON_PATH = process.env.PYTHON_PATH || 'python'; // Mặc định là 'python', có thể thay đổi bằng biến môi trường
const BASE_DIR = __dirname;
const APP_FILE = path.join(BASE_DIR, 'app.py');
const TEMP_DIR = path.join(BASE_DIR, 'temp');
const STATIC_DIR = path.join(BASE_DIR, 'static');

// Tạo các thư mục cần thiết
console.log('Đảm bảo các thư mục tồn tại...');
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
    console.log(`Đã tạo thư mục temp: ${TEMP_DIR}`);
}

if (!fs.existsSync(STATIC_DIR)) {
    fs.mkdirSync(STATIC_DIR, { recursive: true });
    console.log(`Đã tạo thư mục static: ${STATIC_DIR}`);
}

// Kiểm tra các file cần thiết
console.log('Kiểm tra các file cần thiết...');
const requiredFiles = [
    { path: APP_FILE, name: 'app.py' },
    { path: path.join(BASE_DIR, 'bestz.pt'), name: 'bestz.pt (YOLO model)' },
    { path: path.join(BASE_DIR, 'swin_b_pill_classifier_best_downloaded.pth'), name: 'swin_b_pill_classifier_best_downloaded.pth' },
    { path: path.join(BASE_DIR, 'knn_features_swin_b.npy'), name: 'knn_features_swin_b.npy' },
    { path: path.join(BASE_DIR, 'knn_labels_swin_b.npy'), name: 'knn_labels_swin_b.npy' },
    { path: path.join(BASE_DIR, 'class_to_idx_swin_b.json'), name: 'class_to_idx_swin_b.json' },
    { path: path.join(BASE_DIR, 'z.py'), name: 'z.py' },
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
    console.log('\n⚠️ Một số file cần thiết không tồn tại. Server có thể sẽ không chạy đúng.');
    console.log('Nhấn Enter để tiếp tục hoặc Ctrl+C để hủy.');
    
    const readline = createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    readline.question('', () => {
        readline.close();
        startServer();
    });
} else {
    console.log('\n✓ Tất cả file cần thiết đều tồn tại.');
    startServer();
}

// Kiểm tra Python dependencies
function checkPythonDependencies() {
    console.log('\nKiểm tra Python dependencies...');
    
    return new Promise((resolve, reject) => {
        const pip = spawn(PYTHON_PATH, ['-m', 'pip', 'install', '-r', 'requirements.txt']);
        
        pip.stdout.on('data', (data) => {
            console.log(`[pip] ${data.toString().trim()}`);
        });
        
        pip.stderr.on('data', (data) => {
            console.error(`[pip error] ${data.toString().trim()}`);
        });
        
        pip.on('close', (code) => {
            if (code === 0) {
                console.log('✓ Tất cả dependencies đã được cài đặt.');
                resolve();
            } else {
                console.error(`⚠️ Lỗi cài đặt dependencies. Mã lỗi: ${code}`);
                console.log('Nhấn Enter để tiếp tục khởi động server hoặc Ctrl+C để hủy.');
                
                const readline = createInterface({
                    input: process.stdin,
                    output: process.stdout
                });
                
                readline.question('', () => {
                    readline.close();
                    resolve();
                });
            }
        });
    });
}

// Khởi động server
async function startServer() {
    try {
        await checkPythonDependencies();
        
        console.log('\n=================================================================');
        console.log(`KHỞI ĐỘNG SERVER NHẬN DIỆN THUỐC TẠI CỔNG ${PORT}`);
        console.log('=================================================================');
        console.log(`Python path: ${PYTHON_PATH}`);
        console.log(`App file: ${APP_FILE}`);
        console.log('Đang khởi động server...');
        
        // Khởi động Python server
        const pythonProcess = spawn(PYTHON_PATH, [APP_FILE]);
        
        // Đặt timeout để kiểm tra server đã khởi động thành công hay chưa
        const startupTimeout = setTimeout(() => {
            console.log('\n⚠️ Cảnh báo: Server khởi động chậm. Vui lòng kiểm tra logs.');
        }, 15000);
        
        pythonProcess.stdout.on('data', (data) => {
            const output = data.toString().trim();
            console.log(`[Python] ${output}`);
            
            // Nếu server đã chạy, hiển thị thông tin và xóa timeout
            if (output.includes('Application startup complete') || output.includes('Uvicorn running')) {
                clearTimeout(startupTimeout);
                console.log('\n=================================================================');
                console.log(`SERVER ĐÃ CHẠY! UI có thể truy cập tại: http://localhost:${PORT}`);
                console.log(`API Endpoint: http://localhost:${PORT}/detect/`);
                console.log('=================================================================');
                console.log('Nhấn Ctrl+C để dừng server.');
                
                // Tự động mở trình duyệt sau khi server đã chạy (tùy chọn)
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
                console.log('1. Kiểm tra các dependencies trong requirements.txt đã cài đặt đầy đủ chưa');
                console.log('2. Kiểm tra các file model và data có tồn tại không');
                console.log('3. Kiểm tra Python version (khuyến nghị Python 3.8+)');
            }
            console.log('\nServer đã dừng.');
        });
        
        // Xử lý sự kiện tắt
        process.on('SIGINT', () => {
            console.log('\nĐang dừng server...');
            clearTimeout(startupTimeout);
            pythonProcess.kill('SIGINT');
            process.exit(0);
        });
    } catch (error) {
        console.error('Lỗi khởi động server:', error);
    }
} 