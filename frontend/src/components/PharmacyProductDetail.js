import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Stack,
  Chip,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ImageList,
  ImageListItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton, // Added for potential actions like wishlist
  styled,   // Added for styling HTML content
  useTheme, // Added for theme access
  useMediaQuery // Added for responsiveness
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  LocalPharmacy as LocalPharmacyIcon,
  CheckCircleOutline as CheckCircleOutlineIcon, // Use outline version for lists
  WarningAmber as WarningAmberIcon, // Amber color for warnings
  InfoOutlined as InfoOutlinedIcon, // Outline version
  ErrorOutline as ErrorOutlineIcon,
  MedicalServicesOutlined as MedicalServicesOutlinedIcon, // Outline version
  FavoriteBorder as FavoriteBorderIcon,
  Favorite as FavoriteIcon, // For filled state
  ShoppingCartOutlined as ShoppingCartOutlinedIcon, // Outline version
  StorefrontOutlined as StorefrontOutlinedIcon, // Outline version
  LocalShippingOutlined as LocalShippingOutlinedIcon, // Outline version
  ListAlt as ListAltIcon, // For Ingredients/Details
  HelpOutline as HelpOutlineIcon, // For FAQ
  DescriptionOutlined as DescriptionOutlinedIcon, // For Description
  ScienceOutlined as ScienceOutlinedIcon, // For Ingredients
  HealingOutlined as HealingOutlinedIcon, // For Usage/Purpose
  PlaylistAddCheckOutlined as PlaylistAddCheckOutlinedIcon, // For Instructions
  ReportProblemOutlined as ReportProblemOutlinedIcon, // For Precautions
  FactoryOutlined as FactoryOutlinedIcon, // For Manufacturer Info
} from '@mui/icons-material';
import axiosInstance from '../axios-config'; // Assuming this is correctly configured

// --- Styled Components ---

// Styled container for dangerouslySetInnerHTML content
const StyledHtmlContainer = styled(Box)(({ theme }) => ({
  '& h2': {
    ...theme.typography.h6,
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(1.5),
    color: theme.palette.primary.dark,
    borderBottom: `2px solid ${theme.palette.primary.light}`,
    paddingBottom: theme.spacing(0.5),
  },
  '& h3': {
    ...theme.typography.subtitle1,
    marginTop: theme.spacing(2.5),
    marginBottom: theme.spacing(1),
    fontWeight: 'bold',
    color: theme.palette.text.primary,
  },
  '& p': {
    ...theme.typography.body1,
    marginBottom: theme.spacing(1.5),
    lineHeight: 1.7,
    textAlign: 'justify',
  },
  '& ul, & ol': {
    paddingLeft: theme.spacing(3),
    marginBottom: theme.spacing(1.5),
  },
  '& li': {
    marginBottom: theme.spacing(1),
    lineHeight: 1.6,
  },
  '& strong': {
    fontWeight: 600,
  },
  '& a': {
    color: theme.palette.primary.main,
    textDecoration: 'underline',
    '&:hover': {
      color: theme.palette.primary.dark,
    },
  },
  '& table': {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
  },
  '& th, & td': {
    border: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(1, 1.5),
    textAlign: 'left',
    ...theme.typography.body2,
  },
  '& th': {
    backgroundColor: theme.palette.grey[100],
    fontWeight: 'bold',
  },
  '& tr:nth-of-type(even)': {
    backgroundColor: theme.palette.action.hover,
  },
}));

// Custom TabPanel (no changes needed here)
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3, px: { xs: 0, sm: 3 } }}>{children}</Box>}
    </div>
  );
}

// --- Main Component ---

const PharmacyProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('md'));

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false); // Example state

  useEffect(() => {
    const fetchProductDetail = async () => {
      if (!slug) return;
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get(`/api/pharmacy/product/${slug}`);
        if (response.data.success) {
          setProduct(response.data.data);
          // Reset selected image if product changes
          setSelectedImage(0);
          // You might fetch favorite status here too
        } else {
          setError(response.data.message || 'Không thể tải thông tin sản phẩm');
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
        if (error.userMessage) {
          setError(error.userMessage);
        } else if (error.code === 'ERR_NETWORK') {
          setError('Lỗi mạng. Không thể kết nối đến máy chủ. Vui lòng thử lại.');
        } else if (error.response?.status === 404) {
          setError('Sản phẩm không tồn tại hoặc đã bị xóa.');
        } else {
          setError(`Lỗi ${error.response?.status || ''}: Không thể tải dữ liệu sản phẩm. Vui lòng thử lại.`);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetail();
  }, [slug]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleGoBack = () => {
    navigate(-1); // Go back to the previous page in history
  };

  const handleImageSelect = (index) => {
    setSelectedImage(index);
  };



  // Format price - improved robustness
  const formatPrice = (price) => {
    if (!price || price === 'Not found' || price === '60 ₫') return 'Liên hệ';
    // Remove currency symbol, non-breaking spaces, and trim
    const cleanedPrice = price.replace(/đ|\s/g, '').trim();
    const number = parseInt(cleanedPrice, 10);
    if (isNaN(number) || number === 60) return 'Liên hệ';
    // Format with Vietnamese Dong symbol
    return number.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };

  // Handle product status display - simplified to show only prescription status
  const getProductStatus = (product) => {
    // For prescription medication
    if (product.isPrescription) {
      return { label: "Thuốc kê đơn", color: "warning" };
    } 
    // No other status needed
    return null;
  };

  // Render list items using MUI List for better structure and styling
  const renderListItems = (items, icon = <CheckCircleOutlineIcon color="success" sx={{ fontSize: '1.1rem' }} />) => {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return <Typography variant="body2" color="text.secondary" fontStyle="italic">Không có thông tin.</Typography>;
    }
    return (
      <List dense disablePadding sx={{ pl: 1 }}>
        {items.map((item, index) => (
          <ListItem key={index} disableGutters sx={{ alignItems: 'flex-start', paddingBottom: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>{icon}</ListItemIcon>
            <ListItemText primary={item} primaryTypographyProps={{ variant: 'body1', lineHeight: 1.6 }} />
          </ListItem>
        ))}
      </List>
    );
  };

  // Render ingredients table using MUI Table
  const renderIngredientsTable = (ingredients) => {
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return <Typography variant="body2" color="text.secondary" fontStyle="italic">Không có thông tin thành phần.</Typography>;
    }
    return (
      <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: 'grey.100' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Thành phần</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Hàm lượng</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ingredients.map((item, index) => {
              const parts = item.split(':');
              const ingredient = parts[0]?.trim() || item;
              const amount = parts.length > 1 ? parts[1].trim() : ' '; // Keep empty space for alignment
              return (
                <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell component="th" scope="row">{ingredient}</TableCell>
                  <TableCell align="right">{amount}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // Render product details in a structured way
  const renderProductDetails = (details) => {
    if (!details || Object.keys(details).length === 0) return null;
    const detailItems = [
      { label: 'Tên đầy đủ', value: details.fullName },
      { label: 'Danh mục', value: details.category },
      { label: 'Công dụng chính', value: details.purpose },
      { label: 'Nhà sản xuất', value: details.manufacturer },
      { label: 'Quy cách', value: details.specification },
      { label: 'Lưu ý bảo quản', value: details.notice },
    ].filter(item => item.value && item.value !== 'Không tìm thấy!'); // Filter out empty details

    if (detailItems.length === 0) return null;

    return (
      <Grid container spacing={2}>
        {detailItems.map((item, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Typography variant="body2" fontWeight="bold" color="text.secondary" gutterBottom>
              {item.label}
            </Typography>
            <Typography variant="body1">{item.value}</Typography>
          </Grid>
        ))}
      </Grid>
    );
  };

  // Render content, prioritizing HTML if available, otherwise use structured data
  const renderTabContent = (htmlContent, structuredContentRenderer, structuredData, title, fallbackText) => {
    if (htmlContent) {
      return <StyledHtmlContainer dangerouslySetInnerHTML={{ __html: htmlContent }} />;
    } else if (structuredData && (!Array.isArray(structuredData) || structuredData.length > 0)) {
      return (
        <>
          <Typography variant="h6" component="h2" gutterBottom>{title}</Typography>
          {structuredContentRenderer(structuredData)}
        </>
      );
    } else {
      return <Typography variant="body2" color="text.secondary" fontStyle="italic">{fallbackText || 'Chưa có thông tin chi tiết.'}</Typography>;
    }
  };

  // Render consolidated product info that combines name, brand, and details
  const renderConsolidatedProductInfo = (product) => {
    return (
      <Grid container spacing={isMobile ? 1 : 2}>
        {/* Center content vertically in the container */}
        <Grid item xs={12} sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%'
        }}>
          {/* Product title centered in the grid */}
          <Box sx={{ width: '100%', textAlign: 'center', mb: isMobile ? 2 : 4 }}>
            <Typography 
              variant={isMobile ? "h6" : "h5"} 
              component="h2" 
              gutterBottom
              sx={{ fontWeight: 'medium' }}
            >
              {product.name}
            </Typography>
            
            {product.brand && (
              <Typography 
                variant={isMobile ? "body2" : "subtitle1"} 
                color="text.secondary" 
                gutterBottom
              >
                Thương hiệu: {product.brand}
              </Typography>
            )}
          </Box>
          
          {/* Summary Table - centered width */}
          <TableContainer 
            component={Paper} 
            variant="outlined" 
            sx={{ 
              mb: isMobile ? 2 : 3, 
              maxWidth: '100%',
              mx: 'auto'
            }}
          >
            <Table size="small">
              <TableBody>
                {product.isPrescription && (
                  <TableRow>
                    <TableCell component="th" sx={{ 
                      width: isMobile ? '40%' : '30%', 
                      bgcolor: 'grey.50', 
                      fontWeight: 'medium',
                      py: isMobile ? 1 : 1.5,
                      px: isMobile ? 1 : 2
                    }}>
                      Phân loại
                    </TableCell>
                    <TableCell sx={{ py: isMobile ? 1 : 1.5, px: isMobile ? 1 : 2 }}>
                      <Chip 
                        icon={<ReportProblemOutlinedIcon fontSize="small" />}
                        label="Thuốc kê đơn"
                        size="small"
                        color="warning"
                      />
                    </TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell component="th" sx={{ 
                    width: isMobile ? '40%' : '30%', 
                    bgcolor: 'grey.50', 
                    fontWeight: 'medium',
                    py: isMobile ? 1 : 1.5,
                    px: isMobile ? 1 : 2
                  }}>
                    Tên sản phẩm
                  </TableCell>
                  <TableCell sx={{ py: isMobile ? 1 : 1.5, px: isMobile ? 1 : 2 }}>{product.name}</TableCell>
                </TableRow>
                {product.brand && (
                  <TableRow>
                    <TableCell component="th" sx={{ 
                      bgcolor: 'grey.50', 
                      fontWeight: 'medium',
                      py: isMobile ? 1 : 1.5,
                      px: isMobile ? 1 : 2
                    }}>
                      Thương hiệu
                    </TableCell>
                    <TableCell sx={{ py: isMobile ? 1 : 1.5, px: isMobile ? 1 : 2 }}>{product.brand}</TableCell>
                  </TableRow>
                )}
                {product.details?.category && (
                  <TableRow>
                    <TableCell component="th" sx={{ 
                      bgcolor: 'grey.50', 
                      fontWeight: 'medium',
                      py: isMobile ? 1 : 1.5,
                      px: isMobile ? 1 : 2
                    }}>
                      Danh mục
                    </TableCell>
                    <TableCell sx={{ py: isMobile ? 1 : 1.5, px: isMobile ? 1 : 2 }}>{product.details.category}</TableCell>
                  </TableRow>
                )}
                {product.details?.manufacturer && (
                  <TableRow>
                    <TableCell component="th" sx={{ 
                      bgcolor: 'grey.50', 
                      fontWeight: 'medium',
                      py: isMobile ? 1 : 1.5,
                      px: isMobile ? 1 : 2
                    }}>
                      Nhà sản xuất
                    </TableCell>
                    <TableCell sx={{ py: isMobile ? 1 : 1.5, px: isMobile ? 1 : 2 }}>{product.details.manufacturer}</TableCell>
                  </TableRow>
                )}
                {product.details?.specification && (
                  <TableRow>
                    <TableCell component="th" sx={{ 
                      bgcolor: 'grey.50', 
                      fontWeight: 'medium',
                      py: isMobile ? 1 : 1.5,
                      px: isMobile ? 1 : 2
                    }}>
                      Quy cách
                    </TableCell>
                    <TableCell sx={{ py: isMobile ? 1 : 1.5, px: isMobile ? 1 : 2 }}>{product.details.specification}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Medical disclaimer - centered width */}
          <Box sx={{
            mt: isMobile ? 1 : 2,
            p: isMobile ? 1.5 : 2,
            bgcolor: 'action.hover',
            borderRadius: 1,
            maxWidth: '100%',
            mx: 'auto'
          }}>
            <Typography variant={isMobile ? "caption" : "body2"} color="text.secondary" align="center">
              <ReportProblemOutlinedIcon 
                fontSize={isMobile ? "inherit" : "small"} 
                sx={{ verticalAlign: 'middle', mr: 0.5, fontSize: isMobile ? '0.875rem' : '1rem' }} 
              />
              Sản phẩm này chỉ bán khi có chỉ định của bác sĩ, mọi thông tin trên đây chỉ mang tính chất tham khảo. Vui lòng đọc kỹ thông tin chi tiết ở tờ hướng dẫn sử dụng của sản phẩm.
            </Typography>
          </Box>
        </Grid>
      </Grid>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 1.5, md: 4 }, px: { xs: 1.5, sm: 2, md: 3 } }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={handleGoBack}
        sx={{ mb: 1.5, textTransform: 'none', color: 'text.secondary', fontSize: isMobile ? '0.875rem' : 'inherit' }}
      >
        Quay lại
      </Button>

      {/* Add H1 heading at the top of the page */}
      <Typography 
        variant={isMobile ? "h5" : "h4"} 
        component="h1" 
        align="center" 
        gutterBottom 
        sx={{ 
          mb: isMobile ? 2 : 3, 
          fontWeight: 'bold',
          color: theme.palette.primary.main,
          borderBottom: `2px solid ${theme.palette.divider}`,
          pb: 1
        }}
      >
        Thông tin chi tiết
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, my: 4, textAlign: 'center' }}>
          <ErrorOutlineIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom color="error.dark">
            Đã xảy ra lỗi
          </Typography>
          <Alert severity="error" sx={{ mb: 3, justifyContent: 'center' }}>
            {error}
          </Alert>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleGoBack}
            sx={{ mr: 1 }}
          >
            Quay lại
          </Button>
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
          >
            Thử lại
          </Button>
        </Paper>
      ) : product ? (
        <>
          {/* --- Main Product Section --- */}
          <Paper elevation={2} sx={{ p: { xs: 1.5, sm: 2, md: 3 }, mb: isMobile ? 2 : 4 }}>
            <Grid container spacing={{ xs: 1.5, md: 4 }}>
              {/* Images */}
              <Grid item xs={12} md={5}>
                <Box
                  sx={{
                    position: 'relative',
                    height: { xs: 250, sm: 350, md: 450 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'grey.100',
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: `1px solid ${theme.palette.divider}`,
                    mb: product.images && product.images.length > 1 ? 1 : 0,
                  }}
                >
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[selectedImage]}
                      alt={`${product.name} - ảnh ${selectedImage + 1}`}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                        display: 'block',
                      }}
                    />
                  ) : (
                    <Box sx={{ textAlign: 'center', p: 3, color: 'text.secondary' }}>
                      <LocalPharmacyIcon sx={{ fontSize: isMobile ? 60 : 80, mb: 1 }} />
                      <Typography variant="caption">Không có hình ảnh</Typography>
                    </Box>
                  )}
                </Box>

                {product.images && product.images.length > 1 && (
                   <ImageList cols={isMobile ? 4 : 5} gap={isMobile ? 4 : 8} sx={{ mt: isMobile ? 0.5 : 1 }}>
                   {product.images.map((img, idx) => (
                     <ImageListItem
                       key={idx}
                       onClick={() => handleImageSelect(idx)}
                       sx={{
                         cursor: 'pointer',
                         border: selectedImage === idx ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
                         borderRadius: 1,
                         overflow: 'hidden',
                         aspectRatio: '1 / 1', // Ensure square-ish thumbnails
                         bgcolor: 'white', // Background for transparent images
                         transition: 'border-color 0.2s ease',
                         '&:hover': {
                            borderColor: selectedImage !== idx ? theme.palette.grey[400] : theme.palette.primary.main,
                         }
                       }}
                     >
                       <img
                         src={`${img}?w=80&h=80&fit=crop&auto=format`} // Use query params if CDN supports resizing
                         srcSet={`${img}?w=80&h=80&fit=crop&auto=format&dpr=2 2x`}
                         alt={`Xem ảnh ${idx + 1}`}
                         loading="lazy"
                         style={{
                           width: '100%',
                           height: '100%',
                           objectFit: 'contain',
                           display: 'block',
                         }}
                       />
                     </ImageListItem>
                   ))}
                 </ImageList>
                )}
              </Grid>
              
              {/* Consolidated Product Info Column */}
              <Grid item xs={12} md={7}>
                {renderConsolidatedProductInfo(product)}
              </Grid>
            </Grid>
          </Paper>

          {/* --- Tabs Section --- */}
          <Paper elevation={0} variant="outlined" sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'grey.50' }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile
                aria-label="Chi tiết sản phẩm"
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 'medium',
                    fontSize: isMobile ? '0.75rem' : 'inherit',
                    minWidth: isMobile ? '65px' : '90px',
                    py: isMobile ? 1 : 1.5,
                    px: isMobile ? 1 : 2,
                  },
                  '& .MuiSvgIcon-root': {
                    fontSize: isMobile ? '1.1rem' : '1.25rem',
                    mr: isMobile ? 0.5 : 1,
                  },
                }}
              >
                <Tab icon={<DescriptionOutlinedIcon />} iconPosition="start" label="Mô tả" id="tab-0" />
                <Tab icon={<ScienceOutlinedIcon />} iconPosition="start" label="Thành phần" id="tab-1" />
                <Tab icon={<HealingOutlinedIcon />} iconPosition="start" label="Công dụng" id="tab-2" />
                <Tab icon={<PlaylistAddCheckOutlinedIcon />} iconPosition="start" label={isMobile ? "Cách dùng" : "Cách sử dụng"} id="tab-3" />
                <Tab icon={<ReportProblemOutlinedIcon />} iconPosition="start" label="Lưu ý" id="tab-4" />
                <Tab icon={<FactoryOutlinedIcon />} iconPosition="start" label={isMobile ? "NSX" : "Nhà sản xuất"} id="tab-5" />
                <Tab icon={<HelpOutlineIcon />} iconPosition="start" label="FAQ" id="tab-6" />
              </Tabs>
            </Box>

            {/* Tab Panels - Using StyledHtmlContainer for parsed HTML */}
            <TabPanel value={tabValue} index={0}>
                {renderTabContent(
                    product.moTaHtml,
                    (data) => <Typography variant={isMobile ? "body2" : "body1"} sx={{ lineHeight: 1.7, textAlign: 'justify' }}>{data}</Typography>,
                    product.description,
                    `${product.name} là gì?`,
                    'Chưa có mô tả chi tiết cho sản phẩm này.'
                )}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
                 {renderTabContent(
                    product.thanhPhanHtml,
                    renderIngredientsTable, // Use the MUI table renderer
                    product.ingredients,
                    'Thành phần chính',
                    'Chưa có thông tin thành phần.'
                )}
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
                 {renderTabContent(
                    product.chiDinhHtml,
                    renderListItems, // Use the MUI list renderer
                    product.usage,
                    'Công dụng & Chỉ định',
                    'Chưa có thông tin về công dụng.'
                )}
                 {/* Add Đối tượng sử dụng if available separately */}
                 {product.details?.purpose && !product.chiDinhHtml && (
                     <>
                        <Typography variant="h6" component="h2" sx={{mt: 3}} gutterBottom>Đối tượng sử dụng</Typography>
                        <Typography variant="body1">{product.details.purpose}</Typography>
                     </>
                 )}
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
                {renderTabContent(
                    product.huongDanHtml,
                    (data) => renderListItems(data, <PlaylistAddCheckOutlinedIcon color="info" sx={{ fontSize: '1.1rem' }} />),
                    product.usageInstructions,
                    'Hướng dẫn sử dụng',
                    'Vui lòng xem kỹ thông tin trên bao bì hoặc hỏi dược sĩ.'
                )}
                {product.usageMethod && product.usageMethod !== 'Not found' && !product.huongDanHtml && (
                     <>
                        <Typography variant="h6" component="h2" sx={{mt: 3}} gutterBottom>Cách dùng cụ thể</Typography>
                        <Typography variant="body1">{product.usageMethod}</Typography>
                     </>
                 )}
            </TabPanel>

            <TabPanel value={tabValue} index={4}>
                {renderTabContent(
                    product.thanTrongHtml,
                    (data) => renderListItems(data, <WarningAmberIcon color="warning" sx={{ fontSize: '1.1rem' }} />),
                    product.precautions,
                    'Lưu ý & Thận trọng',
                    'Đọc kỹ hướng dẫn sử dụng trước khi dùng.'
                )}
                 {product.contraindications?.length > 0 && !product.thanTrongHtml && (
                     <>
                        <Typography variant="h6" component="h2" sx={{mt: 3}} gutterBottom>Chống chỉ định</Typography>
                        {renderListItems(product.contraindications, <ErrorOutlineIcon color="error" sx={{ fontSize: '1.1rem' }} />)}
                     </>
                 )}
                 {product.sideEffects?.length > 0 && !product.thanTrongHtml && (
                     <>
                        <Typography variant="h6" component="h2" sx={{mt: 3}} gutterBottom>Tác dụng phụ</Typography>
                        {renderListItems(product.sideEffects, <InfoOutlinedIcon color="info" sx={{ fontSize: '1.1rem' }} />)}
                     </>
                 )}
            </TabPanel>

            <TabPanel value={tabValue} index={5}>
               {renderTabContent(
                    product.thongTinSanXuatHtml,
                    (details) => ( // Custom renderer for this tab if no HTML
                        <List dense disablePadding>
                             {details.manufacturer && <ListItem><ListItemText primary="Nhà sản xuất" secondary={details.manufacturer} /></ListItem>}
                             {details.specification && <ListItem><ListItemText primary="Quy cách" secondary={details.specification} /></ListItem>}
                             {details.category && <ListItem><ListItemText primary="Danh mục" secondary={details.category} /></ListItem>}
                             {details.notice && <ListItem><ListItemText primary="Bảo quản" secondary={details.notice} /></ListItem>}
                        </List>
                    ),
                    product.details, // Pass details object here
                    'Thông tin sản xuất & Bảo quản',
                    'Chưa có thông tin chi tiết về nhà sản xuất.'
                )}
                 {/* Fallback if no HTML and no details */}
                 {!product.thongTinSanXuatHtml && !product.details && product.brand && (
                     <Typography variant="body1">Nhà sản xuất: {product.brand}</Typography>
                 )}
            </TabPanel>

            <TabPanel value={tabValue} index={6}>
               {renderTabContent(
                    product.cauHoiThuongGapHtml,
                    () => ( // Default FAQ content renderer
                      <Box>
                        <Typography variant="h6" component="h3" gutterBottom>Mua {product.name} ở đâu?</Typography>
                        <Typography paragraph>Bạn có thể tìm mua {product.name} tại các nhà thuốc uy tín trên toàn quốc hoặc đặt hàng trực tuyến qua các sàn thương mại điện tử dược phẩm.</Typography>
                        <Typography variant="h6" component="h3" gutterBottom>Giá {product.name} bao nhiêu?</Typography>
                        <Typography paragraph>Giá tham khảo của sản phẩm là {formatPrice(product.price)}. Giá bán thực tế có thể khác nhau tùy thuộc vào nhà thuốc và chương trình khuyến mãi.</Typography>
                        {product.details?.specification && (
                            <>
                                <Typography variant="h6" component="h3" gutterBottom>Quy cách đóng gói?</Typography>
                                <Typography paragraph>{product.details.specification}.</Typography>
                            </>
                         )}
                      </Box>
                    ),
                    true, // Indicate that there's always some default content
                    'Câu hỏi thường gặp (FAQ)',
                    'Chưa có câu hỏi thường gặp nào cho sản phẩm này.'
                )}
            </TabPanel>
          </Paper>
        </>
      ) : null}
    </Container>
  );
};

export default PharmacyProductDetail;