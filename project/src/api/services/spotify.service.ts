import axios from 'axios';

export interface SpotifyPlaylistData {
  id: string;
  name: string;
  description: string;
  followers: {
    total: number;
    growth: number;
    growthPercentage: number;
  };
  tracks: {
    total: number;
    added: number;
  };
  owner: {
    id: string;
    display_name: string;
  };
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  public: boolean;
  collaborative: boolean;
  external_urls: {
    spotify: string;
  };
  snapshot_id: string;
  created_at: string;
  updated_at: string;
}

export interface SpotifyFollowerGrowth {
  playlistId: string;
  playlistName: string;
  currentFollowers: number;
  previousFollowers: number;
  growth: number;
  growthPercentage: number;
  lastUpdated: string;
  history: Array<{
    date: string;
    followers: number;
    growth: number;
  }>;
}

export interface SpotifyApiResponse {
  success: boolean;
  data?: SpotifyPlaylistData | SpotifyFollowerGrowth;
  error?: string;
}

class SpotifyService {
  private accessToken: string | null = null;
  private clientId: string | null = null;
  private clientSecret: string | null = null;
  private baseUrl = 'https://api.spotify.com/v1';

  constructor() {
    this.clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID || null;
    this.clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET || null;
    
    // Debug logging
    console.log('🔧 Spotify Service Initialized:', {
      hasClientId: !!this.clientId,
      hasClientSecret: !!this.clientSecret,
      envVars: {
        VITE_SPOTIFY_CLIENT_ID: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
        VITE_SPOTIFY_CLIENT_SECRET: import.meta.env.VITE_SPOTIFY_CLIENT_SECRET
      }
    });
  }

