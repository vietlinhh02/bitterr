const pharmacityAPI = require('../services/pharmacityService');
const { scrapeProduct } = require('../services/productScraperService');
const fs = require('fs-extra');
const path = require('path');

// Thư mục lưu dữ liệu
const DATA_DIR = path.join(__dirname, '..', 'data', 'pharmacy');

// Đảm bảo thư mục tồn tại
fs.ensureDirSync(DATA_DIR);

// Tìm kiếm sản phẩm thuốc
exports.searchProducts = async (req, res) => {
  try {
    const { keyword, page = 1, limit = 20 } = req.query;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập từ khóa tìm kiếm'
      });
    }

    // Tìm kiếm từ Pharmacity API
    const searchResults = await pharmacityAPI.searchProducts(keyword, { 
      page: parseInt(page), 
      limit: parseInt(limit) 
    });

    // Lọc dữ liệu trả về để chỉ hiển thị thông tin có giá trị
    if (searchResults && searchResults.items && searchResults.items.length > 0) {
      searchResults.items = searchResults.items.map(item => {
        // Lọc bỏ các trường không có giá trị
        const filteredItem = {};
        
        // Danh sách các trường bắt buộc cần giữ lại
        const requiredFields = ['slug', 'name', 'price', 'thumbnail'];
        
        // Duyệt qua tất cả các trường của item
        Object.keys(item).forEach(key => {
          const value = item[key];
          
          // Giữ lại trường nếu:
          // 1. Là trường bắt buộc
          // 2. Có giá trị (không null, undefined, chuỗi rỗng, "Not found", "Không có mô tả")
          if (
            requiredFields.includes(key) || 
            (value !== null && 
             value !== undefined && 
             value !== '' && 
             value !== 'Not found' && 
             value !== 'Không có mô tả' &&
             !(typeof value === 'string' && value.trim() === ''))
          ) {
            filteredItem[key] = value;
          }
        });

        // Đảm bảo các trường quan trọng luôn tồn tại
        requiredFields.forEach(field => {
          if (!(field in filteredItem) && field in item) {
            filteredItem[field] = item[field];
          }
        });
        
        return filteredItem;
      });
    }

    // Trả về kết quả
    res.json({
      success: true,
      data: searchResults,
      message: `Tìm thấy ${searchResults.total || 0} kết quả cho "${keyword}"`
    });
  } catch (error) {
    console.error('Lỗi khi tìm kiếm sản phẩm:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi tìm kiếm sản phẩm'
    });
  }
};

