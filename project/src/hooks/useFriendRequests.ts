import { useState, useEffect } from 'react';
import {
  watchPendingIncomingRequests,
  watchPendingSentRequests,
  FriendRequest
} from '../services/friendRequests';
import { doc, getDoc, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface FriendRequestWithNames extends FriendRequest {
  senderName?: string;
  receiverName?: string;
}

interface UseFriendRequestsReturn {
  pendingRequests: FriendRequestWithNames[];
  sentRequests: FriendRequestWithNames[];
  error: Error | null;
  isLoading: boolean;
}

const usersCollection = collection(db, 'users');

async function getUserName(uid: string): Promise<string> {
  try {
    const userDoc = await getDoc(doc(usersCollection, uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return data.name || data.displayName || data.email || 'Unknown User';
    }
    return 'Unknown User';
  } catch (error) {
    console.error('Error fetching user name:', error);
    return 'Unknown User';
  }
}

/**
 * Hook to manage friend requests with real-time subscriptions
 */
export function useFriendRequests(currentUserId: string | null): UseFriendRequestsReturn {
  const [pendingRequests, setPendingRequests] = useState<FriendRequestWithNames[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequestWithNames[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUserId) {
      setPendingRequests([]);
      setSentRequests([]);
      setIsLoading(false);
      return;
    }

    console.log('👂 Setting up friend request listeners for:', currentUserId);
    setIsLoading(true);

    // Subscribe to incoming pending requests
    const unsubscribeIncoming = watchPendingIncomingRequests(currentUserId, async (requests) => {
      console.log('🔄 useFriendRequests: Received requests from listener:', requests.length);
      console.log('🔄 useFriendRequests: Current pendingRequests state before update:', pendingRequests.length);
      
      // Fetch sender names
      const requestsWithNames = await Promise.all(
        requests.map(async (req) => {
          const senderName = await getUserName(req.senderId);
          return { ...req, senderName };
        })
      );
      
      console.log('🔄 useFriendRequests: Setting pendingRequests state to:', requestsWithNames.length, 'requests');
      console.log('🔄 useFriendRequests: Requests with names:', requestsWithNames.map(r => ({ id: r.id, senderName: r.senderName })));
      
      setPendingRequests(requestsWithNames);
      setIsLoading(false);
      
      console.log('🔄 useFriendRequests: State updated, badge count should be:', requestsWithNames.length);
    });

    // Subscribe to sent pending requests
    const unsubscribeSent = watchPendingSentRequests(currentUserId, async (requests) => {
      // Fetch receiver names
      const requestsWithNames = await Promise.all(
        requests.map(async (req) => {
          const receiverName = await getUserName(req.receiverId);
          return { ...req, receiverName };
        })
      );
      setSentRequests(requestsWithNames);
    });

    // Cleanup
    return () => {
      unsubscribeIncoming();
      unsubscribeSent();
    };
  }, [currentUserId]);

  return {
    pendingRequests,
    sentRequests,
    error,
    isLoading
  };
}