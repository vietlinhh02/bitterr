import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  CircularProgress, 
  Typography, 
  Paper, 
  Container, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Snackbar,
  IconButton,
  Alert,
  Box,
  Card,
  Chip,
  InputAdornment,
  Divider
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Chat as ChatIcon, 
  Search as SearchIcon,
  MedicalServices as MedicalServicesIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { searchFDADrugs, searchFDADrugsByIngredients, saveDrugSearchHistory } from '../services/api';

function FDADrugSearch() {
  const location = useLocation();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [drugs, setDrugs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState('name');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showSelectDrugMessage, setShowSelectDrugMessage] = useState(false);
  const [lastSearchedKeyword, setLastSearchedKeyword] = useState('');
  const [lastSearchType, setLastSearchType] = useState('');

  // Kiểm tra xem có dữ liệu tìm kiếm từ lịch sử không
  useEffect(() => {
    if (location.state?.searchKeyword) {
      setKeyword(location.state.searchKeyword);
      handleSearch(location.state.searchKeyword, location.state.searchType || 'name');
    }
  }, [location.state]);

  // Kiểm tra xem có đang quay lại từ trang chat không
  useEffect(() => {
    if (location.state?.returnTo === '/chat') {
      setShowSelectDrugMessage(true);
    }
  }, [location]);

  const handleSearch = async (searchKeyword = keyword, type = searchType) => {
    if (!searchKeyword.trim()) {
      setSnackbarMessage('Vui lòng nhập từ khóa tìm kiếm');
      setOpenSnackbar(true);
      return;
    }

    // Nếu từ khóa và loại tìm kiếm giống với lần tìm kiếm trước, không cần tìm lại
    if (searchKeyword === lastSearchedKeyword && type === lastSearchType && drugs.length > 0) {
      return;
    }

    setLoading(true);
    setLastSearchedKeyword(searchKeyword);
    setLastSearchType(type);
    
    try {
      let response;
      if (type === 'name') {
        response = await searchFDADrugs(searchKeyword);
      } else {
        response = await searchFDADrugsByIngredients(searchKeyword);
      }
      
      // Kiểm tra cấu trúc dữ liệu trả về
      console.log('API response:', response.data);
      
      // Lưu lịch sử tìm kiếm vào database
      try {
        await saveDrugSearchHistory({
          keyword: searchKeyword,
          searchType: type,
          resultCount: response.data && Array.isArray(response.data) 
            ? response.data.length 
            : (response.data && response.data.fdaData && Array.isArray(response.data.fdaData) 
                ? response.data.fdaData.length 
                : 0)
        });
        console.log('Đã lưu lịch sử tìm kiếm vào database');
      } catch (saveError) {
        console.error('Lỗi khi lưu lịch sử tìm kiếm:', saveError);
        // Không hiển thị lỗi này cho người dùng vì không ảnh hưởng đến chức năng chính
      }
      
      if (response.data && Array.isArray(response.data)) {
        setDrugs(response.data);
      } else if (response.data && response.data.fdaData && Array.isArray(response.data.fdaData)) {
        setDrugs(response.data.fdaData);
      } else {
        console.error('Dữ liệu không đúng định dạng:', response.data);
        setDrugs([]);
        setSnackbarMessage('Định dạng dữ liệu không hợp lệ. Vui lòng thử lại sau.');
        setOpenSnackbar(true);
      }
    } catch (error) {
      console.error('Lỗi khi tìm kiếm thuốc:', error);
      setSnackbarMessage('Đã xảy ra lỗi khi tìm kiếm. Vui lòng thử lại sau.');
      setOpenSnackbar(true);
      setDrugs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  // Thêm hàm để chuyển đến trang chat với AI
  const handleChatWithAI = (drug) => {
    console.log('Navigating to chat with drug from search:', drug);
    // Đảm bảo drug có đầy đủ thông tin cần thiết
    const drugInfo = {
      brand_name: drug.brand_name || '',
      generic_name: drug.generic_name || '',
      active_ingredient: drug.active_ingredient || '',
      indications_and_usage: drug.indications_and_usage || '',
      warnings: drug.warnings || '',
      dosage_and_administration: drug.dosage_and_administration || '',
      adverse_reactions: drug.adverse_reactions || ''
    };
    navigate('/chat', { state: { drugInfo } });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 2, sm: 4 }, 
          borderRadius: 3,
          bgcolor: 'background.paper',
          mb: 4
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <MedicalServicesIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Tra cứu thông tin thuốc FDA
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Nhập tên thuốc hoặc thành phần hoạt tính để tìm kiếm thông tin chi tiết từ cơ sở dữ liệu FDA
          </Typography>
        </Box>

        {showSelectDrugMessage && (
          <Alert 
            severity="info" 
            sx={{ mb: 3, borderRadius: 2 }}
            icon={<InfoIcon />}
          >
            Vui lòng chọn một loại thuốc để tiếp tục chat với AI
          </Alert>
        )}

        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth variant="outlined" size="medium">
              <InputLabel id="search-type-label">Tìm kiếm theo</InputLabel>
              <Select
                labelId="search-type-label"
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                label="Tìm kiếm theo"
              >
                <MenuItem value="name">Tên thuốc</MenuItem>
                <MenuItem value="ingredients">Thành phần</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={7}>
            <TextField
              fullWidth
              variant="outlined"
              label={searchType === 'name' ? "Nhập tên thuốc" : "Nhập thành phần hoạt tính"}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    {loading && <CircularProgress size={24} />}
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={() => handleSearch()}
              disabled={loading}
              startIcon={<SearchIcon />}
              sx={{ height: '56px' }}
            >
              Tìm kiếm
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={handleCloseSnackbar}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Hiển thị kết quả tìm kiếm */}
      {drugs.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            Kết quả tìm kiếm ({drugs.length})
          </Typography>
          
          <Grid container spacing={2}>
            {drugs.map((drug, index) => (
              <Grid item xs={12} key={index}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    mb: 2, 
                    borderRadius: 3,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {drug.brand_name || drug.generic_name || 'Không có tên'}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                        {drug.active_ingredient && (
                          <Chip 
                            label={drug.active_ingredient} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                        )}
                        {drug.dosage_form && (
                          <Chip 
                            label={drug.dosage_form} 
                            size="small" 
                            color="secondary" 
                            variant="outlined"
                          />
                        )}
                        {drug.route && (
                          <Chip 
                            label={drug.route} 
                            size="small" 
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                    <Box>
                      <Button 
                        component={Link} 
                        to={`/fda-drugs/${drug.application_number || drug.set_id}`} 
                        state={{ drugData: drug }}
                        variant="outlined" 
                        size="medium"
                        sx={{ mr: 1 }}
                      >
                        Chi tiết
                      </Button>
                      <Button 
                        variant="contained" 
                        color="primary"
                        size="medium" 
                        startIcon={<ChatIcon />}
                        onClick={() => handleChatWithAI(drug)}
                      >
                        Chat với AI
                      </Button>
                    </Box>
                  </Box>
                  
                  {drug.indications_and_usage && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        <strong>Chỉ định:</strong> {drug.indications_and_usage.length > 300 
                          ? `${drug.indications_and_usage.substring(0, 300)}...` 
                          : drug.indications_and_usage
                        }
                      </Typography>
                    </>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {keyword && drugs.length === 0 && !loading && (
        <Box sx={{ mt: 4, textAlign: 'center', p: 4 }}>
          <Typography variant="h6" align="center" color="text.secondary" gutterBottom>
            Không tìm thấy kết quả nào cho "{keyword}".
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary">
            Vui lòng thử lại với từ khóa khác hoặc thay đổi loại tìm kiếm.
          </Typography>
        </Box>
      )}
    </Container>
  );
}

export default FDADrugSearch; 