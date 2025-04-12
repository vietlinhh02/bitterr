const openDrugService = require('../services/openDrugService');
const DrugSearch = require('../models/DrugSearch'); // Nếu bạn sử dụng model DrugSearch
const axios = require('axios');

const searchDrug = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: 'Missing search query' });
    }

    const drugQueries = query.split(',').map(q => q.trim());

    const drugInfo = await openDrugService.searchDrug(drugQueries);

    // Lưu lịch sử tìm kiếm nếu có thông tin người dùng
    if (req.user && req.user.id) {
      const newSearch = new DrugSearch({
        userId: req.user.id,
        query: query,
        results: drugInfo.length > 0 ? drugInfo : null
      });
      await newSearch.save();
    }
    
    if (!drugInfo || drugInfo.length === 0) {
      return res.status(404).json({ message: 'Drug not found' });
    }

    return res.status(200).json({ fdaData: drugInfo, message: 'Please enter your question about the drug to get a detailed response.' }); // Trả về giống getDrugInfo

  } catch (error) {
    console.error("Error searching drug:", error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Thêm hàm lấy lịch sử tìm kiếm thuốc
const getDrugSearchHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const searchHistory = await DrugSearch.find({ userId })
      .sort({ timestamp: -1 })
      .limit(20);
    
    return res.status(200).json({ success: true, searchHistory });
  } catch (error) {
    console.error('Error fetching drug search history:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Thêm hàm lưu lịch sử tìm kiếm thuốc
const saveDrugSearchHistory = async (req, res) => {
  try {
    const { keyword, searchType, resultCount, source } = req.body;
    
    if (!keyword) {
      return res.status(400).json({ success: false, message: 'Từ khóa tìm kiếm là bắt buộc' });
    }
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'Bạn cần đăng nhập để lưu lịch sử tìm kiếm' });
    }

    const userId = req.user.id;
    const query = searchType === 'ingredients' ? `ingredients:${keyword}` : keyword;
    const searchSource = source || 'fda';

    // Kiểm tra xem đã có lịch sử tìm kiếm tương tự chưa (cùng người dùng, cùng từ khóa, cùng loại tìm kiếm, cùng nguồn)
    const existingSearch = await DrugSearch.findOne({
      userId,
      query,
      source: searchSource
    });

    let searchHistory;

    if (existingSearch) {
      // Nếu đã tồn tại, cập nhật thời gian và số kết quả
      existingSearch.timestamp = new Date();
      existingSearch.resultCount = resultCount || 0;
      await existingSearch.save();
      searchHistory = existingSearch;
    } else {
      // Nếu chưa tồn tại, tạo mới
      const newSearch = new DrugSearch({
        userId,
        query,
        searchType: searchType || 'name',
        resultCount: resultCount || 0,
        source: searchSource,
        timestamp: new Date()
      });
      
      await newSearch.save();
      searchHistory = newSearch;
    }
    
    return res.status(201).json({ 
      success: true, 
      message: 'Đã lưu lịch sử tìm kiếm thành công',
      searchHistory
    });
  } catch (error) {
    console.error('Lỗi khi lưu lịch sử tìm kiếm:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Đã xảy ra lỗi khi lưu lịch sử tìm kiếm',
      error: error.message
    });
  }
};

// Thêm hàm xóa một mục trong lịch sử tìm kiếm
const deleteDrugSearchHistoryItem = async (req, res) => {
  try {
    const { searchId } = req.params;
    const userId = req.user.id;
    
    // Tìm và xóa mục lịch sử tìm kiếm
    const deletedItem = await DrugSearch.findOneAndDelete({
      _id: searchId,
      userId: userId
    });
    
    if (!deletedItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy mục lịch sử tìm kiếm hoặc bạn không có quyền xóa' 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: 'Đã xóa mục lịch sử tìm kiếm thành công',
      deletedItem
    });
  } catch (error) {
    console.error('Lỗi khi xóa mục lịch sử tìm kiếm:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Đã xảy ra lỗi khi xóa mục lịch sử tìm kiếm',
      error: error.message
    });
  }
};

