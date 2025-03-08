const ChatHistory = require('../models/ChatHistory');

// Lấy lịch sử chat của người dùng
const getUserChatHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const chatHistory = await ChatHistory.find({ userId })
            .sort({ timestamp: -1 }) // Sắp xếp theo thời gian giảm dần
            .limit(20); // Giới hạn số lượng kết quả
        
        return res.status(200).json({ success: true, chatHistory });
    } catch (error) {
        console.error('Error fetching chat history:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Xóa một mục trong lịch sử chat
const deleteChatHistoryItem = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user.id;
        
        const chatItem = await ChatHistory.findById(chatId);
        
        if (!chatItem) {
            return res.status(404).json({ success: false, message: 'Chat history item not found' });
        }
        
        // Kiểm tra xem người dùng có quyền xóa không
        if (chatItem.userId.toString() !== userId) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this chat history item' });
        }
        
        await ChatHistory.findByIdAndDelete(chatId);
        
        return res.status(200).json({ success: true, message: 'Chat history item deleted successfully' });
    } catch (error) {
        console.error('Error deleting chat history item:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

module.exports = { getUserChatHistory, deleteChatHistoryItem };