import { useState, useEffect, useCallback } from 'react';
import { ContentItem } from '../types/content';
import { PlatformApiService } from '../api/services/platform-apis.service';

export interface PinterestPinData {
  pinId: string;
  title: string;
  description: string;
  saveCount: number;
  commentCount: number;
  link: string;
  mediaType: string;
  lastUpdated: string;
}

export interface PinterestMonetizationMetrics {
  totalSaves: number;
  totalComments: number;
  averageSavesPerPin: number;
  engagementRate: number;
  estimatedRevenue: number;
  monetizationScore: number;
  topPerformingPins: PinterestPinData[];
}

export interface PinterestAggregatedData {
  totalPins: number;
  totalSaves: number;
  totalComments: number;
  averageSavesPerPin: number;
  engagementRate: number;
  estimatedMonthlyRevenue: number;
  monetizationScore: number;
  topPerformingPins: PinterestPinData[];
  lastUpdated: string;
}

export const usePinterestMonetization = (userContent: ContentItem[]) => {
  const [pinterestData, setPinterestData] = useState<PinterestAggregatedData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const platformApiService = new PlatformApiService();

  const fetchPinterestData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching Pinterest aggregated data for', userContent.length, 'content items');
      
      // Filter Pinterest content
      const pinterestContent = userContent.filter(content => 
        content.originalUrl && content.originalUrl.includes('pinterest.com')
      );

      if (pinterestContent.length === 0) {
        setPinterestData(null);
        setIsLoading(false);
        return;
      }

      // Fetch data for each Pinterest pin
      const pinDataPromises = pinterestContent.map(async (content) => {
        try {
          const response = await platformApiService.fetchPinterestViews(content);
          if (response.success && response.data) {
            return {
              pinId: extractPinId(content.originalUrl || ''),
              title: content.title || 'Untitled Pin',
              description: content.description || '',
              saveCount: response.data.shares || 0,
              commentCount: 0, // Pinterest API doesn't provide comment counts
              link: content.originalUrl || '',
              mediaType: 'image', // Default to image
              lastUpdated: response.data.lastUpdated
            };
          }
          return null;
        } catch (err) {
          console.warn(`Failed to fetch Pinterest data for ${content.originalUrl}:`, err);
          return null;
        }
      });

      const pinDataResults = await Promise.all(pinDataPromises);
      const validPinData = pinDataResults.filter((data): data is PinterestPinData => data !== null);

      if (validPinData.length === 0) {
        setPinterestData(null);
        setIsLoading(false);
        return;
      }

      // Calculate aggregated metrics
      const totalSaves = validPinData.reduce((sum, pin) => sum + pin.saveCount, 0);
      const totalComments = validPinData.reduce((sum, pin) => sum + pin.commentCount, 0);
      const averageSavesPerPin = totalSaves / validPinData.length;
      const engagementRate = totalSaves > 0 ? (totalComments / totalSaves) * 100 : 0;

      // Calculate estimated revenue (Pinterest monetization is typically through affiliate links and brand partnerships)
      const baseRevenuePerSave = 0.05; // $0.05 per save (conservative estimate)
      const estimatedMonthlyRevenue = totalSaves * baseRevenuePerSave;

      // Calculate monetization score (1-10)
      const monetizationScore = Math.min(10, Math.max(1, Math.floor(averageSavesPerPin / 10) + 1));

      // Get top performing pins (top 5 by save count)
      const topPerformingPins = validPinData
        .sort((a, b) => b.saveCount - a.saveCount)
        .slice(0, 5);

      const aggregatedData: PinterestAggregatedData = {
        totalPins: validPinData.length,
        totalSaves,
        totalComments,
        averageSavesPerPin,
        engagementRate,
        estimatedMonthlyRevenue,
        monetizationScore,
        topPerformingPins,
        lastUpdated: new Date().toISOString()
      };

      setPinterestData(aggregatedData);
      setLastUpdated(new Date());
      console.log('Pinterest data fetched successfully:', aggregatedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch Pinterest data';
      setError(errorMessage);
      console.error('Error fetching Pinterest data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userContent]);

  // Extract Pinterest pin ID from URL
  const extractPinId = (url: string): string => {
    const pinIdMatch = url.match(/\/pin\/(\d+)/);
    return pinIdMatch ? pinIdMatch[1] : '';
  };

  // Fetch data when userContent changes
  useEffect(() => {
    if (userContent.length > 0) {
      fetchPinterestData();
    }
  }, [fetchPinterestData]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (userContent.length > 0) {
        fetchPinterestData();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [fetchPinterestData, userContent.length]);

  const refreshData = useCallback(() => {
    fetchPinterestData();
  }, [fetchPinterestData]);

  return {
    pinterestData,
    isLoading,
    error,
    lastUpdated,
    refreshData
  };
};
