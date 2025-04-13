const express = require('express');
const multer = require('multer');
const { detectMedicine, searchMedicine, saveDetectionResult, detectPills } = require('../controllers/medicineDetectionController');

const router = express.Router();

// Cấu hình multer để xử lý upload file
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Giới hạn kích thước file 10MB
  },
  fileFilter: (req, file, cb) => {
    // Chỉ chấp nhận các file hình ảnh
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file hình ảnh'), false);
    }
  }
});

// Route phân tích hình ảnh thuốc
router.post('/detect', upload.single('image'), detectMedicine);

// Route tìm kiếm thuốc qua hình ảnh
router.post('/search', upload.single('image'), searchMedicine);

/**
 * @route POST /api/medicine-detection/detect-pills
 * @desc Phân tích hình ảnh viên thuốc sử dụng Python ML model
 * @access Public
 */
router.post('/detect-pills', upload.single('image'), detectPills);

// Route lưu kết quả phân tích (không yêu cầu xác thực vì sẽ xác thực trong controller)
router.post('/save-result', saveDetectionResult);

module.exports = router; 