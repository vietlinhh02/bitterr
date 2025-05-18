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
  DialogActions,
  Link
} from '@mui/material';
import { 
  Person as PersonIcon, 
  Save as SaveIcon, 
  Lock as LockIcon,
  History as HistoryIcon,
  Chat as ChatIcon,
  PhotoCamera as PhotoCameraIcon,
  Edit as EditIcon,
  Api as ApiIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { 
  getUserProfile, 
  updateUserProfile, 
  changePassword, 
  uploadAvatar, 
  getAvatarUrl,
  updateGeminiApiKey
} from '../services/api';
import { useUser } from '../contexts/UserContext';

function UserProfile() {
  const { user: contextUser, updateUser, updateGeminiApiKey: updateContextApiKey, hasGeminiApiKey } = useUser();
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
  const [apiKeyData, setApiKeyData] = useState({
    geminiApiKey: ''
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

  // Fetch user data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Kiểm tra xem có dữ liệu cache không và nó có còn hợp lệ không (dưới 30 giây)
        const cachedData = JSON.parse(sessionStorage.getItem(cacheKey) || '{}');
        const now = new Date().getTime();
        const cacheIsValid = cachedData.timestamp && (now - cachedData.timestamp < 30 * 1000); // Giảm xuống 30 giây
        
        // Lấy timestamp của lần cập nhật user gần nhất từ localStorage
        const userFromStorage = JSON.parse(localStorage.getItem('user') || '{}');
        const userLastUpdated = userFromStorage._lastUpdated || 0;
        
        // Nếu user trong localStorage mới hơn cache, bỏ qua cache
        const shouldBypassCache = userLastUpdated > (cachedData.timestamp || 0);
        
        if (cacheIsValid && cachedData.user && !shouldBypassCache) {
          setUser(cachedData.user);
          setFormData({
            username: cachedData.user.username || '',
            email: cachedData.user.email || ''
          });
          // Lấy API key từ user hoặc fallback về localStorage - sử dụng truy cập an toàn
          setApiKeyData({
            geminiApiKey: (cachedData.user && cachedData.user.geminiApiKey) || localStorage.getItem('geminiApiKey') || ''
          });
          setLoading(false);
          
          // Nhưng vẫn tải dữ liệu mới từ server trong nền để cập nhật cache
          getUserProfile().then(response => {
            if (response.data && response.data.user) {
              updateCachedUserData(response.data.user);
            }
          }).catch(err => console.error('Background profile update failed:', err));
          return;
        }
        
        const response = await getUserProfile();
        
        if (response.data && response.data.user) {
          // Cập nhật avatar URL
          let userData = response.data.user;
          if (userData.avatar) {
            const filename = userData.avatar.split('/').pop();
            userData = {
              ...userData,
              avatar: getAvatarUrl(filename)
            };
          }
          
          updateCachedUserData(userData);
        }
      } catch (error) {
        console.error('Lỗi khi tải thông tin người dùng:', error);
        setSnackbar({
          open: true,
          message: 'Không thể tải thông tin người dùng. Vui lòng thử lại sau.',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    // Hàm để cập nhật dữ liệu người dùng và cache
    const updateCachedUserData = (userData) => {
      setUser(userData);
      setFormData({
        username: userData.username || '',
        email: userData.email || ''
      });
      
      // Lấy API key từ user hoặc fallback về localStorage
      setApiKeyData({
        geminiApiKey: (userData && userData.geminiApiKey) || localStorage.getItem('geminiApiKey') || ''
      });
      
      // Lưu vào cache với timestamp mới
      sessionStorage.setItem(cacheKey, JSON.stringify({
        user: userData,
        timestamp: new Date().getTime()
      }));
    };

    if (contextUser) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [contextUser, cacheKey]);

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
        // Sử dụng API endpoint để lấy avatar
        let avatarUrl = null;
        
        if (response.data.user.avatar) {
          // Lấy tên tệp từ đường dẫn avatar
          const filename = response.data.user.avatar.split('/').pop();
          // Thêm timestamp để tránh cache
          const timestamp = new Date().getTime();
          avatarUrl = getAvatarUrl(filename);
        }
        
        // Cập nhật user với URL đầy đủ
        const updatedUserData = {
          ...response.data.user,
          avatar: avatarUrl,
          _lastUpdated: new Date().getTime()
        };
        
        // Cập nhật state và context
        setUser(updatedUserData);
        updateUser(updatedUserData);
        
        // Xóa các cache để đảm bảo avatar mới được hiển thị
        sessionStorage.removeItem('userProfileCache');
        
        // Force reload avatar để đảm bảo nó được tải mới
        setTimeout(() => {
          // Đặt key state cho avatar để trigger useEffect
          if (avatarUrl) {
            setUser(prev => ({
              ...prev,
              _avatarRefresh: new Date().getTime()
            }));
          }
        }, 500);

        setSnackbar({
          open: true,
          message: 'Cập nhật avatar thành công',
          severity: 'success'
        });
        setAvatarDialog(false);
        setAvatarPreview(null);
        setAvatarFile(null);
      }
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

  const handleApiKeyChange = (e) => {
    const { name, value } = e.target;
    setApiKeyData({
      ...apiKeyData,
      [name]: value
    });
  };

  const saveApiKey = async () => {
    try {
      setSaving(true);
      
      // Kiểm tra xem có token hay không
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Không có token xác thực, không thể cập nhật API key');
        setSnackbar({
          open: true,
          message: 'Vui lòng đăng nhập lại trước khi cập nhật API key',
          severity: 'error'
        });
        
        // Chuyển hướng người dùng về trang đăng nhập
        setTimeout(() => {
          window.location.href = '/login?expired=true';
        }, 2000);
        
        return;
      }
      
      console.log('Gửi yêu cầu cập nhật API key với token:', token.substring(0, 10) + '...');
      
      // Thêm delay nhỏ trước khi gửi yêu cầu
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Lưu API key vào database
      const response = await updateGeminiApiKey({
        geminiApiKey: apiKeyData.geminiApiKey
      });
      
      if (response.data && response.data.success) {
        // Cập nhật context và localStorage trong một bước
        updateContextApiKey(apiKeyData.geminiApiKey);
        
        // Cập nhật local state nếu user tồn tại
        if (user) {
          setUser({
            ...user,
            geminiApiKey: apiKeyData.geminiApiKey
          });
        }
        
        setSnackbar({
          open: true,
          message: 'API key đã được lưu thành công vào tài khoản của bạn',
          severity: 'success'
        });
        
        // Cập nhật cache nếu có
        try {
          const cacheData = JSON.parse(sessionStorage.getItem(cacheKey) || '{}');
          if (cacheData.user) {
            sessionStorage.setItem(cacheKey, JSON.stringify({
              ...cacheData,
              user: {
                ...cacheData.user,
                geminiApiKey: apiKeyData.geminiApiKey
              },
              timestamp: new Date().getTime()
            }));
          }
        } catch (error) {
          console.error('Lỗi khi cập nhật cache:', error);
        }
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật API key:', error);
      setSnackbar({
        open: true,
        message: 'Không thể cập nhật API key. Vui lòng thử lại sau.',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const clearApiKey = async () => {
    try {
      setSaving(true);
      
      // Kiểm tra xem có token hay không
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Không có token xác thực, không thể xóa API key');
        setSnackbar({
          open: true,
          message: 'Vui lòng đăng nhập lại trước khi xóa API key',
          severity: 'error'
        });
        
        // Chuyển hướng người dùng về trang đăng nhập
        setTimeout(() => {
          window.location.href = '/login?expired=true';
        }, 2000);
        
        return;
      }
      
      console.log('Gửi yêu cầu xóa API key với token:', token.substring(0, 10) + '...');
      
      // Thêm delay nhỏ trước khi gửi yêu cầu
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Xóa API key từ database bằng cách đặt thành null hoặc chuỗi rỗng
      const response = await updateGeminiApiKey({
        geminiApiKey: null
      });
      
      if (response.data && response.data.success) {
        // Cập nhật context và localStorage trong một bước
        updateContextApiKey(null);
        
        // Cập nhật local state nếu user tồn tại
        if (user) {
          setUser({
            ...user,
            geminiApiKey: null
          });
        }
        
        setApiKeyData({
          ...apiKeyData,
          geminiApiKey: ''
        });
        
        setSnackbar({
          open: true,
          message: 'API key đã được xóa thành công khỏi tài khoản của bạn',
          severity: 'success'
        });
        
        // Cập nhật cache nếu có
        try {
          const cacheData = JSON.parse(sessionStorage.getItem(cacheKey) || '{}');
          if (cacheData.user) {
            sessionStorage.setItem(cacheKey, JSON.stringify({
              ...cacheData,
              user: {
                ...cacheData.user,
                geminiApiKey: null
              },
              timestamp: new Date().getTime()
            }));
          }
        } catch (error) {
          console.error('Lỗi khi cập nhật cache:', error);
        }
      }
    } catch (error) {
      console.error('Lỗi khi xóa API key:', error);
      setSnackbar({
        open: true,
        message: 'Không thể xóa API key. Vui lòng thử lại sau.',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
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
            <Tab 
              icon={<ApiIcon />} 
              label="Cài đặt API" 
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
          
          {/* Cài đặt API */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Cài đặt API Key
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Nhập API key của Gemini để sử dụng với tài khoản của bạn. Điều này giúp tránh giới hạn "too many requests" khi nhiều người dùng cùng sử dụng API key mặc định.
              </Typography>
              
              <Box sx={{ 
                bgcolor: 'info.light', 
                color: 'info.contrastText', 
                p: 2, 
                borderRadius: 1,
                mb: 2,
                display: 'flex',
                alignItems: 'flex-start'
              }}>
                <InfoIcon sx={{ mr: 1, mt: 0.5 }} />
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    Cách lấy API key của Gemini:
                  </Typography>
                  <Typography variant="body2">
                    1. Truy cập <Link href="https://ai.google.dev/" target="_blank" rel="noopener">Google AI Studio</Link>
                  </Typography>
                  <Typography variant="body2">
                    2. Đăng nhập bằng tài khoản Google của bạn
                  </Typography>
                  <Typography variant="body2">
                    3. Đi tới phần API keys trong trang cài đặt
                  </Typography>
                  <Typography variant="body2">
                    4. Tạo API key mới và sao chép vào đây
                  </Typography>
                </Box>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Gemini API Key"
                    name="geminiApiKey"
                    value={apiKeyData.geminiApiKey}
                    onChange={handleApiKeyChange}
                    variant="outlined"
                    placeholder="Nhập API key của Google Gemini (AIzaSy...)"
                    helperText="API key sẽ được lưu vào tài khoản của bạn. Nếu không nhập, hệ thống sẽ sử dụng API key mặc định với giới hạn sử dụng"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={saveApiKey}
                    disabled={saving}
                    sx={{ mr: 1 }}
                  >
                    {saving ? 'Đang lưu...' : 'Lưu API Key'}
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={clearApiKey}
                    disabled={saving}
                  >
                    {saving ? 'Đang xử lý...' : 'Xóa API Key'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
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