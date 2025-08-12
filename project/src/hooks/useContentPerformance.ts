import { useState, useEffect, useCallback } from 'react';
import contentPerformanceService, { 
  ContentPerformanceSummary, 
  PerformanceUpdateResult,
  PerformanceData 
} from '../services/contentPerformance.service';
import { ContentItem } from '../types/content';

export interface UseContentPerformanceReturn {
  // Performance data
  performanceData: ContentPerformanceSummary[];
  isLoading: boolean;
  error: string | null;
  
  // Tracking state
  isTracking: boolean;
  
  // Actions
  startTracking: (intervalMinutes?: number) => void;
  stopTracking: () => void;
  updateContentPerformance: (contentItem: ContentItem) => Promise<PerformanceUpdateResult>;
  updateAllContentPerformance: () => Promise<PerformanceUpdateResult[]>;
  
  // Analytics
  getPerformanceAnalytics: () => Promise<{
    totalViews: number;
    totalLikes: number;
    totalShares: number;
    totalComments: number;
    platformBreakdown: Record<string, number>;
    contentTypeBreakdown: Record<string, number>;
    topPerformingContent: ContentPerformanceSummary[];
  }>;
  
  // Platform utilities
  isPlatformConfigured: (platform: string) => boolean;
  getConfiguredPlatforms: () => string[];
  validateContentUrl: (url: string) => { isValid: boolean; detectedPlatform: string | null };
}

/**
 * Hook for managing content performance tracking
 */
export function useContentPerformance(): UseContentPerformanceReturn {
  const [performanceData, setPerformanceData] = useState<ContentPerformanceSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  // Load initial performance data
  useEffect(() => {
    loadPerformanceData();
  }, []);

  const loadPerformanceData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await contentPerformanceService.getAllContentPerformance();
      setPerformanceData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load performance data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const startTracking = useCallback((intervalMinutes: number = 60) => {
    try {
      contentPerformanceService.startTracking(intervalMinutes);
      setIsTracking(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start tracking');
    }
  }, []);

  const stopTracking = useCallback(() => {
    try {
      contentPerformanceService.stopTracking();
      setIsTracking(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop tracking');
    }
  }, []);

  const updateContentPerformance = useCallback(async (contentItem: ContentItem): Promise<PerformanceUpdateResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await contentPerformanceService.updateContentPerformance(contentItem);
      
      // Reload performance data to get updated information
      await loadPerformanceData();
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update content performance';
      setError(errorMessage);
      return {
        success: false,
        contentId: contentItem.id,
        platformsUpdated: [],
        errors: [errorMessage]
      };
    } finally {
      setIsLoading(false);
    }
  }, [loadPerformanceData]);

  const updateAllContentPerformance = useCallback(async (): Promise<PerformanceUpdateResult[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const results = await contentPerformanceService.updateAllContentPerformance();
      
      // Reload performance data
      await loadPerformanceData();
      
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update all content performance';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [loadPerformanceData]);

  const getPerformanceAnalytics = useCallback(async () => {
    try {
      return await contentPerformanceService.getPerformanceAnalytics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get performance analytics');
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
  }, []);

  const isPlatformConfigured = useCallback((platform: string): boolean => {
    return contentPerformanceService.isPlatformConfigured(platform);
  }, []);

  const getConfiguredPlatforms = useCallback((): string[] => {
    return contentPerformanceService.getConfiguredPlatforms();
  }, []);

  const validateContentUrl = useCallback((url: string) => {
    return contentPerformanceService.validateContentUrl(url);
  }, []);

  return {
    performanceData,
    isLoading,
    error,
    isTracking,
    startTracking,
    stopTracking,
    updateContentPerformance,
    updateAllContentPerformance,
    getPerformanceAnalytics,
    isPlatformConfigured,
    getConfiguredPlatforms,
    validateContentUrl
  };
}

/**
 * Hook for managing performance of a single content item
 */
export function useContentItemPerformance(contentId: string) {
  const [performance, setPerformance] = useState<ContentPerformanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (contentId) {
      loadContentPerformance();
    }
  }, [contentId]);

  const loadContentPerformance = useCallback(async () => {
    if (!contentId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await contentPerformanceService.getContentPerformance(contentId);
      setPerformance(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content performance');
    } finally {
      setIsLoading(false);
    }
  }, [contentId]);

  const updatePerformance = useCallback(async (contentItem: ContentItem): Promise<PerformanceUpdateResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await contentPerformanceService.updateContentPerformance(contentItem);
      
      // Reload performance data
      await loadContentPerformance();
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update performance';
      setError(errorMessage);
      return {
        success: false,
        contentId,
        platformsUpdated: [],
        errors: [errorMessage]
      };
    } finally {
      setIsLoading(false);
    }
  }, [loadContentPerformance]);

  return {
    performance,
    isLoading,
    error,
    updatePerformance,
    refresh: loadContentPerformance
  };
} 