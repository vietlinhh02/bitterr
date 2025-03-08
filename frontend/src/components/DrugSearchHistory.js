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
  Chip
} from '@mui/material';
import { History as HistoryIcon, Search as SearchIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getDrugSearchHistory } from '../services/api';

function DrugSearchHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  const handleSearchAgain = (query) => {
    // Kiểm tra xem query có phải là tìm kiếm theo thành phần không
    if (query.startsWith('ingredients:')) {
      const ingredients = query.replace('ingredients:', '');
      navigate('/fda-drugs', { state: { searchType: 'ingredients', query: ingredients } });
    } else {
      navigate('/fda-drugs', { state: { searchType: 'name', query } });
    }
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom align="center">
          <HistoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Lịch Sử Tìm Kiếm Thuốc
        </Typography>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px' }}>
            <CircularProgress />
          </div>
        ) : error ? (
          <Typography color="error" align="center">
            {error}
          </Typography>
        ) : history.length === 0 ? (
          <Typography align="center" sx={{ py: 4 }}>
            Bạn chưa có lịch sử tìm kiếm nào.
          </Typography>
        ) : (
          <Table>
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell><strong>Thời gian</strong></TableCell>
                <TableCell><strong>Từ khóa tìm kiếm</strong></TableCell>
                <TableCell><strong>Kết quả</strong></TableCell>
                <TableCell><strong>Tìm lại</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((item, index) => (
                <TableRow key={index} hover>
                  <TableCell>{formatDate(item.timestamp)}</TableCell>
                  <TableCell>
                    {item.query.startsWith('ingredients:') ? (
                      <Chip 
                        label={`Thành phần: ${item.query.replace('ingredients:', '')}`} 
                        color="primary" 
                        variant="outlined" 
                        size="small"
                      />
                    ) : (
                      item.query
                    )}
                  </TableCell>
                  <TableCell>
                    {item.results ? (
                      `${item.results.length} kết quả`
                    ) : (
                      <Typography variant="body2" color="error">
                        Không tìm thấy
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      startIcon={<SearchIcon />}
                      onClick={() => handleSearchAgain(item.query)}
                    >
                      Tìm lại
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Container>
  );
}

export default DrugSearchHistory; 