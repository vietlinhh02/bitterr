import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
  Image as ImageIcon,
  Chat as ChatIcon,
  MedicalServices as MedicalServicesIcon,
  NavigateNext as NavigateNextIcon
} from '@mui/icons-material';

function Guides() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Dữ liệu cho các hướng dẫn
  const guideCategories = [
    {
      id: 'getting-started',
      title: 'Bắt đầu sử dụng',
      icon: <CheckCircleIcon color="primary" />,
      guides: [
        {
          id: 'account-setup',
          title: 'Thiết lập tài khoản',
          description: 'Hướng dẫn đăng ký và thiết lập tài khoản BiiterNCKH',
          image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
        },
        {
          id: 'interface-overview',
          title: 'Tổng quan giao diện',
          description: 'Làm quen với giao diện người dùng và các tính năng cơ bản',
          image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
        },
        {
          id: 'first-search',
          title: 'Tìm kiếm thuốc đầu tiên',
          description: 'Hướng dẫn thực hiện tìm kiếm thuốc đầu tiên trên hệ thống',
          image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
        }
      ]
    },
    {
      id: 'search-features',
      title: 'Tính năng tìm kiếm',
      icon: <SearchIcon color="primary" />,
      guides: [
        {
          id: 'fda-search',
          title: 'Tìm kiếm thuốc FDA',
          description: 'Hướng dẫn sử dụng tính năng tìm kiếm thuốc từ cơ sở dữ liệu FDA',
          image: 'https://images.unsplash.com/photo-1563213126-a4273aed2016?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
        },
        {
          id: 'longchau-search',
          title: 'Tìm kiếm sản phẩm Long Châu',
          description: 'Hướng dẫn tìm kiếm sản phẩm từ nhà thuốc Long Châu',
          image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
        },
        {
          id: 'advanced-search',
          title: 'Tìm kiếm nâng cao',
          description: 'Sử dụng các bộ lọc và tùy chọn tìm kiếm nâng cao',
          image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
        }
      ]
    },
    {
      id: 'image-detection',
      title: 'Nhận diện thuốc từ ảnh',
      icon: <ImageIcon color="primary" />,
      guides: [
        {
          id: 'take-photo',
          title: 'Chụp ảnh thuốc',
          description: 'Hướng dẫn chụp ảnh thuốc để nhận diện chính xác',
          image: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
        },
        {
          id: 'upload-image',
          title: 'Tải lên ảnh thuốc',
          description: 'Cách tải lên ảnh thuốc từ thiết bị của bạn',
          image: 'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
        },
        {
          id: 'interpret-results',
          title: 'Hiểu kết quả nhận diện',
          description: 'Cách đọc hiểu kết quả nhận diện thuốc từ ảnh',
          image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
        }
      ]
    },
    {
      id: 'ai-chat',
      title: 'Chat với AI',
      icon: <ChatIcon color="primary" />,
      guides: [
        {
          id: 'ask-questions',
          title: 'Đặt câu hỏi hiệu quả',
          description: 'Cách đặt câu hỏi để nhận được câu trả lời chính xác từ AI',
          image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
        },
        {
          id: 'chat-features',
          title: 'Các tính năng chat',
          description: 'Khám phá các tính năng nâng cao của trò chuyện với AI',
          image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
        },
        {
          id: 'save-conversations',
          title: 'Lưu và chia sẻ cuộc trò chuyện',
          description: 'Cách lưu và chia sẻ cuộc trò chuyện với AI',
          image: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
        }
      ]
    },
    {
      id: 'account-management',
      title: 'Quản lý tài khoản',
      icon: <MedicalServicesIcon color="primary" />,
      guides: [
        {
          id: 'profile-settings',
          title: 'Cài đặt hồ sơ',
          description: 'Cách cập nhật thông tin cá nhân và cài đặt hồ sơ',
          image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
        },
        {
          id: 'search-history',
          title: 'Lịch sử tìm kiếm',
          description: 'Xem và quản lý lịch sử tìm kiếm thuốc của bạn',
          image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
        },
        {
          id: 'subscription',
          title: 'Quản lý gói dịch vụ',
          description: 'Cách nâng cấp, hạ cấp hoặc hủy gói dịch vụ của bạn',
          image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
        }
      ]
    }
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
          Hướng Dẫn Sử Dụng
        </Typography>
        
        <Typography 
          variant="subtitle1" 
          align="center" 
          color="text.secondary"
          sx={{ mb: 6 }}
        >
          Khám phá cách sử dụng tất cả các tính năng của BiiterNCKH một cách hiệu quả
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
          <Typography color="text.primary">Hướng dẫn sử dụng</Typography>
        </Breadcrumbs>

        {/* Tabs */}
        <Box sx={{ mb: 4 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="scrollable"
            scrollButtons="auto"
            textColor="primary"
            indicatorColor="primary"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            {guideCategories.map((category, index) => (
              <Tab 
                key={category.id} 
                label={category.title} 
                icon={category.icon} 
                iconPosition="start"
              />
            ))}
          </Tabs>
        </Box>

        {/* Tab content */}
        <Box sx={{ mb: 6 }}>
          {guideCategories.map((category, index) => (
            tabValue === index && (
              <Box key={category.id}>
                <Typography variant="h5" component="h2" sx={{ mb: 4, fontWeight: 600 }}>
                  {category.title}
                </Typography>
                <Grid container spacing={4}>
                  {category.guides.map((guide) => (
                    <Grid item xs={12} sm={6} md={4} key={guide.id}>
                      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 2 }}>
                        <CardMedia
                          component="img"
                          height="180"
                          image={guide.image}
                          alt={guide.title}
                        />
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" component="h3" sx={{ mb: 1, fontWeight: 600 }}>
                            {guide.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {guide.description}
                          </Typography>
                          <Button 
                            variant="outlined" 
                            color="primary" 
                            size="small"
                            endIcon={<NavigateNextIcon />}
                          >
                            Xem hướng dẫn
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )
          ))}
        </Box>

        {/* Hướng dẫn nhanh */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 4, fontWeight: 600 }}>
            Hướng Dẫn Nhanh
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card sx={{ boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="h6" component="h3" sx={{ mb: 3, fontWeight: 600 }}>
                    Các bước tìm kiếm thuốc
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Đăng nhập vào tài khoản của bạn" 
                        secondary="Đảm bảo bạn đã đăng nhập để lưu lịch sử tìm kiếm"
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Chọn nguồn dữ liệu" 
                        secondary="Chọn FDA hoặc Long Châu tùy theo nhu cầu của bạn"
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Nhập tên thuốc hoặc hoạt chất" 
                        secondary="Nhập chính xác tên thuốc hoặc hoạt chất cần tìm"
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Sử dụng bộ lọc (nếu cần)" 
                        secondary="Lọc kết quả theo nhà sản xuất, dạng bào chế, v.v."
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                    <ListItem>
                      <ListItemIcon>
                        <CheckCircleIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Xem kết quả và chi tiết thuốc" 
                        secondary="Nhấp vào kết quả để xem thông tin chi tiết về thuốc"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="h6" component="h3" sx={{ mb: 3, fontWeight: 600 }}>
                    Câu hỏi thường gặp
                  </Typography>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        Làm thế nào để tạo tài khoản?
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2">
                        Để tạo tài khoản, nhấp vào nút "Đăng ký" ở góc trên bên phải của trang web. Điền thông tin cá nhân của bạn, xác nhận email và bắt đầu sử dụng dịch vụ.
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        Làm thế nào để nhận diện thuốc từ ảnh?
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2">
                        Truy cập tính năng "Nhận diện thuốc từ ảnh", tải lên ảnh thuốc của bạn hoặc chụp ảnh trực tiếp. Hệ thống AI sẽ phân tích và cung cấp thông tin về thuốc.
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        Làm thế nào để xem lịch sử tìm kiếm?
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2">
                        Đăng nhập vào tài khoản của bạn, sau đó truy cập mục "Lịch sử tìm kiếm" trong menu người dùng. Tại đây, bạn có thể xem tất cả các tìm kiếm trước đây.
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        Dữ liệu thuốc được cập nhật thường xuyên không?
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2">
                        Có, dữ liệu thuốc của chúng tôi được cập nhật hàng ngày từ các nguồn chính thức như FDA, Dược thư Quốc gia Việt Nam và Long Châu để đảm bảo thông tin luôn mới nhất.
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        Làm thế nào để liên hệ với hỗ trợ?
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2">
                        Bạn có thể liên hệ với đội ngũ hỗ trợ của chúng tôi qua email support@biiterr.com hoặc hotline 1900-xxxx trong giờ làm việc từ 8:00 đến 18:00.
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Video hướng dẫn */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 4, fontWeight: 600 }}>
            Video Hướng Dẫn
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ boxShadow: 2 }}>
                <CardMedia
                  component="img"
                  height="180"
                  image="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
                  alt="Video hướng dẫn"
                />
                <CardContent>
                  <Typography variant="h6" component="h3" sx={{ mb: 1, fontWeight: 600 }}>
                    Hướng dẫn tìm kiếm thuốc FDA
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Video hướng dẫn chi tiết cách tìm kiếm thuốc từ cơ sở dữ liệu FDA
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth
                  >
                    Xem video
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ boxShadow: 2 }}>
                <CardMedia
                  component="img"
                  height="180"
                  image="https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
                  alt="Video hướng dẫn"
                />
                <CardContent>
                  <Typography variant="h6" component="h3" sx={{ mb: 1, fontWeight: 600 }}>
                    Hướng dẫn nhận diện thuốc từ ảnh
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Video hướng dẫn cách sử dụng tính năng nhận diện thuốc từ ảnh
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth
                  >
                    Xem video
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ boxShadow: 2 }}>
                <CardMedia
                  component="img"
                  height="180"
                  image="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
                  alt="Video hướng dẫn"
                />
                <CardContent>
                  <Typography variant="h6" component="h3" sx={{ mb: 1, fontWeight: 600 }}>
                    Hướng dẫn chat với AI
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Video hướng dẫn cách sử dụng tính năng chat với AI để tìm hiểu về thuốc
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth
                  >
                    Xem video
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Tải xuống tài liệu */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Card sx={{ p: 4, bgcolor: 'primary.light', color: 'white', boxShadow: 3 }}>
            <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
              Tài liệu hướng dẫn đầy đủ
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Tải xuống tài liệu hướng dẫn đầy đủ về cách sử dụng tất cả các tính năng của BiiterNCKH
            </Typography>
            <Button 
              variant="contained" 
              color="secondary"
              size="large"
              sx={{ px: 4 }}
            >
              Tải xuống PDF
            </Button>
          </Card>
        </Box>
      </Container>
    </Box>
  );
}

export default Guides; 