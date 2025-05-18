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
  ToggleButtonGroup,
  ToggleButton,
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
    if (newValue !== null) {
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
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minHeight: 400,
            borderRadius: '16px',
            boxShadow: 3,
            border: '1px solid #e0e0e0',
          }}
        >
          <Typography variant="h5" gutterBottom sx={{ 
            fontWeight: 'bold', 
            color: '#009688',
            mb: 3,
            alignSelf: 'flex-start',
            borderBottom: '2px solid #009688',
            paddingBottom: 1,
            display: 'flex',
            alignItems: 'center'
          }}>
            <CloudUploadIcon sx={{ mr: 1 }} />
            Tải lên hình ảnh
          </Typography>
          
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
                  backgroundColor: '#f0f7ff',
                },
                transition: 'all 0.3s ease'
              }}
              onClick={() => fileInputRef.current.click()}
            >
              <CloudUploadIcon sx={{ fontSize: 80, color: '#009688', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#546e7a', textAlign: 'center' }}>
                Nhấp để tải lên hình ảnh thuốc
              </Typography>
              <Typography variant="body2" sx={{ color: '#78909c', mt: 1, textAlign: 'center' }}>
                Hỗ trợ định dạng: JPG, PNG, GIF (tối đa 10MB)
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
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
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

          <Box sx={{ width: '100%', mt: 4 }}>
            <Grid container spacing={2}>
              <Grid item xs={activeTab === 0 ? 6 : 12}>
                <Button
                  fullWidth
                  variant="contained"
                  sx={{ 
                    py: 1.5, 
                    borderRadius: 2,
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    boxShadow: 3,
                    bgcolor: '#009688',
                    '&:hover': {
                      bgcolor: '#00796b',
                    },
                    '&.Mui-disabled': {
                      bgcolor: '#e0f2f1',
                    }
                  }}
                  startIcon={<LocalPharmacyIcon />}
                  onClick={handleDetect}
                  disabled={!selectedFile || loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Nhận diện thuốc'}
                </Button>
              </Grid>
              {activeTab === 0 && (
                <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{ 
                      py: 1.5, 
                      borderRadius: 2,
                      fontSize: '1.1rem',
                      textTransform: 'none',
                      boxShadow: 3,
                      bgcolor: '#00897b',
                      '&:hover': {
                        bgcolor: '#00695c',
                      }
                    }}
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
        <Paper sx={{ 
          p: 4, 
          minHeight: 400, 
          borderRadius: '16px',
          boxShadow: 3,
          border: '1px solid #e0e0e0',
          overflowY: 'auto',
          maxHeight: '70vh'
        }}>
          <Typography variant="h5" gutterBottom sx={{ 
            fontWeight: 'bold', 
            color: '#009688',
            mb: 3,
            borderBottom: '2px solid #009688',
            paddingBottom: 1,
            display: 'flex',
            alignItems: 'center'
          }}>
            <SearchIcon sx={{ mr: 1 }} />
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
                      sx={{ 
                        whiteSpace: 'pre-wrap',
                        fontSize: '1.1rem',
                        lineHeight: 1.8,
                        backgroundColor: '#e0f2f1',
                        padding: 3,
                        borderRadius: 2,
                        border: '1px solid #b2dfdb'
                      }}
                    >
                      {detectionResults.rawResult}
                    </Typography>
                  ) : (
                    <>
                      {Array.isArray(detectionResults) ? (
                        detectionResults.map((item, index) => (
                          <Card 
                            key={index} 
                            sx={{ 
                              mb: 2, 
                              borderRadius: "8px", 
                              boxShadow: 'rgba(0, 0, 0, 0.08) 0px 3px 8px',
                              overflow: 'hidden',
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                boxShadow: 'rgba(0, 0, 0, 0.12) 0px 5px 12px',
                                transform: 'translateY(-2px)'
                              }
                            }}
                          >
                            <Box sx={{ 
                              p: 1, 
                              pl: 2, 
                              backgroundColor: '#009688', 
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              <LocalPharmacyIcon fontSize="small" sx={{ mr: 1 }} />
                              <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                                {item.name}
                              </Typography>
                            </Box>
                            <CardContent sx={{ p: 2 }}>
                              {item.dosage && (
                                <Box sx={{ 
                                  display: 'flex', 
                                  alignItems: 'flex-start', 
                                  mb: 1.5,
                                  pb: 1.5,
                                  borderBottom: '1px dashed #e0e0e0'
                                }}>
                                  <Typography variant="body2" sx={{ 
                                    fontWeight: 'bold', 
                                    color: '#546e7a',
                                    minWidth: '90px'
                                  }}>
                                    Liều lượng:
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: '#212121' }}>
                                    {item.dosage}
                                  </Typography>
                                </Box>
                              )}
                              {item.active_ingredients && (
                                <Box sx={{ 
                                  display: 'flex', 
                                  alignItems: 'flex-start', 
                                  mb: 1.5,
                                  pb: 1.5,
                                  borderBottom: '1px dashed #e0e0e0'
                                }}>
                                  <Typography variant="body2" sx={{ 
                                    fontWeight: 'bold', 
                                    color: '#546e7a',
                                    minWidth: '90px'
                                  }}>
                                    Thành phần:
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: '#212121' }}>
                                    {item.active_ingredients}
                                  </Typography>
                                </Box>
                              )}
                              {item.usage && (
                                <Box sx={{ 
                                  display: 'flex', 
                                  alignItems: 'flex-start', 
                                  mb: 1.5
                                }}>
                                  <Typography variant="body2" sx={{ 
                                    fontWeight: 'bold', 
                                    color: '#546e7a',
                                    minWidth: '90px'
                                  }}>
                                    Công dụng:
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: '#212121' }}>
                                    {item.usage}
                                  </Typography>
                                </Box>
                              )}
                              <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => handleSearchInPharmacy(item.name)}
                                  startIcon={<SearchIcon fontSize="small" />}
                                  sx={{ 
                                    borderRadius: 4,
                                    textTransform: 'none',
                                    fontSize: '0.8rem'
                                  }}
                                >
                                  Tìm tại nhà thuốc
                                </Button>
                              </Box>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        // Hiển thị kết quả nếu là object
                        <Card sx={{ 
                          mb: 2, 
                          borderRadius: "8px", 
                          boxShadow: 'rgba(0, 0, 0, 0.08) 0px 3px 8px',
                          overflow: 'hidden',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            boxShadow: 'rgba(0, 0, 0, 0.12) 0px 5px 12px',
                            transform: 'translateY(-2px)'
                          }
                        }}>
                          {detectionResults.name && (
                            <Box sx={{ 
                              p: 1, 
                              pl: 2, 
                              backgroundColor: '#009688', 
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center'
                            }}>
                              <LocalPharmacyIcon fontSize="small" sx={{ mr: 1 }} />
                              <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                                {detectionResults.name}
                              </Typography>
                            </Box>
                          )}
                          <CardContent sx={{ p: 2 }}>
                            {Object.entries(detectionResults).map(([key, value]) => {
                              // Bỏ qua các thuộc tính không cần hiển thị và tên (đã hiển thị ở header)
                              if (key === 'box_2d' || key === 'image_base64' || key === 'name') return null;
                              
                              // Chuyển đổi key thành tiêu đề dạng người đọc
                              const formattedKey = key
                                .replace(/_/g, ' ')
                                .split(' ')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(' ');
                                
                              return (
                                <Box 
                                  key={key} 
                                  sx={{ 
                                    display: 'flex', 
                                    alignItems: 'flex-start', 
                                    mb: 1.5,
                                    pb: 1.5,
                                    borderBottom: key !== Object.keys(detectionResults).filter(k => 
                                      k !== 'box_2d' && k !== 'image_base64' && k !== 'name').pop() 
                                      ? '1px dashed #e0e0e0' : 'none',
                                  }}
                                >
                                  <Typography variant="body2" sx={{ 
                                    fontWeight: 'bold', 
                                    color: '#546e7a',
                                    minWidth: '100px'
                                  }}>
                                    {formattedKey}:
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: '#212121' }}>
                                    {value}
                                  </Typography>
                                </Box>
                              );
                            })}
                            <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleSearchInPharmacy(detectionResults.name)}
                                disabled={!detectionResults.name}
                                startIcon={<SearchIcon fontSize="small" />}
                                sx={{ 
                                  borderRadius: 4,
                                  textTransform: 'none',
                                  fontSize: '0.8rem'
                                }}
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
                      <Typography variant="subtitle1" gutterBottom sx={{ 
                        color: '#009688', 
                        fontWeight: 'medium',
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        <InfoIcon fontSize="small" sx={{ mr: 1 }} />
                        Tìm thấy {detectionResults.detections.length} loại thuốc
                      </Typography>
                      
                      {/* Hiển thị ảnh đã xử lý nếu có */}
                      {processedImage && (
                        <Box sx={{ 
                          mb: 2, 
                          display: 'flex', 
                          justifyContent: 'center',
                          border: '1px solid #b2dfdb',
                          borderRadius: 1,
                          padding: 1,
                          backgroundColor: '#e0f2f1'
                        }}>
                          <img 
                            src={processedImage} 
                            alt="Ảnh đã xử lý" 
                            style={{ 
                              maxWidth: '100%', 
                              maxHeight: '400px',
                              borderRadius: '4px',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                            }} 
                            onError={handleImageError}
                          />
                        </Box>
                      )}
                      
                      <Box sx={{ mt: 2 }}>
                        {detectionResults.detections.map((detection, index) => (
                          <Card 
                            key={index} 
                            sx={{ 
                              mb: 2, 
                              borderRadius: "8px", 
                              boxShadow: 'rgba(0, 0, 0, 0.08) 0px 3px 8px',
                              overflow: 'hidden',
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                boxShadow: 'rgba(0, 0, 0, 0.12) 0px 5px 12px',
                                transform: 'translateY(-2px)'
                              }
                            }}
                          >
                            <Box sx={{ 
                              p: 1, 
                              pl: 2, 
                              backgroundColor: '#009688', 
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <LocalPharmacyIcon fontSize="small" sx={{ mr: 1 }} />
                                <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                                  {detection.medication_name}
                                </Typography>
                              </Box>
                              <Chip 
                                label={`ID: ${detection.medication_id}`} 
                                size="small"
                                sx={{ 
                                  bgcolor: 'rgba(255,255,255,0.25)', 
                                  color: 'white',
                                  fontSize: '0.7rem',
                                  height: 20
                                }}
                              />
                            </Box>
                            <CardContent sx={{ p: 2 }}>
                              <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography variant="body2" sx={{ 
                                      fontWeight: 'bold', 
                                      color: '#546e7a',
                                      mr: 1
                                    }}>
                                      Độ tin cậy:
                                    </Typography>
                                    <Chip 
                                      label={`${(detection.confidence * 100).toFixed(1)}%`} 
                                      color={detection.confidence > 0.7 ? "success" : "warning"}
                                      size="small"
                                      sx={{ 
                                        fontSize: '0.7rem',
                                        height: 22
                                      }}
                                    />
                                  </Box>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Typography variant="body2" sx={{ 
                                      fontWeight: 'bold', 
                                      color: '#546e7a',
                                      mr: 1
                                    }}>
                                      Độ tin cậy YOLO:
                                    </Typography>
                                    <Chip 
                                      label={`${(detection.yolo_confidence * 100).toFixed(1)}%`} 
                                      color={detection.yolo_confidence > 0.7 ? "success" : "warning"}
                                      size="small"
                                      sx={{ 
                                        fontSize: '0.7rem',
                                        height: 22
                                      }}
                                    />
                                  </Box>
                                </Grid>
                              </Grid>
                              
                              <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={() => handleSearchInPharmacy(detection.medication_name)}
                                  startIcon={<SearchIcon fontSize="small" />}
                                  sx={{ 
                                    borderRadius: 4,
                                    textTransform: 'none',
                                    fontSize: '0.8rem'
                                  }}
                                >
                                  Tìm tại nhà thuốc
                                </Button>
                              </Box>
                            </CardContent>
                          </Card>
                        ))}
                      </Box>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        p: 3,
                        bgcolor: '#f5f5f5',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column'
                      }}
                    >
                      <InfoIcon sx={{ color: '#9e9e9e', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary" align="center">
                        Không tìm thấy thuốc nào trong hình ảnh
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              {detectionResults && (
                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveResult}
                    disabled={loading}
                    fullWidth
                    sx={{ 
                      py: 1.5, 
                      borderRadius: 2, 
                      fontSize: '1.1rem',
                      textTransform: 'none',
                      bgcolor: '#26a69a',
                      '&:hover': {
                        bgcolor: '#00897b',
                      }
                    }}
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
          <Paper sx={{ 
            p: 4, 
            mt: 4, 
            borderRadius: '16px', 
            boxShadow: 3,
            border: '1px solid #e0e0e0'
          }}>
            <Typography variant="h5" gutterBottom sx={{ 
              display: 'flex', 
              alignItems: 'center',
              color: '#009688',
              fontWeight: 'bold',
              pb: 2,
              mb: 3,
              borderBottom: '2px solid #009688'
            }}>
              <LocalPharmacyIcon sx={{ mr: 1, fontSize: 30 }} />
              Sản phẩm tại nhà thuốc
            </Typography>
            
            <Grid container spacing={3} sx={{ mt: 1 }}>
              {pharmacyResults.map((item, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    border: '1px solid #e0e0e0',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 5,
                    }
                  }}>
                    <Box sx={{ 
                      position: 'relative', 
                      pt: '100%', 
                      overflow: 'hidden',
                      backgroundColor: '#f8f9fa'
                    }}>
                      {item.thumbnail && item.thumbnail.image_url ? (
                        <CardMedia
                          component="img"
                          image={item.thumbnail.image_url}
                          alt={item.name}
                          sx={{ 
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            p: 2,
                            transition: 'transform 0.3s ease',
                            '&:hover': {
                              transform: 'scale(1.05)'
                            }
                          }}
                        />
                      ) : (
                        <Box sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: '#f5f5f5'
                        }}>
                          <LocalPharmacyIcon sx={{ fontSize: 80, color: '#bdbdbd' }} />
                        </Box>
                      )}
                    </Box>
                    
                    <CardContent sx={{ flexGrow: 1, pt: 2, pb: 1 }}>
                      <Typography 
                        variant="h6" 
                        component="div" 
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: 1.3,
                          height: '2.6em',
                          fontWeight: 'medium',
                          fontSize: '1.1rem',
                          color: '#00796b'
                        }}
                        title={item.name}
                      >
                        {item.name}
                      </Typography>
                      
                      {item.brand_name && (
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            mt: 1,
                            fontWeight: 'medium',
                            color: '#546e7a'
                          }}
                        >
                          <strong>Thương hiệu:</strong> {item.brand_name}
                        </Typography>
                      )}
                      
                      {item.price && (
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            mt: 2,
                            color: '#d32f2f',
                            fontWeight: 'bold'
                          }}
                        >
                          {formatPrice(item.price)} ₫
                        </Typography>
                      )}
                    </CardContent>
                    
                    <Box sx={{ p: 2, pt: 0 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => navigate(`/pharmacy-product/${item.slug}`)}
                        sx={{
                          borderRadius: '8px',
                          py: 1.5,
                          boxShadow: 2,
                          bgcolor: '#009688',
                          fontSize: '1rem',
                          textTransform: 'none',
                          '&:hover': {
                            bgcolor: '#00796b'
                          }
                        }}
                      >
                        Xem chi tiết
                      </Button>
                    </Box>
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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header với tiêu đề lớn và nổi bật */}
      <Box 
        sx={{ 
          textAlign: 'center', 
          mb: 4,
          pb: 3,
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <Typography 
          variant="h3" 
          component="h1" 
          sx={{ 
            fontWeight: 'bold', 
            mb: 2,
            color: '#00796b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center' 
          }}
        >
          <LocalPharmacyIcon sx={{ fontSize: 40, mr: 2 }} />
          Nhận diện thuốc
        </Typography>
        <Typography variant="h6" sx={{ color: '#00897b', fontWeight: 'normal' }}>
          Tải lên hình ảnh và sử dụng công nghệ AI để nhận dạng thông tin về thuốc
        </Typography>
      </Box>

      {/* Switch chọn loại nhận diện thay cho Tabs */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          mb: 6
        }}
      >
        <ToggleButtonGroup
          value={activeTab}
          exclusive
          onChange={handleTabChange}
          aria-label="loại nhận diện"
          size="small"
          sx={{
            '& .MuiToggleButtonGroup-grouped': {
              border: '1px solid #009688',
              '&.Mui-selected': {
                backgroundColor: '#009688',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#00796b',
                },
              },
              '&:not(:first-of-type)': {
                borderLeft: '1px solidrgb(3, 35, 32)',
              },
              py: 1,
              px: 2,
              borderRadius: '20px !important',
              mx: 0.5
            },
          }}
        >
          <ToggleButton 
            value={0} 
            aria-label="nhãn thuốc"
            sx={{ 
              textTransform: 'none',
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <LocalPharmacyIcon sx={{ mr: 1, fontSize: '1rem' }} />
            Nhãn thuốc
          </ToggleButton>
          <ToggleButton 
            value={1} 
            aria-label="viên thuốc"
            sx={{ 
              textTransform: 'none',
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <NewReleasesIcon sx={{ mr: 1, fontSize: '1rem' }} />
            Viên thuốc
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Grid container spacing={4}>
        {renderDetectionTab()}
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
