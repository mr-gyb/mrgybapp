import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { 
  watchIncomingRequests, 
  markIncomingSeen,
  IncomingRequest
} from '../services/friends';

interface NotificationBadgeProps {
  currentUid: string;
  className?: string;
  showIcon?: boolean;
  onBadgeClick?: () => void;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ 
  currentUid, 
  className = '',
  showIcon = true,
  onBadgeClick
}) => {
  const [incomingRequests, setIncomingRequests] = useState<IncomingRequest[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  // Calculate badge count (only unseen incoming requests)
  const badgeCount = incomingRequests.filter(req => !req.seen).length;

  // Watch incoming requests for badge count
  useEffect(() => {
    if (!currentUid) return;
    
    const unsubscribe = watchIncomingRequests(currentUid, (requests) => {
      setIncomingRequests(requests);
    });
    
    return unsubscribe;
  }, [currentUid]);

  // Show/hide badge based on count
  useEffect(() => {
    setIsVisible(badgeCount > 0);
  }, [badgeCount]);

  // Mark all incoming requests as seen when badge is clicked
  const handleBadgeClick = async () => {
    if (badgeCount > 0) {
      try {
        await markIncomingSeen(currentUid);
        console.log('✅ All incoming requests marked as seen');
      } catch (error) {
        console.error('❌ Error marking requests as seen:', error);
      }
    }
    
    // Call the optional callback
    if (onBadgeClick) {
      onBadgeClick();
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <button
      onClick={handleBadgeClick}
      className={`relative inline-flex items-center justify-center ${className}`}
      aria-label={`${badgeCount} unread friend requests`}
    >
      {showIcon && (
        <Bell 
          size={20} 
          className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors" 
        />
      )}
      
      {/* Badge */}
      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
        {badgeCount > 99 ? '99+' : badgeCount}
      </span>
    </button>
  );
};

export default NotificationBadge;
