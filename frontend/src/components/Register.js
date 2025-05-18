import React, { useState } from 'react';
import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Grid,
  Snackbar,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/api';
import { useUser } from '../contexts/UserContext';

function Register() {
  const { updateUser, clearUser } = useUser();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState('error');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Kiểm tra dữ liệu nhập
    if (!username || !email || !password) {
      setError('Vui lòng điền đầy đủ thông tin');
      setAlertSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      setAlertSeverity('error');
      setOpenSnackbar(true);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await register({
        username,
        email,
        password
      });
      
      if (response.data && response.data.accessToken) {
        // Hiển thị thông báo thành công
        setSuccess('Đăng ký thành công! Đang chuyển hướng đến trang đăng nhập...');
        setAlertSeverity('success');
        setOpenSnackbar(true);
        
        // Xóa dữ liệu người dùng cũ để tránh xung đột
        clearUser(); // Xóa dữ liệu trong localStorage và các cache khác
        
        // Chuyển hướng đến trang đăng nhập sau 3 giây
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError('Đăng ký thất bại. Vui lòng thử lại.');
        setAlertSeverity('error');
        setOpenSnackbar(true);
      }
    } catch (err) {
      console.error('Lỗi đăng ký:', err);
      
      if (err.response) {
        // Lỗi từ server
        setError(err.response.data.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      } else {
        setError('Không thể kết nối đến server. Vui lòng thử lại sau.');
      }
      
      setAlertSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10, mb: 10 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Đăng Ký Tài Khoản
        </Typography>
        
        <form onSubmit={handleRegister}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Tên người dùng"
                variant="outlined"
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Mật khẩu"
                variant="outlined"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Xác nhận mật khẩu"
                variant="outlined"
                fullWidth
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                type="password"
                required
                error={password !== confirmPassword && confirmPassword !== ''}
                helperText={password !== confirmPassword && confirmPassword !== '' ? 'Mật khẩu không khớp' : ''}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                disabled={loading}
                sx={{ height: '50px' }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Đăng Ký'}
              </Button>
            </Grid>
          </Grid>
        </form>
        
        <Typography variant="body2" align="center" sx={{ mt: 3 }}>
          Đã có tài khoản? <Button color="primary" onClick={() => navigate('/login')}>Đăng nhập</Button>
        </Typography>
      </Paper>
      
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={alertSeverity} 
          sx={{ width: '100%' }}
        >
          {alertSeverity === 'success' ? success : error}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Register; 