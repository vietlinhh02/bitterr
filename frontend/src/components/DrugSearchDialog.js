import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
  IconButton,
  InputAdornment,
  Alert,
  Chip,
  SvgIcon
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  MedicalServices as MedicalServicesIcon,
  LocalPharmacy as LocalPharmacyIcon,
  Store as StoreIcon
} from '@mui/icons-material';
import { searchFDADrugs, searchPharmacityDrugs } from '../services/api';

// Component TabPanel để hiển thị nội dung của mỗi tab
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`drug-search-tabpanel-${index}`}
      aria-labelledby={`drug-search-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Icon Pharmacity
function PharmacityIcon(props) {
  return (
    <SvgIcon {...props}>
      <LocalPharmacyIcon />
    </SvgIcon>
  );
}

const DrugSearchDialog = ({ open, onClose, onSelectDrug }) => {
  const [tabValue, setTabValue] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [fdaResults, setFdaResults] = useState([]);
  const [pharmacityResults, setPharmacityResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Xử lý thay đổi tab
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Xử lý tìm kiếm
  const handleSearch = async () => {
    if (!keyword.trim()) {
      setError('Vui lòng nhập từ khóa tìm kiếm');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Tìm kiếm dựa trên tab hiện tại
      if (tabValue === 0) {
        // Tìm kiếm thuốc FDA
        const response = await searchFDADrugs(keyword);
        if (response.data && Array.isArray(response.data)) {
          setFdaResults(response.data);
        } else if (response.data && response.data.fdaData && Array.isArray(response.data.fdaData)) {
          setFdaResults(response.data.fdaData);
        } else {
          setFdaResults([]);
          setError('Không tìm thấy kết quả nào');
        }
      } else if (tabValue === 1) {
        // Tìm kiếm thuốc Pharmacity
        try {
          const response = await searchPharmacityDrugs(keyword);
          
          if (response.data && Array.isArray(response.data.items) && response.data.items.length > 0) {
            setPharmacityResults(response.data.items);
            setError('');
          } else {
            setPharmacityResults([]);
            setError('Không tìm thấy kết quả nào từ Pharmacity');
          }
        } catch (error) {
          console.error('Lỗi khi tìm kiếm thuốc Pharmacity:', error);
          setError('Không thể kết nối với API Pharmacity. Backend proxy chưa được cấu hình đúng. Vui lòng thử lại sau.');
          setPharmacityResults([]);
        }
      }
    } catch (error) {
      console.error('Lỗi khi tìm kiếm:', error);
      setError(error.message || 'Đã xảy ra lỗi khi tìm kiếm');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi nhấn Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Xử lý khi chọn thuốc FDA
  const handleSelectFdaDrug = (drug) => {
    onSelectDrug({
      source: 'fda',
      brand_name: drug.brand_name || 'N/A',
      generic_name: drug.generic_name || 'N/A',
      active_ingredient: drug.active_ingredient || 'N/A',
      indications_and_usage: drug.indications_and_usage || 'N/A',
      warnings: drug.warnings || 'N/A',
      dosage_and_administration: drug.dosage_and_administration || 'N/A',
      adverse_reactions: drug.adverse_reactions || 'N/A',
      id: drug.application_number || drug.product_ndc,
      name: drug.brand_name || drug.generic_name || 'Không có tên',
      ingredient: drug.active_ingredient || 'Không có thông tin thành phần',
      manufacturer: drug.manufacturer_name || 'Không xác định'
    });
    onClose();
  };

  // Xử lý khi chọn thuốc Pharmacity
  const handleSelectPharmacityDrug = (drug) => {
    onSelectDrug({
      source: 'pharmacity',
      brand_name: drug.name || 'N/A',
      generic_name: drug.ingredients || drug.name || 'N/A',
      active_ingredient: drug.ingredients || 'N/A',
      indications_and_usage: drug.description || 'N/A',
      warnings: drug.contraindications || 'N/A',
      dosage_and_administration: drug.dosage || 'N/A',
      adverse_reactions: drug.sideEffects || 'N/A',
      id: drug.id || drug.sku,
      name: drug.name || 'Không có tên',
      ingredient: drug.ingredients || 'Không có thông tin thành phần',
      manufacturer: drug.manufacturer || 'Pharmacity',
      price: drug.price || drug.finalPrice,
      image: drug.images && drug.images.length > 0 ? drug.images[0] : null
    });
    onClose();
  };

  // Xóa từ khóa tìm kiếm
  const handleClearKeyword = () => {
    setKeyword('');
  };

  // Định dạng giá tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SearchIcon sx={{ mr: 1.5, color: 'primary.main' }} />
          <Typography variant="h6">Tìm kiếm thuốc</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            label="Nhập tên thuốc"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyPress={handleKeyPress}
            InputProps={{
              endAdornment: keyword && (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="clear search"
                    onClick={handleClearKeyword}
                    edge="end"
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab 
                icon={<MedicalServicesIcon />} 
                label="FDA" 
                iconPosition="start"
              />
              <Tab 
                icon={<PharmacityIcon color="primary" />} 
                label="Pharmacity" 
                iconPosition="start"
              />
            </Tabs>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSearch}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
            >
              {loading ? 'Đang tìm...' : 'Tìm kiếm'}
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TabPanel value={tabValue} index={0}>
          {fdaResults.length > 0 ? (
            <List>
              {fdaResults.map((drug, index) => (
                <React.Fragment key={index}>
                  <ListItem 
                    button 
                    onClick={() => handleSelectFdaDrug(drug)}
                    sx={{ 
                      borderRadius: 1,
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <ListItemIcon>
                      <MedicalServicesIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={drug.brand_name || drug.generic_name || 'Không có tên'}
                      secondary={
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {drug.active_ingredient || 'Không có thông tin thành phần'}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < fdaResults.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          ) : !loading && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                {keyword ? 'Không tìm thấy kết quả nào' : 'Nhập tên thuốc và nhấn Tìm kiếm'}
              </Typography>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {pharmacityResults.length > 0 ? (
            <List>
              {pharmacityResults.map((drug, index) => (
                <React.Fragment key={index}>
                  <ListItem 
                    button 
                    onClick={() => handleSelectPharmacityDrug(drug)}
                    sx={{ 
                      borderRadius: 1,
                      py: 1.5,
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <ListItemIcon>
                      <PharmacityIcon color="secondary" />
                    </ListItemIcon>
                    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {drug.name || 'Không có tên'}
                        </Typography>
                        {drug.price && (
                          <Chip 
                            label={formatPrice(drug.price || drug.finalPrice)} 
                            color="primary" 
                            size="small" 
                            variant="outlined"
                          />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {drug.ingredients || 'Không có thông tin thành phần'}
                      </Typography>
                      {drug.manufacturer && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <StoreIcon fontSize="small" sx={{ mr: 0.5, fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {drug.manufacturer}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </ListItem>
                  {index < pharmacityResults.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          ) : !loading && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                {keyword ? 'Không tìm thấy kết quả nào từ Pharmacity' : 'Nhập tên thuốc và nhấn Tìm kiếm'}
              </Typography>
            </Box>
          )}
        </TabPanel>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DrugSearchDialog; 