import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CustomContainer from './common/CustomContainer';
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
  Link as MuiLink
} from '@mui/material';
import { 
  Send as SendIcon, 
  Delete as DeleteIcon, 
  SmartToy as SmartToyIcon,
  Person as PersonIcon,
  MedicalServices as MedicalServicesIcon,
  ArrowBack as ArrowBackIcon,
  QuestionAnswer as QuestionAnswerIcon
} from '@mui/icons-material';
import { askGeminiAboutDrug, getChatHistory, deleteChatHistoryItem } from '../services/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Thêm styles cho markdown
const markdownStyles = {
  '& .markdown-content': {
    '& p': {
      m: 0,
      mb: 1,
      '&:last-child': {
        mb: 0
      }
    },
    '& a': {
      color: 'primary.main',
      textDecoration: 'underline',
      '&:hover': {
        textDecoration: 'none'
      }
    },
    '& code': {
      p: '2px 4px',
      borderRadius: 1,
      bgcolor: 'rgba(0,0,0,0.04)',
      fontFamily: 'monospace',
      fontSize: '0.875em',
      color: '#d32f2f'
    },
    '& pre': {
      p: 2,
      borderRadius: 1,
      bgcolor: 'grey.100',
      overflowX: 'auto',
      '& code': {
        p: 0,
        bgcolor: 'transparent',
        color: 'inherit',
        fontSize: '0.875em'
      }
    },
    '& ul, & ol': {
      m: 0,
      mb: 1,
      pl: 3
    },
    '& li': {
      mb: 0.5,
      '&:last-child': {
        mb: 0
      }
    },
    '& blockquote': {
      m: 0,
      mb: 2,
      pl: 2,
      py: 0.5,
      borderLeft: '4px solid',
      borderColor: 'warning.main',
      bgcolor: 'warning.light',
      color: 'warning.dark',
      fontStyle: 'italic'
    },
    '& table': {
      borderCollapse: 'collapse',
      width: '100%',
      mb: 2,
      bgcolor: 'background.paper'
    },
    '& th': {
      border: '1px solid',
      borderColor: 'grey.300',
      p: 1,
      bgcolor: 'grey.100',
      fontWeight: 'bold'
    },
    '& td': {
      border: '1px solid',
      borderColor: 'grey.300',
      p: 1
    },
    '& h3': {
      fontSize: '1.2em',
      fontWeight: 'bold',
      color: 'primary.main',
      mt: 2,
      mb: 1
    },
    '& strong': {
      color: 'error.main',
      fontWeight: 'bold'
    },
    '& em': {
      color: 'info.main',
      fontStyle: 'italic'
    }
  }
};

