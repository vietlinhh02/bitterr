import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Container, 
  Grid, 
  Card, 
  CardHeader, 
  CardContent, 
  Button, 
  Box, 
  Typography,
  TextField,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CardMedia,
  IconButton,
  Drawer,
  useMediaQuery,
  useTheme,
  AppBar,
  Toolbar,
  Paper,
  Tabs,
  Tab,
  Avatar,
  Chip,
  Badge,
  Tooltip
} from '@mui/material';
import { 
  Chat as ChatIcon, 
  PhotoCamera as PhotoCameraIcon,
  LocalPharmacy as LocalPharmacyIcon,
  Search as SearchIcon,
  History as HistoryIcon,
  Message as MessageIcon,
  Menu as MenuIcon,
  Info as InfoIcon,
  AccountCircle as AccountCircleIcon
} from '@mui/icons-material';
import axios from 'axios';

// Tạo instance axios với baseURL
const API = axios.create({ 
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Thêm interceptor để đính kèm token vào mỗi request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

const AllFeatures = () => {
    const [activeFeature, setActiveFeature] = useState('chat');
    const [searchQuery, setSearchQuery] = useState('');
    const [fdaResults, setFdaResults] = useState([]);
    const [longChauResults, setLongChauResults] = useState([]);
    const [selectedDrug, setSelectedDrug] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [uploadedImage, setUploadedImage] = useState(null);
    const [detectionResults, setDetectionResults] = useState(null);
    const [searchHistory, setSearchHistory] = useState([]);
    const [confirmDialog, setConfirmDialog] = useState({
        open: false,
        title: '',
        content: '',
        onConfirm: null
    });
    const [productDetailDialog, setProductDetailDialog] = useState({
        open: false,
        product: null,
        productDetails: null
    });
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [userAvatar, setUserAvatar] = useState(null);
    const [avatarDialog, setAvatarDialog] = useState(false);
    const ensureString = (value) => {
        if (value === null || value === undefined) {
          return '';
        }
        return String(value);
      };
    
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    useEffect(() => {
        fetchSearchHistory();
    }, []);

    const fetchSearchHistory = async () => {
        try {
            const response = await API.get('/drug/search-history');
            setSearchHistory(response.data);
        } catch (error) {
            console.error('Lỗi khi lấy lịch sử tìm kiếm:', error);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setError('Vui lòng nhập từ khóa tìm kiếm');
            return;
        }
        
        setLoading(true);
        setError('');
        setFdaResults([]);
        setLongChauResults([]);
        setSelectedDrug(null);
        
        try {
            // Tìm kiếm FDA
            try {
                const fdaResponse = await API.get(`/drug/search?query=${encodeURIComponent(searchQuery.trim())}`);
                if (fdaResponse.data && fdaResponse.data.results) {
                    setFdaResults(fdaResponse.data.results);
                }
            } catch (fdaError) {
                console.error('Lỗi tìm kiếm FDA:', fdaError);
                if (fdaError.response && fdaError.response.status === 500) {
                    console.log('Không tìm thấy thuốc trong cơ sở dữ liệu FDA');
                    setFdaResults([]); // Đảm bảo kết quả FDA trống
                } else {
                    // Xử lý các lỗi khác nếu cần
                    console.error('Lỗi không xác định khi tìm kiếm FDA:', fdaError);
                }
            }
            
            // Tìm kiếm Long Châu
            try {
                const longChauResponse = await API.get(`/longchau/search?keyword=${encodeURIComponent(searchQuery.trim())}`);
                if (longChauResponse.data && longChauResponse.data.data && longChauResponse.data.data.products) {
                    setLongChauResults(longChauResponse.data.data.products);
                }
            } catch (longChauError) {
                console.error('Lỗi tìm kiếm Long Châu:', longChauError);
                setLongChauResults([]); // Đảm bảo kết quả Long Châu trống
            }
            
            // Lưu lịch sử tìm kiếm
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    // Kiểm tra xem có kết quả từ một trong hai nguồn không
                    const hasResults = fdaResults.length > 0 || longChauResults.length > 0;
                    
                    // Chỉ lưu lịch sử nếu có kết quả tìm kiếm
                    if (hasResults) {
                        const searchData = {
                            searchQuery: searchQuery.trim(),
                            source: fdaResults.length > 0 ? 'FDA' : 'Long Chau',
                            resultCount: fdaResults.length + longChauResults.length,
                            searchTime: new Date().toISOString()
                        };
                        
                        await API.post('/drug/save-search-history', searchData);
                        await fetchSearchHistory();
                    }
                }
            } catch (historyError) {
                console.error('Lỗi lưu lịch sử tìm kiếm:', historyError);
                // Không hiển thị lỗi này cho người dùng vì không ảnh hưởng đến chức năng chính
            }
            
            // Kiểm tra và hiển thị thông báo kết quả
            if (fdaResults.length === 0 && longChauResults.length === 0) {
                setError('Không tìm thấy kết quả nào từ cả FDA và Long Châu. Vui lòng thử lại với từ khóa khác.');
            }
            
        } catch (error) {
            console.error('Lỗi tìm kiếm:', error);
            setError('Đã xảy ra lỗi khi tìm kiếm. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectFdaDrug = async (drug) => {
        setLoading(true);
        try {
            const response = await API.get(`/drug/${drug.product_ndc}`);
            setSelectedDrug({
                type: 'fda',
                data: response.data
            });
            
            // Mở dialog chi tiết sản phẩm thay vì hỏi chuyển sang chat
            setProductDetailDialog({
                open: true,
                product: drug,
                productDetails: response.data
            });
            
        } catch (error) {
            console.error('Lỗi khi lấy chi tiết thuốc:', error);
            setError('Không thể lấy thông tin chi tiết thuốc. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectLongChauProduct = async (product) => {
        setLoading(true);
        try {
            const response = await API.get(`/longchau/drug-infos?url=${encodeURIComponent(product.slug)}`);
            
            // Xử lý dữ liệu trước khi lưu
            const processedData = {
                ...response.data.data,
                // Đảm bảo category là một chuỗi, không phải object
                category: response.data.data.category && typeof response.data.data.category === 'object' 
                    ? response.data.data.category.name 
                    : response.data.data.category
            };
            
            setSelectedDrug({
                type: 'longchau',
                data: processedData
            });
            
            // Mở dialog chi tiết sản phẩm thay vì hỏi chuyển sang chat
            setProductDetailDialog({
                open: true,
                product: product,
                productDetails: processedData
            });
            
        } catch (error) {
            console.error('Lỗi khi lấy chi tiết sản phẩm Long Châu:', error);
            setError('Không thể lấy thông tin chi tiết sản phẩm. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    // Hàm xử lý khi người dùng muốn chat với AI về sản phẩm
    const handleChatAboutProduct = () => {
        const product = productDetailDialog.product;
        if (!product) return;
        
        setConfirmDialog({
            open: true,
            title: 'Xác nhận chuyển sang chat',
            content: `Bạn có muốn sử dụng thông tin thuốc "${product.name}" để chat với AI không?`,
            onConfirm: () => {
                setActiveFeature('chat');
                setChatMessages(prev => [...prev, {
                    role: 'system',
                    content: `Đã tìm thấy thông tin thuốc: ${product.name}. Tôi có thể giúp gì cho bạn về thuốc này?`
                }]);
                setConfirmDialog({ ...confirmDialog, open: false });
                setProductDetailDialog({ ...productDetailDialog, open: false });
            }
        });
    };

    const handleSendMessage = async () => {
        if (!chatInput.trim()) return;
        
        const newMessage = {
            role: 'user',
            content: chatInput
        };
        
        setChatMessages(prev => [...prev, newMessage]);
        setChatInput('');
        
        try {
            let prompt = chatInput;
            let productInfo = null;
            
            if (selectedDrug) {
                if (selectedDrug.type === 'fda') {
                    productInfo = {
                        brand_name: selectedDrug.data.brand_name,
                        generic_name: selectedDrug.data.generic_name,
                        dosage_form: selectedDrug.data.dosage_form,
                        active_ingredients: selectedDrug.data.active_ingredients,
                        manufacturer: selectedDrug.data.manufacturer_name
                    };
                } else if (selectedDrug.type === 'longchau') {
                    // Đảm bảo các trường là chuỗi, không phải object
                    const ensureString = (value) => {
                        if (!value) return '';
                        if (typeof value === 'object') {
                            if (value.price && value.currencySymbol) {
                                return `${value.price.toLocaleString('vi-VN')} ${value.currencySymbol}`;
                            }
                            return value.name || value.toString();
                        }
                        return String(value);
                    };
                    
                    productInfo = {
                        name: ensureString(selectedDrug.data.name),
                        price: ensureString(selectedDrug.data.price),
                        category: ensureString(selectedDrug.data.category),
                        description: ensureString(selectedDrug.data.description),
                        usage: ensureString(selectedDrug.data.usage)
                    };
                }
            }
            
            const response = await API.post('/gemini/ask', {
                question: prompt,
                productInfo: productInfo
            });
            
            setChatMessages(prev => [...prev, {
                role: 'assistant',
                content: response.data.answer
            }]);
            
        } catch (error) {
            console.error('Lỗi gửi tin nhắn:', error);
            setChatMessages(prev => [...prev, {
                role: 'system',
                content: 'Xin lỗi, đã xảy ra lỗi khi xử lý tin nhắn của bạn. Vui lòng thử lại sau.'
            }]);
        }
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDetectDrug = async () => {
        if (!uploadedImage) return;
        
        setLoading(true);
        try {
            const formData = new FormData();
            // Chuyển base64 thành blob
            const base64Response = await fetch(uploadedImage);
            const blob = await base64Response.blob();
            formData.append('image', blob, 'image.jpg');
            
            const response = await API.post('/detect/image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            setDetectionResults(response.data);
            
            // Nếu nhận diện thành công, tự động tìm kiếm thông tin thuốc
            if (response.data.drug_name) {
                setSearchQuery(response.data.drug_name);
                await handleSearch();
            }
            
        } catch (error) {
            console.error('Lỗi nhận diện thuốc:', error);
            setError('Không thể nhận diện thuốc từ ảnh. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    // Thêm hàm xử lý upload avatar
    const handleAvatarUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUserAvatar(reader.result);
                setAvatarDialog(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const renderFDASearch = () => (
        <div>
            <Typography variant="h6" gutterBottom>Tra cứu thuốc FDA</Typography>
            <Box sx={{ display: 'flex', mb: 2 }}>
                <TextField
                    fullWidth
                    label="Nhập tên thuốc"
                    variant="outlined"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSearch}
                    disabled={loading}
                    sx={{ ml: 1 }}
                >
                    {loading ? <CircularProgress size={24} /> : "Tìm kiếm"}
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            ) : fdaResults.length > 0 ? (
                <Card>
                    <List>
                        {fdaResults.map((drug, index) => (
                            <React.Fragment key={index}>
                                <ListItem 
                                    button 
                                    onClick={() => handleSelectFdaDrug(drug)}
                                >
                                    <ListItemText
                                        primary={drug.brand_name || drug.generic_name}
                                        secondary={
                                            <>
                                                {drug.generic_name && `${drug.generic_name} • `}
                                                {drug.manufacturer_name && `${drug.manufacturer_name} • `}
                                                {drug.dosage_form}
                                            </>
                                        }
                                    />
                                </ListItem>
                                {index < fdaResults.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}
                    </List>
                </Card>
            ) : (
                searchQuery && !loading && <Typography>Không tìm thấy kết quả từ FDA</Typography>
            )}
        </div>
    );

    const renderChat = () => (
        <div>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Chat với AI trợ lý</Typography>
                <Tooltip title="Thay đổi avatar">
                    <IconButton onClick={() => setAvatarDialog(true)}>
                        {userAvatar ? (
                            <Avatar src={userAvatar} sx={{ width: 40, height: 40 }} />
                        ) : (
                            <AccountCircleIcon sx={{ width: 40, height: 40 }} />
                        )}
                    </IconButton>
                </Tooltip>
            </Box>
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    {selectedDrug && (
                        <Chip 
                            icon={<InfoIcon />}
                            label={`Đang chat về: ${selectedDrug.type === 'fda' 
                                ? (selectedDrug.data.brand_name || selectedDrug.data.generic_name)
                                : selectedDrug.data.name}`}
                            color="info"
                            sx={{ mb: 2 }}
                        />
                    )}
                    
                    <Box sx={{ 
                        height: '400px', 
                        overflowY: 'auto', 
                        p: 2,
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                        mb: 2
                    }}>
                        {chatMessages.map((message, index) => (
                            <Box 
                                key={index} 
                                sx={{ 
                                    mb: 2, 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: message.role === 'user' ? 'flex-end' : 'flex-start'
                                }}
                            >
                                <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'flex-end',
                                    flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
                                    gap: 1
                                }}>
                                    <Avatar 
                                        src={message.role === 'user' ? userAvatar : null}
                                        sx={{ 
                                            width: 32, 
                                            height: 32,
                                            bgcolor: message.role === 'user' ? 'primary.main' : 'secondary.main'
                                        }}
                                    >
                                        {message.role === 'user' ? 
                                            (!userAvatar && 'U') : 
                                            'AI'
                                        }
                                    </Avatar>
                                    <Box 
                                        sx={{ 
                                            p: 1.5, 
                                            borderRadius: 2, 
                                            maxWidth: '75%',
                                            bgcolor: message.role === 'user' ? 'primary.main' : 'grey.100',
                                            color: message.role === 'user' ? 'white' : 'text.primary'
                                        }}
                                    >
                                        <ReactMarkdown>{message.content}</ReactMarkdown>
                                    </Box>
                                </Box>
                                <Typography 
                                    variant="caption" 
                                    sx={{ 
                                        mt: 0.5, 
                                        opacity: 0.7,
                                        alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                                        ml: message.role === 'user' ? 0 : 5,
                                        mr: message.role === 'user' ? 5 : 0
                                    }}
                                >
                                    {message.role === 'user' ? 'Bạn' : 'AI Trợ lý'} • {new Date().toLocaleTimeString()}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                            fullWidth
                            label="Nhập tin nhắn"
                            variant="outlined"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <Button
                            variant="contained"
                            onClick={handleSendMessage}
                            disabled={loading}
                        >
                            Gửi
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* Dialog chọn avatar */}
            <Dialog
                open={avatarDialog}
                onClose={() => setAvatarDialog(false)}
            >
                <DialogTitle>Thay đổi avatar</DialogTitle>
                <DialogContent>
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                        <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="avatar-upload"
                            type="file"
                            onChange={handleAvatarUpload}
                        />
                        <label htmlFor="avatar-upload">
                            <Button
                                variant="contained"
                                component="span"
                                startIcon={<PhotoCameraIcon />}
                            >
                                Chọn ảnh
                            </Button>
                        </label>
                    </Box>
                </DialogContent>
            </Dialog>
        </div>
    );

    const renderImageDetection = () => (
        <div>
            <Typography variant="h6" gutterBottom>Nhận diện thuốc từ ảnh</Typography>
            <Box sx={{ mb: 2 }}>
                <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="upload-image"
                    type="file"
                    onChange={handleImageUpload}
                />
                <label htmlFor="upload-image">
                    <Button 
                        variant="contained" 
                        component="span" 
                        startIcon={<PhotoCameraIcon />}
                    >
                        Chọn ảnh
                    </Button>
                </label>
            </Box>

            {uploadedImage && (
                <Box sx={{ mb: 2, textAlign: 'center' }}>
                    <img 
                        src={uploadedImage} 
                        alt="Uploaded" 
                        style={{ maxWidth: '100%', maxHeight: '300px' }} 
                    />
                    <Box sx={{ mt: 1 }}>
                        <Button 
                            variant="contained" 
                            onClick={handleDetectDrug}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : "Nhận diện thuốc"}
                        </Button>
                    </Box>
                </Box>
            )}

            {detectionResults && (
                <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">Kết quả nhận diện:</Typography>
                    <Alert severity="info" sx={{ mt: 1 }}>
                        {detectionResults.drug_name 
                            ? `Đã nhận diện: ${detectionResults.drug_name} (Độ chính xác: ${detectionResults.confidence}%)` 
                            : 'Không thể nhận diện thuốc trong ảnh'}
                    </Alert>
                </Box>
            )}
        </div>
    );

    const renderSearchHistory = () => (
        <div>
            <Typography variant="h6" gutterBottom>Lịch sử tìm kiếm</Typography>
            {searchHistory.length > 0 ? (
                <List>
                    {searchHistory.map((item, index) => (
                        <React.Fragment key={index}>
                            <ListItem button onClick={() => {
                                setSearchQuery(item.query);
                                setActiveFeature('fda');
                                handleSearch();
                            }}>
                                <ListItemText
                                    primary={item.query}
                                    secondary={new Date(item.timestamp).toLocaleString()}
                                />
                            </ListItem>
                            {index < searchHistory.length - 1 && <Divider />}
                        </React.Fragment>
                    ))}
                </List>
            ) : (
                <Typography>Chưa có lịch sử tìm kiếm nào</Typography>
            )}
        </div>
    );

    const renderLongChauSearch = () => (
        <div>
            <Typography variant="h6" gutterBottom>Tìm kiếm Long Châu</Typography>
            <Box sx={{ display: 'flex', mb: 2 }}>
                <TextField
                    fullWidth
                    label="Nhập tên thuốc"
                    variant="outlined"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button
                    variant="contained"
                    onClick={handleSearch}
                    disabled={loading}
                    sx={{ ml: 1 }}
                >
                    {loading ? <CircularProgress size={24} /> : "Tìm kiếm"}
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            ) : longChauResults.length > 0 ? (
                <Grid container spacing={2}>
                    {longChauResults.map((product, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Card>
                                {product.image && (
                                    <CardMedia
                                        component="img"
                                        height="200"
                                        image={product.image}
                                        alt={product.name}
                                        sx={{ objectFit: 'contain', p: 1 }}
                                    />
                                )}
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        {product.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                    
                                        Giá: {ensureString(product.price)}
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        sx={{ mt: 1 }}
                                        onClick={() => handleSelectLongChauProduct(product)}
                                    >
                                        Xem chi tiết
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                searchQuery && !loading && <Typography>Không tìm thấy kết quả từ Long Châu</Typography>
            )}
        </div>
    );

    const TabPanel = (props) => {
        const { children, value, index, ...other } = props;
        return (
            <div
                role="tabpanel"
                hidden={value !== index}
                {...other}
            >
                {value === index && (
                    <Box sx={{ p: 3 }}>
                        {children}
                    </Box>
                )}
            </div>
        );
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4, pb: isMobile ? 7 : 0 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
                Tra Cứu Thông Tin Thuốc
            </Typography>

            {isMobile && (
                <AppBar position="fixed" color="primary" sx={{ top: 'auto', bottom: 0 }}>
                    <Toolbar>
                        <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                            {tabValue === 0 && 'Chat với AI'}
                            {tabValue === 1 && 'Nhận diện thuốc'}
                            {tabValue === 2 && 'Tra cứu thuốc FDA'}
                            {tabValue === 3 && 'Tìm kiếm Long Châu'}
                            {tabValue === 4 && 'Lịch sử tìm kiếm'}
                        </Typography>
                        <IconButton 
                            color="inherit" 
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <MenuIcon />
                        </IconButton>
                    </Toolbar>
                </AppBar>
            )}

            <Drawer
                anchor="bottom"
                open={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
            >
                <Box sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom align="center">
                        Chọn Tính Năng
                    </Typography>
                    <List>
                        <ListItem button onClick={() => {
                            setTabValue(0);
                            setMobileMenuOpen(false);
                        }}>
                            <ListItemText primary="Chat với AI" />
                        </ListItem>
                        <ListItem button onClick={() => {
                            setTabValue(1);
                            setMobileMenuOpen(false);
                        }}>
                            <ListItemText primary="Nhận diện thuốc" />
                        </ListItem>
                        <ListItem button onClick={() => {
                            setTabValue(2);
                            setMobileMenuOpen(false);
                        }}>
                            <ListItemText primary="Tra cứu thuốc FDA" />
                        </ListItem>
                        <ListItem button onClick={() => {
                            setTabValue(3);
                            setMobileMenuOpen(false);
                        }}>
                            <ListItemText primary="Tìm kiếm Long Châu" />
                        </ListItem>
                        <ListItem button onClick={() => {
                            setTabValue(4);
                            setMobileMenuOpen(false);
                        }}>
                            <ListItemText primary="Lịch sử tìm kiếm" />
                        </ListItem>
                    </List>
                </Box>
            </Drawer>

            <Paper sx={{ width: '100%', mb: 2 }}>
                {!isMobile && (
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        variant="fullWidth"
                        sx={{ borderBottom: 1, borderColor: 'divider' }}
                    >
                        <Tab icon={<ChatIcon />} label="Chat với AI" />
                        <Tab icon={<PhotoCameraIcon />} label="Nhận diện thuốc" />
                        <Tab icon={<SearchIcon />} label="Tra cứu FDA" />
                        <Tab icon={<LocalPharmacyIcon />} label="Long Châu" />
                        <Tab icon={<HistoryIcon />} label="Lịch sử" />
                    </Tabs>
                )}

                <TabPanel value={tabValue} index={0}>
                    {renderChat()}
                </TabPanel>
                <TabPanel value={tabValue} index={1}>
                    {renderImageDetection()}
                </TabPanel>
                <TabPanel value={tabValue} index={2}>
                    {renderFDASearch()}
                </TabPanel>
                <TabPanel value={tabValue} index={3}>
                    {renderLongChauSearch()}
                </TabPanel>
                <TabPanel value={tabValue} index={4}>
                    {renderSearchHistory()}
                </TabPanel>
            </Paper>

            <Dialog
                open={confirmDialog.open}
                onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
            >
                <DialogTitle>{confirmDialog.title}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {confirmDialog.content}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}>
                        Hủy
                    </Button>
                    <Button onClick={confirmDialog.onConfirm} variant="contained">
                        Xác nhận
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={productDetailDialog.open}
                onClose={() => setProductDetailDialog({ ...productDetailDialog, open: false })}
                maxWidth="md"
                fullWidth
            >
                {productDetailDialog.productDetails && (
                    <>
                        <DialogTitle>
                            Chi tiết sản phẩm
                        </DialogTitle>
                        <DialogContent dividers>
                            <Grid container spacing={2}>
                                {selectedDrug?.type === 'longchau' && productDetailDialog.product?.image && (
                                    <Grid item xs={12} sm={4}>
                                        <CardMedia
                                            component="img"
                                            image={productDetailDialog.product.image}
                                            alt={productDetailDialog.product.name}
                                            sx={{ maxHeight: '300px', objectFit: 'contain' }}
                                        />
                                    </Grid>
                                )}
                                
                                <Grid item xs={12} sm={selectedDrug?.type === 'longchau' && productDetailDialog.product?.image ? 8 : 12}>
                                    {selectedDrug?.type === 'fda' ? (
                                        <>
                                            <Typography variant="h6" gutterBottom>
                                                {productDetailDialog.productDetails.brand_name || 'N/A'}
                                            </Typography>
                                            <Typography>
                                                <strong>Tên gốc:</strong> {productDetailDialog.productDetails.generic_name || 'N/A'}
                                            </Typography>
                                            <Typography>
                                                <strong>Nhà sản xuất:</strong> {productDetailDialog.productDetails.manufacturer_name || 'N/A'}
                                            </Typography>
                                            <Typography>
                                                <strong>Dạng bào chế:</strong> {productDetailDialog.productDetails.dosage_form || 'N/A'}
                                            </Typography>
                                        </>
                                    ) : (
                                        <>
                                            <Typography variant="h6" gutterBottom>
                                                {productDetailDialog.product?.name}
                                            </Typography>
                                            <Typography>
                                                <strong>Giá:</strong> {ensureString(productDetailDialog.productDetails.price)}
                                            </Typography>
                                            {productDetailDialog.productDetails.description && (
                                                <Box mt={2}>
                                                    <Typography variant="subtitle1" gutterBottom>Mô tả</Typography>
                                                    <div dangerouslySetInnerHTML={{ __html: productDetailDialog.productDetails.description }} />
                                                </Box>
                                            )}
                                        </>
                                    )}
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setProductDetailDialog({ ...productDetailDialog, open: false })}>
                                Đóng
                            </Button>
                            <Button onClick={handleChatAboutProduct} variant="contained" color="primary">
                                Chat với AI về sản phẩm này
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Container>
    );
};

export default AllFeatures; 