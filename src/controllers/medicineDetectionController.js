const { analyzeMedicineImage, searchMedicineByImage } = require('../services/geminiService');

/**
 * Controller xử lý phân tích hình ảnh thuốc
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function detectMedicine(req, res) {
  try {
    // Kiểm tra nếu không có file hình ảnh
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vui lòng tải lên hình ảnh thuốc để phân tích' 
      });
    }

    // Lấy prompt từ request (nếu có)
    const prompt = req.body.prompt || "Nhận diện tất cả các loại thuốc trong hình ảnh và cung cấp thông tin chi tiết.";
    
    // Gọi service để phân tích hình ảnh
    const result = await analyzeMedicineImage(req.file.buffer, prompt);
    
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Lỗi khi nhận diện thuốc:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi nhận diện thuốc',
      error: error.message
    });
  }
}

/**
 * Controller xử lý tìm kiếm thuốc qua hình ảnh
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function searchMedicine(req, res) {
  try {
    // Kiểm tra nếu không có file hình ảnh
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vui lòng tải lên hình ảnh thuốc để tìm kiếm' 
      });
    }

    // Kiểm tra nếu không có truy vấn tìm kiếm
    if (!req.body.query) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp truy vấn tìm kiếm'
      });
    }

    // Gọi service để tìm kiếm
    const result = await searchMedicineByImage(req.file.buffer, req.body.query);
    
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Lỗi khi tìm kiếm thuốc:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi tìm kiếm thuốc',
      error: error.message
    });
  }
}

/**
 * Lưu kết quả phân tích vào database (nếu cần)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function saveDetectionResult(req, res) {
  try {
    // Triển khai logic lưu kết quả vào database ở đây
    // Mẫu code dưới đây cần được cập nhật tùy theo model của bạn
    
    /*
    const { medicineId, detectionResult } = req.body;
    
    if (!medicineId || !detectionResult) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin cần thiết'
      });
    }
    
    const newResult = new DetectionResult({
      medicineId,
      detectionResult,
      createdAt: new Date()
    });
    
    await newResult.save();
    */
    
    return res.status(200).json({
      success: true,
      message: 'Đã lưu kết quả phân tích thành công'
    });
  } catch (error) {
    console.error('Lỗi khi lưu kết quả phân tích:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lưu kết quả phân tích',
      error: error.message
    });
  }
}

module.exports = {
  detectMedicine,
  searchMedicine,
  saveDetectionResult
}; 