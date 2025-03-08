const express = require('express');
const router = express.Router();
const questionSuggestionController = require('../controllers/questionSuggestionController');
const authMiddleware = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     QuestionSuggestion:
 *       type: object
 *       required:
 *         - question
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID of the question suggestion
 *         question:
 *           type: string
 *           description: The question text
 *         drugType:
 *           type: string
 *           description: Type of drug this question relates to
 *         brandName:
 *           type: string
 *           description: Brand name of drug this question relates to
 *         genericName:
 *           type: string
 *           description: Generic name of drug this question relates to
 *         isGeneral:
 *           type: boolean
 *           description: Whether this is a general question applicable to all drugs
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Tags for categorizing questions
 *         popularity:
 *           type: number
 *           description: How often this question is selected
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the question was created
 */

/**
 * @swagger
 * /api/question-suggestions/static:
 *   get:
 *     summary: Get static question suggestions
 *     description: Retrieve question suggestions based on drug type, brand name, or generic name
 *     parameters:
 *       - in: query
 *         name: drugType
 *         schema:
 *           type: string
 *         description: Type of drug (e.g., painkiller, antibiotic)
 *       - in: query
 *         name: brandName
 *         schema:
 *           type: string
 *         description: Brand name of the drug
 *       - in: query
 *         name: genericName
 *         schema:
 *           type: string
 *         description: Generic name of the drug
 *     responses:
 *       200:
 *         description: A list of question suggestions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 suggestions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/QuestionSuggestion'
 *       500:
 *         description: Server error
 */
router.get('/static', questionSuggestionController.getStaticSuggestions);

/**
 * @swagger
 * /api/question-suggestions/dynamic:
 *   post:
 *     summary: Get AI-generated question suggestions
 *     description: Generate question suggestions using Gemini AI based on drug information
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - drugInfo
 *             properties:
 *               drugInfo:
 *                 type: object
 *                 description: Drug information object
 *     responses:
 *       200:
 *         description: A list of AI-generated question suggestions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 suggestions:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Missing drug information
 *       500:
 *         description: Server error
 */
router.post('/dynamic', authMiddleware, questionSuggestionController.getDynamicSuggestions);

/**
 * @swagger
 * /api/question-suggestions/static:
 *   post:
 *     summary: Add a new static question suggestion
 *     description: Add a new question suggestion to the database (admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *             properties:
 *               question:
 *                 type: string
 *                 description: The question text
 *               drugType:
 *                 type: string
 *                 description: Type of drug this question relates to
 *               brandName:
 *                 type: string
 *                 description: Brand name of drug this question relates to
 *               genericName:
 *                 type: string
 *                 description: Generic name of drug this question relates to
 *               isGeneral:
 *                 type: boolean
 *                 description: Whether this is a general question applicable to all drugs
 *     responses:
 *       201:
 *         description: Question suggestion created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 suggestion:
 *                   $ref: '#/components/schemas/QuestionSuggestion'
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */
router.post('/static', authMiddleware, questionSuggestionController.addStaticSuggestion);

module.exports = router;