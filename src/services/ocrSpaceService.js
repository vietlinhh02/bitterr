const fs = require('fs-extra');
const path = require('path');
const { ocrSpace } = require('ocr-space-api-wrapper');
require('dotenv').config();

/**
 * Service xử lý OCR sử dụng OCR.space API
 * Thay thế cho giải pháp OCR tự triển khai trước đây
 */

// OCR Space API Key
const OCR_SPACE_API_KEY = process.env.OCR_SPACE_API_KEY || 'K81626103188957'; // Sử dụng API key dự phòng nếu không có trong .env

// Tạo thư mục tạm
const TEMP_DIR = path.join(__dirname, '..', '..', 'temp');
fs.ensureDirSync(TEMP_DIR);

/**
 * Phân tích văn bản từ hình ảnh sử dụng OCR.space API
 * @param {Buffer} imageBuffer - Buffer chứa dữ liệu hình ảnh
 * @param {Object} options - Tùy chọn cho API
 * @param {boolean} options.isOverlayRequired - Lấy thông tin về vị trí và bounding box
 * @param {string} options.language - Ngôn ngữ sử dụng (vie, eng, etc.)
 * @param {boolean} options.detectOrientation - Tự động phát hiện hướng của ảnh
 * @returns {Promise<Object>} - Kết quả OCR đã xử lý
 */
async function recognizeText(imageBuffer, options = {}) {
  try {
    console.log('Đang thực hiện OCR với OCR.space...');
    
    // Tạo tên file duy nhất
    const tempFilePath = path.join(TEMP_DIR, `temp_${Date.now()}.jpg`);
    
    // Lưu buffer vào file
    await fs.writeFile(tempFilePath, imageBuffer);
    
    // Cấu hình mặc định
    const defaultOptions = {
      apiKey: OCR_SPACE_API_KEY,
      language: 'auto', // Tự động phát hiện ngôn ngữ
      detectOrientation: true,
      scale: true,
      OCREngine: 2, // Engine 2 cho độ chính xác cao hơn
      isOverlayRequired: true
    };

    const mergedOptions = { ...defaultOptions, ...options };

    // Gọi API OCR.space sử dụng ocrSpace từ thư viện
    const result = await ocrSpace(tempFilePath, mergedOptions);
    
    // Xóa file tạm sau khi hoàn thành
    await fs.remove(tempFilePath).catch(() => {});

    // Xử lý và chuẩn hóa kết quả
    return processOcrResults(result);
  } catch (error) {
    console.error('Lỗi khi thực hiện OCR với OCR.space:', error);
    throw new Error(`Không thể thực hiện OCR: ${error.message}`);
  }
}

/**
 * Phân tích văn bản từ URL hình ảnh sử dụng OCR.space API
 * @param {string} imageUrl - URL của hình ảnh cần OCR
 * @param {Object} options - Tùy chọn cho API
 * @returns {Promise<string>} - Văn bản đã nhận diện
 */
async function recognizeTextFromUrl(imageUrl, options = {}) {
  try {
    console.log('Bắt đầu xử lý OCR cho URL:', imageUrl);
    
    // Cấu hình mặc định
    const defaultOptions = {
      apiKey: OCR_SPACE_API_KEY,
      language: 'vie',
      detectOrientation: true,
      scale: true,
      OCREngine: 2,
      isOverlayRequired: true
    };

    const mergedOptions = { ...defaultOptions, ...options };
    
    // Gọi API OCR.space với URL trực tiếp
    const result = await ocrSpace(imageUrl, mergedOptions);

    if (result && result.ParsedResults && result.ParsedResults.length > 0) {
      console.log('OCR thành công');
      return result.ParsedResults[0].ParsedText;
    } else {
      throw new Error('Không có kết quả OCR');
    }
  } catch (error) {
    console.error('Lỗi khi thực hiện OCR từ URL:', error.message);
    throw error;
  }
}

/**
 * Xử lý kết quả từ OCR.space thành định dạng phù hợp
 * @param {Object} ocrResponse - Phản hồi từ OCR.space API
 * @returns {Object} - Kết quả đã xử lý
 */
function processOcrResults(ocrResponse) {
  try {
    // Phân tích kết quả
    const parsedResults = ocrResponse.ParsedResults || [];
    
    if (parsedResults.length === 0) {
      return {
        success: true,
        message: 'Không tìm thấy văn bản trong ảnh',
        detectedText: '',
        results: []
      };
    }

    // Lấy văn bản đã nhận diện
    const detectedText = parsedResults.map(result => result.ParsedText).join(' ');
    
    // Xử lý overlay (bounding box) nếu có
    const results = [];
    parsedResults.forEach(result => {
      if (result.TextOverlay && result.TextOverlay.Lines) {
        result.TextOverlay.Lines.forEach(line => {
          line.Words.forEach(word => {
            results.push({
              text: word.WordText,
              bbox: [
                word.Left, 
                word.Top, 
                word.Left + word.Width, 
                word.Top + word.Height
              ],
              confidence: parseFloat(word.WordConfidence || 0)
            });
          });
        });
      }
    });

    return {
      success: true,
      message: 'Nhận diện văn bản thành công',
      detectedText,
      results
    };
  } catch (error) {
    console.error('Lỗi khi xử lý kết quả OCR:', error);
    return {
      success: false,
      message: 'Lỗi khi xử lý kết quả OCR',
      error: error.message
    };
  }
}

module.exports = {
  recognizeText,
  recognizeTextFromUrl
};