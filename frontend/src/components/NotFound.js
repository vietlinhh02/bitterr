import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Paper, // Keep Paper for subtle background/border
  // useTheme // No longer needed if not using theme directly for complex styles
} from '@mui/material';
import {
  SentimentVeryDissatisfied as SadIcon, // Keep icon, but smaller
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';

const NotFound = () => {
  // const theme = useTheme(); // Removed if not used
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1); // Navigate back one step in history
  };

  return (
    // Use Container to constrain width, add vertical padding
    <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        {/* Use an outlined Paper for minimal styling */}
        <Paper variant="outlined" sx={{ p: { xs: 3, sm: 4 }, borderRadius: 2 }}>
          {/* Icon */}
          <SadIcon sx={{ fontSize: 100, color: 'gray', mb: 2 }} />

          {/* Main Heading */}
          <Typography
            variant="h3" // Smaller heading
            component="h1"
            fontWeight="bold"
            color="text.primary" // Standard text color
            sx={{ mb: 1 }}
          >
            404
          </Typography>

          {/* Sub Heading */}
          <Typography
            variant="h6" // Smaller sub-heading
            component="h2"
            color="text.primary" // Standard text color
            gutterBottom
            sx={{ mb: 2 }}
          >
            Không tìm thấy trang
          </Typography>

          {/* Explanation Text */}
          <Typography
            variant="body1" // Standard body text
            color="text.secondary"
            sx={{
              mb: 4,
              // maxWidth: '450px', // Optional: Limit width slightly more
              // mx: 'auto'
            }}
          >
            Trang bạn đang tìm kiếm không tồn tại hoặc đã được chuyển đi.
            Vui lòng kiểm tra lại đường dẫn hoặc quay về trang chủ.
          </Typography>

          {/* Action Buttons */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }} // Stack vertically on small screens
            spacing={2} // Space between buttons
            justifyContent="center" // Center buttons horizontally
          >
            <Button
              variant="outlined"
              color="primary"
              size="medium" // Smaller button size
              startIcon={<ArrowBackIcon />}
              onClick={goBack}
            >
              Quay lại
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="medium" // Smaller button size
              component={Link}
              to="/"
              startIcon={<HomeIcon />}
            >
              Về trang chủ
            </Button>
          </Stack>

          {/* Removed the complex decorative animation box */}

        </Paper>
    </Container>
  );
};

export default NotFound;