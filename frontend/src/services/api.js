import axios from 'axios';

// Thêm cache và throttling
const API_CACHE = {};
const THROTTLE_TIMERS = {};
const THROTTLE_DELAY = 2000; // 2 giây giữa các request

// Hàm throttle để hạn chế tần suất gọi API
const throttleRequest = (key, callback) => {
  if (THROTTLE_TIMERS[key]) {
    console.log(`Request ${key} đang bị throttle, bỏ qua...`);
    return Promise.reject(new Error('Đang có quá nhiều request, vui lòng thử lại sau.'));
  }

  THROTTLE_TIMERS[key] = setTimeout(() => {
    delete THROTTLE_TIMERS[key];
  }, THROTTLE_DELAY);

  return callback();
};

// Hàm kiểm tra cache
const checkCache = (cacheKey, expirationTime = 60000) => { // Mặc định 1 phút
  if (API_CACHE[cacheKey]) {
    const { timestamp, data } = API_CACHE[cacheKey];
    const now = Date.now();
    
    // Kiểm tra xem cache có còn hiệu lực không
    if (now - timestamp < expirationTime) {
      console.log(`Sử dụng dữ liệu cache cho ${cacheKey}`);
      return data;
    }
  }
  return null;
};

// Hàm lưu cache
const saveCache = (cacheKey, data) => {
  API_CACHE[cacheKey] = {
    timestamp: Date.now(),
    data
  };
};

const API = axios.create({ 
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Thêm interceptor để đính kèm token vào mỗi request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Thêm interceptor để xử lý lỗi
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Xử lý lỗi 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      // Kiểm tra xem có phải là lỗi token hết hạn không
      const isTokenExpired = error.response.data && 
        (error.response.data.message === 'Token expired' || 
         error.response.data.message === 'Invalid token');
      
      if (isTokenExpired) {
        // Xóa token và chuyển hướng đến trang đăng nhập
        localStorage.removeItem('token');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

// API tìm kiếm thuốc từ FDA
export const searchFDADrugs = (keyword) => API.get(`/drug/search?query=${keyword}`);

// API tìm kiếm sự kiện thuốc từ FDA
export const searchDrugEvents = (params) => {
  // Xây dựng query string từ các tham số
  const queryParams = new URLSearchParams();
  
  if (params.medicinalproduct) queryParams.append('medicinalproduct', params.medicinalproduct);
  if (params.reactionmeddrapt) queryParams.append('reactionmeddrapt', params.reactionmeddrapt);
  if (params.reportercountry) queryParams.append('reportercountry', params.reportercountry);
  if (params.serious) queryParams.append('serious', params.serious);
  if (params.limit) queryParams.append('limit', params.limit);
  
  return API.get(`/drug/drug-events?${queryParams.toString()}`);
};

// API lấy lịch sử tìm kiếm thuốc
export const getDrugSearchHistory = () => API.get('/drug/search-history');

// API lưu lịch sử tìm kiếm thuốc
export const saveDrugSearchHistory = (searchData) => API.post('/drug/save-search-history', searchData);

// API lưu lịch sử tìm kiếm Long Châu
export const saveLongChauSearchHistory = (searchData) => API.post('/drug/save-search-history', {
  ...searchData,
  source: 'longchau'
});

// API xóa một mục trong lịch sử tìm kiếm thuốc
export const deleteDrugSearchHistoryItem = (searchId) => API.delete(`/drug/search-history/${searchId}`);

// API đăng nhập
export const login = (formData) => API.post('/auth/login', formData);

// API đăng ký
export const register = (formData) => API.post('/auth/register', formData);

// API lấy thông tin người dùng
export const getUserProfile = () => API.get('/users/profile');

// API cập nhật thông tin người dùng
export const updateUserProfile = (userData) => API.put('/users/profile', userData);

// API đổi mật khẩu
export const changePassword = (passwordData) => API.put('/users/change-password', passwordData);

// API nhận diện thuốc từ ảnh
export const detectDrugFromImage = (formData) => {
  return API.post('/detect/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// API hỏi AI về thuốc đã detect
export const askAIAboutDrug = (data) => {
  return API.post('/detect/ask', data, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

// API dịch nội dung thuốc
export const translateDrugContent = (content, targetLanguage) => {
  return API.post('/translate', { content, targetLanguage });
};

// API hỏi Gemini về thuốc
export const askGeminiAboutDrug = async (data) => {
  try {
    console.log('Sending request to Gemini API:', data);
    
    // Kiểm tra xem data có định dạng mới không (messages array)
    if (data.messages && Array.isArray(data.messages)) {
      // Định dạng mới với messages và drugInfo
      const response = await API.post('/gemini/ask', {
        messages: data.messages,
        drugInfo: data.drugInfo,
        drugQuery: data.drugQuery
      });
      console.log('Gemini API response:', response);
      return response;
    } else if (data.productInfo && data.question) {
      // Định dạng cũ với productInfo và question
      const response = await API.post('/gemini/ask', {
        productInfo: data.productInfo,
        question: data.question
      });
      console.log('Gemini API response:', response);
      return response;
    } else {
      throw new Error('Invalid data format for Gemini API');
    }
  } catch (error) {
    console.error('Lỗi khi gọi Gemini API:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    throw error;
  }
};

// API lấy lịch sử chat
export const getChatHistory = () => API.get('/chat-history');

// API xóa một mục trong lịch sử chat
export const deleteChatHistoryItem = (chatId) => API.delete(`/chat-history/${chatId}`);

// API tìm kiếm sản phẩm từ Nhà thuốc Long Châu
export const searchLongChauProducts = async (keyword) => {
  try {
    // Tạo cacheKey dựa trên từ khóa
    const cacheKey = `longchau_search_${keyword}`;
    
    // Kiểm tra cache trước
    const cachedData = checkCache(cacheKey, 300000); // Cache 5 phút
    if (cachedData) {
      return cachedData;
    }
    
    console.log('Gọi API tìm kiếm với từ khóa:', keyword);
    
    // Sử dụng API mới từ backend
    const response = await API.get(`/longchau/search?keyword=${encodeURIComponent(keyword)}`);
    
    if (response.data && response.data.success) {
      // Lưu kết quả vào cache
      saveCache(cacheKey, response.data.data);
      return response.data.data;
    } else {
      throw new Error(response.data?.message || 'Không thể tìm kiếm sản phẩm');
    }
  } catch (error) {
    console.error('Lỗi khi tìm kiếm sản phẩm Long Châu:', error);
    throw error;
  }
};

// API lấy thông tin chi tiết sản phẩm từ Long Châu
export const getLongChauDrugInfo = async (slug) => {
  try {
    // Tạo cacheKey dựa trên slug
    const cacheKey = `longchau_product_${slug}`;
    
    // Kiểm tra cache trước
    const cachedData = checkCache(cacheKey, 300000); // Cache 5 phút
    if (cachedData) {
      return cachedData;
    }
    
    console.log('Gọi API lấy thông tin chi tiết sản phẩm với slug:', slug);
    
    // Gọi API backend với endpoint đúng
    const response = await API.get(`/longchau/drug-infos?url=${encodeURIComponent(slug)}`);
    
    if (response.data && response.data.success) {
      // Lưu kết quả vào cache
      saveCache(cacheKey, response.data.data);
      return response.data.data;
    } else {
      throw new Error(response.data?.message || 'Không thể lấy thông tin sản phẩm');
    }
  } catch (error) {
    console.error('Lỗi khi lấy thông tin sản phẩm Long Châu:', error);
    throw error;
  }
};

// API upload avatar
export const uploadAvatar = (formData) => {
  return API.post('/users/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export default API;