import { useState, useCallback } from 'react';
import { fetchFacebookPageInsightsMetrics } from '../api/services/facebook.service';

interface FacebookPageInsightsData {
  total_impressions: number;
  total_reactions: number;
  posts: Array<{
    post_id: string;
    post_impressions: number;
    post_reactions_by_type_total: number;
    created_time: string;
  }>;
}

interface UseFacebookPageInsightsReturn {
  data: FacebookPageInsightsData | null;
  isLoading: boolean;
  error: string | null;
  fetchInsights: (pageId: string) => Promise<void>;
  clearData: () => void;
}

export const useFacebookPageInsights = (): UseFacebookPageInsightsReturn => {
  const [data, setData] = useState<FacebookPageInsightsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async (pageId: string) => {
    if (!pageId) {
      setError('Page ID is required');
      return;
    }

    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const result = await fetchFacebookPageInsightsMetrics(pageId);
      
      if (result) {
        setData(result);
        setError(null);
      } else {
        setError('Failed to fetch Facebook Page Insights');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearData = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    isLoading,
    error,
    fetchInsights,
    clearData
  };
}; 