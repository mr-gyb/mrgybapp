import { Timestamp } from 'firebase/firestore';

export type SenderType = 'human' | 'ai';

export interface GroupChatParticipant {
  id: string; // user_id or agent_id
  type: SenderType;
  displayName: string;
  avatar?: string;
  joinedAt: Timestamp | string;
}

export interface GroupChatMessage {
  id: string;
  groupId: string;
  senderId: string;
  senderType: SenderType;
  content: string;
  timestamp: Timestamp | string;
  displayName?: string;
  avatar?: string;
}

export interface GroupChat {
  id: string;
  name: string;
  createdBy: string; // user_id of creator
  participants: GroupChatParticipant[];
  createdAt: Timestamp | string;
  updatedAt: Timestamp | string;
  lastMessageAt?: Timestamp | string;
  lastMessage?: string;
  lastMessageSender?: string;
}

export interface CreateGroupChatInput {
  name: string;
  userId: string;
  invitedUserIds: string[]; // Array of human user IDs to invite
  selectedAgentId?: string; // Optional AI agent ID
}

