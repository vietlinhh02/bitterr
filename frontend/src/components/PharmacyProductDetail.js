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
  ImageListItem
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  LocalPharmacy as LocalPharmacyIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ErrorOutline as ErrorOutlineIcon,
  MedicalServices as MedicalServicesIcon,
  FavoriteBorder as FavoriteBorderIcon,
  ShoppingCart as ShoppingCartIcon,
  Store as StoreIcon,
  LocalShipping as LocalShippingIcon
} from '@mui/icons-material';
import axiosInstance from '../axios-config';

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
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const PharmacyProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchProductDetail = async () => {
      if (!slug) return;

      setLoading(true);
      setError(null);

      try {
        const response = await axiosInstance.get(`/api/pharmacy/product/${slug}`);
        
        if (response.data.success) {
          setProduct(response.data.data);
        } else {
          setError(response.data.message || 'Không thể tải thông tin sản phẩm');
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
        
        // Sử dụng thông báo lỗi từ axios interceptor nếu có
        if (error.userMessage) {
          setError(error.userMessage);
        } else if (error.code === 'ERR_NETWORK') {
          setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại sau.');
        } else if (error.response) {
          if (error.response.status === 404) {
            setError('Không tìm thấy sản phẩm này. Vui lòng kiểm tra lại đường dẫn hoặc tìm kiếm sản phẩm khác.');
          } else {
            setError(`Lỗi ${error.response.status}: ${error.response.data?.message || 'Đã xảy ra lỗi khi tải thông tin sản phẩm'}`);
          }
        } else {
          setError('Đã xảy ra lỗi khi tải thông tin sản phẩm. Vui lòng thử lại sau.');
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
    navigate(-1);
  };

  const handleImageSelect = (index) => {
    setSelectedImage(index);
  };

  // Format price
  const formatPrice = (price) => {
    if (!price || price === 'Not found') return 'Liên hệ';
    return price.replace(/\s+đ/g, 'đ');
  };

  // Thêm hàm xử lý HTML đã được parse với styling tốt hơn
  const parseHtml = (htmlString) => {
    if (!htmlString) return null;
    return (
      <div 
        className="product-html-content"
        dangerouslySetInnerHTML={{ 
          __html: htmlString 
        }} 
      />
    );
  };

  // Render danh sách thông tin với styling tốt hơn
  const renderListItems = (items) => {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return <Typography variant="body2" color="text.secondary" fontStyle="italic">Không có thông tin</Typography>;
    }

    return (
      <ul className="styled-list">
        {items.map((item, index) => (
          <li key={index} className="styled-list-item">
            <Typography 
              variant="body2" 
              component="span"
              className="list-item-text"
            >
              {item}
            </Typography>
          </li>
        ))}
      </ul>
    );
  };

  // Hiển thị bảng thành phần với styling tốt hơn
  const renderIngredientsTable = (ingredients) => {
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return <Typography variant="body2" color="text.secondary" fontStyle="italic">Không có thông tin thành phần</Typography>;
    }

    return (
      <Box className="ingredient-table-container">
        <table className="ingredient-table">
          <thead>
            <tr>
              <th className="ingredient-header">Thành phần</th>
              <th className="ingredient-header value-column">Hàm lượng</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map((item, index) => {
              // Phân tách thành phần và hàm lượng
              const parts = item.split(':');
              const ingredient = parts[0] ? parts[0].trim() : item;
              const amount = parts.length > 1 ? parts[1].trim() : '';
              
              return (
                <tr key={index} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                  <td className="ingredient-cell">{ingredient}</td>
                  <td className="ingredient-cell value-column">{amount}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Box>
    );
  };

  // Hiển thị chi tiết sản phẩm dạng grid với styling tốt hơn
  const renderProductDetails = (details) => {
    if (!details || Object.keys(details).length === 0) {
      return null;
    }

    return (
      <Box className="product-details-container">
        <div className="product-details-grid">
          {details.fullName && (
            <div className="product-detail-row">
              <Typography className="detail-label">Tên sản phẩm</Typography>
              <Typography className="detail-value">{details.fullName}</Typography>
            </div>
          )}
          
          {details.category && (
            <div className="product-detail-row">
              <Typography className="detail-label">Danh mục</Typography>
              <Typography className="detail-value">{details.category}</Typography>
            </div>
          )}
          
          {details.purpose && (
            <div className="product-detail-row">
              <Typography className="detail-label">Công dụng</Typography>
              <Typography className="detail-value">{details.purpose}</Typography>
            </div>
          )}
          
          {details.manufacturer && (
            <div className="product-detail-row">
              <Typography className="detail-label">Nhà sản xuất</Typography>
              <Typography className="detail-value">{details.manufacturer}</Typography>
            </div>
          )}
          
          {details.specification && (
            <div className="product-detail-row">
              <Typography className="detail-label">Quy cách</Typography>
              <Typography className="detail-value">{details.specification}</Typography>
            </div>
          )}
          
          {details.notice && (
            <div className="product-detail-row">
              <Typography className="detail-label">Lưu ý</Typography>
              <Typography className="detail-value">{details.notice}</Typography>
            </div>
          )}
        </div>
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={handleGoBack}
        variant="text"
        sx={{ mb: 2 }}
      >
        Quay lại
      </Button>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ my: 4 }}>
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={() => window.location.reload()}
              >
                Thử lại
              </Button>
            }
          >
            {error}
          </Alert>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <LocalPharmacyIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Không thể tải thông tin sản phẩm
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Bạn có thể thử lại sau hoặc tìm kiếm sản phẩm khác.
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<ArrowBackIcon />} 
              onClick={handleGoBack}
            >
              Quay lại trang trước
            </Button>
          </Paper>
        </Box>
      ) : product ? (
        <>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Grid container spacing={4}>
              {/* Product Images */}
              <Grid item xs={12} md={5}>
                <Box
                  sx={{
                    mb: 2,
                    height: 400,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#f8f9fa',
                    borderRadius: 1
                  }}
                >
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[selectedImage]}
                      alt={product.name}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain'
                      }}
                    />
                  ) : (
                    <Box sx={{ textAlign: 'center', p: 3 }}>
                      <LocalPharmacyIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="body2" color="text.secondary">
                        Không có hình ảnh
                      </Typography>
                    </Box>
                  )}
                </Box>

                {product.images && product.images.length > 1 && (
                  <ImageList 
                    cols={4} 
                    rowHeight={80}
                    sx={{ 
                      mt: 1, 
                      '&::-webkit-scrollbar': { height: 8 },
                      '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 4 }
                    }}
                  >
                    {product.images.map((img, idx) => (
                      <ImageListItem 
                        key={idx}
                        onClick={() => handleImageSelect(idx)}
                        sx={{ 
                          cursor: 'pointer',
                          border: selectedImage === idx ? '2px solid #009688' : '1px solid #e0e0e0',
                          borderRadius: 1,
                          overflow: 'hidden'
                        }}
                      >
                        <img
                          src={img}
                          alt={`Hình ${idx + 1}`}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'contain' 
                          }}
                        />
                      </ImageListItem>
                    ))}
                  </ImageList>
                )}
              </Grid>

              {/* Product Info */}
              <Grid item xs={12} md={7}>
                <Typography variant="h4" gutterBottom>
                  {product.name}
                </Typography>
                
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  <Chip 
                    icon={<LocalPharmacyIcon />} 
                    label={product.brand || 'Không rõ thương hiệu'} 
                    color="primary" 
                    variant="outlined"
                  />
                  {product.sku && product.sku !== 'Not found' && (
                    <Chip label={`SKU: ${product.sku}`} color="default" variant="outlined" />
                  )}
                </Stack>

                {/* Thông tin giá và giảm giá */}
                {product.discount && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <span className="rounded-sm py-[2px] text-xs font-medium bg-pink-600 px-1 text-white">
                      {product.discount}
                    </span>
                    {product.originalPrice && (
                      <del className="ml-1 text-sm font-semibold text-neutral-600 md:ml-2 md:text-xl">
                        {product.originalPrice}
                      </del>
                    )}
                  </Box>
                )}

                <Typography variant="h5" color="primary.main" sx={{ mb: 3 }}>
                  {formatPrice(product.price)}
                </Typography>

                {/* Thông tin lượt thích và lượt bán */}
                {(product.likes || product.sold) && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {product.likes && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                        <FavoriteBorderIcon sx={{ fontSize: 18, mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {product.likes}
                        </Typography>
                      </Box>
                    )}
                    {product.sold && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Đã bán {product.sold}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}

                <Box sx={{ mb: 3 }}>
                  <Typography 
                    variant="body1" 
                    paragraph
                    sx={{
                      fontSize: '1rem',
                      lineHeight: 1.6,
                      color: 'text.primary',
                      textAlign: 'justify',
                      letterSpacing: '0.01em'
                    }}
                  >
                    {product.description}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<ShoppingCartIcon />}
                    sx={{ flex: 1 }}
                  >
                    Thêm vào giỏ
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    startIcon={<FavoriteBorderIcon />}
                  >
                    Yêu thích
                  </Button>
                </Stack>

                {/* Thêm các icon thông báo về dịch vụ */}
                <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalPharmacyIcon color="primary" fontSize="small" />
                    <Typography variant="body2">Đủ thuốc chuẩn</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalShippingIcon color="primary" fontSize="small" />
                    <Typography variant="body2">Giao hàng siêu tốc</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StoreIcon color="primary" fontSize="small" />
                    <Typography variant="body2">Miễn phí vận chuyển</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Thông tin chi tiết dạng grid */}
          <Paper 
            sx={{ 
              p: 3, 
              mb: 4,
              boxShadow: '0 3px 5px rgba(0,0,0,0.05)',
              borderRadius: '8px' 
            }}
          >
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: '#0277bd'
                }}
              >
                Thông tin chi tiết
              </Typography>
            </Box>
            {renderProductDetails(product.details)}
          </Paper>

          {/* Thông tin chuyên sâu */}
          <Paper 
            sx={{ 
              p: 3, 
              mb: 4,
              boxShadow: '0 3px 5px rgba(0,0,0,0.05)',
              borderRadius: '8px'
            }}
          >
            <Box 
              sx={{ 
                borderBottom: 1, 
                borderColor: 'divider',
                mb: 1
              }}
            >
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                aria-label="product tabs"
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#00796b',
                    height: 3
                  }
                }}
              >
                <Tab label="Mô tả" id="tab-0" />
                <Tab label="Thành phần" id="tab-1" />
                <Tab label="Công dụng" id="tab-2" />
                <Tab label="Hướng dẫn sử dụng" id="tab-3" />
                <Tab label="Lưu ý" id="tab-4" />
                <Tab label="Thông tin sản xuất" id="tab-5" />
                <Tab label="Câu hỏi thường gặp" id="tab-6" />
              </Tabs>
            </Box>
            
            {/* Tab Mô tả */}
            <TabPanel value={tabValue} index={0}>
              <div id="mo-ta" className="grid px-4 md:px-0 md:pb-2">
                <div className="pmc-content-html [&_a:not(.ignore-css_a)]:text-hyperLink max-w-[calc(100vw-32px)] overflow-auto md:w-[calc(var(--width-container)-312px-48px)] md:max-w-none">
                  {product.moTaHtml ? (
                    parseHtml(product.moTaHtml)
                  ) : (
                    <>
                      <h2 className="product-section-title"><strong>{product.name} là gì?</strong></h2>
                      <Typography 
                        variant="body1" 
                        paragraph
                        className="product-description"
                        sx={{
                          fontSize: '1rem',
                          lineHeight: 1.6,
                          color: 'text.primary',
                          textAlign: 'justify',
                          letterSpacing: '0.01em'
                        }}
                      >
                        {product.description}
                      </Typography>
                    </>
                  )}
                </div>
              </div>
            </TabPanel>
            
            {/* Tab Thành phần */}
            <TabPanel value={tabValue} index={1}>
              <div id="thanh-phan" className="grid px-4 md:px-0 md:pb-2">
                <div className="pmc-content-html [&_a:not(.ignore-css_a)]:text-hyperLink max-w-[calc(100vw-32px)] overflow-auto md:w-[calc(var(--width-container)-312px-48px)] md:max-w-none">
                  {product.thanhPhanHtml ? (
                    parseHtml(product.thanhPhanHtml)
                  ) : (
                    <>
                      <h2><strong>Thành phần</strong></h2>
                      <div id="detail-content-1" className="ingredient">
                        {renderIngredientsTable(product.ingredients)}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </TabPanel>
            
            {/* Tab Công dụng */}
            <TabPanel value={tabValue} index={2}>
              <div id="chi-dinh" className="grid px-4 md:px-0 md:pb-2">
                <div className="pmc-content-html [&_a:not(.ignore-css_a)]:text-hyperLink max-w-[calc(100vw-32px)] overflow-auto md:w-[calc(var(--width-container)-312px-48px)] md:max-w-none">
                  {product.chiDinhHtml ? (
                    parseHtml(product.chiDinhHtml)
                  ) : (
                    <>
                      <h2><strong>Công dụng</strong></h2>
                      {renderListItems(product.usage)}
                      
                      {product.details && product.details.purpose && (
                        <>
                          <h2><strong>Đối tượng sử dụng</strong></h2>
                          <Typography variant="body1" paragraph>
                            {product.details.purpose}
                          </Typography>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </TabPanel>
            
            {/* Tab Hướng dẫn sử dụng */}
            <TabPanel value={tabValue} index={3}>
              <div id="huong-dan-su-dung" className="grid px-4 md:px-0 md:pb-2">
                <div className="pmc-content-html [&_a:not(.ignore-css_a)]:text-hyperLink max-w-[calc(100vw-32px)] overflow-auto md:w-[calc(var(--width-container)-312px-48px)] md:max-w-none">
                  {product.huongDanHtml ? (
                    parseHtml(product.huongDanHtml)
                  ) : (
                    <>
                      <h2><strong>Cách dùng</strong></h2>
                      {product.usageMethod && product.usageMethod !== 'Not found' && (
                        <Typography variant="body1" paragraph>
                          {product.usageMethod}
                        </Typography>
                      )}
                      {renderListItems(product.usageInstructions)}
                    </>
                  )}
                </div>
              </div>
            </TabPanel>
            
            {/* Tab Lưu ý */}
            <TabPanel value={tabValue} index={4}>
              <div id="than-trong" className="grid px-4 md:px-0 md:pb-2">
                <div className="pmc-content-html [&_a:not(.ignore-css_a)]:text-hyperLink max-w-[calc(100vw-32px)] overflow-auto md:w-[calc(var(--width-container)-312px-48px)] md:max-w-none">
                  {product.thanTrongHtml ? (
                    parseHtml(product.thanTrongHtml)
                  ) : (
                    <>
                      <h2><strong>Lưu ý</strong></h2>
                      {renderListItems(product.precautions)}
                      
                      {product.contraindications && product.contraindications.length > 0 && (
                        <>
                          <h3><strong>Chống chỉ định</strong></h3>
                          {renderListItems(product.contraindications)}
                        </>
                      )}
                      
                      {product.sideEffects && product.sideEffects.length > 0 && (
                        <>
                          <h3><strong>Tác dụng phụ</strong></h3>
                          {renderListItems(product.sideEffects)}
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </TabPanel>
            
            {/* Tab Thông tin sản xuất */}
            <TabPanel value={tabValue} index={5}>
              <div id="thong-tin-san-xuat" className="grid px-4 md:px-0 md:pb-2">
                <div className="pmc-content-html [&_a:not(.ignore-css_a)]:text-hyperLink max-w-[calc(100vw-32px)] overflow-auto md:w-[calc(var(--width-container)-312px-48px)] md:max-w-none">
                  {product.thongTinSanXuatHtml ? (
                    parseHtml(product.thongTinSanXuatHtml)
                  ) : (
                    <>
                      <h2><strong>Thông tin sản xuất</strong></h2>
                      <ul>
                        <li><strong>Nhà sản xuất:</strong> {product.details?.manufacturer || product.brand}</li>
                        {product.details?.specification && (
                          <li><strong>Quy cách:</strong> {product.details.specification}</li>
                        )}
                        {product.details?.category && (
                          <li><strong>Danh mục:</strong> {product.details.category}</li>
                        )}
                        {product.details?.notice && (
                          <li><strong>Bảo quản:</strong> {product.details.notice}</li>
                        )}
                      </ul>
                    </>
                  )}
                </div>
              </div>
            </TabPanel>
            
            {/* Tab Câu hỏi thường gặp */}
            <TabPanel value={tabValue} index={6}>
              <div id="cau-hoi-thuong-gap" className="grid px-4 md:px-0 md:pb-2">
                <div className="pmc-content-html [&_a:not(.ignore-css_a)]:text-hyperLink max-w-[calc(100vw-32px)] overflow-auto md:w-[calc(var(--width-container)-312px-48px)] md:max-w-none">
                  {product.cauHoiThuongGapHtml ? (
                    parseHtml(product.cauHoiThuongGapHtml)
                  ) : (
                    <>
                      <h2>Câu hỏi thường gặp</h2>
                      
                      <p><strong>Tôi có thể mua sản phẩm này ở đâu?</strong></p>
                      <p>Bạn có thể mua sản phẩm {product.name} tại các nhà thuốc, cửa hàng dược phẩm hoặc siêu thị lớn trên toàn quốc.</p>
                      
                      <p><strong>Sản phẩm này có giá bao nhiêu?</strong></p>
                      <p>Giá bán lẻ đề xuất của sản phẩm là {product.price}. Giá có thể thay đổi tùy theo từng điểm bán.</p>
                      
                      {product.details?.specification && (
                        <>
                          <p><strong>Quy cách đóng gói của sản phẩm này là gì?</strong></p>
                          <p>Sản phẩm được đóng gói theo quy cách: {product.details.specification}.</p>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </TabPanel>
          </Paper>
        </>
      ) : null}
    </Container>
  );
};

export default PharmacyProductDetail; 