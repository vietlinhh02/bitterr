const express = require('express');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');
const securityMiddleware = require('./middleware/security');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

// Import routes
const authRoutes = require('./routes/authRoutes');
const drugRoutes = require('./routes/drugRoutes');
const chatRoutes = require('./routes/chatRoutes');
const userRoutes = require('./routes/userRoutes');
const detectRoutes = require('./routes/detectRoutes');
const longChauRoutes = require('./routes/longChauRoutes');
const favoriteDrugRoutes = require('./routes/favoriteDrugRoutes'); // Add this import

const app = express();

// Áp dụng các middleware bảo mật
securityMiddleware(app);

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/drug', drugRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/users', userRoutes);
app.use('/api/detect', detectRoutes);
app.use('/api/longchau', longChauRoutes);
app.use('/api/favorites', favoriteDrugRoutes); // Add this route

// Homepage
app.get('/', (req, res) => {
  res.send('BiiterNCKH API Server - Status: Running');
});

// Error Handler (phải ở cuối cùng)
app.use(errorHandler);

module.exports = app;
