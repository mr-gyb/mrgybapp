import { useState, useEffect } from 'react';
import { watchUserNotifications } from '../services/notifications';
import { Notification } from '../types/friendships';

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to manage user notifications with real-time subscriptions
 */
export function useNotifications(userId: string | null): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    console.log('🔔 Setting up notification listener for:', userId);
    setIsLoading(true);

    try {
      const unsubscribe = watchUserNotifications(userId, (notifications) => {
        console.log('🔔 Notifications received:', notifications.length);
        console.log('🔔 Notifications state:', notifications);
        console.log('🔔 Unread count:', notifications.filter(n => !n.read).length);
        
        setNotifications(notifications);
        setIsLoading(false);
        setError(null);
      });

      return () => {
        console.log('🔔 Cleaning up notification listener');
        unsubscribe();
      };
    } catch (err) {
      console.error('❌ Error setting up notification listener:', err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setIsLoading(false);
    }
  }, [userId]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    error
  };
}
