import React from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import RobotIcon from '../common/RobotIcon';

const DrugInfo = ({ drugInfo, handleSelectDrug }) => {
  if (!drugInfo) return null;
  
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 1.5, 
        mx: 1, 
        mt: 1, 
        borderRadius: 2, 
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.default'
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'space-between' 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <RobotIcon height={28} sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {drugInfo.brand_name || drugInfo.name || drugInfo.generic_name || 'Thông tin thuốc'}
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
      </Box>
    </Paper>
  );
};

export default DrugInfo; 