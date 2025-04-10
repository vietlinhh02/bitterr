import React from 'react';
import { Box } from '@mui/material';
import Footer from './Footer';

// This component will wrap your main content and ensure proper spacing for the fixed footer
const Layout = ({ children }) => {
  return (
    <Box 
      sx={{ 
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh', // Make sure it fills at least the viewport height
      }}
    >
      {/* Main content area with bottom padding to prevent footer overlap */}
      <Box 
        component="main"
        sx={{ 
          flexGrow: 1,
          pb: '60px', // Add padding at bottom equal to the footer height
                     // Adjust this value based on your footer's actual height
        }}
      >
        {children}
      </Box>
      <Footer />
    </Box>
  );
};

export default Layout;
