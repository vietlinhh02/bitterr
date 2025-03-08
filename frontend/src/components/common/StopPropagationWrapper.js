import React from 'react';
import { Box } from '@mui/material';

const StopPropagationWrapper = ({ children }) => {
  const handleClick = (e) => {
    e.stopPropagation();
  };

  return (
    <Box 
      onClick={handleClick} 
      onMouseDown={handleClick}
      onMouseUp={handleClick}
      onTouchStart={handleClick}
      onTouchEnd={handleClick}
      sx={{ width: '100%', height: '100%' }}
    >
      {children}
    </Box>
  );
};

export default StopPropagationWrapper; 