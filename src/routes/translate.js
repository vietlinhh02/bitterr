const express = require('express');
const router = express.Router();
const translateController = require('../controllers/translateController');
const authMiddleware = require('../middleware/auth');

/**
 * @swagger
 * /api/translate:
 *   post:
 *     summary: Dịch nội dung sang ngôn ngữ khác
 *     description: Dịch văn bản từ tiếng Anh sang ngôn ngữ đích được chỉ định
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - targetLanguage
 *             properties:
 *               content:
 *                 type: string
 *                 description: Nội dung cần dịch
 *               targetLanguage:
 *                 type: string
 *                 description: Mã ngôn ngữ đích (vi, en, fr, de, es, zh, ja, ko, ru, th)
 *     responses:
 *       200:
 *         description: Dịch thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 translatedText:
 *                   type: string
 *                 sourceLanguage:
 *                   type: string
 *                 targetLanguage:
 *                   type: string
 *       400:
 *         description: Thiếu thông tin hoặc ngôn ngữ không hỗ trợ
 *       401:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi server
 */
router.post('/', authMiddleware, translateController.translateText);

module.exports = router; 