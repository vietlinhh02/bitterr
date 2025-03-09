import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Avatar,
  Zoom
} from '@mui/material';
import {
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Healing as HealingIcon
} from '@mui/icons-material';

function BenefitsSection() {
  const benefits = [
    {
      icon: <SpeedIcon fontSize="large" sx={{ color: '#4caf50' }} />,
      title: 'Tra cứu nhanh chóng',
      description: 'Tìm kiếm thông tin thuốc chỉ trong vài giây với giao diện trực quan.',
      animation: 'zoom-in-up',
      delay: 100
    },
    {
      icon: <SecurityIcon fontSize="large" sx={{ color: '#2196f3' }} />,
      title: 'Thông tin đáng tin cậy',
      description: 'Dữ liệu được lấy trực tiếp từ cơ sở dữ liệu FDA và Long Châu.',
      animation: 'zoom-in-up',
      delay: 300
    },
    {
      icon: <HealingIcon fontSize="large" sx={{ color: '#ff9800' }} />,
      title: 'Hỗ trợ sức khỏe',
      description: 'Hiểu rõ về thuốc bạn đang sử dụng để đảm bảo an toàn và hiệu quả.',
      animation: 'zoom-in-up',
      delay: 500
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ paddingTop: 50 }}>
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
              backgroundColor: 'secondary.main',
              borderRadius: 2
            }
          }}
        >
          Lợi ích nổi bật
        </Typography>
        
        <Typography 
          variant="subtitle1" 
          color="text.secondary"
          sx={{ maxWidth: 800, mx: 'auto', mt: 3 }}
        >
          Ứng dụng cung cấp nhiều lợi ích giúp bạn tra cứu thông tin thuốc một cách hiệu quả
        </Typography>
      </Box>
      
      <Grid container spacing={6}>
        {benefits.map((benefit, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Zoom in timeout={1000} style={{ transitionDelay: `${benefit.delay}ms` }}>
              <Paper 
                elevation={6}
                sx={{ 
                  p: 5, 
                  height: '100%',
                  borderRadius: 6,
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-10px)',
                    boxShadow: 12
                  },
                  background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <Box 
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 100,
                    height: 100,
                    background: 'radial-gradient(circle at top right, rgba(0, 150, 136, 0.1), transparent 70%)',
                    zIndex: 0
                  }}
                />
                
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                  <Avatar 
                    sx={{ 
                      mb: 3, 
                      width: 80, 
                      height: 80,
                      bgcolor: 'rgba(0, 150, 136, 0.1)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                    }}
                  >
                    {benefit.icon}
                  </Avatar>
                  <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                    {benefit.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.05rem' }}>
                    {benefit.description}
                  </Typography>
                </Box>
              </Paper>
            </Zoom>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default BenefitsSection;
