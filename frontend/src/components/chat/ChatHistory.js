import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  CircularProgress,
  IconButton,
  Divider,
  Paper,
  InputBase,
  Tooltip,
  Chip,
  Badge,
  Button
} from '@mui/material';
import { 
  MedicalServices as MedicalServicesIcon, 
  Delete as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon,
  QuestionAnswer as QuestionAnswerIcon,
  CalendarToday as CalendarTodayIcon,
} from '@mui/icons-material';
import { getChatHistory, deleteChatHistoryItem } from '../../services/api';

const ChatHistory = ({ onSelectChat, onNewChat, formatTimestamp }) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  const fetchAllChats = async () => {
    setLoading(true);
    try {
      const response = await getChatHistory();
      if (response?.data?.chatHistory) {
        setChatHistory(response.data.chatHistory);
      } else {
        setChatHistory([]);
      }
    } catch (err) {
      console.error('Lỗi khi lấy lịch sử chat:', err);
      setError('Không thể tải lịch sử chat.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllChats();
  }, []);

  const handleDeleteChatItem = async (chatId, e) => {
    e.stopPropagation();
    try {
      await deleteChatHistoryItem(chatId);
      setChatHistory(prev => prev.filter(item => item._id !== chatId));
    } catch (err) {
      console.error('Lỗi khi xóa mục chat:', err);
      setError('Không thể xóa cuộc trò chuyện này.');
    }
  };

  // Đếm số tin nhắn trong hội thoại
  const countMessages = (item) => {
    if (Array.isArray(item.messages) && item.messages.length > 0) {
      return item.messages.length;
    }
    return item.question && item.answer ? 2 : 0;
  };

  // Format ngày
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Hôm nay';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hôm qua';
    } else {
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
  };

  const filteredChatHistory = chatHistory.filter(item => {
    const drugName = item.generic_name || item.drugQuery || item.drugInfo?.generic_name || item.drugInfo?.name || "";
    return drugName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <Paper 
      elevation={2}
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      <Box 
        sx={{ 
          p: 2, 
          bgcolor: 'primary.main', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Typography variant="subtitle1" fontWeight="medium">
          Lịch sử trò chuyện
        </Typography>
        <Tooltip title="Tạo chat mới">
          <IconButton size="small" onClick={onNewChat} sx={{ color: 'white' }}>
            <AddIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Box sx={{ p: 1 }}>
        <Paper
          component="form"
          sx={{ 
            p: '2px 4px', 
            display: 'flex', 
            alignItems: 'center', 
            border: '1px solid', 
            borderColor: 'divider',
            borderRadius: 2
          }}
        >
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <IconButton sx={{ p: '10px' }} aria-label="search">
            <SearchIcon />
          </IconButton>
        </Paper>
      </Box>
      
      <Divider />
      
      <Box sx={{ flexGrow: 1, overflow: 'auto', px: 1, py: 1 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={30} />
          </Box>
        ) : filteredChatHistory.length === 0 ? (
          <Box sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="body2">
              {searchQuery ? 'Không tìm thấy kết quả' : 'Chưa có lịch sử chat nào'}
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {filteredChatHistory.map((item, index) => {
              const messagesCount = countMessages(item);
              const dateLabel = formatDate(item.timestamp);
              const drugName = item.generic_name || item.drugQuery || item.drugInfo?.generic_name || item.drugInfo?.name || "Thuốc không tên";
              
              return (
                <ListItem
                  key={item._id || index}
                  button
                  onClick={() => onSelectChat(item)}
                  sx={{
                    py: 1.5,
                    px: 1.5,
                    borderRadius: 1.5,
                    mb: 0.5,
                    bgcolor: 'background.paper',
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', maxWidth: 'calc(100% - 30px)' }}>
                        <MedicalServicesIcon color="primary" fontSize="small" sx={{ mr: 1, mt: 0.5 }} />
                        <Typography 
                          variant="body1" 
                          fontWeight="medium" 
                          sx={{ 
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                            hyphens: 'auto'
                          }}
                        >
                          {drugName}
                        </Typography>
                      </Box>
                      <IconButton 
                        edge="end" 
                        size="small"
                        color="error"
                        onClick={(e) => handleDeleteChatItem(item._id, e)}
                        sx={{ ml: 1, mt: -0.5 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    
                    {item.question && (
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        noWrap 
                        sx={{ ml: 4, mb: 0.5 }}
                      >
                        {item.question.length > 60 ? item.question.substring(0, 60) + '...' : item.question}
                      </Typography>
                    )}
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', ml: 4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          icon={<QuestionAnswerIcon fontSize="small" />} 
                          label={`${messagesCount} tin nhắn`}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                        />
                        
                        <Tooltip title={dateLabel}>
                          <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                            <CalendarTodayIcon fontSize="small" sx={{ mr: 0.5, fontSize: 14 }} />
                            <Typography variant="caption">{formatTimestamp(item.timestamp)}</Typography>
                          </Box>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Box>
                </ListItem>
              );
            })}
          </List>
        )}
        
        {error && (
          <Box sx={{ p: 2, color: 'error.main' }}>
            <Typography variant="body2">{error}</Typography>
          </Box>
        )}
      </Box>
      
      <Box sx={{ p: 1.5, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          fullWidth
          onClick={onNewChat}
        >
          Tạo chat mới
        </Button>
      </Box>
    </Paper>
  );
};

export default ChatHistory; 