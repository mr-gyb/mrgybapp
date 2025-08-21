import { useState, useEffect, useCallback } from 'react';
import { useUserContent } from './useUserContent';
import { ContentItem } from '../types/content';

export interface InspirationSuggestion {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  platform: string;
  creator: string;
  relevance: string;
  isFallback?: boolean;
}

export interface ContentHubData {
  contentTypes: Record<string, number>;
  platformDistribution: Record<string, number>;
  userActivity: {
    recentUploads: number;
    totalContent: number;
    dominantType: string;
    engagementTrend: 'increasing' | 'decreasing' | 'stable';
  };
}

export const useCreationInspirations = () => {
  const { content: userContent } = useUserContent();
  const [suggestions, setSuggestions] = useState<InspirationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contentHubData, setContentHubData] = useState<ContentHubData | null>(null);

  // Analyze user content to generate Content Hub data
  const analyzeUserContent = useCallback((): ContentHubData => {
    const contentTypes: Record<string, number> = {};
    const platformDistribution: Record<string, number> = {};
    
    userContent.forEach((item: ContentItem) => {
      // Count content types
      const type = item.type || 'other';
      contentTypes[type] = (contentTypes[type] || 0) + 1;
      
      // Count platforms
      if (item.platforms) {
        item.platforms.forEach(platform => {
          const normalizedPlatform = platform.toLowerCase();
          platformDistribution[normalizedPlatform] = (platformDistribution[normalizedPlatform] || 0) + 1;
        });
      }
    });

    // Calculate user activity metrics
    const recentUploads = userContent.filter(item => {
      const uploadDate = new Date(item.createdAt || Date.now());
      const daysAgo = (Date.now() - uploadDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 7; // Last 7 days
    }).length;

    const dominantType = Object.entries(contentTypes)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'other';

    // Simple engagement trend calculation
    const totalEngagement = userContent.reduce((sum, item) => sum + (item.engagement || 0), 0);
    const avgEngagement = userContent.length > 0 ? totalEngagement / userContent.length : 0;
    let engagementTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    
    if (userContent.length >= 2) {
      const recentItems = userContent.slice(-5); // Last 5 items
      const recentEngagement = recentItems.reduce((sum, item) => sum + (item.engagement || 0), 0) / recentItems.length;
      if (recentEngagement > avgEngagement * 1.1) engagementTrend = 'increasing';
      else if (recentEngagement < avgEngagement * 0.9) engagementTrend = 'decreasing';
    }

    return {
      contentTypes,
      platformDistribution,
      userActivity: {
        recentUploads,
        totalContent: userContent.length,
        dominantType,
        engagementTrend
      }
    };
  }, [userContent]);

  // Mock Content Hub API call (replace with actual endpoint)
  const fetchContentHubData = useCallback(async (): Promise<ContentHubData> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // For now, return analyzed data
    // In production, this would call: GET /api/content-hub
    return analyzeUserContent();
  }, [analyzeUserContent]);

  // OpenAI API call for content suggestions
  const generateOpenAISuggestions = useCallback(async (contentHubData: ContentHubData): Promise<Partial<InspirationSuggestion>[]> => {
    try {
      // Mock OpenAI API call (replace with actual implementation)
      // In production, this would call OpenAI API with the content hub data
      
      const prompt = `Based on the following user content analysis, suggest 5 high-performing content pieces from different platforms (YouTube, Instagram, Spotify, TikTok, etc.) that would be relevant and inspiring:

Content Types: ${Object.entries(contentHubData.contentTypes).map(([type, count]) => `${type}: ${count}`).join(', ')}
Platforms Used: ${Object.entries(contentHubData.platformDistribution).map(([platform, count]) => `${platform}: ${count}`).join(', ')}
Dominant Content Type: ${contentHubData.userActivity.dominantType}
Recent Activity: ${contentHubData.userActivity.recentUploads} uploads in last 7 days
Engagement Trend: ${contentHubData.userActivity.engagementTrend}

Return suggestions in this format:
1. **Title**: Description (platform: YouTube, creator: Creator Name, url: https://example.com, thumbnail: https://image.jpg, relevance: Why this is relevant)
2. **Title**: Description (platform: Instagram, creator: Creator Name, url: https://example.com, thumbnail: https://image.jpg, relevance: Why this is relevant)
...`;

      // Simulate API response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock response - replace with actual OpenAI API call
      const mockResponse = [
        {
          title: "10 Creative Instagram Reels That Went Viral",
          description: "Learn the secrets behind these engaging short-form videos that captured millions of views",
          platform: "Instagram",
          creator: "Social Media Pro",
          url: "https://www.instagram.com/p/example1",
          thumbnail: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&h=400&fit=crop",
          relevance: "Perfect for your visual content strategy and Instagram growth"
        },
        {
          title: "Spotify Playlist Curation Masterclass",
          description: "Discover how top curators build engaging playlists that attract loyal listeners",
          platform: "Spotify",
          creator: "Music Marketing Expert",
          url: "https://open.spotify.com/playlist/example2",
          thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
          relevance: "Great for your audio content and music-related audience building"
        },
        {
          title: "YouTube Shorts Success Stories",
          description: "Real examples of creators who grew from 0 to 100K subscribers using Shorts",
          platform: "YouTube",
          creator: "Creator Academy",
          url: "https://www.youtube.com/watch?v=example3",
          thumbnail: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400&h=400&fit=crop",
          relevance: "Excellent for video content strategy and YouTube growth"
        },
        {
          title: "TikTok Trend Analysis Guide",
          description: "How to identify and leverage trending content before it goes viral",
          platform: "TikTok",
          creator: "Trend Hunter",
          url: "https://www.tiktok.com/@example4",
          thumbnail: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=400&fit=crop",
          relevance: "Perfect for staying ahead of trends and viral content creation"
        },
        {
          title: "Pinterest SEO Secrets Revealed",
          description: "Optimize your pins for maximum discoverability and engagement",
          platform: "Pinterest",
          creator: "Pinterest Strategist",
          url: "https://www.pinterest.com/pin/example5",
          thumbnail: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=400&fit=crop",
          relevance: "Great for visual content optimization and Pinterest growth"
        }
      ];

      return mockResponse;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate AI suggestions');
    }
  }, []);

  // URL validation function
  const validateUrl = useCallback(async (url: string): Promise<boolean> => {
    try {
      // Remove tracking parameters
      const cleanUrl = new URL(url);
      const searchParams = cleanUrl.searchParams;
      
      // Remove common tracking parameters
      const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'];
      trackingParams.forEach(param => searchParams.delete(param));
      
      const finalUrl = cleanUrl.toString();
      
      // Mock validation (replace with actual backend validation)
      // In production, this would call: POST /api/validate-url
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Simulate validation results
      const isValid = Math.random() > 0.1; // 90% success rate for demo
      
      if (isValid) {
        // Update URL to cleaned version
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('URL validation error:', error);
      return false;
    }
  }, []);

  // Generate fallback suggestions for failed validations
  const generateFallbackSuggestions = useCallback((failedCount: number): InspirationSuggestion[] => {
    const fallbacks: InspirationSuggestion[] = [];
    
    const fallbackOptions = [
      {
        title: "Explore Trending Content",
        description: "Discover what's popular in your niche right now",
        platform: "Explore",
        creator: "GYB Platform",
        url: "https://www.google.com/search?q=trending+content+creation",
        thumbnail: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&h=400&fit=crop",
        relevance: "Find inspiration from current trends"
      },
      {
        title: "Content Creation Tips",
        description: "Learn best practices for creating engaging content",
        platform: "Resources",
        creator: "GYB Academy",
        url: "https://www.google.com/search?q=content+creation+tips",
        thumbnail: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
        relevance: "Improve your content creation skills"
      },
      {
        title: "Platform Growth Strategies",
        description: "Strategies to grow your presence on any platform",
        platform: "Strategy",
        creator: "Growth Expert",
        url: "https://www.google.com/search?q=platform+growth+strategies",
        thumbnail: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400&h=400&fit=crop",
        relevance: "Scale your content across platforms"
      }
    ];

    for (let i = 0; i < failedCount && i < fallbackOptions.length; i++) {
      fallbacks.push({
        ...fallbackOptions[i],
        id: `fallback-${i}`,
        isFallback: true
      });
    }

    return fallbacks;
  }, []);

  // Main function to fetch and validate suggestions
  const fetchSuggestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Fetch Content Hub data
      const hubData = await fetchContentHubData();
      setContentHubData(hubData);

      // 2. Generate OpenAI suggestions
      const rawSuggestions = await generateOpenAISuggestions(hubData);

      // 3. Validate URLs and ensure platform diversity
      const validatedSuggestions: InspirationSuggestion[] = [];
      const usedPlatforms = new Set<string>();
      let fallbackCount = 0;

      for (const suggestion of rawSuggestions) {
        if (validatedSuggestions.length >= 3) break;

        // Ensure platform diversity
        if (usedPlatforms.has(suggestion.platform?.toLowerCase() || '')) {
          continue;
        }

        // Validate URL
        const isValid = await validateUrl(suggestion.url || '');
        
        if (isValid) {
          validatedSuggestions.push({
            id: `suggestion-${validatedSuggestions.length}`,
            title: suggestion.title || '',
            description: suggestion.description || '',
            url: suggestion.url || '',
            thumbnail: suggestion.thumbnail || '',
            platform: suggestion.platform || '',
            creator: suggestion.creator || '',
            relevance: suggestion.relevance || ''
          });
          usedPlatforms.add(suggestion.platform?.toLowerCase() || '');
        } else {
          fallbackCount++;
        }
      }

      // 4. Fill remaining slots with fallbacks if needed
      if (validatedSuggestions.length < 3) {
        const needed = 3 - validatedSuggestions.length;
        const fallbacks = generateFallbackSuggestions(needed);
        validatedSuggestions.push(...fallbacks);
      }

      setSuggestions(validatedSuggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch suggestions');
      
      // Set fallback suggestions on error
      const fallbacks = generateFallbackSuggestions(3);
      setSuggestions(fallbacks);
    } finally {
      setIsLoading(false);
    }
  }, [fetchContentHubData, generateOpenAISuggestions, validateUrl, generateFallbackSuggestions]);

  // Refresh suggestions
  const refreshSuggestions = useCallback(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  // Initialize on mount
  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  return {
    suggestions,
    isLoading,
    error,
    contentHubData,
    refreshSuggestions,
    fetchSuggestions
  };
};
