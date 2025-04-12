/**
 * Hàm định dạng thời gian
 * @param {string|Date} timestamp Thời gian cần định dạng
 * @returns {string} Định dạng thời gian hh:mm
 */
export const formatTimestamp = (timestamp) => {
  try {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    
    if (isNaN(date.getTime())) {
      // Nếu không phải thời gian hợp lệ nhưng là chuỗi thời gian định dạng hh:mm
      if (typeof timestamp === 'string' && /^\d{1,2}:\d{2}(:\d{2})?\s*(AM|PM)?$/i.test(timestamp)) {
        return timestamp;
      }
      return 'Invalid time';
    }
    
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  } catch (error) {
    console.error('Error formatting timestamp:', error, timestamp);
    return 'Error time';
  }
};

/**
 * Tạo tin nhắn chào mừng từ thông tin thuốc
 * @param {Object} drugInfo Thông tin thuốc
 * @returns {Object} Đối tượng tin nhắn
 */
export const createWelcomeMessage = (drugInfo) => {
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  if (drugInfo) {
    const drugName = drugInfo.name || drugInfo.brand_name || drugInfo.generic_name || 'thuốc này';
    return { 
      text: `Xin chào! Tôi là trợ lý AI, sẵn sàng cung cấp thông tin về **${drugName}**. Bạn muốn biết điều gì?`, 
      isUser: false, 
      timestamp 
    };
  }
  
  return { 
    text: 'Chào bạn! Hãy chọn một loại thuốc để bắt đầu hoặc hỏi tôi một câu hỏi chung về sức khỏe.', 
    isUser: false, 
    timestamp 
  };
}; 