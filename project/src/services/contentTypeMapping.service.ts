/**
 * Content Type Distribution Mapping Service
 * 
 * This service maps platform selections to content types and platform categories
 * for analytics and content classification purposes.
 */

export interface ContentTypeMapping {
  platform: string;
  contentType: string;
  platformCategory: string;
  analyticsLabel: string;
}

export interface ContentTypeMappingResult {
  contentType: string;
  platformCategory: string;
  analyticsLabel: string;
}

/**
 * Content Type Distribution Mapping Service
 */
class ContentTypeMappingService {
  private readonly platformMappings: ContentTypeMapping[] = [
    // Social Media Platforms
    {
      platform: 'Facebook',
      contentType: 'Facebook',
      platformCategory: 'social-media',
      analyticsLabel: 'Facebook'
    },
    {
      platform: 'Instagram',
      contentType: 'Instagram',
      platformCategory: 'social-media',
      analyticsLabel: 'Instagram'
    },
    {
      platform: 'Pinterest',
      contentType: 'Pinterest',
      platformCategory: 'social-media',
      analyticsLabel: 'Pinterest'
    },
    {
      platform: 'Twitter',
      contentType: 'Twitter',
      platformCategory: 'social-media',
      analyticsLabel: 'Twitter'
    },
    {
      platform: 'TikTok',
      contentType: 'TikTok',
      platformCategory: 'social-media',
      analyticsLabel: 'TikTok'
    },
    {
      platform: 'LinkedIn',
      contentType: 'LinkedIn',
      platformCategory: 'social-media',
      analyticsLabel: 'LinkedIn'
    },
    
    // Video Platforms
    {
      platform: 'YouTube',
      contentType: 'YouTube',
      platformCategory: 'video',
      analyticsLabel: 'YouTube'
    },
    {
      platform: 'Video',
      contentType: 'Video',
      platformCategory: 'video',
      analyticsLabel: 'Video'
    },
    {
      platform: 'Vimeo',
      contentType: 'Vimeo',
      platformCategory: 'video',
      analyticsLabel: 'Vimeo'
    },
    
    // Audio Platforms
    {
      platform: 'Spotify',
      contentType: 'Spotify',
      platformCategory: 'audio',
      analyticsLabel: 'Spotify'
    },
    {
      platform: 'Apple Music',
      contentType: 'Apple Music',
      platformCategory: 'audio',
      analyticsLabel: 'Apple Music'
    },
    {
      platform: 'SoundCloud',
      contentType: 'SoundCloud',
      platformCategory: 'audio',
      analyticsLabel: 'SoundCloud'
    },
    
    // Blog/Content Platforms
    {
      platform: 'Blog',
      contentType: 'Blog',
      platformCategory: 'blog',
      analyticsLabel: 'Blog'
    },
    {
      platform: 'Medium',
      contentType: 'Medium',
      platformCategory: 'blog',
      analyticsLabel: 'Medium'
    },
    {
      platform: 'WordPress',
      contentType: 'WordPress',
      platformCategory: 'blog',
      analyticsLabel: 'WordPress'
    },
    {
      platform: 'Substack',
      contentType: 'Substack',
      platformCategory: 'blog',
      analyticsLabel: 'Substack'
    },
    
    // Newsletter Platforms
    {
      platform: 'Newsletter',
      contentType: 'Newsletter',
      platformCategory: 'newsletter',
      analyticsLabel: 'Newsletter'
    },
    {
      platform: 'Mailchimp',
      contentType: 'Mailchimp',
      platformCategory: 'newsletter',
      analyticsLabel: 'Mailchimp'
    },
    
    // Other Platforms
    {
      platform: 'Other',
      contentType: 'Other',
      platformCategory: 'other',
      analyticsLabel: 'Other'
    }
  ];

  /**
   * Get content type mapping for a specific platform
   * @param platform - The platform name
   * @returns ContentTypeMappingResult or null if not found
   */
  getContentTypeMapping(platform: string): ContentTypeMappingResult | null {
    const mapping = this.platformMappings.find(
      m => m.platform.toLowerCase() === platform.toLowerCase()
    );
    
    if (!mapping) {
      return null;
    }
    
    return {
      contentType: mapping.contentType,
      platformCategory: mapping.platformCategory,
      analyticsLabel: mapping.analyticsLabel
    };
  }

  /**
   * Get all available platforms
   * @returns Array of platform names
   */
  getAllPlatforms(): string[] {
    return this.platformMappings.map(m => m.platform);
  }

  /**
   * Get platforms by category
   * @param category - The platform category
   * @returns Array of platform names in that category
   */
  getPlatformsByCategory(category: string): string[] {
    return this.platformMappings
      .filter(m => m.platformCategory === category)
      .map(m => m.platform);
  }

  /**
   * Get all platform categories
   * @returns Array of unique platform categories
   */
  getAllPlatformCategories(): string[] {
    return [...new Set(this.platformMappings.map(m => m.platformCategory))];
  }

  /**
   * Get content types by platform category
   * @param category - The platform category
   * @returns Array of content types in that category
   */
  getContentTypesByCategory(category: string): string[] {
    return this.platformMappings
      .filter(m => m.platformCategory === category)
      .map(m => m.contentType);
  }

