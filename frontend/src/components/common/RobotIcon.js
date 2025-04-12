import React from 'react';
import { Box } from '@mui/material';
import robotSvg from '../../assets/images/robot.svg';

/**
 * Component Robot Icon sử dụng riêng cho chức năng chat với AI
 * @param {Object} props - Props của component
 * @param {number} [props.height=24] - Chiều cao của icon
 * @param {Object} [props.sx={}] - Style bổ sung cho icon
 * @returns {JSX.Element} Robot Icon component
 */
const RobotIcon = ({ height = 24, sx = {}, ...props }) => {
  return (
    <Box 
      component="img" 
      src={robotSvg} 
      alt="AI Robot" 
      sx={{ 
        height: height,
        ...sx
      }}
      {...props}
    />
  );
};

export default RobotIcon; 