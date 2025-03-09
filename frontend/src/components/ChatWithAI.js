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
  Badge
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

const ChatWithAI = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [allChats, setAllChats] = useState([]);  // Danh sách tất cả các cuộc trò chuyện
  const [currentChatId, setCurrentChatId] = useState(null);  // ID của cuộc trò chuyện hiện tại
  const [drugInfo, setDrugInfo] = useState(null);
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openChatDialog, setOpenChatDialog] = useState(false);  // Điều khiển dialog lịch sử chat
  const [openDrugSearchDialog, setOpenDrugSearchDialog] = useState(false); // Điều khiển dialog tìm kiếm thuốc
  const chatEndRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);  // Cho dropdown menu
  
  const suggestedQuestions = [
    "Thuốc này có tác dụng phụ gì không?",
    "Liều dùng khuyến cáo là bao nhiêu?",
    "Có thể dùng cho phụ nữ mang thai không?",
    "Có tương tác với thuốc nào không?",
    "Cơ chế hoạt động của thuốc này là gì?"
  ];

  // Lấy thông tin thuốc từ location state
  useEffect(() => {
    if (location.state?.drugInfo) {
      console.log('Drug info from location:', location.state.drugInfo);
      setDrugInfo(location.state.drugInfo);
    }
  }, [location.state]);

  // Lấy danh sách tất cả các cuộc trò chuyện khi component mount
  useEffect(() => {
    fetchAllChats();
  }, []);

  // Cuộn xuống cuối cùng khi có tin nhắn mới
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Lấy danh sách tất cả các cuộc trò chuyện từ server
  const fetchAllChats = async () => {
    try {
      const response = await getChatHistory();
      console.log('All chat history response:', response.data);
      
      let chatData = [];
      
      if (response.data && response.data.success === true && Array.isArray(response.data.chatHistory)) {
        chatData = response.data.chatHistory;
      } else if (Array.isArray(response.data)) {
        chatData = response.data;
      } else {
        console.error('Dữ liệu lịch sử chat không phải là mảng:', response.data);
        return;
      }

      // Nhóm chat theo drugQuery
      const groupedChats = {};
      chatData.forEach(chat => {
        if (!groupedChats[chat.drugQuery]) {
          groupedChats[chat.drugQuery] = {
            drugName: chat.drugQuery,
            messages: [],
            lastTimestamp: chat.timestamp
          };
        }
        
        groupedChats[chat.drugQuery].messages.push(chat);
        
        // Cập nhật timestamp gần nhất
        if (new Date(chat.timestamp) > new Date(groupedChats[chat.drugQuery].lastTimestamp)) {
          groupedChats[chat.drugQuery].lastTimestamp = chat.timestamp;
        }
      });
      
      // Chuyển đổi thành mảng và sắp xếp theo timestamp gần đây nhất
      const chatSessions = Object.values(groupedChats).sort((a, b) => 
        new Date(b.lastTimestamp) - new Date(a.lastTimestamp)
      );
      
      setAllChats(chatSessions);
      
      // Nếu có chat, hiển thị chat gần nhất
      if (chatSessions.length > 0 && !currentChatId) {
        loadChatByDrugName(chatSessions[0].drugName);
      }
    } catch (err) {
      console.error('Lỗi khi lấy danh sách chat:', err);
      setError('Không thể tải lịch sử chat. Vui lòng thử lại sau.');
      setOpenSnackbar(true);
    }
  };

  // Lấy lịch sử chat theo drugQuery
  const fetchChatHistory = async (drugQuery = null) => {
    try {
      const response = await getChatHistory();
      console.log('Chat history response:', response.data);
      
      // Xử lý cấu trúc response {success: true, chatHistory: Array(20)}
      let chatHistoryData;
      
      if (response.data && response.data.success === true && Array.isArray(response.data.chatHistory)) {
        // Cấu trúc {success: true, chatHistory: Array(20)}
        chatHistoryData = response.data.chatHistory;
        console.log('Đã nhận dữ liệu lịch sử chat từ response.data.chatHistory', chatHistoryData.length);
      } else if (Array.isArray(response.data)) {
        // Trường hợp response.data trực tiếp là mảng
        chatHistoryData = response.data;
        console.log('Đã nhận dữ liệu lịch sử chat trực tiếp từ response.data', chatHistoryData.length);
      } else {
        console.error('Dữ liệu lịch sử chat không phải là mảng:', response.data);
        setChatHistory([]);
        return;
      }
      
      // Lọc theo drugQuery nếu được cung cấp
      if (drugQuery) {
        chatHistoryData = chatHistoryData.filter(chat => chat.drugQuery === drugQuery);
      }
      
      // Đảm bảo mỗi mục trong lịch sử chat đều có timestamp hợp lệ
      const validatedChatHistory = chatHistoryData.map(chat => {
        if (!chat.timestamp) {
          return {
            ...chat,
            timestamp: new Date().toISOString()
          };
        }
        
        // Kiểm tra timestamp có hợp lệ không
        try {
          const date = new Date(chat.timestamp);
          if (isNaN(date.getTime())) {
            return {
              ...chat,
              timestamp: new Date().toISOString()
            };
          }
        } catch (e) {
          console.warn('Invalid timestamp in chat history item:', chat);
          return {
            ...chat,
            timestamp: new Date().toISOString()
          };
        }
        
        return chat;
      });
      
      // Sắp xếp theo thứ tự thời gian
      validatedChatHistory.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      
      setChatHistory(validatedChatHistory);
    } catch (err) {
      console.error('Lỗi khi lấy lịch sử chat:', err);
      setError('Không thể tải lịch sử chat. Vui lòng thử lại sau.');
      setOpenSnackbar(true);
      setChatHistory([]);
    }
  };

  // Xử lý khi chọn một cuộc trò chuyện
  const loadChatByDrugName = (drugName) => {
    // Tìm thông tin về thuốc từ lịch sử chat
    const chatSession = allChats.find(chat => chat.drugName === drugName);
    if (chatSession && chatSession.messages.length > 0) {
      const firstMessage = chatSession.messages[0];
      
      // Cập nhật thông tin thuốc
      setDrugInfo({
        brand_name: firstMessage.drugQuery,
        generic_name: firstMessage.drugQuery,
        // Các thông tin khác có thể lấy từ message nếu có
      });
      
      setCurrentChatId(drugName);
      fetchChatHistory(drugName);
    }
    
    setOpenChatDialog(false);
  };

  // Xử lý khi người dùng muốn tạo cuộc trò chuyện mới
  const handleNewChat = (skipDrugSelection = false) => {
    // Xóa thông tin thuốc hiện tại và lịch sử chat
    setChatHistory([]);
    setCurrentChatId(null);
    
    // Nếu không bỏ qua việc chọn thuốc, mở dialog chọn thuốc
    if (!skipDrugSelection) {
      setDrugInfo(null);
      setOpenDrugSearchDialog(true);
    }
    
    setOpenChatDialog(false);
  };

  // Hiển thị menu lịch sử chat
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Đóng menu
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  // Mở dialog lịch sử chat
  const handleOpenChatHistory = () => {
    setOpenChatDialog(true);
    handleCloseMenu();
  };

  // Xử lý khi người dùng gửi câu hỏi
  const handleSendQuestion = async () => {
    if (!userInput.trim()) return;
    
    if (!drugInfo) {
      setError('Vui lòng chọn thuốc trước khi gửi câu hỏi');
      setOpenSnackbar(true);
      return;
    }
    
    // Thêm câu hỏi của người dùng vào lịch sử chat
    const userMessage = { role: 'user', content: userInput };
    const updatedChatHistory = [...chatHistory, userMessage];
    setChatHistory(updatedChatHistory);
    setUserInput('');
    
    // Hiển thị trạng thái đang tải
    setLoading(true);
    
    try {
      // Chuẩn bị dữ liệu để gửi đến API
      const requestData = {
        messages: updatedChatHistory,
        drugInfo: {
          brand_name: drugInfo.brand_name || '',
          generic_name: drugInfo.generic_name || '',
          active_ingredient: drugInfo.active_ingredient || '',
          indications_and_usage: drugInfo.indications_and_usage || '',
          warnings: drugInfo.warnings || '',
          dosage_and_administration: drugInfo.dosage_and_administration || '',
          adverse_reactions: drugInfo.adverse_reactions || ''
        },
        drugQuery: drugInfo.brand_name || drugInfo.generic_name || 'unknown_drug'
      };
      
      // Gọi API để lấy câu trả lời
      const response = await askGeminiAboutDrug(requestData);
      
      // Xử lý kết quả trả về
      if (response.data && response.data.answer) {
        const aiMessage = { role: 'assistant', content: response.data.answer };
        setChatHistory([...updatedChatHistory, aiMessage]);
      } else {
        throw new Error('Không nhận được câu trả lời hợp lệ từ API');
      }
    } catch (err) {
      console.error('Lỗi khi gửi câu hỏi:', err);
      setError('Đã xảy ra lỗi khi gửi câu hỏi. Vui lòng thử lại sau.');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendQuestion();
    }
  };

  const handleSuggestedQuestionClick = (suggestedQuestion) => {
    setUserInput(suggestedQuestion);
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
    setCurrentChatId(chatId);
    
    // Thêm thông báo chào mừng
    const welcomeMessage = {
      role: 'assistant',
      content: `Tôi sẽ giúp bạn trả lời các câu hỏi về thuốc ${selectedDrug.brand_name || selectedDrug.generic_name}. Bạn có thể hỏi về tác dụng, liều dùng, tác dụng phụ hoặc bất kỳ thông tin nào khác về thuốc này.`
    };
    
    // Thiết lập lịch sử chat với thông báo chào mừng
    setChatHistory([welcomeMessage]);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 140px)',
          borderRadius: 3,
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <Box 
          sx={{ 
            p: 2, 
            bgcolor: 'primary.main', 
            color: 'white',
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SmartToyIcon sx={{ mr: 1.5, fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Chat với AI về Thuốc
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {drugInfo && (
              <Chip
                icon={<MedicalServicesIcon />}
                label={drugInfo.brand_name || drugInfo.generic_name}
                color="secondary"
                variant="filled"
                sx={{ 
                  color: 'white', 
                  bgcolor: 'rgba(255,255,255,0.2)',
                  '& .MuiChip-icon': { color: 'white' }
                }}
              />
            )}
            
            <IconButton 
              color="inherit" 
              onClick={handleMenuClick}
              sx={{ ml: 1 }}
            >
              <MenuIcon />
            </IconButton>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseMenu}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={() => handleNewChat(false)}>
                <ListItemIcon>
                  <AddIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Tạo cuộc trò chuyện mới</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleOpenChatHistory}>
                <ListItemIcon>
                  <HistoryIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Lịch sử trò chuyện</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Box>
        
        {/* Dialog Lịch sử trò chuyện */}
        <Dialog
          open={openChatDialog}
          onClose={() => setOpenChatDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <HistoryIcon sx={{ mr: 1.5, color: 'primary.main' }} />
              <Typography variant="h6">Lịch sử trò chuyện</Typography>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            {allChats.length === 0 ? (
              <Box sx={{ py: 2, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  Không có lịch sử trò chuyện nào
                </Typography>
              </Box>
            ) : (
              <List>
                {allChats.map((chat, index) => (
                  <ListItem
                    key={index}
                    button
                    onClick={() => loadChatByDrugName(chat.drugName)}
                    sx={{
                      mb: 1,
                      borderRadius: 1,
                      bgcolor: currentChatId === chat.drugName ? 'action.selected' : 'background.paper',
                      '&:hover': {
                        bgcolor: 'action.hover'
                      }
                    }}
                  >
                    <ListItemIcon>
                      <Badge badgeContent={chat.messages.length} color="primary">
                        <MedicalServicesIcon color="primary" />
                      </Badge>
                    </ListItemIcon>
                    <ListItemText 
                      primary={chat.drugName}
                      secondary={`${chat.messages.length} tin nhắn - Cập nhật: ${formatTimestamp(chat.lastTimestamp)}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </DialogContent>
          <DialogActions>
            <Button 
              startIcon={<AddIcon />}
              color="primary"
              onClick={() => handleNewChat(true)}
            >
              Tạo cuộc trò chuyện mới
            </Button>
            <Button onClick={() => setOpenChatDialog(false)}>
              Đóng
            </Button>
          </DialogActions>
        </Dialog>

        {/* Drug Info Panel */}
        {drugInfo ? (
          <Box sx={{ p: 2, bgcolor: 'background.paper', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <MedicalServicesIcon color="primary" sx={{ mr: 1.5 }} />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {drugInfo.brand_name || drugInfo.generic_name || 'Không có tên thuốc'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {drugInfo.active_ingredient || 'Không có thông tin thành phần'}
                  </Typography>
                </Box>
              </Box>
              <Button 
                variant="outlined" 
                size="small" 
                startIcon={<SearchIcon />}
                onClick={handleSelectDrug}
              >
                Chọn thuốc khác
              </Button>
            </Box>
          </Box>
        ) : (
          <Box 
            sx={{ 
              p: 3, 
              bgcolor: 'background.paper', 
              borderBottom: '1px solid rgba(0,0,0,0.08)',
              textAlign: 'center'
            }}
          >
            <Alert 
              severity="info" 
              sx={{ mb: 2, borderRadius: 2 }}
              icon={<MedicalServicesIcon />}
            >
              Bạn chưa chọn thuốc để hỏi
            </Alert>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleSelectDrug}
              startIcon={<SearchIcon />}
            >
              Tìm kiếm thuốc
            </Button>
          </Box>
        )}

        {/* Chat History */}
        <Box 
          sx={{ 
            flexGrow: 1, 
            overflowY: 'auto', 
            p: 3,
            bgcolor: '#f5f7f9',
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          {!Array.isArray(chatHistory) || chatHistory.length === 0 ? (
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                height: '100%',
                opacity: 0.7
              }}
            >
              <QuestionAnswerIcon sx={{ fontSize: 60, color: 'primary.main', opacity: 0.5, mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Chưa có cuộc trò chuyện nào
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Hãy chọn một loại thuốc và đặt câu hỏi để bắt đầu trò chuyện với AI
              </Typography>
            </Box>
          ) : (
            chatHistory.map((message, index) => (
              <Fade in={true} key={index} timeout={300} style={{ transitionDelay: `${index * 50}ms` }}>
                <Box>
                  {message.role === 'user' ? (
                    // User Message
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'flex-end', 
                        mb: 1.5,
                        alignItems: 'flex-start'
                      }}
                    >
                      <Box 
                        sx={{ 
                          maxWidth: '80%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-end'
                        }}
                      >
                        <Paper 
                          sx={{ 
                            p: 2, 
                            bgcolor: 'primary.main',
                            color: 'white',
                            borderRadius: '16px 16px 0 16px'
                          }}
                        >
                          <Typography variant="body1">
                            {message.content}
                          </Typography>
                        </Paper>
                      </Box>
                      <Avatar 
                        sx={{ 
                          ml: 1.5, 
                          bgcolor: 'primary.dark',
                          width: 36,
                          height: 36
                        }}
                      >
                        <PersonIcon />
                      </Avatar>
                    </Box>
                  ) : (
                    // AI Message
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'flex-start',
                        alignItems: 'flex-start',
                        mb: 1.5
                      }}
                    >
                      <Avatar 
                        sx={{ 
                          mr: 1.5, 
                          bgcolor: 'secondary.main',
                          width: 36,
                          height: 36
                        }}
                      >
                        <SmartToyIcon />
                      </Avatar>
                      <Paper 
                        sx={{ 
                          maxWidth: '80%',
                          p: 2, 
                          bgcolor: 'white',
                          borderRadius: '16px 16px 16px 0',
                          ...markdownStyles
                        }}
                      >
                        <Box className="markdown-content">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({node, ...props}) => (
                                <Typography 
                                  variant="body1" 
                                  component="p"
                                  sx={{ mb: 1.5, lineHeight: 1.6 }} 
                                  {...props} 
                                />
                              ),
                              a: ({node, ...props}) => (
                                <MuiLink 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  color="primary"
                                  sx={{
                                    fontWeight: 500,
                                    '&:hover': {
                                      textDecoration: 'underline'
                                    }
                                  }}
                                  {...props} 
                                />
                              ),
                              img: ({node, ...props}) => (
                                <img 
                                  style={{
                                    maxWidth: '100%',
                                    height: 'auto',
                                    display: 'block',
                                    margin: '16px 0',
                                    borderRadius: '4px'
                                  }} 
                                  {...props} 
                                />
                              ),
                              pre: ({node, ...props}) => (
                                <Paper 
                                  elevation={0}
                                  sx={{ 
                                    bgcolor: 'rgba(0,0,0,0.04)', 
                                    p: 1.5, 
                                    borderRadius: 1,
                                    mb: 2,
                                    overflow: 'auto'
                                  }}
                                  {...props}
                                />
                              ),
                              code: ({node, inline, ...props}) => (
                                inline ? 
                                <Typography 
                                  component="code"
                                  sx={{ 
                                    bgcolor: 'rgba(0,0,0,0.04)', 
                                    p: 0.3, 
                                    borderRadius: 0.5,
                                    fontFamily: 'monospace'
                                  }}
                                  {...props}
                                /> :
                                <Typography 
                                  component="code"
                                  sx={{ 
                                    display: 'block',
                                    fontFamily: 'monospace',
                                    fontSize: '0.875rem'
                                  }}
                                  {...props}
                                />
                              ),
                              ul: ({node, ...props}) => (
                                <Box
                                  component="ul"
                                  sx={{
                                    pl: 3,
                                    mb: 2,
                                    '& li': {
                                      mb: 0.8,
                                      pl: 0.5,
                                      '&::marker': {
                                        color: 'primary.main'
                                      }
                                    }
                                  }}
                                  {...props}
                                />
                              ),
                              ol: ({node, ...props}) => (
                                <Box
                                  component="ol"
                                  sx={{
                                    pl: 3,
                                    mb: 2,
                                    '& li': {
                                      mb: 0.8,
                                      pl: 0.5
                                    }
                                  }}
                                  {...props}
                                />
                              ),
                              h3: ({node, ...props}) => (
                                <Typography 
                                  variant="h6"
                                  component="h3"
                                  sx={{ 
                                    color: 'primary.dark',
                                    fontWeight: 600,
                                    mt: 3,
                                    mb: 1.5
                                  }}
                                  {...props}
                                />
                              ),
                              h4: ({node, ...props}) => (
                                <Typography 
                                  variant="subtitle1"
                                  component="h4"
                                  sx={{ 
                                    color: 'primary.dark',
                                    fontWeight: 600,
                                    mt: 2,
                                    mb: 1
                                  }}
                                  {...props}
                                />
                              ),
                              table: ({node, ...props}) => (
                                <Box
                                  sx={{
                                    overflowX: 'auto',
                                    mb: 2
                                  }}
                                >
                                  <Box
                                    component="table"
                                    sx={{
                                      width: '100%',
                                      borderCollapse: 'collapse',
                                      border: '1px solid',
                                      borderColor: 'grey.300',
                                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                    }}
                                    {...props}
                                  />
                                </Box>
                              ),
                              th: ({node, ...props}) => (
                                <Box
                                  component="th"
                                  sx={{
                                    border: '1px solid',
                                    borderColor: 'grey.300',
                                    p: 1.5,
                                    bgcolor: 'grey.50',
                                    fontWeight: 'bold',
                                    textAlign: 'left'
                                  }}
                                  {...props}
                                />
                              ),
                              td: ({node, ...props}) => (
                                <Box
                                  component="td"
                                  sx={{
                                    border: '1px solid',
                                    borderColor: 'grey.300',
                                    p: 1.5
                                  }}
                                  {...props}
                                />
                              )
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </Box>
                      </Paper>
                    </Box>
                  )}
                </Box>
              </Fade>
            ))
          )}
          <div ref={chatEndRef} />
        </Box>

        {/* Input Area */}
        <Box 
          sx={{ 
            p: 2, 
            bgcolor: 'background.paper',
            borderTop: '1px solid rgba(0,0,0,0.08)'
          }}
        >
          {drugInfo && (
            <>
              {/* Suggested Questions */}
              <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {suggestedQuestions.map((question, index) => (
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
              
              {/* Input Field */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Nhập câu hỏi của bạn..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                    }
                  }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSendQuestion}
                  disabled={loading || !userInput.trim()}
                  sx={{ borderRadius: 3, px: 3 }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    <SendIcon />
                  )}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Paper>

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
        message={error}
      />
    </Container>
  );
};

export default ChatWithAI;