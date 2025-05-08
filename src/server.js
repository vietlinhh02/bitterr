require("dotenv").config();
const app = require('./app');
const connectDB = require("./config/db");

// Kết nối database
connectDB();

const PORT = process.env.PORT || 5050; 
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

