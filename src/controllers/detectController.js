const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const FormData = require('form-data');
require('dotenv').config();
const drugController = require('./drugController');
const geminiService = require('../services/geminiService');
const ocrSpaceService = require('../services/ocrSpaceService');
const multer = require('multer');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const PYTHON_SERVER_URL = 'http://localhost:5001';

// Cấu hình multer để lưu file tạm
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // Giới hạn 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Chỉ hỗ trợ file PNG, JPG và JPEG'), false);
    }
    cb(null, true);
  }
}).single('image');

async function searchLongChauProducts(keyword) {
    try {
        const response = await axios.get(
            `https://api.nhathuoclongchau.com.vn/lccus/search-product-service/api/products/ecom/product/suggest?keyword=${encodeURIComponent(keyword)}`,
            {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            }
        );

        // Kiểm tra và chuyển đổi dữ liệu từ API mới
        if (response.data && response.data.result) {
            return {
                data: response.data.result.map(item => ({
                    name: item.name,
                    price: item.price,
                    manufacturer: item.manufacturer,
                    url: `https://nhathuoclongchau.com.vn/san-pham/${item.slug}`,
                    image: item.images && item.images[0],
                    description: item.shortDescription
                }))
            };
        }
        return null;
    } catch (error) {
        console.error('Lỗi khi tìm kiếm trên Long Châu:', error);
        return null;
    }
}

/**
 * Xử lý tải lên ảnh và phát hiện tên thuốc
 */
async function detectDrugNames(req, res) {
  try {
    // Sử dụng middleware upload để xử lý file
    upload(req, res, async (err) => {
      if (err) {
        // Xử lý lỗi từ multer
        return res.status(400).json({
          success: false,
          message: `Lỗi khi tải lên file: ${err.message}`
        });
      }

      // Kiểm tra xem có file được tải lên không
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Không tìm thấy file ảnh'
        });
      }

      try {
        // Phân tích ảnh bằng Gemini Vision
        const result = await analyzeImageWithGemini(req.file.buffer);

        return res.status(200).json({
          success: true,
          data: result
        });
      } catch (error) {
        console.error('Lỗi khi detect ảnh:', error);
        return res.status(500).json({
          success: false,
          message: `Lỗi khi phân tích ảnh: ${error.message}`
        });
      }
    });
  } catch (error) {
    console.error('Lỗi server:', error);
    return res.status(500).json({
      success: false,
      message: `Lỗi server: ${error.message}`
    });
  }
}

/**
 * Sử dụng Gemini Vision để phân tích ảnh và trích xuất thông tin thuốc
 * @param {Buffer} imageBuffer - Buffer chứa dữ liệu ảnh
 * @returns {Promise<Object>} - Kết quả phân tích từ Gemini
 */
async function analyzeImageWithGemini(imageBuffer) {
  try {
    console.log('Đang phân tích ảnh với Gemini Vision...');

    // Chuyển đổi buffer thành định dạng base64 để gửi đến Gemini
    const imageBase64 = imageBuffer.toString('base64');

    // Khởi tạo model Gemini Vision
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    // Tạo prompt chi tiết để hướng dẫn Gemini
    const prompt = `
    Hãy phân tích hình ảnh sản phẩm thuốc này và cung cấp các thông tin sau:

    1. Tên sản phẩm thuốc
    2. Thành phần hoạt chất chính
    3. Công dụng/chỉ định điều trị
    4. Liều lượng khuyến cáo (nếu có thể nhìn thấy)
    5. Nhà sản xuất
    6. Các lưu ý quan trọng về thuốc (nếu có)

    Hãy chỉ trả về thông tin dưới dạng JSON theo cấu trúc sau:
    {
      "drugName": "Tên sản phẩm thuốc",
      "activeIngredient": "Thành phần hoạt chất chính",
      "indications": "Công dụng/chỉ định điều trị",
      "dosage": "Liều lượng khuyến cáo",
      "manufacturer": "Nhà sản xuất",
      "warnings": "Các lưu ý quan trọng",
      "confidence": <mức độ tin cậy từ 0-100>
    }
    
    Nếu không thể xác định chính xác bất kỳ trường thông tin nào, hãy điền "Không xác định" vào trường đó.
    Đối với trường confidence, hãy ước tính mức độ tin cậy của việc nhận dạng từ 0-100%.
    `;

    // Chuẩn bị yêu cầu cho Gemini Vision
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBase64
        }
      }
    ]);

    // Lấy phản hồi từ Gemini
    const response = result.response;
    const responseText = response.text();
    
    // Trích xuất JSON từ phản hồi
    try {
      // Trích xuất chuỗi JSON từ phản hồi
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Không thể trích xuất JSON từ phản hồi Gemini');
      }
      
      const jsonText = jsonMatch[0];
      const drugInfo = JSON.parse(jsonText);
      
      console.log('Gemini đã phân tích thành công:', drugInfo.drugName);
      return {
        ...drugInfo,
        rawText: responseText
      };
    } catch (jsonError) {
      console.error('Lỗi khi xử lý phản hồi JSON từ Gemini:', jsonError);
      return {
        drugName: 'Không xác định',
        activeIngredient: 'Không xác định',
        indications: 'Không xác định',
        dosage: 'Không xác định',
        manufacturer: 'Không xác định',
        warnings: 'Không xác định',
        confidence: 0,
        error: jsonError.message,
        rawText: responseText
      };
    }
  } catch (error) {
    console.error('Lỗi khi gọi Gemini Vision API:', error);
    throw new Error(`Không thể phân tích ảnh: ${error.message}`);
  }
}

// Hàm hỏi Gemini về văn bản đã phát hiện
const askGeminiDirectly = async (ocrText, question, originalRes) => { 
    try {
        if (!question) {
          return originalRes.status(400).json({message: "Missing user question"})
        }
        const answer = await geminiService.askGeminiWithOCRText(ocrText, question);

        originalRes.setHeader('Content-Type', 'text/plain; charset=utf-8');
        originalRes.setHeader('Transfer-Encoding', 'chunked');
        originalRes.write(answer);
        originalRes.end();

    } catch (error) {
        console.error("Error asking Gemini directly:", error);
        originalRes.status(500).json({ message: 'Error communicating with Gemini' });
    }
};

module.exports = { detectDrugNames, askGeminiDirectly };