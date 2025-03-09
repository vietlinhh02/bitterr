import React from 'react';
import { Box } from '@mui/material';
import HeroSection from './home/HeroSection';
import BenefitsSection from './home/BenefitsSection';
import FeaturesSection from './home/FeaturesSection';
import TestimonialsSection from './home/TestimonialsSection';
import CTASection from './home/CTASection';
import FooterSection from './home/FooterSection';

function Home() {
  const isLoggedIn = localStorage.getItem('token') !== null;

  return (
    <Box sx={{ 
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: 'background.default'
    }}>
      <HeroSection isLoggedIn={isLoggedIn} />
      
      {/* Wave Divider */}
      <Box
        sx={{
          height: '150px',
          backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w.org/2000/svg\' viewBox=\'0 0 1440 320\'%3E%3Cpath fill=\'%23009688\' fill-opacity=\'1\' d=\'M0,96L48,112C96,128,192,160,288,170.7C384,181,480,171,576,144C672,117,768,75,864,80C960,85,1056,139,1152,144C1248,149,1344,107,1392,85.3L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z\'%3E%3C/path%3E%3C/svg%3E")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          marginTop: -10,
          marginBottom: -50
        }}
      />
      
      <BenefitsSection />
      <FeaturesSection isLoggedIn={isLoggedIn} />
      <TestimonialsSection />
      <CTASection isLoggedIn={isLoggedIn} />
      <FooterSection />
    </Box>
  );
}

export default Home;