import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Paper,
  Grid,
  useTheme
} from '@mui/material';
import { 
  SentimentVeryDissatisfied as SadIcon,
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';

const NotFound = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          py: 8, 
          px: 4, 
          mt: 8, 
          mb: 8, 
          borderRadius: 4,
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
          boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12)'
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <SadIcon sx={{ fontSize: 100, color: theme.palette.primary.main, mb: 2 }} />
          
          <Typography 
            variant="h1" 
            component="h1" 
            sx={{ 
              fontSize: { xs: '5rem', md: '8rem' },
              fontWeight: 700,
              background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }}
          >
            404
          </Typography>
          
          <Typography 
            variant="h4" 
            component="h2" 
            gutterBottom
            sx={{ 
              fontWeight: 600,
              mb: 2
            }}
          >
            Không tìm thấy trang
          </Typography>
          
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ 
              mb: 4,
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời không khả dụng. 
            Vui lòng kiểm tra lại đường dẫn hoặc quay về trang chủ.
          </Typography>

          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' }, 
              justifyContent: 'center',
              gap: 2,
              mt: 4
            }}
          >
            <Button 
              variant="outlined" 
              color="primary" 
              size="large"
              startIcon={<ArrowBackIcon />}
              onClick={goBack}
              sx={{ px: 3 }}
            >
              Quay lại
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              component={Link} 
              to="/"
              startIcon={<HomeIcon />}
              sx={{ px: 3 }}
            >
              Về trang chủ
            </Button>
          </Box>
        </Box>

        {/* Hình minh họa */}
        <Box 
          sx={{ 
            mt: 6, 
            textAlign: 'center',
            position: 'relative',
            height: '200px'
          }}
        >
          <Box 
            sx={{ 
              position: 'absolute',
              width: '100%',
              height: '2px',
              bgcolor: 'divider',
              top: '50%',
              left: 0,
              transform: 'translateY(-50%)'
            }} 
          />
          
          <Box 
            sx={{ 
              position: 'absolute',
              width: '100%',
              top: '50%',
              left: 0,
              transform: 'translateY(-50%)',
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >
            {[...Array(5)].map((_, index) => (
              <Box 
                key={index}
                sx={{ 
                  width: 10, 
                  height: 10, 
                  borderRadius: '50%', 
                  bgcolor: index === 2 ? 'primary.main' : 'divider',
                  animation: index === 2 ? 'none' : 'pulse 1.5s infinite',
                  '@keyframes pulse': {
                    '0%': { transform: 'scale(1)', opacity: 1 },
                    '50%': { transform: 'scale(1.2)', opacity: 0.7 },
                    '100%': { transform: 'scale(1)', opacity: 1 },
                  },
                  animationDelay: `${index * 0.3}s`
                }} 
              />
            ))}
          </Box>
          
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              position: 'absolute',
              bottom: 0,
              width: '100%',
              textAlign: 'center'
            }}
          >
            Có vẻ như bạn đã đi lạc đường. Hãy để chúng tôi giúp bạn quay lại!
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default NotFound; 