const ChatWithAI = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [drugInfo, setDrugInfo] = useState(null);
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const chatEndRef = useRef(null);
  
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

  // Lấy lịch sử chat khi component được mount
  useEffect(() => {
    fetchChatHistory();
  }, []);

  // Cuộn xuống cuối cùng khi có tin nhắn mới
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const fetchChatHistory = async () => {
    try {
      const response = await getChatHistory();
      console.log('Chat history response:', response.data);
      
      // Kiểm tra dữ liệu trả về
      if (Array.isArray(response.data)) {
        // Đảm bảo mỗi mục trong lịch sử chat đều có timestamp hợp lệ
        const validatedChatHistory = response.data.map(chat => {
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
        
        setChatHistory(validatedChatHistory);
      } else {
        console.error('Dữ liệu lịch sử chat không phải là mảng:', response.data);
        setChatHistory([]);
      }
    } catch (err) {
      console.error('Lỗi khi lấy lịch sử chat:', err);
      setError('Không thể tải lịch sử chat. Vui lòng thử lại sau.');
      setOpenSnackbar(true);
      setChatHistory([]);
    }
  };

  const handleSendQuestion = async () => {
    if (!userInput.trim()) return;
    
    if (!drugInfo) {
      setError('Vui lòng chọn một loại thuốc trước khi đặt câu hỏi');
      setOpenSnackbar(true);
      return;
    }

    // Kiểm tra drugInfo có đầy đủ thông tin không
    if (!drugInfo.brand_name && !drugInfo.generic_name) {
      console.warn('Drug info is missing name:', drugInfo);
    }

    const question = userInput;
    setUserInput('');
    setLoading(true);

    // Thêm câu hỏi của người dùng vào lịch sử chat (UI only)
    const tempId = Date.now().toString();
    const newUserQuestion = {
      _id: tempId,
      question,
      answer: '',
      timestamp: new Date().toISOString(),
      isLoading: true
    };
    
    // Đảm bảo chatHistory là một mảng trước khi cập nhật
    setChatHistory(prev => Array.isArray(prev) ? [...prev, newUserQuestion] : [newUserQuestion]);

    try {
      console.log('Sending question with drug info:', drugInfo);
      const response = await askGeminiAboutDrug({
        productInfo: {
          name: drugInfo.brand_name || drugInfo.generic_name || 'Không có tên',
          description: drugInfo.indications_and_usage || 'Không có thông tin',
          ingredients: drugInfo.active_ingredient || 'Không có thông tin',
          usage: drugInfo.purpose || drugInfo.indications_and_usage || 'Không có thông tin',
          dosage: drugInfo.dosage_and_administration || 'Không có thông tin',
          adverseEffect: drugInfo.adverse_reactions || 'Không có thông tin',
          careful: drugInfo.warnings || 'Không có thông tin',
          preservation: drugInfo.storage_and_handling || 'Không có thông tin',
          brand: drugInfo.labeler_name || 'Không có thông tin',
          category: drugInfo.route || 'Không có thông tin',
          price: 'Không có thông tin',
          url: 'FDA Database'
        },
        question: question
      });
      console.log('Gemini API response:', response.data);
      
      // Đảm bảo dữ liệu trả về có timestamp hợp lệ
      let responseData = response.data;
      
      // Kiểm tra xem responseData có chứa câu hỏi không
      if (!responseData.question) {
        console.log('Response data missing question, adding it back:', question);
        responseData = {
          ...responseData,
          question: question // Thêm câu hỏi vào dữ liệu trả về
        };
      }
      
      if (!responseData.timestamp) {
        responseData = {
          ...responseData,
          timestamp: new Date().toISOString()
        };
      }
      
      console.log('Final response data to be added to chat history:', responseData);
      
      // Cập nhật lịch sử chat với câu trả lời từ AI
      setChatHistory(prev => {
        if (!Array.isArray(prev)) return [responseData];
        
        return prev.map(item => 
          item._id === tempId 
            ? { 
                ...responseData, 
                _id: item._id, // Giữ nguyên ID tạm thời
                question: question, // Đảm bảo câu hỏi luôn được giữ lại
                timestamp: item.timestamp, // Giữ nguyên timestamp ban đầu
                isLoading: false 
              } 
            : item
        );
      });
    } catch (err) {
      console.error('Lỗi khi gửi câu hỏi:', err);
      
      // Cập nhật lịch sử chat với thông báo lỗi
      setChatHistory(prev => {
        if (!Array.isArray(prev)) return [];
        
        return prev.map(item => 
          item._id === tempId 
            ? { 
                ...item, 
                question: question, // Đảm bảo câu hỏi được giữ lại
                answer: 'Đã xảy ra lỗi khi xử lý câu hỏi của bạn. Vui lòng thử lại sau.', 
                isLoading: false,
                isError: true
              } 
            : item
        );
      });
      
      setError('Đã xảy ra lỗi khi xử lý câu hỏi của bạn. Vui lòng thử lại sau.');
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
    navigate('/fda-drugs', { state: { returnTo: '/chat' } });
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <CustomContainer maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 0, 
          borderRadius: 3,
          height: 'calc(100vh - 180px)',
          display: 'flex',
          flexDirection: 'column',
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
            alignItems: 'center'
          }}
        >
          <SmartToyIcon sx={{ mr: 1.5, fontSize: 28 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Chat với AI về Thuốc
          </Typography>
          
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
        </Box>
        
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
                startIcon={<ArrowBackIcon />}
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
              startIcon={<MedicalServicesIcon />}
            >
              Chọn thuốc để hỏi
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
            chatHistory.map((chat, index) => (
              <Fade in={true} key={chat._id} timeout={300} style={{ transitionDelay: `${index * 50}ms` }}>
                <Box>
                  {/* User Question */}
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
                      <Box 
                        sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          mb: 0.5
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                          {formatTimestamp(chat.timestamp)}
                        </Typography>
                        <Tooltip title="Xóa" arrow>
                          <IconButton 
                            size="small" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteChatItem(chat._id);
                            }}
                            sx={{ p: 0.5 }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      <Paper 
                        sx={{ 
                          p: 2, 
                          bgcolor: 'primary.main',
                          color: 'white',
                          borderRadius: '16px 16px 0 16px'
                        }}
                      >
                        <Typography variant="body1">
                          {chat.question}
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
                  
                  {/* AI Answer */}
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'flex-start',
                      alignItems: 'flex-start'
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
                      {chat.isLoading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CircularProgress size={20} sx={{ mr: 2 }} />
                          <Typography variant="body2" color="text.secondary">
                            AI đang xử lý câu hỏi của bạn...
                          </Typography>
                        </Box>
                      ) : chat.isError ? (
                        <Typography variant="body1" color="error">
                          {chat.answer}
                        </Typography>
                      ) : (
                        <Box className="markdown-content">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({node, ...props}) => (
                                <Typography 
                                  variant="body1" 
                                  sx={{ 
                                    mb: 1.5,
                                    lineHeight: 1.6,
                                    '&:last-child': { mb: 0 }
                                  }} 
                                  {...props} 
                                />
                              ),
                              a: ({node, ...props}) => (
                                <MuiLink 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  sx={{
                                    textDecoration: 'none',
                                    '&:hover': {
                                      textDecoration: 'underline'
                                    }
                                  }}
                                  {...props} 
                                />
                              ),
                              code: ({node, inline, ...props}) => 
                                inline ? (
                                  <code 
                                    style={{
                                      padding: '2px 4px',
                                      backgroundColor: 'rgba(0,0,0,0.04)',
                                      borderRadius: 4,
                                      fontFamily: 'monospace',
                                      fontSize: '0.875em'
                                    }} 
                                    {...props} 
                                  />
                                ) : (
                                  <pre 
                                    style={{
                                      padding: '16px',
                                      backgroundColor: '#f5f5f5',
                                      borderRadius: 4,
                                      overflowX: 'auto'
                                    }}
                                  >
                                    <code {...props} />
                                  </pre>
                                ),
                              blockquote: ({node, ...props}) => (
                                <Box
                                  component="blockquote"
                                  sx={{
                                    m: 0,
                                    mb: 2,
                                    pl: 2,
                                    py: 0.5,
                                    borderLeft: '4px solid',
                                    borderColor: 'warning.main',
                                    bgcolor: 'warning.light',
                                    color: 'warning.dark',
                                    fontStyle: 'italic',
                                    '& p': {
                                      m: 0
                                    }
                                  }}
                                  {...props}
                                />
                              ),
                              h3: ({node, ...props}) => (
                                <Typography
                                  variant="h6"
                                  sx={{
                                    color: 'primary.main',
                                    fontWeight: 'bold',
                                    mt: 2,
                                    mb: 1
                                  }}
                                  {...props}
                                />
                              ),
                              ul: ({node, ...props}) => (
                                <Box
                                  component="ul"
                                  sx={{
                                    pl: 2,
                                    mb: 1.5,
                                    '& li': {
                                      mb: 0.5,
                                      '&:last-child': {
                                        mb: 0
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
                                    pl: 2,
                                    mb: 1.5,
                                    '& li': {
                                      mb: 0.5,
                                      '&:last-child': {
                                        mb: 0
                                      }
                                    }
                                  }}
                                  {...props}
                                />
                              ),
                              table: ({node, ...props}) => (
                                <Box
                                  component="table"
                                  sx={{
                                    width: '100%',
                                    mb: 2,
                                    borderCollapse: 'collapse',
                                    '& th, & td': {
                                      border: '1px solid',
                                      borderColor: 'grey.300',
                                      p: 1
                                    },
                                    '& th': {
                                      bgcolor: 'grey.100',
                                      fontWeight: 'bold'
                                    }
                                  }}
                                  {...props}
                                />
                              )
                            }}
                          >
                            {chat.answer}
                          </ReactMarkdown>
                        </Box>
                      )}
                    </Paper>
                  </Box>
                </Box>
              </Fade>
            ))
          )}
          <div ref={chatEndRef} />
        </Box>

        {/* Suggested Questions */}
        {drugInfo && (
          <Box 
            sx={{ 
              p: 2, 
              borderTop: '1px solid rgba(0,0,0,0.08)',
              bgcolor: 'background.paper',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1, alignSelf: 'center' }}>
              Câu hỏi gợi ý:
            </Typography>
            {suggestedQuestions.map((question, index) => (
              <Chip
                key={index}
                label={question}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSuggestedQuestionClick(question);
                }}
                variant="outlined"
                color="primary"
                clickable
                size="small"
              />
            ))}
          </Box>
        )}

        {/* Input Area */}
        <Box 
          sx={{ 
            p: 2, 
            borderTop: '1px solid rgba(0,0,0,0.08)',
            bgcolor: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder={drugInfo ? "Nhập câu hỏi của bạn..." : "Vui lòng chọn thuốc trước khi đặt câu hỏi"}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!drugInfo || loading}
            multiline
            maxRows={4}
            size="medium"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                bgcolor: '#f5f7f9'
              }
            }}
          />
          <Button
            variant="contained"
            color="primary"
            endIcon={<SendIcon />}
            onClick={(e) => {
              e.stopPropagation();
              handleSendQuestion();
            }}
            disabled={!drugInfo || !userInput.trim() || loading}
            sx={{ 
              height: 56, 
              borderRadius: 3,
              px: 3
            }}
          >
            Gửi
          </Button>
        </Box>
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
    </CustomContainer>
  );
};

export default ChatWithAI; 