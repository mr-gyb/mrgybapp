import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const CultureIcon: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 64 }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <img
      src="/culture-icon.jpg" // Image is in public/
      alt="Culture Icon"
      width={size}
      height={size}
      className={className}
      style={{ 
        display: 'inline-block',
        filter: isDarkMode ? 'brightness(0) invert(1)' : 'brightness(0)', // Dark mode: white, Light mode: black
        opacity: 1
      }}
    />
  );
};

export default CultureIcon;