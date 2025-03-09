import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Slide
} from '@mui/material';
import { Link } from 'react-router-dom';

function CTASection({ isLoggedIn }) {
  return (
    <Box 
      sx={{ 
        bgcolor: 'primary.main', 
        color: 'white', 
        py: 8,
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: 'linear-gradient(135deg, #00796b 0%, #009688 100%)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5z" fill="%23ffffff" fill-opacity="0.05" fill-rule="evenodd"/%3E%3C/svg%3E")',
          zIndex: 0
        }
      }}
    >
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <Slide direction="up" in={true} timeout={1000}>
          <Paper 
            elevation={16} 
            sx={{
              borderRadius: 4,
              py: 5,
              px: { xs: 3, md: 5 },
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <Typography 
              variant="h4" 
              component="h2" 
              gutterBottom
              sx={{ fontWeight: 700, color: 'white' }}
            >
              Bắt đầu tra cứu thông tin thuốc ngay hôm nay
            </Typography>
            
            <Typography 
              variant="h6" 
              sx={{ mb: 4, color: 'white', opacity: 0.9, maxWidth: 700, mx: 'auto' }}
            >
              Đăng ký tài khoản miễn phí và trải nghiệm tất cả các tính năng của ứng dụng
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
              <Button 
                variant="contained" 
                size="large"
                color="secondary"
                component={Link}
                to={isLoggedIn ? "/fda-drugs" : "/login"}
                sx={{ 
                  px: 4, 
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  boxShadow: '0 4px 14px rgba(255, 193, 7, 0.4)',
                  background: 'linear-gradient(45deg, #ff9800 30%, #ffb74d 90%)',
                  '&:hover': {
                    boxShadow: '0 6px 18px rgba(255, 193, 7, 0.6)',
                  }
                }}
              >
                {isLoggedIn ? "Bắt đầu tra cứu" : "Đăng nhập"}
              </Button>
              {!isLoggedIn && (
                <Button 
                  variant="outlined" 
                  size="large"
                  component={Link}
                  to="/register"
                  sx={{ 
                    px: 4, 
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    color: 'white',
                    borderColor: 'rgba(255, 255, 255, 0.7)',
                    borderWidth: 2,
                    fontSize: '1.1rem',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  Đăng ký ngay
                </Button>
              )}
            </Box>
          </Paper>
        </Slide>
      </Container>
    </Box>
  );
}

export default CTASection;
