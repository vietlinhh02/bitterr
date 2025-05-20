const geminiService = require('../services/geminiService');
const ChatHistory = require('../models/ChatHistory');

// Hàm loại bỏ tất cả thẻ HTML từ chuỗi
const stripHtml = (html) => {
  if (!html || typeof html !== 'string') return '';
  
  // Loại bỏ tất cả các thẻ HTML
  let text = html.replace(/<[^>]*>/g, '');
  
  // Xử lý các thực thể HTML phổ biến
  text = text.replace(/&nbsp;/g, ' ')
             .replace(/&amp;/g, '&')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&quot;/g, '"')
             .replace(/&#39;/g, "'");
  
  // Loại bỏ nhiều khoảng trắng liên tiếp và trim
  return text.replace(/\s+/g, ' ').trim();
};

// Hàm để xử lý tất cả các trường trong đối tượng, loại bỏ HTML nếu là chuỗi
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  
  const result = { ...obj };
  
  // Xử lý từng trường trong đối tượng
  Object.keys(result).forEach(key => {
    if (typeof result[key] === 'string') {
      // Nếu tên trường có chứa "Html", hoặc chứa nội dung HTML
      if (key.includes('Html') || result[key].includes('<')) {
        result[key] = stripHtml(result[key]);
      }
    } else if (typeof result[key] === 'object' && result[key] !== null) {
      // Đệ quy xử lý các đối tượng con
      result[key] = sanitizeObject(result[key]);
    }
  });
  
  return result;
};

