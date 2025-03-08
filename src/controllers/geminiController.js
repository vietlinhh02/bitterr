const geminiService = require('../services/geminiService');
const ChatHistory = require('../models/ChatHistory');

const askAboutDrug = async (req, res) => {
  try {
    console.log('Request body:', req.body);
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

    console.log('Calling Gemini service with:', { productInfo: defaultProductInfo, question });
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