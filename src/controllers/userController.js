const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs').promises;
const path = require('path');

// Lấy thông tin người dùng
const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
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
      const oldAvatarPath = path.join(__dirname, '../../', user.avatar);
      try {
        await fs.access(oldAvatarPath);
        await fs.unlink(oldAvatarPath);
      } catch (error) {
        console.log('Không tìm thấy file avatar cũ hoặc có lỗi khi xóa:', error);
      }
    }

    // Cập nhật đường dẫn avatar mới
    user.avatar = req.file.path.replace(/\\/g, '/'); // Chuyển đổi dấu \ thành / cho URL
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
    console.error('Error in uploadAvatar:', error);
    // Xóa file vừa upload nếu có lỗi
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi upload avatar'
    });
  }
};

module.exports = { getUserProfile, updateUserProfile, changePassword, uploadAvatar };