import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Button, 
  Paper,
  useTheme,
  useMediaQuery,
  Fade,
  Zoom
} from '@mui/material';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { Link } from 'react-router-dom';

function HeroSection({ isLoggedIn }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box 
      sx={{ 
        py: { xs: 8, md: 12 },
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #00796b 0%, #009688 70%, #4db6ac 100%)',
        color: 'white',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" fill="%23ffffff" fill-opacity="0.05" fill-rule="evenodd"/%3E%3C/svg%3E")',
          zIndex: 0
        }
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Fade in timeout={1000}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h2" 
                component="h1" 
                gutterBottom
                sx={{ 
                  fontWeight: 800,
                  fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
                  //textShadow: '0 2px 4px rgba(48, 66, 44, 0.7)',
                  background: 'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%);',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 2
                }}
              >
                BiiterNCKH
              </Typography>
              <Typography 
                variant="h4" 
                gutterBottom
                sx={{ 
                  fontWeight: 600,
                  fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                  mb: 3,
                  opacity: 0.95
                }}
              >
                Tra cứu thông tin thuốc thông minh
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 4, 
                  opacity: 0.9,
                  fontWeight: 400,
                  lineHeight: 1.6,
                  fontSize: { xs: '1rem', md: '1.25rem' },
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: -10,
                    top: 0,
                    height: '100%',
                    width: 4,
                    background: 'linear-gradient(180deg, #80cbc4 0%, transparent 100%)',
                    borderRadius: 2
                  },
                  pl: 2
                }}
              >
                Tìm kiếm thông tin chi tiết về thuốc, nhận diện thuốc từ ảnh và tương tác với AI để hiểu rõ hơn về thuốc bạn đang sử dụng.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 5 }}>
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
                  endIcon={<ArrowForwardIcon />}
                >
                  {isLoggedIn ? "Bắt đầu ngay" : "Đăng nhập để bắt đầu"}
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
                    Đăng ký
                  </Button>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box 
                sx={{ 
                  position: 'relative',
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Zoom in timeout={1200}>
                  <Paper 
                    elevation={16}
                    sx={{ 
                      width: '100%',
                      height: 400,
                      borderRadius: '20px',
                      overflow: 'hidden',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      bgcolor: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      position: 'relative',
                      transform: 'perspective(1500px) rotateY(-5deg)',
                      transition: 'transform 0.5s',
                      '&:hover': {
                        transform: 'perspective(1500px) rotateY(0deg)',
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%)',
                        zIndex: 1
                      }
                    }}
                  >
                    <Box 
                      component="img"
                      src="https://img.freepik.com/free-vector/pharmacy-medicine-concept-illustration_114360-7886.jpg"
                      alt="Pharmacy Illustration"
                      sx={{
                        width: '90%',
                        height: '90%',
                        objectFit: 'contain'
                      }}
                    />
                  </Paper>
                </Zoom>
              </Box>
            </Grid>
          </Grid>
        </Fade>
      </Container>
    </Box>
  );
}

export default HeroSection;
