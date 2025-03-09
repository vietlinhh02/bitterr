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
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  MedicalServices as MedicalServicesIcon,
  LocalPharmacy as LocalPharmacyIcon
} from '@mui/icons-material';
import { searchFDADrugs, searchLongChauProducts } from '../services/api';

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

const DrugSearchDialog = ({ open, onClose, onSelectDrug }) => {
  const [tabValue, setTabValue] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [fdaResults, setFdaResults] = useState([]);
  const [longChauResults, setLongChauResults] = useState([]);
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
      } else {
        // Tìm kiếm thuốc Long Châu
        const response = await searchLongChauProducts(keyword);
        console.log('Kết quả tìm kiếm Long Châu:', response);
        
        // Kiểm tra cấu trúc dữ liệu trả về
        if (response && Array.isArray(response)) {
          setLongChauResults(response);
        } else if (response && response.products && Array.isArray(response.products)) {
          // Xử lý dữ liệu để đảm bảo không có đối tượng trực tiếp trong JSX
          const processedProducts = response.products.map(product => {
            // Xử lý trường price nếu là đối tượng
            if (typeof product.price === 'object' && product.price !== null) {
              return {
                ...product,
                priceFormatted: product.price.price ? `${product.price.price} ${product.price.currencySymbol || 'đ'}` : 'Không có giá'
              };
            }
            return product;
          });
          setLongChauResults(processedProducts);
        } else {
          setLongChauResults([]);
          setError('Không tìm thấy kết quả nào');
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
      adverse_reactions: drug.adverse_reactions || 'N/A'
    });
    onClose();
  };

  // Xử lý khi chọn thuốc Long Châu
  const handleSelectLongChauDrug = (drug) => {
    console.log('Chi tiết thuốc Long Châu:', drug);
    
    // Xử lý các trường dữ liệu có thể là đối tượng
    const formatPrice = (price) => {
      if (typeof price === 'object' && price !== null) {
        return price.price ? `${price.price} ${price.currencySymbol || 'đ'}` : 'N/A';
      }
      return price || 'N/A';
    };
    
    onSelectDrug({
      source: 'longchau',
      brand_name: drug.name || drug.productName || 'N/A',
      generic_name: drug.name || drug.productName || 'N/A',
      active_ingredient: drug.ingredient || drug.activeIngredient || drug.description || 'N/A',
      indications_and_usage: drug.uses || drug.indication || drug.description || 'N/A',
      warnings: drug.warnings || drug.contraindication || 'N/A',
      dosage_and_administration: drug.dosage || drug.administration || 'N/A',
      adverse_reactions: drug.sideEffects || drug.adverseReactions || 'N/A',
      price: formatPrice(drug.price)
    });
    onClose();
  };

  // Xóa từ khóa tìm kiếm
  const handleClearKeyword = () => {
    setKeyword('');
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
                icon={<LocalPharmacyIcon />} 
                label="Long Châu" 
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
          {longChauResults.length > 0 ? (
            <List>
              {longChauResults.map((drug, index) => (
                <React.Fragment key={index}>
                  <ListItem 
                    button 
                    onClick={() => handleSelectLongChauDrug(drug)}
                    sx={{ 
                      borderRadius: 1,
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <ListItemIcon>
                      <LocalPharmacyIcon color="secondary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={drug.name || drug.productName || 'Không có tên'}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {drug.priceFormatted || 
                              (typeof drug.price === 'object' 
                                ? (drug.price.price ? `${drug.price.price} ${drug.price.currencySymbol || 'đ'}` : 'Không có giá') 
                                : (drug.price || drug.priceFormat || 'Không có giá'))}
                          </Typography>
                          {(drug.manufacturer || drug.brand) && (
                            <Typography variant="body2" color="text.secondary" noWrap>
                              • {drug.manufacturer || drug.brand}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < longChauResults.length - 1 && <Divider component="li" />}
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
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DrugSearchDialog; 