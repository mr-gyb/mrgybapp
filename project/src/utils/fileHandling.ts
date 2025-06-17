import { processFileForAI } from '../api/services/chat.service';
import { OpenAIMessage } from '../types/chat';

export const getFileType = (file: File): 'image' | 'document' | 'video' | 'audio' => {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';
  return 'document';
};

export const processFileForChat = async (file: File): Promise<OpenAIMessage> => {
  try {
    return await processFileForAI(file);
  } catch (error) {
    console.error('Error processing file:', error);
    throw error;
  }
};

export const validateFileType = (file: File): boolean => {
  const allowedTypes = [
    // Images
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    // Documents
    'application/pdf', 'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    // Audio
    'audio/mpeg', 'audio/wav', 'audio/ogg',
    // Video
    'video/mp4', 'video/quicktime', 'video/webm'
  ];
  
  return allowedTypes.includes(file.type);
};

export const validateFileSize = (file: File, maxSize: number = 25 * 1024 * 1024): boolean => {
  return file.size <= maxSize;
};