import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  MenuItem,
  Snackbar,
  Alert,
  Breadcrumbs,
  Link,
  Paper
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationOnIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập họ tên';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (formData.phone && !/^[0-9]{10,11}$/i.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }
    
    if (!formData.subject) {
      newErrors.subject = 'Vui lòng chọn chủ đề';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Vui lòng nhập nội dung';
    } else if (formData.message.length < 10) {
      newErrors.message = 'Nội dung quá ngắn (tối thiểu 10 ký tự)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Simulate form submission
      console.log('Form submitted:', formData);
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Tin nhắn của bạn đã được gửi thành công! Chúng tôi sẽ liên hệ lại trong thời gian sớm nhất.',
        severity: 'success'
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } else {
      // Show error message
      setSnackbar({
        open: true,
        message: 'Vui lòng kiểm tra lại thông tin đã nhập.',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const subjects = [
    'Hỗ trợ kỹ thuật',
    'Câu hỏi về sản phẩm',
    'Hợp tác kinh doanh',
    'Báo cáo lỗi',
    'Góp ý cải thiện',
    'Khác'
  ];

  return (
    <Box sx={{ py: 8 }}>
      <Container maxWidth="lg">
        {/* Tiêu đề trang */}
        <Typography 
          variant="h3" 
          component="h1" 
          align="center" 
          gutterBottom
          sx={{ 
            fontWeight: 700,
            mb: 2,
            background: 'linear-gradient(90deg, #009688 0%, #4db6ac 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Liên Hệ Với Chúng Tôi
        </Typography>
        
        <Typography 
          variant="subtitle1" 
          align="center" 
          color="text.secondary"
          sx={{ mb: 6 }}
        >
          Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn
        </Typography>

        {/* Breadcrumbs */}
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />} 
          aria-label="breadcrumb"
          sx={{ mb: 4 }}
        >
          <Link underline="hover" color="inherit" href="/">
            Trang chủ
          </Link>
          <Typography color="text.primary">Liên hệ</Typography>
        </Breadcrumbs>

        <Grid container spacing={6}>
          {/* Thông tin liên hệ */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
                Thông Tin Liên Hệ
              </Typography>
              <Card sx={{ mb: 3, boxShadow: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationOnIcon color="primary" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Địa chỉ
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        123 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <EmailIcon color="primary" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Email
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        support@biiterr.com
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PhoneIcon color="primary" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Hotline
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        1900-xxxx (8:00 - 18:00)
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
                Giờ Làm Việc
              </Typography>
              <Card sx={{ boxShadow: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1">Thứ Hai - Thứ Sáu:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>8:00 - 18:00</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1">Thứ Bảy:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>8:00 - 12:00</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1">Chủ Nhật:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>Nghỉ</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            <Box>
              <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
                Kết Nối Với Chúng Tôi
              </Typography>
              <Card sx={{ boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Theo dõi chúng tôi trên mạng xã hội để cập nhật thông tin mới nhất về sản phẩm và dịch vụ.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="outlined" color="primary">Facebook</Button>
                    <Button variant="outlined" color="primary">Twitter</Button>
                    <Button variant="outlined" color="primary">LinkedIn</Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Grid>

          {/* Form liên hệ */}
          <Grid item xs={12} md={8}>
            <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
              Gửi Tin Nhắn Cho Chúng Tôi
            </Typography>
            <Paper elevation={3} sx={{ p: 4 }}>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Họ tên"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      error={!!errors.name}
                      helperText={errors.name}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      error={!!errors.email}
                      helperText={errors.email}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Số điện thoại"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      error={!!errors.phone}
                      helperText={errors.phone}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      label="Chủ đề"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      error={!!errors.subject}
                      helperText={errors.subject}
                      required
                    >
                      {subjects.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={6}
                      label="Nội dung"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      error={!!errors.message}
                      helperText={errors.message}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      size="large"
                      fullWidth
                    >
                      Gửi tin nhắn
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Paper>
          </Grid>
        </Grid>

        {/* Bản đồ */}
        <Box sx={{ mt: 8, mb: 6 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
            Vị Trí Của Chúng Tôi
          </Typography>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Box
              component="iframe"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3920.0381286044196!2d106.7041!3d10.7743!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQ2JzI3LjUiTiAxMDbCsDQyJzE0LjgiRQ!5e0!3m2!1svi!2s!4v1615896251246!5m2!1svi!2s"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              title="Bản đồ vị trí công ty"
            />
          </Paper>
        </Box>

        {/* FAQ ngắn */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
            Câu Hỏi Thường Gặp
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                    Làm thế nào để nhận hỗ trợ kỹ thuật?
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Bạn có thể nhận hỗ trợ kỹ thuật bằng cách gửi email đến support@biiterr.com, gọi đến hotline 1900-xxxx trong giờ làm việc, hoặc sử dụng form liên hệ trên trang này.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%', boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                    Tôi muốn hợp tác với BiiterNCKH, phải làm thế nào?
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Để thảo luận về cơ hội hợp tác, vui lòng gửi email đến business@biiterr.com hoặc liên hệ với chúng tôi qua form trên trang này với chủ đề "Hợp tác kinh doanh".
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

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
    </Box>
  );
}

export default Contact; 