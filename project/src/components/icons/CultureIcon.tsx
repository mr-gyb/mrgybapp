import React from 'react';

const CultureIcon: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 64 }) => (
  <img
    src="/culture-icon.jpg" // Image is in public/
    alt="Culture Icon"
    width={size}
    height={size}
    className={className}
    style={{ 
      display: 'inline-block',
      filter: 'brightness(0) invert(1)', // Makes the icon white like the others
      opacity: 1
    }}
  />
);

export default CultureIcon;