import { collection, getDocs, query, where, orderBy, onSnapshot, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ContentItem, ContentType } from '../types/content';
import { contentPerformanceService } from './contentPerformance.service';

export interface UserContentData {
  id: string;
  userId: string;
  title: string | null;
  description: string | null;
  contentType: string;
  originalUrl: string | null;
  createdAt: string;
  updatedAt: string;
  platforms?: string[];
  // Additional properties that might exist in different collections
  type?: string;
  fileUrl?: string;
}

/**
 * Fetch user's uploaded content from the database
 */
export const getUserContent = async (userId: string): Promise<ContentItem[]> => {
  if (!userId) {
    console.warn('getUserContent called with empty userId');
    return [];
  }

  try {
    console.log(`Fetching content for user: ${userId}`);
    
    // Try to get content from new_content collection first (where uploads are saved)
    const newContentQuery = query(
      collection(db, 'new_content'),
      where('userId', '==', userId)
      // Removed orderBy to avoid index requirement - we'll sort in memory instead
    );
    
    const newContentSnapshot = await getDocs(newContentQuery);
    console.log(`Raw new_content snapshot:`, newContentSnapshot.docs.length, 'documents');
    
    const newContentItems = newContentSnapshot.docs.map(doc => {
      try {
        const data = doc.data();
        console.log(`Processing new_content document ${doc.id}:`, data);
        return convertToContentItem({
          id: doc.id,
          userId: data.userId,
          title: data.title,
          description: data.description,
          contentType: data.contentType || data.type,
          originalUrl: data.originalUrl || data.fileUrl,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          platforms: data.platforms || []
        });
      } catch (error) {
        console.warn(`Error processing document ${doc.id}:`, error);
        // Return a fallback content item
        return convertToContentItem({
          id: doc.id,
          userId: userId,
          title: 'Corrupted Content',
          description: 'This content could not be processed properly',
          contentType: 'written',
          originalUrl: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          platforms: []
        });
      }
    });

    console.log(`Found ${newContentItems.length} items in new_content collection`);

    // Also try to get content from media_content collection (legacy)
    const mediaContentQuery = query(
      collection(db, 'media_content'),
      where('userId', '==', userId)
      // Removed orderBy to avoid index requirement - we'll sort in memory instead
    );
    
    const mediaContentSnapshot = await getDocs(mediaContentQuery);
    console.log(`Raw media_content snapshot:`, mediaContentSnapshot.docs.length, 'documents');
    
    const mediaContentItems = mediaContentSnapshot.docs.map(doc => {
      try {
        const data = doc.data() as UserContentData;
        console.log(`Processing media_content document ${doc.id}:`, data);
        return convertToContentItem(data);
      } catch (error) {
        console.warn(`Error processing media document ${doc.id}:`, error);
        // Return a fallback content item
        return convertToContentItem({
          id: doc.id,
          userId: userId,
          title: 'Corrupted Media Content',
          description: 'This media content could not be processed properly',
          contentType: 'written',
          originalUrl: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          platforms: []
        });
      }
    });

    console.log(`Found ${mediaContentItems.length} items in media_content collection`);

    // Combine both collections and remove duplicates
    const allContent = [...newContentItems, ...mediaContentItems];
    
    // Sort by createdAt in descending order (newest first) in memory
    const sortedContent = allContent.sort((a, b) => {
      try {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA; // Descending order
      } catch (error) {
        console.warn('Error sorting content by date:', error);
        return 0; // Keep original order if sorting fails
      }
    });
    
    // Remove duplicates based on ID
    const uniqueContent = sortedContent.filter((item, index, self) => 
      index === self.findIndex(t => t.id === item.id)
    );

    console.log(`Retrieved ${uniqueContent.length} unique content items for user ${userId}`);
    return uniqueContent;
  } catch (error) {
    console.error('Error fetching user content:', error);
    
    // If it's an index error, provide helpful information
    if (error instanceof Error && error.message.includes('index')) {
      console.warn('Firebase index required. Consider creating composite indexes for better performance.');
      console.warn('For now, content will be loaded without ordering.');
      
      // Try to fetch content without ordering as fallback
      try {
        const fallbackQuery = query(
          collection(db, 'new_content'),
          where('userId', '==', userId)
        );
        const fallbackSnapshot = await getDocs(fallbackQuery);
        const fallbackItems = fallbackSnapshot.docs.map(doc => {
          try {
            const data = doc.data();
            return convertToContentItem({
              id: doc.id,
              userId: data.userId,
              title: data.title,
              description: data.description,
              contentType: data.contentType || data.type,
              originalUrl: data.originalUrl || data.fileUrl,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
              platforms: data.platforms || []
            });
          } catch (error) {
            console.warn(`Error processing fallback document ${doc.id}:`, error);
            // Return a fallback content item
            return convertToContentItem({
              id: doc.id,
              userId: userId,
              title: 'Corrupted Fallback Content',
              description: 'This fallback content could not be processed properly',
              contentType: 'written',
              originalUrl: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              platforms: []
            });
          }
        });
        
        console.log(`Fallback: Retrieved ${fallbackItems.length} items without ordering`);
        return fallbackItems;
      } catch (fallbackError) {
        console.error('Fallback content loading also failed:', fallbackError);
      }
    }
    
    // Return empty array instead of throwing to prevent crashes
    console.warn('Returning empty content array due to error');
    return [];
  }
};

