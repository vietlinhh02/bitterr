const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const RefreshToken = require('../models/RefreshToken');
const crypto = require('crypto');

// Tạo access token (ngắn hạn - 24 giờ)
const generateAccessToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

// Tạo refresh token (dài hạn - 7 ngày)
const generateRefreshToken = async (userId) => {
    // Tạo token duy nhất
    const refreshToken = crypto.randomBytes(40).toString('hex');
    
    // Lưu vào database
    await RefreshToken.create({
        token: refreshToken,
        user: userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 ngày
    });
    
    return refreshToken;
};

const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Kiểm tra xem email đã tồn tại chưa
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(400).json({
                success: false,
                message: 'Email đã được sử dụng'
            });
        }

        // Kiểm tra xem username đã tồn tại chưa
        const usernameExists = await User.findOne({ username });
        if (usernameExists) {
            return res.status(400).json({
                success: false,
                message: 'Tên người dùng đã được sử dụng'
            });
        }

        // Tạo user mới
        const user = await User.create({
            username,
            email,
            password
        });

        // Tạo access token
        const accessToken = generateAccessToken(user._id);
        
        // Tạo refresh token
        const refreshToken = await generateRefreshToken(user._id);

        // Thiết lập cookie cho refreshToken
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
        });

        res.status(201).json({
            success: true,
            accessToken,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Error in registerUser:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi đăng ký'
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Kiểm tra xem user có tồn tại không
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Email hoặc mật khẩu không đúng'
            });
        }

        // Kiểm tra mật khẩu - đã xóa console.log nhạy cảm
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Email hoặc mật khẩu không đúng'
            });
        }

        // Tạo access token
        const accessToken = generateAccessToken(user._id);
        
        // Tạo refresh token
        const refreshToken = await generateRefreshToken(user._id);

        // Thiết lập cookie cho refreshToken
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
        });

        res.json({
            success: true,
            accessToken,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar
            }
        });
    } catch (error) {
        console.error('Error in loginUser:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi đăng nhập'
        });
    }
};

const refreshToken = async (req, res) => {
    try {
        // Lấy refresh token từ cookie
        const refreshToken = req.cookies.refreshToken;
        
        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Không tìm thấy refresh token'
            });
        }

        // Tìm refresh token trong database
        const refreshTokenDoc = await RefreshToken.findOne({ 
            token: refreshToken,
            expiresAt: { $gt: new Date() }
        });

        if (!refreshTokenDoc) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token không hợp lệ hoặc đã hết hạn'
            });
        }

        // Lấy thông tin user
        const user = await User.findById(refreshTokenDoc.user);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Không tìm thấy người dùng'
            });
        }

        // Tạo access token mới
        const accessToken = generateAccessToken(user._id);

        res.json({
            success: true,
            accessToken
        });
    } catch (error) {
        console.error('Error in refreshToken:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi làm mới token'
        });
    }
};

const logout = async (req, res) => {
    try {
        // Lấy refresh token từ cookie
        const refreshToken = req.cookies.refreshToken;
        
        if (refreshToken) {
            // Xóa refresh token từ database
            await RefreshToken.deleteOne({ token: refreshToken });
        }

        // Xóa cookie
        res.clearCookie('refreshToken');

        res.json({
            success: true,
            message: 'Đăng xuất thành công'
        });
    } catch (error) {
        console.error('Error in logout:', error);
        res.status(500).json({
            success: false,
            message: 'Đã xảy ra lỗi khi đăng xuất'
        });
    }
};

module.exports = { registerUser, loginUser, refreshToken, logout };
