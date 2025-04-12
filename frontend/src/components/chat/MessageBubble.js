import React from 'react';
import { Box, Paper, Typography, Avatar, useTheme } from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import { Fade } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link as MuiLink } from '@mui/material';
import { Divider } from '@mui/material';
import RobotIcon from '../common/RobotIcon';

const MessageBubble = ({ isUser, message, timestamp }) => {
  const theme = useTheme();
  
  // Xử lý tin nhắn để đảm bảo luôn hiển thị đúng
  const messageContent = React.useMemo(() => {
    // Hiển thị trực tiếp nếu là chuỗi
    if (typeof message === 'string') return message;
    
    if (typeof message === 'object') {
      // Ưu tiên text, content, các trường khác có thể chứa nội dung
      const content = message.text || message.content || message.message || message.answer || message.question || '';
      
      // Log để debug
      console.log('Debug MessageBubble:', {
        isUser,
        message,
        extractedContent: content
      });
      
      return content;
    }
    
    return '';
  }, [message, isUser]);
  
  return (
    <Fade in={true} timeout={500}>
      <Box sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 2,
        px: 1,
      }}>
        <Box sx={{
          display: 'flex',
          flexDirection: isUser ? 'row-reverse' : 'row',
          alignItems: 'flex-start',
          maxWidth: '85%',
        }}>
          {isUser ? (
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.main,
                width: 36,
                height: 36,
                mt: 0.5,
                mx: 1,
              }}
            >
              <PersonIcon fontSize="small" />
            </Avatar>
          ) : (
            <Box sx={{
              mt: 0.5,
              mx: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <RobotIcon height={36} />
            </Box>
          )}
          <Box>
            <Paper
              elevation={2}
              sx={{
                p: 1.5,
                bgcolor: isUser ? '#333' : theme.palette.background.paper,
                color: isUser ? '#fff' : theme.palette.text.primary,
                borderRadius: '18px',
                borderTopLeftRadius: isUser ? '18px' : '4px',
                borderTopRightRadius: isUser ? '4px' : '18px',
                boxShadow: theme.shadows[1],
              }}
            >
              {/* Hiển thị nội dung tin nhắn người dùng dưới dạng thông thường thay vì markdown */}
              {isUser ? (
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {messageContent}
                </Typography>
              ) : (
                <ReactMarkdown
                  children={messageContent}
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: (props) => <Typography variant="h5" color="primary.dark" fontWeight="600" gutterBottom sx={{ mt: 1.5, mb: 1 }} {...props} />,
                    h2: (props) => <Typography variant="h6" color="primary.dark" fontWeight="600" gutterBottom sx={{ mt: 1.5, mb: 1 }} {...props} />,
                    h3: (props) => <Typography variant="subtitle1" color="primary.dark" fontWeight="600" gutterBottom sx={{ mt: 1.5, mb: 0.8 }} {...props} />,
                    table: (props) => <Box sx={{ overflowX: 'auto', my: 1.5, border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}><table style={{ borderCollapse: 'collapse', width: '100%' }} {...props} /></Box>,
                    th: (props) => <th style={{ border: `1px solid ${theme.palette.divider}`, padding: '10px 12px', backgroundColor: theme.palette.grey[100], textAlign: 'left', fontWeight: 600 }} {...props} />,
                    td: (props) => <td style={{ border: `1px solid ${theme.palette.divider}`, padding: '10px 12px' }} {...props} />,
                    a: (props) => <MuiLink color={'primary.dark'} target="_blank" rel="noopener" sx={{ fontWeight: 500, textDecoration: 'underline' }} {...props} />,
                    blockquote: (props) => (
                      <Box sx={{
                        borderLeft: '4px solid',
                        borderColor: theme.palette.info.main,
                        backgroundColor: theme.palette.info.light + '33',
                        p: 1.5, my: 1.5, borderRadius: 1, color: 'text.primary',
                        fontStyle: 'italic', '& p': { mb: 0 }
                      }}>
                        {props.children}
                      </Box>
                    ),
                    code: ({ inline, className, children, ...props }) => {
                      const match = /language-(\w+)/.exec(className || '')
                      const codeText = String(children).replace(/\n$/, '')
                      return !inline ? (
                        <Box sx={{
                          backgroundColor: theme.palette.grey[100],
                          color: theme.palette.text.primary,
                          p: 1.5, borderRadius: 1, overflow: 'auto', my: 1.5,
                          fontFamily: 'monospace', fontSize: '0.9em',
                        }}>
                          <pre style={{ margin: 0, padding: 0, whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                            <code className={className} {...props}>
                              {codeText}
                            </code>
                          </pre>
                        </Box>
                      ) : (
                        <Typography component="span" sx={{
                          fontFamily: 'monospace',
                          backgroundColor: theme.palette.primary.lighter + '4D',
                          color: theme.palette.primary.dark,
                          px: 0.6, py: 0.2, borderRadius: 1, fontSize: '0.9em',
                        }} {...props}>{codeText}</Typography>
                      )
                    },
                    ul: (props) => <Box component="ul" sx={{ pl: 2.5, my: 1 }} {...props} />,
                    ol: (props) => <Box component="ol" sx={{ pl: 2.5, my: 1 }} {...props} />,
                    li: (props) => <Box component="li" sx={{ mb: 0.5 }} {...props} />,
                    p: (props) => <Typography variant="body2" paragraph sx={{ mb: 1, color: 'inherit', '&:last-child': { mb: 0 } }} {...props} />,
                    strong: (props) => <Typography component="span" fontWeight="600" color="inherit" {...props} />,
                    em: (props) => <Typography component="span" fontStyle="italic" sx={{ opacity: 0.9 }} color="inherit" {...props} />,
                    hr: (props) => <Divider sx={{ my: 2 }} {...props} />,
                  }}
                />
              )}
            </Paper>
            <Typography variant="caption" color="text.secondary" sx={{
              display: 'block', mt: 0.5, px: 1,
              textAlign: isUser ? 'right' : 'left', fontSize: '0.7rem',
            }}>
              {timestamp || (typeof message === 'object' ? message.timestamp : null) || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Fade>
  );
};

export default MessageBubble; 