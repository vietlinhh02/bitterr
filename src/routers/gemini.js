const express = require('express');
const router = express.Router();
const geminiController = require('../controllers/geminiController');
const authMiddleware = require('../middleware/auth');

/**
 * @swagger
 * /api/gemini/ask:
 *   post:
 *     summary: Hỏi AI về sản phẩm
 *     description: Gửi câu hỏi về sản phẩm đến Gemini AI
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productInfo
 *               - question
 *             properties:
 *               productInfo:
 *                 type: object
 *                 description: Thông tin sản phẩm
 *               question:
 *                 type: string
 *                 description: Câu hỏi của người dùng
 *     responses:
 *       200:
 *         description: Trả về câu trả lời từ AI
 *       400:
 *         description: Thiếu thông tin cần thiết
 *       500:
 *         description: Lỗi server
 */
router.post('/ask', authMiddleware, geminiController.askAboutDrug);

module.exports = router;