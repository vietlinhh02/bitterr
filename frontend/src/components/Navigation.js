import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Container,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
  Box,
  Avatar,
  Tooltip,
  Fade
} from '@mui/material';
import { 
  Menu as MenuIcon,
  Search as SearchIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  History as HistoryIcon,
  Chat as ChatIcon,
  MedicalServices as MedicalServicesIcon,
  PhotoCamera as PhotoCameraIcon,
  LocalPharmacy as LocalPharmacyIcon,
  Home as HomeIcon,
  Apps as AppsIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

function Navigation() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = React.useState(null);
  const { user: contextUser, updateUser } = useUser();
  
  // Kiểm tra xem người dùng đã đăng nhập chưa
  const isLoggedIn = localStorage.getItem('token') !== null;
  
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    updateUser(null);
    navigate('/login');
  };

  return (
    <AppBar position="sticky" color="primary" elevation={0} sx={{ mb: 4 }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
              flexGrow: { xs: 0, md: 1 }
            }}
          >
            <MedicalServicesIcon sx={{ mr: 1 }} />
            BiiterNCKH
          </Typography>

          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            <MedicalServicesIcon sx={{ mr: 1 }} />
            BiiterNCKH
          </Typography>
          
          {isMobile ? (
            <>
              <IconButton
                size="large"
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={handleMenu}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                TransitionComponent={Fade}
              >
                <MenuItem 
                  component={Link} 
                  to="/" 
                  onClick={handleClose}
                >
                  <HomeIcon fontSize="small" sx={{ mr: 1 }} />
                  Trang chủ
                </MenuItem>
                
                <MenuItem 
                  component={Link} 
                  to="/fda-drugs" 
                  onClick={handleClose}
                >
                  <SearchIcon fontSize="small" sx={{ mr: 1 }} />
                  Tra cứu thuốc
                </MenuItem>
                
                <MenuItem 
                  component={Link} 
                  to="/drug-events" 
                  onClick={handleClose}
                >
                  <WarningIcon fontSize="small" sx={{ mr: 1 }} />
                  Sự kiện thuốc
                </MenuItem>
                
                {isLoggedIn && (
                  <>
                    <MenuItem 
                      component={Link} 
                      to="/features" 
                      onClick={handleClose}
                    >
                      <AppsIcon fontSize="small" sx={{ mr: 1 }} />
                      Tất cả tính năng
                    </MenuItem>
                    <MenuItem 
                      component={Link} 
                      to="/longchau-search" 
                      onClick={handleClose}
                    >
                      <LocalPharmacyIcon fontSize="small" sx={{ mr: 1 }} />
                      Tìm kiếm Long Châu
                    </MenuItem>
                    <MenuItem 
                      component={Link} 
                      to="/search-history" 
                      onClick={handleClose}
                    >
                      <HistoryIcon fontSize="small" sx={{ mr: 1 }} />
                      Lịch sử tìm kiếm
                    </MenuItem>
                    <MenuItem 
                      component={Link} 
                      to="/chat" 
                      onClick={handleClose}
                    >
                      <ChatIcon fontSize="small" sx={{ mr: 1 }} />
                      Chat với AI
                    </MenuItem>
                    <MenuItem 
                      component={Link} 
                      to="/image-detection" 
                      onClick={handleClose}
                    >
                      <PhotoCameraIcon fontSize="small" sx={{ mr: 1 }} />
                      Nhận diện thuốc từ ảnh
                    </MenuItem>
                  </>
                )}
                
                {isLoggedIn ? (
                  [
                    <MenuItem 
                      key="profile" 
                      component={Link} 
                      to="/profile" 
                      onClick={handleClose}
                    >
                      <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                      Tài khoản
                    </MenuItem>,
                    <MenuItem 
                      key="logout" 
                      onClick={handleLogout}
                    >
                      <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                      Đăng xuất
                    </MenuItem>
                  ]
                ) : (
                  <MenuItem 
                    component={Link} 
                    to="/login" 
                    onClick={handleClose}
                  >
                    <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                    Đăng nhập
                  </MenuItem>
                )}
              </Menu>
            </>
          ) : (
            <>
              <Box sx={{ 
                display: 'flex', 
                gap: 0.5, 
                flexWrap: 'nowrap',
                overflow: 'auto',
                '&::-webkit-scrollbar': { display: 'none' },
                msOverflowStyle: 'none',
                scrollbarWidth: 'none'
              }}>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/"
                  startIcon={<HomeIcon />}
                  sx={{ 
                    borderRadius: 2, 
                    px: 1.5,
                    minWidth: 'auto',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Trang chủ
                </Button>
                
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/fda-drugs"
                  startIcon={<SearchIcon />}
                  sx={{ 
                    borderRadius: 2, 
                    px: 1.5,
                    minWidth: 'auto',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Tra cứu
                </Button>
                
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/drug-events"
                  startIcon={<WarningIcon />}
                  sx={{ 
                    borderRadius: 2, 
                    px: 1.5,
                    minWidth: 'auto',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Sự kiện
                </Button>
                
                {isLoggedIn && (
                  <>
                    <Button 
                      color="inherit" 
                      component={Link} 
                      to="/features"
                      startIcon={<AppsIcon />}
                      sx={{ 
                        borderRadius: 2, 
                        px: 1.5,
                        minWidth: 'auto',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Tính năng
                    </Button>
                    <Button 
                      color="inherit" 
                      component={Link} 
                      to="/longchau-search"
                      startIcon={<LocalPharmacyIcon />}
                      sx={{ 
                        borderRadius: 2, 
                        px: 1.5,
                        minWidth: 'auto',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Long Châu
                    </Button>
                    <Button 
                      color="inherit" 
                      component={Link} 
                      to="/search-history"
                      startIcon={<HistoryIcon />}
                      sx={{ 
                        borderRadius: 2, 
                        px: 1.5,
                        minWidth: 'auto',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Lịch sử
                    </Button>
                    <Button 
                      color="inherit" 
                      component={Link} 
                      to="/chat"
                      startIcon={<ChatIcon />}
                      sx={{ 
                        borderRadius: 2, 
                        px: 1.5,
                        minWidth: 'auto',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Chat
                    </Button>
                    <Button 
                      color="inherit" 
                      component={Link} 
                      to="/image-detection"
                      startIcon={<PhotoCameraIcon />}
                      sx={{ 
                        borderRadius: 2, 
                        px: 1.5,
                        minWidth: 'auto',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Nhận diện
                    </Button>
                  </>
                )}
              </Box>
              
              {isLoggedIn ? (
                <Box sx={{ ml: 2 }}>
                  <Tooltip title="Tài khoản">
                    <IconButton onClick={handleUserMenuOpen} sx={{ p: 0 }}>
                      <Avatar 
                        alt={contextUser?.username || 'User'} 
                        src={contextUser?.avatar}
                        sx={{ 
                          bgcolor: 'secondary.main',
                          width: 40,
                          height: 40
                        }}
                      >
                        {contextUser?.username ? contextUser.username.charAt(0).toUpperCase() : 'U'}
                      </Avatar>
                    </IconButton>
                  </Tooltip>
                  <Menu
                    id="menu-appbar-user"
                    anchorEl={userMenuAnchorEl}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={Boolean(userMenuAnchorEl)}
                    onClose={handleUserMenuClose}
                    TransitionComponent={Fade}
                  >
                    <MenuItem 
                      component={Link} 
                      to="/profile" 
                      onClick={handleUserMenuClose}
                    >
                      <PersonIcon fontSize="small" sx={{ mr: 1 }} />
                      Tài khoản
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                      Đăng xuất
                    </MenuItem>
                  </Menu>
                </Box>
              ) : (
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/login"
                  variant="outlined"
                  sx={{ 
                    ml: 2,
                    borderRadius: 2,
                    px: 2,
                    borderColor: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    }
                  }}
                >
                  Đăng nhập
                </Button>
              )}
            </>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navigation; 