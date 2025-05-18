const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const path = require('path');

// Đường dẫn tới avatar mặc định
const DEFAULT_AVATAR = '/uploads/avatars/default-avatar.svg';

// Lấy thông tin người dùng
const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        // Đảm bảo user luôn có avatar, nếu không có thì dùng avatar mặc định
        if (!user.avatar) {
            user.avatar = DEFAULT_AVATAR;
        }
        
        return res.status(200).json({ success: true, user });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Cập nhật thông tin người dùng
const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { username, email } = req.body;
        
        // Kiểm tra email đã tồn tại chưa
        if (email) {
            const existingUser = await User.findOne({ email, _id: { $ne: userId } });
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'Email already in use' });
            }
        }
        
        // Kiểm tra username đã tồn tại chưa
        if (username) {
            const existingUser = await User.findOne({ username, _id: { $ne: userId } });
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'Username already in use' });
            }
        }
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: { username, email } },
            { new: true }
        ).select('-password');
        
        return res.status(200).json({ success: true, user: updatedUser });
    } catch (error) {
        console.error('Error updating user profile:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Đổi mật khẩu
const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Current password and new password are required' });
        }
        
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        // Kiểm tra mật khẩu hiện tại
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }
        
        // Cập nhật mật khẩu mới
        user.password = newPassword;
        await user.save();
        
        return res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Upload avatar
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn file ảnh'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      // Xóa file vừa upload nếu không tìm thấy user
      await fs.unlink(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Xóa avatar cũ nếu có
    if (user.avatar) {
      try {
        const oldAvatarPath = user.avatar.startsWith('/') 
          ? path.join(__dirname, '../..', user.avatar) 
          : path.join(__dirname, '../../', user.avatar);
        
        await fs.access(oldAvatarPath);
        await fs.unlink(oldAvatarPath);
      } catch (error) {
        // Bỏ qua lỗi khi xóa avatar cũ
      }
    }

    // Cập nhật đường dẫn avatar mới với URL tương đối cho frontend
    const relativePath = '/uploads/avatars/' + path.basename(req.file.path);
    user.avatar = relativePath;
    await user.save();

    res.json({
      success: true,
      message: 'Upload avatar thành công',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar
      }
    });
  } catch (error) {
    // Xóa file vừa upload nếu có lỗi
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        // Bỏ qua lỗi khi xóa file
      }
    }
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi upload avatar'
    });
  }
};

// Cập nhật API key của Gemini
const updateGeminiApiKey = async (req, res) => {
    try {
        const userId = req.user.id;
        const { geminiApiKey } = req.body;
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: { geminiApiKey } },
            { new: true }
        ).select('-password');
        
        return res.status(200).json({ 
            success: true, 
            message: 'API key đã được cập nhật thành công',
            user: updatedUser 
        });
    } catch (error) {
        console.error('Error updating Gemini API key:', error);
        return res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật API key' });
    }
};

module.exports = { getUserProfile, updateUserProfile, changePassword, uploadAvatar, updateGeminiApiKey };