  /**
   * Authenticate with Spotify API
   */
  private async authenticate(): Promise<void> {
    if (this.accessToken) return;

    console.log('🔐 Attempting Spotify authentication...', {
      hasClientId: !!this.clientId,
      hasClientSecret: !!this.clientSecret
    });

    if (!this.clientId || !this.clientSecret) {
      const error = 'Spotify credentials not configured. Please set VITE_SPOTIFY_CLIENT_ID and VITE_SPOTIFY_CLIENT_SECRET in your .env file.';
      console.error('❌ Spotify Auth Error:', error);
      throw new Error(error);
    }

    try {
      console.log('📡 Making authentication request to Spotify...');
      
      const response = await axios.post('https://accounts.spotify.com/api/token', 
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`
          }
        }
      );

      this.accessToken = response.data.access_token;
      console.log('✅ Spotify authentication successful!');
    } catch (error) {
      console.error('❌ Spotify authentication failed:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Invalid Spotify credentials. Please check your Client ID and Client Secret.');
        } else if (error.response?.status === 429) {
          throw new Error('Spotify API rate limit exceeded. Please try again later.');
        } else {
          throw new Error(`Spotify API error: ${error.response?.status} - ${error.response?.statusText}`);
        }
      } else {
        throw new Error('Failed to authenticate with Spotify. Please check your internet connection.');
      }
    }
  }

  /**
   * Extract playlist ID from Spotify URL
   */
  public extractPlaylistId(url: string): string | null {
    const patterns = [
      /spotify\.com\/playlist\/([a-zA-Z0-9]+)/,
      /open\.spotify\.com\/playlist\/([a-zA-Z0-9]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    return null;
  }

  /**
   * Check if URL is a Spotify playlist
   */
  public isSpotifyPlaylist(url: string): boolean {
    return this.extractPlaylistId(url) !== null;
  }

  /**
   * Fetch playlist data from Spotify
   */
  public async fetchPlaylistData(url: string): Promise<SpotifyApiResponse> {
    try {
      await this.authenticate();

      const playlistId = this.extractPlaylistId(url);
      if (!playlistId) {
        throw new Error('Invalid Spotify playlist URL');
      }

      const response = await axios.get(`${this.baseUrl}/playlists/${playlistId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      const playlistData: SpotifyPlaylistData = {
        id: response.data.id,
        name: response.data.name,
        description: response.data.description || '',
        followers: {
          total: response.data.followers?.total || 0,
          growth: 0, // Will be calculated when tracking over time
          growthPercentage: 0
        },
        tracks: {
          total: response.data.tracks?.total || 0,
          added: 0
        },
        owner: {
          id: response.data.owner?.id || '',
          display_name: response.data.owner?.display_name || ''
        },
        images: response.data.images || [],
        public: response.data.public || false,
        collaborative: response.data.collaborative || false,
        external_urls: response.data.external_urls || { spotify: '' },
        snapshot_id: response.data.snapshot_id || '',
        created_at: response.data.created_at || new Date().toISOString(),
        updated_at: response.data.updated_at || new Date().toISOString()
      };

      return {
        success: true,
        data: playlistData
      };
    } catch (error) {
      console.error('Error fetching Spotify playlist data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch playlist data'
      };
    }
  }

  /**
   * Track follower growth for a playlist
   */
  public async trackFollowerGrowth(
    playlistId: string, 
    currentFollowers: number
  ): Promise<SpotifyFollowerGrowth> {
    // In a real implementation, this would store data in a database
    // For now, we'll simulate tracking with localStorage
    
    const storageKey = `spotify_followers_${playlistId}`;
    const existing = localStorage.getItem(storageKey);
    
    let followerData: SpotifyFollowerGrowth;
    
    if (existing) {
      const parsed = JSON.parse(existing);
      const previousFollowers = parsed.currentFollowers;
      const growth = currentFollowers - previousFollowers;
      const growthPercentage = previousFollowers > 0 ? (growth / previousFollowers) * 100 : 0;
      
      followerData = {
        ...parsed,
        previousFollowers,
        currentFollowers,
        growth,
        growthPercentage,
        lastUpdated: new Date().toISOString(),
        history: [
          ...parsed.history,
          {
            date: new Date().toISOString(),
            followers: currentFollowers,
            growth
          }
        ]
      };
    } else {
      followerData = {
        playlistId,
        playlistName: 'Unknown Playlist',
        currentFollowers,
        previousFollowers: currentFollowers,
        growth: 0,
        growthPercentage: 0,
        lastUpdated: new Date().toISOString(),
        history: [{
          date: new Date().toISOString(),
          followers: currentFollowers,
          growth: 0
        }]
      };
    }

    // Store updated data
    localStorage.setItem(storageKey, JSON.stringify(followerData));
    
    return followerData;
  }

  /**
   * Get follower growth data for a playlist
   */
  public async getFollowerGrowth(playlistId: string): Promise<SpotifyFollowerGrowth | null> {
    try {
      const storageKey = `spotify_followers_${playlistId}`;
      const existing = localStorage.getItem(storageKey);
      
      if (existing) {
        return JSON.parse(existing);
      }
      
      return null;
    } catch (error) {
      console.error('Error getting follower growth data:', error);
      return null;
    }
  }

  /**
   * Calculate monetization metrics from follower growth
   */
  public calculateMonetizationMetrics(followerGrowth: SpotifyFollowerGrowth) {
    const { currentFollowers, growth, growthPercentage } = followerGrowth;
    
    // Estimate potential revenue based on followers
    // These are example calculations - adjust based on real data
    const estimatedMonthlyRevenue = currentFollowers * 0.01; // $0.01 per follower per month
    const estimatedGrowthRevenue = growth * 0.02; // $0.02 per new follower
    
    return {
      currentFollowers,
      followerGrowth: growth,
      growthPercentage,
      estimatedMonthlyRevenue: Math.round(estimatedMonthlyRevenue * 100) / 100,
      estimatedGrowthRevenue: Math.round(estimatedGrowthRevenue * 100) / 100,
      monetizationScore: Math.min(10, Math.max(1, Math.floor(growthPercentage / 10) + 1))
    };
  }

  /**
   * Get real-time Spotify metrics for a playlist
   */
  public async getRealTimeMetrics(playlistId: string): Promise<{
    followers: number;
    trackCount: number;
    playlistName: string;
    success: boolean;
    error?: string;
  }> {
    try {
      console.log('🎵 Fetching real-time metrics for playlist:', playlistId);
      
      await this.authenticate();
      console.log('🔑 Authentication successful, making API request...');
      
      const url = `${this.baseUrl}/playlists/${playlistId}`;
      console.log('📡 Requesting:', url);
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      console.log('✅ Spotify API response received:', {
        status: response.status,
        hasData: !!response.data,
        playlistName: response.data?.name,
        followers: response.data?.followers?.total,
        tracks: response.data?.tracks?.total
      });

      const playlist = response.data;
      
      return {
        followers: playlist.followers?.total || 0,
        trackCount: playlist.tracks?.total || 0,
        playlistName: playlist.name || 'Unknown Playlist',
        success: true
      };
    } catch (error) {
      console.error('❌ Error fetching real-time Spotify metrics:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          return {
            followers: 0,
            trackCount: 0,
            playlistName: 'Playlist Not Found',
            success: false,
            error: 'Playlist not found or not accessible'
          };
        } else if (error.response?.status === 401) {
          return {
            followers: 0,
            trackCount: 0,
            playlistName: 'Authentication Failed',
            success: false,
            error: 'Authentication failed. Please check your Spotify credentials.'
          };
        } else {
          return {
            followers: 0,
            trackCount: 0,
            playlistName: 'API Error',
            success: false,
            error: `Spotify API error: ${error.response?.status} - ${error.response?.statusText}`
          };
        }
      }
      
      return {
        followers: 0,
        trackCount: 0,
        playlistName: 'Error Loading',
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch data'
      };
    }
  }
}

export const spotifyService = new SpotifyService();
