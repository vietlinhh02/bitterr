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
  Tabs,
  Tab,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Search as SearchIcon,
  Save as SaveIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  LocalPharmacy as LocalPharmacyIcon,
  NewReleases as NewReleasesIcon,
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
  const [activeTab, setActiveTab] = useState(0); // 0: Nhãn thuốc, 1: Viên thuốc
  const [processedImage, setProcessedImage] = useState(null);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Reset states when changing tab
    setSelectedFile(null);
    setPreviewUrl(null);
    setDetectionResults(null);
    setProcessedImage(null);
    setSearchQuery('');
    setPharmacyResults(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
      setImageError(false);
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

      // Gọi endpoint tương ứng dựa vào tab đang chọn
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      const endpoint = activeTab === 0 
        ? `${backendUrl}/api/medicine-detection/detect` 
        : `${backendUrl}/api/medicine-detection/detect-pills`;
      
      console.log('Gửi yêu cầu đến endpoint:', endpoint);

      const response = await axios.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 giây timeout
      });

      if (response.data.success) {
        setDetectionResults(response.data.data);
        
        // Nếu đang ở tab viên thuốc và có ảnh đã xử lý
        if (activeTab === 1 && response.data.data.image_base64) {
          // Kiểm tra tính hợp lệ của dữ liệu base64 trước khi gán
          const imageData = response.data.data.image_base64;
          if (typeof imageData === 'string' && (
            imageData.startsWith('data:image/') || 
            imageData.startsWith('http://') || 
            imageData.startsWith('https://')
          )) {
            setProcessedImage(imageData);
          } else if (typeof imageData === 'string') {
            // Nếu thiếu tiền tố data:image, thêm vào
            setProcessedImage(`data:image/jpeg;base64,${imageData}`);
          } else {
            console.error('Định dạng ảnh không hợp lệ:', imageData);
          }
        }
        
        setSuccess('Nhận diện thuốc thành công');
        setOpenSnackbar(true);
      }
    } catch (err) {
      console.error('Lỗi khi nhận diện thuốc:', err);
      let errorMessage = 'Đã xảy ra lỗi khi nhận diện thuốc';
      
      if (err.response) {
        // Lỗi từ server với response code
        errorMessage = err.response.data?.message || `Lỗi máy chủ: ${err.response.status}`;
        console.error('Server response:', err.response.data);
      } else if (err.request) {
        // Không nhận được response
        errorMessage = 'Không thể kết nối với máy chủ. Vui lòng kiểm tra kết nối.';
      }
      
      setError(errorMessage);
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
    setProcessedImage(null);
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
      
      if (response) {
        // Access the products array from the response
        setPharmacyResults(response.data.data.items);
        console.log('Pharmacy results:', response.data.data.items); // Debug log
        setSuccess(`Đã tìm thấy ${response.data.data.total} sản phẩm tại nhà thuốc`);
        setOpenSnackbar(true);
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

  const handleImageError = () => {
    console.error('Lỗi khi tải hình ảnh');
    setImageError(true);
    // Hiển thị thông báo lỗi
    setError('Không thể hiển thị hình ảnh đã xử lý. Xin vui lòng thử lại.');
    setOpenSnackbar(true);
  };

  const renderDetectionTab = () => (
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
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                cursor: 'pointer',
                '&:hover': {
                  borderColor: 'primary.main',
                },
              }}
              onClick={() => fileInputRef.current.click()}
            >
              <CloudUploadIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                Nhấp để tải lên hình ảnh thuốc
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <img
                src={activeTab === 1 && processedImage && !imageError ? 
                  (processedImage.startsWith('data:image/') ? processedImage : `data:image/jpeg;base64,${processedImage}`) 
                  : previewUrl}
                alt="Preview"
                onError={handleImageError}
                style={{
                  maxWidth: '100%',
                  maxHeight: '300px',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
              <IconButton
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bgcolor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.7)',
                  },
                }}
                onClick={handleClearImage}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          )}

          <Box sx={{ width: '100%', mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                {activeTab === 0 && (
                  <TextField
                    fullWidth
                    label="Tìm kiếm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ví dụ: Tìm thuốc chứa paracetamol"
                    variant="outlined"
                    disabled={!selectedFile || loading}
                  />
                )}
              </Grid>
              <Grid item xs={activeTab === 0 ? 6 : 12}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  startIcon={<LocalPharmacyIcon />}
                  onClick={handleDetect}
                  disabled={!selectedFile || loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Nhận diện'}
                </Button>
              </Grid>
              {activeTab === 0 && (
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="secondary"
                    startIcon={<SearchIcon />}
                    onClick={handleSearch}
                    disabled={!selectedFile || !searchQuery.trim() || loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Tìm kiếm'}
                  </Button>
                </Grid>
              )}
            </Grid>
          </Box>
        </Paper>
      </Grid>

      {/* Phần kết quả nhận diện */}
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 3, minHeight: 400 }}>
          <Typography variant="h6" gutterBottom>
            Kết quả nhận diện
          </Typography>

          {loading ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: 300,
              }}
            >
              <CircularProgress size={40} />
              <Typography variant="body1" sx={{ mt: 2 }}>
                Đang xử lý...
              </Typography>
            </Box>
          ) : !detectionResults ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: 300,
                color: 'text.secondary',
              }}
            >
              <InfoIcon sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="body1" align="center">
                Tải lên hình ảnh và nhấn "Nhận diện" để phân tích thông tin thuốc.
              </Typography>
            </Box>
          ) : (
            <>
              {activeTab === 0 ? (
                // Hiển thị kết quả nhận diện nhãn thuốc (dùng Gemini API)
                <Box>
                  {detectionResults.rawResult ? (
                    <Typography
                      variant="body1"
                      component="div"
                      sx={{ whiteSpace: 'pre-wrap' }}
                    >
                      {detectionResults.rawResult}
                    </Typography>
                  ) : (
                    <>
                      {Array.isArray(detectionResults) ? (
                        detectionResults.map((item, index) => (
                          <Card key={index} sx={{ mb: 2 }}>
                            <CardContent>
                              <Typography variant="h6">{item.name}</Typography>
                              {item.dosage && (
                                <Typography variant="body2" color="text.secondary">
                                  Liều lượng: {item.dosage}
                                </Typography>
                              )}
                              {item.active_ingredients && (
                                <Typography variant="body2">
                                  Thành phần: {item.active_ingredients}
                                </Typography>
                              )}
                              {item.usage && (
                                <Typography variant="body2">
                                  Công dụng: {item.usage}
                                </Typography>
                              )}
                              <Box sx={{ mt: 1 }}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => handleSearchInPharmacy(item.name)}
                                >
                                  Tìm tại nhà thuốc
                                </Button>
                              </Box>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        // Hiển thị kết quả nếu là object
                        <Card sx={{ mb: 2 }}>
                          <CardContent>
                            {Object.entries(detectionResults).map(([key, value]) => {
                              // Bỏ qua các thuộc tính không cần hiển thị
                              if (key === 'box_2d' || key === 'image_base64') return null;
                              return (
                                <Typography key={key} variant="body1" gutterBottom>
                                  <strong>{key.replace('_', ' ')}:</strong> {value}
                                </Typography>
                              );
                            })}
                            <Box sx={{ mt: 1 }}>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleSearchInPharmacy(detectionResults.name)}
                                disabled={!detectionResults.name}
                              >
                                Tìm tại nhà thuốc
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  )}
                </Box>
              ) : (
                // Hiển thị kết quả nhận diện viên thuốc (Python ML)
                <Box>
                  {detectionResults.detections && detectionResults.detections.length > 0 ? (
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        Tìm thấy {detectionResults.detections.length} loại thuốc
                      </Typography>
                      {detectionResults.detections.map((detection, index) => (
                        <Card key={index} sx={{ mb: 2 }}>
                          <CardContent>
                            <Typography variant="h6">
                              {detection.medication_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              ID thuốc: {detection.medication_id}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Độ tin cậy: {(detection.confidence * 100).toFixed(1)}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Độ tin cậy YOLO: {(detection.yolo_confidence * 100).toFixed(1)}%
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleSearchInPharmacy(detection.medication_name)}
                              >
                                Tìm tại nhà thuốc
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body1" color="text.secondary" align="center">
                      Không tìm thấy thuốc nào trong hình ảnh
                    </Typography>
                  )}
                </Box>
              )}

              {detectionResults && (
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveResult}
                    disabled={loading}
                    fullWidth
                  >
                    Lưu kết quả
                  </Button>
                </Box>
              )}
            </>
          )}
        </Paper>
      </Grid>

      {/* Hiển thị kết quả từ nhà thuốc */}
      {pharmacyResults && pharmacyResults.length > 0 && (
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Sản phẩm tại nhà thuốc
            </Typography>
            <Grid container spacing={2}>
              {pharmacyResults.map((item, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {item.image && (
                      <CardMedia
                        component="img"
                        image={item.image}
                        alt={item.name}
                        sx={{ height: 200, objectFit: 'contain', p: 1 }}
                      />
                    )}
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="div" noWrap title={item.name}>
                        {item.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {item.brand}
                      </Typography>
                      <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                        {formatPrice(item.price)}
                      </Typography>
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ mt: 2 }}
                        onClick={() => navigate(`/pharmacy-product/${item.slug}`)}
                      >
                        Xem chi tiết
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      )}
    </Grid>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ 
        mb: 4, 
        color: '#1565c0',
        fontWeight: 700,
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: -10,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 100,
          height: 3,
          backgroundColor: '#bbdefb',
          borderRadius: 10,
        }
      }}>
        Nhận Diện Thuốc
      </Typography>

      <Box sx={{ 
        mb: 4, 
        display: 'flex', 
        justifyContent: 'center', 
        gap: 3,
        position: 'relative'
      }}>
        <Button
          variant={activeTab === 0 ? "contained" : "outlined"}
          color="primary"
          startIcon={<LocalPharmacyIcon />}
          onClick={() => handleTabChange(null, 0)}
          sx={{ 
            px: 4, 
            py: 1.2, 
            borderRadius: 5,
            boxShadow: activeTab === 0 ? 3 : 0,
            fontSize: '1rem',
            fontWeight: 500,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: activeTab === 0 ? 4 : 1,
            }
          }}
        >
          Nhãn thuốc
        </Button>
        <Button
          variant={activeTab === 1 ? "contained" : "outlined"} 
          color="primary"
          startIcon={<NewReleasesIcon />}
          onClick={() => handleTabChange(null, 1)}
          sx={{ 
            px: 4, 
            py: 1.2, 
            borderRadius: 5,
            boxShadow: activeTab === 1 ? 3 : 0,
            fontSize: '1rem',
            fontWeight: 500,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: activeTab === 1 ? 4 : 1,
            }
          }}
        >
          Viên thuốc
        </Button>
      </Box>

      {renderDetectionTab()}

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={error ? 'error' : 'success'}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MedicineDetection;
