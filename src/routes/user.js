const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const {authMiddleware} = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get user profile
 *     description: Retrieve the authenticated user's profile information
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/profile', authMiddleware, userController.getUserProfile);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     description: Update the authenticated user's profile information
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   type: object
 *       400:
 *         description: Email or username already in use
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/profile', authMiddleware, userController.updateUserProfile);

/**
 * @swagger
 * /api/users/change-password:
 *   put:
 *     summary: Change password
 *     description: Change the authenticated user's password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Missing passwords or invalid current password
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/change-password', authMiddleware, userController.changePassword);

/**
 * @swagger
 * /api/users/avatar:
 *   post:
 *     summary: Upload user avatar
 *     description: Upload and update user's avatar image
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *       400:
 *         description: Invalid file type or no file uploaded
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/avatar', authMiddleware, upload.single('avatar'), handleUploadError, userController.uploadAvatar);

/**
 * @swagger
 * /api/users/avatar/{filename}:
 *   get:
 *     summary: Get user avatar
 *     description: Get avatar image by filename
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         description: Avatar filename
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Avatar image
 *         content:
 *           image/*:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Avatar not found
 */
router.get('/avatar/:filename', (req, res) => {
  const filename = req.params.filename;
  const avatarPath = path.join(__dirname, '../../uploads/avatars', filename);
  
  // Kiểm tra xem file có tồn tại không
  if (fs.existsSync(avatarPath)) {
    // Đặt header CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cache-Control', 'max-age=86400');
    
    // Đặt Content-Type phù hợp
    if (filename.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    } else if (filename.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    }
    
    // Gửi file
    res.sendFile(avatarPath);
  } else {
    res.status(404).json({ message: 'Avatar không tồn tại' });
  }
});

/**
 * @swagger
 * /api/users/gemini-api-key:
 *   put:
 *     summary: Update Gemini API key
 *     description: Update the user's Gemini API key
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               geminiApiKey:
 *                 type: string
 *     responses:
 *       200:
 *         description: API key updated successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/gemini-api-key', authMiddleware, userController.updateGeminiApiKey);

module.exports = router;