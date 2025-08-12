import React from 'react';

const CultureIcon: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 48 }) => (
  <img
    src="/culture-icon.jpg" // Image is in public/
    alt="Culture Icon"
    width={size}
    height={size}
    className={className}
    style={{ display: 'inline-block' }}
  />
);

export default CultureIcon; 