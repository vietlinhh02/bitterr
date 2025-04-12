import React from 'react';
import { Box, TextField, IconButton, Tooltip, CircularProgress } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';

const ChatInput = ({ input, setInput, handleSendMessage, loading, drugInfo, handleKeyPress }) => {
  return (
    <Box 
      sx={{ 
        p: 1,
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
            ? `Hỏi về thuốc ${drugInfo.generic_name || drugInfo.name || drugInfo.brand_name}...` 
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
  );
};

export default ChatInput; 