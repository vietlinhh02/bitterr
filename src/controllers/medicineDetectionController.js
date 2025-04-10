const { analyzeMedicineImage, searchMedicineByImage } = require('../services/geminiService');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

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
 * Controller xử lý phân tích hình ảnh viên thuốc qua Python ML model
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function detectPills(req, res) {
  try {
    // Kiểm tra nếu không có file hình ảnh
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vui lòng tải lên hình ảnh viên thuốc để phân tích' 
      });
    }

    // Lưu tạm ảnh vào thư mục temp
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      console.log('Tạo thư mục temp tại:', tempDir);
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Kiểm tra quyền ghi vào thư mục temp
    try {
      const testFile = path.join(tempDir, 'test_write_perm.txt');
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      console.log('Thư mục temp có quyền ghi');
    } catch (err) {
      console.error('Không có quyền ghi vào thư mục temp:', err);
      return res.status(500).json({
        success: false,
        message: 'Lỗi quyền hệ thống: không thể lưu file tạm',
        error: err.message
      });
    }
    
    const tempFilePath = path.join(tempDir, `${Date.now()}_${req.file.originalname || 'upload.jpg'}`);
    fs.writeFileSync(tempFilePath, req.file.buffer);

    console.log('Đã lưu ảnh tạm tại:', tempFilePath);

    // Tạo form data để gửi đến Python service
    const formData = new FormData();
    formData.append('image', fs.createReadStream(tempFilePath));

    // Gọi API của Python model
    // Sửa lại đường dẫn từ biến môi trường hoặc địa chỉ mặc định với đường dẫn chính xác
    const pythonServerUrl = process.env.PYTHON_API_URL || 'http://localhost:8000';
    const pythonApiUrl = `${pythonServerUrl}/detect/`;
    
    console.log('Gửi yêu cầu đến Python API:', pythonApiUrl);
    
    try {
      const pythonResponse = await axios.post(pythonApiUrl, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 30000, // 30 giây timeout
      });

      console.log('Nhận phản hồi từ Python API:', pythonResponse.status);

      // Xóa file tạm sau khi xử lý
      fs.unlinkSync(tempFilePath);

      // Xử lý kết quả từ Python model
      const detectionResults = pythonResponse.data;
      
      // Chuyển đổi đường dẫn ảnh thành base64 nếu có
      if (detectionResults.image_path) {
        try {
          // Lấy ảnh đã xử lý từ Python server
          const imageUrl = `${pythonServerUrl}${detectionResults.image_path}`;
          console.log('Lấy ảnh đã xử lý từ:', imageUrl);
          
          const imageResponse = await axios.get(imageUrl, {
            responseType: 'arraybuffer'
          });
          
          // Chuyển đổi thành base64
          const imageBase64 = Buffer.from(imageResponse.data).toString('base64');
          detectionResults.image_base64 = `data:image/jpeg;base64,${imageBase64}`;
          
          // Xóa đường dẫn gốc vì không cần thiết cho client
          delete detectionResults.image_path;
        } catch (imageError) {
          console.error('Lỗi khi lấy ảnh đã xử lý:', imageError);
          // Nếu có lỗi khi lấy ảnh, vẫn gửi kết quả nhưng không có ảnh
        }
      }
      
      return res.status(200).json({
        success: true,
        data: detectionResults
      });
    } catch (axiosError) {
      console.error('Lỗi khi gọi Python API:', axiosError.message);
      console.error('URL gọi API:', pythonApiUrl);
      
      if (axiosError.response) {
        console.error('Python API phản hồi với status:', axiosError.response.status);
        console.error('Python API phản hồi data:', axiosError.response.data);
      } else if (axiosError.request) {
        console.error('Không nhận được phản hồi từ Python API, kiểm tra server Python có đang chạy không');
        console.error('Chi tiết request:', axiosError.request._currentUrl);
      } else {
        console.error('Lỗi cấu hình request:', axiosError.message);
      }
      
      // Xóa file tạm nếu có lỗi
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi kết nối với dịch vụ nhận diện thuốc',
        error: axiosError.message
      });
    }
  } catch (error) {
    console.error('Lỗi khi nhận diện viên thuốc:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi nhận diện viên thuốc',
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
  saveDetectionResult,
  detectPills
}; 