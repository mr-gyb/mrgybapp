import { collection, getDocs, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ContentItem, ContentType } from '../types/content';

export interface UserContentData {
  id: string;
  userId: string;
  title: string | null;
  description: string | null;
  contentType: string;
  originalUrl: string | null;
  storagePath: string | null;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  blogPlatform?: string | null;
}

/**
 * Fetch user's uploaded content from the database
 */
export const getUserContent = async (userId: string): Promise<ContentItem[]> => {
  try {
    // Try to get content from new_content collection first (where uploads are saved)
    const newContentQuery = query(
      collection(db, 'new_content'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const newContentSnapshot = await getDocs(newContentQuery);
    const newContentItems = newContentSnapshot.docs.map(doc => {
      const data = doc.data();
      return convertToContentItem({
        id: doc.id,
        userId: data.userId,
        title: data.title,
        description: data.description,
        contentType: data.contentType || data.type,
        originalUrl: data.originalUrl || data.fileUrl,
        storagePath: data.storagePath,
        metadata: data.metadata || {},
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        blogPlatform: data.blogPlatform || null
      });
    });

    // Also try to get content from media_content collection (legacy)
    const mediaContentQuery = query(
      collection(db, 'media_content'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const mediaContentSnapshot = await getDocs(mediaContentQuery);
    const mediaContentItems = mediaContentSnapshot.docs.map(doc => {
      const data = doc.data() as UserContentData;
      return convertToContentItem(data);
    });

    // Combine both collections and remove duplicates
    const allContent = [...newContentItems, ...mediaContentItems];
    const uniqueContent = allContent.filter((item, index, self) => 
      index === self.findIndex(t => t.id === item.id)
    );

    return uniqueContent;
  } catch (error) {
    console.error('Error fetching user content:', error);
    throw error;
  }
};

/**
 * Convert database content data to ContentItem format
 */
const convertToContentItem = (data: UserContentData): ContentItem => {
  const contentType = mapContentType(data.contentType);
  
  return {
    id: data.id,
    title: data.title || `Uploaded ${contentType}`,
    description: data.description || `Your uploaded ${contentType} content`,
    type: contentType,
    status: 'pending', // Default status for uploaded content
    createdAt: data.createdAt,
    originalUrl: data.originalUrl || undefined,
    thumbnail: data.originalUrl || undefined, // Use original URL as thumbnail for now
    generatedAssets: [
      {
        id: `${data.id}-asset-1`,
        type: 'analysis',
        status: 'pending',
        content: `Analysis for ${data.title || contentType} content`
      }
    ],
    platforms: (data as any).platforms || getDefaultPlatforms(contentType),
    blogPlatform: (data as any).blogPlatform || null // Include blogPlatform if available
  };
};

/**
 * Map database content type to ContentItem type
 */
const mapContentType = (dbType: string): ContentType => {
  switch (dbType.toLowerCase()) {
    case 'video':
      return 'video';
    case 'image':
      return 'photo';
    case 'audio':
      return 'audio';
    case 'document':
    case 'text':
      return 'written';
    case 'link':
      return 'written';
    default:
      return 'written';
  }
};

/**
 * Get default platforms for content type
 */
const getDefaultPlatforms = (contentType: ContentType): string[] => {
  switch (contentType) {
    case 'video':
      return ['youtube', 'instagram', 'tiktok'];
    case 'photo':
      return ['instagram', 'pinterest', 'facebook'];
    case 'audio':
      return ['spotify', 'apple-podcasts', 'youtube'];
    case 'written':
      return ['blog', 'social', 'linkedin'];
    default:
      return ['social'];
  }
};

/**
 * Add new content to user's content list
 */
export const addUserContent = (existingContent: ContentItem[], newContent: ContentItem): ContentItem[] => {
  return [newContent, ...existingContent];
};

/**
 * Update content in user's content list
 */
export const updateUserContent = (existingContent: ContentItem[], updatedContent: ContentItem): ContentItem[] => {
  return existingContent.map(item => 
    item.id === updatedContent.id ? updatedContent : item
  );
};

/**
 * Remove content from user's content list
 */
export const removeUserContent = (existingContent: ContentItem[], contentId: string): ContentItem[] => {
  return existingContent.filter(item => item.id !== contentId);
}; 