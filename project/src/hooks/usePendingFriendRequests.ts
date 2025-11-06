import { useState, useEffect } from 'react';
import { onSnapshot, query, collection, where } from 'firebase/firestore';
import { db, handleFirestoreError } from '../lib/firebase';

/**
 * Hook to track pending friend requests count
 * Initializes to 0 and dynamically updates based on database
 */
export function usePendingFriendRequests(userId: string | null) {
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setPendingCount(0);
      setIsLoading(false);
      return;
    }

    console.log('🔔 Setting up pending friend requests listener for:', userId);
    setIsLoading(true);

    try {
      // Query friendRequests collection for pending requests where user is the receiver
      // Note: Collection uses 'fromUid' and 'toUid' fields (toUid is the receiver)
      const friendRequestsRef = collection(db, 'friendRequests');
      const q = query(
        friendRequestsRef,
        where('toUid', '==', userId),
        where('status', '==', 'pending')
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const count = snapshot.docs.length;
          console.log('🔔 Pending friend requests count:', count);
          console.log('🔔 Pending friend requests state updated from', pendingCount, 'to', count);
          
          setPendingCount(count);
          setIsLoading(false);
        },
        (error) => {
          console.error('❌ Error watching pending friend requests:', error);
          handleFirestoreError(error);
          setIsLoading(false);
        }
      );

      return () => {
        console.log('🔔 Cleaning up pending friend requests listener');
        unsubscribe();
      };
    } catch (error) {
      console.error('❌ Error setting up pending friend requests listener:', error);
      setIsLoading(false);
    }
  }, [userId]);

  return {
    pendingCount,
    isLoading
  };
}

