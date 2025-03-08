import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Box, 
  CircularProgress, 
  Divider, 
  Chip,
  Paper,
  InputAdornment,
  IconButton,
  Alert,
  Snackbar
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { searchLongChauProducts } from '../services/api';

// Hàm debounce để trì hoãn việc gọi hàm
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

const LongChauSearch = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState({
    keywords: [],
    categories: [],
    products: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [lastSearchedKeyword, setLastSearchedKeyword] = useState('');

  // Sử dụng useCallback để tạo hàm tìm kiếm có thể được debounce
  const performSearch = useCallback(async (searchKeyword) => {
    if (!searchKeyword.trim() || searchKeyword === lastSearchedKeyword) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await searchLongChauProducts(searchKeyword);
      console.log('Dữ liệu sản phẩm từ API:', data);
      
      // Kiểm tra cấu trúc dữ liệu trả về
      if (Array.isArray(data)) {
        setSearchResults({
          products: data,
          keywords: [],
          categories: []
        });
      } else {
        // Nếu dữ liệu không phải là mảng, giữ nguyên cấu trúc
        setSearchResults(data);
      }
      
      setLastSearchedKeyword(searchKeyword);
    } catch (err) {
      console.error('Lỗi khi tìm kiếm:', err);
      if (err.message === 'Đang có quá nhiều request, vui lòng thử lại sau.') {
        setError('Đang có quá nhiều yêu cầu. Vui lòng đợi một lát và thử lại.');
      } else {
        setError('Đã xảy ra lỗi khi tìm kiếm sản phẩm. Vui lòng thử lại sau.');
      }
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  }, [lastSearchedKeyword]);

  // Tạo phiên bản debounce của hàm tìm kiếm
  const debouncedSearch = useCallback(
    debounce((searchKeyword) => {
      performSearch(searchKeyword);
    }, 500), // Trì hoãn 500ms
    [performSearch]
  );

  // Gọi hàm tìm kiếm khi người dùng nhập
  useEffect(() => {
    if (keyword.trim().length >= 2) { // Chỉ tìm kiếm khi có ít nhất 2 ký tự
      debouncedSearch(keyword);
    }
  }, [keyword, debouncedSearch]);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!keyword.trim()) return;
    
    performSearch(keyword);
  };

  const handleClearSearch = () => {
    setKeyword('');
    setSearchResults({
      keywords: [],
      categories: [],
      products: []
    });
    setLastSearchedKeyword('');
  };

  const handleKeywordClick = (keywordText) => {
    setKeyword(keywordText);
    // Không cần gọi API ở đây vì useEffect sẽ tự động gọi
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatProductPrice = (price) => {
    if (!price) return 'Liên hệ để biết giá';
    if (typeof price === 'object') {
      if (price.price && price.currencySymbol) {
        return `${price.price.toLocaleString('vi-VN')}${price.currencySymbol}`;
      }
      return 'Liên hệ để biết giá';
    }
    return formatPrice(price);
  };

  // Render danh sách sản phẩm
  const renderProducts = () => {
    if (!searchResults.products || searchResults.products.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            Không tìm thấy sản phẩm nào phù hợp.
          </Typography>
        </Box>
      );
    }

    return (
      <Grid container spacing={2}>
        {searchResults.products.map((product, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 3
                }
              }}
            >
              <CardMedia
                component="img"
                height="140"
                image={product.image || 'https://via.placeholder.com/140x140?text=No+Image'}
                alt={product.webName}
                sx={{ objectFit: 'contain', p: 1 }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="div" sx={{ 
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  height: '3em',
                  lineHeight: '1.5em'
                }}>
                  {product.webName}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {formatProductPrice(product.price)}
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth
                  onClick={() => handleViewProduct(product)}
                  disabled={!product.slug}
                >
                  Xem chi tiết
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  // Hàm xử lý khi người dùng nhấn vào sản phẩm
  const handleViewProduct = (product) => {
    if (!product || !product.slug) {
      setError('Không có thông tin sản phẩm');
      setOpenSnackbar(true);
      return;
    }
    
    // Chuyển hướng đến trang chi tiết sản phẩm với đường dẫn đầy đủ
    navigate(`/longchau/product/${encodeURIComponent(product.slug)}`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4, color: 'primary.main' }}>
        Tìm Kiếm Sản Phẩm Long Châu
      </Typography>

      <Paper 
        component="form" 
        onSubmit={handleSearch}
        elevation={3}
        sx={{ 
          p: 2, 
          mb: 4, 
          borderRadius: 2,
          backgroundColor: 'background.paper'
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          label="Nhập tên sản phẩm cần tìm"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="primary" />
              </InputAdornment>
            ),
            endAdornment: keyword && (
              <InputAdornment position="end">
                <IconButton onClick={handleClearSearch} edge="end">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
          sx={{ mb: 2 }}
        />
        <Button 
          type="submit" 
          variant="contained" 
          color="primary" 
          fullWidth
          disabled={loading || !keyword.trim()}
          sx={{ 
            py: 1.5,
            fontSize: '1rem'
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Tìm Kiếm'}
        </Button>
      </Paper>

      {/* Hiển thị từ khóa gợi ý */}
      {searchResults.keywords && searchResults.keywords.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Từ khóa gợi ý:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {searchResults.keywords.map((item, index) => {
              // Kiểm tra nếu item là đối tượng
              const keywordText = typeof item === 'object' && item !== null 
                ? (item.keyword || 'Không có từ khóa') 
                : item;
              
              return (
                <Chip 
                  key={index} 
                  label={keywordText} 
                  color="primary" 
                  variant="outlined" 
                  clickable
                  onClick={() => handleKeywordClick(keywordText)}
                />
              );
            })}
          </Box>
        </Box>
      )}

      {/* Hiển thị thông báo đang tìm kiếm */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Đang tìm kiếm sản phẩm...
          </Typography>
        </Box>
      )}

      {/* Hiển thị danh mục */}
      {searchResults.categories && searchResults.categories.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Danh mục liên quan:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {searchResults.categories.map((category, index) => {
              // Kiểm tra nếu category không có thuộc tính name
              if (!category || typeof category !== 'object' || !category.name) {
                console.warn('Danh mục không hợp lệ:', category);
                return null;
              }
              
              return (
                <Chip 
                  key={index} 
                  label={category.name} 
                  color="secondary" 
                  variant="outlined" 
                  clickable
                />
              );
            })}
          </Box>
        </Box>
      )}

      {/* Hiển thị kết quả sản phẩm */}
      {renderProducts()}

      {/* Thông báo lỗi */}
      <Snackbar 
        open={openSnackbar} 
        autoHideDuration={6000} 
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default LongChauSearch; 