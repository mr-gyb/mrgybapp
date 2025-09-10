import { useState, useEffect, useCallback } from 'react';
import { ContentItem } from '../types/content';
import { PlatformApiService, YouTubeAggregatedData } from '../api/services/platform-apis.service';

export const useYouTubeMonetization = (userContent: ContentItem[]) => {
  const [youtubeData, setYoutubeData] = useState<YouTubeAggregatedData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const platformApiService = new PlatformApiService();

  const fetchYouTubeData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching YouTube aggregated data for', userContent.length, 'content items');
      const aggregatedData = await platformApiService.fetchYouTubeAggregatedData(userContent);
      setYoutubeData(aggregatedData);
      setLastUpdated(new Date());
      console.log('YouTube data fetched successfully:', aggregatedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch YouTube data';
      setError(errorMessage);
      console.error('Error fetching YouTube data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userContent]);

  // Fetch data when userContent changes
  useEffect(() => {
    if (userContent.length > 0) {
      fetchYouTubeData();
    }
  }, [fetchYouTubeData]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (userContent.length > 0) {
        fetchYouTubeData();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [fetchYouTubeData, userContent.length]);

  const refreshData = useCallback(() => {
    fetchYouTubeData();
  }, [fetchYouTubeData]);

  return {
    youtubeData,
    isLoading,
    error,
    lastUpdated,
    refreshData
  };
};
