import { useEffect, useState } from 'react';
import { FriendRequest, watchPendingIncomingRequests } from '../services/friendRequests';

export function usePendingRequests(currentUserId: string | null) {
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);

  useEffect(() => {
    if (!currentUserId) {
      setPendingRequests([]);
      return;
    }

    const unsubscribe = watchPendingIncomingRequests(currentUserId, (requests) => {
      // Log each request
      requests.forEach((request) => {
        console.log("Friend request added:", request);
      });

      setPendingRequests(requests);

      // State + badge logs
      console.log("Pending requests state:", requests);
      console.log("Badge count rendering:", requests.length);
    });

    return () => {
      unsubscribe();
    };
  }, [currentUserId]);

  return { pendingRequests };
}


