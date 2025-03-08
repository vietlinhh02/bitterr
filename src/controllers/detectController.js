const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const FormData = require('form-data');
require('dotenv').config();
const drugController = require('./drugController');
const geminiService = require('../services/geminiService');


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const PYTHON_SERVER_URL = 'http://localhost:5001';

async function searchLongChauProducts(keyword) {
    try {
        const response = await axios.get(
            `https://api.nhathuoclongchau.com.vn/lccus/search-product-service/api/products/ecom/product/suggest?keyword=${encodeURIComponent(keyword)}`,
            {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            }
        );

        // Kiểm tra và chuyển đổi dữ liệu từ API mới
        if (response.data && response.data.result) {
            return {
                data: response.data.result.map(item => ({
                    name: item.name,
                    price: item.price,
                    manufacturer: item.manufacturer,
                    url: `https://nhathuoclongchau.com.vn/san-pham/${item.slug}`,
                    image: item.images && item.images[0],
                    description: item.shortDescription
                }))
            };
        }
        return null;
    } catch (error) {
        console.error('Lỗi khi tìm kiếm trên Long Châu:', error);
        return null;
    }
}

const detectDrugNames = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Không có file ảnh được upload' });
        }

        // Tạo FormData để gửi file đến Python server
        const formData = new FormData();
        const fileBuffer = await fs.readFile(req.file.path);
        formData.append('image', fileBuffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype
        });

        // Gửi request đến Python server
        const pythonResponse = await axios.post(`${PYTHON_SERVER_URL}/detect/upload`, formData, {
            headers: {
                ...formData.getHeaders()
            }
        });

        // Xóa file tạm sau khi xử lý
        await fs.unlink(req.file.path);

        const detectedResults = pythonResponse.data;

        // Nếu có kết quả OCR
        if (detectedResults && detectedResults.results && detectedResults.results.length > 0) {
            // Kết hợp tất cả text đã detect
            const detectedText = detectedResults.results
                .map(result => result.text)
                .join(' ');

            // Tìm kiếm trong FDA trước
            const mockReq = {
                query: { query: detectedText },
                user: req.user
            };

            const mockRes = {
                statusCode: 200,
                data: null,
                status: function(code) {
                    this.statusCode = code;
                    return this;
                },
                json: function(data) {
                    this.data = data;
                    return this;
                }
            };

            await drugController.searchDrug(mockReq, mockRes);
            
            // Tìm kiếm trên Long Châu
            const longChauResults = await searchLongChauProducts(detectedText);

            // Chuẩn bị response
            const response = {
                message: 'Kết quả tìm kiếm thuốc',
                detectedText: detectedText,
                ocrResults: detectedResults.results,
            };

            // Thêm dữ liệu FDA nếu có
            if (mockRes.data && mockRes.data.fdaData && mockRes.data.fdaData.length > 0) {
                response.fdaData = mockRes.data.fdaData;
                response.hasFDAData = true;
            }

            // Thêm dữ liệu Long Châu nếu có
            if (longChauResults && longChauResults.data && longChauResults.data.length > 0) {
                response.longChauData = longChauResults.data;
                response.hasLongChauData = true;
            }

            // Nếu không có dữ liệu từ cả hai nguồn
            if (!response.hasFDAData && !response.hasLongChauData) {
                return res.json({
                    message: 'Không tìm thấy thông tin thuốc',
                    detectedText: detectedText,
                    ocrResults: detectedResults.results
                });
            }

            return res.json(response);
        }

        // Nếu không detect được text
        return res.json({
            message: 'Không tìm thấy text trong ảnh',
            results: []
        });

    } catch (error) {
        console.error('Lỗi khi detect ảnh:', error);
        
        // Đảm bảo xóa file tạm nếu có lỗi
        if (req.file) {
            await fs.unlink(req.file.path).catch(err => 
                console.error('Lỗi khi xóa file tạm:', err)
            );
        }

        // Trả về thông báo lỗi phù hợp
        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        }
        
        return res.status(500).json({ 
            message: 'Đã xảy ra lỗi khi xử lý ảnh',
            error: error.message 
        });
    }
};

// Sửa hàm askGeminiDirectly
const askGeminiDirectly = async (ocrText, question, originalRes) => { // Nhận question
    try {
        // const question = req.body.question; // Không cần dòng này nữa
        if (!question) {
          return originalRes.status(400).json({message: "Missing user question"})
        }
        const answer = await geminiService.askGeminiWithOCRText(ocrText, question);

        originalRes.setHeader('Content-Type', 'text/plain; charset=utf-8');
        originalRes.setHeader('Transfer-Encoding', 'chunked');
        originalRes.write(answer);
        originalRes.end();

    } catch (error) {
        console.error("Error asking Gemini directly:", error);
        originalRes.status(500).json({ message: 'Error communicating with Gemini' });
    }
};

module.exports = { detectDrugNames };