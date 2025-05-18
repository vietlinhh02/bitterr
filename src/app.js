const express = require('express');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');
const securityMiddleware = require('./middleware/security');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const path = require('path');
const cors = require('cors');
const { csrfProtection, setupCsrf, handleCsrfError, cookieParser } = require('./middleware/csrf');

// Import routes - sửa lại theo tên file thực tế
const authRoutes = require('./routes/auth');
const drugRoutes = require('./routes/drug');
const userRoutes = require('./routes/user');
const chatHistoryRoutes = require('./routes/chatHistory');
const medicineDetectionRoutes = require('./routes/medicineDetectionRoutes');
const pharmacyRoutes = require('./routes/pharmacyRoutes');
const geminiRoutes = require('./routes/gemini');
const detectRoutes = require('./routes/detect');
const questionSuggestionRoutes = require('./routes/questionSuggestion');
const translateRoutes = require('./routes/translate');
const favoriteDrugRoutes = require('./routes/favoriteDrugRoutes');

const app = express();

// Cấu hình CORS
app.use(cors({
  origin: ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  credentials: true
}));

// Áp dụng các middleware bảo mật
securityMiddleware(app);

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Cookie parser - cần thiết cho CSRF
app.use(cookieParser());

// Phục vụ các tệp tĩnh
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res, path) => {
    // Đặt header cụ thể cho các file hình ảnh
    if (path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.svg')) {
      let contentType = 'image/' + path.split('.').pop();
      // SVG cần content-type đặc biệt
      if (path.endsWith('.svg')) {
        contentType = 'image/svg+xml';
      }
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache 1 ngày
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    }
  }
}));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Áp dụng bảo vệ CSRF cho các routes cần bảo vệ (không bao gồm các API endpoints stateless)
// Tạm thời bỏ CSRF protection để test
// app.use('/api/auth/*', csrfProtection, setupCsrf);
// app.use('/api/users/*', csrfProtection, setupCsrf);

// Xử lý lỗi CSRF
app.use(handleCsrfError);

// Routes - sửa lại để phù hợp với tên biến mới
app.use('/api/auth', authRoutes);
app.use('/api/drug', drugRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat-history', chatHistoryRoutes);
app.use('/api/medicine-detection', medicineDetectionRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/api/gemini', geminiRoutes);
app.use('/api/detect', detectRoutes);
app.use('/api/question-suggestions', questionSuggestionRoutes);
app.use('/api/translate', translateRoutes);
app.use('/api/favorite-drugs', favoriteDrugRoutes);

// Homepage
app.get('/', (req, res) => {
  res.send('BiiterNCKH API Server - Status: Running');
});

// Error Handler (phải ở cuối cùng)
app.use(errorHandler);

module.exports = app;
