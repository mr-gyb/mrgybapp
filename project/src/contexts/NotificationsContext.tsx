import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { watchNotifications, markAllAsRead, markAsRead } from '../services/notifications';
import { AppNotification } from '../types/friendships';

interface NotificationsContextType {
  notifications: AppNotification[];
  unreadCount: number;
  markAllAsRead: () => Promise<void>;
  markAsRead: (notifId: string) => Promise<void>;
  loading: boolean;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function useNotifications(): NotificationsContextType {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}

interface NotificationsProviderProps {
  children: ReactNode;
}

export function NotificationsProvider({ children }: NotificationsProviderProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (!user?.uid) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = watchNotifications(user.uid, (newNotifications) => {
      setNotifications(newNotifications);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [user?.uid]);

  const handleMarkAllAsRead = async () => {
    if (!user?.uid) return;
    
    try {
      await markAllAsRead(user.uid);
      // Optimistic update
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleMarkAsRead = async (notifId: string) => {
    if (!user?.uid) return;
    
    try {
      await markAsRead(user.uid, notifId);
      // Optimistic update
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const value: NotificationsContextType = {
    notifications,
    unreadCount,
    markAllAsRead: handleMarkAllAsRead,
    markAsRead: handleMarkAsRead,
    loading
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}
