import { ContentItem } from '../../types/content';

export interface PlatformViewData {
  platform: string;
  views: number;
  likes?: number;
  shares?: number;
  comments?: number;
  duration?: string;
  subscriberCount?: number;
  followers?: number;
  trackCount?: number;
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

export interface YouTubeVideoData {
  videoId: string;
  title: string;
  views: number;
  likes: number;
  comments: number;
  duration: string;
  subscriberCount: number;
  lastUpdated: string;
}

export interface YouTubeAggregatedData {
  totalVideos: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalDuration: string;
  averageSubscriberCount: number;
  lastUpdated: string;
}

/**
 * Platform API Service
 * Handles real API integrations for content performance tracking
 */
export class PlatformApiService {
  private configs: Map<string, PlatformConfig> = new Map();

  constructor() {
    this.loadConfigs();
  }

  private loadConfigs() {
    // Load API configurations from environment variables
    const youtubeApiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
    console.log('Loading YouTube API key:', youtubeApiKey ? 'Present' : 'Missing');
    
    this.configs.set('youtube', {
      apiKey: youtubeApiKey
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
    
    console.log('Loaded configs:', Array.from(this.configs.keys()));
    console.log('YouTube config:', this.configs.get('youtube'));
  }

  /**
   * Extract platform-specific IDs from URLs
   */
  private extractPlatformId(url: string, platform: string): string | null {
    try {
      const urlObj = new URL(url);
      
      switch (platform.toLowerCase()) {
        case 'youtube':
          // Handle various YouTube URL formats
          console.log('Extracting YouTube ID from URL:', url);
          
          // Try URL parsing first
          if (urlObj.hostname.includes('youtube.com')) {
            const videoId = urlObj.searchParams.get('v');
            if (videoId) {
              console.log('Extracted YouTube ID from search params:', videoId);
              return videoId;
            }
            
            // Handle /shorts/ URLs
            if (urlObj.pathname.includes('/shorts/')) {
              const shortsMatch = urlObj.pathname.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
              if (shortsMatch) {
                console.log('Extracted YouTube ID from shorts path:', shortsMatch[1]);
                return shortsMatch[1];
              }
            }
            
            // Handle /embed/ URLs
            if (urlObj.pathname.includes('/embed/')) {
              const embedMatch = urlObj.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
              if (embedMatch) {
                console.log('Extracted YouTube ID from embed path:', embedMatch[1]);
                return embedMatch[1];
              }
            }
            
            // Handle /v/ URLs
            if (urlObj.pathname.includes('/v/')) {
              const vMatch = urlObj.pathname.match(/\/v\/([a-zA-Z0-9_-]{11})/);
              if (vMatch) {
                console.log('Extracted YouTube ID from v path:', vMatch[1]);
                return vMatch[1];
              }
            }
          } else if (urlObj.hostname.includes('youtu.be')) {
            const videoId = urlObj.pathname.slice(1);
            if (videoId && videoId.length === 11) {
              console.log('Extracted YouTube ID from youtu.be path:', videoId);
              return videoId;
            }
          }
          
          // Fallback to regex patterns for edge cases
          const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
            /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
            /youtu\.be\/([a-zA-Z0-9_-]{11})/,
            /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
            /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
            /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
          ];
          
          for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
              const videoId = match[1];
              console.log('Extracted YouTube ID from regex pattern:', videoId);
              return videoId;
            }
          }
          
          console.log('Failed to extract YouTube ID from URL:', url);
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
   * YouTube Data API v3 - Enhanced to fetch comprehensive video data
   */
  async fetchYouTubeViews(contentItem: ContentItem): Promise<ApiResponse> {
    console.log('fetchYouTubeViews called with content item:', contentItem);
    
    const config = this.configs.get('youtube');
    if (!config?.apiKey) {
      console.error('YouTube API key not configured');
      return {
        success: false,
        error: 'YouTube API key not configured'
      };
    }

    const videoId = this.extractPlatformId(contentItem.originalUrl || '', 'youtube');
    if (!videoId) {
      console.error('Could not extract YouTube video ID from URL:', contentItem.originalUrl);
      return {
        success: false,
        error: 'Could not extract YouTube video ID from URL'
      };
    }

    console.log('Making YouTube API request for video ID:', videoId);
    // Enhanced API call to fetch statistics, contentDetails, and snippet
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails,snippet&id=${videoId}&key=${config.apiKey}`;
    console.log('API URL (key hidden):', apiUrl.replace(config.apiKey, '***API_KEY_HIDDEN***'));

    try {
      const response = await fetch(apiUrl);

      console.log('YouTube API response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('YouTube API error response:', errorText);
        throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('YouTube API response data:', data);
      
      if (!data.items || data.items.length === 0) {
        console.error('No video data returned from YouTube API');
        return {
          success: false,
          error: 'Video not found or not accessible'
        };
      }

      const video = data.items[0];
      const stats = video.statistics;
      const contentDetails = video.contentDetails;
      const snippet = video.snippet;
      
      console.log('YouTube video statistics:', stats);
      console.log('YouTube video content details:', contentDetails);
      console.log('YouTube video snippet:', snippet);
      
      // Fetch channel statistics to get subscriber count
      let subscriberCount = 0;
      if (snippet?.channelId) {
        try {
          const channelApiUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${snippet.channelId}&key=${config.apiKey}`;
          const channelResponse = await fetch(channelApiUrl);
          if (channelResponse.ok) {
            const channelData = await channelResponse.json();
            if (channelData.items && channelData.items.length > 0) {
              subscriberCount = parseInt(channelData.items[0].statistics?.subscriberCount || '0');
            }
          }
        } catch (channelError) {
          console.warn('Could not fetch channel statistics:', channelError);
        }
      }
      
      const result = {
        success: true,
        data: {
          platform: 'youtube',
          views: parseInt(stats.viewCount || '0'),
          likes: parseInt(stats.likeCount || '0'),
          comments: parseInt(stats.commentCount || '0'),
          duration: contentDetails?.duration || 'PT0S',
          subscriberCount: subscriberCount,
          lastUpdated: new Date().toISOString()
        },
        rateLimitRemaining: parseInt(response.headers.get('X-RateLimit-Remaining') || '0')
      };
      
      console.log('Returning enhanced YouTube API result:', result);
      return result;
    } catch (error) {
      console.error('Error in fetchYouTubeViews:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Fetch and aggregate YouTube data for multiple videos
   */
  async fetchYouTubeAggregatedData(contentItems: ContentItem[]): Promise<YouTubeAggregatedData> {
    console.log('Fetching aggregated YouTube data for', contentItems.length, 'videos');
    
    const youtubeVideos = contentItems.filter(item => 
      item.platforms?.some(p => p.toLowerCase() === 'youtube') &&
      item.originalUrl
    );

    if (youtubeVideos.length === 0) {
      return {
        totalVideos: 0,
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        totalDuration: 'PT0S',
        averageSubscriberCount: 0,
        lastUpdated: new Date().toISOString()
      };
    }

    const videoData: YouTubeVideoData[] = [];
    let totalViews = 0;
    let totalLikes = 0;
    let totalComments = 0;
    let totalDurationSeconds = 0;
    let totalSubscriberCount = 0;
    let validVideos = 0;

    for (const video of youtubeVideos) {
      try {
        const result = await this.fetchYouTubeViews(video);
        if (result.success && result.data) {
          const data = result.data;
          videoData.push({
            videoId: this.extractPlatformId(video.originalUrl || '', 'youtube') || '',
            title: video.title || 'Unknown Title',
            views: data.views || 0,
            likes: data.likes || 0,
            comments: data.comments || 0,
            duration: data.duration || 'PT0S',
            subscriberCount: data.subscriberCount || 0,
            lastUpdated: data.lastUpdated
          });

          totalViews += data.views || 0;
          totalLikes += data.likes || 0;
          totalComments += data.comments || 0;
          
          // Convert ISO 8601 duration to seconds for aggregation
          const durationSeconds = this.parseDurationToSeconds(data.duration || 'PT0S');
          totalDurationSeconds += durationSeconds;
          
          if (data.subscriberCount && data.subscriberCount > 0) {
            totalSubscriberCount += data.subscriberCount;
            validVideos++;
          }
        }
      } catch (error) {
        console.error('Error fetching data for video:', video.originalUrl, error);
      }
    }

    const averageSubscriberCount = validVideos > 0 ? Math.round(totalSubscriberCount / validVideos) : 0;
    const totalDuration = this.formatSecondsToDuration(totalDurationSeconds);

    const aggregatedData: YouTubeAggregatedData = {
      totalVideos: youtubeVideos.length,
      totalViews,
      totalLikes,
      totalComments,
      totalDuration,
      averageSubscriberCount,
      lastUpdated: new Date().toISOString()
    };

    console.log('YouTube aggregated data:', aggregatedData);
    return aggregatedData;
  }

  /**
   * Parse ISO 8601 duration to seconds
   */
  private parseDurationToSeconds(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    
    return hours * 3600 + minutes * 60 + seconds;
  }

  /**
   * Format seconds to ISO 8601 duration
   */
  private formatSecondsToDuration(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    let duration = 'PT';
    if (hours > 0) duration += `${hours}H`;
    if (minutes > 0) duration += `${minutes}M`;
    if (seconds > 0) duration += `${seconds}S`;
    
    return duration;
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
   * Fetch Spotify playlist data including followers and track count
   */
  async fetchSpotifyPlaylistData(contentItem: ContentItem): Promise<ApiResponse> {
    const config = this.configs.get('spotify');
    if (!config?.accessToken) {
      return {
        success: false,
        error: 'Spotify access token not configured'
      };
    }

    const url = contentItem.originalUrl || '';
    const playlistMatch = url.match(/spotify\.com\/playlist\/([a-zA-Z0-9]+)/);
    
    if (!playlistMatch) {
      return {
        success: false,
        error: 'Could not extract Spotify playlist ID from URL'
      };
    }

    const playlistId = playlistMatch[1];

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}`,
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
          views: 0, // Playlist views are not directly available via the public API
          likes: 0, // Playlist likes are not directly available via the public API
          comments: 0, // Playlist comments are not directly available via the public API
          followers: data.followers?.total || 0,
          trackCount: data.tracks?.total || 0,
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