const express = require('express');
const router = express.Router();
const { 
  addFavoriteDrug,
  getFavoriteDrugs,
  removeFavoriteDrug
} = require('../controllers/favoriteDrugController');
const { protect } = require('../middleware/authMiddleware');

// Đường dẫn bảo vệ bằng middleware xác thực
router.post('/', protect, addFavoriteDrug);
router.get('/', protect, getFavoriteDrugs);
router.delete('/:favoriteId', protect, removeFavoriteDrug);

module.exports = router;
