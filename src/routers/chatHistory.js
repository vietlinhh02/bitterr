const express = require('express');
const router = express.Router();
const chatHistoryController = require('../controllers/chatHistoryController');
const authMiddleware = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     ChatHistory:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Chat history ID
 *         userId:
 *           type: string
 *           description: User ID
 *         drugQuery:
 *           type: string
 *           description: Drug name that was queried
 *         question:
 *           type: string
 *           description: User's question
 *         answer:
 *           type: string
 *           description: AI response
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: When the chat was created
 */

/**
 * @swagger
 * /api/chat-history:
 *   get:
 *     summary: Get user's chat history
 *     description: Retrieves the chat history for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Chat history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 chatHistory:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ChatHistory'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authMiddleware, chatHistoryController.getUserChatHistory);

/**
 * @swagger
 * /api/chat-history/{chatId}:
 *   delete:
 *     summary: Delete chat history item
 *     description: Deletes a specific chat history item
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the chat history item to delete
 *     responses:
 *       200:
 *         description: Chat history item deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Chat history item not found
 *       500:
 *         description: Server error
 */
router.delete('/:chatId', authMiddleware, chatHistoryController.deleteChatHistoryItem);

module.exports = router;