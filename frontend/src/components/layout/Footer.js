import React from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  Stack,
  IconButton,
  Divider // Keep Divider for separation
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
  // LocalPharmacy as LocalPharmacyIcon, // Remove if logo isn't used
  // KeyboardArrowUp as KeyboardArrowUpIcon // Remove if scroll-to-top isn't used
} from '@mui/icons-material';

const Footer = () => {
  // Optional: Scroll to top function if you want to keep the button
  // const scrollToTop = () => {
  //   window.scrollTo({ top: 0, behavior: 'smooth' });
  // };

  return (
    <Box
      component="footer" // Use semantic footer tag
      sx={{
        bgcolor: '#1e2a38', // Keep dark background
        color: 'rgba(255,255,255,0.7)', // Default lighter text color
        py: 2, // Reduced vertical padding
        position: 'fixed', // Fix position at the bottom
        bottom: 0, // Align to bottom of viewport
        left: 0, // Stretch full width from left
        right: 0, // to right edge
        width: '100%', // Ensure full width
        zIndex: 1000, // Ensure it stays on top of content
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)', // Optional: add slight shadow for depth
      }}
    >
      <Container maxWidth="lg">
        {/* Single row for content */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }} // Stack vertically on small screens
          justifyContent="space-between"
          alignItems="center"
          spacing={{ xs: 2, sm: 1 }} // Adjust spacing
        >
          {/* Copyright */}
          <Typography variant="body2" sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
            © {new Date().getFullYear()} MediDetect. All Rights Reserved.
          </Typography>

          {/* Links & Social */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={2} // Spacing between link groups and social icons
            divider={<Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.2)', height: '1em', alignSelf: 'center' }} />} // Subtle divider
          >
            {/* Essential Links */}
            <Stack direction="row" spacing={1.5}>
              <Link href="/privacy-policy" underline="hover" color="inherit" sx={{ fontSize: '0.8rem', '&:hover': { color: '#4db6ac' } }}>
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" underline="hover" color="inherit" sx={{ fontSize: '0.8rem', '&:hover': { color: '#4db6ac' } }}>
                Terms of Service
              </Link>
              <Link href="/contact" underline="hover" color="inherit" sx={{ fontSize: '0.8rem', '&:hover': { color: '#4db6ac' } }}>
                Contact
              </Link>
            </Stack>

            {/* Social Icons */}
            <Stack direction="row" spacing={0.5}>
              <IconButton size="small" href="#" target="_blank" rel="noopener noreferrer" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#fff' } }} aria-label="Facebook">
                <FacebookIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" href="#" target="_blank" rel="noopener noreferrer" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#fff' } }} aria-label="Twitter">
                <TwitterIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" href="#" target="_blank" rel="noopener noreferrer" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#fff' } }} aria-label="Instagram">
                <InstagramIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" href="#" target="_blank" rel="noopener noreferrer" sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#fff' } }} aria-label="LinkedIn">
                <LinkedInIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Stack>

          {/* Optional: Scroll to Top Button - uncomment if needed */}
          {/* <IconButton
            size="small"
            onClick={scrollToTop}
            sx={{
              color: 'white',
              bgcolor: 'rgba(77, 182, 172, 0.5)', // More subtle background
              '&:hover': { bgcolor: '#4db6ac' }, // Highlight on hover
              position: 'fixed', // Or keep it static in the footer flow
              bottom: 16,
              right: 16, // Position if fixed
              // If static, remove position/bottom/right and potentially add margin
            }}
            aria-label="Scroll back to top"
          >
            <KeyboardArrowUpIcon />
          </IconButton> */}
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;