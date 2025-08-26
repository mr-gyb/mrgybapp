import { useState, useEffect, useCallback } from 'react';
import contentTypeMappingService from '../services/contentTypeMapping.service';
import { useUserContent } from './useUserContent';

export interface ContentTypeAnalyticsData {
  barData: any[];
  platformData: any[];
  blogTypes: string[];
  audioTypes: string[];
  socialMediaTypes: string[];
  otherTypes: string[];
  contentTypeColors: Record<string, string>;
  legendKeys: string[];
  platformColors: string[];
}

export interface UseContentTypeAnalyticsReturn {
  analyticsData: ContentTypeAnalyticsData | null;
  isLoading: boolean;
  error: string | null;
  refreshAnalytics: () => void;
  getContentTypeMapping: (platform: string) => any;
  getAllPlatforms: () => string[];
  getPlatformsByCategory: (category: string) => string[];
}

/**
 * Hook for managing content type analytics and platform distribution
 * Integrates with the content type mapping service to provide automatic
 * content type classification based on platform selection
 */
export function useContentTypeAnalytics(): UseContentTypeAnalyticsReturn {
  const [analyticsData, setAnalyticsData] = useState<ContentTypeAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { content: userContent, isLoading: isContentLoading } = useUserContent();

  const loadAnalyticsData = useCallback(async () => {
    if (!userContent || userContent.length === 0) {
      setAnalyticsData(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const data = contentTypeMappingService.getContentTypeAnalyticsData(userContent);
      setAnalyticsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  }, [userContent]);

  // Load analytics data when user content changes
  useEffect(() => {
    if (!isContentLoading) {
      loadAnalyticsData();
    }
  }, [loadAnalyticsData, isContentLoading]);

  const refreshAnalytics = useCallback(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  const getContentTypeMapping = useCallback((platform: string) => {
    return contentTypeMappingService.getContentTypeMapping(platform);
  }, []);

  const getAllPlatforms = useCallback(() => {
    return contentTypeMappingService.getAllPlatforms();
  }, []);

  const getPlatformsByCategory = useCallback((category: string) => {
    return contentTypeMappingService.getPlatformsByCategory(category);
  }, []);

  return {
    analyticsData,
    isLoading: isLoading || isContentLoading,
    error,
    refreshAnalytics,
    getContentTypeMapping,
    getAllPlatforms,
    getPlatformsByCategory
  };
}
