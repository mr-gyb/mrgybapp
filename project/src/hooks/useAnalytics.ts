import { useMemo } from 'react';
import { ContentItem } from '../types/content';

// Helper function to group platforms - EXPORTED
export const groupPlatform = (platform: string): 'Audio' | 'Video' | 'Social Media' | 'YouTube' | 'Other' | 'Blogs' => {
  const platformLower = platform.toLowerCase();
  
  if (['spotify', 'audio', 'podcast'].includes(platformLower)) return 'Audio';
  if (['youtube', 'video'].includes(platformLower)) return 'YouTube';
  if (['instagram', 'pinterest', 'facebook', 'social'].includes(platformLower)) return 'Social Media';
  if (['blog', 'written', 'medium', 'wordpress', 'substack'].includes(platformLower)) return 'Blogs';
  if (['other'].includes(platformLower)) return 'Other';
  return 'Other';
};

interface AnalyticsData {
  barData: Array<{
    name: string;
    count: number;
    color: string;
    views: number;
  }>;
  platformData: Array<{
    name: string;
    value: number;
    percentage: number;
    color: string;
  }>;
  blogTypes: string[];
  audioTypes: string[];
  socialMediaTypes: string[];
  otherTypes: string[];
  CONTENT_TYPE_COLORS: Record<string, string>;
  LEGEND_KEYS: string[];
  COLORS: string[];
  PLATFORM_GROUP_COLORS: Record<string, string>;
}

