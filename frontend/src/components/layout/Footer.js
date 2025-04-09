import React from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  Link, 
  Divider,
  IconButton,
  Stack,
  useTheme
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
  LocalPharmacy as LocalPharmacyIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon
} from '@mui/icons-material';

const Footer = () => {
  const theme = useTheme();
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <Box sx={{ 
      bgcolor: '#1e2a38', 
      color: 'white',
      mt: 8,
      pt: 6,
      pb: 3
    }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Logo và thông tin công ty */}
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocalPharmacyIcon sx={{ fontSize: 36, mr: 1, color: '#4db6ac' }} />
              <Typography variant="h5" component="div" sx={{ fontWeight: 700 }}>
                MediDetect
              </Typography>
            </Box>
            
            <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255,255,255,0.7)' }}>
              Công nghệ AI tiên tiến giúp nhận diện thuốc từ hình ảnh, cung cấp thông tin chi tiết và chính xác về các loại thuốc.
            </Typography>
            
            <Stack direction="row" spacing={1}>
              <IconButton
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.2)',
                  },
                  transition: 'all 0.2s'
                }}
              >
                <FacebookIcon fontSize="small" />
              </IconButton>
              <IconButton
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.2)',
                  }
                }}
              >
                <TwitterIcon fontSize="small" />
              </IconButton>
              <IconButton
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.2)',
                  }
                }}
              >
                <InstagramIcon fontSize="small" />
              </IconButton>
              <IconButton
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.2)',
                  }
                }}
              >
                <LinkedInIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Grid>

          {/* Liên kết hữu ích */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Liên kết
            </Typography>
            <Stack spacing={1}>
              <Link href="#" underline="hover" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#4db6ac' } }}>
                Trang chủ
              </Link>
              <Link href="#" underline="hover" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#4db6ac' } }}>
                Nhận diện thuốc
              </Link>
              <Link href="#" underline="hover" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#4db6ac' } }}>
                Tra cứu dược liệu
              </Link>
              <Link href="#" underline="hover" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#4db6ac' } }}>
                Thư viện thuốc
              </Link>
              <Link href="#" underline="hover" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#4db6ac' } }}>
                Hỏi đáp
              </Link>
            </Stack>
          </Grid>

          {/* Hỗ trợ */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Hỗ trợ & Chính sách
            </Typography>
            <Stack spacing={1}>
              <Link href="#" underline="hover" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#4db6ac' } }}>
                Câu hỏi thường gặp
              </Link>
              <Link href="#" underline="hover" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#4db6ac' } }}>
                Điều khoản sử dụng
              </Link>
              <Link href="#" underline="hover" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#4db6ac' } }}>
                Chính sách bảo mật
              </Link>
              <Link href="#" underline="hover" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#4db6ac' } }}>
                Hướng dẫn sử dụng
              </Link>
              <Link href="#" underline="hover" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#4db6ac' } }}>
                Liên hệ
              </Link>
            </Stack>
          </Grid>

          {/* Liên hệ */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
              Thông tin liên hệ
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" sx={{ color: '#4db6ac', fontWeight: 500 }}>
                  Địa chỉ:
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: '#4db6ac', fontWeight: 500 }}>
                  Email:
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  contact@medidetect.vn
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: '#4db6ac', fontWeight: 500 }}>
                  Hotline:
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  1900 6789
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, bgcolor: 'rgba(255,255,255,0.1)' }} />
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
            © {new Date().getFullYear()} MediDetect. Tất cả các quyền được bảo lưu.
          </Typography>
          
          <IconButton 
            onClick={scrollToTop} 
            sx={{ 
              color: 'white', 
              bgcolor: '#4db6ac',
              '&:hover': {
                bgcolor: '#00897b',
              },
              transition: 'all 0.2s'
            }}
          >
            <KeyboardArrowUpIcon />
          </IconButton>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 