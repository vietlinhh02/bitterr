const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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

        // Tạo token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(201).json({
            success: true,
            token,
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

        // In ra thông tin để debug
        console.log('Entered Password:', password);
        console.log('Stored Hashed Password:', user.password);

        // Kiểm tra mật khẩu
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Email hoặc mật khẩu không đúng'
            });
        }

        // Tạo token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            success: true,
            token,
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

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
}

module.exports = { registerUser, loginUser };
