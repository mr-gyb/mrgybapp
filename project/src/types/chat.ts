import { ChatCompletionContentPart } from "openai/resources/chat/completions";

export type ParticipantType = 'user' | 'agent';

export interface ChatParticipant {
  uid: string;
  type: ParticipantType;
  displayName: string;
  photoURL?: string;
  joinedAt?: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId?: string;
  aiAgent?: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  senderType?: ParticipantType | 'system';
  createdAt: string;
  fileType?: 'image' | 'document' | 'video' | 'audio';
  fileName?: string;
  file?: File;
}

export interface Chat {
  id: string;
  title: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  participants?: ChatParticipant[];
  agents?: string[];
  lastMessageAt?: string;
  createdBy?: string;
  participantIds?: string[];
  messages?: Message[];
}

interface ImageContent {
  type: 'image_url';
  image_url: {
    url: string;
  };
}

interface TextContent {
  type: 'text';
  text: string;
}

export interface OpenAIMessage {
  role?: 'system' | 'assistant' | 'user';
  content: string | ChatCompletionContentPart[];
  fileType?: 'image' | 'document' | 'video' | 'audio';
  fileName?: string;
  file?: File;
}