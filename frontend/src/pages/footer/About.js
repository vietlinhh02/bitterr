import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Avatar,
  Divider,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Timeline as TimelineIcon,
  NavigateNext as NavigateNextIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon
} from '@mui/icons-material';

function About() {
  // Dữ liệu về đội ngũ
  const teamMembers = [
    {
      id: 1,
      name: 'TS. Nguyễn Văn A',
      role: 'Giám đốc điều hành',
      bio: 'Tiến sĩ Dược học với hơn 15 năm kinh nghiệm trong ngành dược phẩm. Chuyên gia về phát triển thuốc và quản lý dữ liệu y tế.',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      social: {
        linkedin: 'https://linkedin.com',
        twitter: 'https://twitter.com'
      }
    },
    {
      id: 2,
      name: 'ThS. Trần Thị B',
      role: 'Giám đốc công nghệ',
      bio: 'Thạc sĩ Công nghệ thông tin với chuyên môn về AI và học máy. Có kinh nghiệm phát triển các hệ thống nhận diện hình ảnh và xử lý ngôn ngữ tự nhiên.',
      image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      social: {
        linkedin: 'https://linkedin.com',
        twitter: 'https://twitter.com'
      }
    },
    {
      id: 3,
      name: 'DS. Lê Văn C',
      role: 'Giám đốc dữ liệu',
      bio: 'Dược sĩ với chuyên môn về quản lý dữ liệu dược phẩm. Có kinh nghiệm xây dựng và duy trì cơ sở dữ liệu thuốc quy mô lớn.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      social: {
        linkedin: 'https://linkedin.com',
        twitter: 'https://twitter.com'
      }
    },
    {
      id: 4,
      name: 'ThS. Phạm Thị D',
      role: 'Trưởng phòng nghiên cứu',
      bio: 'Thạc sĩ Y học với chuyên môn về nghiên cứu dược lý. Có kinh nghiệm trong việc phân tích tương tác thuốc và tác dụng phụ.',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      social: {
        linkedin: 'https://linkedin.com',
        twitter: 'https://twitter.com'
      }
    },
    {
      id: 5,
      name: 'KS. Hoàng Văn E',
      role: 'Trưởng phòng phát triển',
      bio: 'Kỹ sư phần mềm với chuyên môn về phát triển ứng dụng web và di động. Có kinh nghiệm xây dựng các hệ thống tra cứu thông tin phức tạp.',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      social: {
        linkedin: 'https://linkedin.com',
        twitter: 'https://twitter.com'
      }
    },
    {
      id: 6,
      name: 'CN. Ngô Thị F',
      role: 'Trưởng phòng thiết kế UX/UI',
      bio: 'Chuyên gia thiết kế giao diện người dùng với hơn 8 năm kinh nghiệm. Chuyên về thiết kế trải nghiệm người dùng cho các ứng dụng y tế.',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      social: {
        linkedin: 'https://linkedin.com',
        twitter: 'https://twitter.com'
      }
    }
  ];

  // Dữ liệu về các cột mốc
  const milestones = [
    {
      year: '2020',
      title: 'Thành lập công ty',
      description: 'BiiterNCKH được thành lập với sứ mệnh cung cấp thông tin thuốc chính xác và dễ tiếp cận cho người dùng Việt Nam.'
    },
    {
      year: '2021',
      title: 'Ra mắt phiên bản beta',
      description: 'Phiên bản beta của ứng dụng được ra mắt với tính năng tìm kiếm thuốc FDA và cơ sở dữ liệu ban đầu với hơn 50,000 loại thuốc.'
    },
    {
      year: '2022',
      title: 'Tích hợp AI',
      description: 'Tích hợp công nghệ AI vào ứng dụng, bổ sung tính năng nhận diện thuốc từ ảnh và chat với AI.'
    },
    {
      year: '2023',
      title: 'Hợp tác với Long Châu',
      description: 'Ký kết hợp tác với chuỗi nhà thuốc Long Châu, tích hợp dữ liệu sản phẩm và thông tin thuốc từ Long Châu vào hệ thống.'
    },
    {
      year: '2024',
      title: 'Mở rộng cơ sở dữ liệu',
      description: 'Mở rộng cơ sở dữ liệu lên hơn 300,000 loại thuốc từ nhiều nguồn khác nhau, bao gồm FDA, EMA, và Dược thư Quốc gia Việt Nam.'
    },
    {
      year: '2025',
      title: 'Ra mắt phiên bản 2.0',
      description: 'Ra mắt phiên bản 2.0 với giao diện mới, nhiều tính năng nâng cao và hỗ trợ đa ngôn ngữ.'
    }
  ];

  // Dữ liệu về đối tác
  const partners = [
    {
      id: 1,
      name: 'Nhà thuốc Long Châu',
      logo: 'https://via.placeholder.com/150x80?text=Long+Chau'
    },
    {
      id: 2,
      name: 'Bộ Y tế Việt Nam',
      logo: 'https://via.placeholder.com/150x80?text=Bo+Y+Te'
    },
    {
      id: 3,
      name: 'Đại học Y Dược TP.HCM',
      logo: 'https://via.placeholder.com/150x80?text=UMP'
    },
    {
      id: 4,
      name: 'Viện Nghiên cứu Dược phẩm',
      logo: 'https://via.placeholder.com/150x80?text=NCDP'
    },
    {
      id: 5,
      name: 'Hiệp hội Dược phẩm Việt Nam',
      logo: 'https://via.placeholder.com/150x80?text=VPA'
    },
    {
      id: 6,
      name: 'Tổ chức Y tế Thế giới (WHO)',
      logo: 'https://via.placeholder.com/150x80?text=WHO'
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
          Về Chúng Tôi
        </Typography>
        
        <Typography 
          variant="subtitle1" 
          align="center" 
          color="text.secondary"
          sx={{ mb: 6 }}
        >
          Tìm hiểu về BiiterNCKH và sứ mệnh của chúng tôi
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
          <Typography color="text.primary">Về chúng tôi</Typography>
        </Breadcrumbs>

        {/* Giới thiệu */}
        <Box sx={{ mb: 8 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h4" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
                Sứ mệnh của chúng tôi
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                BiiterNCKH được thành lập với sứ mệnh cung cấp thông tin thuốc chính xác, đáng tin cậy và dễ tiếp cận cho người dùng Việt Nam. Chúng tôi tin rằng mọi người đều có quyền tiếp cận thông tin y tế chất lượng cao để đưa ra quyết định sáng suốt về sức khỏe của mình.
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Với đội ngũ chuyên gia y tế, dược sĩ và kỹ sư công nghệ, chúng tôi đã xây dựng một nền tảng toàn diện kết hợp dữ liệu từ nhiều nguồn uy tín và công nghệ AI tiên tiến để mang đến trải nghiệm tra cứu thuốc tốt nhất.
              </Typography>
              <Typography variant="body1">
                Chúng tôi cam kết không ngừng cải tiến và mở rộng dịch vụ để đáp ứng nhu cầu ngày càng tăng của người dùng và góp phần nâng cao chất lượng chăm sóc sức khỏe tại Việt Nam.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box 
                component="img"
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
                alt="Sứ mệnh của chúng tôi"
                sx={{ 
                  width: '100%', 
                  borderRadius: 2,
                  boxShadow: 3
                }}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Giá trị cốt lõi */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" component="h2" sx={{ mb: 4, fontWeight: 600, textAlign: 'center' }}>
            Giá Trị Cốt Lõi
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', boxShadow: 2 }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box sx={{ mb: 2, color: 'primary.main', fontSize: 48 }}>
                    <CheckCircleIcon fontSize="inherit" />
                  </Box>
                  <Typography variant="h6" component="h3" sx={{ mb: 1, fontWeight: 600 }}>
                    Chính xác
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Chúng tôi cam kết cung cấp thông tin thuốc chính xác và đáng tin cậy từ các nguồn uy tín.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', boxShadow: 2 }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box sx={{ mb: 2, color: 'primary.main', fontSize: 48 }}>
                    <CheckCircleIcon fontSize="inherit" />
                  </Box>
                  <Typography variant="h6" component="h3" sx={{ mb: 1, fontWeight: 600 }}>
                    Dễ tiếp cận
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Chúng tôi thiết kế sản phẩm để mọi người đều có thể dễ dàng tiếp cận và sử dụng.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', boxShadow: 2 }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box sx={{ mb: 2, color: 'primary.main', fontSize: 48 }}>
                    <CheckCircleIcon fontSize="inherit" />
                  </Box>
                  <Typography variant="h6" component="h3" sx={{ mb: 1, fontWeight: 600 }}>
                    Đổi mới
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Chúng tôi không ngừng đổi mới và áp dụng công nghệ tiên tiến để cải thiện dịch vụ.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%', boxShadow: 2 }}>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box sx={{ mb: 2, color: 'primary.main', fontSize: 48 }}>
                    <CheckCircleIcon fontSize="inherit" />
                  </Box>
                  <Typography variant="h6" component="h3" sx={{ mb: 1, fontWeight: 600 }}>
                    Bảo mật
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Chúng tôi cam kết bảo vệ dữ liệu và thông tin cá nhân của người dùng.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Đội ngũ */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" component="h2" sx={{ mb: 4, fontWeight: 600, textAlign: 'center' }}>
            Đội Ngũ Của Chúng Tôi
          </Typography>
          <Grid container spacing={4}>
            {teamMembers.map((member) => (
              <Grid item xs={12} sm={6} md={4} key={member.id}>
                <Card sx={{ height: '100%', boxShadow: 2 }}>
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Avatar
                      src={member.image}
                      alt={member.name}
                      sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                    />
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                      {member.name}
                    </Typography>
                    <Typography variant="subtitle1" color="primary" sx={{ mb: 2 }}>
                      {member.role}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {member.bio}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      <Link href={member.social.linkedin} target="_blank" rel="noopener">
                        <LinkedInIcon color="primary" />
                      </Link>
                      <Link href={member.social.twitter} target="_blank" rel="noopener">
                        <TwitterIcon color="primary" />
                      </Link>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Cột mốc */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" component="h2" sx={{ mb: 4, fontWeight: 600, textAlign: 'center' }}>
            Cột Mốc Phát Triển
          </Typography>
          <Box sx={{ position: 'relative' }}>
            <Box sx={{ 
              position: 'absolute', 
              left: '50%', 
              top: 0, 
              bottom: 0, 
              width: 4, 
              bgcolor: 'primary.light',
              transform: 'translateX(-50%)',
              display: { xs: 'none', md: 'block' }
            }} />
            <Grid container spacing={4}>
              {milestones.map((milestone, index) => (
                <Grid item xs={12} key={milestone.year}>
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' } }}>
                    <Box 
                      sx={{ 
                        width: { xs: '100%', md: '50%' }, 
                        textAlign: index % 2 === 0 ? { md: 'right' } : { md: 'left' },
                        pr: index % 2 === 0 ? { md: 4 } : 0,
                        pl: index % 2 === 1 ? { md: 4 } : 0,
                        order: { xs: 1, md: index % 2 === 0 ? 1 : 3 }
                      }}
                    >
                      <Typography variant="h5" component="h3" sx={{ fontWeight: 600, mb: 1 }}>
                        {milestone.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {milestone.description}
                      </Typography>
                    </Box>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        position: 'relative',
                        order: { xs: 3, md: 2 },
                        my: { xs: 2, md: 0 }
                      }}
                    >
                      <Box 
                        sx={{ 
                          width: 60, 
                          height: 60, 
                          borderRadius: '50%', 
                          bgcolor: 'primary.main', 
                          display: 'flex', 
                          justifyContent: 'center', 
                          alignItems: 'center',
                          color: 'white',
                          zIndex: 1,
                          boxShadow: 3
                        }}
                      >
                        <TimelineIcon />
                      </Box>
                    </Box>
                    <Box 
                      sx={{ 
                        width: { xs: '100%', md: '50%' }, 
                        textAlign: index % 2 === 1 ? { md: 'right' } : { md: 'left' },
                        pl: index % 2 === 0 ? { md: 4 } : 0,
                        pr: index % 2 === 1 ? { md: 4 } : 0,
                        order: { xs: 2, md: index % 2 === 0 ? 3 : 1 }
                      }}
                    >
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          fontWeight: 700, 
                          color: 'primary.main',
                          mb: { xs: 1, md: 0 }
                        }}
                      >
                        {milestone.year}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>

        {/* Đối tác */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" component="h2" sx={{ mb: 4, fontWeight: 600, textAlign: 'center' }}>
            Đối Tác Của Chúng Tôi
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {partners.map((partner) => (
              <Grid item xs={6} sm={4} md={2} key={partner.id}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    height: 100,
                    filter: 'grayscale(100%)',
                    transition: 'all 0.3s ease',
                    opacity: 0.7,
                    '&:hover': {
                      filter: 'grayscale(0%)',
                      opacity: 1
                    }
                  }}
                >
                  <img 
                    src={partner.logo} 
                    alt={partner.name} 
                    style={{ maxWidth: '100%', maxHeight: '100%' }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CTA */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Card sx={{ p: 4, bgcolor: 'primary.light', color: 'white', boxShadow: 3 }}>
            <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
              Tham gia cùng chúng tôi
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Bạn muốn trở thành một phần của sứ mệnh cung cấp thông tin thuốc chính xác và dễ tiếp cận?
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button 
                variant="contained" 
                color="secondary"
                size="large"
                href="/contact"
              >
                Liên hệ với chúng tôi
              </Button>
              <Button 
                variant="outlined" 
                color="inherit"
                size="large"
                href="/register"
              >
                Đăng ký ngay
              </Button>
            </Box>
          </Card>
        </Box>
      </Container>
    </Box>
  );
}

export default About; 