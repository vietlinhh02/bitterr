import React, { useState } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  MedicalServices as MedicalServicesIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { searchDrugEvents } from '../services/api';

const DrugEventsSearch = () => {
  const [searchParams, setSearchParams] = useState({
    medicinalproduct: '',
    reactionmeddrapt: '',
    reportercountry: '',
    serious: '',
    limit: 10
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [meta, setMeta] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    
    // Kiểm tra xem có ít nhất một tham số tìm kiếm
    if (!searchParams.medicinalproduct && !searchParams.reactionmeddrapt && 
        !searchParams.reportercountry && !searchParams.serious) {
      setSnackbarMessage('Vui lòng nhập ít nhất một tham số tìm kiếm');
      setOpenSnackbar(true);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await searchDrugEvents(searchParams);
      
      if (response.data && response.data.results) {
        setResults(response.data.results);
        setMeta(response.data.meta);
      } else {
        setResults([]);
        setMeta(null);
      }
    } catch (err) {
      console.error('Lỗi khi tìm kiếm sự kiện thuốc:', err);
      setError('Đã xảy ra lỗi khi tìm kiếm sự kiện thuốc. Vui lòng thử lại sau.');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === 'N/A') return 'N/A';
    
    // Định dạng YYYYMMDD
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    
    return `${day}/${month}/${year}`;
  };

  const getSeriousnessLabel = (value) => {
    switch(value) {
      case '1': return 'Nghiêm trọng';
      case '2': return 'Không nghiêm trọng';
      default: return 'Không xác định';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <MedicalServicesIcon color="primary" sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Tìm Kiếm Sự Kiện Thuốc FDA
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Tìm kiếm thông tin về các sự kiện bất lợi liên quan đến thuốc từ cơ sở dữ liệu FDA
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSearch} sx={{ mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tên thuốc"
                name="medicinalproduct"
                value={searchParams.medicinalproduct}
                onChange={handleInputChange}
                placeholder="Ví dụ: ASPIRIN, IBUPROFEN..."
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phản ứng phụ"
                name="reactionmeddrapt"
                value={searchParams.reactionmeddrapt}
                onChange={handleInputChange}
                placeholder="Ví dụ: HEADACHE, NAUSEA..."
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Quốc gia báo cáo"
                name="reportercountry"
                value={searchParams.reportercountry}
                onChange={handleInputChange}
                placeholder="Ví dụ: US, JP, FR..."
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Mức độ nghiêm trọng</InputLabel>
                <Select
                  name="serious"
                  value={searchParams.serious}
                  onChange={handleInputChange}
                  label="Mức độ nghiêm trọng"
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="1">Nghiêm trọng</MenuItem>
                  <MenuItem value="2">Không nghiêm trọng</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Số lượng kết quả</InputLabel>
                <Select
                  name="limit"
                  value={searchParams.limit}
                  onChange={handleInputChange}
                  label="Số lượng kết quả"
                >
                  <MenuItem value={5}>5 kết quả</MenuItem>
                  <MenuItem value={10}>10 kết quả</MenuItem>
                  <MenuItem value={20}>20 kết quả</MenuItem>
                  <MenuItem value={50}>50 kết quả</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                startIcon={<SearchIcon />}
                fullWidth
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Tìm kiếm'}
              </Button>
            </Grid>
          </Grid>
        </Box>

        {meta && (
          <Box sx={{ mb: 3 }}>
            <Alert severity="info">
              <Typography variant="body2">
                Tìm thấy {meta.results?.total || 0} kết quả. Hiển thị {results.length} kết quả đầu tiên.
              </Typography>
            </Alert>
          </Box>
        )}

        {results.length > 0 ? (
          <Box>
            {results.map((event, index) => (
              <Card key={event.safetyreportid} sx={{ mb: 3, boxShadow: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" component="h2">
                        Báo cáo #{event.safetyreportid}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Ngày nhận: {formatDate(event.receivedate)}
                      </Typography>
                    </Box>
                    <Box>
                      <Chip 
                        label={getSeriousnessLabel(event.serious)} 
                        color={event.serious === '1' ? 'error' : 'success'} 
                        size="small"
                        icon={event.serious === '1' ? <WarningIcon /> : <InfoIcon />}
                      />
                      {event.seriousnessdeath === '1' && (
                        <Chip 
                          label="Tử vong" 
                          color="error" 
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                  </Box>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                    Quốc gia báo cáo: {event.reportercountry}
                  </Typography>
                  
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle1">Thông tin thuốc ({event.drugs?.length || 0})</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {event.drugs && event.drugs.length > 0 ? (
                        <TableContainer component={Paper} variant="outlined">
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Tên thuốc</TableCell>
                                <TableCell>Chỉ định</TableCell>
                                <TableCell>Vai trò</TableCell>
                                <TableCell>Đường dùng</TableCell>
                                <TableCell>Hoạt chất</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {event.drugs.map((drug, idx) => (
                                <TableRow key={idx}>
                                  <TableCell>{drug.medicinalproduct}</TableCell>
                                  <TableCell>{drug.drugindication}</TableCell>
                                  <TableCell>{drug.drugcharacterization}</TableCell>
                                  <TableCell>{drug.drugadministrationroute}</TableCell>
                                  <TableCell>{drug.activesubstancename}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Typography variant="body2">Không có thông tin thuốc</Typography>
                      )}
                    </AccordionDetails>
                  </Accordion>
                  
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle1">Phản ứng phụ ({event.reactions?.length || 0})</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {event.reactions && event.reactions.length > 0 ? (
                        <TableContainer component={Paper} variant="outlined">
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Phản ứng</TableCell>
                                <TableCell>Kết quả</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {event.reactions.map((reaction, idx) => (
                                <TableRow key={idx}>
                                  <TableCell>{reaction.reactionmeddrapt}</TableCell>
                                  <TableCell>{reaction.reactionoutcome}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <Typography variant="body2">Không có thông tin phản ứng phụ</Typography>
                      )}
                    </AccordionDetails>
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          !loading && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                {error ? error : 'Nhập thông tin tìm kiếm và nhấn "Tìm kiếm" để xem kết quả.'}
              </Typography>
            </Box>
          )
        )}
      </Paper>
      
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default DrugEventsSearch; 