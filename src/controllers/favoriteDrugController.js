const FavoriteDrug = require('../models/FavoriteDrug');

// Thêm thuốc vào danh sách yêu thích
const addFavoriteDrug = async (req, res) => {
  try {
    const userId = req.user.id;
    const { drugName, genericName, brandName, drugInfo } = req.body;
    
    if (!drugName || !drugInfo) {
      return res.status(400).json({ success: false, message: 'Drug name and drug info are required' });
    }
    
    // Kiểm tra xem thuốc đã có trong danh sách yêu thích chưa
    const existingFavorite = await FavoriteDrug.findOne({
      userId,
      drugName
    });

    if (existingFavorite) {
      return res.status(400).json({ success: false, message: 'Drug already in favorites' });
    }

    // Tạo mục yêu thích mới
    const favoriteDrug = new FavoriteDrug({
      userId,
      drugName,
      genericName,
      brandName,
      drugInfo
    });

    await favoriteDrug.save();

    res.status(201).json({ success: true, favoriteDrug });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Lấy danh sách thuốc yêu thích
const getFavoriteDrugs = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const favoriteDrugs = await FavoriteDrug.find({ userId });
    
    res.status(200).json({ success: true, favoriteDrugs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Xóa thuốc khỏi danh sách yêu thích
const removeFavoriteDrug = async (req, res) => {
  try {
    const userId = req.user.id;
    const { favoriteId } = req.params;
    
    const deletedFavorite = await FavoriteDrug.findOneAndDelete({
      _id: favoriteId,
      userId
    });
    
    if (!deletedFavorite) {
      return res.status(404).json({ success: false, message: 'Favorite drug not found' });
    }
    
    res.status(200).json({ success: true, message: 'Drug removed from favorites' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { addFavoriteDrug, getFavoriteDrugs, removeFavoriteDrug };