export const useAnalytics = (userContent: ContentItem[], youtubeVideoViews: number = 0): AnalyticsData => {
  return useMemo(() => {
    // Helper function to group content types
    const groupContentType = (item: ContentItem): 'Blogs' | 'Audio' | 'Video' | 'Social Media' | 'Other' => {
      if (item.type === 'written') return 'Blogs';
      if (item.type === 'audio') return 'Audio';
      if (item.type === 'video') return 'Video';
      if (item.type === 'photo') {
        if (item.platforms && item.platforms.some(p => ['Instagram', 'Pinterest', 'Facebook'].includes(p))) {
          return 'Social Media';
        }
      }
      if (item.platforms && item.platforms.some(p => ['Newsletter', 'Other'].includes(p))) {
        return 'Other';
      }
      return 'Other';
    };

    // Calculate unified content analytics
    const calculateContentAnalytics = () => {
      const totalContent = userContent.length;
      const realContent = userContent.filter((item: ContentItem) => !item.id.startsWith('default-'));

      // Content type distribution (based on platforms, not content type)
      const contentTypeDistribution: Record<string, number> = {};
      userContent.forEach((item: ContentItem) => {
        // Use platform-based grouping instead of content type
        if (item.platforms && item.platforms.length > 0) {
          // Group by the first platform (or use a more sophisticated grouping)
          const firstPlatform = item.platforms[0];
          const group = groupPlatform(firstPlatform);
          contentTypeDistribution[group] = (contentTypeDistribution[group] || 0) + 1;
        } else {
          // Fallback to content type if no platforms
          let group: string;
          if (item.type === 'written') {
            group = 'Blogs';
          } else if (item.type === 'audio') {
            group = 'Audio';
          } else if (item.type === 'video') {
            group = 'YouTube';
          } else if (item.type === 'photo') {
            group = 'Social Media';
          } else {
            group = 'Other';
          }
          contentTypeDistribution[group] = (contentTypeDistribution[group] || 0) + 1;
        }
      });

      // Platform distribution (grouped)
      const platformCounts: Record<string, number> = {};
      userContent.forEach((item: ContentItem) => {
        // Handle platforms array
        (item.platforms || []).forEach((platform: string) => {
          const group = groupPlatform(platform);
          platformCounts[group] = (platformCounts[group] || 0) + 1;
        });
      });

      return {
        totalContent,
        realContent: realContent.length,
        contentTypeDistribution,
        platformCounts,
      };
    };

    const analytics = calculateContentAnalytics();

    // Color map for platform groups
    const PLATFORM_GROUP_COLORS: Record<string, string> = {
      'Audio': '#1DB954',
      'Video': '#FF0000',
      'Social Media': '#C13584',
      'YouTube': '#FF0000',
      'Blogs': '#3366CC', // Added Blogs color
      'Other': '#9E9E9E'
    };

    // Color map for content type groups (updated for legend)
    const CONTENT_TYPE_COLORS: Record<string, string> = {
      'YouTube': '#FF0000',
      'Instagram': '#C13584',
      'Spotify': '#1DB954',
      'Pinterest': '#E60023', 
      'Other': '#9E9E9E',
      'Facebook': '#1877F3',
      'Blogs': '#3366CC', // Added Blogs color
    };

    // Only show these keys in the legend
    const LEGEND_KEYS = [
      'YouTube', 'Instagram', 'Spotify', 'Pinterest', 'Other', 'Facebook', 'Blogs' // Added Blogs to legend
    ];

    // Prepare individual platform data
    const blogTypes = ['Medium', 'WordPress', 'Substack'];
    const audioTypes = ['Spotify'];
    const socialMediaTypes = ['Instagram', 'Pinterest', 'Facebook'];
    const otherTypes = ['Other'];
    
    // Create individual platform data instead of grouped data
    const individualPlatformData: any[] = [];
    
    // Spotify
    const spotifyCount = userContent.filter(item => 
      item.platforms && 
      item.platforms.some(p => groupPlatform(p) === 'Audio')
    ).length;
    
    if (spotifyCount > 0) {
      individualPlatformData.push({
        name: 'Spotify',
        count: spotifyCount,
        color: '#1DB954',
        views: userContent
          .filter(item => 
            item.platforms && 
            item.platforms.some(p => groupPlatform(p) === 'Audio')
          )
          .reduce((sum, item) => sum + (item.views || item.engagement || 1), 0),
      });
    }
    
    // YouTube
    const youtubeCount = userContent.filter(item => 
      item.platforms && 
      item.platforms.some(p => groupPlatform(p) === 'YouTube')
    ).length;
    
    if (youtubeCount > 0) {
      individualPlatformData.push({
        name: 'YouTube',
        count: youtubeCount,
        color: '#FF0000',
        views: userContent
          .filter(item => 
            item.platforms && 
            item.platforms.some(p => groupPlatform(p) === 'YouTube')
          )
          .reduce((sum, item) => sum + (item.views || item.engagement || 1), 0),
      });
    }
    
    // Instagram
    const instagramCount = userContent.filter(item => 
      item.platforms && 
      item.platforms.some(p => groupPlatform(p) === 'Social Media')
    ).length;
    
    if (instagramCount > 0) {
      individualPlatformData.push({
        name: 'Instagram',
        count: instagramCount,
        color: '#C13584',
        views: userContent
          .filter(item => 
            item.platforms && 
            item.platforms.some(p => groupPlatform(p) === 'Social Media')
          )
          .reduce((sum, item) => sum + (item.views ?? 1), 0),
      });
    }
    
    // Pinterest
    const pinterestCount = userContent.filter(item => 
      item.platforms && 
      item.platforms.some(p => groupPlatform(p) === 'Social Media')
    ).length;
    
    if (pinterestCount > 0) {
      individualPlatformData.push({
        name: 'Pinterest',
        count: pinterestCount,
        color: '#E60023',
        views: userContent
          .filter(item => 
            item.platforms && 
            item.platforms.some(p => groupPlatform(p) === 'Social Media')
          )
          .reduce((sum, item) => sum + (item.views ?? 1), 0),
      });
    }
    
    // Facebook
    const facebookCount = userContent.filter(item => 
      item.platforms && 
      item.platforms.some(p => groupPlatform(p) === 'Social Media')
    ).length;
    
    if (facebookCount > 0) {
      individualPlatformData.push({
        name: 'Facebook',
        count: facebookCount,
        color: '#1877F3',
        views: userContent
          .filter(item => 
            item.platforms && 
            item.platforms.some(p => groupPlatform(p) === 'Social Media')
          )
          .reduce((sum, item) => sum + (item.views ?? 1), 0),
      });
    }
    
    // Blogs (new)
    const blogCount = userContent.filter(item => 
      item.platforms && 
      item.platforms.some(p => groupPlatform(p) === 'Blogs')
    ).length;

    if (blogCount > 0) {
      individualPlatformData.push({
        name: 'Blogs',
        count: blogCount,
        color: PLATFORM_GROUP_COLORS.Blogs,
        views: userContent
          .filter(item => 
            item.platforms && 
            item.platforms.some(p => groupPlatform(p) === 'Blogs')
          )
          .reduce((sum, item) => sum + (item.views ?? 1), 0),
      });
    }

    // Other
    const otherCount = userContent.filter(item => 
      item.platforms && 
      item.platforms.some(p => groupPlatform(p) === 'Other')
    ).length;
    
    if (otherCount > 0) {
      individualPlatformData.push({
        name: 'Other',
        count: otherCount,
        color: '#9E9E9E',
        views: userContent
          .filter(item => 
            item.platforms && 
            item.platforms.some(p => groupPlatform(p) === 'Other')
          )
          .reduce((sum, item) => sum + (item.views || item.engagement || 1), 0),
      });
    }
    
    const groupedContentData = individualPlatformData;

    // Add YouTube video views to groupedContentData if available
    const groupedContentDataWithYouTube = groupedContentData.map(row => {
      if (row.name === 'YouTube') {
        return {
          ...row,
          views: youtubeVideoViews
        };
      }
      return row;
    });

    let barData = groupedContentDataWithYouTube;
    if (barData.length > 15) {
      barData = [...barData]
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 15);
    }

    const platformData = Object.entries(analytics.platformCounts)
      .filter(([platform, count]) => count > 0) // Only show platforms with actual content
      .map(([platform, count]) => ({
        name: platform,
        value: count,
        percentage: analytics.totalContent > 0 ? (count / analytics.totalContent) * 100 : 0,
        color: PLATFORM_GROUP_COLORS[platform] || '#8884d8'
      }));

    return {
      barData,
      platformData,
      blogTypes,
      audioTypes,
      socialMediaTypes,
      otherTypes,
      CONTENT_TYPE_COLORS,
      LEGEND_KEYS,
      COLORS: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C80'],
      PLATFORM_GROUP_COLORS
    };
  }, [userContent, youtubeVideoViews]);
};
