import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  Typography, 
  Container, 
  Grid, 
  Paper, 
  Divider, 
  Button, 
  Box,
  Chip,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link as MuiLink,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon, 
  Chat as ChatIcon,
  MedicalServices as MedicalServicesIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Assignment as AssignmentIcon,
  Translate as TranslateIcon,
  ContentCopy as ContentCopyIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { translateDrugContent } from '../services/api';

// Danh sách ngôn ngữ hỗ trợ
const languages = [
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'en', name: 'Tiếng Anh' },
  { code: 'fr', name: 'Tiếng Pháp' },
  { code: 'de', name: 'Tiếng Đức' },
  { code: 'es', name: 'Tiếng Tây Ban Nha' },
  { code: 'zh', name: 'Tiếng Trung' },
  { code: 'ja', name: 'Tiếng Nhật' },
  { code: 'ko', name: 'Tiếng Hàn' },
  { code: 'ru', name: 'Tiếng Nga' },
  { code: 'th', name: 'Tiếng Thái' }
];

function FDADrugDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const drugData = location.state?.drugData;
  const [targetLanguage, setTargetLanguage] = useState('vi');
  const [translatedSections, setTranslatedSections] = useState({});
  const [loadingSections, setLoadingSections] = useState({});
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  console.log('Drug detail data:', drugData);

  if (!drugData) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: 3 }}>
          <Alert severity="error">
            Không tìm thấy thông tin thuốc. Vui lòng quay lại trang tìm kiếm.
          </Alert>
          <Box sx={{ mt: 3 }}>
            <Button 
              variant="contained" 
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/fda-drugs')}
            >
              Quay lại trang tìm kiếm
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  const handleChatWithAI = () => {
    console.log('Navigating to chat with drug data:', drugData);
    // Đảm bảo drugData có đầy đủ thông tin cần thiết
    const drugInfo = {
      brand_name: drugData.brand_name || '',
      generic_name: drugData.generic_name || '',
      active_ingredient: drugData.active_ingredient || '',
      indications_and_usage: drugData.indications_and_usage || '',
      warnings: drugData.warnings || '',
      dosage_and_administration: drugData.dosage_and_administration || '',
      adverse_reactions: drugData.adverse_reactions || ''
    };
    navigate('/chat', { state: { drugInfo } });
  };

  const handleLanguageChange = (event) => {
    setTargetLanguage(event.target.value);
  };

  const handleTranslateSection = async (sectionId, content) => {
    if (!content || loadingSections[sectionId]) return;
    
    // Cập nhật trạng thái đang tải cho phần này
    setLoadingSections(prev => ({ ...prev, [sectionId]: true }));
    setError(null);
    
    try {
      const response = await translateDrugContent(content, targetLanguage);
      // Cập nhật nội dung đã dịch
      setTranslatedSections(prev => ({ 
        ...prev, 
        [sectionId]: response.data.translatedText 
      }));
      
      // Hiển thị thông báo thành công
      setSnackbarMessage(`Đã dịch sang ${languages.find(l => l.code === targetLanguage)?.name}`);
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Translation error:', err);
      setError('Đã xảy ra lỗi khi dịch nội dung. Vui lòng thử lại sau.');
      setSnackbarMessage('Lỗi dịch thuật. Vui lòng thử lại sau.');
      setSnackbarOpen(true);
    } finally {
      setLoadingSections(prev => ({ ...prev, [sectionId]: false }));
    }
  };

  const handleTranslateAll = async () => {
    if (isTranslating) return;
    
    setIsTranslating(true);
    setError(null);
    
    // Tạo danh sách các phần cần dịch
    const sectionsToTranslate = [
      { id: 'overview', content: `Tên thuốc: ${drugData.brand_name || drugData.generic_name}\nHoạt chất: ${drugData.active_ingredient || 'Không có thông tin'}\nDạng bào chế: ${drugData.dosage_form || 'Không có thông tin'}\nĐường dùng: ${drugData.route || 'Không có thông tin'}` },
      { id: 'indications', content: drugData.indications_and_usage },
      { id: 'dosage', content: drugData.dosage_and_administration },
      { id: 'mechanism', content: drugData.mechanism_of_action },
      { id: 'pharmacology', content: drugData.clinical_pharmacology },
      { id: 'warnings', content: drugData.warnings_and_cautions },
      { id: 'adverse', content: drugData.adverse_reactions },
      { id: 'interactions', content: drugData.drug_interactions },
      { id: 'pregnancy', content: drugData.pregnancy },
      { id: 'nursing', content: drugData.nursing_mothers }
    ].filter(section => section.content);
    
    try {
      // Dịch từng phần một
      for (const section of sectionsToTranslate) {
        setLoadingSections(prev => ({ ...prev, [section.id]: true }));
        const response = await translateDrugContent(section.content, targetLanguage);
        setTranslatedSections(prev => ({ 
          ...prev, 
          [section.id]: response.data.translatedText 
        }));
        setLoadingSections(prev => ({ ...prev, [section.id]: false }));
      }
      
      // Hiển thị thông báo thành công
      setSnackbarMessage(`Đã dịch tất cả nội dung sang ${languages.find(l => l.code === targetLanguage)?.name}`);
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Translation error:', err);
      setError('Đã xảy ra lỗi khi dịch nội dung. Vui lòng thử lại sau.');
      setSnackbarMessage('Lỗi dịch thuật. Vui lòng thử lại sau.');
      setSnackbarOpen(true);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSnackbarMessage('Đã sao chép vào clipboard');
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const renderSection = (title, content, sectionId, isWarning = false, icon = null) => {
    if (!content) return null;
    
    const isTranslated = translatedSections[sectionId];
    const isLoading = loadingSections[sectionId];
    
    return (
      <Card 
        elevation={0} 
        sx={{ 
          mb: 3, 
          borderRadius: 2,
          border: isWarning ? '1px solid rgba(237, 108, 2, 0.2)' : '1px solid rgba(0, 0, 0, 0.08)',
          bgcolor: isWarning ? 'rgba(237, 108, 2, 0.05)' : 'white'
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {icon && <Box sx={{ mr: 1 }}>{icon}</Box>}
              <Typography 
                variant="h6" 
                component="h3" 
                color={isWarning ? 'warning.dark' : 'primary'}
                fontWeight={600}
              >
                {title}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {isTranslated && (
                <Tooltip title="Sao chép">
                  <IconButton 
                    size="small" 
                    color="primary"
                    onClick={() => handleCopyToClipboard(isTranslated)}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title={isTranslated ? "Dịch lại" : "Dịch nội dung"}>
                <IconButton 
                  size="small" 
                  color="primary"
                  onClick={() => handleTranslateSection(sectionId, content)}
                  disabled={isLoading}
                >
                  <TranslateIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <>
              {isTranslated && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Bản dịch ({languages.find(l => l.code === targetLanguage)?.name}):
                  </Typography>
                  <Typography variant="body1" component="div" sx={{ whiteSpace: 'pre-line' }}>
                    {isTranslated}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                </Box>
              )}
              
              <Typography 
                variant="body1" 
                component="div" 
                sx={{ 
                  whiteSpace: 'pre-line',
                  color: isTranslated ? 'text.secondary' : 'text.primary'
                }}
              >
                {isTranslated && (
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Nội dung gốc:
                  </Typography>
                )}
                {content}
              </Typography>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Breadcrumbs sx={{ mb: 3 }}>
        <MuiLink component={Link} to="/" underline="hover" color="inherit">
          Trang chủ
        </MuiLink>
        <MuiLink component={Link} to="/fda-drugs" underline="hover" color="inherit">
          Tra cứu thuốc
        </MuiLink>
        <Typography color="text.primary">Chi tiết thuốc</Typography>
      </Breadcrumbs>
      
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 2, md: 4 }, 
          borderRadius: 3,
          mb: 4
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate(-1)}
            sx={{ mr: 2 }}
          >
            Quay lại
          </Button>
          <MedicalServicesIcon color="primary" sx={{ mr: 2, fontSize: 32 }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            {drugData.brand_name || drugData.generic_name}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2, mb: 3 }}>
          {drugData.active_ingredient && (
            <Chip 
              label={`Hoạt chất: ${drugData.active_ingredient}`} 
              color="primary" 
              variant="outlined"
            />
          )}
          {drugData.dosage_form && (
            <Chip 
              label={`Dạng bào chế: ${drugData.dosage_form}`} 
              color="secondary" 
              variant="outlined"
            />
          )}
          {drugData.route && (
            <Chip 
              label={`Đường dùng: ${drugData.route}`} 
              variant="outlined"
            />
          )}
          {drugData.marketing_status && (
            <Chip 
              label={`Trạng thái: ${drugData.marketing_status}`} 
              variant="outlined"
            />
          )}
        </Box>

        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 3 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="language-select-label">Ngôn ngữ dịch</InputLabel>
              <Select
                labelId="language-select-label"
                value={targetLanguage}
                label="Ngôn ngữ dịch"
                onChange={handleLanguageChange}
                size="small"
              >
                {languages.map((lang) => (
                  <MenuItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Button 
              variant="outlined" 
              color="primary" 
              startIcon={<TranslateIcon />}
              onClick={handleTranslateAll}
              disabled={isTranslating}
              sx={{ borderRadius: 2 }}
            >
              {isTranslating ? 'Đang dịch...' : 'Dịch tất cả'}
            </Button>
            
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<ChatIcon />}
              onClick={handleChatWithAI}
              size="medium"
              sx={{ borderRadius: 2 }}
            >
              Chat với AI về thuốc này
            </Button>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
        </Box>

        {/* Thông tin tổng quan */}
        {renderSection(
          "Thông tin tổng quan", 
          `Tên thuốc: ${drugData.brand_name || drugData.generic_name}\nHoạt chất: ${drugData.active_ingredient || 'Không có thông tin'}\nDạng bào chế: ${drugData.dosage_form || 'Không có thông tin'}\nĐường dùng: ${drugData.route || 'Không có thông tin'}`,
          "overview",
          false,
          <InfoIcon color="primary" />
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            {renderSection(
              "Chỉ định và Sử dụng", 
              drugData.indications_and_usage,
              "indications",
              false,
              <InfoIcon color="primary" />
            )}
            
            {renderSection(
              "Liều lượng và Cách dùng", 
              drugData.dosage_and_administration,
              "dosage",
              false,
              <AssignmentIcon color="primary" />
            )}
            
            {renderSection(
              "Cách thức hoạt động", 
              drugData.mechanism_of_action,
              "mechanism"
            )}
            
            {renderSection(
              "Dược lý lâm sàng", 
              drugData.clinical_pharmacology,
              "pharmacology"
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            {renderSection(
              "Cảnh báo và Thận trọng", 
              drugData.warnings_and_cautions,
              "warnings",
              true,
              <WarningIcon color="warning" />
            )}
            
            {renderSection(
              "Tác dụng phụ", 
              drugData.adverse_reactions,
              "adverse",
              true
            )}
            
            {renderSection(
              "Tương tác thuốc", 
              drugData.drug_interactions,
              "interactions"
            )}
            
            {renderSection(
              "Sử dụng trong thai kỳ", 
              drugData.pregnancy,
              "pregnancy"
            )}
            
            {renderSection(
              "Sử dụng trong thời kỳ cho con bú", 
              drugData.nursing_mothers,
              "nursing"
            )}
          </Grid>
        </Grid>
      </Paper>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Container>
  );
}

export default FDADrugDetail; 