const express = require('express');
const { searchProducts, getProductDetail, saveSearchHistory } = require('../controllers/pharmacyController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

/**
 * @route GET /api/pharmacy/search
 * @desc Tìm kiếm sản phẩm thuốc từ Pharmacity
 * @access Public
 */
router.get('/search',authMiddleware, searchProducts);

/**
 * @route GET /api/pharmacy/product/:slug
 * @desc Lấy thông tin chi tiết sản phẩm
 * @access Public
 */
router.get('/product/:slug', authMiddleware , getProductDetail);

/**
 * @route POST /api/pharmacy/history
 * @desc Lưu lịch sử tìm kiếm
 * @access Private
 */
router.post('/history', authMiddleware, saveSearchHistory);

module.exports = router; 