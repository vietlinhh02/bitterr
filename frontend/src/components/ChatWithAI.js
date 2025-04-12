import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  CircularProgress, 
  IconButton, 
  Divider, 
  Chip,
  Avatar,
  Card,
  CardContent,
  Tooltip,
  Fade,
  Zoom,
  Alert,
  Snackbar,
  Link as MuiLink,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  Badge,
  CardMedia,
  Grid
} from '@mui/material';
import { 
  Send as SendIcon, 
  Delete as DeleteIcon, 
  SmartToy as SmartToyIcon,
  Person as PersonIcon,
  MedicalServices as MedicalServicesIcon,
  ArrowBack as ArrowBackIcon,
  QuestionAnswer as QuestionAnswerIcon,
  History as HistoryIcon,
  Add as AddIcon,
  Menu as MenuIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { askGeminiAboutDrug, getChatHistory, deleteChatHistoryItem } from '../services/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DrugSearchDialog from './DrugSearchDialog';
import axiosInstance from '../axios-config';

// Update the markdown styles
const markdownStyles = {
  '& .markdown-content': {
    '& p': {
      m: 0,
      mb: 1.5,
      lineHeight: 1.6,
      '&:last-child': {
        mb: 0
      }
    },
    '& a': {
      color: 'primary.main',
      textDecoration: 'underline',
      fontWeight: 500,
      '&:hover': {
        textDecoration: 'none'
      }
    },
    '& code': {
      px: 0.8,
      py: 0.4,
      borderRadius: 1,
      bgcolor: 'rgba(0,0,0,0.06)',
      fontFamily: 'Consolas, Monaco, "Andale Mono", monospace',
      fontSize: '0.875em',
      color: '#d32f2f'
    },
    '& pre': {
      p: 2,
      borderRadius: 2,
      bgcolor: 'grey.100',
      overflowX: 'auto',
      mb: 2,
      border: '1px solid',
      borderColor: 'grey.200',
      '& code': {
        p: 0,
        bgcolor: 'transparent',
        color: 'text.primary',
        fontSize: '0.875em'
      }
    },
    '& ul, & ol': {
      m: 0,
      mb: 2,
      pl: 3
    },
    '& li': {
      mb: 0.8,
      '&:last-child': {
        mb: 0
      }
    },
    '& blockquote': {
      m: 0,
      mb: 2,
      pl: 2,
      py: 1,
      borderLeft: '4px solid',
      borderColor: 'info.light',
      bgcolor: 'rgba(33, 150, 243, 0.08)',
      color: 'text.primary',
      fontStyle: 'italic'
    },
    '& table': {
      borderCollapse: 'collapse',
      width: '100%',
      mb: 2,
      bgcolor: 'background.paper',
      border: '1px solid',
      borderColor: 'grey.300',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    },
    '& th': {
      border: '1px solid',
      borderColor: 'grey.300',
      p: 1.5,
      bgcolor: 'grey.50',
      fontWeight: 'bold',
      textAlign: 'left'
    },
    '& td': {
      border: '1px solid',
      borderColor: 'grey.300',
      p: 1.5
    },
    '& h1, & h2, & h3, & h4, & h5, & h6': {
      color: 'primary.dark',
      fontWeight: 600,
      mt: 3,
      mb: 1.5,
      lineHeight: 1.3
    },
    '& h3': {
      fontSize: '1.3em',
    },
    '& h4': {
      fontSize: '1.2em',
    },
    '& h5': {
      fontSize: '1.1em', 
    },
    '& strong': {
      fontWeight: 600,
      color: 'text.primary'
    },
    '& em': {
      color: 'text.secondary',
      fontStyle: 'italic'
    },
    '& hr': {
      my: 2,
      border: 'none',
      borderTop: '1px solid',
      borderColor: 'grey.300'
    },
    '& img': {
      maxWidth: '100%',
      height: 'auto',
      display: 'block',
      my: 2,
      borderRadius: 1
    }
  }
};

// Thêm component MessageBubble cho hiển thị chat dạng bong bóng
const MessageBubble = ({ isUser, message, timestamp }) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: isUser ? 'row-reverse' : 'row',
      mb: 2
    }}>
      <Avatar 
        sx={{ 
          bgcolor: isUser ? 'primary.main' : 'secondary.main',
          width: 40, 
          height: 40,
          mr: isUser ? 0 : 1.5,
          ml: isUser ? 1.5 : 0
        }}
      >
        {isUser ? <PersonIcon /> : <SmartToyIcon />}
      </Avatar>
      <Box sx={{ maxWidth: '80%' }}>
        <Paper 
          elevation={1} 
          sx={{ 
            p: 2, 
            bgcolor: isUser ? 'primary.50' : 'grey.50',
            borderRadius: 2,
            borderTopLeftRadius: isUser ? 2 : 0,
            borderTopRightRadius: isUser ? 0 : 2,
          }}
        >
          <Box className="markdown-content" sx={{ ...markdownStyles['& .markdown-content'] }}>
            {isUser ? (
              <Typography>{message}</Typography>
            ) : (
              <ReactMarkdown
                children={message}
                remarkPlugins={[remarkGfm]}
              />
            )}
          </Box>
        </Paper>
        <Typography variant="caption" color="text.secondary" sx={{ 
          display: 'block', 
          mt: 0.5, 
          textAlign: isUser ? 'right' : 'left'
        }}>
          {timestamp}
        </Typography>
      </Box>
    </Box>
  );
};

