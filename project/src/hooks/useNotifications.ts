import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  watchUserNotifications,
  markNotificationAsRead,
  removeNotification,
  markAllNotificationsAsRead,
  getUnreadNotificationCount
} from '../services/notifications';
import { Notification } from '../types/friendships';

export const useUserNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();

  // Watch user notifications
  useEffect(() => {
    if (!user?.uid) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setLoading(true);
    
    const unsubscribe = watchUserNotifications(user.uid, (notifications) => {
      setNotifications(notifications);
      
      // Update unread count
      const unread = notifications.filter(n => !n.read).length;
      setUnreadCount(unread);
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    if (!user?.uid) return;
    
    try {
      await markNotificationAsRead(user.uid, notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  };

  // Remove notification
  const remove = async (notificationId: string) => {
    if (!user?.uid) return;
    
    try {
      await removeNotification(user.uid, notificationId);
    } catch (error) {
      console.error('Error removing notification:', error);
      throw error;
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!user?.uid) return;
    
    try {
      await markAllNotificationsAsRead(user.uid);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  };

  // Get notifications by type
  const getNotificationsByType = (type: string) => {
    return notifications.filter(n => n.type === type);
  };

  // Get unread notifications
  const getUnreadNotifications = () => {
    return notifications.filter(n => !n.read);
  };

  // Get recent notifications (last 24 hours)
  const getRecentNotifications = () => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return notifications.filter(n => {
      const notificationDate = n.timestamp.toDate();
      return notificationDate > oneDayAgo;
    });
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    remove,
    markAllAsRead,
    getNotificationsByType,
    getUnreadNotifications,
    getRecentNotifications
  };
};