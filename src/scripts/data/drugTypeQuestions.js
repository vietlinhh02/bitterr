// Questions specific to different drug types

// Painkiller questions
const painKillerQuestions = [
  { question: "Thuốc giảm đau này có thể dùng cho trẻ em không?", drugType: "painkiller" },
  { question: "Tôi có thể dùng thuốc này bao lâu liên tục?", drugType: "painkiller" },
  { question: "Thuốc này có thể gây hại cho gan không?", drugType: "painkiller" },
  { question: "Thuốc này có gây nghiện không?", drugType: "painkiller" },
  { question: "Tôi có thể dùng thuốc này cùng với các thuốc giảm đau khác không?", drugType: "painkiller" }
];

// Antibiotic questions
const antibioticQuestions = [
  { question: "Tôi có cần uống hết đợt kháng sinh không?", drugType: "antibiotic" },
  { question: "Thuốc kháng sinh này có ảnh hưởng đến vi khuẩn đường ruột không?", drugType: "antibiotic" },
  { question: "Tôi có thể dùng thuốc này khi đang cho con bú không?", drugType: "antibiotic" },
  { question: "Thuốc này có hiệu quả với nhiễm trùng virus không?", drugType: "antibiotic" },
  { question: "Tôi có nên uống thuốc men vi sinh khi dùng kháng sinh này không?", drugType: "antibiotic" }
];

// Blood pressure medication questions
const bpMedicationQuestions = [
  { question: "Tôi có nên kiểm tra huyết áp thường xuyên khi dùng thuốc này không?", drugType: "bloodpressure" },
  { question: "Thuốc này có thể gây chóng mặt không?", drugType: "bloodpressure" },
  { question: "Tôi có nên dùng thuốc này vào cùng một thời điểm mỗi ngày không?", drugType: "bloodpressure" },
  { question: "Thuốc này có ảnh hưởng đến chức năng thận không?", drugType: "bloodpressure" }
];

// Diabetes medication questions
const diabetesMedicationQuestions = [
  { question: "Tôi nên làm gì nếu bị hạ đường huyết khi dùng thuốc này?", drugType: "diabetes" },
  { question: "Tôi có nên kiểm tra đường huyết thường xuyên khi dùng thuốc này không?", drugType: "diabetes" },
  { question: "Thuốc này có ảnh hưởng đến chức năng thận không?", drugType: "diabetes" },
  { question: "Tôi có thể dùng thuốc này cùng với insulin không?", drugType: "diabetes" }
];

// Allergy medication questions
const allergyMedicationQuestions = [
  { question: "Thuốc này có gây buồn ngủ không?", drugType: "antiallergy" },
  { question: "Tôi có thể lái xe khi dùng thuốc này không?", drugType: "antiallergy" },
  { question: "Thuốc này có thể dùng hàng ngày trong thời gian dài không?", drugType: "antiallergy" },
  { question: "Thuốc này có hiệu quả ngay lập tức không?", drugType: "antiallergy" }
];

module.exports = {
  painKillerQuestions,
  antibioticQuestions,
  bpMedicationQuestions,
  diabetesMedicationQuestions,
  allergyMedicationQuestions
};