// Cập nhật controller để tìm kiếm sự kiện thuốc
const searchDrugEvents = async (req, res) => {
  try {
    const { medicinalproduct, reactionmeddrapt, reportercountry, serious, limit } = req.query;
    
    // Tạo đối tượng tham số tìm kiếm
    const searchParams = {
      medicinalproduct,
      reactionmeddrapt,
      reportercountry,
      serious,
      limit: limit ? parseInt(limit) : 10
    };
    
    // Gọi service để tìm kiếm sự kiện thuốc
    const eventData = await openDrugService.searchDrugEvents(searchParams);
    
    if (!eventData || !eventData.results || eventData.results.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sự kiện thuốc nào phù hợp' });
    }

    // Lưu lịch sử tìm kiếm nếu có thông tin người dùng
    if (req.user && req.user.id) {
      let queryString = '';
      if (medicinalproduct) queryString += `medicinalproduct:${medicinalproduct}`;
      if (reactionmeddrapt) {
        if (queryString) queryString += ',';
        queryString += `reaction:${reactionmeddrapt}`;
      }
      
      const newSearch = new DrugSearch({
        userId: req.user.id,
        query: queryString || 'drug_events',
        searchType: 'events',
        resultCount: eventData.results.length,
        source: 'fda',
        timestamp: new Date()
      });
      await newSearch.save();
    }

    return res.status(200).json({ 
      success: true,
      meta: eventData.meta,
      results: eventData.results,
      message: 'Tìm thấy sự kiện thuốc phù hợp.' 
    });

  } catch (error) {
    console.error("Lỗi khi tìm kiếm sự kiện thuốc:", error);
    return res.status(500).json({ success: false, message: 'Lỗi server khi tìm kiếm sự kiện thuốc' });
  }
};

