import React from 'react';
import { Container } from '@mui/material';

const CustomContainer = ({ children, ...props }) => {
  const handleClick = (e) => {
    e.stopPropagation();
  };

  return (
    <Container
      {...props}
      onClick={handleClick}
      onMouseDown={handleClick}
      onMouseUp={handleClick}
      onTouchStart={handleClick}
      onTouchEnd={handleClick}
    >
      {children}
    </Container>
  );
};

export default CustomContainer; 