const askAboutDrug = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    
    // Lấy API key của người dùng nếu có
    const userApiKey = req.body.userApiKey || null;
    
    // Kiểm tra cấu trúc dữ liệu để xác định nguồn gốc
    if (req.body.drugInfo) {
      // Trường hợp trực tiếp từ trang chi tiết
      const { drugInfo, question, createHistory } = req.body;
      
      // Làm sạch dữ liệu, loại bỏ các thẻ HTML
      const sanitizedDrugInfo = sanitizeObject(drugInfo);
      const drugQuery = sanitizedDrugInfo.generic_name || sanitizedDrugInfo.name || sanitizedDrugInfo.brand_name || 'Không có tên';
      
      // Thay đổi cách tạo productInfo để giữ lại toàn bộ thông tin thuốc
      const productInfo = {
        // Các trường thông tin cơ bản được lấy từ drugInfo
        name: sanitizedDrugInfo.name || sanitizedDrugInfo.generic_name || sanitizedDrugInfo.brand_name || 'Không có tên',
        description: sanitizedDrugInfo.description || 
                    (sanitizedDrugInfo.details?.description) || 
                    sanitizedDrugInfo.indications_and_usage || 
                    'Không có thông tin',
        ingredients: sanitizedDrugInfo.ingredients || 
                    sanitizedDrugInfo.active_ingredient || 
                    (sanitizedDrugInfo.details?.ingredients) || 
                    'Không có thông tin',
        usage: sanitizedDrugInfo.usage || 
              (sanitizedDrugInfo.details?.indications) || 
              sanitizedDrugInfo.indications_and_usage || 
              'Không có thông tin',
        dosage: sanitizedDrugInfo.dosage || 
                (sanitizedDrugInfo.details?.dosage) || 
                sanitizedDrugInfo.dosage_and_administration || 
                'Không có thông tin',
        adverseEffect: sanitizedDrugInfo.adverseEffect || 
                      (sanitizedDrugInfo.details?.side_effects) || 
                      sanitizedDrugInfo.adverse_reactions || 
                      'Không có thông tin',
        careful: sanitizedDrugInfo.careful || 
                sanitizedDrugInfo.warnings || 
                (sanitizedDrugInfo.details?.warnings) || 
                'Không có thông tin',
        preservation: sanitizedDrugInfo.preservation || 
                      (sanitizedDrugInfo.details?.storage) || 
                      'Bảo quản ở nơi khô ráo, tránh ánh nắng trực tiếp',
        brand: sanitizedDrugInfo.brand || 
              sanitizedDrugInfo.brand_name || 
              (sanitizedDrugInfo.details?.brand) || 
              (sanitizedDrugInfo.manufacturer?.name) || 
              'Không có thông tin',
        category: sanitizedDrugInfo.category || 
                  (sanitizedDrugInfo.details?.category) || 
                  'Không có thông tin',
        price: sanitizedDrugInfo.price?.formattedValue || sanitizedDrugInfo.price || 'Không có thông tin',
        
        // Thêm tất cả dữ liệu gốc từ drugInfo và details
        ...sanitizedDrugInfo,
        
        // Thêm phần details để AI có thể truy cập tất cả dữ liệu chi tiết
        fullDetails: {
          ...sanitizedDrugInfo,
          details: sanitizedDrugInfo.details || {},
          manufacturer: sanitizedDrugInfo.manufacturer || {}
        }
      };

      console.log('Đã chuyển đổi thành công dữ liệu thuốc cho Gemini:', productInfo.name);
      const answer = await geminiService.askGeminiWithFDA({
        productInfo,
        question,
        messages: req.body.messages || [],
        fullDrugInfo: sanitizedDrugInfo, // Gửi toàn bộ dữ liệu gốc đã được loại bỏ HTML
        userApiKey // Thêm API key của người dùng
      });
      
      // Lưu vào lịch sử chat nếu người dùng đã đăng nhập và createHistory không phải false
      if (req.user && req.user.id && createHistory !== false) {
        try {
          // Kiểm tra xem đã có lịch sử chat với drugQuery này chưa
          const existingChat = await ChatHistory.findOne({
            userId: req.user.id,
            drugQuery
          });

          // Tạo đối tượng tin nhắn mới
          const newMessages = [
            {
              role: 'user',
              content: question,
              timestamp: new Date()
            },
            {
              role: 'assistant',
              content: answer,
              timestamp: new Date()
            }
          ];

          if (!existingChat) {
            // Nếu chưa có thì tạo mới
            const newChatHistory = new ChatHistory({
              userId: req.user.id,
              drugQuery,
              generic_name: sanitizedDrugInfo.generic_name || sanitizedDrugInfo.name,
              question,
              answer,
              messages: newMessages, // Thêm mảng messages
              drugInfo: {
                name: sanitizedDrugInfo.name,
                generic_name: sanitizedDrugInfo.generic_name,
                brand_name: sanitizedDrugInfo.brand_name || sanitizedDrugInfo.brand
              }
            });
            await newChatHistory.save();
          } else {
            // Nếu đã có thì thêm tin nhắn mới vào mảng messages
            // Vẫn giữ nguyên question/answer cho tương thích ngược
            existingChat.question = question;
            existingChat.answer = answer;
            existingChat.timestamp = new Date();
            
            // Nếu chưa có mảng messages thì tạo mới
            if (!Array.isArray(existingChat.messages)) {
              existingChat.messages = [];
            }
            
            // Thêm tin nhắn mới vào mảng
            existingChat.messages.push(...newMessages);
            
            await existingChat.save();
          }
        } catch (historyError) {
          console.error('Lỗi khi lưu lịch sử chat:', historyError);
        }
      }
      
      return res.status(200).json({
        success: true,
        answer
      });
    } else if (req.body.productInfo && req.body.question) {
      // Nếu đã có productInfo định dạng chuẩn thì sử dụng trực tiếp
      const { productInfo, question, createHistory } = req.body;
      
      // Làm sạch dữ liệu, loại bỏ các thẻ HTML
      const sanitizedProductInfo = sanitizeObject(productInfo);
      const drugQuery = sanitizedProductInfo.name;
      
      console.log('Sử dụng trực tiếp productInfo:', sanitizedProductInfo.name);
      const answer = await geminiService.askGeminiWithFDA({ 
        productInfo: sanitizedProductInfo, 
        question,
        messages: req.body.messages || [],
        userApiKey // Thêm API key của người dùng
      });
      
      // Lưu lịch sử chat
      if (req.user && req.user.id && createHistory !== false) {
        try {
          const existingChat = await ChatHistory.findOne({
            userId: req.user.id,
            drugQuery
          });

          // Tạo đối tượng tin nhắn mới
          const newMessages = [
            {
              role: 'user',
              content: question,
              timestamp: new Date()
            },
            {
              role: 'assistant',
              content: answer,
              timestamp: new Date()
            }
          ];

          if (!existingChat) {
            const newChatHistory = new ChatHistory({
              userId: req.user.id,
              drugQuery,
              generic_name: sanitizedProductInfo.generic_name || sanitizedProductInfo.name,
              question,
              answer,
              messages: newMessages // Thêm mảng messages
            });
            await newChatHistory.save();
          } else {
            // Cập nhật tin nhắn mới nhất và thêm vào mảng messages
            existingChat.question = question;
            existingChat.answer = answer;
            existingChat.timestamp = new Date();
            
            // Nếu chưa có mảng messages thì tạo mới
            if (!Array.isArray(existingChat.messages)) {
              existingChat.messages = [];
            }
            
            // Thêm tin nhắn mới vào mảng
            existingChat.messages.push(...newMessages);
            
            await existingChat.save();
          }
        } catch (historyError) {
          console.error('Lỗi khi lưu lịch sử chat:', historyError);
        }
      }
      
      return res.status(200).json({
        success: true,
        answer
      });
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Thiếu thông tin cần thiết. Cần có drugInfo hoặc productInfo và question'
      });
    }
  } catch (error) {
    console.error('Lỗi khi xử lý câu hỏi:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Đã xảy ra lỗi khi xử lý câu hỏi', 
      error: error.message
    });
  }
};

module.exports = { askAboutDrug };