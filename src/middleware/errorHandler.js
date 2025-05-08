// Middleware xử lý lỗi tập trung
const errorHandler = (err, req, res, next) => {
  // Ghi log lỗi
  console.error(`ERROR: ${err.message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Xác định mã trạng thái
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Gửi phản hồi lỗi
  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
};

module.exports = errorHandler; 