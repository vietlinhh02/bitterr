// Questions for special populations (pregnancy, children, elderly, etc.)
const specialPopulationQuestions = [
  // Pregnancy
  { 
    question: "Thuốc này có an toàn trong thai kỳ không?", 
    isGeneral: true,
    tags: ["pregnancy"]
  },
  { 
    question: "Thuốc này thuộc danh mục nào trong thai kỳ (A, B, C, D, X)?", 
    isGeneral: true,
    tags: ["pregnancy"]
  },
  
  // Children
  { 
    question: "Thuốc này có dạng bào chế phù hợp cho trẻ em không?", 
    isGeneral: true,
    tags: ["children"]
  },
  { 
    question: "Liều dùng cho trẻ em được tính như thế nào?", 
    isGeneral: true,
    tags: ["children"]
  },
  
  // Elderly
  { 
    question: "Người cao tuổi có cần điều chỉnh liều không?", 
    isGeneral: true,
    tags: ["elderly"]
  },
  { 
    question: "Thuốc này có thể gây té ngã ở người cao tuổi không?", 
    isGeneral: true,
    tags: ["elderly"]
  },
  
  // Kidney/Liver disease
  { 
    question: "Thuốc này có cần điều chỉnh liều cho người bệnh thận không?", 
    isGeneral: true,
    tags: ["kidney"]
  },
  { 
    question: "Thuốc này có chuyển hóa qua gan không?", 
    isGeneral: true,
    tags: ["liver"]
  }
];

module.exports = specialPopulationQuestions;