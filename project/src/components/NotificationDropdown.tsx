import React, { useState, useEffect } from 'react';
import { Bell, Check, X, UserPlus, MessageCircle, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { 
  watchUserNotifications,
  markNotificationAsRead,
  removeNotification,
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
  archiveNotification
} from '../services/notifications';
import { Notification } from '../types/friendships';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface NotificationDropdownProps {
  className?: string;
  onNotificationClick?: (notification: Notification) => void;
}

interface NotificationWithUser extends Notification {
  fromUserName?: string;
  fromUserEmail?: string;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  className = '',
  onNotificationClick
}) => {
  const [notifications, setNotifications] = useState<NotificationWithUser[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState<Set<string>>(new Set());
  
  const { user } = useAuth();

  // Load user profile data for notifications
  const loadUserProfile = async (uid: string): Promise<{name: string, email: string}> => {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        return {
          name: userData.name || 'Unknown User',
          email: userData.email || ''
        };
      }
      return {
        name: 'Unknown User',
        email: ''
      };
    } catch (error) {
      console.error('Error loading user profile:', error);
      return {
        name: 'Unknown User',
        email: ''
      };
    }
  };

  // Watch user notifications
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = watchUserNotifications(user.uid, async (notifications) => {
      // Load user profiles for all notifications
      const notificationsWithUsers: NotificationWithUser[] = [];
      
      for (const notification of notifications) {
        const userProfile = await loadUserProfile(notification.fromUserUid);
        notificationsWithUsers.push({
          ...notification,
          fromUserName: userProfile.name,
          fromUserEmail: userProfile.email
        });
      }
      
      setNotifications(notificationsWithUsers);
      
      // Update unread count
      const unread = notifications.filter(n => !n.read).length;
      setUnreadCount(unread);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Handle notification click
  const handleNotificationClick = async (notification: NotificationWithUser) => {
    if (!notification.read) {
      try {
        setLoading(prev => new Set(prev).add(notification.id));
        await markNotificationAsRead(user?.uid || '', notification.id);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      } finally {
        setLoading(prev => {
          const newSet = new Set(prev);
          newSet.delete(notification.id);
          return newSet;
        });
      }
    }

    // Call the callback
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
  };

  // Handle archive notification
  const handleArchiveNotification = async (notificationId: string) => {
    try {
      setLoading(prev => new Set(prev).add(notificationId));
      await archiveNotification(user?.uid || '', notificationId);
    } catch (error) {
      console.error('Error archiving notification:', error);
    } finally {
      setLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  // Handle remove notification
  const handleRemoveNotification = async (notificationId: string) => {
    try {
      setLoading(prev => new Set(prev).add(notificationId));
      await removeNotification(user?.uid || '', notificationId);
    } catch (error) {
      console.error('Error removing notification:', error);
    } finally {
      setLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead(user?.uid || '');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'friend_request':
        return <UserPlus size={16} className="text-blue-500" />;
      case 'request_sent':
        return <UserPlus size={16} className="text-gray-500" />;
      case 'request_accepted':
        return <Check size={16} className="text-green-500" />;
      case 'new_message':
        return <MessageCircle size={16} className="text-purple-500" />;
      default:
        return <Bell size={16} className="text-gray-500" />;
    }
  };

  // Get notification message
  const getNotificationMessage = (notification: NotificationWithUser) => {
    if (notification.message) {
      return notification.message;
    }
    
    switch (notification.type) {
      case 'friend_request':
        return `${notification.fromUserName} sent you a friend request`;
      case 'request_sent':
        return `Friend request sent`;
      case 'request_accepted':
        return `${notification.fromUserName} accepted your friend request`;
      case 'new_message':
        return `${notification.fromUserName} sent you a message`;
      default:
        return 'New notification';
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`notification-dropdown relative ${className}`}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications
                .sort((a, b) => b.timestamp.toDate().getTime() - a.timestamp.toDate().getTime())
                .map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 font-medium">
                          {getNotificationMessage(notification)}
                        </p>
                        <div className="flex items-center mt-1 space-x-2">
                          <Clock size={12} className="text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center space-x-1">
                        {!notification.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNotificationClick(notification);
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Mark as read"
                          >
                            <Check size={14} />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleArchiveNotification(notification.id);
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Archive"
                        >
                          <span className="text-xs">Archive</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveNotification(notification.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Remove notification"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="p-8 text-center">
                <Bell size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm">No notifications</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationDropdown;
