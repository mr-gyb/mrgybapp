import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  getFriendsList,
  watchIncomingRequests
} from '../services/friends.service';
import {
  createChatRoom,
  sendMessage,
  watchMessages,
  watchUserChatRooms,
  markMessagesAsRead,
  getOrCreateChatRoom
} from '../services/chat.service';
import { 
  UserProfile, 
  FriendRequestWithUser, 
  ChatRoomWithUsers, 
  Message,
  ServiceResponse 
} from '../types/friendship';

export const useFriendService = () => {
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequestWithUser[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoomWithUsers[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user, isAuthenticated } = useAuth();

  // Load friends list
  const loadFriends = useCallback(async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getFriendsList(user.uid);
      if (response.success && response.data) {
        setFriends(response.data);
      } else {
        setError(response.error || 'Failed to load friends');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load friends');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Send friend request
  const sendRequest = useCallback(async (toUid: string): Promise<boolean> => {
    if (!user?.uid) return false;
    
    try {
      const response = await sendFriendRequest(user.uid, toUid);
      if (response.success) {
        return true;
      } else {
        setError(response.error || 'Failed to send friend request');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send friend request');
      return false;
    }
  }, [user?.uid]);

  // Accept friend request
  const acceptRequest = useCallback(async (requestId: string): Promise<boolean> => {
    try {
      const response = await acceptFriendRequest(requestId);
      if (response.success) {
        // Reload friends list after accepting
        await loadFriends();
        return true;
      } else {
        setError(response.error || 'Failed to accept friend request');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to accept friend request');
      return false;
    }
  }, [loadFriends]);

  // Decline friend request
  const declineRequest = useCallback(async (requestId: string): Promise<boolean> => {
    try {
      const response = await declineFriendRequest(requestId);
      if (response.success) {
        return true;
      } else {
        setError(response.error || 'Failed to decline friend request');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to decline friend request');
      return false;
    }
  }, []);

  // Start chat with friend
  const startChat = useCallback(async (friendUid: string): Promise<string | null> => {
    if (!user?.uid) return null;
    
    try {
      const response = await getOrCreateChatRoom(user.uid, friendUid);
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.error || 'Failed to start chat');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start chat');
      return null;
    }
  }, [user?.uid]);

  // Send message
  const sendChatMessage = useCallback(async (
    chatRoomId: string, 
    content: string
  ): Promise<boolean> => {
    if (!user?.uid) return false;
    
    try {
      const response = await sendMessage(chatRoomId, user.uid, content);
      if (response.success) {
        return true;
      } else {
        setError(response.error || 'Failed to send message');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
      return false;
    }
  }, [user?.uid]);

  // Mark messages as read
  const markAsRead = useCallback(async (chatRoomId: string): Promise<boolean> => {
    if (!user?.uid) return false;
    
    try {
      const response = await markMessagesAsRead(chatRoomId, user.uid);
      if (response.success) {
        return true;
      } else {
        setError(response.error || 'Failed to mark messages as read');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to mark messages as read');
      return false;
    }
  }, [user?.uid]);

  // Watch incoming friend requests
  useEffect(() => {
    if (!isAuthenticated || !user?.uid) return;

    console.log('🔔 Setting up friend requests listener for user:', user.uid);
    
    const unsubscribe = watchIncomingRequests(user.uid, (requests) => {
      console.log('📨 Received friend requests:', requests.length);
      setIncomingRequests(requests);
    });

    return () => {
      console.log('🧹 Cleaning up friend requests listener');
      unsubscribe();
    };
  }, [isAuthenticated, user?.uid]);

  // Watch user's chat rooms
  useEffect(() => {
    if (!isAuthenticated || !user?.uid) return;

    console.log('💬 Setting up chat rooms listener for user:', user.uid);
    
    const unsubscribe = watchUserChatRooms(user.uid, (rooms) => {
      console.log('💬 Received chat rooms:', rooms.length);
      setChatRooms(rooms);
    });

    return () => {
      console.log('🧹 Cleaning up chat rooms listener');
      unsubscribe();
    };
  }, [isAuthenticated, user?.uid]);

  // Load friends on mount
  useEffect(() => {
    if (isAuthenticated && user?.uid) {
      loadFriends();
    }
  }, [isAuthenticated, user?.uid, loadFriends]);

  return {
    // State
    friends,
    incomingRequests,
    chatRooms,
    loading,
    error,
    
    // Actions
    loadFriends,
    sendRequest,
    acceptRequest,
    declineRequest,
    startChat,
    sendChatMessage,
    markAsRead,
    
    // Computed
    pendingRequestsCount: incomingRequests.length,
    unreadMessagesCount: chatRooms.reduce((total, room) => total + room.unreadCount, 0)
  };
};

// Hook for watching messages in a specific chat room
export const useChatMessages = (chatRoomId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!chatRoomId) {
      setMessages([]);
      return;
    }

    console.log('💬 Setting up messages listener for chat room:', chatRoomId);
    setLoading(true);
    
    const unsubscribe = watchMessages(chatRoomId, (newMessages) => {
      console.log('💬 Received messages:', newMessages.length);
      setMessages(newMessages);
      setLoading(false);
    });

    return () => {
      console.log('🧹 Cleaning up messages listener');
      unsubscribe();
    };
  }, [chatRoomId]);

  return {
    messages,
    loading,
    error
  };
};
