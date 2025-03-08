// drug-app/backend/src/services/geminiService.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const askGeminiWithFDA = async (data) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const { productInfo, question } = data;

    let prompt = `Bạn là một dược sĩ chuyên nghiệp. Hãy trả lời câu hỏi sau về sản phẩm này:

Thông tin sản phẩm:
- Tên: ${productInfo.name}
- Mô tả: ${productInfo.description}
- Thành phần: ${productInfo.ingredients}
- Công dụng: ${productInfo.usage}
- Cách dùng: ${productInfo.dosage}
- Tác dụng phụ: ${productInfo.adverseEffect}
- Lưu ý: ${productInfo.careful}
- Bảo quản: ${productInfo.preservation}
- Thương hiệu: ${productInfo.brand}
- Danh mục: ${productInfo.category}
- Giá: ${productInfo.price}

Câu hỏi: ${question}

Hãy trả lời ngắn gọn, chính xác và dễ hiểu. Nếu thông tin không đủ để trả lời, hãy nói rõ điều đó.

Hãy sử dụng Markdown để định dạng câu trả lời:
- Sử dụng **text** cho phần quan trọng
- Sử dụng *text* cho thuật ngữ chuyên môn
- Sử dụng \`text\` cho tên thuốc hoặc thành phần
- Sử dụng > cho các cảnh báo hoặc lưu ý quan trọng
- Sử dụng danh sách có thứ tự (1. 2. 3.) cho các bước hướng dẫn
- Sử dụng danh sách không thứ tự (- hoặc *) cho liệt kê
- Sử dụng bảng khi cần so sánh hoặc liệt kê có cấu trúc
- Sử dụng ### cho tiêu đề phụ nếu cần chia phần

Nếu thông tin về sản phẩm ghi "Không có thông tin", hãy nói rõ điều đó và đề xuất người dùng tham khảo ý kiến dược sĩ hoặc bác sĩ.`;

    const result = await model.generateContentStream([prompt]);
    let text = '';
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      text += chunkText;
    }
    return text;

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    if (error.response && error.response.promptFeedback) {
      console.error("Prompt Feedback:", error.response.promptFeedback);
      if (error.response.promptFeedback.blockReason === 'SAFETY') {
        return "Xin lỗi, tôi không thể trả lời câu hỏi này vì lý do an toàn.";
      }
    }
    throw new Error('Không thể gọi Gemini API');
  }
};


const askGeminiWithOCRText = async (ocrText, question) => {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" }); // Hoặc gemini-pro

    // Tạo prompt (dựa trên OCR text)
    const prompt = `You are a pharmacist.  A user has provided the following text extracted from an image of a drug label:

${ocrText}

Based on this text, answer the user's question: ${question}

Provide a concise, accurate, and easy-to-understand answer. If the information in the text is insufficient to answer the question, say so.`;

    const result = await model.generateContentStream([prompt]); // Dùng stream nếu muốn
      let text = '';
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          text += chunkText;
        }
        return text;
};


// Add this new function to your existing geminiService.js file

const generateQuestionSuggestions = async (drugInfo) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    // Create a prompt for Gemini to generate relevant questions
    let prompt = `You are a helpful AI assistant for a pharmaceutical application. 
    Based on the following drug information, generate 5 relevant and specific questions that a user might want to ask about this medication.
    The questions should be concise, practical, and cover different aspects like usage, side effects, precautions, etc.
    
    Drug Information:
    - Brand Name: ${drugInfo.brand_name || 'N/A'}
    - Generic Name: ${drugInfo.generic_name || 'N/A'}
    - Active Ingredient: ${drugInfo.active_ingredient || 'N/A'}
    - Purpose: ${drugInfo.purpose || 'N/A'}
    - Indications: ${drugInfo.indications_and_usage?.substring(0, 300) || 'N/A'}
    
    Format your response as a JSON array of strings, with each string being a question. Example:
    ["Question 1?", "Question 2?", "Question 3?", "Question 4?", "Question 5?"]
    
    Only return the JSON array, nothing else.`;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Parse the JSON response
    try {
      // Extract JSON array from the response (in case Gemini adds extra text)
      const jsonMatch = text.match(/\[.*\]/s);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(text);
    } catch (parseError) {
      console.error('Error parsing Gemini response as JSON:', parseError);
      // Fallback: return default questions if parsing fails
      return [
        "What are the common side effects of this medication?",
        "How should I take this medication?",
        "Are there any foods or medications I should avoid while taking this?",
        "Is this medication safe during pregnancy?",
        "What should I do if I miss a dose?"
      ];
    }
  } catch (error) {
    console.error('Error generating question suggestions with Gemini:', error);
    throw new Error('Failed to generate question suggestions');
  }
};

module.exports = { 
  askGeminiWithFDA, 
  askGeminiWithOCRText,
  generateQuestionSuggestions  // Add this to the exports
};

