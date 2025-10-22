import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  watchNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  Notification 
} from '../services/userFriendship.service';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  // Watch notifications
  useEffect(() => {
    if (!isAuthenticated || !user?.uid) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    console.log('🔔 Setting up notifications listener for user:', user.uid);
    
    const unsubscribe = watchNotifications(user.uid, (newNotifications) => {
      console.log('🔔 Received notifications:', newNotifications.length);
      setNotifications(newNotifications);
      setLoading(false);
    });

    return () => {
      console.log('🧹 Cleaning up notifications listener');
      unsubscribe();
    };
  }, [isAuthenticated, user?.uid]);

  const markAsRead = async (notificationId: string) => {
    if (!user?.uid) return;

    try {
      await markNotificationAsRead(user.uid, notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.uid) return;

    try {
      await markAllNotificationsAsRead(user.uid);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const unreadCount = notifications.filter(notif => !notif.read).length;
  const friendRequestCount = notifications.filter(
    notif => !notif.read && notif.type === 'friend_request'
  ).length;
  const acceptedRequestCount = notifications.filter(
    notif => !notif.read && notif.type === 'request_accepted'
  ).length;

  return {
    notifications,
    unreadCount,
    friendRequestCount,
    acceptedRequestCount,
    loading,
    markAsRead,
    markAllAsRead
  };
};
