const express = require('express');
const multer = require('multer');
const { detectMedicine, searchMedicine, saveDetectionResult, detectPills } = require('../controllers/medicineDetectionController');
const {authMiddleware} = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// Cấu hình multer để xử lý upload file
const storage = multer.memoryStorage();
const uploadMulter = multer({ 
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

/**
 * @route POST /api/medicine-detection/detect
 * @desc Phân tích hình ảnh thuốc
 * @access Public
 */
router.post('/detect', uploadMulter.single('image'), handleUploadError, detectMedicine);

/**
 * @route POST /api/medicine-detection/search
 * @desc Tìm kiếm thuốc qua hình ảnh
 * @access Public
 */
router.post('/search', uploadMulter.single('image'), handleUploadError, searchMedicine);

/**
 * @route POST /api/medicine-detection/detect-pills
 * @desc Phân tích hình ảnh viên thuốc sử dụng Python ML model
 * @access Public
 */
router.post('/detect-pills', uploadMulter.single('image'), handleUploadError, detectPills);

/**
 * @route POST /api/medicine-detection/save-result
 * @desc Lưu kết quả phân tích
 * @access Private (yêu cầu xác thực)
 */
router.post('/save-result', authMiddleware, saveDetectionResult);

module.exports = router; 