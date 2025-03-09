import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  InputAdornment,
  Button,
  Chip,
  Divider,
  Card,
  CardContent,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  NavigateNext as NavigateNextIcon,
  MedicalServices as MedicalServicesIcon,
  AccountCircle as AccountCircleIcon,
  Security as SecurityIcon,
  Payments as PaymentsIcon,
  Help as HelpIcon
} from '@mui/icons-material';

function FAQ() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  // Danh sách các danh mục FAQ
  const categories = [
    { id: 'all', label: 'Tất cả', icon: <HelpIcon /> },
    { id: 'account', label: 'Tài khoản', icon: <AccountCircleIcon /> },
    { id: 'features', label: 'Tính năng', icon: <MedicalServicesIcon /> },
    { id: 'security', label: 'Bảo mật', icon: <SecurityIcon /> },
    { id: 'payment', label: 'Thanh toán', icon: <PaymentsIcon /> }
  ];

  // Dữ liệu FAQ
  const faqData = [
    {
      id: 1,
      question: 'BiiterNCKH là gì?',
      answer: 'BiiterNCKH là ứng dụng tra cứu thông tin thuốc thông minh, giúp người dùng tiếp cận thông tin chính xác từ nguồn dữ liệu đáng tin cậy. Ứng dụng cung cấp nhiều tính năng như tìm kiếm thuốc FDA, nhận diện thuốc từ ảnh, tìm kiếm sản phẩm Long Châu và chat với AI.',
      category: 'all'
    },
    {
      id: 2,
      question: 'Làm thế nào để tạo tài khoản?',
      answer: 'Để tạo tài khoản, nhấp vào nút "Đăng ký" ở góc trên bên phải của trang web. Điền thông tin cá nhân của bạn, xác nhận email và bắt đầu sử dụng dịch vụ. Quá trình đăng ký chỉ mất vài phút và hoàn toàn miễn phí.',
      category: 'account'
    },
    {
      id: 3,
      question: 'Tôi quên mật khẩu, phải làm sao?',
      answer: 'Nếu bạn quên mật khẩu, nhấp vào liên kết "Quên mật khẩu" trên trang đăng nhập. Nhập địa chỉ email đã đăng ký, và chúng tôi sẽ gửi cho bạn hướng dẫn đặt lại mật khẩu qua email. Đảm bảo kiểm tra cả thư mục spam nếu bạn không thấy email trong hộp thư đến.',
      category: 'account'
    },
    {
      id: 4,
      question: 'Làm thế nào để tìm kiếm thuốc FDA?',
      answer: 'Để tìm kiếm thuốc FDA, đăng nhập vào tài khoản của bạn và truy cập tính năng "Tìm kiếm thuốc FDA". Nhập tên thuốc, hoạt chất hoặc mã NDC vào ô tìm kiếm. Bạn có thể sử dụng các bộ lọc để thu hẹp kết quả tìm kiếm theo nhà sản xuất, dạng bào chế, v.v.',
      category: 'features'
    },
    {
      id: 5,
      question: 'Tính năng nhận diện thuốc từ ảnh hoạt động như thế nào?',
      answer: 'Tính năng nhận diện thuốc từ ảnh sử dụng công nghệ AI để nhận diện thuốc từ hình ảnh. Bạn có thể tải lên ảnh thuốc hoặc chụp ảnh trực tiếp. Hệ thống sẽ phân tích hình ảnh và cung cấp thông tin về thuốc, bao gồm tên, hoạt chất, công dụng và các thông tin khác.',
      category: 'features'
    },
    {
      id: 6,
      question: 'Dữ liệu của tôi có được bảo mật không?',
      answer: 'Có, chúng tôi rất coi trọng bảo mật dữ liệu của người dùng. Tất cả dữ liệu được mã hóa và lưu trữ an toàn. Chúng tôi không chia sẻ thông tin cá nhân của bạn với bên thứ ba mà không có sự đồng ý của bạn. Để biết thêm chi tiết, vui lòng xem Chính sách bảo mật của chúng tôi.',
      category: 'security'
    },
    {
      id: 7,
      question: 'Làm thế nào để thay đổi thông tin cá nhân?',
      answer: 'Để thay đổi thông tin cá nhân, đăng nhập vào tài khoản của bạn và truy cập trang "Hồ sơ". Tại đây, bạn có thể cập nhật thông tin cá nhân, thay đổi mật khẩu và quản lý các cài đặt khác của tài khoản.',
      category: 'account'
    },
    {
      id: 8,
      question: 'Các gói dịch vụ có những gì?',
      answer: 'Chúng tôi cung cấp nhiều gói dịch vụ khác nhau để đáp ứng nhu cầu của người dùng. Gói Miễn phí cho phép truy cập các tính năng cơ bản. Gói Premium cung cấp truy cập không giới hạn vào tất cả tính năng, bao gồm nhận diện thuốc từ ảnh và chat với AI không giới hạn. Gói Doanh nghiệp cung cấp các tính năng bổ sung cho tổ chức y tế và dược phẩm.',
      category: 'payment'
    },
    {
      id: 9,
      question: 'Làm thế nào để hủy đăng ký gói Premium?',
      answer: 'Để hủy đăng ký gói Premium, đăng nhập vào tài khoản của bạn và truy cập trang "Quản lý gói dịch vụ" trong phần cài đặt tài khoản. Nhấp vào "Hủy đăng ký" và làm theo hướng dẫn. Bạn vẫn có thể sử dụng các tính năng Premium cho đến khi kết thúc chu kỳ thanh toán hiện tại.',
      category: 'payment'
    },
    {
      id: 10,
      question: 'Tôi có thể sử dụng BiiterNCKH trên thiết bị di động không?',
      answer: 'Có, BiiterNCKH được tối ưu hóa cho cả máy tính và thiết bị di động. Bạn có thể truy cập trang web của chúng tôi từ bất kỳ trình duyệt nào trên điện thoại thông minh hoặc máy tính bảng. Chúng tôi cũng có ứng dụng di động cho iOS và Android, bạn có thể tải xuống từ App Store hoặc Google Play.',
      category: 'features'
    },
    {
      id: 11,
      question: 'Dữ liệu thuốc được cập nhật thường xuyên không?',
      answer: 'Có, dữ liệu thuốc của chúng tôi được cập nhật hàng ngày từ các nguồn chính thức như FDA, Dược thư Quốc gia Việt Nam và Long Châu để đảm bảo thông tin luôn mới nhất và chính xác.',
      category: 'features'
    },
    {
      id: 12,
      question: 'Làm thế nào để liên hệ với hỗ trợ khách hàng?',
      answer: 'Bạn có thể liên hệ với đội ngũ hỗ trợ của chúng tôi qua email support@biiterr.com hoặc hotline 1900-xxxx trong giờ làm việc từ 8:00 đến 18:00. Chúng tôi cũng có tính năng chat trực tuyến trên trang web để hỗ trợ ngay lập tức.',
      category: 'all'
    },
    {
      id: 13,
      question: 'Tôi có thể sử dụng BiiterNCKH ở nước ngoài không?',
      answer: 'Có, BiiterNCKH có thể được sử dụng ở bất kỳ đâu trên thế giới. Tuy nhiên, một số tính năng như tìm kiếm sản phẩm Long Châu chủ yếu tập trung vào thị trường Việt Nam. Tính năng tìm kiếm thuốc FDA và chat với AI hoạt động toàn cầu.',
      category: 'features'
    },
    {
      id: 14,
      question: 'Các phương thức thanh toán được chấp nhận là gì?',
      answer: 'Chúng tôi chấp nhận nhiều phương thức thanh toán khác nhau, bao gồm thẻ tín dụng/ghi nợ (Visa, MasterCard, American Express), PayPal, và các phương thức thanh toán địa phương như Momo, VNPay, và chuyển khoản ngân hàng.',
      category: 'payment'
    },
    {
      id: 15,
      question: 'Làm thế nào để bảo vệ tài khoản của tôi?',
      answer: 'Để bảo vệ tài khoản của bạn, hãy sử dụng mật khẩu mạnh và duy nhất, bật xác thực hai yếu tố (2FA) trong cài đặt tài khoản, không chia sẻ thông tin đăng nhập với người khác, và đăng xuất khỏi thiết bị công cộng sau khi sử dụng.',
      category: 'security'
    }
  ];

  // Lọc FAQ theo danh mục và tìm kiếm
  const filteredFAQs = faqData.filter((faq) => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory || faq.category === 'all';
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

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
          Câu Hỏi Thường Gặp (FAQ)
        </Typography>
        
        <Typography 
          variant="subtitle1" 
          align="center" 
          color="text.secondary"
          sx={{ mb: 6 }}
        >
          Tìm câu trả lời cho những câu hỏi phổ biến về BiiterNCKH
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
          <Typography color="text.primary">FAQ</Typography>
        </Breadcrumbs>

        {/* Thanh tìm kiếm */}
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm câu hỏi..."
            variant="outlined"
            value={searchQuery}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {categories.map((category) => (
              <Chip 
                key={category.id}
                label={category.label}
                icon={category.icon}
                onClick={() => handleCategoryChange(category.id)}
                color={selectedCategory === category.id ? "primary" : "default"}
                variant={selectedCategory === category.id ? "filled" : "outlined"}
                sx={{ mb: 1 }}
              />
            ))}
          </Box>
        </Box>

        {/* Danh sách FAQ */}
        <Box sx={{ mb: 6 }}>
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq) => (
              <Accordion key={faq.id} sx={{ mb: 2, boxShadow: 2 }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`panel${faq.id}-content`}
                  id={`panel${faq.id}-header`}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body1">
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                Không tìm thấy câu hỏi nào phù hợp với tìm kiếm của bạn.
              </Typography>
              <Button 
                variant="outlined" 
                color="primary" 
                sx={{ mt: 2 }}
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
              >
                Xóa bộ lọc
              </Button>
            </Box>
          )}
        </Box>

        {/* Phần hỗ trợ thêm */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 4, fontWeight: 600 }}>
            Bạn vẫn cần hỗ trợ?
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', boxShadow: 2 }}>
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                  <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                    Liên hệ hỗ trợ
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn với bất kỳ câu hỏi nào.
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary"
                    href="/contact"
                  >
                    Liên hệ ngay
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', boxShadow: 2 }}>
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                  <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                    Hướng dẫn sử dụng
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Xem hướng dẫn chi tiết về cách sử dụng tất cả các tính năng của BiiterNCKH.
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary"
                    href="/guides"
                  >
                    Xem hướng dẫn
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%', boxShadow: 2 }}>
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                  <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                    Chat với AI
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Đặt câu hỏi trực tiếp với AI của chúng tôi để nhận câu trả lời ngay lập tức.
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary"
                    href="/chat"
                  >
                    Chat ngay
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Phản hồi */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Card sx={{ p: 4, bgcolor: 'primary.light', color: 'white', boxShadow: 3 }}>
            <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
              Câu hỏi của bạn không có trong danh sách?
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Gửi câu hỏi của bạn cho chúng tôi và chúng tôi sẽ trả lời trong thời gian sớm nhất
            </Typography>
            <Button 
              variant="contained" 
              color="secondary"
              size="large"
              href="/contact"
              sx={{ px: 4 }}
            >
              Gửi câu hỏi
            </Button>
          </Card>
        </Box>
      </Container>
    </Box>
  );
}

export default FAQ; 