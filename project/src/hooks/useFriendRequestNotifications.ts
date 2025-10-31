import { useState, useEffect, useCallback } from 'react';
import { 
  watchIncomingRequests, 
  markIncomingSeen,
  IncomingRequest
} from '../services/friends';

interface UseFriendRequestNotificationsReturn {
  badgeCount: number;
  incomingRequests: IncomingRequest[];
  unseenCount: number;
  markAsSeen: () => Promise<void>;
  isLoading: boolean;
}

/**
 * Hook to manage friend request notifications
 * Provides badge count, incoming requests, and utilities to mark as seen
 */
export const useFriendRequestNotifications = (currentUid: string): UseFriendRequestNotificationsReturn => {
  const [incomingRequests, setIncomingRequests] = useState<IncomingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate counts
  const unseenCount = incomingRequests.filter(req => !req.seen).length;
  const badgeCount = unseenCount;

  // Watch incoming requests
  useEffect(() => {
    if (!currentUid) return;
    
    const unsubscribe = watchIncomingRequests(currentUid, (requests) => {
      setIncomingRequests(requests);
    });
    
    return unsubscribe;
  }, [currentUid]);

  // Mark all incoming requests as seen
  const markAsSeen = useCallback(async () => {
    if (unseenCount === 0) return;
    
    setIsLoading(true);
    try {
      await markIncomingSeen(currentUid);
      console.log('✅ All incoming requests marked as seen');
    } catch (error) {
      console.error('❌ Error marking requests as seen:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentUid, unseenCount]);

  return {
    badgeCount,
    incomingRequests,
    unseenCount,
    markAsSeen,
    isLoading
  };
};
