export type ContentType = 'text' | 'image' | 'video' | 'audio' | 'document';

export interface ContentDerivative {
  id: string;
  derivative_type: 'blog' | 'headline' | 'summary' | 'seo_tags';
  content: string;
  created_at: string;
}

export interface AnalysisResult {
  id: string;
  content_type: ContentType;
  original_content: string;
  storage_path: string | null;
  created_at: string;
  content_derivatives: ContentDerivative[];
}