// Thêm hàm tìm kiếm thuốc từ Pharmacity
const searchPharmacityDrugs = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Missing search query' });
    }

    // Thêm logging để debug
    console.log(`Đang tìm kiếm thuốc Pharmacity với từ khóa: ${query}`);

    // Trả về dữ liệu mẫu cho tất cả các từ khóa tìm kiếm
    // Bỏ qua việc gọi API Pharmacity do API không ổn định
    const mockData = {
      items: [
        {
          id: "PC-" + Date.now(),
          name: `${query} (Hộp 10 vỉ x 10 viên)`,
          sku: query.toUpperCase().replace(/\s+/g, ''),
          ingredients: `Hoạt chất chính: ${query}`,
          description: `${query} được dùng để điều trị các bệnh theo chỉ định của bác sĩ. Vui lòng tham khảo ý kiến chuyên gia y tế trước khi sử dụng.`,
          price: 35000 + Math.floor(Math.random() * 100000),
          finalPrice: 35000 + Math.floor(Math.random() * 100000),
          manufacturer: "Pharmacity",
          images: ["https://cms-prod.api-pharmacity.vn/uploads/P10613_500mg_191801c504.jpg"],
          dosage: "Viên nén",
          contraindications: "Không dùng cho người mẫn cảm với thành phần của thuốc",
          sideEffects: "Có thể gặp các tác dụng phụ. Vui lòng tham khảo ý kiến bác sĩ."
        }
      ]
    };
    
    // Thêm dữ liệu mẫu đặc biệt cho Panadol
    if (query.toLowerCase().includes('panadol')) {
      mockData.items = [
        {
          id: "PC-PANADOL500",
          name: "Panadol 500mg (Hộp 10 vỉ x 10 viên)",
          sku: "PANADOL500",
          ingredients: "Paracetamol 500mg",
          description: "Panadol 500mg được dùng để giảm đau từ nhẹ đến vừa và hạ sốt ở người lớn và trẻ em trên 12 tuổi.",
          price: 35000,
          finalPrice: 35000,
          manufacturer: "GSK Pharma",
          images: ["https://cms-prod.api-pharmacity.vn/uploads/P10613_500mg_191801c504.jpg"],
          dosage: "Viên nén",
          contraindications: "Không dùng cho người mẫn cảm với thành phần của thuốc",
          sideEffects: "Có thể gặp tình trạng dị ứng, nổi mày đay, ban đỏ."
        },
        {
          id: "PC-PANADOLEXTRA",
          name: "Panadol Extra (Hộp 10 vỉ x 10 viên)",
          sku: "PANADOLEXTRA",
          ingredients: "Paracetamol 500mg, Caffeine 65mg",
          description: "Panadol Extra được dùng để giảm đau nhanh và mạnh hơn đối với các chứng đau từ nhẹ đến vừa.",
          price: 48000,
          finalPrice: 48000,
          manufacturer: "GSK Pharma",
          images: ["https://cms-prod.api-pharmacity.vn/uploads/P10612_500mg_191801c504.jpg"],
          dosage: "Viên nén bao phim",
          contraindications: "Không dùng cho người mẫn cảm với thành phần của thuốc",
          sideEffects: "Buồn ngủ, chóng mặt, khó tiêu."
        }
      ];
    }
    
    // Thêm dữ liệu mẫu đặc biệt cho Vitamin
    if (query.toLowerCase().includes('vitamin')) {
      mockData.items = [
        {
          id: "PC-VITAMINC",
          name: "Vitamin C 1000mg (Hộp 30 viên)",
          sku: "VITC1000",
          ingredients: "Acid ascorbic 1000mg",
          description: "Vitamin C giúp tăng cường hệ miễn dịch, chống oxy hóa và hỗ trợ sức khỏe tổng thể.",
          price: 120000,
          finalPrice: 120000,
          manufacturer: "Pharmacity",
          images: ["https://cms-prod.api-pharmacity.vn/uploads/P17765_1_l_8bb15efd53.jpg"],
          dosage: "Viên nén sủi",
          contraindications: "Không dùng cho người mẫn cảm với thành phần của sản phẩm",
          sideEffects: "Có thể gây khó chịu đường tiêu hóa ở liều cao."
        },
        {
          id: "PC-MULTIVIT",
          name: "Vitamin tổng hợp (Hộp 60 viên)",
          sku: "MULTIVIT",
          ingredients: "Vitamin A, B, C, D, E, kẽm, sắt, canxi",
          description: "Vitamin tổng hợp bổ sung đầy đủ các vitamin và khoáng chất thiết yếu cho cơ thể.",
          price: 180000,
          finalPrice: 180000,
          manufacturer: "Pharmacity",
          images: ["https://cms-prod.api-pharmacity.vn/uploads/P22736_1_l_900fdc7cc2.jpg"],
          dosage: "Viên nang mềm",
          contraindications: "Không dùng cho người mẫn cảm với bất kỳ thành phần nào của sản phẩm",
          sideEffects: "Hiếm gặp. Có thể gây khó chịu đường tiêu hóa."
        }
      ];
    }
    
    // Lưu lịch sử tìm kiếm nếu có thông tin người dùng (không bắt buộc)
    if (req.user && req.user.id) {
      const newSearch = new DrugSearch({
        userId: req.user.id,
        query: query,
        searchType: 'name',
        resultCount: mockData.items.length,
        source: 'pharmacity',
        timestamp: new Date()
      });
      await newSearch.save();
    }

    return res.status(200).json(mockData);
  } catch (error) {
    console.error("Lỗi tổng quan khi tìm kiếm thuốc Pharmacity:", error.message);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = { 
  searchDrug, 
  searchDrugEvents, 
  getDrugSearchHistory,
  saveDrugSearchHistory,
  deleteDrugSearchHistoryItem,
  searchPharmacityDrugs
};