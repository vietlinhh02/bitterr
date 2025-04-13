require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const swaggerDocs = require('./config/swagger');
const authRoutes = require("./routes/auth");
const drugRoutes = require('./routes/drug');
const geminiRoutes = require('./routes/gemini');
const detectRoutes = require('./routes/detect');
const userRoutes = require('./routes/user');
const chatHistoryRoutes = require('./routes/chatHistory');
const questionSuggestionRoutes = require('./routes/questionSuggestion');
const translateRoutes = require('./routes/translate');
const medicineDetectionRoutes = require('./routes/medicineDetection');
const pharmacyRoutes = require('./routes/pharmacyRoutes');
const path = require('path');

const app = express();

// Cấu hình CORS chi tiết hơn
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.get("/", (req, res) => {
    res.send("Hello World!");
});
app.use('/api/drug', drugRoutes);
app.use('/api/gemini', geminiRoutes);
app.use('/api/detect', detectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat-history', chatHistoryRoutes);
app.use('/api/question-suggestions', questionSuggestionRoutes);
app.use('/api/translate', translateRoutes);
app.use('/api/medicine-detection', medicineDetectionRoutes);
app.use('/api/pharmacy', pharmacyRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Initialize Swagger
swaggerDocs(app);

connectDB();

const PORT = process.env.PORT || 5050; 
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

