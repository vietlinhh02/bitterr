require('dotenv').config();
const mongoose = require('mongoose');
const QuestionSuggestion = require('../models/QuestionSuggestion');
const connectDB = require('../config/db');

const seedBrandSpecificQuestions = async () => {
  try {
    await connectDB();
    
    // Add questions for specific popular brands
    const brandSpecificQuestions = [
      // Tylenol (acetaminophen)
      { question: "Tylenol có an toàn cho trẻ sơ sinh không?", brandName: "Tylenol" },
      { question: "Liều Tylenol tối đa trong 24 giờ là bao nhiêu?", brandName: "Tylenol" },
      
      // Advil/Motrin (ibuprofen)
      { question: "Advil có thể gây vấn đề dạ dày không?", brandName: "Advil" },
      { question: "Tôi có thể dùng Advil khi bị sốt xuất huyết không?", brandName: "Advil" },
      
      // Lipitor (atorvastatin)
      { question: "Tôi có nên kiểm tra chức năng gan khi dùng Lipitor không?", brandName: "Lipitor" },
      { question: "Lipitor có thể gây đau cơ không?", brandName: "Lipitor" },
      
      // Prozac (fluoxetine)
      { question: "Prozac mất bao lâu để có tác dụng?", brandName: "Prozac" },
      { question: "Tôi có thể ngừng Prozac đột ngột không?", brandName: "Prozac" },
      
      // Amoxicillin
      { question: "Amoxicillin có thể gây phát ban không?", brandName: "Amoxicillin" },
      { question: "Tôi có thể dùng Amoxicillin nếu bị dị ứng với Penicillin không?", brandName: "Amoxicillin" }
    ];
    
    await QuestionSuggestion.insertMany(brandSpecificQuestions);
    
    console.log('Brand-specific question suggestions seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding brand-specific question suggestions:', error);
    process.exit(1);
  }
};

seedBrandSpecificQuestions();