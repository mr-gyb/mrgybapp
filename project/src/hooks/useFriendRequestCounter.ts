import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { watchIncomingRequests } from '../services/friends';
import { IncomingRequest } from '../types/friendships';

/**
 * Hook to manage friend request notification counter
 * Returns the count of unseen incoming requests
 */
export const useFriendRequestCounter = () => {
  const { user } = useAuth();
  const [unseenCount, setUnseenCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setUnseenCount(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    // Subscribe to incoming requests
    const unsubscribe = watchIncomingRequests(user.uid, (requests: IncomingRequest[]) => {
      // Compute count of unseen requests
      const count = requests.filter(r => r.seen === false).length;
      setUnseenCount(count);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  return { unseenCount, isLoading };
};
