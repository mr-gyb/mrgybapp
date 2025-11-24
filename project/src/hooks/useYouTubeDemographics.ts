import { useState, useEffect, useCallback } from 'react';
import { PlatformApiService, YouTubeDemographics, YouTubeAnalyticsResponse } from '../api/services/platform-apis.service';

export interface UseYouTubeDemographicsResult {
  demographics: YouTubeDemographics | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  fetchDemographics: (channelId?: string, startDate?: string, endDate?: string) => Promise<void>;
  fetchVideoDemographics: (videoId: string, startDate?: string, endDate?: string) => Promise<void>;
}

/**
 * Hook to fetch YouTube demographics (age and gender) data
 * 
 * Requirements:
 * - YouTube OAuth access token with yt-analytics.readonly scope
 * - YouTube Analytics API enabled in Google Cloud Console
 * 
 * @example
 * ```tsx
 * const { demographics, isLoading, error, fetchDemographics } = useYouTubeDemographics();
 * 
 * useEffect(() => {
 *   fetchDemographics(); // Fetches for authenticated user's channel
 * }, []);
 * 
 * // Or for a specific channel
 * fetchDemographics('UCxxxxxxxxxxxxxxxxxxxxx');
 * 
 * // Or for a specific date range
 * fetchDemographics(undefined, '2024-01-01', '2024-01-31');
 * ```
 */
export const useYouTubeDemographics = (): UseYouTubeDemographicsResult => {
  const [demographics, setDemographics] = useState<YouTubeDemographics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const platformApiService = new PlatformApiService();

  const fetchDemographics = useCallback(async (
    channelId?: string,
    startDate?: string,
    endDate?: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const result: YouTubeAnalyticsResponse = await platformApiService.fetchYouTubeDemographics(
        channelId,
        startDate,
        endDate
      );

      if (result.success && result.data) {
        setDemographics(result.data);
        setLastUpdated(new Date());
      } else {
        setError(result.error || 'Failed to fetch demographics');
        setDemographics(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch YouTube demographics';
      setError(errorMessage);
      setDemographics(null);
      console.error('Error fetching YouTube demographics:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchVideoDemographics = useCallback(async (
    videoId: string,
    startDate?: string,
    endDate?: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const result: YouTubeAnalyticsResponse = await platformApiService.fetchYouTubeVideoDemographics(
        videoId,
        startDate,
        endDate
      );

      if (result.success && result.data) {
        setDemographics(result.data);
        setLastUpdated(new Date());
      } else {
        setError(result.error || 'Failed to fetch video demographics');
        setDemographics(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch YouTube video demographics';
      setError(errorMessage);
      setDemographics(null);
      console.error('Error fetching YouTube video demographics:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    demographics,
    isLoading,
    error,
    lastUpdated,
    fetchDemographics,
    fetchVideoDemographics
  };
};

