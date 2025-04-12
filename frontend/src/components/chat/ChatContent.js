import React from 'react';
import { Box, Typography, CircularProgress, Chip, Button } from '@mui/material';
import { QuestionAnswer as QuestionAnswerIcon, Search as SearchIcon } from '@mui/icons-material';
import MessageBubble from './MessageBubble';

const ChatContent = ({ 
  messages, 
  messagesEndRef, 
  drugInfo, 
  loading, 
  error, 
  suggestedQuestions,
  handleSuggestedQuestionClick,
  handleSelectDrug,
  formatTimestamp
}) => {
  // Kiểm tra nếu không có tin nhắn hoặc không có thuốc
  const showEmptyState = messages.length === 0 || (!drugInfo && messages.length <= 1);
  
  return (
    <Box 
      sx={{ 
        flexGrow: 1, 
        overflowY: 'auto', 
        p: 2,
        bgcolor: '#f8f9fa',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: showEmptyState ? 'center' : 'flex-start'
      }}
    >
      {showEmptyState ? (
        // Hiển thị hướng dẫn khi chưa có tin nhắn hoặc chưa chọn thuốc
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
              ? `Đặt câu hỏi về thuốc ${drugInfo.generic_name || drugInfo.name || drugInfo.brand_name} để nhận thông tin chuyên sâu từ trợ lý AI của chúng tôi.`
              : 'Vui lòng chọn một loại thuốc để bắt đầu trò chuyện.'}
          </Typography>

          {!drugInfo && (
            <Button
              variant="contained"
              onClick={handleSelectDrug}
              startIcon={<SearchIcon />}
              sx={{ mt: 2 }}
              size="large"
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
              isUser={msg.isUser || msg.sender === 'user' || msg.role === 'user'}
              message={msg}
              timestamp={msg.timestamp ? formatTimestamp(msg.timestamp) : ''}
            />
          ))}
          <div ref={messagesEndRef} />
          
          {/* Hiển thị gợi ý câu hỏi sau khi có phản hồi */}
          {messages.length > 0 && 
            (messages[messages.length - 1].isUser === false || 
             messages[messages.length - 1].sender === 'ai' || 
             messages[messages.length - 1].role === 'assistant') && (
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
  );
};

export default ChatContent; 