import { Timestamp } from 'firebase/firestore';

// User profile with friendship data
export interface UserProfile {
  uid: string;
  name: string;
  businessName: string;
  industry: string;
  email: string;
  friends: string[];          // accepted friend UIDs
  pendingRequests: string[];  // incoming friend request UIDs
  sentRequests: string[];     // outgoing friend request UIDs
  notifications: Notification[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Notification structure
export interface Notification {
  id: string;
  type: 'friend_request' | 'request_accepted' | 'message';
  fromUser: string;
  message?: string;
  timestamp: Timestamp;
  read: boolean;
}

// Friend request structure
export interface FriendRequest {
  id: string;
  fromUid: string;
  toUid: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Chat room structure
export interface ChatRoom {
  id: string;
  members: string[];  // UIDs of two users
  messages: Message[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Message structure
export interface Message {
  id: string;
  sender: string;      // UID of sender
  content: string;
  timestamp: Timestamp;
  readBy: string[];    // UIDs of users who have read the message
}

// Friend request with user details
export interface FriendRequestWithUser {
  id: string;
  fromUid: string;
  toUid: string;
  status: 'pending' | 'accepted' | 'declined';
  fromUser: UserProfile;
  toUser: UserProfile;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Chat room with user details
export interface ChatRoomWithUsers {
  id: string;
  members: string[];
  memberProfiles: UserProfile[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Service response types
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Real-time listener types
export type FriendRequestListener = (requests: FriendRequestWithUser[]) => void;
export type ChatRoomListener = (chatRooms: ChatRoomWithUsers[]) => void;
export type MessageListener = (messages: Message[]) => void;
export type NotificationListener = (notifications: Notification[]) => void;