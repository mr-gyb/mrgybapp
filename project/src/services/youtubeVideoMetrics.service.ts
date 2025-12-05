/**
 * YouTube Video Metrics Service
 * Fetches video-specific analytics from backend
 */

interface YouTubeVideoMetrics {
  videoId: string;
  title: string;
  views: number;
  likes: number;
  comments: number;
  duration: number;
  watchTime: number; // minutes
  averageViewDuration: number; // seconds
  demographics: {
    genders: Array<{ gender: string; percentage: number }>;
    ageGroups: Array<{ ageGroup: string; percentage: number }>;
    topCountries: Array<{ country: string; percentage: number }>;
    trafficSource: Array<{ source: string; views: number }>;
  };
}

class YouTubeVideoMetricsService {
  private backendUrl: string;

  constructor() {
    this.backendUrl = import.meta.env.VITE_CHAT_API_BASE?.replace('/api', '') || 'http://localhost:8080';
  }

  /**
   * Get access token from OAuth service
   */
  private async getAccessToken(): Promise<string | null> {
    const { default: youtubeOAuthService } = await import('./youtubeOAuth.service');
    return await youtubeOAuthService.getAccessToken();
  }

  /**
   * Extract video ID from YouTube URL
   */
  extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
      /youtu\.be\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Fetch video-specific metrics
   */
  async getVideoMetrics(videoId: string): Promise<YouTubeVideoMetrics> {
    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      throw new Error('YouTube authentication required. Please authenticate first.');
    }

    const response = await fetch(`${this.backendUrl}/api/youtube/metrics/${videoId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      
      // Handle token expiration
      if (response.status === 401 || errorData.error?.includes('token') || errorData.error?.includes('unauthorized')) {
        // Try to refresh token
        const { default: youtubeOAuthService } = await import('./youtubeOAuth.service');
        const refreshed = await youtubeOAuthService.refreshToken();
        if (refreshed) {
          // Retry with new token
          return this.getVideoMetrics(videoId);
        }
        throw new Error('Authentication expired. Please re-authenticate.');
      }
      
      // Handle quota exceeded
      if (response.status === 429 || errorData.error?.includes('quota')) {
        throw new Error('YouTube Analytics API quota exceeded. Please try again later.');
      }
      
      // Handle video not found
      if (response.status === 404) {
        throw new Error('Video not found. Please check the video ID.');
      }
      
      throw new Error(errorData.error || 'Failed to fetch video metrics');
    }

    const data = await response.json();
    
    if (!data.success || !data.data) {
      throw new Error(data.error || 'Invalid response from backend');
    }

    // Ensure demographics structure is correct
    const metrics = data.data;
    if (!metrics.demographics) {
      console.warn('Backend response missing demographics, using empty structure');
      metrics.demographics = {
        genders: [],
        ageGroups: [],
        topCountries: [],
        trafficSource: []
      };
    }

    // Log what we received for debugging
    console.log('📊 YouTube Metrics received:', {
      videoId: metrics.videoId,
      title: metrics.title,
      views: metrics.views,
      demographics: {
        genders: metrics.demographics?.genders?.length || 0,
        ageGroups: metrics.demographics?.ageGroups?.length || 0,
        countries: metrics.demographics?.topCountries?.length || 0,
        trafficSources: metrics.demographics?.trafficSource?.length || 0
      }
    });

    return metrics;
  }

  /**
   * Fetch video metrics from URL
   */
  async getVideoMetricsFromUrl(url: string): Promise<YouTubeVideoMetrics> {
    const videoId = this.extractVideoId(url);
    if (!videoId) {
      throw new Error('Invalid YouTube URL. Could not extract video ID.');
    }
    return this.getVideoMetrics(videoId);
  }
}

export const youtubeVideoMetricsService = new YouTubeVideoMetricsService();
export default youtubeVideoMetricsService;

export type { YouTubeVideoMetrics };

