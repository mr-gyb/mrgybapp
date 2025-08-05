import { ContentItem } from '../../types/content';

export interface PlatformViewData {
  platform: string;
  views: number;
  likes?: number;
  shares?: number;
  comments?: number;
  lastUpdated: string;
  error?: string;
}

export interface PlatformConfig {
  apiKey?: string;
  accessToken?: string;
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
}

export interface ApiResponse {
  success: boolean;
  data?: PlatformViewData;
  error?: string;
  rateLimitRemaining?: number;
}

/**
 * Platform API Service
 * Handles real API integrations for content performance tracking
 */
class PlatformApiService {
  private configs: Map<string, PlatformConfig> = new Map();

  constructor() {
    this.loadConfigs();
  }

  private loadConfigs() {
    // Load API configurations from environment variables
    this.configs.set('youtube', {
      apiKey: import.meta.env.VITE_YOUTUBE_API_KEY
    });

    this.configs.set('instagram', {
      accessToken: import.meta.env.VITE_INSTAGRAM_ACCESS_TOKEN,
      clientId: import.meta.env.VITE_INSTAGRAM_CLIENT_ID,
      clientSecret: import.meta.env.VITE_INSTAGRAM_CLIENT_SECRET
    });

    this.configs.set('tiktok', {
      accessToken: import.meta.env.VITE_TIKTOK_ACCESS_TOKEN,
      clientId: import.meta.env.VITE_TIKTOK_CLIENT_ID
    });

    this.configs.set('facebook', {
      accessToken: import.meta.env.VITE_FACEBOOK_ACCESS_TOKEN,
      clientId: import.meta.env.VITE_FACEBOOK_CLIENT_ID
    });

    this.configs.set('pinterest', {
      accessToken: import.meta.env.VITE_PINTEREST_ACCESS_TOKEN
    });

    this.configs.set('spotify', {
      accessToken: import.meta.env.VITE_SPOTIFY_ACCESS_TOKEN,
      clientId: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
      clientSecret: import.meta.env.VITE_SPOTIFY_CLIENT_SECRET
    });
  }

  /**
   * Extract platform-specific IDs from URLs
   */
  private extractPlatformId(url: string, platform: string): string | null {
    try {
      const urlObj = new URL(url);
      
      switch (platform.toLowerCase()) {
        case 'youtube':
          // Handle both youtube.com and youtu.be URLs
          if (urlObj.hostname.includes('youtube.com')) {
            return urlObj.searchParams.get('v');
          } else if (urlObj.hostname.includes('youtu.be')) {
            return urlObj.pathname.slice(1);
          }
          break;
          
        case 'instagram':
          // Extract media ID from Instagram URL
          const instagramMatch = url.match(/instagram\.com\/p\/([^\/\?]+)/);
          return instagramMatch ? instagramMatch[1] : null;
          
        case 'tiktok':
          // Extract video ID from TikTok URL
          const tiktokMatch = url.match(/tiktok\.com\/@[^\/]+\/video\/(\d+)/);
          return tiktokMatch ? tiktokMatch[1] : null;
          
        case 'facebook':
          // Extract post ID from Facebook URL
          const facebookMatch = url.match(/facebook\.com\/[^\/]+\/posts\/(\d+)/);
          return facebookMatch ? facebookMatch[1] : null;
          
        case 'pinterest':
          // Extract pin ID from Pinterest URL
          const pinterestMatch = url.match(/pinterest\.com\/pin\/(\d+)/);
          return pinterestMatch ? pinterestMatch[1] : null;
          
        case 'spotify':
          // Extract track ID from Spotify URL
          const spotifyMatch = url.match(/spotify\.com\/track\/([a-zA-Z0-9]+)/);
          return spotifyMatch ? spotifyMatch[1] : null;
      }
    } catch (error) {
      console.error(`Error extracting ${platform} ID from URL:`, error);
    }
    
    return null;
  }

