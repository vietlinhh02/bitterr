import axios from 'axios';

// Lấy API URL từ biến môi trường
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

console.log('Using API URL:', API_URL);

// Số lần thử lại kết nối
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // ms

// Tạo một instance axios với baseURL được cấu hình
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000, // Tăng timeout lên 15 giây
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Cho phép gửi cookies
});

// Interceptor để xử lý token authentication
axiosInstance.interceptors.request.use(
  (config) => {
    // Thêm thông tin retry vào config nếu chưa có
    if (config.retry === undefined) {
      config.retry = 0;
    }

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Interceptor để xử lý lỗi response
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`Response: ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    const originalConfig = error.config;

    // Kiểm tra nếu là lỗi network và có thể retry
    if (
      (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') && 
      originalConfig && 
      originalConfig.retry < MAX_RETRIES
    ) {
      originalConfig.retry += 1;
      console.log(`Network error - Retrying (${originalConfig.retry}/${MAX_RETRIES})...`);
      
      // Delay trước khi retry
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      
      // Thử lại request
      return axiosInstance(originalConfig);
    }

    // Nếu đã retry quá số lần cho phép hoặc lỗi khác
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      console.error('Network error - server may be down or unreachable');
      error.isNetworkError = true;
      error.userMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại sau.';
    }
    
    // Xử lý lỗi 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      console.log('Unauthorized, redirecting to login...');
      error.userMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      // Có thể thêm redirect đến trang login ở đây
    }

    // Xử lý lỗi 404 (Not Found)
    if (error.response && error.response.status === 404) {
      error.userMessage = 'Không tìm thấy tài nguyên yêu cầu.';
    }
    
    // Xử lý lỗi 500 (Server Error)
    if (error.response && error.response.status >= 500) {
      error.userMessage = 'Đã xảy ra lỗi từ máy chủ. Vui lòng thử lại sau.';
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance; 