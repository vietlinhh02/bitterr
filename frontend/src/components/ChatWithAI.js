// --- START OF FILE ChatWithAI.js ---

import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container, Paper, Typography, TextField, Button, Box, CircularProgress, IconButton,
  Divider, Chip, Avatar, Tooltip, Fade, Alert, Snackbar, Link as MuiLink, Menu, MenuItem,
  ListItemIcon, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, List,
  ListItem, useTheme, AppBar, Toolbar, useMediaQuery, Drawer, Fab,
  Grid, 
  SwipeableDrawer,
  ListSubheader 
} from '@mui/material';
import {
  Send as SendIcon, Delete as DeleteIcon, SmartToy as SmartToyIcon, Person as PersonIcon,
  MedicalServices as MedicalServicesIcon, ArrowBack as ArrowBackIcon, QuestionAnswer as QuestionAnswerIcon,
  History as HistoryIcon, Add as AddIcon, Menu as MenuIcon, Search as SearchIcon,
  Error as ErrorIcon, Close as CloseIcon, Lightbulb as LightbulbIcon,
  Settings as SettingsIcon, 
  HelpOutline as HelpOutlineIcon, 
  Chat as ChatIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { askGeminiAboutDrug, getChatHistory, deleteChatHistoryItem } from '../services/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DrugSearchDialog from './DrugSearchDialog';

// Import các components từ chat/index.js
import {
  MessageBubble,
  ChatHeader,
  ChatContent,
  ChatInput,
  ChatHistory,
  DrugInfo,
  formatTimestamp,
  createWelcomeMessage
} from './chat';

// --- Main Chat Component (Layout Adaptation) ---
const ChatWithAI = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [drugInfo, setDrugInfo] = useState(location.state?.drugInfo);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openChatDialog, setOpenChatDialog] = useState(false);
  const [openDrugSearchDialog, setOpenDrugSearchDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [showChatHistory, setShowChatHistory] = useState(true);
  
  // Kiểm tra kích thước màn hình
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  // Trạng thái drawer khi ở mobile
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const [suggestedQuestions, setSuggestedQuestions] = useState([
    "Tác dụng phụ thường gặp là gì?",
    "Liều dùng cho người lớn?",
    "Thuốc này tương tác với thức ăn nào?",
    "Có cần lưu ý gì khi sử dụng?",
    "Khi nào nên ngưng dùng thuốc?",
  ]);

  // Ẩn lịch sử chat khi chuyển sang mobile
  useEffect(() => {
    if (isMobile) {
      setShowChatHistory(false);
    } else {
      setShowChatHistory(true);
    }
  }, [isMobile]);

  const scrollToBottom = () => { 
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); 
  };
  
  useEffect(() => { 
    scrollToBottom(); 
  }, [messages]);

  // Mở dialog chọn thuốc khi không có drugInfo
  useEffect(() => {
    // Nếu không có drugInfo và mảng tin nhắn chỉ có tin nhắn chào mừng
    if (!drugInfo && (messages.length === 0 || (messages.length === 1 && !messages[0].isUser))) {
      // Hiển thị dialog chọn thuốc sau 500ms để tránh việc mở dialog ngay lập tức khi render
      const timer = setTimeout(() => {
        // Không hiển thị dialog khi đã có các thông tin khác đang hiển thị
        if (!openDrugSearchDialog && !openChatDialog && !openSnackbar) {
          // Hiển thị tin nhắn chào mừng và nút chọn thuốc, không mở dialog tự động
          setMessages([createWelcomeMessage(null)]);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [drugInfo, messages, openDrugSearchDialog, openChatDialog, openSnackbar]);

    useEffect(() => {
        const currentDrugInfo = location.state?.drugInfo || drugInfo;
    
        if (currentDrugInfo) {
            setDrugInfo(currentDrugInfo);
      
      const welcomeMsg = createWelcomeMessage(currentDrugInfo);
      
      if (messages.length === 0 || 
          (location.state?.drugInfo && (!drugInfo || drugInfo.id !== location.state.drugInfo.id))) {
        setMessages([welcomeMsg]);
      } else if (messages.length === 0 && !location.state?.drugInfo) {
        setMessages([welcomeMsg]);
      }
        } else if (messages.length === 0) {
      const welcomeMsg = createWelcomeMessage(null);
            setMessages([welcomeMsg]);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.state?.drugInfo]);

  const handleSendMessage = async (e) => { 
    e?.preventDefault(); 
    
    if (!input.trim() || loading || !drugInfo) {
      if(!drugInfo) {
        setError('Vui lòng chọn một loại thuốc trước khi đặt câu hỏi.');
        setOpenSnackbar(true);
        // Mở dialog chọn thuốc nếu chưa có thuốc
        handleSelectDrug();
      }
      return;
    }
    
    const userMessage = { 
      text: input, 
      isUser: true, 
      role: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    
    const messageHistoryForAPI = currentMessages.map(msg => ({ 
      role: msg.isUser || msg.role === 'user' ? 'user' : 'assistant', 
      content: msg.text || msg.content 
    }));
    
    setInput('');
    setLoading(true);
    setError(null);
    
    try {
      const requestData = { 
        question: input, 
        drugInfo: drugInfo, 
        createHistory: true, 
        messages: messageHistoryForAPI 
      };
      
      const response = await askGeminiAboutDrug(requestData);
      
      if (!response?.data?.answer) {
        throw new Error('Phản hồi không hợp lệ từ AI.');
      }
      
      const aiMessage = { 
        text: response.data.answer, 
        isUser: false, 
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      if (response.data.suggestedQuestions?.length) {
        setSuggestedQuestions(response.data.suggestedQuestions);
      }
    } catch (err) {
      console.error('Lỗi khi gửi tin nhắn:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Đã xảy ra lỗi khi kết nối với AI.';
      setError(errorMsg);
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
      setTimeout(scrollToBottom, 100);
      // Đóng drawer nếu đang ở chế độ mobile khi gửi tin nhắn
      if (isMobile && drawerOpen) {
        setDrawerOpen(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestedQuestionClick = (question) => {
    setInput(question);
    setTimeout(() => {
      const e = { preventDefault: () => {} }; // Giả lập sự kiện
      handleSendMessage(e);
    }, 0);
  };

    const handleSelectDrug = () => setOpenDrugSearchDialog(true);
  
    const handleCloseDrugSearchDialog = () => setOpenDrugSearchDialog(false);
  
  const handleDrugSelected = (selectedDrug) => {
    setDrugInfo(selectedDrug);
    setOpenDrugSearchDialog(false);
    
    const drugName = selectedDrug.name || selectedDrug.brand_name || selectedDrug.generic_name || 'thuốc này';
    
    const welcomeMessage = { 
      text: `Đã chọn thuốc **${drugName}**. Bạn có câu hỏi gì về thuốc này không?`, 
      isUser: false,
      role: 'assistant', 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    
    setMessages([welcomeMessage]);
    setInput('');
    setError(null);
  };
  
    const handleCloseSnackbar = () => setOpenSnackbar(false);
  
  const handleLoadChatFromHistory = (chatItem) => {
    if (chatItem.drugInfo) {
      setDrugInfo(chatItem.drugInfo);
    } else if (chatItem.generic_name || chatItem.drugQuery) {
      // Tạo thông tin thuốc từ dữ liệu có sẵn nếu không có drugInfo
      setDrugInfo({
        generic_name: chatItem.generic_name || chatItem.drugQuery,
        name: chatItem.generic_name || chatItem.drugQuery
      });
    }
    
    const historyMessages = [];
    const drugName = chatItem.drugInfo?.name || chatItem.drugInfo?.brand_name || 
                     chatItem.drugInfo?.generic_name || chatItem.generic_name || 
                     chatItem.drugQuery || 'thuốc này';
    
    historyMessages.push({
      text: `Đang xem lại cuộc trò chuyện về **${drugName}**.`,
      isUser: false,
      role: 'assistant',
      timestamp: formatTimestamp(chatItem.timestamp || Date.now())
    });
    
    if (Array.isArray(chatItem.messages) && chatItem.messages.length > 0) {
      chatItem.messages.forEach(msg => {
        historyMessages.push({
          text: msg.content,
          isUser: msg.role === 'user',
          role: msg.role,
          timestamp: formatTimestamp(msg.timestamp || chatItem.timestamp || Date.now())
        });
      });
    } else if (chatItem.question && chatItem.answer) {
      historyMessages.push({
        text: chatItem.question,
        isUser: true,
        role: 'user',
        timestamp: formatTimestamp(chatItem.timestamp || Date.now())
      });
      
      historyMessages.push({
        text: chatItem.answer,
        isUser: false,
        role: 'assistant',
        timestamp: formatTimestamp(chatItem.timestamp || Date.now())
      });
    }
    
    setMessages(historyMessages);
    setOpenChatDialog(false);
    setInput('');
    setError(null);
    setTimeout(scrollToBottom, 100);
    
    // Đóng drawer nếu đang ở chế độ mobile sau khi chọn cuộc trò chuyện
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const handleNewChat = () => {
    setDrugInfo(null);
    setMessages([createWelcomeMessage(null)]);
    setInput('');
    setError(null);
    handleSelectDrug();
    
    // Đóng drawer nếu đang ở chế độ mobile
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  // Nội dung lịch sử chat
  const chatHistoryContent = (
    <ChatHistory 
      onSelectChat={handleLoadChatFromHistory}
      onNewChat={handleNewChat}
      formatTimestamp={formatTimestamp}
    />
  );

  return (
    <Container maxWidth="xl" sx={{ py: 1 }}>
      <Grid container spacing={2} sx={{ height: 'calc(100vh - 120px)' }}>
        {/* Lịch sử trò chuyện ở bên trái - hiển thị trên desktop */}
        {!isMobile && (
          <Grid item xs={12} sm={3} sx={{ height: '100%' }}>
            {chatHistoryContent}
          </Grid>
        )}
        
        {/* Khu vực chat ở bên phải */}
        <Grid item xs={12} sm={9} sx={{ height: '100%' }}>
      <Paper 
        elevation={3} 
        sx={{ 
          borderRadius: 2, 
          overflow: 'hidden',
              height: '100%',
          display: 'flex',
              flexDirection: 'column',
              position: 'relative'
        }}
      >
        {/* Header */}
            <ChatHeader 
              drugInfo={drugInfo}
              navigate={navigate}
              anchorEl={anchorEl}
              setAnchorEl={setAnchorEl}
              handleSelectDrug={handleSelectDrug}
              openHistoryDialog={() => isMobile ? setDrawerOpen(true) : null}
              isMobile={isMobile}
            />
            
            {/* Thông tin thuốc */}
            <DrugInfo drugInfo={drugInfo} handleSelectDrug={handleSelectDrug} />
            
            {/* Nội dung chat */}
            <ChatContent 
              messages={messages}
              messagesEndRef={messagesEndRef}
              drugInfo={drugInfo}
              loading={loading}
              error={error}
              suggestedQuestions={suggestedQuestions}
              handleSuggestedQuestionClick={handleSuggestedQuestionClick}
              handleSelectDrug={handleSelectDrug}
              formatTimestamp={formatTimestamp}
            />
            
            {/* Input chat */}
            <ChatInput 
              input={input}
              setInput={setInput}
              handleSendMessage={handleSendMessage}
              loading={loading}
              drugInfo={drugInfo}
              handleKeyPress={handleKeyPress}
            />
            
            {/* Nút hiển thị lịch sử chat trên mobile */}
            {isMobile && (
              <Fab 
                      color="primary"
                size="medium"
                onClick={() => setDrawerOpen(true)}
          sx={{ 
                  position: 'absolute', 
                  top: 70, 
                  left: 16, 
                  zIndex: 1000,
                  opacity: 0.8,
                  '&:hover': {
                    opacity: 1
                  }
                }}
              >
                <HistoryIcon />
              </Fab>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Drawer lịch sử chat cho mobile */}
      <SwipeableDrawer
        anchor="left"
        open={isMobile && drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpen={() => setDrawerOpen(true)}
            sx={{ 
          '& .MuiDrawer-paper': { 
            width: '85%', 
            maxWidth: 350,
            boxSizing: 'border-box',
            height: '100%'
          }
        }}
      >
        <Box sx={{ height: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <ChevronLeftIcon />
                </IconButton>
          </Box>
          {chatHistoryContent}
        </Box>
      </SwipeableDrawer>

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