// Lấy thông tin chi tiết sản phẩm
exports.getProductDetail = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin sản phẩm'
      });
    }

    // Kiểm tra xem dữ liệu đã được lưu trữ chưa
    const productDir = path.join(DATA_DIR, slug);
    const productJsonPath = path.join(productDir, 'data.json');
    
    let productData = null;
    let fromCache = false;
    
    // Nếu đã có dữ liệu và chưa quá hạn (1 tuần)
    try {
      if (await fs.pathExists(productJsonPath)) {
        const stats = await fs.stat(productJsonPath);
        const fileAge = Date.now() - stats.mtimeMs;
        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        
        if (fileAge < oneWeek) {
          // Dữ liệu còn mới, đọc từ file
          productData = JSON.parse(await fs.readFile(productJsonPath, 'utf8'));
          fromCache = true;
          console.log(`Đọc dữ liệu cache cho: ${slug}`);
        }
      }
    } catch (cacheError) {
      console.error('Lỗi khi đọc cache:', cacheError);
      // Tiếp tục nếu đọc cache thất bại
    }
    
    // Nếu không có cache hoặc cache hết hạn
    if (!productData) {
      try {
        // Thử scrape dữ liệu từ web trước
        productData = await scrapeProduct(slug, DATA_DIR);
      } catch (scrapeError) {
        console.error('Lỗi khi scrape dữ liệu:', scrapeError);
        // Không thành công thì thử lấy từ API
      }
      
      // Nếu scrape thất bại, thử lấy dữ liệu từ Pharmacity API
      if (!productData) {
        try {
          console.log('Lấy dữ liệu từ API cho:', slug);
          // Trích xuất SKU từ slug nếu có
          const skuMatch = slug.match(/P\d+/i);
          const sku = skuMatch ? skuMatch[0] : null;
          
          if (sku) {
            // Nếu tìm thấy SKU, dùng nó để lấy dữ liệu từ API
            const apiData = await pharmacityAPI.getProductBySlug(slug);
            
            if (apiData) {
              // Nếu có dữ liệu HTML từ API
              const hasDescriptionHtml = apiData.description_short || apiData.description;
              const hasIngredientsHtml = apiData.ingredients && apiData.ingredients.length > 0;
              
              // Chuyển đổi dữ liệu API sang định dạng phù hợp
              productData = {
                fromApi: true,
                name: apiData.name || 'Not found',
                price: apiData.variants && apiData.variants[0] ? 
                  `${apiData.variants[0].price.toLocaleString()} ₫/${apiData.variants[0].unit_name}` : 'Not found',
                originalPrice: apiData.variants && apiData.variants[0] && apiData.variants[0].original_price !== apiData.variants[0].price ? 
                  `${apiData.variants[0].original_price.toLocaleString()} ₫` : null,
                discount: apiData.variants && apiData.variants[0] && apiData.variants[0].discount_percent ? 
                  `Giảm ${apiData.variants[0].discount_percent}%` : null,
                sku: apiData.sku || 'Not found',
                brand: apiData.brand_name || 'Not found',
                images: apiData.images || [],
                // Thêm chi tiết từ API
                details: {
                  category: apiData.category_name || 'Không có thông tin',
                  manufacturer: apiData.brand_name || 'Không có thông tin',
                  specification: apiData.variants && apiData.variants[0] ? 
                    apiData.variants[0].unit_name : 'Không có thông tin'
                },
                // Thêm thông tin về đánh giá và lượt bán
                likes: apiData.sub_data && apiData.sub_data.total_liked ? apiData.sub_data.total_liked.toString() : '0',
                sold: apiData.sub_data && apiData.sub_data.total_sold ? apiData.sub_data.total_sold.toString() : '0',
                // Thông tin thuốc
                ingredients: apiData.ingredients || [],
                description: apiData.description_short || apiData.description || 'Không có mô tả',
                
                // Tạo HTML cho các phần từ dữ liệu API
                moTaHtml: hasDescriptionHtml ? 
                  `<h2><strong>${apiData.name} là gì?</strong></h2><div>${apiData.description_short || apiData.description}</div>` : null,
                
                thanhPhanHtml: hasIngredientsHtml ? 
                  `<h2><strong>Thành phần</strong></h2><ul>${apiData.ingredients.map(item => `<li>${item}</li>`).join('')}</ul>` : null,
                
                chiDinhHtml: apiData.usage ? 
                  `<h2><strong>Công dụng</strong></h2><div>${apiData.usage}</div>` : null,
                
                huongDanHtml: apiData.instruction ? 
                  `<h2><strong>Cách dùng</strong></h2><div>${apiData.instruction}</div>` : null,
                
                thanTrongHtml: apiData.precaution ? 
                  `<h2><strong>Lưu ý</strong></h2><div>${apiData.precaution}</div>` : null
              };
              
              // Cố gắng lưu dữ liệu vào cache để sử dụng sau này
              try {
                await fs.ensureDir(productDir);
                await fs.writeFile(
                  productJsonPath, 
                  JSON.stringify(productData, null, 2)
                );
                console.log(`Đã lưu dữ liệu API vào cache: ${slug}`);
              } catch (writeError) {
                console.error('Không thể lưu dữ liệu API vào cache:', writeError);
              }
            }
          }
        } catch (apiError) {
          console.error('Lỗi khi lấy dữ liệu từ API:', apiError);
        }
      }
    }

    if (!productData) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin sản phẩm'
      });
    }

    // Chuẩn hóa dữ liệu
    if (!productData.details) {
      productData.details = {};
    }
    
    // Định dạng dữ liệu trước khi trả về
    const formattedData = {
      ...productData,
      // Đảm bảo một số trường luôn tồn tại
      originalPrice: productData.originalPrice || null,
      discount: productData.discount || null,
      likes: productData.likes || '0',
      sold: productData.sold || '0'
    };

    // Trả về kết quả
    res.json({
      success: true,
      data: formattedData,
      source: fromCache ? 'cache' : (productData.fromApi ? 'api' : 'scraped')
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin sản phẩm:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy thông tin sản phẩm',
      error: error.message
    });
  }
};

// Lưu lịch sử tìm kiếm của người dùng
exports.saveSearchHistory = async (req, res) => {
  try {
    const { userId, keyword, results } = req.body;

    if (!userId || !keyword) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin người dùng hoặc từ khóa tìm kiếm'
      });
    }

    // Lưu lịch sử tìm kiếm vào database (không đề cập trong code này)
    // Ở đây chỉ là API placeholder

    res.json({
      success: true,
      message: 'Đã lưu lịch sử tìm kiếm thành công'
    });
  } catch (error) {
    console.error('Lỗi khi lưu lịch sử tìm kiếm:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lưu lịch sử tìm kiếm'
    });
  }
}; 