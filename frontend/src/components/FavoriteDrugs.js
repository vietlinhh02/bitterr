import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  CircularProgress, 
  IconButton, 
  Box,
  Snackbar,
  Alert,
  Chip,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DeleteIcon from '@mui/icons-material/Delete';
import { getFavoriteDrugs, removeFavoriteDrug } from '../services/api';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';

function FavoriteDrugs() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await getFavoriteDrugs();
      if (response.data && response.data.success) {
        setFavorites(response.data.favoriteDrugs);
      }
    } catch (error) {
      console.error('Error fetching favorite drugs:', error);
      setError('Không thể tải danh sách thuốc yêu thích. Vui lòng thử lại sau.');
      showSnackbar('Lỗi khi tải danh sách thuốc yêu thích', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (favoriteId) => {
    try {
      await removeFavoriteDrug(favoriteId);
      setFavorites(favorites.filter(fav => fav._id !== favoriteId));
      showSnackbar('Đã xóa thuốc khỏi danh sách yêu thích', 'success');
    } catch (error) {
      console.error('Error removing favorite drug:', error);
      showSnackbar('Không thể xóa thuốc khỏi danh sách yêu thích', 'error');
    }
  };

  const handleViewDetails = (favorite) => {
    if (favorite.drugInfo.product_ndc) {
      navigate(`/fda-drugs/${favorite.drugInfo.product_ndc}`, { state: { drugData: favorite.drugInfo } });
    } else {
      showSnackbar('Không thể hiển thị chi tiết thuốc này', 'error');
    }
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <FavoriteIcon sx={{ mr: 1, color: 'error.main', fontSize: 32 }} />
        <Typography variant="h4" component="h1">
          Danh sách thuốc yêu thích
        </Typography>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Đây là danh sách các loại thuốc bạn đã đánh dấu yêu thích. Bạn có thể xem chi tiết hoặc xóa khỏi danh sách.
        </Typography>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      ) : favorites.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Bạn chưa có thuốc nào trong danh sách yêu thích
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/fda-drugs')} 
            sx={{ mt: 2 }}
          >
            Tìm kiếm thuốc ngay
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {favorites.map((favorite) => (
            <Grid item xs={12} sm={6} md={4} key={favorite._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {favorite.brandName || favorite.drugName}
                    </Typography>
                    <Chip 
                      size="small" 
                      label="FDA"
                      color="primary"
                    />
                  </Box>
                  
                  {favorite.genericName && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {favorite.genericName}
                    </Typography>
                  )}
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <LocalPharmacyIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Đã thêm vào: {new Date(favorite.createdAt).toLocaleDateString('vi-VN')}
                    </Typography>
                  </Box>
                </CardContent>
                
                <CardActions>
                  <Button 
                    size="small" 
                    onClick={() => handleViewDetails(favorite)}
                  >
                    Xem chi tiết
                  </Button>
                  <IconButton 
                    color="error" 
                    onClick={() => handleRemoveFavorite(favorite._id)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default FavoriteDrugs;
