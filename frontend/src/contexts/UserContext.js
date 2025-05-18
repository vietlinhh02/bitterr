import React, { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      // Khôi phục thông tin user từ localStorage khi component được mount
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        
        // Xóa bỏ phần code kết hợp API key từ localStorage
        // Không sử dụng API key từ localStorage để tránh lộn API key giữa các tài khoản
        setUser(userData);
      }
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      // Xóa dữ liệu người dùng không hợp lệ
      localStorage.removeItem('user');
    }
  }, []);

  const updateUser = (newUserData) => {
    try {
      // Cập nhật thông tin user trong context và localStorage
      if (newUserData) {
        // Thêm timestamp cho việc cập nhật để tránh vấn đề cache
        const userWithTimestamp = {
          ...newUserData,
          _lastUpdated: new Date().getTime()
        };
        
        // Cập nhật state
        setUser(userWithTimestamp);
        
        // Cập nhật localStorage
        localStorage.setItem('user', JSON.stringify(userWithTimestamp));
        
        // Xóa các cache khác có thể chứa thông tin người dùng cũ
        sessionStorage.removeItem('userProfileCache');
      }
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  const clearUser = () => {
    try {
      // Xóa tất cả thông tin người dùng khỏi state và storage
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('geminiApiKey'); // Luôn xóa API key khi đăng xuất
      sessionStorage.removeItem('userProfileCache');
      
      console.log('Đã xóa thông tin người dùng cũ');
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  };

  const updateAvatar = (avatarUrl) => {
    try {
      // Cập nhật avatar trong context và localStorage
      if (user) {
        const updatedUser = { 
          ...user, 
          avatar: avatarUrl,
          _lastUpdated: new Date().getTime()
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        sessionStorage.removeItem('userProfileCache');
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
    }
  };
  
  const updateGeminiApiKey = (apiKey) => {
    try {
      // Cập nhật Gemini API key trong context và localStorage
      if (user) {
        const updatedUser = { 
          ...user, 
          geminiApiKey: apiKey,
          _lastUpdated: new Date().getTime()
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      // Lưu key vào localStorage cũ để tương thích với code đã tồn tại
      if (apiKey) {
        localStorage.setItem('geminiApiKey', apiKey);
      } else {
        localStorage.removeItem('geminiApiKey');
      }
      
      // Xóa cache
      sessionStorage.removeItem('userProfileCache');
    } catch (error) {
      console.error('Error updating Gemini API key:', error);
      // Đảm bảo vẫn lưu API key vào localStorage ngay cả khi có lỗi
      if (apiKey) {
        localStorage.setItem('geminiApiKey', apiKey);
      } else {
        localStorage.removeItem('geminiApiKey');
      }
    }
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      updateUser,
      clearUser, 
      updateAvatar, 
      updateGeminiApiKey,
      hasGeminiApiKey: !!((user && user.geminiApiKey) || localStorage.getItem('geminiApiKey'))
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext; 