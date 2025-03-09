import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Divider,
  Button,
  TextField,
  InputAdornment
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

function Blog() {
  // Dữ liệu mẫu cho các bài viết blog
  const blogPosts = [
    {
      id: 1,
      title: 'Tìm hiểu về tương tác thuốc và cách phòng tránh',
      excerpt: 'Tương tác thuốc là hiện tượng xảy ra khi hai hay nhiều loại thuốc được sử dụng cùng lúc và gây ra phản ứng không mong muốn...',
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      date: '10/03/2025',
      category: 'Kiến thức y tế',
      author: 'TS. Nguyễn Văn A'
    },
    {
      id: 2,
      title: 'Cách đọc hiểu thông tin trên bao bì thuốc',
      excerpt: 'Bao bì thuốc chứa nhiều thông tin quan trọng mà người dùng cần biết. Bài viết này sẽ hướng dẫn bạn cách đọc hiểu các thông tin này...',
      image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      date: '05/03/2025',
      category: 'Hướng dẫn',
      author: 'DS. Trần Thị B'
    },
    {
      id: 3,
      title: 'Những điều cần biết về thuốc kháng sinh',
      excerpt: 'Kháng sinh là một trong những phát minh quan trọng nhất của y học hiện đại, nhưng việc sử dụng không đúng cách có thể gây ra nhiều hậu quả...',
      image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      date: '01/03/2025',
      category: 'Kiến thức y tế',
      author: 'PGS.TS. Lê Văn C'
    },
    {
      id: 4,
      title: 'Cập nhật mới nhất về vaccine COVID-19',
      excerpt: 'Những thông tin mới nhất về các loại vaccine COVID-19 đang được sử dụng và hiệu quả của chúng trong việc phòng ngừa các biến thể mới...',
      image: 'https://images.unsplash.com/photo-1605289982774-9a6fef564df8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      date: '25/02/2025',
      category: 'Tin tức',
      author: 'TS. Phạm Thị D'
    },
    {
      id: 5,
      title: 'Bảo quản thuốc đúng cách trong mùa hè',
      excerpt: 'Nhiệt độ cao trong mùa hè có thể ảnh hưởng đến chất lượng thuốc. Bài viết này sẽ hướng dẫn bạn cách bảo quản thuốc đúng cách...',
      image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      date: '20/02/2025',
      category: 'Hướng dẫn',
      author: 'DS. Hoàng Văn E'
    },
    {
      id: 6,
      title: 'Sử dụng thuốc an toàn cho phụ nữ mang thai',
      excerpt: 'Phụ nữ mang thai cần đặc biệt thận trọng khi sử dụng thuốc. Bài viết này sẽ cung cấp những thông tin quan trọng về việc sử dụng thuốc an toàn...',
      image: 'https://images.unsplash.com/photo-1516714819001-9ddd21c95acb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      date: '15/02/2025',
      category: 'Kiến thức y tế',
      author: 'TS. Nguyễn Thị F'
    }
  ];

  // Danh sách các danh mục
  const categories = [
    'Tất cả',
    'Kiến thức y tế',
    'Hướng dẫn',
    'Tin tức',
    'Nghiên cứu',
    'Sức khỏe'
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
            mb: 6,
            background: 'linear-gradient(90deg, #009688 0%, #4db6ac 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Blog Kiến Thức Y Dược
        </Typography>

        {/* Thanh tìm kiếm và bộ lọc */}
        <Box sx={{ mb: 6 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm bài viết..."
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {categories.map((category, index) => (
                  <Chip 
                    key={index} 
                    label={category} 
                    clickable
                    color={index === 0 ? "primary" : "default"}
                    sx={{ mb: 1 }}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Bài viết nổi bật */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
            Bài Viết Nổi Bật
          </Typography>
          <Card sx={{ display: { xs: 'block', md: 'flex' }, boxShadow: 3 }}>
            <CardMedia
              component="img"
              sx={{ width: { xs: '100%', md: '50%' }, height: { xs: 240, md: 'auto' } }}
              image="https://images.unsplash.com/photo-1631549916768-4119b4123a21?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
              alt="Bài viết nổi bật"
            />
            <CardContent sx={{ flex: '1 0 auto', p: 4 }}>
              <Chip label="Đặc biệt" color="primary" size="small" sx={{ mb: 2 }} />
              <Typography variant="h4" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                Những tiến bộ mới nhất trong điều trị bệnh tiểu đường
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Nghiên cứu mới đây đã mang lại những tiến bộ đáng kể trong việc điều trị bệnh tiểu đường, mở ra hy vọng mới cho hàng triệu bệnh nhân trên toàn thế giới. Bài viết này sẽ cung cấp thông tin chi tiết về các phương pháp điều trị mới nhất...
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Đăng bởi: GS.TS. Nguyễn Văn X - 12/03/2025
                </Typography>
                <Button variant="contained" color="primary">
                  Đọc tiếp
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Danh sách bài viết */}
        <Typography variant="h5" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
          Bài Viết Mới Nhất
        </Typography>
        <Grid container spacing={4}>
          {blogPosts.map((post) => (
            <Grid item xs={12} sm={6} md={4} key={post.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 2 }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={post.image}
                  alt={post.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ mb: 1 }}>
                    <Chip 
                      label={post.category} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                  </Box>
                  <Typography variant="h6" component="h3" sx={{ mb: 1, fontWeight: 600 }}>
                    {post.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {post.excerpt}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      {post.date} • {post.author}
                    </Typography>
                    <Button size="small" color="primary">
                      Đọc tiếp
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Nút phân trang */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
          <Button variant="outlined" color="primary" sx={{ mx: 1 }}>
            Trang trước
          </Button>
          <Button variant="contained" color="primary" sx={{ mx: 1 }}>
            1
          </Button>
          <Button variant="outlined" color="primary" sx={{ mx: 1 }}>
            2
          </Button>
          <Button variant="outlined" color="primary" sx={{ mx: 1 }}>
            3
          </Button>
          <Button variant="outlined" color="primary" sx={{ mx: 1 }}>
            Trang sau
          </Button>
        </Box>

        {/* Đăng ký nhận bản tin */}
        <Box sx={{ mt: 10, mb: 6, p: 4, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 3 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                Đăng ký nhận bản tin
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Nhận thông tin mới nhất về y dược học và các bài viết hữu ích qua email.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  placeholder="Email của bạn"
                  variant="outlined"
                  size="small"
                />
                <Button variant="contained" color="primary">
                  Đăng ký
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}

export default Blog; 