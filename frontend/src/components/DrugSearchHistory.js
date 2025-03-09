import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow,
  CircularProgress,
  Button,
  Chip,
  Tabs,
  Tab,
  Box,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  History as HistoryIcon, 
  Search as SearchIcon,
  Delete as DeleteIcon,
  DeleteSweep as DeleteSweepIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getDrugSearchHistory, deleteDrugSearchHistoryItem } from '../services/api';

function DrugSearchHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchSearchHistory();
  }, []);

  const fetchSearchHistory = async () => {
    setLoading(true);
    try {
      const response = await getDrugSearchHistory();
      if (response.data && response.data.searchHistory) {
        setHistory(response.data.searchHistory);
      }
    } catch (err) {
      console.error('Lỗi khi lấy lịch sử tìm kiếm:', err);
      setError('Không thể tải lịch sử tìm kiếm. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchAgain = (query, source) => {
    // Kiểm tra xem query có phải là tìm kiếm theo thành phần không
    if (query.startsWith('ingredients:')) {
      const ingredients = query.replace('ingredients:', '');
      navigate('/fda-drugs', { 
        state: { 
          searchType: 'ingredients', 
          searchKeyword: ingredients,
          prefillSearch: true 
        } 
      });
    } else if (source === 'longchau') {
      navigate('/longchau-search', { 
        state: { 
          searchKeyword: query,
          prefillSearch: true 
        } 
      });
    } else {
      navigate('/fda-drugs', { 
        state: { 
          searchType: 'name', 
          searchKeyword: query,
          prefillSearch: true 
        } 
      });
    }
  };

  const handleDeleteItem = (item) => {
    setItemToDelete(item);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      await deleteDrugSearchHistoryItem(itemToDelete._id);
      setHistory(history.filter(item => item._id !== itemToDelete._id));
      setSnackbar({
        open: true,
        message: 'Đã xóa lịch sử tìm kiếm thành công',
        severity: 'success'
      });
    } catch (err) {
      console.error('Lỗi khi xóa lịch sử tìm kiếm:', err);
      setSnackbar({
        open: true,
        message: 'Không thể xóa lịch sử tìm kiếm. Vui lòng thử lại sau.',
        severity: 'error'
      });
    } finally {
      setOpenDeleteDialog(false);
      setItemToDelete(null);
    }
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setItemToDelete(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Lọc lịch sử theo nguồn
  const filteredHistory = history.filter(item => {
    if (tabValue === 0) return true; // Tất cả
    if (tabValue === 1) return !item.source || item.source !== 'longchau'; // FDA
    if (tabValue === 2) return item.source === 'longchau'; // Long Châu
    return true;
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom align="center">
          <HistoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Lịch Sử Tìm Kiếm
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} centered>
            <Tab label="Tất cả" />
            <Tab label="FDA" />
            <Tab label="Long Châu" />
          </Tabs>
        </Box>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px' }}>
            <CircularProgress />
          </div>
        ) : error ? (
          <Typography color="error" align="center">
            {error}
          </Typography>
        ) : filteredHistory.length === 0 ? (
          <Typography align="center" sx={{ py: 3 }}>
            Không có lịch sử tìm kiếm nào.
          </Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Từ khóa</TableCell>
                <TableCell>Loại tìm kiếm</TableCell>
                <TableCell>Nguồn</TableCell>
                <TableCell>Số kết quả</TableCell>
                <TableCell>Thời gian</TableCell>
                <TableCell>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredHistory.map((item) => (
                <TableRow key={item._id} hover>
                  <TableCell>
                    {item.query.startsWith('ingredients:') 
                      ? item.query.replace('ingredients:', '') 
                      : item.query}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={item.query.startsWith('ingredients:') ? 'Thành phần' : 'Tên thuốc'} 
                      color="primary" 
                      variant="outlined" 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={item.source === 'longchau' ? 'Long Châu' : 'FDA'} 
                      color={item.source === 'longchau' ? 'secondary' : 'primary'} 
                      variant="outlined" 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>{item.resultCount}</TableCell>
                  <TableCell>{formatDate(item.timestamp)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        size="small" 
                        startIcon={<SearchIcon />}
                        onClick={() => handleSearchAgain(item.query, item.source)}
                      >
                        Tìm lại
                      </Button>
                      <Tooltip title="Xóa">
                        <IconButton 
                          color="error" 
                          size="small"
                          onClick={() => handleDeleteItem(item)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {/* Dialog xác nhận xóa */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa lịch sử tìm kiếm này không?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Hủy
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

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
  );
}

export default DrugSearchHistory;