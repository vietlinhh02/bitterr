const FavoriteDrug = require('../models/FavoriteDrug');

// Thêm thuốc vào danh sách yêu thích
const addFavoriteDrug = async (req, res) => {
  try {
    const userId = req.user.id;
    const { drugName, genericName, brandName, drugInfo } = req.body;
    
    if (!drugName || !drugInfo) {
      return res.status(400).json({ success: false, message: 'Drug name and drug info are required' });
    }
    
    // Kiểm tra
} catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { addFavoriteDrug };
