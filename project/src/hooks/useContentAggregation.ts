import { useState, useEffect } from 'react';
import { getContentAggregation, getContentAggregationWithMetadata, ContentAggregation } from '../lib/firebase/content';
import { useAuth } from '../contexts/AuthContext';

export const useContentAggregation = () => {
  const { user } = useAuth();
  const [aggregation, setAggregation] = useState<ContentAggregation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<{
    totalViews: number;
    totalContent: number;
    contentTypes: number;
  } | null>(null);

  const loadContentAggregation = async () => {
    if (!user?.uid) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await getContentAggregationWithMetadata(user.uid);
      
      setAggregation(result.aggregation);
      setMetadata({
        totalViews: result.totalViews,
        totalContent: result.totalContent,
        contentTypes: result.contentTypes
      });

    } catch (err) {
      console.error('Error loading content aggregation:', err);
      setError('Failed to load content aggregation');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadContentAggregation();
  }, [user?.uid]);

  const refreshAggregation = () => {
    loadContentAggregation();
  };

  return {
    aggregation,
    metadata,
    isLoading,
    error,
    refreshAggregation
  };
}; 