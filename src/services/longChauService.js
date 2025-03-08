const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scrape thông tin thuốc từ trang Long Châu dựa vào URL hoặc slug
 * @param {string} urlOrSlug - URL hoặc slug của sản phẩm
 * @returns {Object} - Thông tin chi tiết về thuốc
 */
const scrapeDrugInfo = async (urlOrSlug) => {
  try {
    // Xử lý URL
    let fullUrl = urlOrSlug;
    if (!urlOrSlug.startsWith('http')) {
      fullUrl = `https://nhathuoclongchau.com.vn/${urlOrSlug}`;
    }

    // Kiểm tra URL có phải từ Long Châu không
    if (!fullUrl.includes('nhathuoclongchau.com.vn')) {
      throw new Error('URL không phải từ Nhà thuốc Long Châu');
    }

    console.log('Đang crawl dữ liệu từ URL:', fullUrl);

    const response = await axios.get(fullUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Referer': 'https://nhathuoclongchau.com.vn'
      },
      maxRedirects: 5,
      validateStatus: function (status) {
        return status >= 200 && status < 500; // Chấp nhận status code từ 200-499
      }
    });

    // Kiểm tra nếu là trang 404
    if (response.status === 404) {
      throw new Error('Không tìm thấy sản phẩm');
    }

    const $ = cheerio.load(response.data);
    
    // Thử các selector khác nhau cho tên sản phẩm
    const name = $('.product-detail__name h1').text().trim() || 
                $('.product-name').text().trim() ||
                $('h1').text().trim();

    // Thử các selector khác nhau cho giá
    const price = $('.product-detail__price-final').text().trim() ||
                 $('.product-price').text().trim() ||
                 $('.price').text().trim() ||
                 $('.product-detail__price').text().trim() ||
                 'Không có thông tin';

    // Thử các selector khác nhau cho hình ảnh
    const imageUrl = $('.product-image__main img').attr('src') ||
                    $('.product-image img').attr('src') ||
                    $('img[alt="' + name + '"]').attr('src');

    // Lấy thông tin chi tiết từ các tab với nhiều selector khác nhau
    const description = $('.product-detail__description').html() || 
                       $('.description').html() || 
                       $('.product-description').html() || '';

    const ingredient = $('.product-detail__ingredient').html() || 
                      $('.ingredient').html() || 
                      $('.product-ingredient').html() || '';

    const usage = $('.product-detail__usage').html() || 
                 $('.usage').html() || 
                 $('.product-usage').html() || '';

    const dosage = $('.product-detail__dosage').html() || 
                  $('.dosage').html() || 
                  $('.product-dosage').html() || '';

    const adverseEffect = $('.product-detail__side-effects').html() || 
                         $('.side-effects').html() || 
                         $('.product-side-effects').html() || '';

    const careful = $('.product-detail__precautions').html() || 
                   $('.precautions').html() || 
                   $('.product-precautions').html() || '';

    const preservation = $('.product-detail__storage').html() || 
                        $('.storage').html() || 
                        $('.product-storage').html() || '';

    // Log để debug
    console.log('HTML Content:', {
      name,
      price,
      imageUrl,
      descriptionExists: !!description,
      ingredientExists: !!ingredient,
      usageExists: !!usage
    });

    // Tạo đối tượng kết quả
    const drugInfo = {
      name,
      price,
      imageUrl,
      description: cleanHtml(description),
      ingredient: cleanHtml(ingredient),
      usage: cleanHtml(usage),
      dosage: cleanHtml(dosage),
      adverseEffect: cleanHtml(adverseEffect),
      careful: cleanHtml(careful),
      preservation: cleanHtml(preservation),
      source: 'Long Châu',
      url: fullUrl,
      crawlTime: new Date().toISOString(),
      isRealData: true
    };

    // Kiểm tra dữ liệu tối thiểu
    if (!drugInfo.name) {
      console.log('Raw HTML:', response.data);
      throw new Error('Không thể tìm thấy tên sản phẩm');
    }
    
    return drugInfo;
  } catch (error) {
    console.error('Lỗi khi crawl thông tin thuốc từ Long Châu:', error);
    throw new Error(`Không thể lấy thông tin thuốc: ${error.message}`);
  }
};

// Hàm làm sạch HTML
const cleanHtml = (html) => {
  if (!html) return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .trim();
};

/**
 * Tìm kiếm thuốc trên Long Châu và trả về danh sách kết quả
 * @param {string} keyword - Từ khóa tìm kiếm
 * @returns {Object} - Kết quả tìm kiếm bao gồm keywords, categories và products
 */
const searchDrugOnLongChau = async (keyword) => {
  try {
    const searchUrl = `https://api.nhathuoclongchau.com.vn/lccus/search-product-service/api/products/ecom/product/suggest?keyword=${encodeURIComponent(keyword)}`;
    
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    });
    
    // Kiểm tra và xử lý dữ liệu trả về
    const data = response.data;
    if (!data) {
      throw new Error('Không nhận được dữ liệu từ API');
    }

    // Trả về toàn bộ kết quả bao gồm keywords, categories và products
    return {
      keywords: data.keywords || [],
      categories: data.categories || [],
      products: data.products || []
    };
    
  } catch (error) {
    console.error('Lỗi khi tìm kiếm thuốc trên Long Châu:', error);
    throw new Error(`Không thể tìm kiếm thuốc: ${error.message}`);
  }
};

module.exports = {
  scrapeDrugInfo,
  searchDrugOnLongChau
}; 