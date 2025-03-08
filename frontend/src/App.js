import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { createTheme, ThemeProvider, CssBaseline, Typography, Box, Button } from '@mui/material';
import { blue, teal, grey } from '@mui/material/colors';
import { UserProvider } from './contexts/UserContext';
import StopPropagationWrapper from './components/common/StopPropagationWrapper';

// Components
import Navigation from './components/Navigation';
import Home from './components/Home';
import FDADrugSearch from './components/FDADrugSearch';
import FDADrugDetail from './components/FDADrugDetail';
import Login from './components/Login';
import Register from './components/Register';
import DrugSearchHistory from './components/DrugSearchHistory';
import ChatWithAI from './components/ChatWithAI';
import UserProfile from './components/UserProfile';
import ImageDrugDetection from './components/ImageDrugDetection';
import LongChauSearch from './components/LongChauSearch';
import LongChauProductDetail from './components/LongChauProductDetail';
import AllFeatures from './components/AllFeatures';

// Tạo theme cho ứng dụng
const theme = createTheme({
  palette: {
    primary: {
      main: teal[700],
      light: teal[500],
      dark: teal[900],
    },
    secondary: {
      main: blue[600],
      light: blue[400],
      dark: blue[800],
    },
    background: {
      default: grey[50],
      paper: '#ffffff',
    },
    text: {
      primary: grey[900],
      secondary: grey[700],
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Segoe UI',
      'Arial',
      'sans-serif',
    ].join(','),
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
        },
        containedPrimary: {
          boxShadow: '0 4px 6px rgba(0, 150, 136, 0.2)',
          '&:hover': {
            boxShadow: '0 6px 10px rgba(0, 150, 136, 0.3)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        },
        elevation1: {
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
          borderRadius: 12,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

// Kiểm tra xem người dùng đã đăng nhập chưa
const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

// Component bảo vệ route yêu cầu đăng nhập
const ProtectedRoute = ({ children }) => {
  console.log('ProtectedRoute được gọi, kiểm tra xác thực');
  if (!isAuthenticated()) {
    console.log('Người dùng chưa đăng nhập, chuyển hướng đến trang đăng nhập');
    return <Navigate to="/login" />;
  }
  console.log('Người dùng đã đăng nhập, hiển thị nội dung được bảo vệ');
  return children;
};

function App() {
  return (
    <UserProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <StopPropagationWrapper>
            <Navigation />
            <Routes>
              {/* Trang chủ */}
              <Route path="/" element={<Home />} />
              
              {/* Trang đăng nhập và đăng ký */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Trang tổng hợp tính năng */}
              <Route 
                path="/features" 
                element={
                  <ProtectedRoute>
                    <AllFeatures />
                  </ProtectedRoute>
                } 
              />
              
              {/* Trang tìm kiếm thuốc */}
              <Route 
                path="/fda-drugs" 
                element={
                  <ProtectedRoute>
                    <FDADrugSearch />
                  </ProtectedRoute>
                } 
              />
              
              {/* Trang chi tiết thuốc */}
              <Route 
                path="/fda-drugs/:id" 
                element={
                  <ProtectedRoute>
                    <FDADrugDetail />
                  </ProtectedRoute>
                } 
              />
              
              {/* Trang lịch sử tìm kiếm */}
              <Route 
                path="/search-history" 
                element={
                  <ProtectedRoute>
                    <DrugSearchHistory />
                  </ProtectedRoute>
                } 
              />
              
              {/* Trang chat với AI */}
              <Route 
                path="/chat" 
                element={
                  <ProtectedRoute>
                    <ChatWithAI />
                  </ProtectedRoute>
                } 
              />
              
              {/* Trang profile người dùng */}
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                } 
              />
              
              {/* Trang nhận diện thuốc từ ảnh */}
              <Route 
                path="/image-detection" 
                element={
                  <ProtectedRoute>
                    <ImageDrugDetection />
                  </ProtectedRoute>
                } 
              />
              
              {/* Trang tìm kiếm sản phẩm Long Châu */}
              <Route 
                path="/longchau-search" 
                element={
                  <ProtectedRoute>
                    <LongChauSearch />
                  </ProtectedRoute>
                } 
              />
              
              {/* Trang chi tiết sản phẩm Long Châu */}
              <Route 
                path="/longchau/product/:slug" 
                element={
                  <ProtectedRoute>
                    <LongChauProductDetail />
                  </ProtectedRoute>
                } 
              />
              
              {/* Route mặc định khi không tìm thấy */}
              <Route path="*" element={
                <div>
                  <Typography variant="h4" align="center" sx={{ mt: 4 }}>
                    Không tìm thấy trang
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Button 
                      variant="contained" 
                      component={Link} 
                      to="/"
                    >
                      Quay về trang chủ
                    </Button>
                  </Box>
                </div>
              } />
            </Routes>
          </StopPropagationWrapper>
        </Router>
      </ThemeProvider>
    </UserProvider>
  );
}

export default App; 