import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  Divider, 
  Button, 
  CircularProgress, 
  Chip,
  TextField,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Alert,
  Snackbar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tab,
  Tabs,
  Link as MuiLink
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  ExpandMore as ExpandMoreIcon,
  Send as SendIcon,
  Chat as ChatIcon,
  ShoppingCart as ShoppingCartIcon,
  OpenInNew as OpenInNewIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { getLongChauDrugInfo, askGeminiAboutDrug } from '../services/api';
import parse from 'html-react-parser';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const LongChauProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [webData, setWebData] = useState(null);
  const [webDataLoading, setWebDataLoading] = useState(false);
  const [productUrl, setProductUrl] = useState('');
  
  // Chat với AI
  const [chatOpen, setChatOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    console.log('Slug trong LongChauProductDetail:', slug);
    
    const fetchDrugInfo = async () => {
      try {
        setLoading(true);
        setError('Đang tải thông tin sản phẩm từ Long Châu...');
        setOpenSnackbar(true);
        const data = await getLongChauDrugInfo(slug);
        setProductData(data);
        setWebData(data);
        setProductUrl(data.url);
        setError(null);
        setOpenSnackbar(false);
      } catch (err) {
        console.error('Lỗi khi lấy thông tin thuốc:', err);
        setError(err.message);
        setOpenSnackbar(true);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchDrugInfo();
    } else {
      console.error('Không có slug!');
      setError('Không tìm thấy thông tin sản phẩm.');
      setLoading(false);
    }
  }, [slug]);

  const fetchDrugInfo = async (url) => {
    try {
      setWebDataLoading(true);
      console.log('Đang lấy thông tin thuốc từ Long Châu với URL:', url);
      
      // Hiển thị thông báo đang tải dữ liệu
      setError('Đang tải thông tin thuốc từ Long Châu...');
      setOpenSnackbar(true);
      
      // Sử dụng API để lấy thông tin thuốc
      const drugInfoResult = await getLongChauDrugInfo(url);
      console.log('Thông tin thuốc từ Long Châu:', drugInfoResult);
      
      // Cập nhật URL sản phẩm nếu chưa được đặt
      if (!productUrl && drugInfoResult && drugInfoResult.url) {
        setProductUrl(drugInfoResult.url);
      } else if (!productUrl) {
        setProductUrl(url);
      }
      
      // Đóng thông báo lỗi nếu có
      setOpenSnackbar(false);
      setError(null);
      
      // Cập nhật dữ liệu
      setWebData(drugInfoResult);
    } catch (err) {
      console.error('Lỗi khi lấy thông tin thuốc:', err);
      setError(`Không thể lấy thông tin thuốc: ${err.message}`);
      setOpenSnackbar(true);
      
      // Thêm nút để thử lại
      setWebData({
        isRealData: false,
        needRetry: true,
        error: err.message
      });
    } finally {
      setWebDataLoading(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Cuộn xuống cuối cuộc trò chuyện khi có tin nhắn mới
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const toggleChat = () => {
    setChatOpen(!chatOpen);
    if (!chatOpen && chatHistory.length === 0) {
      // Thêm tin nhắn chào mừng khi mở chat lần đầu
      setChatHistory([
        { 
          role: 'assistant', 
          content: `Xin chào! Tôi là trợ lý AI. Bạn có thể hỏi tôi bất kỳ câu hỏi nào về sản phẩm "${productData?.name || 'này'}".` 
        }
      ]);
    }
  };

  const handleSendQuestion = async () => {
    if (!question.trim()) return;

    const userQuestion = question.trim();
    setQuestion('');
    setChatHistory(prev => [...prev, { role: 'user', content: userQuestion }]);
    setChatLoading(true);

    try {
      // Chuẩn bị thông tin sản phẩm để gửi đến AI
      const productInfo = {
        name: webData?.productName || productData?.name || 'Không có tên',
        description: webData?.description || productData?.description || 'Không có thông tin',
        ingredients: webData?.ingredients || productData?.ingredients || 'Không có thông tin',
        usage: webData?.usage || productData?.usage || 'Không có thông tin',
        dosage: webData?.dosage || productData?.dosage || 'Không có thông tin',
        adverseEffect: webData?.adverseEffect || productData?.adverseEffect || 'Không có thông tin',
        careful: webData?.careful || productData?.careful || 'Không có thông tin',
        preservation: webData?.preservation || productData?.preservation || 'Không có thông tin',
        brand: webData?.brand?.name || productData?.brand?.name || 'Không có thông tin',
        category: webData?.category?.name || productData?.category?.name || 'Không có thông tin',
        price: webData?.productPrice || productData?.price || 'Không có thông tin',
        url: productUrl || 'Không có thông tin'
      };

      console.log('Sending data to Gemini:', { productInfo, question: userQuestion });
      const response = await askGeminiAboutDrug({
        productInfo,
        question: userQuestion
      });

      console.log('Gemini response:', response);
      if (response.data.success) {
        setChatHistory(prev => [...prev, { role: 'assistant', content: response.data.answer }]);
      } else {
        throw new Error(response.data.message || 'Không nhận được câu trả lời từ AI');
      }
    } catch (err) {
      console.error('Lỗi khi gửi câu hỏi đến AI:', err);
      let errorMessage = 'Xin lỗi, đã xảy ra lỗi khi xử lý câu hỏi của bạn. ';
      
      if (err.response?.data?.message) {
        errorMessage += err.response.data.message;
      } else if (err.message) {
        errorMessage += err.message;
      } else {
        errorMessage += 'Vui lòng thử lại sau.';
      }
      
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: errorMessage
      }]);
      
      setError(errorMessage);
      setOpenSnackbar(true);
    } finally {
      setChatLoading(false);
    }
  };

  // Hàm xử lý parse HTML an toàn
  const safeParseHTML = (htmlContent, errorMessage) => {
    try {
      return parse(htmlContent || '');
    } catch (err) {
      console.error(`Lỗi khi parse HTML: ${errorMessage}`, err);
      return <Typography>Không thể hiển thị nội dung.</Typography>;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Đang tải thông tin sản phẩm...
        </Typography>
      </Container>
    );
  }

  if (error || !productData) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBackClick}
          sx={{ mb: 2 }}
        >
          Quay lại
        </Button>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error || 'Không tìm thấy thông tin sản phẩm.'}
        </Alert>
      </Container>
    );
  }

  const renderHtmlContent = (content) => {
    return { __html: content || 'Không có thông tin' };
  };

  const tabPanels = [
    { label: 'Mô tả', content: productData.description },
    { label: 'Thành phần', content: productData.ingredients },
    { label: 'Công dụng', content: productData.usage },
    { label: 'Cách dùng', content: productData.dosage },
    { label: 'Tác dụng phụ', content: productData.adverseEffect },
    { label: 'Lưu ý', content: productData.careful },
    { label: 'Bảo quản', content: productData.preservation }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={handleBackClick}
        sx={{ mb: 3 }}
      >
        Quay lại
      </Button>

      <Grid container spacing={4}>
        {/* Thông tin cơ bản sản phẩm */}
        <Grid item xs={12} md={5}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 3, 
              borderRadius: 2, 
              backgroundColor: '#f5f5f5',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <Box 
              component="img"
              src={webData?.imageUrl || productData.images?.[0]?.url || productData.image || 'https://via.placeholder.com/400x400?text=No+Image'}
              alt={productData.name || 'Sản phẩm'}
              sx={{ 
                width: '100%', 
                maxHeight: 400, 
                objectFit: 'contain',
                mb: 3
              }}
            />
            {productData.images && productData.images.length > 1 && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                {productData.images.slice(0, 4).map((img, index) => (
                  <Box 
                    key={index}
                    component="img"
                    src={img.url}
                    alt={`${productData.name} - ${index + 1}`}
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      objectFit: 'contain',
                      border: '1px solid #ddd',
                      borderRadius: 1,
                      p: 1,
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </Box>
            )}
            
            {webData?.isRealData && (
              <Box sx={{ mt: 2, mb: 2, textAlign: 'center' }}>
                <Chip 
                  color="success" 
                  label="Dữ liệu thật từ Long Châu" 
                  size="small"
                  sx={{ fontWeight: 'bold' }}
                />
              </Box>
            )}
            
            {webData?.needRetry && (
              <Box sx={{ mt: 2, mb: 2, textAlign: 'center' }}>
                <Button 
                  variant="outlined" 
                  color="warning"
                  onClick={() => fetchDrugInfo(productUrl)}
                  startIcon={<RefreshIcon />}
                  sx={{ mb: 1 }}
                >
                  Thử lại lấy dữ liệu
                </Button>
                <Typography variant="caption" color="error" display="block">
                  {webData.error}
                </Typography>
              </Box>
            )}
            
            {webDataLoading && (
              <Box sx={{ mt: 2, mb: 2, textAlign: 'center' }}>
                <CircularProgress size={24} />
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Đang lấy dữ liệu từ trang web Long Châu...
                </Typography>
              </Box>
            )}
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<ShoppingCartIcon />}
                component="a"
                href={productUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ borderRadius: 2, px: 3, py: 1 }}
              >
                Mua sản phẩm tại Long Châu
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Chi tiết sản phẩm */}
        <Grid item xs={12} md={7}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              borderRadius: 2,
              height: '100%'
            }}
          >
            <Typography variant="h4" component="h1" gutterBottom>
              {webData?.productName || productData.name || 'Không có tên sản phẩm'}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              {productData.brand && (
                <Chip 
                  label={`Thương hiệu: ${productData.brand.name || 'Không có tên'}`} 
                  color="primary" 
                  variant="outlined"
                />
              )}
              {productData.category && (
                <Chip 
                  label={productData.category.name || 'Không có danh mục'} 
                  color="secondary" 
                  variant="outlined"
                />
              )}
              {webData?.isRealData && (
                <Chip 
                  color="success" 
                  label="Dữ liệu thật" 
                  variant="outlined"
                  size="small"
                />
              )}
            </Box>

            <Typography variant="h5" color="primary" sx={{ mb: 2, fontWeight: 'bold' }}>
              {webData?.productPrice ? (
                <span dangerouslySetInnerHTML={webData.productPrice} />
              ) : (
                formatPrice(productData.price || 0)
              )}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Mô tả ngắn:
              </Typography>
              <Typography variant="body1">
                {productData.shortDescription || 'Không có mô tả ngắn.'}
              </Typography>
            </Box>
            
            {webData?.crawlTime && (
              <Box sx={{ mb: 2, mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Dữ liệu được cập nhật lúc: {new Date(webData.crawlTime).toLocaleString('vi-VN')}
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<ChatIcon />}
                onClick={toggleChat}
                sx={{ flex: 1 }}
              >
                Chat với AI về sản phẩm này
              </Button>
              
              <Button
                variant="outlined"
                color="primary"
                startIcon={<OpenInNewIcon />}
                component="a"
                href={productUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ flex: 1 }}
              >
                Xem tại Long Châu
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Tabs thông tin chi tiết */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              variant="scrollable"
              scrollButtons="auto"
              textColor="primary"
              indicatorColor="primary"
            >
              {tabPanels.map((tab, index) => (
                <Tab key={index} label={tab.label} />
              ))}
            </Tabs>
            
            <Box sx={{ p: 3 }}>
              {tabPanels.map((tab, index) => (
                <div
                  key={index}
                  role="tabpanel"
                  hidden={tabValue !== index}
                >
                  {tabValue === index && (
                    <Box>
                      {safeParseHTML(tab.content, tab.label)}
                    </Box>
                  )}
                </div>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Chat với AI */}
      {chatOpen && (
        <Paper 
          elevation={4} 
          sx={{ 
            position: 'fixed', 
            bottom: 20, 
            right: 20, 
            width: 350, 
            height: 500,
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000
          }}
        >
          <Box 
            sx={{ 
              p: 2, 
              backgroundColor: 'primary.main', 
              color: 'white',
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Typography variant="h6">
              Chat với AI
            </Typography>
            <IconButton size="small" onClick={toggleChat} sx={{ color: 'white' }}>
              <ArrowBackIcon />
            </IconButton>
          </Box>
          
          <Box 
            sx={{ 
              flexGrow: 1, 
              overflowY: 'auto', 
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              bgcolor: '#f5f5f5'
            }}
          >
            {chatHistory.map((msg, index) => (
              <Box 
                key={index}
                sx={{ 
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%'
                }}
              >
                <Paper 
                  elevation={1}
                  sx={{ 
                    p: 1.5, 
                    borderRadius: 2,
                    backgroundColor: msg.role === 'user' ? 'primary.light' : 'white',
                    color: msg.role === 'user' ? 'white' : 'text.primary',
                    '& .markdown-content': {
                      '& p': {
                        m: 0,
                        mb: 1,
                        '&:last-child': {
                          mb: 0
                        }
                      },
                      '& a': {
                        color: msg.role === 'user' ? 'inherit' : 'primary.main',
                        textDecoration: 'underline'
                      },
                      '& code': {
                        p: 0.5,
                        borderRadius: 1,
                        bgcolor: msg.role === 'user' ? 'rgba(255,255,255,0.1)' : 'grey.100',
                        fontFamily: 'monospace'
                      },
                      '& pre': {
                        p: 1,
                        borderRadius: 1,
                        bgcolor: msg.role === 'user' ? 'rgba(255,255,255,0.1)' : 'grey.100',
                        overflowX: 'auto'
                      },
                      '& ul, & ol': {
                        m: 0,
                        mb: 1,
                        pl: 2
                      },
                      '& blockquote': {
                        m: 0,
                        mb: 1,
                        pl: 1,
                        borderLeft: '3px solid',
                        borderColor: msg.role === 'user' ? 'rgba(255,255,255,0.3)' : 'grey.300'
                      },
                      '& table': {
                        borderCollapse: 'collapse',
                        width: '100%',
                        mb: 1
                      },
                      '& th, & td': {
                        border: '1px solid',
                        borderColor: msg.role === 'user' ? 'rgba(255,255,255,0.2)' : 'grey.300',
                        p: 0.5
                      }
                    }
                  }}
                >
                  {msg.role === 'user' ? (
                    <Typography variant="body2">
                      {msg.content}
                    </Typography>
                  ) : (
                    <Box className="markdown-content">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({node, ...props}) => <Typography variant="body2" {...props} />,
                          a: ({node, ...props}) => <MuiLink target="_blank" rel="noopener noreferrer" {...props} />,
                          code: ({node, inline, ...props}) => 
                            inline ? (
                              <code style={{padding: '2px 4px'}} {...props} />
                            ) : (
                              <pre style={{padding: '8px', overflowX: 'auto'}}><code {...props} /></pre>
                            )
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </Box>
                  )}
                </Paper>
              </Box>
            ))}
            {chatLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}
            <div ref={chatEndRef} />
          </Box>
          
          <Box sx={{ p: 2, borderTop: '1px solid #eee', display: 'flex' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Nhập câu hỏi của bạn..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendQuestion()}
              disabled={chatLoading}
              sx={{ mr: 1 }}
            />
            <IconButton 
              color="primary" 
              onClick={handleSendQuestion}
              disabled={!question.trim() || chatLoading}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      )}

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

export default LongChauProductDetail; 