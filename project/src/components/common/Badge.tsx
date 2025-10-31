import React from 'react';

interface BadgeProps {
  count: number;
  className?: string;
  max?: number; // Maximum number to show before using "+"
}

/**
 * Reusable Badge component for displaying counts
 */
export const Badge: React.FC<BadgeProps> = ({ count, className = '', max = 99 }) => {
  console.log('🏷️ Badge component rendering with count:', count);
  
  if (count <= 0) {
    console.log('🏷️ Badge: count is 0, returning null (badge hidden)');
    return null;
  }

  const displayCount = count > max ? `${max}+` : count;
  console.log('🏷️ Badge: displaying count', displayCount);

  return (
    <span 
      className={`bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ${className}`}
      aria-label={`${count} notifications`}
    >
      {displayCount}
    </span>
  );
};
