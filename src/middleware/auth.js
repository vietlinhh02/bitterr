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

        // Gắn thông tin người dùng vào request
        req.user = decoded; // Thông tin user thường được lưu trong payload của JWT (ví dụ: { id: user._id, username: user.username })
        next(); // Cho phép request đi tiếp

    } catch (error) {
        console.error("JWT verification error:", error);
        return res.status(401).json({ message: 'Unauthorized: Invalid token' }); // Token không hợp lệ hoặc hết hạn
    }
};
module.exports = authMiddleware;