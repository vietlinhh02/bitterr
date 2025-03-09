const geminiService = require('../services/geminiService');
const ChatHistory = require('../models/ChatHistory');

const askAboutDrug = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    
    // Kiểm tra định dạng dữ liệu
    if (req.body.messages && Array.isArray(req.body.messages) && req.body.drugInfo) {
      // Định dạng mới với messages và drugInfo
      const { messages, drugInfo, drugQuery } = req.body;
      
      // Đảm bảo tất cả các trường đều có giá trị mặc định
      const defaultDrugInfo = {
        brand_name: drugInfo.brand_name || 'Không có tên',
        generic_name: drugInfo.generic_name || 'Không có tên',
        active_ingredient: drugInfo.active_ingredient || 'Không có thông tin',
        indications_and_usage: drugInfo.indications_and_usage || 'Không có thông tin',
        warnings: drugInfo.warnings || 'Không có thông tin',
        dosage_and_administration: drugInfo.dosage_and_administration || 'Không có thông tin',
        adverse_reactions: drugInfo.adverse_reactions || 'Không có thông tin'
      };
      
      // Lấy câu hỏi cuối cùng từ messages
      const lastUserMessage = messages.filter(msg => msg.role === 'user').pop();
      if (!lastUserMessage) {
        return res.status(400).json({ 
          success: false,
          message: 'Không tìm thấy câu hỏi của người dùng trong messages'
        });
      }
      
      const question = lastUserMessage.content;
      
      console.log('Calling Gemini service with new format:', { drugInfo: defaultDrugInfo, question });
      const answer = await geminiService.askGeminiWithFDA({ 
        productInfo: {
          name: defaultDrugInfo.brand_name || defaultDrugInfo.generic_name,
          description: defaultDrugInfo.indications_and_usage,
          ingredients: defaultDrugInfo.active_ingredient,
          usage: defaultDrugInfo.indications_and_usage,
          dosage: defaultDrugInfo.dosage_and_administration,
          adverseEffect: defaultDrugInfo.adverse_reactions,
          careful: defaultDrugInfo.warnings,
          preservation: 'Không có thông tin',
          brand: defaultDrugInfo.brand_name,
          category: 'Thuốc',
          price: 'Không có thông tin',
          url: 'FDA/Long Châu Database'
        }, 
        question 
      });
      
      // Lưu vào lịch sử chat nếu người dùng đã đăng nhập
      if (req.user && req.user.id) {
        try {
          const newChatHistory = new ChatHistory({
            userId: req.user.id,
            drugQuery: drugQuery || defaultDrugInfo.brand_name || defaultDrugInfo.generic_name,
            question,
            answer
          });
          await newChatHistory.save();
        } catch (historyError) {
          console.error('Lỗi khi lưu lịch sử chat:', historyError);
        }
      }
      
      console.log('Sending response:', { success: true, answer });
      return res.status(200).json({
        success: true,
        answer
      });
      
    } else if (req.body.productInfo && req.body.question) {
      // Định dạng cũ với productInfo và question
      const { productInfo, question } = req.body;
      
      if (!productInfo || !question) {
        console.error('Missing data:', { productInfo, question });
        return res.status(400).json({ 
          success: false,
          message: 'Thiếu thông tin sản phẩm hoặc câu hỏi',
          details: {
            hasProductInfo: !!productInfo,
            hasQuestion: !!question
          }
        });
      }

      // Đảm bảo tất cả các trường đều có giá trị mặc định
      const defaultProductInfo = {
        name: productInfo.name || 'Không có tên',
        description: productInfo.description || 'Không có thông tin',
        ingredients: productInfo.ingredients || 'Không có thông tin',
        usage: productInfo.usage || 'Không có thông tin',
        dosage: productInfo.dosage || 'Không có thông tin',
        adverseEffect: productInfo.adverseEffect || 'Không có thông tin',
        careful: productInfo.careful || 'Không có thông tin',
        preservation: productInfo.preservation || 'Không có thông tin',
        brand: productInfo.brand || 'Không có thông tin',
        category: productInfo.category || 'Không có thông tin',
        price: productInfo.price || 'Không có thông tin',
        url: productInfo.url || 'Không có thông tin'
      };

      console.log('Calling Gemini service with old format:', { productInfo: defaultProductInfo, question });
      const answer = await geminiService.askGeminiWithFDA({ productInfo: defaultProductInfo, question });
      
      // Lưu vào lịch sử chat nếu người dùng đã đăng nhập
      if (req.user && req.user.id) {
        try {
          const newChatHistory = new ChatHistory({
            userId: req.user.id,
            drugQuery: defaultProductInfo.name,
            question,
            answer
          });
          await newChatHistory.save();
        } catch (historyError) {
          console.error('Lỗi khi lưu lịch sử chat:', historyError);
        }
      }
      
      console.log('Sending response:', { success: true, answer });
      return res.status(200).json({
        success: true,
        answer
      });
    } else {
      return res.status(400).json({ 
        success: false,
        message: 'Định dạng dữ liệu không hợp lệ',
        details: {
          hasMessages: !!req.body.messages && Array.isArray(req.body.messages),
          hasDrugInfo: !!req.body.drugInfo,
          hasProductInfo: !!req.body.productInfo,
          hasQuestion: !!req.body.question
        }
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