  /**
   * YouTube Data API v3
   */
  async fetchYouTubeViews(contentItem: ContentItem): Promise<ApiResponse> {
    const config = this.configs.get('youtube');
    if (!config?.apiKey) {
      return {
        success: false,
        error: 'YouTube API key not configured'
      };
    }

    const videoId = this.extractPlatformId(contentItem.originalUrl || '', 'youtube');
    if (!videoId) {
      return {
        success: false,
        error: 'Could not extract YouTube video ID from URL'
      };
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&key=${config.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        return {
          success: false,
          error: 'Video not found or not accessible'
        };
      }

      const stats = data.items[0].statistics;
      
      return {
        success: true,
        data: {
          platform: 'youtube',
          views: parseInt(stats.viewCount || '0'),
          likes: parseInt(stats.likeCount || '0'),
          comments: parseInt(stats.commentCount || '0'),
          lastUpdated: new Date().toISOString()
        },
        rateLimitRemaining: parseInt(response.headers.get('X-RateLimit-Remaining') || '0')
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Instagram Basic Display API
   */
  async fetchInstagramViews(contentItem: ContentItem): Promise<ApiResponse> {
    const config = this.configs.get('instagram');
    if (!config?.accessToken) {
      return {
        success: false,
        error: 'Instagram access token not configured'
      };
    }

    const mediaId = this.extractPlatformId(contentItem.originalUrl || '', 'instagram');
    if (!mediaId) {
      return {
        success: false,
        error: 'Could not extract Instagram media ID from URL'
      };
    }

    try {
      const response = await fetch(
        `https://graph.instagram.com/v12.0/${mediaId}?fields=id,media_type,like_count,comments_count&access_token=${config.accessToken}`
      );

      if (!response.ok) {
        throw new Error(`Instagram API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: {
          platform: 'instagram',
          views: 0, // Instagram doesn't provide view counts via Basic Display API
          likes: parseInt(data.like_count || '0'),
          comments: parseInt(data.comments_count || '0'),
          lastUpdated: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * TikTok for Developers API
   */
  async fetchTikTokViews(contentItem: ContentItem): Promise<ApiResponse> {
    const config = this.configs.get('tiktok');
    if (!config?.accessToken) {
      return {
        success: false,
        error: 'TikTok access token not configured'
      };
    }

    const videoId = this.extractPlatformId(contentItem.originalUrl || '', 'tiktok');
    if (!videoId) {
      return {
        success: false,
        error: 'Could not extract TikTok video ID from URL'
      };
    }

    try {
      const response = await fetch(
        `https://open-api.tiktok.com/video/query/?access_token=${config.accessToken}&fields=["play_count","like_count","share_count","comment_count"]&video_id=${videoId}`
      );

      if (!response.ok) {
        throw new Error(`TikTok API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        return {
          success: false,
          error: data.error.message || 'TikTok API error'
        };
      }

      return {
        success: true,
        data: {
          platform: 'tiktok',
          views: parseInt(data.data.play_count || '0'),
          likes: parseInt(data.data.like_count || '0'),
          shares: parseInt(data.data.share_count || '0'),
          comments: parseInt(data.data.comment_count || '0'),
          lastUpdated: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Facebook Graph API
   */
  async fetchFacebookViews(contentItem: ContentItem): Promise<ApiResponse> {
    // Use the provided access token
    const accessToken = '432001285103240|H5xN5v-szxHTgjwZ6gjK3FS-m5g';
    
    const postId = this.extractPlatformId(contentItem.originalUrl || '', 'facebook');
    if (!postId) {
      return {
        success: false,
        error: 'Could not extract Facebook post ID from URL'
      };
    }

    try {
      // Fetch only the two specific fields requested: post_impressions and post_reactions_by_type_total
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${postId}?fields=insights.metric(post_impressions,post_reactions_by_type_total)&access_token=${accessToken}`
      );

      if (!response.ok) {
        throw new Error(`Facebook API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Extract the specific metrics
      const insights = data.insights?.data || [];
      const impressions = insights.find((insight: any) => insight.name === 'post_impressions')?.values?.[0]?.value || 0;
      const reactions = insights.find((insight: any) => insight.name === 'post_reactions_by_type_total')?.values?.[0]?.value || 0;
      
      return {
        success: true,
        data: {
          platform: 'facebook',
          views: parseInt(impressions.toString()),
          likes: parseInt(reactions.toString()),
          lastUpdated: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Pinterest API v5
   */
  async fetchPinterestViews(contentItem: ContentItem): Promise<ApiResponse> {
    const config = this.configs.get('pinterest');
    if (!config?.accessToken) {
      return {
        success: false,
        error: 'Pinterest access token not configured'
      };
    }

    const pinId = this.extractPlatformId(contentItem.originalUrl || '', 'pinterest');
    if (!pinId) {
      return {
        success: false,
        error: 'Could not extract Pinterest pin ID from URL'
      };
    }

    try {
      const response = await fetch(
        `https://api.pinterest.com/v5/pins/${pinId}?access_token=${config.accessToken}`
      );

      if (!response.ok) {
        throw new Error(`Pinterest API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: {
          platform: 'pinterest',
          views: 0, // Pinterest doesn't provide view counts
          likes: 0, // Pinterest doesn't have likes in the same way
          shares: parseInt(data.save_count || '0'),
          lastUpdated: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Spotify Web API
   */
  async fetchSpotifyViews(contentItem: ContentItem): Promise<ApiResponse> {
    const config = this.configs.get('spotify');
    if (!config?.accessToken) {
      return {
        success: false,
        error: 'Spotify access token not configured'
      };
    }

    const trackId = this.extractPlatformId(contentItem.originalUrl || '', 'spotify');
    if (!trackId) {
      return {
        success: false,
        error: 'Could not extract Spotify track ID from URL'
      };
    }

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/tracks/${trackId}`,
        {
          headers: {
            'Authorization': `Bearer ${config.accessToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        data: {
          platform: 'spotify',
          views: 0, // Spotify doesn't provide play counts via public API
          likes: 0, // No like count in public API
          comments: 0, // No comment count in public API
          lastUpdated: new Date().toISOString()
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Fetch views for all platforms of a content item
   */
  async fetchAllPlatformViews(contentItem: ContentItem): Promise<PlatformViewData[]> {
    const results: PlatformViewData[] = [];
    
    if (!contentItem.platforms || contentItem.platforms.length === 0) {
      return results;
    }

    for (const platform of contentItem.platforms) {
      try {
        const result = await this.fetchPlatformViews(contentItem, platform);
        if (result.success && result.data) {
          results.push(result.data);
        } else {
          results.push({
            platform,
            views: 0,
            lastUpdated: new Date().toISOString(),
            error: result.error
          });
        }
      } catch (error) {
        results.push({
          platform,
          views: 0,
          lastUpdated: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }

  /**
   * Fetch views for a specific platform
   */
  async fetchPlatformViews(contentItem: ContentItem, platform: string): Promise<ApiResponse> {
    switch (platform.toLowerCase()) {
      case 'youtube':
        return await this.fetchYouTubeViews(contentItem);
      case 'instagram':
        return await this.fetchInstagramViews(contentItem);
      case 'tiktok':
        return await this.fetchTikTokViews(contentItem);
      case 'facebook':
        return await this.fetchFacebookViews(contentItem);
      case 'pinterest':
        return await this.fetchPinterestViews(contentItem);
      case 'spotify':
        return await this.fetchSpotifyViews(contentItem);
      default:
        return {
          success: false,
          error: `No API implementation for platform: ${platform}`
        };
    }
  }

  /**
   * Check if a platform is configured
   */
  isPlatformConfigured(platform: string): boolean {
    const config = this.configs.get(platform.toLowerCase());
    return !!(config?.apiKey || config?.accessToken);
  }

  /**
   * Get list of configured platforms
   */
  getConfiguredPlatforms(): string[] {
    return Array.from(this.configs.keys()).filter(platform => 
      this.isPlatformConfigured(platform)
    );
  }
}

export const platformApiService = new PlatformApiService();
export default platformApiService; 