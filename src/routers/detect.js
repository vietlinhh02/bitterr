// src/routes/detect.js
const express = require('express');
const router = express.Router();
const detectController = require('../controllers/detectController');
const upload = require('../utils/fileUpload'); // Multer config
const authMiddleware = require('../middleware/auth'); // Middleware xác thực (dummy)

/**
 * @swagger
 * /api/detect/image:
 *   post:
 *     summary: Detect drug names from image
 *     description: Upload an image to detect drug names using AI
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file containing drug packaging or label
 *     responses:
 *       200:
 *         description: Drug names detected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 detectedDrugs:
 *                   type: array
 *                   items:
 *                     type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: No image uploaded or invalid image
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/image', upload.single('image'), detectController.detectDrugNames);

module.exports = router;
