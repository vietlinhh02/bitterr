import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  Avatar,
  Rating,
  Fade,
  Stack
} from '@mui/material';
import { FormatQuote as FormatQuoteIcon } from '@mui/icons-material';

function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Nguyễn Văn A',
      role: 'Dược sĩ',
      content: 'Ứng dụng này giúp tôi tra cứu thông tin thuốc nhanh chóng và chính xác. Tính năng nhận diện thuốc từ ảnh rất hữu ích trong công việc hàng ngày.',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      rating: 5
    },
    {
      name: 'Trần Thảo Lan',
      role: 'Người dùng',
      content: ' Nà ná na na anh Viết Linh. Cảm ơn anh Viết Linh đã làm ứng dụng tuyệt vời này . Em sẽ nhớ anh Viết Linh suốt đời.',  
      avatar: '../uploads/avatars/IMG_20240823_011643.png',
      rating: 5
    },
    {
      name: 'Lê Văn C',
      role: 'Người dùng',
      content: 'Ứng dụng rất dễ sử dụng và giúp tôi hiểu rõ hơn về thuốc tôi đang dùng. Tôi đặc biệt thích tính năng tìm kiếm sản phẩm từ Long Châu.',
      avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
      rating: 4
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 10 }}>
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
              backgroundColor: '#ff9800',
              borderRadius: 2
            }
          }}
        >
          Người dùng nói gì về chúng tôi
        </Typography>
        
        <Typography 
          variant="subtitle1" 
          color="text.secondary"
          sx={{ maxWidth: 800, mx: 'auto', mt: 3 }}
        >
          Trải nghiệm thực tế của người dùng với ứng dụng tra cứu thông tin thuốc
        </Typography>
      </Box>
      
      <Grid container spacing={4}>
        {testimonials.map((testimonial, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Fade in timeout={1000} style={{ transitionDelay: `${index * 300}ms` }}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 4,
                  p: 0,
                  overflow: 'hidden',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  position: 'relative'
                }}
              >
                <Box sx={{ 
                  bgcolor: 'primary.main', 
                  py: 2.5, 
                  px: 3, 
                  display: 'flex', 
                  alignItems: 'center'
                }}>
                  <Avatar 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    sx={{ width: 60, height: 60, mr: 2, border: '2px solid white' }}
                  />
                  <Box>
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 600, color: 'white' }}>
                      {testimonial.name}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ color: 'white', opacity: 0.9 }}>
                      {testimonial.role}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ p: 3, flexGrow: 1, position: 'relative' }}>
                  <FormatQuoteIcon 
                    sx={{ 
                      position: 'absolute', 
                      top: 10, 
                      left: 10, 
                      fontSize: 40, 
                      color: 'rgba(0, 150, 136, 0.1)', 
                      transform: 'rotate(180deg)' 
                    }}
                  />
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontStyle: 'italic', 
                      pt: 2, 
                      px: 2, 
                      color: 'text.primary',
                      lineHeight: 1.7 
                    }}
                  >
                    {testimonial.content}
                  </Typography>
                  
                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Rating value={testimonial.rating} readOnly precision={0.5} />
                  </Box>
                </Box>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default TestimonialsSection;
