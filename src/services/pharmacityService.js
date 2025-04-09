const axios = require('axios');

class PharmacityAPI {
  constructor() {
    this.client = axios.create({
      baseURL: 'https://api-gateway.pharmacity.vn',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  }

  async searchProducts(keyword, { page = 1, limit = 20 } = {}) {
    try {
      // Encode từng ký tự của keyword thay vì encode toàn bộ chuỗi
      const encodedKeyword = keyword.split('').map(char => encodeURIComponent(char)).join('');
      
      console.log('Tìm kiếm với keyword đã encode:', encodedKeyword);
      console.log('API URL:', this.client.defaults.baseURL + '/pmc-ecm-product/api/public/search/index');
      
      const response = await this.client.get('/pmc-ecm-product/api/public/search/index', {
        params: {
          platform: 1,
          index: page,
          limit,
          total: 0,
          refresh: true,
          keyword: encodedKeyword,
          order: 'desc',
          order_by: 'de-xuat'
        }
      });
      
      const searchData = response.data.data;
      console.log('Kết quả tìm kiếm:', searchData ? searchData.total : 'Không có dữ liệu');
      
      // Đảm bảo trả về đúng định dạng với thumbnail
      return searchData;
    } catch (error) {
      console.error(`Error searching for "${keyword}":`, error.message);
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Response data:', error.response.data);
      } else if (error.request) {
        console.error('No response received:', error.request);
      }
      return { total: 0, items: [] };
    }
  }

  async getProductBySlug(slug) {
    try {
      const response = await this.client.get(`/pmc-ecm-product/api/public/product/${slug}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching product "${slug}":`, error.message);
      return null;
    }
  }
}

module.exports = new PharmacityAPI(); 