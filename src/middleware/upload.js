const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Đảm bảo thư mục uploads tồn tại
const uploadDir = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Danh sách các định dạng tệp an toàn
const ALLOWED_FORMATS = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

// Cấu hình storage cho multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Thư mục lưu trữ avatar với đường dẫn tuyệt đối
  },
  filename: function (req, file, cb) {
    // Tạo tên file ngẫu nhiên để tránh tấn công đoán tên tệp
    const randomString = crypto.randomBytes(16).toString('hex');
    const fileExtension = path.extname(file.originalname);
    // Loại bỏ các ký tự đặc biệt từ tên tệp để tránh command injection
    const safeName = `avatar-${randomString}${fileExtension}`.replace(/[^a-zA-Z0-9.-]/g, '');
    cb(null, safeName);
  }
});

// Kiểm tra loại file và các điều kiện bảo mật
const fileFilter = (req, file, cb) => {
  // Kiểm tra định dạng tệp
  if (!ALLOWED_FORMATS.includes(file.mimetype)) {
    return cb(new Error('Định dạng tệp không được hỗ trợ. Chỉ chấp nhận JPEG, PNG, WEBP.'), false);
  }

  // Kiểm tra đuôi tệp
  const ext = path.extname(file.originalname).toLowerCase();
  if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
    return cb(new Error('Chỉ chấp nhận các file có đuôi .jpg, .jpeg, .png, .webp'), false);
  }

  // Các kiểm tra thành công
  cb(null, true);
};

// Middleware xử lý lỗi upload
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: `Kích thước tệp quá lớn. Giới hạn: ${MAX_FILE_SIZE / (1024 * 1024)}MB`
      });
    }
    return res.status(400).json({
      success: false,
      message: `Lỗi tải lên: ${err.message}`
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  next();
};

// Khởi tạo middleware multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE
  }
});

module.exports = { upload, handleUploadError }; 