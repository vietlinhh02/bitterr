const openDrugService = require('../services/openDrugService');
const DrugSearch = require('../models/DrugSearch'); // Nếu bạn sử dụng model DrugSearch

const searchDrug = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: 'Missing search query' });
    }

    const drugQueries = query.split(',').map(q => q.trim());

    const drugInfo = await openDrugService.searchDrug(drugQueries);

    // Lưu lịch sử tìm kiếm nếu có thông tin người dùng
    if (req.user && req.user.id) {
      const newSearch = new DrugSearch({
        userId: req.user.id,
        query: query,
        results: drugInfo.length > 0 ? drugInfo : null
      });
      await newSearch.save();
    }
    
    if (!drugInfo || drugInfo.length === 0) {
      return res.status(404).json({ message: 'Drug not found' });
    }

    return res.status(200).json({ fdaData: drugInfo, message: 'Please enter your question about the drug to get a detailed response.' }); // Trả về giống getDrugInfo

  } catch (error) {
    console.error("Error searching drug:", error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Thêm hàm lấy lịch sử tìm kiếm thuốc
const getDrugSearchHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const searchHistory = await DrugSearch.find({ userId })
      .sort({ timestamp: -1 })
      .limit(20);
    
    return res.status(200).json({ success: true, searchHistory });
  } catch (error) {
    console.error('Error fetching drug search history:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Thêm hàm lưu lịch sử tìm kiếm thuốc
const saveDrugSearchHistory = async (req, res) => {
  try {
    const { keyword, searchType, resultCount, source } = req.body;
    
    if (!keyword) {
      return res.status(400).json({ success: false, message: 'Từ khóa tìm kiếm là bắt buộc' });
    }
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Bạn cần đăng nhập để lưu lịch sử tìm kiếm' });
    }

    const userId = req.user.id;
    const query = searchType === 'ingredients' ? `ingredients:${keyword}` : keyword;
    const searchSource = source || 'fda';

    // Kiểm tra xem đã có lịch sử tìm kiếm tương tự chưa (cùng người dùng, cùng từ khóa, cùng loại tìm kiếm, cùng nguồn)
    const existingSearch = await DrugSearch.findOne({
      userId,
      query,
      source: searchSource
    });

    let searchHistory;

    if (existingSearch) {
      // Nếu đã tồn tại, cập nhật thời gian và số kết quả
      existingSearch.timestamp = new Date();
      existingSearch.resultCount = resultCount || 0;
      await existingSearch.save();
      searchHistory = existingSearch;
    } else {
      // Nếu chưa tồn tại, tạo mới
      const newSearch = new DrugSearch({
        userId,
        query,
        searchType: searchType || 'name',
        resultCount: resultCount || 0,
        source: searchSource,
        timestamp: new Date()
      });
      
      await newSearch.save();
      searchHistory = newSearch;
    }
    
    return res.status(201).json({ 
      success: true, 
      message: 'Đã lưu lịch sử tìm kiếm thành công',
      searchHistory
    });
  } catch (error) {
    console.error('Lỗi khi lưu lịch sử tìm kiếm:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Đã xảy ra lỗi khi lưu lịch sử tìm kiếm',
      error: error.message
    });
  }
};

// Thêm hàm xóa một mục trong lịch sử tìm kiếm
const deleteDrugSearchHistoryItem = async (req, res) => {
  try {
    const { searchId } = req.params;
    const userId = req.user.id;
    
    // Tìm và xóa mục lịch sử tìm kiếm
    const deletedItem = await DrugSearch.findOneAndDelete({
      _id: searchId,
      userId: userId
    });
    
    if (!deletedItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy mục lịch sử tìm kiếm hoặc bạn không có quyền xóa' 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: 'Đã xóa mục lịch sử tìm kiếm thành công' 
    });
  } catch (error) {
    console.error('Error deleting drug search history item:', error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi xóa lịch sử tìm kiếm' });
  }
};

// Cập nhật controller để hỗ trợ tìm kiếm theo nhiều thành phần
const searchDrugByIngredients = async (req, res) => {
  try {
    const { ingredients } = req.query;
    if (!ingredients) {
      return res.status(400).json({ message: 'Missing ingredients query' });
    }

    // Tách chuỗi ingredients thành mảng các thành phần
    const ingredientList = ingredients.split(',').map(ingredient => ingredient.trim());
    
    const drugInfo = await openDrugService.searchDrugByIngredients(ingredientList);
    
    if (!drugInfo || drugInfo.length === 0) {
      return res.status(404).json({ message: 'No drugs found with these ingredients' });
    }

    // Lưu lịch sử tìm kiếm nếu có thông tin người dùng
    if (req.user && req.user.id) {
      const newSearch = new DrugSearch({
        userId: req.user.id,
        query: `ingredients:${ingredients}`,
        results: drugInfo.length > 0 ? drugInfo : null
      });
      await newSearch.save();
    }

    return res.status(200).json({ 
      fdaData: drugInfo, 
      message: 'Found drugs containing the specified ingredients.' 
    });

  } catch (error) {
    console.error("Error searching drug by ingredients:", error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { 
  searchDrug, 
  searchDrugByIngredients, 
  getDrugSearchHistory,
  saveDrugSearchHistory,
  deleteDrugSearchHistoryItem
};