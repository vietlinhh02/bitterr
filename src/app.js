const express = require('express');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');
const securityMiddleware = require('./middleware/security');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

// Import routes
const authRoutes = require('./routes/authRoutes');
const fdaDrugRoutes = require('./routes/fdaDrugRoutes');
const userRoutes = require('./routes/userRoutes');
const searchHistoryRoutes = require('./routes/searchHistoryRoutes');
const chatRoutes = require('./routes/chatRoutes');
const medicineDetectionRoutes = require('./routes/medicineDetectionRoutes');
const drugEventsRoutes = require('./routes/drugEventsRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const pharmacyRoutes = require('./routes/pharmacyRoutes');

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
app.use('/api/fda-drugs', fdaDrugRoutes);
app.use('/api/users', userRoutes);
app.use('/api/search-history', searchHistoryRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/medicine-detection', medicineDetectionRoutes);
app.use('/api/drug-events', drugEventsRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/pharmacy', pharmacyRoutes);

// Homepage
app.get('/', (req, res) => {
  res.send('BiiterNCKH API Server - Status: Running');
});

// Error Handler (phải ở cuối cùng)
app.use(errorHandler);

module.exports = app;
