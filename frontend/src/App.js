import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { createTheme, ThemeProvider, CssBaseline, Typography, Box, Button, Container, Grid } from '@mui/material';
import { blue, teal, grey } from '@mui/material/colors';
import { MedicalServices as MedicalServicesIcon } from '@mui/icons-material';
import { UserProvider } from './contexts/UserContext';
import StopPropagationWrapper from './components/common/StopPropagationWrapper';
import MedicineDetection from './components/MedicineDetection';
import PharmacySearch from './components/PharmacySearch';
import PharmacyProductDetail from './components/PharmacyProductDetail';

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
//import GeminiMedicineDetection from './components/GeminiMedicineDetection';
import FavoriteDrugs from './components/FavoriteDrugs';
import DrugEventsSearch from './components/DrugEventsSearch';
//import Footer from './components/layout/Footer';

// Footer Pages
import Blog from './pages/footer/Blog';
import Database from './pages/footer/Database';
import Guides from './pages/footer/Guides';
import FAQ from './pages/footer/FAQ';
import About from './pages/footer/About';
import Contact from './pages/footer/Contact';
import Terms from './pages/footer/Terms';
import Privacy from './pages/footer/Privacy';
import NotFound from './components/NotFound';

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
              <Route path="/login" element={<Login redirectPath="/" />} />
              <Route path="/register" element={<Register />} />
              
              {/* Trang nhận diện thuốc */}
              <Route 
                path="/medicine-detection" 
                element={
                  <ProtectedRoute>
                    <MedicineDetection />
                  </ProtectedRoute>
                } 
              />
              
              {/* Trang tổng hợp tính năng */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Home />
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
              
              {/* Trang tìm kiếm sự kiện thuốc */}
              <Route 
                path="/drug-events" 
                element={
                  <ProtectedRoute>
                    <DrugEventsSearch />
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
              
              {/* Trang thuốc yêu thích */}
              <Route 
                path="/favorites" 
                element={
                  <ProtectedRoute>
                    <FavoriteDrugs />
                  </ProtectedRoute>
                } 
              />
              
              {/* Trang tìm kiếm thuốc Pharmacy */}
              <Route 
                path="/pharmacy-search" 
                element={
                  <ProtectedRoute>
                    <PharmacySearch />
                  </ProtectedRoute>
                } 
              />
              
              {/* Trang chi tiết sản phẩm Pharmacy */}
              <Route 
                path="/pharmacy-product/:slug" 
                element={
                  <ProtectedRoute>
                    <PharmacyProductDetail />
                  </ProtectedRoute>
                } 
              />
              
              {/* Footer Pages */}
              <Route path="/blog" element={<Blog />} />
              <Route path="/database" element={<Database />} />
              <Route path="/guides" element={<Guides />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              
              {/* Trang 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </StopPropagationWrapper>
        
        </Router>
      </ThemeProvider>
    </UserProvider>
  );
}

export default App;