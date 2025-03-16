const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');

// Cấu hình giới hạn request
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 phút
  max: 100, // giới hạn mỗi IP 100 requests mỗi 10 phút
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 10 phút',
  }
});

// Giới hạn đặc biệt cho yêu cầu login và register
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 10, // giới hạn 10 yêu cầu mỗi giờ
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu đăng nhập, vui lòng thử lại sau 1 giờ',
  }
});

// Middleware bảo mật
const securityMiddleware = (app) => {
  // Set security HTTP headers
  app.use(helmet());

  // Giới hạn request
  app.use('/api', limiter);
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);

  // Cho phép CORS chỉ từ domain cụ thể
  app.use(
    cors({
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL 
        : 'http://localhost:3000',
      credentials: true
    })
  );

  // Data sanitization against NoSQL query injection
  app.use(mongoSanitize());

  // Data sanitization against XSS
  app.use(xss());

  // Prevent parameter pollution
  app.use(hpp());

  // Chống clickjacking
  app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    next();
  });
};

module.exports = securityMiddleware;
