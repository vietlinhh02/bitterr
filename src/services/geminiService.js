// drug-app/backend/src/services/geminiService.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const askGeminiWithFDA = async (data) => {
  try {
    // Sử dụng model mạnh hơn để có câu trả lời tốt hơn
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",  // Thay đổi từ gemini-2.0-flash sang gemini-1.5-pro để có câu trả lời dài, chi tiết hơn
      generationConfig: {
        temperature: 0.7,      // Tăng nhiệt độ để có câu trả lời đa dạng hơn
        topP: 0.95,            // Tăng topP để mở rộng không gian câu trả lời
        topK: 40,              // Tăng topK để có thêm nhiều lựa chọn từ
        maxOutputTokens: 4096, // Cho phép câu trả lời dài hơn
      }
    });

    const { productInfo, question } = data;

    // Cải thiện prompt để có câu trả lời chất lượng cao hơn
    let prompt = `# Hướng dẫn Hệ thống
Bạn là một dược sĩ chuyên nghiệp, thông thái và giàu kinh nghiệm. Hãy cung cấp thông tin chi tiết, đầy đủ và dễ hiểu về thuốc khi được hỏi.

## Thông tin thuốc
Sau đây là thông tin thuốc bạn cần tham khảo:
- Tên sản phẩm: ${productInfo.name}
- Mô tả: ${productInfo.description}
- Thành phần hoạt chất: ${productInfo.ingredients}
- Chỉ định/Công dụng: ${productInfo.usage}
- Liều dùng/Cách dùng: ${productInfo.dosage}
- Tác dụng phụ: ${productInfo.adverseEffect}
- Thận trọng và cảnh báo: ${productInfo.careful}
- Bảo quản: ${productInfo.preservation}
- Nhà sản xuất/Thương hiệu: ${productInfo.brand}
- Nhóm thuốc: ${productInfo.category}

## Câu hỏi của người dùng:
${question}

## Hướng dẫn trả lời
1. Hãy trả lời dựa trên thông tin được cung cấp, nhưng cũng sử dụng kiến thức chuyên môn của bạn về dược học để bổ sung thông tin có liên quan.
2. Nếu thông tin được cung cấp không đầy đủ, hãy cung cấp kiến thức chung về các vấn đề tương tự, đồng thời nói rõ đâu là thông tin từ dữ liệu và đâu là kiến thức bổ sung.
3. Nếu không có thông tin hoặc thông tin ghi là "Không có thông tin", hãy cung cấp kiến thức chung áp dụng cho loại thuốc hoặc hoạt chất đó, dựa trên hiểu biết chuyên môn của bạn.
4. Khuyến khích người dùng tham khảo ý kiến dược sĩ hoặc bác sĩ để được tư vấn cụ thể cho trường hợp của họ.
5. Sử dụng định dạng markdown để làm nổi bật các điểm quan trọng và tổ chức thông tin.
6. Trả lời chi tiết, đầy đủ và dễ hiểu.

## Định dạng câu trả lời
- Sử dụng tiêu đề và phân cấp nội dung rõ ràng
- Sử dụng **in đậm** cho điểm quan trọng
- Sử dụng *in nghiêng* cho thuật ngữ chuyên môn
- Sử dụng \`code\` cho tên biệt dược, hoạt chất
- Sử dụng danh sách có số thứ tự cho các bước, quy trình
- Sử dụng danh sách không số thứ tự (-) cho liệt kê thông tin
- Sử dụng bảng cho dữ liệu có cấu trúc hoặc so sánh
- Sử dụng > blockquote cho cảnh báo quan trọng
- Bắt đầu bằng một tiêu đề chính (H1) tóm tắt vấn đề và kết thúc bằng một phần kết luận ngắn gọn`;

    // Sử dụng generateContentStream để có phản hồi tốt hơn
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

// Hướng dẫn hệ thống cho model
const SYSTEM_INSTRUCTION = `
  Nhận diện và phân tích thuốc trong hình ảnh. Trả về thông tin dưới dạng JSON với các thuộc tính:
  - name: Tên thuốc
  - dosage: Liều lượng (nếu có)
  - active_ingredients: Thành phần hoạt tính chính (nếu có)
  - usage: Công dụng của thuốc (nếu có)
  - box_2d: Tọa độ bounding box [x1, y1, x2, y2]
  
  Giới hạn tối đa 10 đối tượng. Không bao gồm code fencing hay masks.
`;

/**
 * Phân tích hình ảnh thuốc sử dụng Gemini API
 * @param {Buffer} imageBuffer - Buffer chứa dữ liệu hình ảnh
 * @param {string} prompt - Câu lệnh cho model (tùy chọn)
 * @returns {Promise<Object>} - Kết quả phân tích
 */
async function analyzeMedicineImage(imageBuffer, prompt = "Nhận diện tất cả các loại thuốc trong hình ảnh và cung cấp thông tin chi tiết.") {
  try {
    // Khởi tạo model Gemini 2.0 Flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Chuẩn bị dữ liệu hình ảnh
    const imagePart = {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType: 'image/jpeg',
      },
    };

    // Cấu hình cho model
    const generationConfig = {
      temperature: 0.4,
      topP: 0.8,
      topK: 32,
    };

    // Gọi API để phân tích hình ảnh
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }, imagePart] }],
      generationConfig,
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const response = result.response;
    const text = response.text();
    
    // Phân tích kết quả trả về
    try {
      // Cố gắng parse JSON từ kết quả
      const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Nếu không tìm thấy JSON, trả về text nguyên bản
      return { rawResult: text };
    } catch (parseError) {
      console.error('Lỗi khi parse kết quả:', parseError);
      return { rawResult: text };
    }
  } catch (error) {
    console.error('Lỗi khi phân tích hình ảnh thuốc:', error);
    throw new Error('Không thể phân tích hình ảnh thuốc: ' + error.message);
  }
}

/**
 * Tìm kiếm thông tin thuốc dựa trên nhận dạng hình ảnh
 * @param {Buffer} imageBuffer - Buffer chứa dữ liệu hình ảnh
 * @param {string} searchQuery - Truy vấn tìm kiếm (ví dụ: "Tìm thuốc có hoạt chất paracetamol")
 * @returns {Promise<Object>} - Kết quả tìm kiếm
 */
async function searchMedicineByImage(imageBuffer, searchQuery) {
  try {
    const prompt = `Tìm kiếm thông tin: ${searchQuery}. Chỉ trả về kết quả phù hợp với truy vấn.`;
    return await analyzeMedicineImage(imageBuffer, prompt);
  } catch (error) {
    console.error('Lỗi khi tìm kiếm thuốc qua hình ảnh:', error);
    throw new Error('Không thể tìm kiếm thuốc: ' + error.message);
  }
}

module.exports = { 
  askGeminiWithFDA, 
  askGeminiWithOCRText,
  generateQuestionSuggestions,
  analyzeMedicineImage,
  searchMedicineByImage
};