  /**
   * Map multiple platforms to their content types and categories
   * @param platforms - Array of platform names
   * @returns Array of ContentTypeMappingResult
   */
  mapMultiplePlatforms(platforms: string[]): ContentTypeMappingResult[] {
    return platforms
      .map(platform => this.getContentTypeMapping(platform))
      .filter((mapping): mapping is ContentTypeMappingResult => mapping !== null);
  }

  /**
   * Get analytics data structure for content type distribution
   * @param userContent - Array of user content items
   * @returns Analytics data structure
   */
  getContentTypeAnalyticsData(userContent: any[]): {
    barData: any[];
    platformData: any[];
    blogTypes: string[];
    audioTypes: string[];
    socialMediaTypes: string[];
    otherTypes: string[];
    contentTypeColors: Record<string, string>;
    legendKeys: string[];
    platformColors: string[];
  } {
    // Count content by platform
    const platformCounts: Record<string, number> = {};
    const platformViews: Record<string, number> = {};
    
    userContent.forEach(content => {
      if (content.platforms && Array.isArray(content.platforms)) {
        content.platforms.forEach((platform: string) => {
          const mapping = this.getContentTypeMapping(platform);
          if (mapping) {
            const key = mapping.analyticsLabel;
            platformCounts[key] = (platformCounts[key] || 0) + 1;
            platformViews[key] = (platformViews[key] || 0) + (content.views || 0);
          }
        });
      }
    });

    // Create bar data for content type distribution
    const barData = Object.keys(platformCounts).map(platform => ({
      name: platform,
      count: platformCounts[platform],
      views: platformViews[platform] || 0,
      color: this.getPlatformColor(platform)
    }));

    // Create platform data for platform distribution
    const platformData = this.getAllPlatformCategories().map(category => {
      const platformsInCategory = this.getPlatformsByCategory(category);
      const totalCount = platformsInCategory.reduce((sum, platform) => {
        const mapping = this.getContentTypeMapping(platform);
        return sum + (mapping ? (platformCounts[mapping.analyticsLabel] || 0) : 0);
      }, 0);
      
      return {
        name: this.formatCategoryName(category),
        value: totalCount,
        percentage: userContent.length > 0 ? Math.round((totalCount / userContent.length) * 100) : 0,
        color: this.getCategoryColor(category)
      };
    }).filter(item => item.value > 0);

    // Get content types by category
    const blogTypes = this.getContentTypesByCategory('blog');
    const audioTypes = this.getContentTypesByCategory('audio');
    const socialMediaTypes = this.getContentTypesByCategory('social-media');
    const otherTypes = this.getContentTypesByCategory('other');

    // Create color mappings
    const contentTypeColors: Record<string, string> = {};
    this.platformMappings.forEach(mapping => {
      contentTypeColors[mapping.analyticsLabel] = this.getPlatformColor(mapping.platform);
    });

    const legendKeys = Object.keys(contentTypeColors);
    const platformColors = this.getAllPlatformCategories().map(category => this.getCategoryColor(category));

    return {
      barData,
      platformData,
      blogTypes,
      audioTypes,
      socialMediaTypes,
      otherTypes,
      contentTypeColors,
      legendKeys,
      platformColors
    };
  }

  /**
   * Get color for a specific platform
   * @param platform - Platform name
   * @returns Color hex code
   */
  private getPlatformColor(platform: string): string {
    const colorMap: Record<string, string> = {
      'Facebook': '#1877F3',
      'Instagram': '#C13584',
      'Pinterest': '#E60023',
      'Twitter': '#1DA1F2',
      'TikTok': '#000000',
      'LinkedIn': '#0077B5',
      'YouTube': '#FF0000',
      'Spotify': '#1DB954',
      'Apple Music': '#FA243C',
      'SoundCloud': '#FF7700',
      'Blog': '#FF6B35',
      'Medium': '#00AB6C',
      'WordPress': '#21759B',
      'Substack': '#FF6719',
      'Newsletter': '#FF6B35',
      'Mailchimp': '#FFE01B',
      'Other': '#9E9E9E'
    };
    
    return colorMap[platform] || '#9E9E9E';
  }

  /**
   * Get color for a platform category
   * @param category - Platform category
   * @returns Color hex code
   */
  private getCategoryColor(category: string): string {
    const colorMap: Record<string, string> = {
      'social-media': '#C13584',
      'video': '#FF0000',
      'audio': '#1DB954',
      'blog': '#FF6B35',
      'newsletter': '#FF6B35',
      'other': '#9E9E9E'
    };
    
    return colorMap[category] || '#9E9E9E';
  }

  /**
   * Format category name for display
   * @param category - Raw category name
   * @returns Formatted category name
   */
  private formatCategoryName(category: string): string {
    const formatMap: Record<string, string> = {
      'social-media': 'Social Media',
      'video': 'Video',
      'audio': 'Audio',
      'blog': 'Blog',
      'newsletter': 'Newsletter',
      'other': 'Other'
    };
    
    return formatMap[category] || category;
  }
}

// Export singleton instance
const contentTypeMappingService = new ContentTypeMappingService();
export default contentTypeMappingService;
