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
 * /api/drug/search-by-ingredients:
 *   get:
 *     summary: Search for drugs by ingredients
 *     description: Search for drugs containing specific ingredients
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: ingredients
 *         required: true
 *         schema:
 *           type: string
 *         description: Ingredients to search for (comma-separated)
 *     responses:
 *       200:
 *         description: Drugs found containing the specified ingredients
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
 *         description: Missing ingredients query
 *       404:
 *         description: No drugs found with these ingredients
 *       500:
 *         description: Server error
 */
router.get('/search-by-ingredients', authMiddleware, drugController.searchDrugByIngredients);

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

module.exports = router;