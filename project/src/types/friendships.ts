import { Timestamp } from 'firebase/firestore';

export interface Notification {
  id: string;
  type: 'friend_request' | 'request_accepted';
  fromUser: string;
  message?: string;
  timestamp: Timestamp;
  read: boolean;
}

export interface UserProfile {
  uid: string;
  name: string;
  businessName: string;
  industry: string;
  email: string;
  friends: string[];
  pendingRequests: string[];
  sentRequests: string[];
  notifications: Notification[];
}

export interface ChatRoom {
  id: string;
  members: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
