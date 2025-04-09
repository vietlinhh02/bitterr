import React from 'react';
import { 
  Paper, 
  Typography, 
  Button, 
  Box, 
  CircularProgress, 
  IconButton,
  styled
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon, 
  Image as ImageIcon,
  Clear as ClearIcon,
  Science as ScienceIcon
} from '@mui/icons-material';

// Styled components
const UploadBox = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: 20,
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.background.default,
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    borderColor: theme.palette.primary.dark,
    transform: 'scale(1.01)',
  },
  height: '100%',
  minHeight: 220
}));

const ImagePreviewContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  borderRadius: 20,
  overflow: 'hidden',
  boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
  margin: theme.spacing(2, 0),
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.02)',
  },
  '& img': {
    width: '100%',
    height: 'auto',
    display: 'block',
    borderRadius: 20
  }
}));

const UploadSection = ({ 
  previewUrl, 
  imageWithBoxes, 
  fileInputRef, 
  loading, 
  handleFileChange, 
  handleDetectUpload,
  handleClear
}) => {
  return (
    <Paper elevation={0} 
      sx={{ 
        p: 3, 
        borderRadius: 4, 
        height: '100%',
        boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
        border: '1px solid rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(145deg, #ffffff, #f5f8fa)',
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ 
        display: 'flex', 
        alignItems: 'center',
        mb: 2,
        fontWeight: 600,
        color: '#2c3e50'
      }}>
        <CloudUploadIcon sx={{ mr: 1, color: 'primary.main' }} />
        Tải ảnh lên
      </Typography>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {!previewUrl ? (
          <UploadBox onClick={() => fileInputRef.current.click()}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              ref={fileInputRef}
            />
            <ImageIcon sx={{ fontSize: 72, color: 'primary.main', mb: 2, opacity: 0.8 }} />
            <Typography align="center" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
              Nhấp để chọn hoặc kéo thả ảnh thuốc vào đây
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<CloudUploadIcon />}
              sx={{ 
                mt: 2, 
                borderRadius: 3, 
                px: 3,
                py: 1,
                boxShadow: '0 4px 12px rgba(0,150,136,0.3)',
                background: 'linear-gradient(45deg, #009688 30%, #4db6ac 90%)',
                '&:hover': {
                  boxShadow: '0 6px 14px rgba(0,150,136,0.4)',
                  background: 'linear-gradient(45deg, #00897b 30%, #26a69a 90%)',
                }
              }}
            >
              Chọn ảnh
            </Button>
          </UploadBox>
        ) : (
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <ImagePreviewContainer>
              <img
                src={imageWithBoxes || previewUrl}
                alt="Ảnh thuốc preview"
                style={{ 
                  width: '100%', 
                  height: 'auto', 
                  display: 'block'
                }}
              />
              
              <IconButton
                onClick={handleClear}
                sx={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.75)',
                    transform: 'scale(1.1)'
                  },
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                }}
              >
                <ClearIcon />
              </IconButton>
            </ImagePreviewContainer>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => fileInputRef.current.click()}
                startIcon={<CloudUploadIcon />}
                sx={{ 
                  borderRadius: 3,
                  borderWidth: '2px',
                  '&:hover': {
                    borderWidth: '2px'
                  }
                }}
              >
                Đổi ảnh khác
              </Button>
              
              <Button
                variant="contained"
                onClick={handleDetectUpload}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={24} /> : <ScienceIcon />}
                sx={{ 
                  borderRadius: 3, 
                  px: 3,
                  boxShadow: '0 4px 12px rgba(0,150,136,0.3)',
                  background: loading ? '' : 'linear-gradient(45deg, #009688 30%, #4db6ac 90%)',
                  '&:not(:disabled):hover': {
                    boxShadow: '0 6px 14px rgba(0,150,136,0.4)',
                    background: 'linear-gradient(45deg, #00897b 30%, #26a69a 90%)',
                  }
                }}
              >
                {loading ? 'Đang xử lý...' : 'Nhận diện thuốc'}
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default UploadSection; 