// Component hiển thị thông tin thuốc
const DrugInfoCard = ({ drugInfo }) => {
  if (!drugInfo) return null;
  
  return (
    <Card sx={{ mb: 3, boxShadow: 3 }}>
      {drugInfo.imageUrl && (
        <CardMedia
          component="img"
          height="140"
          image={drugInfo.imageUrl}
          alt={drugInfo.name}
          sx={{ objectFit: 'contain', bgcolor: '#f9f9f9', p: 1 }}
        />
      )}
      <CardContent>
        <Typography variant="h6" component="div">
          {drugInfo.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {drugInfo.manufacturer?.name || 'Không có thông tin nhà sản xuất'}
        </Typography>
        <Divider sx={{ my: 1 }} />
        <Grid container spacing={1} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <Typography variant="subtitle2">Phân loại:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
              {drugInfo.categories?.map((category, index) => (
                <Chip key={index} label={category} size="small" />
              ))}
            </Box>
          </Grid>
          {drugInfo.prescriptionRequired !== undefined && (
            <Grid item xs={12} sx={{ mt: 1 }}>
              <Chip 
                label={drugInfo.prescriptionRequired ? "Cần đơn thuốc" : "Không cần đơn"} 
                color={drugInfo.prescriptionRequired ? "warning" : "success"}
                size="small"
              />
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

const ChatWithAI = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [drugInfo, setDrugInfo] = useState(location.state?.drugInfo);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openChatDialog, setOpenChatDialog] = useState(false);  // Điều khiển dialog lịch sử chat
  const [openDrugSearchDialog, setOpenDrugSearchDialog] = useState(false); // Điều khiển dialog tìm kiếm thuốc
  const [anchorEl, setAnchorEl] = useState(null);  // Cho dropdown menu
  const [chatHistory, setChatHistory] = useState([]); // Thêm state cho lịch sử chat
  
  const suggestedQuestions = [
    "Thuốc này có tác dụng phụ gì không?",
    "Liều dùng khuyến cáo là bao nhiêu?",
    "Có thể dùng cho phụ nữ mang thai không?",
    "Có tương tác với thuốc nào không?",
    "Cơ chế hoạt động của thuốc này là gì?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Thêm tin nhắn chào mừng khi component được tải
  useEffect(() => {
    const welcomeMessage = drugInfo
      ? `Chào mừng bạn đến với trợ lý AI của chúng tôi. Tôi có thể cung cấp thông tin về thuốc "${drugInfo.name}". Bạn có câu hỏi gì về thuốc này không?`
      : 'Chào mừng bạn đến với trợ lý AI của chúng tôi. Tôi có thể trả lời các câu hỏi về thuốc và sức khỏe. Hãy đặt câu hỏi của bạn!';
    
    setMessages([
      {
        text: welcomeMessage,
        isUser: false,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  }, [drugInfo]);

  const handleSendMessage = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const response = await askGeminiAboutDrug({
        drugInfo: drugInfo || null,
        question: input,
        messages: messages.map(msg => ({
          role: msg.isUser || msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text || msg.content
        })).concat([{
          role: 'user',
          content: input
        }])
      });

      // Xử lý phản hồi - Không kiểm tra ok vì response đã là dữ liệu
      const data = response.data;

      const aiMessage = {
        id: Date.now().toString() + '-ai',
        content: data.answer || data.response,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('Lỗi khi gửi tin nhắn:', err);
      setError(`Đã xảy ra lỗi: ${err.message || 'Không xác định'}. Vui lòng thử lại sau.`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedQuestionClick = (suggestedQuestion) => {
    setInput(suggestedQuestion);
    // Không gửi ngay lập tức để người dùng có thể chỉnh sửa nếu muốn
  };

  const handleDeleteChatItem = async (chatId) => {
    try {
      await deleteChatHistoryItem(chatId);
      // Cập nhật lịch sử chat sau khi xóa
      setChatHistory(prev => {
        if (!Array.isArray(prev)) return [];
        return prev.filter(item => item._id !== chatId);
      });
      
      // Nếu xóa hết chat, refresh lại danh sách
      const updatedHistory = chatHistory.filter(item => item._id !== chatId);
      if (updatedHistory.length === 0) {
        fetchAllChats();
      }
    } catch (err) {
      console.error('Lỗi khi xóa mục chat:', err);
      setError('Không thể xóa mục chat. Vui lòng thử lại sau.');
      setOpenSnackbar(true);
    }
  };

  const formatTimestamp = (timestamp) => {
    try {
      // Kiểm tra timestamp có hợp lệ không
      if (!timestamp) {
        console.warn('Timestamp is undefined or null');
        return 'Không có thời gian';
      }
      
      // Nếu timestamp là chuỗi thời gian như "5:58:55 PM", chuyển đổi sang đối tượng Date
      if (typeof timestamp === 'string' && /\d+:\d+:\d+/.test(timestamp)) {
        // Sử dụng thời gian hiện tại nhưng chỉ lấy giờ:phút:giây từ timestamp
        const now = new Date();
        const timeParts = timestamp.match(/(\d+):(\d+):(\d+)\s*([AP]M)?/i);
        
        if (timeParts) {
          let hours = parseInt(timeParts[1], 10);
          const minutes = parseInt(timeParts[2], 10);
          const seconds = parseInt(timeParts[3], 10);
          const ampm = timeParts[4] ? timeParts[4].toUpperCase() : null;
          
          // Xử lý AM/PM nếu có
          if (ampm === 'PM' && hours < 12) {
            hours += 12;
          } else if (ampm === 'AM' && hours === 12) {
            hours = 0;
          }
          
          now.setHours(hours, minutes, seconds, 0);
          return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric', 
            hour: '2-digit', minute: '2-digit'
          }).format(now);
        }
      }
      
      // Thử chuyển đổi timestamp thành đối tượng Date
      const date = new Date(timestamp);
      
      // Kiểm tra xem date có hợp lệ không
      if (isNaN(date.getTime())) {
        console.warn('Invalid timestamp:', timestamp);
        return 'Thời gian không hợp lệ';
      }
      
      // Nếu hợp lệ, định dạng và trả về
      return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric', 
        hour: '2-digit', minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.error('Error formatting timestamp:', error, timestamp);
      return 'Lỗi định dạng thời gian';
    }
  };

  const handleSelectDrug = () => {
    setOpenDrugSearchDialog(true);
  };

  const handleCloseDrugSearchDialog = () => {
    setOpenDrugSearchDialog(false);
  };

  const handleDrugSelected = (selectedDrug) => {
    console.log('Thuốc đã chọn:', selectedDrug);
    
    // Thiết lập thông tin thuốc đã chọn
    setDrugInfo(selectedDrug);
    
    // Tạo ID cho cuộc trò chuyện mới dựa trên tên thuốc
    const chatId = selectedDrug.brand_name || selectedDrug.generic_name;
    
    // Thêm thông báo chào mừng
    const welcomeMessage = {
      text: `Tôi sẽ giúp bạn trả lời các câu hỏi về thuốc ${selectedDrug.brand_name || selectedDrug.generic_name}. Bạn có thể hỏi về tác dụng, liều dùng, tác dụng phụ hoặc bất kỳ thông tin nào khác về thuốc này.`,
      isUser: false,
      timestamp: new Date().toLocaleTimeString(),
    };
    
    // Thiết lập lịch sử chat với thông báo chào mừng
    setMessages((prev) => [...prev, welcomeMessage]);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  // Thêm hàm fetchAllChats để lấy lịch sử chat
  const fetchAllChats = async () => {
    try {
      setLoading(true);
      const response = await getChatHistory();
      if (response.data && response.data.success) {
        setChatHistory(response.data.chatHistory);
      }
    } catch (err) {
      console.error('Lỗi khi lấy lịch sử chat:', err);
      setError('Không thể lấy lịch sử chat. Vui lòng thử lại sau.');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  // Gọi fetchAllChats khi component mount và khi mở dialog lịch sử
  useEffect(() => {
    if (openChatDialog) {
      fetchAllChats();
    }
  }, [openChatDialog]);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          borderRadius: 2, 
          overflow: 'hidden',
          height: 'calc(100vh - 120px)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <Box 
          sx={{ 
            p: 2, 
            bgcolor: 'primary.main', 
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: 1
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton 
              color="inherit" 
              onClick={() => navigate(-1)} 
              sx={{ mr: 1 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                <SmartToyIcon sx={{ mr: 1 }} />
                Chat với AI
              </Typography>
              {drugInfo && (
                <Typography variant="body2" sx={{ mt: -0.5, opacity: 0.85 }}>
                  Thông tin về: {drugInfo.name || drugInfo.brand_name || drugInfo.generic_name}
                </Typography>
              )}
            </Box>
          </Box>
          <Box>
            <IconButton color="inherit" onClick={() => setAnchorEl(true)}>
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={() => setOpenChatDialog(true)}>
                <ListItemIcon>
                  <HistoryIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Lịch sử chat</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleSelectDrug()}>
                <ListItemIcon>
                  <SearchIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Tìm thuốc khác</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* Khu vực hiển thị thông tin thuốc */}
        {drugInfo && (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              mx: 2, 
              mt: 2, 
              borderRadius: 2, 
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.default',
              display: 'flex', 
              alignItems: 'center'
            }}
          >
            <MedicalServicesIcon color="primary" sx={{ fontSize: 28, mr: 2 }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                {drugInfo.name || drugInfo.brand_name || drugInfo.generic_name}
              </Typography>
              {drugInfo.active_ingredient && (
                <Typography variant="body2" color="text.secondary">
                  Thành phần: {drugInfo.active_ingredient}
                </Typography>
              )}
              {drugInfo.ingredients && drugInfo.ingredients.length > 0 && (
                <Typography variant="body2" color="text.secondary">
                  Thành phần: {drugInfo.ingredients.join(', ')}
                </Typography>
              )}
            </Box>
            <Button 
              variant="outlined" 
              size="small" 
              startIcon={<SearchIcon />}
              onClick={handleSelectDrug}
            >
              Đổi thuốc
            </Button>
          </Paper>
        )}

        {/* Khu vực hiển thị chat */}
        <Box 
          sx={{ 
            flexGrow: 1, 
            overflowY: 'auto', 
            p: 3,
            bgcolor: '#f8f9fa',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: messages.length === 0 ? 'center' : 'flex-start'
          }}
        >
          {messages.length === 0 ? (
            // Hiển thị hướng dẫn khi chưa có tin nhắn
            <Box 
              sx={{ 
                textAlign: 'center', 
                p: 3, 
                borderRadius: 2, 
                mx: 'auto',
                maxWidth: 500,
                bgcolor: 'white',
                boxShadow: 1
              }}
            >
              <QuestionAnswerIcon sx={{ fontSize: 60, color: 'primary.light', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Hãy bắt đầu trò chuyện với AI
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {drugInfo 
                  ? `Đặt câu hỏi về thuốc ${drugInfo.name || drugInfo.brand_name || drugInfo.generic_name} để nhận thông tin chuyên sâu từ trợ lý AI của chúng tôi.`
                  : 'Vui lòng chọn một loại thuốc để bắt đầu trò chuyện.'}
              </Typography>

              {!drugInfo && (
                <Button
                  variant="contained"
                  onClick={handleSelectDrug}
                  startIcon={<SearchIcon />}
                  sx={{ mt: 2 }}
                >
                  Chọn thuốc để tiếp tục
                </Button>
              )}

              {drugInfo && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Gợi ý câu hỏi:
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
                    {suggestedQuestions.map((question, index) => (
                      <Chip
                        key={index}
                        label={question}
                        onClick={() => handleSuggestedQuestionClick(question)}
                        color="primary"
                        variant="outlined"
                        sx={{ 
                          cursor: 'pointer',
                          width: '100%',
                          justifyContent: 'flex-start',
                          py: 0.5
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          ) : (
            // Hiển thị các tin nhắn
            <>
              {messages.map((msg, index) => (
                <MessageBubble 
                  key={index} 
                  isUser={msg.isUser || msg.sender === 'user'}
                  message={msg.text || msg.content}
                  timestamp={msg.timestamp ? formatTimestamp(msg.timestamp) : ''}
                />
              ))}
              <div ref={messagesEndRef} />
              
              {/* Hiển thị gợi ý câu hỏi sau khi có phản hồi */}
              {messages.length > 0 && (messages[messages.length - 1].isUser === false || messages[messages.length - 1].sender === 'ai') && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1, justifyContent: 'center' }}>
                  {suggestedQuestions.slice(0, 3).map((question, index) => (
                    <Chip
                      key={index}
                      label={question}
                      onClick={() => handleSuggestedQuestionClick(question)}
                      color="primary"
                      variant="outlined"
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Box>
              )}
            </>
          )}
          
          {error && (
            <Box sx={{ 
              p: 2, 
              mt: 2, 
              bgcolor: 'error.50', 
              color: 'error.main',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'error.light'
            }}>
              <Typography variant="body2">{error}</Typography>
            </Box>
          )}
          
          {loading && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              <CircularProgress size={20} sx={{ mr: 2 }} />
              <Typography variant="body2" color="text.secondary">
                AI đang soạn tin nhắn...
              </Typography>
            </Box>
          )}
        </Box>

        {/* Khu vực nhập liệu */}
        <Box 
          sx={{ 
            p: 2,
            bgcolor: 'background.paper',
            borderTop: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Box 
            component="form" 
            onSubmit={handleSendMessage}
            sx={{ 
              display: 'flex',
              alignItems: 'flex-end',
              gap: 1
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder={drugInfo 
                ? `Hỏi về thuốc ${drugInfo.name || drugInfo.brand_name || drugInfo.generic_name}...` 
                : "Chọn thuốc để bắt đầu..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading || !drugInfo}
              multiline
              maxRows={4}
              InputProps={{
                sx: {
                  borderRadius: 10,
                }
              }}
            />
            <Tooltip title="Gửi câu hỏi">
              <span>
                <IconButton
                  color="primary"
                  disabled={loading || !input.trim() || !drugInfo}
                  type="submit"
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    '&.Mui-disabled': {
                      bgcolor: 'action.disabledBackground',
                      color: 'action.disabled',
                    },
                    width: 48,
                    height: 48,
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {/* Dialog cho lịch sử chat */}
      <Dialog
        open={openChatDialog}
        onClose={() => setOpenChatDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <HistoryIcon sx={{ mr: 1.5 }} />
            <Typography variant="h6">Lịch sử chat</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={40} />
            </Box>
          ) : chatHistory.length === 0 ? (
            <Box sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>
              <Typography>Chưa có lịch sử chat nào</Typography>
            </Box>
          ) : (
            <List sx={{ pt: 0 }}>
              {chatHistory.map((item, index) => (
                <ListItem
                  key={item._id || index}
                  button
                  onClick={() => {
                    // Xử lý khi click vào một mục lịch sử
                    if (item.drugInfo) {
                      setDrugInfo(item.drugInfo);
                    }
                    if (item.messages && item.messages.length > 0) {
                      setMessages(item.messages);
                    }
                    setOpenChatDialog(false);
                  }}
                  sx={{
                    py: 1.5,
                    px: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  <ListItemIcon>
                    <MedicalServicesIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.drugQuery || "Chat chưa có tên"}
                    secondary={item.timestamp ? formatTimestamp(item.timestamp) : ''}
                  />
                  <IconButton 
                    edge="end" 
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteChatItem(item._id);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setOpenChatDialog(false)}
          >
            Đóng
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => {
              setInput('');
              setOpenChatDialog(false);
            }}
          >
            Tạo chat mới
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog tìm kiếm thuốc */}
      <DrugSearchDialog
        open={openDrugSearchDialog}
        onClose={handleCloseDrugSearchDialog}
        onSelectDrug={handleDrugSelected}
      />

      {/* Snackbar thông báo */}
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
};

export default ChatWithAI;