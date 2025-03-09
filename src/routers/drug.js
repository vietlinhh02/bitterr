const express = require('express');
const router = express.Router();
const drugController = require('../controllers/drugController');
const authMiddleware = require('../middleware/auth');

/**
 * @swagger
 * /api/drug/search:
 *   get:
 *     summary: Search for drug information
 *     description: Search for drug information by name
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Drug name to search for (can be comma-separated for multiple drugs)
 *     responses:
 *       200:
 *         description: Drug information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 fdaData:
 *                   type: array
 *                   items:
 *                     type: object
 *                 message:
 *                   type: string
 *       400:
 *         description: Missing search query
 *       404:
 *         description: Drug not found
 *       500:
 *         description: Server error
 */
router.get('/search', authMiddleware, drugController.searchDrug);

/**
 * @swagger
 * /api/drug/search-history:
 *   get:
 *     summary: Get drug search history
 *     description: Retrieve the user's drug search history
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Search history retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/search-history', authMiddleware, drugController.getDrugSearchHistory);

/**
 * @swagger
 * /api/drug/save-search-history:
 *   post:
 *     summary: Save drug search history
 *     description: Save a drug search to the user's history
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - keyword
 *             properties:
 *               keyword:
 *                 type: string
 *                 description: Search keyword
 *               searchType:
 *                 type: string
 *                 description: Type of search (name or ingredients)
 *               resultCount:
 *                 type: number
 *                 description: Number of results found
 *     responses:
 *       201:
 *         description: Search history saved successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/save-search-history', authMiddleware, drugController.saveDrugSearchHistory);

/**
 * @swagger
 * /api/drug/search-history/{searchId}:
 *   delete:
 *     summary: Delete a search history item
 *     description: Delete a specific search history item
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: searchId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the search history item to delete
 *     responses:
 *       200:
 *         description: Search history item deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Search history item not found
 *       500:
 *         description: Server error
 */
router.delete('/search-history/:searchId', authMiddleware, drugController.deleteDrugSearchHistoryItem);

/**
 * @swagger
 * /api/drug/drug-events:
 *   get:
 *     summary: Tìm kiếm sự kiện thuốc
 *     description: Tìm kiếm sự kiện thuốc từ FDA API
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: medicinalproduct
 *         schema:
 *           type: string
 *         description: Tên thuốc cần tìm kiếm
 *       - in: query
 *         name: reactionmeddrapt
 *         schema:
 *           type: string
 *         description: Phản ứng phụ cần tìm kiếm
 *       - in: query
 *         name: reportercountry
 *         schema:
 *           type: string
 *         description: Quốc gia báo cáo
 *       - in: query
 *         name: serious
 *         schema:
 *           type: string
 *         description: Mức độ nghiêm trọng (1 hoặc 2)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Số lượng kết quả tối đa (mặc định là 10)
 *     responses:
 *       200:
 *         description: Tìm thấy sự kiện thuốc phù hợp
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 meta:
 *                   type: object
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                 message:
 *                   type: string
 *       404:
 *         description: Không tìm thấy sự kiện thuốc nào phù hợp
 *       500:
 *         description: Lỗi server
 */
router.get('/drug-events', authMiddleware, drugController.searchDrugEvents);

module.exports = router;