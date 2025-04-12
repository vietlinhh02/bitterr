import React from 'react';
import { Box, Typography, IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon, 
  Menu as MenuIcon, 
  History as HistoryIcon, 
  Search as SearchIcon 
} from '@mui/icons-material';

const ChatHeader = ({ 
  drugInfo, 
  navigate, 
  anchorEl, 
  setAnchorEl, 
  handleSelectDrug, 
  openHistoryDialog 
}) => {
  return (
    <Box 
      sx={{ 
        p: 0.3, 
        bgcolor: 'primary.main', 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 1
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
        <IconButton 
          color="inherit" 
          onClick={() => navigate(-1)} 
          sx={{ mr: 1 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h7" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
            Chat với AI
          </Typography>
          {drugInfo && (
            <Typography variant="body2" sx={{ mt: -0.5, opacity: 0.85 }}>
              Thông tin về: {drugInfo.generic_name || drugInfo.name || drugInfo.brand_name}
            </Typography>
          )}
        </Box>
      </Box>
      <Box>
        <IconButton 
          color="inherit" 
          onClick={(e) => setAnchorEl(e.currentTarget)}
          aria-label="Tùy chọn"
        >
          <MenuIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={() => {
            setAnchorEl(null);
            openHistoryDialog();
          }}>
            <ListItemIcon>
              <HistoryIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Lịch sử chat</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            setAnchorEl(null);
            handleSelectDrug();
          }}>
            <ListItemIcon>
              <SearchIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Tìm thuốc khác</ListItemText>
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default ChatHeader; 