/**
 * Convert database content data to ContentItem format
 */
const convertToContentItem = (data: UserContentData): ContentItem => {
  try {
    // Ensure we have valid data with fallbacks
    const safeData = {
      id: data.id || `content-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: data.title || 'Untitled Content',
      description: data.description || 'No description available',
      contentType: data.contentType || data.type || 'written',
      originalUrl: data.originalUrl || data.fileUrl || '',
      createdAt: data.createdAt || new Date().toISOString(),
      platforms: (data as any).platforms || []
    };

    const contentType = mapContentType(safeData.contentType);
    
    return {
      id: safeData.id,
      title: safeData.title,
      description: safeData.description,
      type: contentType,
      status: 'pending', // Default status for uploaded content
      createdAt: safeData.createdAt,
      originalUrl: safeData.originalUrl || undefined,
      thumbnail: safeData.originalUrl || undefined, // Use original URL as thumbnail for now
      engagement: 0, // Default engagement
      views: 0, // Default views
      generatedAssets: [
        {
          id: `${safeData.id}-asset-1`,
          type: 'analysis',
          status: 'pending',
          content: `Analysis for ${safeData.title} content`
        }
      ],
      platforms: safeData.platforms,
    };
  } catch (error) {
    console.error('Error in convertToContentItem:', error);
    // Return a safe fallback content item
    return {
      id: `fallback-${Date.now()}`,
      title: 'Error Loading Content',
      description: 'This content could not be loaded properly',
      type: 'written',
      status: 'error',
      createdAt: new Date().toISOString(),
      originalUrl: undefined,
      thumbnail: undefined,
      engagement: 0,
      views: 0,
      generatedAssets: [],
      platforms: []
    };
  }
};

/**
 * Map database content type to ContentItem type
 */
const mapContentType = (dbType: string | undefined | null): ContentType => {
  if (!dbType || typeof dbType !== 'string') {
    return 'written'; // Default fallback
  }
  
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
      return ['blog', 'social'];
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

/**
 * Save content to the database
 */
export const saveUserContent = async (userId: string, content: ContentItem): Promise<void> => {
  try {
    const contentData = {
      userId: userId,
      title: content.title,
      description: content.description,
      contentType: content.type,
      originalUrl: content.originalUrl,
      createdAt: content.createdAt,
      updatedAt: new Date().toISOString(),
      platforms: content.platforms,
    };

    // Save to new_content collection (primary storage)
    await setDoc(doc(collection(db, 'new_content'), content.id), contentData);
    console.log('Content saved to new_content collection:', content.id);

    // Also save to media_content collection for consistency with existing systems
    const mediaContentData = {
      userId: userId,
      title: content.title,
      description: content.description,
      type: content.type,
      originalUrl: content.originalUrl,
      thumbnail: content.originalUrl,
      engagement: content.engagement || 0,
      views: content.views || 0,
      platforms: content.platforms,
      createdAt: content.createdAt,
      updatedAt: new Date().toISOString(),
      status: content.status || 'pending',
      generatedAssets: content.generatedAssets || []
    };

    await setDoc(doc(collection(db, 'media_content'), content.id), mediaContentData);
    console.log('Content saved to media_content collection:', content.id);

  } catch (error) {
    console.error('Error saving user content:', error);
    throw error;
  }
};

/**
 * Permanently delete content from the database and clean up related data
 */
export const deleteUserContent = async (userId: string, contentId: string): Promise<void> => {
  try {
    console.log(`Deleting content ${contentId} for user ${userId}`);
    
    // Delete from new_content collection
    try {
      await deleteDoc(doc(collection(db, 'new_content'), contentId));
      console.log(`Content deleted from new_content collection: ${contentId}`);
    } catch (error) {
      console.warn(`Content not found in new_content collection: ${contentId}`, error);
    }

    // Delete from media_content collection
    try {
      await deleteDoc(doc(collection(db, 'media_content'), contentId));
      console.log(`Content deleted from media_content collection: ${contentId}`);
    } catch (error) {
      console.warn(`Content not found in media_content collection: ${contentId}`, error);
    }

    // Mark as deleted in content_performance collection (soft delete for analytics)
    try {
      const performanceRef = doc(collection(db, 'content_performance'), contentId);
      await setDoc(performanceRef, {
        deleted: true,
        deletedAt: new Date().toISOString(),
        deletedBy: userId
      }, { merge: true });
      console.log(`Content marked as deleted in content_performance: ${contentId}`);
    } catch (error) {
      console.warn(`Could not update content_performance for: ${contentId}`, error);
    }

    console.log(`Content ${contentId} successfully deleted from all collections`);
  } catch (error) {
    console.error(`Error deleting content ${contentId}:`, error);
    throw error;
  }
};

/**
 * Permanently delete ALL content for a user from the database
 */
export const deleteAllUserContent = async (userId: string): Promise<void> => {
  try {
    console.log(`Deleting ALL content for user ${userId}`);
    
    // Get all content IDs for the user from both collections
    const newContentQuery = query(collection(db, 'new_content'), where('userId', '==', userId));
    const mediaContentQuery = query(collection(db, 'media_content'), where('userId', '==', userId));
    
    const [newContentSnapshot, mediaContentSnapshot] = await Promise.all([
      getDocs(newContentQuery),
      getDocs(mediaContentQuery)
    ]);
    
    const allContentIds = new Set([
      ...newContentSnapshot.docs.map(doc => doc.id),
      ...mediaContentSnapshot.docs.map(doc => doc.id)
    ]);
    
    console.log(`Found ${allContentIds.size} content items to delete for user ${userId}`);
    
    if (allContentIds.size === 0) {
      console.log(`No content found to delete for user ${userId}`);
      return;
    }
    
    // Delete from new_content collection
    const newContentDeletePromises = newContentSnapshot.docs.map(doc => 
      deleteDoc(doc.ref).catch(error => {
        console.warn(`Error deleting from new_content: ${doc.id}`, error);
        return null; // Continue with other deletions
      })
    );
    
    // Delete from media_content collection
    const mediaContentDeletePromises = mediaContentSnapshot.docs.map(doc => 
      deleteDoc(doc.ref).catch(error => {
        console.warn(`Error deleting from media_content: ${doc.id}`, error);
        return null; // Continue with other deletions
      })
    );
    
    // Mark all as deleted in content_performance collection
    const performanceDeletePromises = Array.from(allContentIds).map(contentId => 
      setDoc(doc(collection(db, 'content_performance'), contentId), {
        deleted: true,
        deletedAt: new Date().toISOString(),
        deletedBy: userId
      }, { merge: true }).catch(error => {
        console.warn(`Error updating content_performance for: ${contentId}`, error);
        return null; // Continue with other updates
      })
    );
    
    // Execute all deletions in parallel
    await Promise.all([
      ...newContentDeletePromises,
      ...mediaContentDeletePromises,
      ...performanceDeletePromises
    ]);
    
    // Clean up performance data for deleted content
    try {
      await contentPerformanceService.cleanupAllUserPerformance(userId);
    } catch (error) {
      console.warn('Error cleaning up performance data:', error);
      // Don't fail the main deletion if performance cleanup fails
    }
    
    console.log(`Successfully deleted ${allContentIds.size} content items for user ${userId}`);
  } catch (error) {
    console.error(`Error deleting all content for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Clean up duplicate content for a user
 */
export const cleanupDuplicateContent = async (userId: string): Promise<{ removed: number; kept: number }> => {
  try {
    console.log(`Cleaning up duplicate content for user ${userId}`);
    
    // Get all content for the user
    const userContent = await getUserContent(userId);
    
    if (userContent.length === 0) {
      console.log('No content found to clean up');
      return { removed: 0, kept: 0 };
    }
    
    // Group content by title and URL to find duplicates
    const contentGroups = new Map<string, ContentItem[]>();
    
    userContent.forEach(item => {
      const key = `${item.title}-${item.originalUrl}`;
      if (!contentGroups.has(key)) {
        contentGroups.set(key, []);
      }
      contentGroups.get(key)!.push(item);
    });
    
    let removedCount = 0;
    let keptCount = 0;
    
    // Process each group
    for (const [key, items] of contentGroups) {
      if (items.length > 1) {
        console.log(`Found ${items.length} duplicates for key: ${key}`);
        
        // Keep the first item (oldest), remove the rest
        const [keepItem, ...duplicateItems] = items;
        keptCount++;
        
        // Remove duplicates from both collections
        for (const duplicateItem of duplicateItems) {
          try {
            // Delete from new_content collection
            await deleteDoc(doc(collection(db, 'new_content'), duplicateItem.id));
            console.log(`Removed duplicate from new_content: ${duplicateItem.id}`);
            
            // Delete from media_content collection
            await deleteDoc(doc(collection(db, 'media_content'), duplicateItem.id));
            console.log(`Removed duplicate from media_content: ${duplicateItem.id}`);
            
            removedCount++;
          } catch (error) {
            console.warn(`Error removing duplicate ${duplicateItem.id}:`, error);
          }
        }
      } else {
        keptCount++;
      }
    }
    
    console.log(`Duplicate cleanup completed. Kept: ${keptCount}, Removed: ${removedCount}`);
    return { removed: removedCount, kept: keptCount };
    
  } catch (error) {
    console.error('Error cleaning up duplicate content:', error);
    throw error;
  }
}; 