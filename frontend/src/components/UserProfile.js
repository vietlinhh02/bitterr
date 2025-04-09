import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Box, 
  Divider, 
  Avatar, 
  Snackbar, 
  Alert, 
  CircularProgress,
  Tabs,
  Tab,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  Person as PersonIcon, 
  Save as SaveIcon, 
  Lock as LockIcon,
  History as HistoryIcon,
  Chat as ChatIcon,
  PhotoCamera as PhotoCameraIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { getUserProfile, updateUserProfile, changePassword, uploadAvatar } from '../services/api';
import { useUser } from '../contexts/UserContext';

function UserProfile() {
  const { user: contextUser, updateUser } = useUser();
  const [activeTab, setActiveTab] = useState(0);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [errors, setErrors] = useState({});
  const [avatarDialog, setAvatarDialog] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  // Tham chiếu để lưu thông tin người dùng trong session
  const isInitialMount = useRef(true);
  const cacheKey = 'userProfileCache';

  // Lấy thông tin người dùng khi component được mount
  useEffect(() => {
    // Kiểm tra xem có dữ liệu cache không
    const cachedData = sessionStorage.getItem(cacheKey);
    
    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        setUser(parsedData.user);
        setFormData({
          username: parsedData.formData.username || '',
          email: parsedData.formData.email || ''
        });
        setLoading(false);
        console.log('Đã khôi phục dữ liệu từ cache');
      } catch (error) {
        console.error('Lỗi khi phân tích JSON từ cache:', error);
        fetchUserProfile();
      }
    } else {
      // Không có cache, tải dữ liệu mới
      fetchUserProfile();
    }
    
    isInitialMount.current = false;
    
    // Cleanup: Lưu cache khi component unmount
    return () => {
      if (user && formData) {
        const cacheData = {
          user: user,
          formData: formData,
          timestamp: new Date().getTime()
        };
        sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
        console.log('Đã lưu dữ liệu vào cache khi unmount');
      }
    };
  }, []);

  // Cập nhật cache khi dữ liệu thay đổi
  useEffect(() => {
    if (!isInitialMount.current && user && formData) {
      const cacheData = {
        user: user,
        formData: formData,
        timestamp: new Date().getTime()
      };
      sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
    }
  }, [user, formData]);

  // Thêm event listener để lưu cache khi người dùng rời khỏi trang
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user && formData) {
        const cacheData = {
          user: user,
          formData: formData,
          timestamp: new Date().getTime()
        };
        sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user, formData]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await getUserProfile();
      
      if (response.data && response.data.user) {
        // Thiết lập đường dẫn đầy đủ cho avatar
        let userData = {...response.data.user};
        
        // Nếu đường dẫn bắt đầu bằng "/", thêm base URL
        if (userData.avatar && userData.avatar.startsWith('/')) {
          userData.avatar = `http://localhost:5000${userData.avatar}`;
        }
        
        setUser(userData);
        // Cập nhật context user
        updateUser(userData);
        
        setFormData({
          username: userData.username || '',
          email: userData.email || ''
        });
        
        // Lưu dữ liệu mới vào cache
        const cacheData = {
          user: userData,
          formData: {
            username: userData.username || '',
            email: userData.email || ''
          },
          timestamp: new Date().getTime()
        };
        sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setSnackbar({
        open: true,
        message: 'Không thể tải thông tin người dùng. Vui lòng thử lại sau.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedFormData = {
      ...formData,
      [name]: value
    };
    
    setFormData(updatedFormData);
    
    // Cập nhật cache dữ liệu form khi người dùng nhập
    if (user) {
      const currentCache = JSON.parse(sessionStorage.getItem(cacheKey) || '{}');
      const updatedCache = {
        ...currentCache,
        formData: updatedFormData,
        timestamp: new Date().getTime()
      };
      sessionStorage.setItem(cacheKey, JSON.stringify(updatedCache));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };

  const validateProfileForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Tên người dùng không được để trống';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Mật khẩu hiện tại không được để trống';
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'Mật khẩu mới không được để trống';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
    }
    
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu không được để trống';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (!validateProfileForm()) {
      return;
    }
    
    try {
      setSaving(true);
      const response = await updateUserProfile(formData);
      
      if (response.data && response.data.user) {
        const updatedUser = {
          ...response.data.user,
          avatar: user?.avatar // Giữ lại avatar hiện tại
        };
        
        setUser(updatedUser);
        
        // Cập nhật thông tin người dùng trong localStorage và cache
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUserData = {
          ...userData,
          username: response.data.user.username,
          email: response.data.user.email
        };
        
        localStorage.setItem('user', JSON.stringify(updatedUserData));
        
        // Cập nhật context user
        updateUser(updatedUserData);
        
        setSnackbar({
          open: true,
          message: 'Cập nhật thông tin thành công',
          severity: 'success'
        });
        
        // Cập nhật cache
        const cacheData = {
          user: updatedUser,
          formData: formData,
          timestamp: new Date().getTime()
        };
        sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin.';
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }
    
    try {
      setSaving(true);
      const response = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setSnackbar({
        open: true,
        message: 'Đổi mật khẩu thành công',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error changing password:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu.';
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };
  
  const handleAvatarClick = () => {
    setAvatarDialog(true);
  };
  
  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append('avatar', avatarFile);

      const response = await uploadAvatar(formData);
      
      if (response.data && response.data.user) {
        // Thiết lập đường dẫn đầy đủ cho avatar
        let fullAvatarUrl = response.data.user.avatar;
        
        // Nếu đường dẫn bắt đầu bằng "/", thêm base URL
        if (fullAvatarUrl && fullAvatarUrl.startsWith('/')) {
          fullAvatarUrl = `http://localhost:5000${fullAvatarUrl}`;
        }
        
        // Cập nhật user với URL đầy đủ
        const updatedUserData = {
          ...response.data.user,
          avatar: fullAvatarUrl
        };
        
        setUser(updatedUserData);
        updateUser(updatedUserData);

        // Force refresh avatar bằng cách thêm timestamp
        const timestampedAvatarUrl = `${fullAvatarUrl}?t=${new Date().getTime()}`;
        
        const finalUserData = {...updatedUserData, avatar: timestampedAvatarUrl};
        updateUser(finalUserData);
        
        // Cập nhật cache với người dùng đã cập nhật
        const currentCache = JSON.parse(sessionStorage.getItem(cacheKey) || '{}');
        const updatedCache = {
          ...currentCache,
          user: finalUserData,
          timestamp: new Date().getTime()
        };
        sessionStorage.setItem(cacheKey, JSON.stringify(updatedCache));
      }

      setSnackbar({
        open: true,
        message: 'Cập nhật avatar thành công',
        severity: 'success'
      });
      setAvatarDialog(false);
      setAvatarPreview(null);
      setAvatarFile(null);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setSnackbar({
        open: true,
        message: 'Không thể cập nhật avatar. Vui lòng thử lại sau.',
        severity: 'error'
      });
    } finally {
      setUploadingAvatar(false);
    }
  };
  
  const handleCloseAvatarDialog = () => {
    setAvatarDialog(false);
    setAvatarPreview(null);
    setAvatarFile(null);
  };
  
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        {/* Header */}
        <Box 
          sx={{ 
            bgcolor: 'primary.main', 
            color: 'white', 
            p: 3, 
            display: 'flex', 
            alignItems: 'center',
            gap: 2,
            position: 'relative'
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <Avatar 
              src={user?.avatar ? `${user.avatar}?t=${new Date().getTime()}` : undefined}
              sx={{ 
                bgcolor: 'white', 
                color: 'primary.main',
                width: 80,
                height: 80
              }}
            >
              {user?.username ? user.username.charAt(0).toUpperCase() : <PersonIcon sx={{ fontSize: 40 }} />}
            </Avatar>
            <IconButton 
              sx={{ 
                position: 'absolute', 
                right: -8,
                bottom: -8,
                bgcolor: 'secondary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'secondary.dark',
                },
              }}
              onClick={handleAvatarClick}
            >
              <EditIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              {user?.username || 'Người dùng'}
            </Typography>
            <Typography variant="body2">
              {user?.email || 'Email không có sẵn'}
            </Typography>
          </Box>
        </Box>
        
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab 
              icon={<PersonIcon />} 
              label="Thông tin cá nhân" 
              iconPosition="start"
            />
            <Tab 
              icon={<LockIcon />} 
              label="Đổi mật khẩu" 
              iconPosition="start"
            />
          </Tabs>
        </Box>
        
        {/* Tab Content */}
        <Box sx={{ p: 3 }}>
          {/* Thông tin cá nhân */}
          {activeTab === 0 && (
            <form onSubmit={handleUpdateProfile}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tên người dùng"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    variant="outlined"
                    error={!!errors.username}
                    helperText={errors.username}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    variant="outlined"
                    error={!!errors.email}
                    helperText={errors.email}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    disabled={saving}
                    sx={{ mt: 2 }}
                  >
                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          )}
          
          {/* Đổi mật khẩu */}
          {activeTab === 1 && (
            <form onSubmit={handleChangePassword}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Mật khẩu hiện tại"
                    name="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    variant="outlined"
                    error={!!errors.currentPassword}
                    helperText={errors.currentPassword}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Mật khẩu mới"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    variant="outlined"
                    error={!!errors.newPassword}
                    helperText={errors.newPassword}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Xác nhận mật khẩu mới"
                    name="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    variant="outlined"
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<LockIcon />}
                    disabled={saving}
                    sx={{ mt: 2 }}
                  >
                    {saving ? 'Đang lưu...' : 'Đổi mật khẩu'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          )}
        </Box>

        {/* Avatar Dialog */}
        <Dialog open={avatarDialog} onClose={handleCloseAvatarDialog}>
          <DialogTitle>Cập nhật ảnh đại diện</DialogTitle>
          <DialogContent>
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Avatar
                src={avatarPreview || (user?.avatar ? `${user.avatar}?t=${new Date().getTime()}` : undefined)}
                sx={{
                  width: 120,
                  height: 120,
                  mx: 'auto',
                  mb: 2
                }}
              >
                {!avatarPreview && !user?.avatar && <PersonIcon sx={{ fontSize: 60 }} />}
              </Avatar>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="avatar-upload"
                type="file"
                onChange={handleAvatarChange}
              />
              <label htmlFor="avatar-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<PhotoCameraIcon />}
                >
                  Chọn ảnh
                </Button>
              </label>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAvatarDialog}>Hủy</Button>
            <Button
              onClick={handleAvatarUpload}
              disabled={!avatarFile || uploadingAvatar}
              variant="contained"
              startIcon={uploadingAvatar ? <CircularProgress size={20} /> : <SaveIcon />}
            >
              {uploadingAvatar ? 'Đang tải lên...' : 'Lưu thay đổi'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
      
      {/* Thống kê hoạt động */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <HistoryIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Lịch sử tìm kiếm</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Xem lịch sử tìm kiếm thuốc của bạn trong phần "Lịch sử tìm kiếm" trên thanh điều hướng.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ChatIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Chat với AI</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Đặt câu hỏi về thuốc và nhận câu trả lời từ AI trong phần "Chat với AI" trên thanh điều hướng.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Snackbar thông báo */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default UserProfile; 