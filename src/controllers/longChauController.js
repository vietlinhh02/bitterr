const longChauService = require('../services/longChauService');

/**
 * Tìm kiếm thuốc trên Long Châu
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const searchDrugOnLongChau = async (req, res) => {
  try {
    const { keyword } = req.query;
    
    if (!keyword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vui lòng cung cấp từ khóa tìm kiếm' 
      });
    }
    
    const searchResults = await longChauService.searchDrugOnLongChau(keyword);
    
    if (!searchResults || searchResults.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy thuốc nào phù hợp' 
      });
    }
    
    return res.status(200).json({
      success: true,
      data: searchResults,
      message: 'Tìm kiếm thành công'
    });
  } catch (error) {
    console.error('Error searching drug on Long Chau:', error);
    return res.status(500).json({ 
      success: false, 
      message: `Lỗi khi tìm kiếm thuốc: ${error.message}` 
    });
  }
};

/**
 * Lấy thông tin chi tiết của thuốc từ Long Châu
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const getDrugInfoFromLongChau = async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vui lòng cung cấp URL của thuốc' 
      });
    }
    
    const drugInfo = await longChauService.scrapeDrugInfo(url);
    
    return res.status(200).json({
      success: true,
      data: drugInfo,
      message: 'Lấy thông tin thuốc thành công'
    });
  } catch (error) {
    console.error('Error getting drug info from Long Chau:', error);
    return res.status(500).json({ 
      success: false, 
      message: `Lỗi khi lấy thông tin thuốc: ${error.message}` 
    });
  }
};

module.exports = {
  searchDrugOnLongChau,
  getDrugInfoFromLongChau
}; 