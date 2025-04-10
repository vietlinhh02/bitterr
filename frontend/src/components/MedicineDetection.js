import React, { useState, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Snackbar,
  Card,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Search as SearchIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  LocalPharmacy as LocalPharmacyIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MedicineDetection = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [detectionResults, setDetectionResults] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [pharmacyResults, setPharmacyResults] = useState(null);
  const [loadingPharmacy, setLoadingPharmacy] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.match('image.*')) {
        setError('Vui lòng chọn file hình ảnh');
        setOpenSnackbar(true);
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError('Kích thước file không được vượt quá 10MB');
        setOpenSnackbar(true);
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleDetect = async () => {
    if (!selectedFile) {
      setError('Vui lòng chọn hình ảnh');
      setOpenSnackbar(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await axios.post('http://localhost:5000/api/medicine-detection/detect', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setDetectionResults(response.data.data);
        setSuccess('Nhận diện thuốc thành công');
        setOpenSnackbar(true);
      }
    } catch (err) {
      console.error('Lỗi khi nhận diện thuốc:', err);
      setError(err.response?.data?.message || 'Đã xảy ra lỗi khi nhận diện thuốc');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!selectedFile || !searchQuery.trim()) {
      setError('Vui lòng chọn hình ảnh và nhập từ khóa tìm kiếm');
      setOpenSnackbar(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('query', searchQuery);

      const response = await axios.post('http://localhost:5000/api/medicine-detection/search', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setDetectionResults(response.data.data);
        setSuccess('Tìm kiếm thuốc thành công');
        setOpenSnackbar(true);
      }
    } catch (err) {
      console.error('Lỗi khi tìm kiếm thuốc:', err);
      setError(err.response?.data?.message || 'Đã xảy ra lỗi khi tìm kiếm thuốc');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResult = async () => {
    if (!detectionResults) {
      setError('Không có kết quả để lưu');
      setOpenSnackbar(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/api/medicine-detection/save-result', {
        detectionResult: detectionResults,
      });

      if (response.data.success) {
        setSuccess('Đã lưu kết quả thành công');
        setOpenSnackbar(true);
      }
    } catch (err) {
      console.error('Lỗi khi lưu kết quả:', err);
      setError(err.response?.data?.message || 'Đã xảy ra lỗi khi lưu kết quả');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setDetectionResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSearchInPharmacy = async (drugName) => {
    setLoadingPharmacy(true);
    setError(null);
    
    try {
      // Call your pharmacy search API with the drug name
      const response = await axios.get(`http://localhost:5000/api/pharmacy/search`, {
        params: { keyword: drugName }
      });
      
      console.log('Pharmacy search response:', response.data.data); // Debug log
      
      if (response ) {
        // Access the products array from the response
        setPharmacyResults(response.data.data.items);
        console.log('Pharmacy results:', response.data.data.items); // Debug log
        setSuccess(`Đã tìm thấy ${response.data.data.total} sản phẩm tại nhà thuốc`);
        setOpenSnackbar(true)
      } else {
        setPharmacyResults([]);
        setError('Không tìm thấy sản phẩm nào tại nhà thuốc');
        setOpenSnackbar(true);
      }
    } catch (err) {
      console.error('Lỗi khi tìm sản phẩm tại nhà thuốc:', err);
      setError(err.response?.data?.message || 'Đã xảy ra lỗi khi tìm kiếm tại nhà thuốc');
      setOpenSnackbar(true);
    } finally {
      setLoadingPharmacy(false);
    }
  };

  // Helper function to format price
  const formatPrice = (price) => {
    if (!price) return 'Liên hệ để biết giá';
    if (typeof price === 'object') {
      if (price.price && price.currencySymbol) {
        return `${price.price.toLocaleString('vi-VN')}${price.currencySymbol}`;
      }
      return 'Liên hệ để biết giá';
    }
    return `${price.toLocaleString('vi-VN')}đ`;
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
        Nhận Diện Thuốc
      </Typography>

      <Grid container spacing={4}>
        {/* Phần upload và preview ảnh */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minHeight: 400,
            }}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              ref={fileInputRef}
            />
            
            {!previewUrl ? (
              <Box
                sx={{
                  width: '100%',
                  height: 300,
                  border: '2px dashed #ccc',
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: 'primary.main',
                  },
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <CloudUploadIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  Nhấn để tải lên hình ảnh thuốc
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  Hỗ trợ: JPG, PNG (Tối đa 10MB)
                </Typography>
              </Box>
            ) : (
              <Box sx={{ position: 'relative', width: '100%' }}>
                <CardMedia
                  component="img"
                  image={previewUrl}
                  alt="Preview"
                  sx={{
                    width: '100%',
                    maxHeight: 300,
                    objectFit: 'contain',
                    borderRadius: 1,
                  }}
                />
                <IconButton
                  onClick={handleClearImage}
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'background.paper',
                    '&:hover': { bgcolor: 'background.paper' },
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            )}

            <Box sx={{ mt: 3, display: 'flex', gap: 2, width: '100%' }}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleDetect}
                disabled={!selectedFile || loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                Nhận Diện
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
              >
                Chọn Ảnh Khác
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Phần tìm kiếm và kết quả */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, minHeight: 400 }}>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Nhập từ khóa tìm kiếm"
                variant="outlined"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={loading}
                sx={{ mb: 2 }}
              />
              <Button
                fullWidth
                variant="contained"
                onClick={handleSearch}
                disabled={!selectedFile || !searchQuery.trim() || loading}
                startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
              >
                Tìm Kiếm
              </Button>
            </Box>

            {detectionResults && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Kết Quả Nhận Diện:
                </Typography>
                
                {Array.isArray(detectionResults) ? (
                  detectionResults.map((result, index) => (
                    <Card key={index} sx={{ mb: 2 }}>
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {result.name || result.drugName}
                        </Typography>
                        
                        {result.activeIngredients && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              <b>Thành phần:</b> {result.activeIngredients}
                            </Typography>
                          </Box>
                        )}
                        
                        {result.dosage && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              <b>Liều lượng:</b> {result.dosage}
                            </Typography>
                          </Box>
                        )}
                        
                        {result.warnings && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="error">
                              <b>Cảnh báo:</b> {result.warnings}
                            </Typography>
                          </Box>
                        )}
                        
                        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                          
                          <Chip
                            icon={<LocalPharmacyIcon />}
                            label={loadingPharmacy ? "Đang tìm..." : "Tìm ở nhà thuốc"}
                            variant="outlined"
                            color="primary"
                            onClick={() => handleSearchInPharmacy(result.name || result.drugName)}
                            disabled={loadingPharmacy}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Alert severity="info">
                    Không tìm thấy kết quả phù hợp
                  </Alert>
                )}

                {/* Hiển thị kết quả tìm kiếm tại nhà thuốc */}
                {pharmacyResults && (
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" gutterBottom>
                      Sản phẩm tại nhà thuốc:
                    </Typography>
                    
                    {pharmacyResults.length > 0 ? (
                      pharmacyResults.map((product, index) => (
                        <Card key={index} sx={{ mb: 2 }}>
                          <CardContent>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {product.name || product.title || "Không có tên"}
                            </Typography>
                            
                            {(product.price || product.retail_price) && (
                              <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold', mt: 1 }}>
                                Giá: {formatPrice(product.variants.price || product.retail_price)}
                              </Typography>
                            )}
                            
                            {product.manufacturer && (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Nhà sản xuất: {product.manufacturer}
                              </Typography>
                            )}
                            
                            <Button 
                              variant="outlined" 
                              size="small" 
                              sx={{ mt: 2 }}
                              onClick={() => window.open(product.url || `/pharmacy-product/${product.slug || product.id}`, '_blank')}
                            >
                              Xem chi tiết
                            </Button>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <Alert severity="info">
                        Không tìm thấy sản phẩm phù hợp tại nhà thuốc
                      </Alert>
                    )}
                  </Box>
                )}

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveResult}
                    disabled={loading}
                  >
                    Lưu Kết Quả
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={error ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MedicineDetection;
