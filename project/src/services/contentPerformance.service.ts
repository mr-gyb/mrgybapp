import { ContentItem } from '../types/content';
import platformApiService, { PlatformViewData } from '../api/services/platform-apis.service';
import { detectPlatform, getPlatformDisplayName } from '../utils/platformUtils';
import { doc, updateDoc, getDoc, collection, query, where, getDocs, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface PerformanceData {
  contentId: string;
  platform: string;
  views: number;
  likes?: number;
  shares?: number;
  comments?: number;
  lastUpdated: string;
  error?: string;
}

export interface ContentPerformanceSummary {
  contentId: string;
  totalViews: number;
  totalLikes: number;
  totalShares: number;
  totalComments: number;
  platformBreakdown: PlatformViewData[];
  lastUpdated: string;
}

export interface PerformanceUpdateResult {
  success: boolean;
  contentId: string;
  platformsUpdated: string[];
  errors: string[];
  summary?: ContentPerformanceSummary;
}

/**
 * Content Performance Tracking Service
 * Handles real-time performance tracking across multiple platforms
 */
class ContentPerformanceService {
  private updateInterval: NodeJS.Timeout | null = null;
  private isTracking = false;
  private contentListeners: Map<string, () => void> = new Map();

  /**
   * Start automatic performance tracking
   */
  startTracking(intervalMinutes: number = 60): void {
    if (this.isTracking) {
      this.stopTracking();
    }

    this.isTracking = true;
    this.updateInterval = setInterval(() => {
      this.updateAllContentPerformance();
    }, intervalMinutes * 60 * 1000);

    // Initial update
    this.updateAllContentPerformance();
    
    // Start listening for content changes
    this.startContentChangeListener();
  }

  /**
   * Stop automatic performance tracking
   */
  stopTracking(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.isTracking = false;
    
    // Stop listening for content changes
    this.stopContentChangeListener();
  }

  /**
   * Start listening for content changes in Firestore
   */
  private startContentChangeListener(): void {
    // Listen to all content changes for now - we'll filter by user in the hook
    const unsubscribe = onSnapshot(collection(db, 'media_content'), (snapshot) => {
      console.log('Content change detected:', snapshot.docChanges().length, 'changes');
      
      snapshot.docChanges().forEach((change) => {
        console.log('Content change type:', change.type, 'for document:', change.doc.id);
        
        if (change.type === 'added' || change.type === 'modified') {
          // New content added or existing content modified
          const contentData = change.doc.data();
          const contentItem: ContentItem = {
            id: change.doc.id,
            title: contentData.title || '',
            description: contentData.description || '',
            type: contentData.type || 'written',
            status: contentData.status || 'pending',
            createdAt: contentData.createdAt || new Date().toISOString(),
            originalUrl: contentData.originalUrl,
            thumbnail: contentData.thumbnail,
            engagement: contentData.engagement,
            views: contentData.views,
            platforms: contentData.platforms || [],
            generatedAssets: contentData.generatedAssets || []
          };
          
          console.log('Updating performance for content:', contentItem.id, 'with platforms:', contentItem.platforms);
          
          // Update performance for this content item
          this.updateContentPerformance(contentItem).then(result => {
            console.log('Performance update result:', result);
          }).catch(error => {
            console.error('Error updating performance:', error);
          });
        } else if (change.type === 'removed') {
          // Content removed - clean up performance data
          console.log('Removing performance data for content:', change.doc.id);
          this.removeContentPerformance(change.doc.id);
        }
      });
    }, (error) => {
      console.error('Error in content change listener:', error);
    });

    this.contentListeners.set('media_content', unsubscribe);
  }

  /**
   * Stop listening for content changes
   */
  private stopContentChangeListener(): void {
    this.contentListeners.forEach(unsubscribe => unsubscribe());
    this.contentListeners.clear();
  }

  /**
   * Remove performance data for deleted content
   */
  private async removeContentPerformance(contentId: string): Promise<void> {
    try {
      // Remove from content_performance collection
      const performanceRef = doc(db, 'content_performance', contentId);
      await updateDoc(performanceRef, {
        deleted: true,
        deletedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error removing content performance:', error);
    }
  }

  /**
   * Clean up all performance data for a user (when all content is deleted)
   */
  async cleanupAllUserPerformance(userId: string): Promise<void> {
    try {
      console.log(`Cleaning up all performance data for user: ${userId}`);
      
      // Get all performance documents for the user's content
      const performanceQuery = query(
        collection(db, 'content_performance'),
        where('deleted', '==', true)
      );
      
      const snapshot = await getDocs(performanceQuery);
      const deletePromises = snapshot.docs.map(doc => 
        deleteDoc(doc.ref).catch(error => {
          console.warn(`Error deleting performance document ${doc.id}:`, error);
          return null; // Continue with other deletions
        })
      );
      
      await Promise.all(deletePromises);
      console.log(`Cleaned up ${snapshot.docs.length} performance documents for user: ${userId}`);
    } catch (error) {
      console.error('Error cleaning up user performance data:', error);
    }
  }

  /**
   * Update performance for a single content item
   */
  async updateContentPerformance(contentItem: ContentItem): Promise<PerformanceUpdateResult> {
    const result: PerformanceUpdateResult = {
      success: false,
      contentId: contentItem.id,
      platformsUpdated: [],
      errors: []
    };

    try {
      if (!contentItem.platforms || contentItem.platforms.length === 0) {
        result.errors.push('No platforms configured for this content');
        return result;
      }

      const platformData = await platformApiService.fetchAllPlatformViews(contentItem);
      const validData = platformData.filter(data => !data.error);
      const errorData = platformData.filter(data => data.error);

      // Update Firestore with new performance data
      await this.savePerformanceData(contentItem.id, platformData);

      // Update content item with aggregated views
      const totalViews = validData.reduce((sum, data) => sum + data.views, 0);
      await this.updateContentViews(contentItem.id, totalViews);

      result.success = true;
      result.platformsUpdated = validData.map(data => data.platform);
      result.errors = errorData.map(data => data.error || 'Unknown error');
      
      // Create summary
      result.summary = {
        contentId: contentItem.id,
        totalViews,
        totalLikes: validData.reduce((sum, data) => sum + (data.likes || 0), 0),
        totalShares: validData.reduce((sum, data) => sum + (data.shares || 0), 0),
        totalComments: validData.reduce((sum, data) => sum + (data.comments || 0), 0),
        platformBreakdown: validData,
        lastUpdated: new Date().toISOString()
      };

    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    }

    return result;
  }

  /**
   * Update performance for all content items
   */
  async updateAllContentPerformance(): Promise<PerformanceUpdateResult[]> {
    try {
      const contentQuery = query(collection(db, 'media_content'));
      const snapshot = await getDocs(contentQuery);
      
      const contentItems: ContentItem[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        contentItems.push({
          id: doc.id,
          title: data.title || '',
          description: data.description || '',
          type: data.type || 'written',
          status: data.status || 'pending',
          createdAt: data.createdAt || new Date().toISOString(),
          originalUrl: data.originalUrl,
          thumbnail: data.thumbnail,
          engagement: data.engagement,
          views: data.views,
          platforms: data.platforms || [],
          generatedAssets: data.generatedAssets || []
        });
      });

      const results: PerformanceUpdateResult[] = [];
      
      for (const contentItem of contentItems) {
        const result = await this.updateContentPerformance(contentItem);
        results.push(result);
      }

      return results;
    } catch (error) {
      console.error('Error updating all content performance:', error);
      return [];
    }
  }

  /**
   * Get performance data for a content item
   */
  async getContentPerformance(contentId: string): Promise<ContentPerformanceSummary | null> {
    try {
      const performanceDoc = await getDoc(doc(db, 'content_performance', contentId));
      
      if (!performanceDoc.exists()) {
        return null;
      }

      const data = performanceDoc.data();
      return {
        contentId,
        totalViews: data.totalViews || 0,
        totalLikes: data.totalLikes || 0,
        totalShares: data.totalShares || 0,
        totalComments: data.totalComments || 0,
        platformBreakdown: data.platformBreakdown || [],
        lastUpdated: data.lastUpdated || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting content performance:', error);
      return null;
    }
  }

  /**
   * Get performance data for all content items
   */
  async getAllContentPerformance(): Promise<ContentPerformanceSummary[]> {
    try {
      const performanceQuery = query(collection(db, 'content_performance'));
      const snapshot = await getDocs(performanceQuery);
      
      const summaries: ContentPerformanceSummary[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        // Skip deleted content
        if (!data.deleted) {
          summaries.push({
            contentId: doc.id,
            totalViews: data.totalViews || 0,
            totalLikes: data.totalLikes || 0,
            totalShares: data.totalShares || 0,
            totalComments: data.totalComments || 0,
            platformBreakdown: data.platformBreakdown || [],
            lastUpdated: data.lastUpdated || new Date().toISOString()
          });
        }
      });

      return summaries;
    } catch (error) {
      console.error('Error getting all content performance:', error);
      return [];
    }
  }

  /**
   * Save performance data to Firestore
   */
  private async savePerformanceData(contentId: string, platformData: PlatformViewData[]): Promise<void> {
    const validData = platformData.filter(data => !data.error);
    const totalViews = validData.reduce((sum, data) => sum + data.views, 0);
    const totalLikes = validData.reduce((sum, data) => sum + (data.likes || 0), 0);
    const totalShares = validData.reduce((sum, data) => sum + (data.shares || 0), 0);
    const totalComments = validData.reduce((sum, data) => sum + (data.comments || 0), 0);

    console.log(`Saving performance data for ${contentId}:`, { totalViews, totalLikes, totalShares, totalComments });

    await setDoc(doc(db, 'content_performance', contentId), {
      platformData,
      totalViews,
      totalLikes,
      totalShares,
      totalComments,
      lastUpdated: new Date().toISOString()
    }, { merge: true });
  }

  /**
   * Update content views in Firestore
   */
  private async updateContentViews(contentId: string, views: number): Promise<void> {
    console.log(`Updating views for ${contentId}:`, views);
    await setDoc(doc(db, 'media_content', contentId), {
      views,
      lastPerformanceUpdate: new Date().toISOString()
    }, { merge: true });
  }

  /**
   * Get performance analytics for dashboard
   */
  async getPerformanceAnalytics(): Promise<{
    totalViews: number;
    totalLikes: number;
    totalShares: number;
    totalComments: number;
    platformBreakdown: Record<string, number>;
    contentTypeBreakdown: Record<string, number>;
    topPerformingContent: ContentPerformanceSummary[];
  }> {
    try {
      const allPerformance = await this.getAllContentPerformance();
      
      const totalViews = allPerformance.reduce((sum, item) => sum + item.totalViews, 0);
      const totalLikes = allPerformance.reduce((sum, item) => sum + item.totalLikes, 0);
      const totalShares = allPerformance.reduce((sum, item) => sum + item.totalShares, 0);
      const totalComments = allPerformance.reduce((sum, item) => sum + item.totalComments, 0);

      // Platform breakdown
      const platformBreakdown: Record<string, number> = {};
      allPerformance.forEach(item => {
        item.platformBreakdown.forEach(platform => {
          platformBreakdown[platform.platform] = (platformBreakdown[platform.platform] || 0) + platform.views;
        });
      });

      // Content type breakdown (would need content type data)
      const contentTypeBreakdown: Record<string, number> = {};

      // Top performing content
      const topPerformingContent = allPerformance
        .sort((a, b) => b.totalViews - a.totalViews)
        .slice(0, 10);

      return {
        totalViews,
        totalLikes,
        totalShares,
        totalComments,
        platformBreakdown,
        contentTypeBreakdown,
        topPerformingContent
      };
    } catch (error) {
      console.error('Error getting performance analytics:', error);
      return {
        totalViews: 0,
        totalLikes: 0,
        totalShares: 0,
        totalComments: 0,
        platformBreakdown: {},
        contentTypeBreakdown: {},
        topPerformingContent: []
      };
    }
  }

  /**
   * Check if platform is configured for API access
   */
  isPlatformConfigured(platform: string): boolean {
    return platformApiService.isPlatformConfigured(platform);
  }

  /**
   * Get list of configured platforms
   */
  getConfiguredPlatforms(): string[] {
    return platformApiService.getConfiguredPlatforms();
  }

  /**
   * Validate content URL for platform detection
   */
  validateContentUrl(url: string): { isValid: boolean; detectedPlatform: string | null } {
    const detectedPlatform = detectPlatform(url);
    return {
      isValid: !!detectedPlatform,
      detectedPlatform
    };
  }
}

export const contentPerformanceService = new ContentPerformanceService();
export default contentPerformanceService; 