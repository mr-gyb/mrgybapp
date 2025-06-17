export interface MediaContent {
  id: string;
  userId: string;
  title: string | null;
  description: string | null;
  contentType: 'video' | 'audio' | 'image' | 'document' | 'link';
  originalUrl: string | null;
  storagePath: string | null;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  media_derivatives?: MediaDerivative[];
}

export interface MediaTranscription {
  id: string;
  mediaId: string;
  content: string;
  language: string;
  createdAt: string;
}

export interface MediaDerivative {
  id: string;
  mediaId: string;
  derivativeType: 'blog' | 'summary' | 'headline' | 'seo_tags' | 'audio' | 'video' | 'image';
  content: string | null;
  storagePath: string | null;
  metadata?: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface MediaTag {
  id: string;
  mediaId: string;
  tag: string;
  createdAt: string;
}

export interface MediaUploadResult {
  id: string;
  url: string;
  type: string;
}

export interface MediaProcessingStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
}