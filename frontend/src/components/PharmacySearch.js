import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  CardActionArea, 
  CircularProgress, 
  Alert, 
  Pagination,
  Chip,
  Stack
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axios-config';

const PharmacySearch = () => {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const navigate = useNavigate();

  const handleSearch = async (pageNum = 1) => {
    if (!keyword.trim()) {
      setError('Vui lòng nhập từ khóa tìm kiếm');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get('/api/pharmacy/search', {
        params: {
          keyword: keyword.trim(),
          page: pageNum,
          limit: 12
        }
      });

      if (response.data.success) {
        setResults(response.data.data);
        setTotalPages(Math.ceil((response.data.data.total || 0) / 12));
        setPage(pageNum);
      } else {
        setError(response.data.message || 'Có lỗi xảy ra khi tìm kiếm');
      }
    } catch (error) {
      console.error('Error searching products:', error);
      setError('Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    handleSearch(value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const navigateToDetail = (slug) => {
    navigate(`/pharmacy-product/${slug}`);
  };

  // Format price from "10.000 đ" to just "10.000đ"
  const formatPrice = (price) => {
    if (!price) return 'Liên hệ';
    return price.replace(/\s+đ/g, 'đ');
  };

  // Kiểm tra xem một thuộc tính có giá trị hiển thị được không
  const hasValue = (value) => {
    if (value === null || value === undefined || value === '') return false;
    if (typeof value === 'string' && (value.trim() === '' || value === 'Không có mô tả' || value === 'Not found')) return false;
    return true;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          <LocalPharmacyIcon sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
          Tìm Kiếm Thuốc và Sản Phẩm Y Tế
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Tìm kiếm thuốc, thực phẩm chức năng và sản phẩm y tế từ Pharmacity
        </Typography>
      </Box>

      <Box sx={{ 
        mb: 4, 
        display: 'flex', 
        alignItems: 'center',
        gap: 1,
        p: 2,
        borderRadius: 2,
        bgcolor: 'background.paper',
        boxShadow: 1
      }}>
        <TextField
          fullWidth
          label="Nhập tên thuốc hoặc thành phần"
          variant="outlined"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyPress={handleKeyPress}
          sx={{ flexGrow: 1 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleSearch()}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
          disabled={loading}
          sx={{ py: 1.5, px: 3 }}
        >
          Tìm Kiếm
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {results && (
        <Box>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {`Tìm thấy ${results.total || 0} kết quả cho "${keyword}"`}
            </Typography>
            {results.total > 0 && (
              <Typography variant="body2" color="text.secondary">
                Trang {page} / {totalPages}
              </Typography>
            )}
          </Box>

          {results.items?.length > 0 ? (
            <>
              <Grid container spacing={3}>
                {results.items.map((item) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={item.slug}>
                    <Card 
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 3
                        },
                        position: 'relative'
                      }}
                    >
                      {/* Hiển thị loại sản phẩm nếu có dạng badge */}
                      {(item.is_prescription_drug || item.is_drug) && (
                        <Chip
                          label={item.is_prescription_drug ? "Kê đơn" : "Thuốc"}
                          color={item.is_prescription_drug ? "error" : "info"}
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            zIndex: 1
                          }}
                        />
                      )}
                      
                      <CardActionArea onClick={() => navigateToDetail(item.slug)}>
                        <CardMedia
                          component="div"
                          height="180"
                          sx={{ 
                            height: 180,
                            bgcolor: '#f8f9fa',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: 2
                          }}
                        >
                          {item.thumbnail && item.thumbnail.image_url ? (
                            <img 
                              src={item.thumbnail.image_url}
                              alt={item.name}
                              style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain'
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                const placeholder = document.createElement('div');
                                placeholder.style.display = 'flex';
                                placeholder.style.flexDirection = 'column';
                                placeholder.style.alignItems = 'center';
                                placeholder.style.justifyContent = 'center';
                                placeholder.innerHTML = `
                                  <svg style="font-size: 48px; color: #9e9e9e" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M6,3A3,3 0 0,1 9,6C9,7.3 8.1,8.4 7,8.8C7.1,9.2 7.2,9.6 7.5,10L8.2,10.7C8.6,11 8.9,11.5 8.9,12C8.9,12.5 8.6,13 8.2,13.3L7.2,14.3L7.5,14.5C8.8,15.4 9.4,17 9,18.5L8.8,19.7C8.6,20.1 8.2,20.4 7.8,20.4H5C4.5,20.4 4.1,20 4,19.5C4,18 4.4,16.5 5.1,15.2L5.3,15C4.5,14.2 4,13.1 4,12C4,10.9 4.5,9.8 5.3,9L6,8.3C6.3,7.9 6.5,7.4 6.5,7C6.5,6.4 6.3,5.9 6,5.5C5.8,5.3 5.7,5.1 5.7,4.8C5.7,4.6 5.8,4.3 6,4.1C6.2,3.9 6.4,3.8 6.7,3.8V3H6M13,3A3,3 0 0,1 16,6C16,7.3 15.1,8.4 14,8.8C14.1,9.2 14.2,9.6 14.5,10L15.2,10.7C15.6,11 15.9,11.5 15.9,12C15.9,12.5 15.6,13 15.2,13.3L14.2,14.3L14.5,14.5C15.8,15.4 16.4,17 16,18.5L15.8,19.7C15.6,20.1 15.2,20.4 14.8,20.4H12C11.5,20.4 11.1,20 11,19.5C11,18 11.4,16.5 12.1,15.2L12.3,15C11.5,14.2 11,13.1 11,12C11,10.9 11.5,9.8 12.3,9L13,8.3C13.3,7.9 13.5,7.4 13.5,7C13.5,6.4 13.3,5.9 13,5.5C12.8,5.3 12.7,5.1 12.7,4.8C12.7,4.6 12.8,4.3 13,4.1C13.2,3.9 13.4,3.8 13.7,3.8V3H13M6,4.8V4.7L6.1,4.8H6Z" />
                                  </svg>
                                  <p style="margin-top: 8px; font-size: 12px; color: #9e9e9e">Không có hình ảnh</p>
                                `;
                                e.target.parentElement.appendChild(placeholder);
                              }}
                            />
                          ) : (
                            <Box sx={{ textAlign: 'center' }}>
                              <LocalPharmacyIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                              <Typography variant="caption" color="text.disabled" display="block">
                                Không có hình ảnh
                              </Typography>
                            </Box>
                          )}
                        </CardMedia>
                        <CardContent sx={{ flexGrow: 1, p: 2 }}>
                          <Typography 
                            variant="subtitle1" 
                            component="div" 
                            gutterBottom
                            sx={{ 
                              fontWeight: 'bold',
                              minHeight: '3rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              color: '#1976d2'
                            }}
                          >
                            {item.name}
                          </Typography>
                          
                          {hasValue(item.short_description) && (
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{ 
                                mb: 1,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                              }}
                            >
                              {item.short_description}
                            </Typography>
                          )}

                          {hasValue(item.brand) && (
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                mb: 1,
                                fontStyle: 'italic',
                                color: 'text.secondary'
                              }}
                            >
                              {`Hãng: ${item.brand}`}
                            </Typography>
                          )}

                          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                            {hasValue(item.is_prescription_drug) && item.is_prescription_drug && (
                              <Chip
                                label="Kê đơn"
                                color="error"
                                size="small"
                                sx={{ fontSize: '0.7rem' }}
                              />
                            )}
                            {hasValue(item.is_drug) && item.is_drug && !item.is_prescription_drug && (
                              <Chip
                                label="Thuốc"
                                color="info"
                                size="small"
                                sx={{ fontSize: '0.7rem' }}
                              />
                            )}
                          </Stack>

                          <Typography 
                            variant="h6" 
                            color="primary" 
                            sx={{ fontWeight: 'bold', mt: 'auto' }}
                          >
                            {formatPrice(item.price)}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {totalPages > 1 && (
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                  <Pagination 
                    count={totalPages} 
                    page={page} 
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                  />
                </Box>
              )}
            </>
          ) : (
            <Alert severity="info">
              Không tìm thấy kết quả phù hợp. Vui lòng thử từ khóa khác.
            </Alert>
          )}
        </Box>
      )}
    </Container>
  );
};

export default PharmacySearch; 