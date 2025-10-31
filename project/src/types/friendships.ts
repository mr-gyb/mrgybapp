import { Timestamp } from 'firebase/firestore';

export interface IncomingRequest {
  id: string;         // `${fromUid}_${toUid}`
  fromUid: string;
  fromName: string;
  createdAt: Timestamp;
  seen: boolean;
}

export interface SentRequest {
  id: string;         // `${fromUid}_${toUid}`
  toUid: string;
  toName: string;
  createdAt: Timestamp;
}

export interface FriendRef {
  uid: string;
  since: Timestamp;
}

export interface UserProfile {
  uid: string;
  name: string;
  businessName?: string;
  industry?: string;
  email: string;
  friends: FriendRef[];
  incomingRequests: IncomingRequest[];
  sentRequests: SentRequest[];
  profileImageUrl?: string;
}

export interface ChatRoom {
  id: string;
  members: string[]; // UIDs of the two users in the chat
  createdAt: Timestamp;
  lastMessageAt: Timestamp | null;
  pairKey?: string; // Deterministic key for 1:1 chats
  archivedBy?: { [uid: string]: boolean }; // Soft delete - archived by specific users
  deletedBy?: { [uid: string]: boolean }; // Per-user deletion flag; if both true, hard delete
  canHardDelete?: string[]; // User IDs allowed to permanently delete
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  text: string;
  createdAt: Timestamp;
}

export interface Notification {
  id: string;
  type: 'friend_request' | 'request_accepted' | 'new_message' | 'request_sent';
  fromUserUid: string; // UID of the user who initiated the notification
  message?: string; // Optional message for general notifications
  timestamp: Timestamp;
  read: boolean;
  archived?: boolean; // Hidden from inbox when true
  chatRoomId?: string; // For new_message notifications
}

export interface AppNotification {
  id: string;
  type: 'friend_request' | 'request_accepted';
  fromUser: string;
  toUser: string;
  createdAt: Timestamp;
  read: boolean;
}