import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  CircularProgress, 
  Button, 
  Paper,
  Chip,
  Stack,
  Divider,
  alpha
} from '@mui/material';
import { 
  MedicalServices as MedicalServicesIcon,
  Search as SearchIcon,
  LocalPharmacy as LocalPharmacyIcon,
  Info as InfoIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

const ResultSection = ({ loading, results, previewUrl, onSearchMore }) => {
  // Render một kết quả thuốc trong danh sách
  const renderMedicineResult = (result, index) => (
    <Paper 
      key={index} 
      elevation={0} 
      sx={{ 
        p: 2.5, 
        mb: 2, 
        borderRadius: 3,
        border: '1px solid rgba(0,0,0,0.08)',
        backgroundColor: 'background.paper',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 10px 20px rgba(0,0,0,0.08)'
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <LocalPharmacyIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
          {result.drugName || result.name}
        </Typography>
      </Box>
      
      <Divider sx={{ my: 1.5 }} />
      
      {result.confidence && (
        <Chip 
          label={`Độ tin cậy: ${result.confidence}%`} 
          color={result.confidence > 70 ? "success" : "warning"}
          size="small"
          sx={{ mb: 1.5, fontWeight: 500 }}
        />
      )}
      
      <Stack spacing={1.5}>
        {result.activeIngredient && (
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <Typography variant="body2" sx={{ fontWeight: 500, minWidth: 100 }}>
              Hoạt chất:
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', flex: 1 }}>
              {result.activeIngredient}
            </Typography>
          </Box>
        )}
        
        {result.indications && (
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <Typography variant="body2" sx={{ fontWeight: 500, minWidth: 100 }}>
              Công dụng:
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', flex: 1 }}>
              {result.indications}
            </Typography>
          </Box>
        )}
        
        {result.manufacturer && (
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <Typography variant="body2" sx={{ fontWeight: 500, minWidth: 100 }}>
              Nhà sản xuất:
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', flex: 1 }}>
              {result.manufacturer}
            </Typography>
          </Box>
        )}
        
        {result.dosage && (
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <Typography variant="body2" sx={{ fontWeight: 500, minWidth: 100 }}>
              Liều lượng:
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', flex: 1 }}>
              {result.dosage}
            </Typography>
          </Box>
        )}
        
        {result.warnings && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'flex-start',
            p: 1.5,
            mt: 1,
            borderRadius: 2,
            bgcolor: alpha('#ff9800', 0.08),
            border: `1px solid ${alpha('#ff9800', 0.2)}`
          }}>
            <WarningIcon sx={{ color: 'warning.main', mr: 1, fontSize: 20 }} />
            <Typography variant="body2" sx={{ color: 'text.secondary', flex: 1 }}>
              <strong>Cảnh báo:</strong> {result.warnings}
            </Typography>
          </Box>
        )}
      </Stack>
    </Paper>
  );

  return (
    <Card sx={{ 
      height: '100%', 
      borderRadius: 4, 
      boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
      background: 'linear-gradient(145deg, #ffffff, #f5f8fa)',
    }}>
      <CardContent sx={{ p: 3, height: '100%' }}>
        <Typography variant="h6" gutterBottom sx={{ 
          display: 'flex', 
          alignItems: 'center',
          fontWeight: 600,
          color: '#2c3e50',
          mb: 2
        }}>
          <MedicalServicesIcon sx={{ mr: 1, color: 'primary.main' }} />
          Kết quả nhận diện
        </Typography>

        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            minHeight: 250,
            py: 5
          }}>
            <CircularProgress size={65} sx={{ 
              mb: 2.5, 
              color: '#009688',
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              } 
            }} />
            <Typography color="text.secondary" sx={{ fontWeight: 500 }}>Đang phân tích ảnh...</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 300, textAlign: 'center' }}>
              Chúng tôi đang nhận diện thông tin thuốc từ hình ảnh của bạn
            </Typography>
          </Box>
        ) : !results ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            minHeight: 250,
            py: 5
          }}>
            <InfoIcon sx={{ fontSize: 65, color: 'info.main', mb: 2.5, opacity: 0.8 }} />
            {previewUrl ? (
              <Typography sx={{ fontWeight: 500, color: 'text.secondary' }}>
                Nhấn "Nhận diện thuốc" để bắt đầu phân tích
              </Typography>
            ) : (
              <Typography sx={{ fontWeight: 500, color: 'text.secondary' }}>
                Tải lên ảnh thuốc để bắt đầu nhận diện
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 300, textAlign: 'center' }}>
              Hãy chọn một hình ảnh rõ nét để đạt kết quả chính xác nhất
            </Typography>
          </Box>
        ) : (
          <Box sx={{ 
            maxHeight: 460, 
            overflowY: 'auto',
            pr: 1,
            mr: -1,
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: '#c1c1c1',
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: '#a1a1a1',
            }
          }}>
            {Array.isArray(results) ? (
              results.map((result, index) => renderMedicineResult(result, index))
            ) : (
              renderMedicineResult(results, 0)
            )}
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="outlined" 
                color="primary"
                onClick={() => onSearchMore(Array.isArray(results) ? results[0]?.drugName || results[0]?.name : results?.drugName || results?.name)}
                startIcon={<SearchIcon />}
                sx={{ 
                  borderRadius: 3,
                  borderWidth: 2,
                  pl: 2,
                  pr: 3,
                  py: 0.8,
                  '&:hover': {
                    borderWidth: 2,
                    background: alpha('#009688', 0.04)
                  },
                  transition: 'all 0.2s'
                }}
              >
                Tra cứu thêm
              </Button>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ResultSection; 