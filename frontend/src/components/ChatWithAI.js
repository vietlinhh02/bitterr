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
  ArrowBack as ArrowBackIcon, QuestionAnswer as QuestionAnswerIcon,
  History as HistoryIcon, Add as AddIcon, Menu as MenuIcon, Search as SearchIcon,
  Error as ErrorIcon, Close as CloseIcon, Lightbulb as LightbulbIcon,
  Settings as SettingsIcon, 
  HelpOutline as HelpOutlineIcon, 
  Chat as ChatIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Warning as WarningIcon,
  MoreVert as MoreVertIcon,
  ContentCopy as ContentCopyIcon,
  PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';
import { askGeminiAboutDrug, getChatHistory, deleteChatHistoryItem, getStaticQuestionSuggestions, getDynamicQuestionSuggestions } from '../services/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DrugSearchDialog from './DrugSearchDialog';
import { useUser } from '../contexts/UserContext';

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
  const { user, hasGeminiApiKey } = useUser(); // Lấy thông tin từ context
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
  const [usingCustomApiKey, setUsingCustomApiKey] = useState(false);
  
  // Kiểm tra kích thước màn hình
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  // Trạng thái drawer khi ở mobile
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Câu hỏi gợi ý từ backend
  const [suggestedQuestions, setSuggestedQuestions] = useState([
    "Tác dụng phụ thường gặp là gì?",
    "Liều dùng cho người lớn?",
    "Thuốc này tương tác với thức ăn nào?"
  ]);

  // Kiểm tra xem người dùng có sử dụng API key của riêng họ không
  useEffect(() => {
    // Sử dụng hasGeminiApiKey từ UserContext
    setUsingCustomApiKey(hasGeminiApiKey);
  }, [hasGeminiApiKey]);

  // Ẩn lịch sử chat khi chuyển sang mobile
  useEffect(() => {
    if (isMobile) {
      setShowChatHistory(false);
    } else {
      setShowChatHistory(true);
    }
  }, [isMobile]);

  // Tải gợi ý câu hỏi từ backend khi có thông tin thuốc
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (drugInfo) {
        console.log("Fetching suggestions for drug:", drugInfo.name || drugInfo.generic_name || drugInfo.brand_name);
        try {
          // Thử lấy gợi ý động từ backend dựa trên thông tin thuốc
          const response = await getDynamicQuestionSuggestions(drugInfo);
          console.log("Dynamic suggestions response:", response.data);
          
          if (response.data?.success && response.data?.suggestions?.length > 0) {
            console.log("Setting dynamic suggestions:", response.data.suggestions);
            setSuggestedQuestions(response.data.suggestions);
          } else {
            // Nếu không có gợi ý động, dùng gợi ý tĩnh (chung)
            try {
              const staticResponse = await getStaticQuestionSuggestions({
                isGeneral: true
              });
              console.log("Static suggestions response:", staticResponse.data);
              
              if (staticResponse.data?.success && staticResponse.data?.suggestions?.length > 0) {
                const questions = staticResponse.data.suggestions.map(item => item.question);
                console.log("Setting static suggestions:", questions);
                setSuggestedQuestions(questions);
              }
            } catch (staticError) {
              console.error('Lỗi khi tải gợi ý câu hỏi tĩnh:', staticError);
              // Giữ nguyên các câu hỏi mặc định hiện tại
            }
          }
        } catch (error) {
          console.error('Lỗi khi tải gợi ý câu hỏi:', error);
          
          // Nếu có lỗi với API động, thử dùng API tĩnh
          try {
            const staticResponse = await getStaticQuestionSuggestions({
              isGeneral: true
            });
            console.log("Fallback static suggestions:", staticResponse.data);
            
            if (staticResponse.data?.success && staticResponse.data?.suggestions?.length > 0) {
              const questions = staticResponse.data.suggestions.map(item => item.question);
              console.log("Setting fallback suggestions:", questions);
              setSuggestedQuestions(questions);
            }
          } catch (staticError) {
            console.error('Lỗi khi tải gợi ý câu hỏi tĩnh:', staticError);
            // Giữ nguyên các câu hỏi mặc định hiện tại
          }
        }
      }
    };
    
    fetchSuggestions();
  }, [drugInfo]);
  
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
        // Sử dụng gợi ý mới từ AI nếu có
        setSuggestedQuestions(response.data.suggestedQuestions);
      } else {
        // Nếu AI không gợi ý, cố gắng tải lại gợi ý từ backend
        try {
          const suggestResponse = await getDynamicQuestionSuggestions(drugInfo);
          if (suggestResponse.data?.success && suggestResponse.data?.suggestions?.length > 0) {
            setSuggestedQuestions(suggestResponse.data.suggestions);
          }
        } catch (error) {
          console.error('Lỗi khi lấy gợi ý câu hỏi mới:', error);
        }
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
      
      // Lưu ý: Có thể thêm API để tăng độ phổ biến của câu hỏi này trong database
      // nhưng không ưu tiên trong lần cập nhật này
    }, 0);
  };

    const handleSelectDrug = () => setOpenDrugSearchDialog(true);
  
    const handleCloseDrugSearchDialog = () => setOpenDrugSearchDialog(false);
  
  const handleDrugSelected = async (selectedDrug) => {
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
    
    // Tải gợi ý câu hỏi cụ thể cho thuốc vừa chọn
    try {
      // Ưu tiên dùng gợi ý động thông minh
      const dynamicResponse = await getDynamicQuestionSuggestions(selectedDrug);
      
      if (dynamicResponse.data?.success && dynamicResponse.data?.suggestions?.length > 0) {
        setSuggestedQuestions(dynamicResponse.data.suggestions);
      } else {
        // Nếu không có gợi ý động, thử tìm gợi ý tĩnh từ database
        try {
          let query = {};
          
          if (selectedDrug.generic_name) {
            query.genericName = selectedDrug.generic_name;
          } else if (selectedDrug.brand_name) {
            query.brandName = selectedDrug.brand_name;
          }
          
          const staticResponse = await getStaticQuestionSuggestions(query);
          
          if (staticResponse.data?.success && staticResponse.data?.suggestions?.length > 0) {
            setSuggestedQuestions(staticResponse.data.suggestions.map(item => item.question));
          } else {
            // Nếu vẫn không có, dùng các câu hỏi chung
            try {
              const generalResponse = await getStaticQuestionSuggestions({ isGeneral: true });
              
              if (generalResponse.data?.success && generalResponse.data?.suggestions?.length > 0) {
                setSuggestedQuestions(generalResponse.data.suggestions.map(item => item.question));
              }
            } catch (generalError) {
              console.error('Lỗi khi tải gợi ý câu hỏi chung:', generalError);
              // Giữ nguyên gợi ý mặc định nếu tất cả đều không có
            }
          }
        } catch (staticError) {
          console.error('Lỗi khi tải gợi ý câu hỏi tĩnh:', staticError);
          // Nếu không lấy được gợi ý tĩnh, thử lấy gợi ý chung
          try {
            const generalResponse = await getStaticQuestionSuggestions({ isGeneral: true });
            
            if (generalResponse.data?.success && generalResponse.data?.suggestions?.length > 0) {
              setSuggestedQuestions(generalResponse.data.suggestions.map(item => item.question));
            }
          } catch (generalError) {
            console.error('Lỗi khi tải gợi ý câu hỏi chung:', generalError);
            // Giữ nguyên gợi ý mặc định nếu tất cả đều không có
          }
        }
      }
    } catch (error) {
      console.error('Lỗi khi tải gợi ý câu hỏi cho thuốc mới:', error);
      // Nếu không lấy được gợi ý động, thử lấy gợi ý tĩnh chung
      try {
        const generalResponse = await getStaticQuestionSuggestions({ isGeneral: true });
        
        if (generalResponse.data?.success && generalResponse.data?.suggestions?.length > 0) {
          setSuggestedQuestions(generalResponse.data.suggestions.map(item => item.question));
        }
      } catch (generalError) {
        console.error('Lỗi khi tải gợi ý câu hỏi chung:', generalError);
        // Giữ nguyên gợi ý mặc định nếu tất cả đều không có
      }
    }
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
              usingCustomApiKey={usingCustomApiKey}
            />
            
            {/* Thông tin API key */}
            {usingCustomApiKey && (
              <Box sx={{ 
                bgcolor: 'success.light', 
                color: 'success.contrastText', 
                px: 2, 
                py: 0.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem'
              }}>
                <Typography variant="caption" sx={{ fontWeight: 'medium' }}>
                  Đang sử dụng API key của bạn
                </Typography>
              </Box>
            )}
            
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
