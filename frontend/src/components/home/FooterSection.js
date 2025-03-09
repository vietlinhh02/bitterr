import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Link,
  Divider,
  Stack,
  IconButton
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  YouTube as YouTubeIcon,
  LinkedIn as LinkedInIcon
} from '@mui/icons-material';

function FooterSection() {
  const footerLinks = [
    {
      title: 'Sản phẩm',
      links: [
        { name: 'Tra cứu thuốc FDA', href: '/fda-drugs' },
        { name: 'Nhận diện từ ảnh', href: '/image-detection' },
        { name: 'Tìm kiếm Long Châu', href: '/longchau-search' },
        { name: 'Chat với AI', href: '/chat' }
      ]
    },
    {
      title: 'Tài nguyên',
      links: [
        { name: 'Blog', href: '/blog' },
        { name: 'Cơ sở dữ liệu', href: '/database' },
        { name: 'Hướng dẫn sử dụng', href: '/guides' },
        { name: 'FAQ', href: '/faq' }
      ]
    },
    {
      title: 'Công ty',
      links: [
        { name: 'Về chúng tôi', href: '/about' },
        { name: 'Liên hệ', href: '/contact' },
        { name: 'Điều khoản', href: '/terms' },
        { name: 'Chính sách bảo mật', href: '/privacy' }
      ]
    }
  ];

  const socialLinks = [
    { icon: <FacebookIcon />, href: 'https://facebook.com' },
    { icon: <TwitterIcon />, href: 'https://twitter.com' },
    { icon: <InstagramIcon />, href: 'https://instagram.com' },
    { icon: <YouTubeIcon />, href: 'https://youtube.com' },
    { icon: <LinkedInIcon />, href: 'https://linkedin.com' }
  ];

  return (
    <Box sx={{ bgcolor: 'background.paper', pt: 8, pb: 6, borderTop: '1px solid', borderColor: 'divider' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700, 
                mb: 2,
                background: 'linear-gradient(90deg, #009688 0%, #4db6ac 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '1.5rem'
              }}
            >
              BiiterNCKH
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Ứng dụng tra cứu thông tin thuốc thông minh, giúp người dùng tiếp cận thông tin chính xác từ nguồn dữ liệu đáng tin cậy.
            </Typography>
            <Stack direction="row" spacing={1}>
              {socialLinks.map((social, index) => (
                <IconButton 
                  key={index} 
                  component={Link} 
                  href={social.href} 
                  target="_blank"
                  rel="noopener"
                  size="small"
                  sx={{ 
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'rgba(0, 150, 136, 0.1)' } 
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Stack>
          </Grid>
          
          {footerLinks.map((section, index) => (
            <Grid item xs={12} sm={6} md={2} key={index}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
                {section.title}
              </Typography>
              <Stack spacing={1}>
                {section.links.map((link, idx) => (
                  <Link 
                    key={idx} 
                    href={link.href} 
                    underline="hover" 
                    color="text.secondary"
                    sx={{ 
                      display: 'block',
                      fontSize: '0.9rem',
                      '&:hover': { color: 'primary.main' }
                    }}
                  >
                    {link.name}
                  </Link>
                ))}
              </Stack>
            </Grid>
          ))}
          
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
              Hỗ trợ
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
              Email: support@biiterr.com
            </Typography>
            <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
              Hotline: 1900-xxxx
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Giờ làm việc: 8:00 - 18:00
            </Typography>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 4 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} BiiterNCKH - Ứng dụng tra cứu thông tin thuốc thông minh
          </Typography>
          <Box>
            <Link href="/terms" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem', mr: 2 }}>
              Điều khoản sử dụng
            </Link>
            <Link href="/privacy" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
              Chính sách bảo mật
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default FooterSection;
