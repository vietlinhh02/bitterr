import React, { useState, useRef } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Button, 
  Box, 
  Grid, 
  CircularProgress, 
  Divider, 
  Alert, 
  Snackbar,
  Card,
  CardContent,
  CardMedia,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
  IconButton
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon, 
  Image as ImageIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  MedicalServices as MedicalServicesIcon,
  Send as SendIcon,
  LocalPharmacy as LocalPharmacyIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { detectDrugFromImage, askAIAboutDrug } from '../services/api';

function ImageDrugDetection() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [question, setQuestion] = useState('');
  const [askingQuestion, setAskingQuestion] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Kiểm tra file có phải là ảnh không
      if (!file.type.match('image.*')) {
        setError('Vui lòng chọn file ảnh');
        setOpenSnackbar(true);
        return;
      }

      // Kiểm tra kích thước file (giới hạn 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Kích thước file không được vượt quá 5MB');
        setOpenSnackbar(true);
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResults(null);
      setAiResponse('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Vui lòng chọn một file ảnh');
      setOpenSnackbar(true);
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);
    setAiResponse('');

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await detectDrugFromImage(formData);
      console.log('Detection response:', response.data);

      if (response.data) {
        // Vẽ bounding box lên ảnh
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Vẽ ảnh gốc
          ctx.drawImage(img, 0, 0);
          
          // Vẽ bounding boxes nếu có OCR results
          if (response.data.ocrResults) {
            response.data.ocrResults.forEach(result => {
              const [x_min, y_min, x_max, y_max] = result.bbox;
              
              // Vẽ rectangle
              ctx.strokeStyle = '#00ff00';
              ctx.lineWidth = 2;
              ctx.strokeRect(x_min, y_min, x_max - x_min, y_max - y_min);
              
              // Vẽ text
              ctx.fillStyle = '#00ff00';
              ctx.font = '16px Arial';
              ctx.fillText(result.text, x_min, y_min - 5);
            });
          }
          
          // Cập nhật preview với ảnh đã vẽ bounding box
          setPreviewUrl(canvas.toDataURL());
        };
        
        img.src = previewUrl;
        
        // Lưu kết quả vào state
        const processedResults = {
          message: response.data.message,
          detectedText: response.data.detectedText,
          ocrResults: response.data.ocrResults || [],
          fdaData: response.data.fdaData || [],
          longChauData: response.data.longChauData || [],
          hasFDAData: response.data.hasFDAData || false,
          hasLongChauData: response.data.hasLongChauData || false
        };
        setResults(processedResults);
      } else {
        setError('Không tìm thấy thông tin thuốc trong ảnh');
        setOpenSnackbar(true);
      }
    } catch (err) {
      console.error('Error detecting drugs from image:', err);
      setError('Đã xảy ra lỗi khi xử lý ảnh. Vui lòng thử lại sau.');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResults(null);
    setAiResponse('');
    setQuestion('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleViewDrugDetails = (drug) => {
    navigate(`/fda-drugs/${drug.product_ndc}`, { state: { drugData: drug } });
  };

  const handleAskQuestion = async () => {
    if (!question.trim() || !results) {
      return;
    }

    setAskingQuestion(true);
    setAiResponse('');

    try {
      // Chuẩn bị dữ liệu để gửi đi
      const requestData = {
        question: question,
        detectedText: results.detectedText,
        fdaData: results.hasFDAData ? results.fdaData : [],
        longChauData: results.hasLongChauData ? results.longChauData : []
      };

      const response = await askAIAboutDrug(requestData);
      
      if (response.data && typeof response.data === 'string') {
        setAiResponse(response.data);
      } else {
        setError('Không nhận được thông tin phản hồi từ AI. Vui lòng thử lại sau.');
        setOpenSnackbar(true);
        setAiResponse('Xin lỗi, tôi không thể trả lời câu hỏi này do không nhận được đủ thông tin. Vui lòng thử lại sau.');
      }
    } catch (err) {
      console.error('Lỗi khi hỏi AI:', err);
      setError('Đã xảy ra lỗi khi xử lý câu hỏi. Vui lòng thử lại sau.');
      setOpenSnackbar(true);
      setAiResponse('Xin lỗi, đã có lỗi xảy ra khi xử lý câu hỏi của bạn. Vui lòng thử lại sau.');
    } finally {
      setAskingQuestion(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <ImageIcon sx={{ mr: 1.5, color: 'primary.main' }} />
          Nhận diện thuốc từ ảnh
        </Typography>
        
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={4}>
          {/* Upload section */}
          <Grid item xs={12} md={6}>
            <Box 
              sx={{ 
                border: '2px dashed', 
                borderColor: 'primary.light', 
                borderRadius: 2, 
                p: 3, 
                textAlign: 'center',
                bgcolor: 'background.default',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="image-upload"
                ref={fileInputRef}
              />
              
              {previewUrl ? (
                <Box sx={{ width: '100%', mb: 2 }}>
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '300px', 
                      objectFit: 'contain',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }} 
                  />
                </Box>
              ) : (
                <CloudUploadIcon sx={{ fontSize: 80, color: 'primary.light', mb: 2 }} />
              )}
              
              <Typography variant="body1" gutterBottom color="text.secondary">
                {previewUrl ? 'Ảnh đã chọn' : 'Tải lên ảnh thuốc để nhận diện'}
              </Typography>
              
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <label htmlFor="image-upload">
                  <Button 
                    variant="outlined" 
                    component="span"
                    startIcon={<ImageIcon />}
                    disabled={loading}
                  >
                    Chọn ảnh
                  </Button>
                </label>
                
                {previewUrl && (
                  <Button 
                    variant="outlined" 
                    color="error"
                    startIcon={<ClearIcon />}
                    onClick={handleClear}
                    disabled={loading}
                  >
                    Xóa
                  </Button>
                )}
              </Box>
            </Box>
          </Grid>
          
          {/* Action and results section */}
          <Grid item xs={12} md={6}>
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                startIcon={<SearchIcon />}
                onClick={handleUpload}
                disabled={!selectedFile || loading}
                sx={{ mb: 3 }}
              >
                {loading ? 'Đang xử lý...' : 'Nhận diện thuốc'}
              </Button>
              
              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                  <CircularProgress />
                </Box>
              )}
              
              {results && (
                <Box sx={{ mt: 2, flexGrow: 1, overflow: 'auto' }}>
                  {/* Hiển thị kết quả FDA */}
                  {results.hasFDAData && (
                    <>
                      <Typography variant="h6" gutterBottom sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        color: '#1976d2',
                        fontWeight: 'bold'
                      }}>
                        <MedicalServicesIcon sx={{ mr: 1 }} />
                        Kết quả từ FDA
                      </Typography>
                      
                      <List sx={{ bgcolor: 'background.paper', borderRadius: 1, mb: 4 }}>
                        {results.fdaData.map((drug, index) => (
                          <Card key={index} sx={{ mb: 2, borderRadius: 2 }}>
                            <CardContent>
                              <Typography variant="h6" color="primary">
                                {drug.brand_name || drug.generic_name || 'Không có tên'}
                              </Typography>
                              
                              {drug.active_ingredient && (
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  Thành phần: {drug.active_ingredient}
                                </Typography>
                              )}
                              
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                                <Button 
                                  size="small" 
                                  variant="outlined"
                                  onClick={() => handleViewDrugDetails(drug)}
                                  startIcon={<MedicalServicesIcon />}
                                >
                                  Xem chi tiết
                                </Button>
                              </Box>
                            </CardContent>
                          </Card>
                        ))}
                      </List>
                    </>
                  )}

                  {/* Hiển thị kết quả Long Châu */}
                  {results.hasLongChauData && (
                    <>
                      <Typography variant="h6" gutterBottom sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        color: '#00a859',
                        fontWeight: 'bold'
                      }}>
                        <LocalPharmacyIcon sx={{ mr: 1 }} />
                        Kết quả từ Long Châu
                      </Typography>
                      
                      <List sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
                        {results.longChauData.map((drug, index) => (
                          <Card key={index} sx={{ mb: 2, borderRadius: 2 }}>
                            <CardContent>
                              <Box sx={{ display: 'flex', gap: 2 }}>
                                {drug.image && (
                                  <Box sx={{ width: 100, height: 100, flexShrink: 0 }}>
                                    <img 
                                      src={drug.image} 
                                      alt={drug.name}
                                      style={{ 
                                        width: '100%', 
                                        height: '100%', 
                                        objectFit: 'contain',
                                        borderRadius: 8
                                      }} 
                                    />
                                  </Box>
                                )}
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="h6" color="primary" gutterBottom>
                                    {drug.name || 'Không có tên'}
                                  </Typography>
                                  
                                  {drug.price && (
                                    <Typography variant="body1" color="error" gutterBottom>
                                      {formatPrice(drug.price)}
                                    </Typography>
                                  )}
                                  
                                  {drug.manufacturer && (
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                      Nhà sản xuất: {drug.manufacturer}
                                    </Typography>
                                  )}

                                  {drug.description && (
                                    <Typography 
                                      variant="body2" 
                                      color="text.secondary" 
                                      sx={{ 
                                        mt: 1,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                      }}
                                    >
                                      {drug.description}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>

                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                <Button 
                                  size="small" 
                                  variant="outlined"
                                  href={drug.url}
                                  target="_blank"
                                  startIcon={<MedicalServicesIcon />}
                                >
                                  Xem trên Long Châu
                                </Button>
                              </Box>
                            </CardContent>
                          </Card>
                        ))}
                      </List>
                    </>
                  )}

                  {!results.hasFDAData && !results.hasLongChauData && (
                    <Alert severity="info">
                      Không tìm thấy thông tin thuốc. Vui lòng thử lại với ảnh khác.
                    </Alert>
                  )}

                  {/* Phần hỏi AI */}
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <MedicalServicesIcon sx={{ mr: 1, color: 'primary.main' }} />
                      Hỏi AI về thuốc đã nhận diện
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <TextField
                        fullWidth
                        placeholder="Nhập câu hỏi của bạn về thuốc này..."
                        variant="outlined"
                        size="small"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        disabled={askingQuestion || (!results.hasFDAData && !results.hasLongChauData)}
                        helperText={(!results.hasFDAData && !results.hasLongChauData) ? 
                          "Không có thông tin thuốc để hỏi" : ""}
                      />
                      <IconButton 
                        color="primary" 
                        onClick={handleAskQuestion}
                        disabled={!question.trim() || askingQuestion || (!results.hasFDAData && !results.hasLongChauData)}
                      >
                        <SendIcon />
                      </IconButton>
                    </Box>
                    
                    {askingQuestion && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                        <CircularProgress size={24} />
                      </Box>
                    )}
                    
                    {aiResponse && (
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 2, 
                          bgcolor: aiResponse.includes("Xin lỗi") ? '#fff3e0' : 'background.default',
                          borderRadius: 2,
                          whiteSpace: 'pre-line',
                          border: aiResponse.includes("Xin lỗi") ? '1px solid #ffb74d' : '1px solid rgba(0, 0, 0, 0.12)'
                        }}
                      >
                        <Typography 
                          variant="body2" 
                          color={aiResponse.includes("Xin lỗi") ? 'error' : 'text.primary'}
                        >
                          {aiResponse}
                        </Typography>
                      </Paper>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default ImageDrugDetection; 