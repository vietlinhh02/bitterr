const express = require('express');
const router = express.Router();
const longChauController = require('../controllers/longChauController');
const authMiddleware = require('../middleware/auth');

/**
 * @swagger
 * /api/longchau/search:
 *   get:
 *     summary: Tìm kiếm thuốc trên Long Châu
 *     description: Tìm kiếm thuốc trên Long Châu dựa vào từ khóa
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: true
 *         schema:
 *           type: string
 *         description: Từ khóa tìm kiếm
 *     responses:
 *       200:
 *         description: Tìm kiếm thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 message:
 *                   type: string
 *       400:
 *         description: Thiếu từ khóa tìm kiếm
 *       404:
 *         description: Không tìm thấy thuốc nào phù hợp
 *       500:
 *         description: Lỗi server
 */
router.get('/search', authMiddleware, longChauController.searchDrugOnLongChau);

/**
 * @swagger
 * /api/longchau/drug-info:
 *   get:
 *     summary: Lấy thông tin chi tiết của thuốc từ Long Châu
 *     description: Lấy thông tin chi tiết của thuốc từ Long Châu dựa vào URL
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: url
 *         required: true
 *         schema:
 *           type: string
 *         description: URL của trang thuốc trên Long Châu
 *     responses:
 *       200:
 *         description: Lấy thông tin thuốc thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                 message:
 *                   type: string
 *       400:
 *         description: Thiếu URL của thuốc
 *       500:
 *         description: Lỗi server
 */
router.get('/drug-infos',authMiddleware, longChauController.getDrugInfoFromLongChau);

module.exports = router; 