import React from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import { MedicalServices as MedicalServicesIcon, Search as SearchIcon } from '@mui/icons-material';

const DrugInfo = ({ drugInfo, handleSelectDrug }) => {
  if (!drugInfo) return null;
  
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 1, 
        mx: 1, 
        mt: 1, 
        borderRadius: 2, 
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.default',
        display: 'flex', 
        alignItems: 'center'
      }}
    >
      <MedicalServicesIcon color="primary" sx={{ fontSize: 28, mr: 2 }} />
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
          {drugInfo.generic_name || drugInfo.name || drugInfo.brand_name}
        </Typography>
      </Box>
      <Button 
        variant="outlined" 
        size="small" 
        startIcon={<SearchIcon />}
        onClick={handleSelectDrug}
      >
        Đổi thuốc
      </Button>
    </Paper>
  );
};

export default DrugInfo; 