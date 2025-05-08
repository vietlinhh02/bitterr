const express = require('express');
const router = express.Router();
const { 
  addFavoriteDrug,
  getFavoriteDrugs,
  removeFavoriteDrug
} = require('../controllers/favoriteDrugController');
const { authMiddleware } = require('../middleware/auth');

// Đường dẫn bảo vệ bằng middleware xác thực
router.post('/', authMiddleware, addFavoriteDrug);
router.get('/', authMiddleware, getFavoriteDrugs);
router.delete('/:favoriteId', authMiddleware, removeFavoriteDrug);

module.exports = router;
