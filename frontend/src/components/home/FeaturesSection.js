import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  Chip,
  useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  Chat as ChatIcon,
  PhotoCamera as PhotoCameraIcon,
  LocalPharmacy as LocalPharmacyIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

function FeaturesSection({ isLoggedIn }) {
  const theme = useTheme();
  const navigate = useNavigate();

  const features = [
    {
      icon: <PhotoCameraIcon fontSize="large" sx={{ color: '#9c27b0' }} />,
      title: 'Nhận diện thuốc từ ảnh',
      description: 'Tải lên ảnh thuốc và nhận thông tin chi tiết về loại thuốc được nhận diện.',
      path: '/medicine-detection',
      requiresAuth: true,
      color: '#e1bee7',
      isNew: true,
      highlight: true
    },
    {
      icon: <ChatIcon fontSize="large" sx={{ color: '#ff9800' }} />,
      title: 'Chat với AI về thuốc',
      description: 'Đặt câu hỏi và nhận thông tin chi tiết về thuốc từ trí tuệ nhân tạo.',
      path: '/chat',
      requiresAuth: true,
      color: '#ffe0b2',
      isNew: true,
      highlight: true
    },
    {
      icon: <SearchIcon fontSize="large" sx={{ color: '#2196f3' }} />,
      title: 'Tra cứu thuốc FDA',
      description: 'Tìm kiếm thông tin chi tiết về thuốc từ cơ sở dữ liệu FDA.',
      path: '/fda-drugs',
      requiresAuth: true,
      color: '#bbdefb'
    },
    {
      icon: <LocalPharmacyIcon fontSize="large" sx={{ color: '#4caf50' }} />,
      title: 'Tìm kiếm Pharmacy',
      description: 'Tìm kiếm sản phẩm từ các nhà thuốc trực tuyến.',
      path: '/pharmacy-search',
      requiresAuth: true,
      color: '#c8e6c9'
    },
    {
      icon: <HistoryIcon fontSize="large" sx={{ color: '#795548' }} />,
      title: 'Lịch sử tìm kiếm',
      description: 'Xem lại các thuốc bạn đã tìm kiếm trước đây.',
      path: '/search-history',
      requiresAuth: true,
      color: '#d7ccc8'
    },
    {
      icon: <PersonIcon fontSize="large" sx={{ color: '#607d8b' }} />,
      title: 'Tài khoản',
      description: 'Quản lý thông tin cá nhân và cài đặt tài khoản của bạn.',
      path: '/profile',
      requiresAuth: true,
      color: '#cfd8dc'
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
      bgcolor: 'background.paper', 
      py: 10,
      mt: 5,
      background: 'linear-gradient(180deg, rgba(224, 242, 241, 0.3) 0%, rgba(178, 223, 219, 0.2) 100%)'
    }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h4" 
            component="h2" 
            gutterBottom
            sx={{ 
              fontWeight: 800,
              mb: 3,
              position: 'relative',
              display: 'inline-block',
              '&::after': {
                content: '""',
                position: 'absolute',
                width: '60%',
                height: 4,
                bottom: -10,
                left: '20%',
                backgroundColor: 'primary.main',
                borderRadius: 2
              }
            }}
          >
            Tính năng chính
          </Typography>
          
          <Typography 
            variant="subtitle1"
            color="text.secondary"
            sx={{ maxWidth: 800, mx: 'auto', mt: 3 }}
          >
            Khám phá các tính năng mạnh mẽ giúp bạn tìm kiếm và hiểu rõ thông tin về thuốc
          </Typography>
        </Box>
        
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 4,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.01)',
                    boxShadow: '0 20px 30px rgba(0,0,0,0.1)',
                  },
                  cursor: 'pointer',
                  overflow: 'hidden',
                  position: 'relative'
                }}
                onClick={() => handleFeatureClick(feature.path, feature.requiresAuth)}
              >
                <Box sx={{ 
                  height: 15, 
                  bgcolor: feature.color,
                  width: '100%'
                }} />
                
                <Box sx={{ 
                  position: 'relative', 
                  display: 'flex', 
                  justifyContent: 'center',
                  mt: 2,
                  mb: 1
                }}>
                  <Avatar 
                    sx={{ 
                      width: 70, 
                      height: 70, 
                      bgcolor: feature.color,
                      boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
                    }}
                  >
                    {feature.icon}
                  </Avatar>
                  {feature.isNew && (
                    <Chip
                      label="MỚI"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: -10,
                        right: '30%',
                        bgcolor: '#f44336',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.6rem',
                        height: 24,
                        border: '2px solid white'
                      }}
                    />
                  )}
                </Box>
                
                <CardContent sx={{ flexGrow: 1, p: 3, pt: 2, textAlign: 'center' }}>
                  <Typography 
                    variant="h6" 
                    component="h3" 
                    gutterBottom
                    sx={{ fontWeight: 700, mb: 2 }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ mb: 2, fontSize: '0.95rem' }}
                  >
                    {feature.description}
                  </Typography>
                  
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                    {feature.requiresAuth && !isLoggedIn ? (
                      <Chip
                        label="Yêu cầu đăng nhập"
                        color="primary"
                        size="small"
                        sx={{ 
                          fontSize: '0.8rem', 
                          fontWeight: 500,
                          bgcolor: 'rgba(0, 150, 136, 0.1)',
                          color: 'primary.main',
                          border: '1px solid',
                          borderColor: 'primary.main'
                        }}
                      />
                    ) : (
                      <Button 
                        size="small" 
                        endIcon={<ArrowForwardIcon />}
                        variant={feature.highlight ? "contained" : "text"}
                        sx={{ 
                          fontSize: '0.85rem', 
                          color: feature.highlight ? 'white' : 'primary.main',
                          bgcolor: feature.highlight ? 'primary.main' : 'transparent',
                          '&:hover': { 
                            bgcolor: feature.highlight ? 'primary.dark' : 'rgba(0, 150, 136, 0.1)'
                          }
                        }}
                      >
                        {feature.highlight ? 'Dùng ngay' : 'Khám phá ngay'}
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

export default FeaturesSection;
