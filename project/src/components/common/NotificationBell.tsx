import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, UserPlus, MessageCircle, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePendingFriendRequests } from '../../hooks/usePendingFriendRequests';
import { useNotifications } from '../../hooks/useNotifications';
import { markAllNotificationsAsRead, markNotificationAsRead } from '../../services/notifications';

interface NotificationBellProps {
  className?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const uid = user?.uid || null;
  
  // Track pending friend requests count (starts at 0)
  const { pendingCount, isLoading: pendingLoading } = usePendingFriendRequests(uid);
  
  // Also track notifications for display
  const { notifications, unreadCount, isLoading: notificationsLoading } = useNotifications(uid);
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Combined count: pending friend requests + unread notifications
  const badgeCount = pendingCount + unreadCount;
  const isLoading = pendingLoading || notificationsLoading;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Mark all as read when opening dropdown
  useEffect(() => {
    if (isOpen && uid && unreadCount > 0) {
      markAllNotificationsAsRead(uid).catch(err => {
        console.error('Error marking notifications as read:', err);
      });
    }
  }, [isOpen, uid, unreadCount]);
  
  // Log badge count for debugging
  useEffect(() => {
    console.log('🔔 NotificationBell: Badge count updated:', {
      pendingFriendRequests: pendingCount,
      unreadNotifications: unreadCount,
      totalBadgeCount: badgeCount
    });
  }, [pendingCount, unreadCount, badgeCount]);

  const formatTime = (timestamp: any) => {
    if (!timestamp) return 'Recently';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'friend_request':
        return <UserPlus size={14} className="text-blue-500" />;
      case 'request_accepted':
        return <Check size={14} className="text-green-500" />;
      case 'new_message':
        return <MessageCircle size={14} className="text-purple-500" />;
      default:
        return <Bell size={14} className="text-gray-500" />;
    }
  };

  const getNotificationMessage = (notification: any) => {
    if (notification.message) return notification.message;
    
    switch (notification.type) {
      case 'friend_request':
        return 'sent you a friend request';
      case 'request_accepted':
        return 'accepted your friend request';
      case 'new_message':
        return 'sent you a message';
      default:
        return 'notification';
    }
  };

  if (!uid) return null;

  console.log('🔔 NotificationBell: Rendering with', {
    pendingFriendRequests: pendingCount,
    unreadNotifications: unreadCount,
    totalBadgeCount: badgeCount,
    totalNotifications: notifications.length
  });

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
        aria-label={`Notifications ${badgeCount > 0 ? `(${badgeCount} unread)` : ''}`}
      >
        <Bell size={20} />
        
        {/* Badge - shows pending friend requests + unread notifications */}
        {badgeCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {badgeCount > 9 ? '9+' : badgeCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notifications
                {badgeCount > 0 && (
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                    ({badgeCount} unread)
                  </span>
                )}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
                <p className="mt-2">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                <Bell size={48} className="mx-auto mb-4 opacity-50" />
                <p>No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                    onClick={() => {
                      if (!notification.read && uid) {
                        markNotificationAsRead(uid, notification.id).catch(err => {
                          console.error('Error marking notification as read:', err);
                        });
                      }
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-900 dark:text-white">
                            <span className="font-medium">
                              {notification.fromUser || 'Someone'}
                            </span>{' '}
                            {getNotificationMessage(notification)}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatTime(notification.timestamp)}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  if (uid) {
                    markAllNotificationsAsRead(uid).catch(err => {
                      console.error('Error marking all as read:', err);
                    });
                  }
                }}
                className="text-center w-full text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

