import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export interface ContentAggregation {
  type: string;
  views: number;
}

export interface ContentDocument {
  id: string;
  userId: string;
  type: string;
  views: number;
  title?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any; // Allow for additional fields
}

/**
 * Query Firestore for all content documents where userId == currentUserId
 * Group documents by type and sum the views field per content type
 * 
 * @param currentUserId - The ID of the current user
 * @returns Promise<ContentAggregation[]> - Array of content types with summed views
 */
export const getContentAggregation = async (currentUserId: string): Promise<ContentAggregation[]> => {
  try {
    // Query Firestore for content documents where userId matches currentUserId
    const contentRef = collection(db, 'content');
    const contentQuery = query(
      contentRef,
      where('userId', '==', currentUserId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(contentQuery);
    
    // Group documents by type and sum views
    const contentByType: { [key: string]: number } = {};
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as ContentDocument;
      const type = data.type || 'unknown';
      const views = data.views || 0;
      
      // Sum views for each content type
      contentByType[type] = (contentByType[type] || 0) + views;
    });

    // Convert to the required output format
    const aggregation: ContentAggregation[] = Object.entries(contentByType).map(([type, views]) => ({
      type,
      views
    }));

    // Sort by views in descending order
    aggregation.sort((a, b) => b.views - a.views);

    console.log('Content Aggregation Result:', aggregation);
    return aggregation;

  } catch (error) {
    console.error('Error getting content aggregation:', error);
    throw error;
  }
};

/**
 * Get detailed content documents for a user
 * 
 * @param currentUserId - The ID of the current user
 * @returns Promise<ContentDocument[]> - Array of content documents
 */
export const getUserContent = async (currentUserId: string): Promise<ContentDocument[]> => {
  try {
    const contentRef = collection(db, 'content');
    const contentQuery = query(
      contentRef,
      where('userId', '==', currentUserId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(contentQuery);
    
    const contentDocuments: ContentDocument[] = [];
    querySnapshot.forEach((doc) => {
      contentDocuments.push({
        id: doc.id,
        ...doc.data()
      } as ContentDocument);
    });

    return contentDocuments;

  } catch (error) {
    console.error('Error getting user content:', error);
    throw error;
  }
};

/**
 * Get content aggregation with additional metadata
 * 
 * @param currentUserId - The ID of the current user
 * @returns Promise<{aggregation: ContentAggregation[], totalViews: number, totalContent: number}>
 */
export const getContentAggregationWithMetadata = async (currentUserId: string) => {
  try {
    const aggregation = await getContentAggregation(currentUserId);
    const userContent = await getUserContent(currentUserId);
    
    const totalViews = aggregation.reduce((sum, item) => sum + item.views, 0);
    const totalContent = userContent.length;
    
    return {
      aggregation,
      totalViews,
      totalContent,
      contentTypes: aggregation.length
    };

  } catch (error) {
    console.error('Error getting content aggregation with metadata:', error);
    throw error;
  }
}; 