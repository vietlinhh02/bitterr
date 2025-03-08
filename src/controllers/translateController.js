const { Translate } = require('@google-cloud/translate').v2;
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

// Khởi tạo Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Danh sách ngôn ngữ hỗ trợ
const supportedLanguages = ['vi', 'en', 'fr', 'de', 'es', 'zh', 'ja', 'ko', 'ru', 'th'];

/**
 * Dịch văn bản sử dụng Gemini API
 * @param {string} text - Văn bản cần dịch
 * @param {string} targetLanguage - Mã ngôn ngữ đích
 * @returns {Promise<string>} - Văn bản đã dịch
 */
async function translateWithGemini(text, targetLanguage) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    
    // Xác định tên ngôn ngữ đầy đủ
    const languageNames = {
      'vi': 'Vietnamese',
      'en': 'English',
      'fr': 'French',
      'de': 'German',
      'es': 'Spanish',
      'zh': 'Chinese',
      'ja': 'Japanese',
      'ko': 'Korean',
      'ru': 'Russian',
      'th': 'Thai'
    };
    
    const targetLanguageName = languageNames[targetLanguage] || targetLanguage;
    
    const prompt = `Translate the following text to ${targetLanguageName}. 
    Only return the translated text without any additional explanation or notes.
    
    Text to translate:
    ${text}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translatedText = response.text();
    
    return translatedText.trim();
  } catch (error) {
    console.error('Error translating with Gemini:', error);
    throw new Error('Translation service error');
  }
}

/**
 * Controller để dịch văn bản
 */
const translateText = async (req, res) => {
  try {
    const { content, targetLanguage } = req.body;
    
    // Kiểm tra dữ liệu đầu vào
    if (!content) {
      return res.status(400).json({ message: 'Thiếu nội dung cần dịch' });
    }
    
    if (!targetLanguage) {
      return res.status(400).json({ message: 'Thiếu ngôn ngữ đích' });
    }
    
    // Kiểm tra ngôn ngữ đích có được hỗ trợ không
    if (!supportedLanguages.includes(targetLanguage)) {
      return res.status(400).json({ 
        message: 'Ngôn ngữ không được hỗ trợ',
        supportedLanguages
      });
    }
    
    // Dịch văn bản
    const translatedText = await translateWithGemini(content, targetLanguage);
    
    // Trả về kết quả
    res.json({
      translatedText,
      sourceLanguage: 'auto', // Tự động phát hiện ngôn ngữ nguồn
      targetLanguage
    });
    
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ message: 'Lỗi dịch thuật', error: error.message });
  }
};

module.exports = {
  translateText
}; 