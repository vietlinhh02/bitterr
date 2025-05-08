const csrf = require('csurf');
const cookieParser = require('cookie-parser');

// Cấu hình middleware CSRF
const csrfProtection = csrf({ 
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Sử dụng secure cookies trong môi trường production
    sameSite: 'strict', // Ngăn CSRF bằng cách chỉ gửi cookie cho same-site requests
    maxAge: 24 * 60 * 60 * 1000 // 1 ngày
  } 
});

// Middleware tạo token CSRF và gửi cho client
const setupCsrf = (req, res, next) => {
  res.cookie('XSRF-TOKEN', req.csrfToken(), {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  next();
};

// Middleware xử lý lỗi CSRF
const handleCsrfError = (err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') return next(err);
  
  // Xử lý lỗi CSRF
  return res.status(403).json({
    success: false,
    message: 'Phiên làm việc không hợp lệ hoặc đã hết hạn. Vui lòng làm mới trang và thử lại.'
  });
};

module.exports = {
  csrfProtection,
  setupCsrf,
  handleCsrfError,
  cookieParser
}; 