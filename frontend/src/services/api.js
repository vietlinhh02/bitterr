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
  },
  withCredentials: true
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

// API tìm kiếm thuốc từ Pharmacity
export const searchPharmacityDrugs = async (keyword) => {
  const cacheKey = `pharmacity_search_${keyword}`;
  const cachedData = checkCache(cacheKey, 5 * 60 * 1000); // Cache 5 phút
  
  if (cachedData) {
    return { data: cachedData };
  }
  
  return throttleRequest(cacheKey, async () => {
    try {
      // Gọi API backend để proxy request đến Pharmacity
      const response = await API.get('/pharmacy/search', {
        params: {
          keyword : keyword.trim(),
          page: 1,
          limit: 12
        }
      });
      
      if (response.data.success) {
        saveCache(cacheKey, response.data.data);
      }
      
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tìm kiếm thuốc Pharmacity:', error);
      
      // Thông báo cho người dùng về việc cần backend proxy
      throw new Error('Không thể kết nối với API Pharmacity. Backend proxy chưa được cấu hình đúng.');
    }
  });
};

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

// API lưu lịch sử tìm kiếm Pharmacity
export const savePharmacitySearchHistory = (searchData) => API.post('/drug/save-search-history', {
  ...searchData,
  source: 'pharmacity'
});

// API xóa một mục trong lịch sử tìm kiếm thuốc
export const deleteDrugSearchHistoryItem = (searchId) => API.delete(`/drug/search-history/${searchId}`);

// API đăng nhập
export const login = (formData) => {
  console.log('Gửi yêu cầu đăng nhập với:', formData);
  return API.post('/auth/login', formData)
    .then(response => {
      console.log('Phản hồi đăng nhập:', response.data);
      return response;
    })
    .catch(error => {
      console.error('Chi tiết lỗi đăng nhập:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });
      throw error;
    });
};

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
    
    // Gửi dữ liệu trực tiếp không cần xử lý trung gian
    const response = await API.post('/gemini/ask', data);
    
    console.log('Gemini API response:', response);
    return response;
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

// API upload avatar
export const uploadAvatar = (formData) => {
  return API.post('/users/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// API để xử lý thuốc yêu thích
export const addFavoriteDrug = (drugData) => API.post('/favorites', drugData);

export const getFavoriteDrugs = () => API.get('/favorites');

export const removeFavoriteDrug = (favoriteId) => API.delete(`/favorites/${favoriteId}`);

export default API;