require('dotenv').config();
const mongoose = require('mongoose');
const QuestionSuggestion = require('../models/QuestionSuggestion');
const connectDB = require('../config/db');

const seedQuestions = async () => {
  try {
    await connectDB();
    
    // Clear existing question suggestions
    await QuestionSuggestion.deleteMany({});
    
    // Add general questions
    const generalQuestions = [
      { question: "Thuốc này có tác dụng phụ gì không?", isGeneral: true },
      { question: "Liều dùng khuyến cáo là bao nhiêu?", isGeneral: true },
      { question: "Tôi có thể uống thuốc này với thức ăn không?", isGeneral: true },
      { question: "Thuốc này có tương tác với thuốc khác không?", isGeneral: true },
      { question: "Tôi có nên tránh rượu khi dùng thuốc này không?", isGeneral: true },
      { question: "Thuốc này có an toàn cho phụ nữ mang thai không?", isGeneral: true },
      { question: "Thuốc này có thể gây buồn ngủ không?", isGeneral: true },
      { question: "Tôi nên làm gì nếu quên uống một liều?", isGeneral: true },
      { question: "Thuốc này có thể gây nghiện không?", isGeneral: true },
      { question: "Tôi nên bảo quản thuốc này như thế nào?", isGeneral: true },
      { question: "Thuốc này có thể dùng cho người cao tuổi không?", isGeneral: true },
      { question: "Có thể cắt hoặc nghiền viên thuốc này không?", isGeneral: true }
    ];
    
    // Add painkiller questions
    const painKillerQuestions = [
      { question: "Thuốc giảm đau này có thể dùng cho trẻ em không?", drugType: "painkiller" },
      { question: "Tôi có thể dùng thuốc này bao lâu liên tục?", drugType: "painkiller" },
      { question: "Thuốc này có thể gây hại cho gan không?", drugType: "painkiller" },
      { question: "Thuốc này có gây nghiện không?", drugType: "painkiller" },
      { question: "Tôi có thể dùng thuốc này cùng với các thuốc giảm đau khác không?", drugType: "painkiller" }
    ];
    
    // Add antibiotic questions
    const antibioticQuestions = [
      { question: "Tôi có cần uống hết đợt kháng sinh không?", drugType: "antibiotic" },
      { question: "Thuốc kháng sinh này có ảnh hưởng đến vi khuẩn đường ruột không?", drugType: "antibiotic" },
      { question: "Tôi có thể dùng thuốc này khi đang cho con bú không?", drugType: "antibiotic" },
      { question: "Thuốc này có hiệu quả với nhiễm trùng virus không?", drugType: "antibiotic" },
      { question: "Tôi có nên uống thuốc men vi sinh khi dùng kháng sinh này không?", drugType: "antibiotic" }
    ];
    
    // Add blood pressure medication questions
    const bpMedicationQuestions = [
      { question: "Tôi có nên kiểm tra huyết áp thường xuyên khi dùng thuốc này không?", drugType: "bloodpressure" },
      { question: "Thuốc này có thể gây chóng mặt không?", drugType: "bloodpressure" },
      { question: "Tôi có nên dùng thuốc này vào cùng một thời điểm mỗi ngày không?", drugType: "bloodpressure" },
      { question: "Thuốc này có ảnh hưởng đến chức năng thận không?", drugType: "bloodpressure" }
    ];
    
    // Add diabetes medication questions
    const diabetesMedicationQuestions = [
      { question: "Tôi nên làm gì nếu bị hạ đường huyết khi dùng thuốc này?", drugType: "diabetes" },
      { question: "Tôi có nên kiểm tra đường huyết thường xuyên khi dùng thuốc này không?", drugType: "diabetes" },
      { question: "Thuốc này có ảnh hưởng đến chức năng thận không?", drugType: "diabetes" },
      { question: "Tôi có thể dùng thuốc này cùng với insulin không?", drugType: "diabetes" }
    ];
    
    // Add allergy medication questions
    const allergyMedicationQuestions = [
      { question: "Thuốc này có gây buồn ngủ không?", drugType: "antiallergy" },
      { question: "Tôi có thể lái xe khi dùng thuốc này không?", drugType: "antiallergy" },
      { question: "Thuốc này có thể dùng hàng ngày trong thời gian dài không?", drugType: "antiallergy" },
      { question: "Thuốc này có hiệu quả ngay lập tức không?", drugType: "antiallergy" }
    ];
    
    // Insert all questions into the database
    await QuestionSuggestion.insertMany([
      ...generalQuestions,
      ...painKillerQuestions,
      ...antibioticQuestions,
      ...bpMedicationQuestions,
      ...diabetesMedicationQuestions,
      ...allergyMedicationQuestions
    ]);
    
    console.log('Question suggestions seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding question suggestions:', error);
    process.exit(1);
  }
};

seedQuestions();