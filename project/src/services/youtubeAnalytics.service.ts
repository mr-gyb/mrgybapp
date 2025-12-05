/**
 * YouTube Analytics Service
 * Fetches analytics data from backend YouTube Analytics API endpoints
 */

interface YouTubeOverview {
  views: number;
  likes: number;
  comments: number;
  estimatedMinutesWatched: number;
  subscribersGained: number;
}

interface YouTubeDemographic {
  gender: string;
  percentage: number;
}

interface YouTubeGeography {
  country: string;
  percentage: number;
}

interface YouTubeTrafficSource {
  source: string;
  views: number;
}

interface YouTubeAgeGroup {
  ageGroup: string;
  percentage: number;
}

class YouTubeAnalyticsService {
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
   * Fetch YouTube overview metrics
   */
  async getOverview(): Promise<YouTubeOverview> {
    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      throw new Error('YouTube authentication required. Please authenticate first.');
    }

    const response = await fetch(`${this.backendUrl}/api/youtube/overview?accessToken=${encodeURIComponent(accessToken)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
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
          return this.getOverview();
        }
        throw new Error('Authentication expired. Please re-authenticate.');
      }
      
      throw new Error(errorData.error || 'Failed to fetch overview');
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Fetch gender demographics
   */
  async getDemographics(): Promise<YouTubeDemographic[]> {
    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      throw new Error('YouTube authentication required. Please authenticate first.');
    }

    const response = await fetch(`${this.backendUrl}/api/youtube/demographics?accessToken=${encodeURIComponent(accessToken)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      
      if (response.status === 401) {
        const { default: youtubeOAuthService } = await import('./youtubeOAuth.service');
        const refreshed = await youtubeOAuthService.refreshToken();
        if (refreshed) {
          return this.getDemographics();
        }
        throw new Error('Authentication expired. Please re-authenticate.');
      }
      
      throw new Error(errorData.error || 'Failed to fetch demographics');
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Fetch geography breakdown
   */
  async getGeography(): Promise<YouTubeGeography[]> {
    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      throw new Error('YouTube authentication required. Please authenticate first.');
    }

    const response = await fetch(`${this.backendUrl}/api/youtube/geography?accessToken=${encodeURIComponent(accessToken)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      
      if (response.status === 401) {
        const { default: youtubeOAuthService } = await import('./youtubeOAuth.service');
        const refreshed = await youtubeOAuthService.refreshToken();
        if (refreshed) {
          return this.getGeography();
        }
        throw new Error('Authentication expired. Please re-authenticate.');
      }
      
      throw new Error(errorData.error || 'Failed to fetch geography');
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Fetch traffic source data
   */
  async getTrafficSource(): Promise<YouTubeTrafficSource[]> {
    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      throw new Error('YouTube authentication required. Please authenticate first.');
    }

    const response = await fetch(`${this.backendUrl}/api/youtube/traffic-source?accessToken=${encodeURIComponent(accessToken)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      
      if (response.status === 401) {
        const { default: youtubeOAuthService } = await import('./youtubeOAuth.service');
        const refreshed = await youtubeOAuthService.refreshToken();
        if (refreshed) {
          return this.getTrafficSource();
        }
        throw new Error('Authentication expired. Please re-authenticate.');
      }
      
      throw new Error(errorData.error || 'Failed to fetch traffic source');
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Fetch age groups data
   */
  async getAgeGroups(): Promise<YouTubeAgeGroup[]> {
    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      throw new Error('YouTube authentication required. Please authenticate first.');
    }

    const response = await fetch(`${this.backendUrl}/api/youtube/age-groups?accessToken=${encodeURIComponent(accessToken)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      
      if (response.status === 401) {
        const { default: youtubeOAuthService } = await import('./youtubeOAuth.service');
        const refreshed = await youtubeOAuthService.refreshToken();
        if (refreshed) {
          return this.getAgeGroups();
        }
        throw new Error('Authentication expired. Please re-authenticate.');
      }
      
      throw new Error(errorData.error || 'Failed to fetch age groups');
    }

    const data = await response.json();
    return data.data;
  }
}

export const youtubeAnalyticsService = new YouTubeAnalyticsService();
export default youtubeAnalyticsService;

export type {
  YouTubeOverview,
  YouTubeDemographic,
  YouTubeGeography,
  YouTubeTrafficSource,
  YouTubeAgeGroup
};

