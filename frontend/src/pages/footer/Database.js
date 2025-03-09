import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  TextField,
  InputAdornment,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Divider,
  LinearProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Download as DownloadIcon,
  Info as InfoIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';

function Database() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Dữ liệu mẫu cho các nguồn dữ liệu
  const dataSources = [
    {
      id: 1,
      name: 'FDA Drug Database',
      description: 'Cơ sở dữ liệu thuốc từ Cục Quản lý Thực phẩm và Dược phẩm Hoa Kỳ (FDA)',
      records: '125,000+',
      lastUpdated: '15/03/2025',
      format: 'JSON, CSV',
      category: 'Quốc tế'
    },
    {
      id: 2,
      name: 'Dược thư Quốc gia Việt Nam',
      description: 'Thông tin chi tiết về các loại thuốc được phép lưu hành tại Việt Nam',
      records: '45,000+',
      lastUpdated: '10/03/2025',
      format: 'JSON, XML',
      category: 'Việt Nam'
    },
    {
      id: 3,
      name: 'Long Châu Drug Database',
      description: 'Dữ liệu thuốc và sản phẩm y tế từ hệ thống nhà thuốc Long Châu',
      records: '30,000+',
      lastUpdated: '12/03/2025',
      format: 'JSON, CSV',
      category: 'Việt Nam'
    },
    {
      id: 4,
      name: 'WHO Essential Medicines',
      description: 'Danh sách thuốc thiết yếu của Tổ chức Y tế Thế giới (WHO)',
      records: '15,000+',
      lastUpdated: '01/03/2025',
      format: 'JSON, CSV, XML',
      category: 'Quốc tế'
    },
    {
      id: 5,
      name: 'European Medicines Agency',
      description: 'Cơ sở dữ liệu thuốc từ Cơ quan Dược phẩm Châu Âu (EMA)',
      records: '85,000+',
      lastUpdated: '05/03/2025',
      format: 'JSON, CSV',
      category: 'Quốc tế'
    }
  ];

  // Dữ liệu mẫu cho bảng thuốc
  const drugSampleData = [
    { id: 1, name: 'Paracetamol', category: 'Giảm đau, hạ sốt', manufacturer: 'Công ty Dược phẩm A', dosage: '500mg', format: 'Viên nén' },
    { id: 2, name: 'Amoxicillin', category: 'Kháng sinh', manufacturer: 'Công ty Dược phẩm B', dosage: '250mg', format: 'Viên nang' },
    { id: 3, name: 'Omeprazole', category: 'Ức chế bơm proton', manufacturer: 'Công ty Dược phẩm C', dosage: '20mg', format: 'Viên nén bao phim' },
    { id: 4, name: 'Loratadine', category: 'Kháng histamine', manufacturer: 'Công ty Dược phẩm D', dosage: '10mg', format: 'Viên nén' },
    { id: 5, name: 'Metformin', category: 'Điều trị đái tháo đường', manufacturer: 'Công ty Dược phẩm E', dosage: '500mg', format: 'Viên nén' },
    { id: 6, name: 'Atorvastatin', category: 'Statin', manufacturer: 'Công ty Dược phẩm F', dosage: '10mg', format: 'Viên nén bao phim' },
    { id: 7, name: 'Losartan', category: 'Đối kháng thụ thể angiotensin II', manufacturer: 'Công ty Dược phẩm G', dosage: '50mg', format: 'Viên nén' }
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
          Cơ Sở Dữ Liệu Y Dược
        </Typography>
        
        <Typography 
          variant="subtitle1" 
          align="center" 
          color="text.secondary"
          sx={{ mb: 6 }}
        >
          Truy cập thông tin thuốc từ nhiều nguồn dữ liệu uy tín trong nước và quốc tế
        </Typography>

        {/* Thanh tìm kiếm */}
        <Box sx={{ mb: 6 }}>
          <Card sx={{ p: 3, boxShadow: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  placeholder="Tìm kiếm thuốc, hoạt chất, nhà sản xuất..."
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
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    variant="outlined" 
                    startIcon={<FilterListIcon />}
                    fullWidth
                  >
                    Bộ lọc
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary"
                    fullWidth
                  >
                    Tìm kiếm
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Card>
        </Box>

        {/* Tabs */}
        <Box sx={{ mb: 4 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            centered
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab label="Nguồn dữ liệu" />
            <Tab label="Dữ liệu mẫu" />
            <Tab label="API" />
          </Tabs>
        </Box>

        {/* Tab content */}
        <Box sx={{ mb: 6 }}>
          {/* Tab 1: Nguồn dữ liệu */}
          {tabValue === 0 && (
            <Grid container spacing={3}>
              {dataSources.map((source) => (
                <Grid item xs={12} key={source.id}>
                  <Card sx={{ boxShadow: 2 }}>
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={8}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mr: 1 }}>
                              {source.name}
                            </Typography>
                            <Chip 
                              label={source.category} 
                              size="small" 
                              color="primary" 
                              variant="outlined" 
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {source.description}
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            <Typography variant="body2">
                              <strong>Số bản ghi:</strong> {source.records}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Cập nhật:</strong> {source.lastUpdated}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Định dạng:</strong> {source.format}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          <Box>
                            <Button 
                              variant="outlined" 
                              startIcon={<InfoIcon />}
                              sx={{ mr: 1 }}
                            >
                              Chi tiết
                            </Button>
                            <Button 
                              variant="contained" 
                              color="primary"
                              startIcon={<DownloadIcon />}
                            >
                              Tải xuống
                            </Button>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Tab 2: Dữ liệu mẫu */}
          {tabValue === 1 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Dữ liệu mẫu từ cơ sở dữ liệu thuốc
              </Typography>
              <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
                <Table>
                  <TableHead sx={{ bgcolor: 'primary.main' }}>
                    <TableRow>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tên thuốc</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Phân loại</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nhà sản xuất</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Hàm lượng</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Dạng bào chế</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {drugSampleData.map((drug) => (
                      <TableRow key={drug.id} hover>
                        <TableCell><strong>{drug.name}</strong></TableCell>
                        <TableCell>{drug.category}</TableCell>
                        <TableCell>{drug.manufacturer}</TableCell>
                        <TableCell>{drug.dosage}</TableCell>
                        <TableCell>{drug.format}</TableCell>
                        <TableCell>
                          <Button size="small" color="primary">
                            Xem chi tiết
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button variant="outlined">Xem thêm dữ liệu</Button>
              </Box>
            </Box>
          )}

          {/* Tab 3: API */}
          {tabValue === 2 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3 }}>
                API Documentation
              </Typography>
              <Card sx={{ mb: 4, boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                    Tổng quan
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    BiiterNCKH cung cấp API để truy cập vào cơ sở dữ liệu thuốc. API này cho phép các nhà phát triển tích hợp dữ liệu thuốc vào ứng dụng của họ.
                  </Typography>
                  <Typography variant="body2">
                    Base URL: <code>https://api.biiterr.com/v1</code>
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={{ mb: 4, boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                    Xác thực
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Tất cả các yêu cầu API đều yêu cầu khóa API. Bạn có thể lấy khóa API bằng cách đăng ký tài khoản nhà phát triển.
                  </Typography>
                  <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, mb: 2 }}>
                    <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace' }}>
                      {`GET /drugs?api_key=YOUR_API_KEY`}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              <Card sx={{ boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                    Endpoints
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      GET /drugs
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Trả về danh sách thuốc với các tùy chọn lọc và phân trang.
                    </Typography>
                    <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
                      <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace' }}>
                        {`GET /drugs?limit=10&offset=0&search=paracetamol`}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      GET /drugs/{'{id}'}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Trả về thông tin chi tiết về một loại thuốc cụ thể.
                    </Typography>
                    <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
                      <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace' }}>
                        {`GET /drugs/12345`}
                      </Typography>
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      GET /interactions
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Kiểm tra tương tác giữa các loại thuốc.
                    </Typography>
                    <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1 }}>
                      <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace' }}>
                        {`GET /interactions?drug1=12345&drug2=67890`}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}
        </Box>

        {/* Thống kê */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 4, fontWeight: 600 }}>
            Thống kê dữ liệu
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ p: 3, boxShadow: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
                  300,000+
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Bản ghi thuốc
                </Typography>
                <LinearProgress variant="determinate" value={100} sx={{ mt: 2 }} />
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ p: 3, boxShadow: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
                  5+
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Nguồn dữ liệu
                </Typography>
                <LinearProgress variant="determinate" value={70} sx={{ mt: 2 }} />
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ p: 3, boxShadow: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
                  50,000+
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tương tác thuốc
                </Typography>
                <LinearProgress variant="determinate" value={85} sx={{ mt: 2 }} />
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ p: 3, boxShadow: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
                  Hàng ngày
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cập nhật dữ liệu
                </Typography>
                <LinearProgress variant="determinate" value={90} sx={{ mt: 2 }} />
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* CTA */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Card sx={{ p: 4, bgcolor: 'primary.light', color: 'white', boxShadow: 3 }}>
            <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
              Bạn muốn sử dụng dữ liệu của chúng tôi?
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Đăng ký tài khoản nhà phát triển để truy cập API và tải xuống dữ liệu
            </Typography>
            <Button 
              variant="contained" 
              color="secondary"
              size="large"
              endIcon={<ArrowForwardIcon />}
              sx={{ px: 4 }}
            >
              Đăng ký ngay
            </Button>
          </Card>
        </Box>
      </Container>
    </Box>
  );
}

export default Database; 