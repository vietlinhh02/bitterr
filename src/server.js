require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const swaggerDocs = require('./config/swagger');
const authRoutes = require("./routers/auth");
const drugRoutes = require('./routers/drug');
const geminiRoutes = require('./routers/gemini');
const detectRoutes = require('./routers/detect');
const userRoutes = require('./routers/user');
const chatHistoryRoutes = require('./routers/chatHistory');
const questionSuggestionRoutes = require('./routers/questionSuggestion');
const translateRoutes = require('./routers/translate');
const longChauRoutes = require('./routers/longChau');
const path = require('path');

const app = express();

app.use(cors({
  origin: "*", // Cho phép tất cả các origin
  credentials: true // Nếu cần gửi cookie hoặc authentication headers
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
app.use('/api/longchau', longChauRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Initialize Swagger
swaggerDocs(app);

connectDB();

const PORT = process.env.PORT || 5000; 
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

