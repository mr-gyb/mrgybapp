import { v4 as uuidv4 } from 'uuid';
import { ContentType, AnalysisResult } from '../../types/content';

const mockDerivatives = [
  {
    id: '1',
    derivative_type: 'headline',
    content: 'Innovative Solutions for Modern Business Challenges',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    derivative_type: 'blog',
    content: 'In today\'s rapidly evolving business landscape, organizations face unprecedented challenges...',
    created_at: new Date().toISOString()
  }
];

export const analyzeContent = async (
  userId: string,
  content: string | File,
  contentType: ContentType
): Promise<string> => {
  return uuidv4();
};

export const getContentAnalysis = async (analysisId: string): Promise<AnalysisResult> => {
  return {
    id: analysisId,
    content_type: 'text',
    original_content: '',
    storage_path: null,
    created_at: new Date().toISOString(),
    content_derivatives: mockDerivatives
  };
};

const handleContentUpload = async (userId: string, content: string | File) => {
  if (typeof content === 'string') {
    return { storagePath: null, contentText: content };
  }

  return { 
    storagePath: `${userId}/${uuidv4()}.${content.name.split('.').pop()}`,
    contentText: content.type === 'text/plain' ? await content.text() : ''
  };
};

const createAnalysisRecord = async (
  userId: string, 
  content: string, 
  contentType: ContentType,
  storagePath: string | null
) => {
  return {
    id: uuidv4(),
    user_id: userId,
    original_content: content,
    content_type: contentType,
    storage_path: storagePath,
    created_at: new Date().toISOString()
  };
};

const generateDerivatives = async (
  analysisId: string,
  content: string,
  contentType: ContentType
) => {
  // Mock derivative generation
  return mockDerivatives;
};

const saveDerivative = async (analysisId: string, type: string, content: string) => {
  // Mock saving derivative
  return {
    id: uuidv4(),
    analysis_id: analysisId,
    derivative_type: type,
    content: content,
    created_at: new Date().toISOString()
  };
};