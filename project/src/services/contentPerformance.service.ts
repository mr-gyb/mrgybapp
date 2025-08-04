import { ContentItem } from '../types/content';
import platformApiService, { PlatformViewData } from '../api/services/platform-apis.service';
import { detectPlatform, getPlatformDisplayName } from '../utils/platformUtils';
import { doc, updateDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
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
        summaries.push({
          contentId: doc.id,
          totalViews: data.totalViews || 0,
          totalLikes: data.totalLikes || 0,
          totalShares: data.totalShares || 0,
          totalComments: data.totalComments || 0,
          platformBreakdown: data.platformBreakdown || [],
          lastUpdated: data.lastUpdated || new Date().toISOString()
        });
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

    await updateDoc(doc(db, 'content_performance', contentId), {
      platformData,
      totalViews,
      totalLikes,
      totalShares,
      totalComments,
      lastUpdated: new Date().toISOString()
    });
  }

  /**
   * Update content views in Firestore
   */
  private async updateContentViews(contentId: string, views: number): Promise<void> {
    await updateDoc(doc(db, 'media_content', contentId), {
      views,
      lastPerformanceUpdate: new Date().toISOString()
    });
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