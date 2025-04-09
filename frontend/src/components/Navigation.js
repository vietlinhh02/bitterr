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
  Fade,
  Chip
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
  Warning as WarningIcon,
  Favorite as FavoriteIcon,
  Science as ScienceIcon,
  CameraAlt as CameraAltIcon
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

  const menuItems = [
    {
      text: 'Trang Chủ',
      path: '/',
      icon: <HomeIcon />,
      requireAuth: false
    },
    {
      text: 'Nhận Diện Thuốc',
      path: '/medicine-detection',
      icon: <PhotoCameraIcon />,
      requireAuth: true,
      highlight: true
    },
    {
      text: 'Tra Cứu',
      path: '/fda-drugs',
      icon: <SearchIcon />,
      requireAuth: true
    },
    {
      text: 'Pharmacy',
      path: '/pharmacy-search',
      icon: <LocalPharmacyIcon />,
      requireAuth: true
    },
    {
      text: 'Trò Chuyện AI',
      path: '/chat',
      icon: <ChatIcon />,
      requireAuth: true,
      highlight: true
    }
  ];

  const userMenuItems = [
    {
      text: 'Tài Khoản',
      path: '/profile',
      icon: <PersonIcon />,
    },
    {
      text: 'Lịch Sử',
      path: '/search-history',
      icon: <HistoryIcon />,
    },
    {
      text: 'Yêu Thích',
      path: '/favorites',
      icon: <FavoriteIcon />,
    },
    {
      text: 'Sự Kiện',
      path: '/drug-events',
      icon: <WarningIcon />,
    }
  ];

  return (
    <AppBar position="sticky" color="primary" elevation={0} sx={{ mb: 4 }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ gap: 2 }}>
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
              flexGrow: 0,
              alignItems: 'center'
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
                {menuItems.map((item) => (
                  <MenuItem 
                    key={item.path}
                    component={Link} 
                    to={item.path} 
                    onClick={handleClose}
                    sx={{
                      ...(item.highlight && {
                        backgroundColor: 'rgba(0, 150, 136, 0.08)',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 150, 136, 0.15)',
                        }
                      })
                    }}
                  >
                    {item.icon}
                    <Typography noWrap sx={{ ml: 1 }}>
                      {item.text}
                      {item.highlight && (
                        <Chip 
                          size="small" 
                          label="Mới" 
                          color="primary" 
                          variant="outlined"
                          sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                        />
                      )}
                    </Typography>
                  </MenuItem>
                ))}
                
                {isLoggedIn && userMenuItems.map((item) => (
                  <MenuItem 
                    key={item.path}
                    component={Link} 
                    to={item.path} 
                    onClick={handleClose}
                  >
                    {item.icon}
                    <Typography noWrap sx={{ ml: 1 }}>
                      {item.text}
                    </Typography>
                  </MenuItem>
                ))}
                
                {isLoggedIn ? (
                  <MenuItem onClick={handleLogout}>
                    <LogoutIcon />
                    <Typography noWrap sx={{ ml: 1 }}>
                      Đăng Xuất
                    </Typography>
                  </MenuItem>
                ) : (
                  <MenuItem 
                    component={Link} 
                    to="/login" 
                    onClick={handleClose}
                  >
                    <PersonIcon />
                    <Typography noWrap sx={{ ml: 1 }}>
                      Đăng Nhập
                    </Typography>
                  </MenuItem>
                )}
              </Menu>
            </>
          ) : (
            <>
              <Box sx={{ 
                display: { xs: 'none', md: 'flex' }, 
                gap: 1,
                ml: 'auto',
                mr: 2,
                alignItems: 'center'
              }}>
                {menuItems.map((item) => (
                  <Button
                    key={item.path}
                    color="inherit"
                    component={Link}
                    to={item.path}
                    sx={{ 
                      minWidth: 'auto',
                      px: 1,
                      whiteSpace: 'nowrap',
                      fontSize: '0.875rem',
                      ...(item.highlight && {
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        fontWeight: 'bold',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.25)',
                        }
                      })
                    }}
                    startIcon={item.icon}
                  >
                    <Typography noWrap variant="button" sx={{ fontSize: 'inherit' }}>
                      {item.text}
                      {item.highlight && <Box component="span" sx={{ 
                        width: '6px', 
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: '#ffeb3b',
                        display: 'inline-block',
                        ml: 0.5,
                        verticalAlign: 'top'
                      }} />}
                    </Typography>
                  </Button>
                ))}
              </Box>

              <Box sx={{ flexShrink: 0 }}>
                {isLoggedIn ? (
                  <>
                    <Tooltip title="Tùy chọn người dùng">
                      <IconButton onClick={handleUserMenuOpen} sx={{ p: 0 }}>
                        {contextUser && contextUser.avatar ? (
                          <Avatar 
                            alt={contextUser.username} 
                            src={`${contextUser.avatar}?t=${new Date().getTime()}`} 
                            sx={{ width: 40, height: 40 }}
                          />
                        ) : (
                          <Avatar 
                            sx={{ 
                              width: 40, 
                              height: 40, 
                              bgcolor: 'primary.main',
                              color: 'white'
                            }}
                          >
                            <PersonIcon />
                          </Avatar>
                        )}
                      </IconButton>
                    </Tooltip>
                    <Menu
                      sx={{ mt: '45px' }}
                      id="menu-appbar-user"
                      anchorEl={userMenuAnchorEl}
                      anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                      keepMounted
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                      open={Boolean(userMenuAnchorEl)}
                      onClose={handleUserMenuClose}
                    >
                      {userMenuItems.map((item) => (
                        <MenuItem 
                          key={item.path}
                          component={Link} 
                          to={item.path} 
                          onClick={handleUserMenuClose}
                        >
                          {item.icon}
                          <Typography noWrap sx={{ ml: 1 }}>
                            {item.text}
                          </Typography>
                        </MenuItem>
                      ))}
                      <MenuItem onClick={handleLogout}>
                        <LogoutIcon />
                        <Typography noWrap sx={{ ml: 1 }}>
                          Đăng Xuất
                        </Typography>
                      </MenuItem>
                    </Menu>
                  </>
                ) : (
                  <Button 
                    color="inherit" 
                    component={Link} 
                    to="/login"
                    startIcon={<PersonIcon />}
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    Đăng Nhập
                  </Button>
                )}
              </Box>
            </>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navigation;