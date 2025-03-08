import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Paper,
  useTheme,
  useMediaQuery,
  Divider,
  Avatar,
  CardMedia,
  Chip,
  Stack
} from '@mui/material';
import { 
  Search as SearchIcon, 
  History as HistoryIcon, 
  Person as PersonIcon,
  Chat as ChatIcon,
  PhotoCamera as PhotoCameraIcon,
  LocalPharmacy as LocalPharmacyIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Healing as HealingIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';

function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('token') !== null;

  const features = [
    {
      icon: <SearchIcon fontSize="large" color="primary" />,
      title: 'Tra cứu thuốc FDA',
      description: 'Tìm kiếm thông tin chi tiết về thuốc từ cơ sở dữ liệu FDA.',
      path: '/fda-drugs',
      requiresAuth: true
    },
    {
      icon: <LocalPharmacyIcon fontSize="large" color="primary" />,
      title: 'Tìm kiếm Long Châu',
      description: 'Tìm kiếm sản phẩm từ nhà thuốc Long Châu.',
      path: '/longchau-search',
      requiresAuth: true
    },
    {
      icon: <PhotoCameraIcon fontSize="large" color="primary" />,
      title: 'Nhận diện thuốc từ ảnh',
      description: 'Tải lên ảnh thuốc và nhận thông tin chi tiết về loại thuốc được nhận diện.',
      path: '/image-detection',
      requiresAuth: true
    },
    {
      icon: <ChatIcon fontSize="large" color="primary" />,
      title: 'Chat với AI',
      description: 'Đặt câu hỏi và nhận thông tin chi tiết về thuốc từ trí tuệ nhân tạo.',
      path: '/chat',
      requiresAuth: true
    },
    {
      icon: <HistoryIcon fontSize="large" color="primary" />,
      title: 'Lịch sử tìm kiếm',
      description: 'Xem lại các thuốc bạn đã tìm kiếm trước đây.',
      path: '/search-history',
      requiresAuth: true
    },
    {
      icon: <PersonIcon fontSize="large" color="primary" />,
      title: 'Tài khoản',
      description: 'Quản lý thông tin cá nhân và cài đặt tài khoản của bạn.',
      path: '/profile',
      requiresAuth: true
    }
  ];

  const benefits = [
    {
      icon: <SpeedIcon fontSize="large" sx={{ color: theme.palette.success.main }} />,
      title: 'Tra cứu nhanh chóng',
      description: 'Tìm kiếm thông tin thuốc chỉ trong vài giây với giao diện trực quan.'
    },
    {
      icon: <SecurityIcon fontSize="large" sx={{ color: theme.palette.info.main }} />,
      title: 'Thông tin đáng tin cậy',
      description: 'Dữ liệu được lấy trực tiếp từ cơ sở dữ liệu FDA và Long Châu.'
    },
    {
      icon: <HealingIcon fontSize="large" sx={{ color: theme.palette.warning.main }} />,
      title: 'Hỗ trợ sức khỏe',
      description: 'Hiểu rõ về thuốc bạn đang sử dụng để đảm bảo an toàn và hiệu quả.'
    }
  ];

  const testimonials = [
    {
      name: 'Nguyễn Văn A',
      role: 'Dược sĩ',
      content: 'Ứng dụng này giúp tôi tra cứu thông tin thuốc nhanh chóng và chính xác. Tính năng nhận diện thuốc từ ảnh rất hữu ích trong công việc hàng ngày.',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
    },
    {
      name: 'Trần Thị B',
      role: 'Bác sĩ',
      content: 'Tôi thường xuyên sử dụng ứng dụng này để kiểm tra thông tin thuốc và tương tác thuốc. Chat với AI cung cấp câu trả lời nhanh chóng cho các câu hỏi của tôi.',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg'
    },
    {
      name: 'Lê Văn C',
      role: 'Người dùng',
      content: 'Ứng dụng rất dễ sử dụng và giúp tôi hiểu rõ hơn về thuốc tôi đang dùng. Tôi đặc biệt thích tính năng tìm kiếm sản phẩm từ Long Châu.',
      avatar: 'https://randomuser.me/api/portraits/men/3.jpg'
    }
  ];

  const handleFeatureClick = (path, requiresAuth) => {
    if (requiresAuth && !isLoggedIn) {
      navigate('/login');
    } else {
      navigate(path);
    }
  };

  return (
    <Box sx={{ 
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: 'background.default'
    }}>
      {/* Hero Section */}
      <Box 
        sx={{ 
          py: { xs: 8, md: 12 },
          bgcolor: 'primary.main',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          backgroundImage: 'linear-gradient(135deg, #00796b 0%, #009688 100%)',
          boxShadow: '0 4px 20px rgba(0, 121, 107, 0.3)'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h2" 
                component="h1" 
                gutterBottom
                sx={{ 
                  fontWeight: 800,
                  fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)'
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
                  opacity: 0.9
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
                  fontSize: { xs: '1rem', md: '1.25rem' }
                }}
              >
                Tìm kiếm thông tin chi tiết về thuốc, nhận diện thuốc từ ảnh và tương tác với AI để hiểu rõ hơn về thuốc bạn đang sử dụng.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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
                    fontSize: '1.1rem'
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
                      borderColor: 'white',
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
                <Paper 
                  elevation={8}
                  sx={{ 
                    width: '100%',
                    height: 350,
                    borderRadius: 4,
                    overflow: 'hidden',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    bgcolor: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    position: 'relative'
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
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Lợi ích Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography 
          variant="h4" 
          component="h2" 
          align="center" 
          gutterBottom
          sx={{ 
            fontWeight: 700,
            mb: 2
          }}
        >
          Lợi ích nổi bật
        </Typography>
        
        <Typography 
          variant="subtitle1" 
          align="center" 
          color="text.secondary"
          sx={{ mb: 6, maxWidth: 800, mx: 'auto' }}
        >
          Ứng dụng cung cấp nhiều lợi ích giúp bạn tra cứu thông tin thuốc một cách hiệu quả
        </Typography>
        
        <Grid container spacing={4}>
          {benefits.map((benefit, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper 
                elevation={2}
                sx={{ 
                  p: 4, 
                  height: '100%',
                  borderRadius: 4,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: 6
                  }
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <Box sx={{ mb: 2 }}>
                    {benefit.icon}
                  </Box>
                  <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                    {benefit.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {benefit.description}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container maxWidth="lg">
          <Typography 
            variant="h4" 
            component="h2" 
            align="center" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              mb: 2
            }}
          >
            Tính năng chính
          </Typography>
          
          <Typography 
            variant="subtitle1" 
            align="center" 
            color="text.secondary"
            sx={{ mb: 6, maxWidth: 800, mx: 'auto' }}
          >
            Khám phá các tính năng mạnh mẽ giúp bạn tìm kiếm và hiểu rõ thông tin về thuốc
          </Typography>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 6
                    },
                    cursor: 'pointer',
                    overflow: 'visible'
                  }}
                  onClick={() => handleFeatureClick(feature.path, feature.requiresAuth)}
                >
                  <Box sx={{ 
                    position: 'relative', 
                    display: 'flex', 
                    justifyContent: 'center',
                    mt: -3
                  }}>
                    <Avatar 
                      sx={{ 
                        width: 64, 
                        height: 64, 
                        bgcolor: 'primary.main',
                        boxShadow: '0 4px 10px rgba(0, 150, 136, 0.3)'
                      }}
                    >
                      {feature.icon}
                    </Avatar>
                  </Box>
                  <CardContent sx={{ flexGrow: 1, p: 3, pt: 4, textAlign: 'center' }}>
                    <Typography 
                      variant="h6" 
                      component="h3" 
                      gutterBottom
                      sx={{ fontWeight: 600 }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {feature.description}
                    </Typography>
                    
                    {feature.requiresAuth && !isLoggedIn && (
                      <Chip
                        label="Yêu cầu đăng nhập"
                        color="primary"
                        size="small"
                        variant="outlined"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography 
          variant="h4" 
          component="h2" 
          align="center" 
          gutterBottom
          sx={{ 
            fontWeight: 700,
            mb: 2
          }}
        >
          Người dùng nói gì về chúng tôi
        </Typography>
        
        <Typography 
          variant="subtitle1" 
          align="center" 
          color="text.secondary"
          sx={{ mb: 6, maxWidth: 800, mx: 'auto' }}
        >
          Trải nghiệm của người dùng với ứng dụng tra cứu thông tin thuốc
        </Typography>
        
        <Grid container spacing={4}>
          {testimonials.map((testimonial, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  p: 3
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    sx={{ width: 56, height: 56, mr: 2 }}
                  />
                  <Box>
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                      {testimonial.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {testimonial.role}
                    </Typography>
                  </Box>
                </Box>
                <Typography 
                  variant="body1" 
                  color="text.secondary"
                  sx={{ 
                    flexGrow: 1,
                    fontStyle: 'italic',
                    position: 'relative',
                    pl: 2,
                    '&:before': {
                      content: '"""',
                      position: 'absolute',
                      left: -5,
                      top: -10,
                      fontSize: '2rem',
                      color: 'primary.light',
                      opacity: 0.5
                    }
                  }}
                >
                  {testimonial.content}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box 
        sx={{ 
          bgcolor: 'primary.main', 
          color: 'white', 
          py: 8,
          backgroundImage: 'linear-gradient(135deg, #00796b 0%, #009688 100%)'
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="h4" 
              component="h2" 
              gutterBottom
              sx={{ fontWeight: 700 }}
            >
              Bắt đầu tra cứu thông tin thuốc ngay hôm nay
            </Typography>
            
            <Typography 
              variant="h6" 
              sx={{ mb: 4, opacity: 0.9, maxWidth: 700, mx: 'auto' }}
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
                  fontSize: '1.1rem'
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
                    borderColor: 'white',
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
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'background.paper', py: 4, borderTop: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Typography 
            variant="body2" 
            align="center"
            color="text.secondary"
          >
            © {new Date().getFullYear()} BiiterNCKH - Ứng dụng tra cứu thông tin thuốc thông minh
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

export default Home; 