export type ContentType = 'video' | 'photo' | 'audio' | 'written' | 'text' | 'image' | 'document';

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  type: ContentType;
  status: string;
  createdAt: string;
  originalUrl?: string;
  thumbnail?: string;
  engagement?: number;
  views?: number;
  generatedAssets?: Array<{
    id: string;
    type: string;
    status: string;
    content: string;
  }>;
  platforms?: string[];
  blogPlatform?: string | null; // Optional blog platform for blog content
  isAISuggestion?: boolean; // Flag for AI-generated suggestions
  suggestionData?: any; // Additional data for AI suggestions
}

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

// Default content items for new users
export const DEFAULT_CONTENT_ITEMS: ContentItem[] = [
  {
    id: 'default-1',
    title: 'Welcome to GYB Studio',
    description: 'This is your first content item. Upload your own content to get started with content creation and analysis.',
    type: 'written',
    status: 'pending',
    createdAt: new Date().toISOString(),
    engagement: 1250,
    views: 450,
    generatedAssets: [
      {
        id: 'asset-1',
        type: 'blog',
        status: 'pending',
        content: 'Welcome to your content creation journey! Start by uploading your first piece of content.'
      },
      {
        id: 'asset-2',
        type: 'headline',
        status: 'pending',
        content: 'Begin Your Content Creation Journey'
      }
    ],
    platforms: ['blog', 'social']
  },
  {
    id: 'default-2',
    title: 'Sample Video Content',
    description: 'Upload video content to analyze and generate engaging derivatives for multiple platforms.',
    type: 'video',
    status: 'pending',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    engagement: 2850,
    views: 1200,
    generatedAssets: [
      {
        id: 'asset-3',
        type: 'video',
        status: 'pending',
        content: 'Video content analysis and optimization'
      }
    ],
    platforms: ['youtube', 'instagram', 'tiktok']
  },
  {
    id: 'default-3',
    title: 'Sample Image Content',
    description: 'Upload images to create visual content and generate captions, hashtags, and marketing copy.',
    type: 'photo',
    status: 'pending',
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    originalUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    engagement: 1620,
    views: 850,
    generatedAssets: [
      {
        id: 'asset-4',
        type: 'image',
        status: 'pending',
        content: 'Image optimization and caption generation'
      }
    ],
    platforms: ['instagram', 'pinterest', 'facebook']
  },
  {
    id: 'default-4',
    title: 'Sample Audio Content',
    description: 'Upload audio files to create podcast content, transcriptions, and social media clips.',
    type: 'audio',
    status: 'pending',
    createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    engagement: 920,
    views: 320,
    generatedAssets: [
      {
        id: 'asset-5',
        type: 'audio',
        status: 'pending',
        content: 'Audio transcription and podcast optimization'
      }
    ],
    platforms: ['spotify', 'apple-podcasts', 'youtube']
  }
];

// Default content derivatives for analysis
export const DEFAULT_CONTENT_DERIVATIVES: ContentDerivative[] = [
  {
    id: 'derivative-1',
    derivative_type: 'headline',
    content: 'Transform Your Content Strategy with AI-Powered Analysis',
    created_at: new Date().toISOString()
  },
  {
    id: 'derivative-2',
    derivative_type: 'blog',
    content: 'In today\'s digital landscape, content creation has become more important than ever. With the right tools and strategies, you can create engaging content that resonates with your audience and drives results. Start by uploading your first piece of content and let our AI analyze it to generate valuable insights and derivatives.',
    created_at: new Date().toISOString()
  },
  {
    id: 'derivative-3',
    derivative_type: 'summary',
    content: 'Learn how to leverage AI-powered content analysis to create better, more engaging content for your audience.',
    created_at: new Date().toISOString()
  },
  {
    id: 'derivative-4',
    derivative_type: 'seo_tags',
    content: 'content creation, AI analysis, digital marketing, social media, content strategy, audience engagement',
    created_at: new Date().toISOString()
  }
];
