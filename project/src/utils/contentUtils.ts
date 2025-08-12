import { ContentItem, DEFAULT_CONTENT_ITEMS, ContentType } from '../types/content';

/**
 * Check if user has any real content (not default/sample content)
 */
export const hasRealContent = (items: ContentItem[]): boolean => {
  return items.some(item => !item.id.startsWith('default-'));
};

/**
 * Filter out default content items
 */
export const filterRealContent = (items: ContentItem[]): ContentItem[] => {
  return items.filter(item => !item.id.startsWith('default-'));
};

/**
 * Get content items to display (real content or defaults if empty)
 */
export const getDisplayContent = (
  userContent: ContentItem[], 
  showDefaults: boolean = true
): ContentItem[] => {
  if (userContent.length > 0) {
    return userContent;
  }
  return showDefaults ? DEFAULT_CONTENT_ITEMS : [];
};

/**
 * Check if content item is a default/sample item
 */
export const isDefaultContent = (item: ContentItem): boolean => {
  return item.id.startsWith('default-');
};

/**
 * Get content statistics
 */
export const getContentStats = (items: ContentItem[]) => {
  const realContent = filterRealContent(items);
  
  return {
    total: realContent.length,
    byType: realContent.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byStatus: realContent.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };
};

/**
 * Get content suggestions based on user's existing content
 */
export const getContentSuggestions = (items: ContentItem[]): string[] => {
  const realContent = filterRealContent(items);
  const suggestions: string[] = [];

  if (realContent.length === 0) {
    suggestions.push(
      'Upload a video to create engaging social media content',
      'Add images to generate captions and hashtags',
      'Upload audio files for podcast optimization',
      'Create written content for blog posts and articles'
    );
  } else {
    const types = realContent.map(item => item.type);
    
    if (!types.includes('video')) {
      suggestions.push('Try uploading a video to expand your content mix');
    }
    if (!types.includes('photo')) {
      suggestions.push('Add images to create visual content');
    }
    if (!types.includes('audio')) {
      suggestions.push('Upload audio for podcast content');
    }
    if (!types.includes('written')) {
      suggestions.push('Create written content for blogs and articles');
    }
  }

  return suggestions;
}; 

/**
 * Generate title suggestions based on content type and file information
 */
export const generateTitleSuggestions = (
  contentType: ContentType,
  fileName?: string,
  category?: string
): string[] => {
  const suggestions: string[] = [];
  
  // Remove file extension for better suggestions
  const baseFileName = fileName ? fileName.replace(/\.[^/.]+$/, '') : '';
  
  // Generate suggestions based on content type
  switch (contentType) {
    case 'video':
      suggestions.push(
        'My Video Content',
        'Video Upload',
        'Video Content',
        'Video File'
      );
      break;
    case 'photo':
    case 'image':
      suggestions.push(
        'My Image',
        'Photo Upload',
        'Image Content',
        'Visual Content'
      );
      break;
    case 'audio':
      suggestions.push(
        'My Audio',
        'Audio Recording',
        'Audio Content',
        'Sound File'
      );
      break;
    case 'written':
    case 'text':
    case 'document':
      suggestions.push(
        'My Document',
        'Written Content',
        'Text File',
        'Document Upload'
      );
      break;
    default:
      suggestions.push(
        'My Content',
        'Content Upload',
        'New Content',
        'Uploaded File'
      );
  }
  
  // Add category-based suggestions
  if (category) {
    suggestions.push(
      `${category} Content`,
      `My ${category}`,
      `${category} Upload`
    );
  }
  
  // Add filename-based suggestions if available
  if (baseFileName) {
    // Clean up filename (remove special characters, capitalize)
    const cleanFileName = baseFileName
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
    
    suggestions.push(
      cleanFileName,
      `${cleanFileName} Content`,
      `My ${cleanFileName}`
    );
  }
  
  // Remove duplicates and return
  return [...new Set(suggestions)];
};

/**
 * Get the best title suggestion based on content type and file info
 */
export const getBestTitleSuggestion = (
  contentType: ContentType,
  fileName?: string,
  category?: string
): string => {
  const suggestions = generateTitleSuggestions(contentType, fileName, category);
  return suggestions[0] || 'My Content';
}; 
