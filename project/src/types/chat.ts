import { ChatCompletionContentPart } from "openai/resources/chat/completions";

export interface Message {
  id: string;
  chatId: string;
  senderId?: string;
  aiAgent?: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
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
  content: string | ChatCompletionContentPart[];
  fileType?: 'image' | 'document' | 'video' | 'audio';
  fileName?: string;
  file?: File;
}