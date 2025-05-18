//auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
    // Lấy token từ header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1]; // Lấy phần token sau "Bearer "

    try {
        // Xác thực token
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Sử dụng JWT_SECRET từ .env

        // Kiểm tra thời gian hết hạn
        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp && decoded.exp < currentTime) {
            return res.status(401).json({ 
                message: 'Token đã hết hạn', 
                expired: true,
                code: 'TOKEN_EXPIRED'
            });
        }

        // Gắn thông tin người dùng vào request
        req.user = decoded; // Thông tin user thường được lưu trong payload của JWT (ví dụ: { id: user._id, username: user.username })
        next(); // Cho phép request đi tiếp

    } catch (error) {
        // Kiểm tra lỗi token hết hạn
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                message: 'Token đã hết hạn', 
                expired: true,
                code: 'TOKEN_EXPIRED'
            });
        }
        
        return res.status(401).json({ message: 'Unauthorized: Invalid token' }); // Token không hợp lệ
    }
};

// Middleware để kiểm tra quyền admin
const adminMiddleware = (req, res, next) => {
    // Lấy token từ header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1]; // Lấy phần token sau "Bearer "

    try {
        // Xác thực token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Kiểm tra thời gian hết hạn
        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp && decoded.exp < currentTime) {
            return res.status(401).json({ 
                message: 'Token đã hết hạn', 
                expired: true,
                code: 'TOKEN_EXPIRED'
            });
        }

        // Gắn thông tin người dùng vào request
        req.user = decoded;
        
        // Kiểm tra nếu người dùng là admin
        if (req.user && req.user.role === 'admin') {
            next(); // Cho phép request đi tiếp
        } else {
            return res.status(403).json({ message: 'Forbidden: Admin access required' });
        }
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
};

module.exports = { authMiddleware, adminMiddleware };