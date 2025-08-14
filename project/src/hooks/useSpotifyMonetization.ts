import { useState, useEffect, useCallback } from 'react';
import { spotifyService, SpotifyFollowerGrowth, SpotifyPlaylistData } from '../api/services/spotify.service';

export interface SpotifyMonetizationMetrics {
  currentFollowers: number;
  followerGrowth: number;
  growthPercentage: number;
  estimatedMonthlyRevenue: number;
  estimatedGrowthRevenue: number;
  monetizationScore: number;
}

export interface SpotifyPlaylistInfo {
  id: string;
  name: string;
  description: string;
  followers: number;
  tracks: number;
  imageUrl?: string;
  externalUrl: string;
  lastUpdated: string;
  realTimeData?: {
    followers: number;
    trackCount: number;
    playlistName: string;
    lastFetched: string;
  };
}

export const useSpotifyMonetization = () => {
  const [playlists, setPlaylists] = useState<SpotifyPlaylistInfo[]>([]);
  const [monetizationMetrics, setMonetizationMetrics] = useState<SpotifyMonetizationMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all tracked Spotify playlists from localStorage
  const loadTrackedPlaylists = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get all localStorage keys that start with 'spotify_followers_'
      const keys = Object.keys(localStorage).filter(key => key.startsWith('spotify_followers_'));
      const playlistData: SpotifyPlaylistInfo[] = [];
      const metricsData: SpotifyMonetizationMetrics[] = [];

      for (const key of keys) {
        try {
          const playlistId = key.replace('spotify_followers_', '');
          const followerData = await spotifyService.getFollowerGrowth(playlistId);
          
          if (followerData) {
            // Create playlist info
            const playlistInfo: SpotifyPlaylistInfo = {
              id: followerData.playlistId,
              name: followerData.playlistName,
              description: '',
              followers: followerData.currentFollowers,
              tracks: 0,
              lastUpdated: followerData.lastUpdated,
              externalUrl: `https://open.spotify.com/playlist/${followerData.playlistId}`
            };

            playlistData.push(playlistInfo);

            // Calculate monetization metrics
            const metrics = spotifyService.calculateMonetizationMetrics(followerData);
            metricsData.push(metrics);
          }
        } catch (err) {
          console.warn(`Failed to load playlist data for key ${key}:`, err);
        }
      }

      setPlaylists(playlistData);
      setMonetizationMetrics(metricsData);
    } catch (err) {
      console.error('Error loading tracked playlists:', err);
      setError('Failed to load Spotify playlist data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add a new playlist for tracking
  const addPlaylist = useCallback(async (playlistUrl: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await spotifyService.fetchPlaylistData(playlistUrl);
      
      if (response.success && response.data) {
        const playlist = response.data as SpotifyPlaylistData;
        
        // Track follower growth
        if (playlist.followers?.total) {
          await spotifyService.trackFollowerGrowth(playlist.id, playlist.followers.total);
          
          // Reload playlists to include the new one
          await loadTrackedPlaylists();
          
          return {
            success: true,
            playlist
          };
        }
      } else {
        throw new Error(response.error || 'Failed to fetch playlist data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add playlist';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, [loadTrackedPlaylists]);

  // Refresh follower data for all playlists
  const refreshFollowerData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const updatedPlaylists = [...playlists];
      const updatedMetrics = [...monetizationMetrics];

      for (let i = 0; i < updatedPlaylists.length; i++) {
        const playlist = updatedPlaylists[i];
        try {
          // Fetch real-time data from Spotify API
          const realTimeData = await spotifyService.getRealTimeMetrics(playlist.id);
          
          if (realTimeData.success) {
            // Update playlist info with real-time data
            updatedPlaylists[i] = {
              ...playlist,
              followers: realTimeData.followers,
              tracks: realTimeData.trackCount,
              name: realTimeData.playlistName,
              lastUpdated: new Date().toISOString(),
              realTimeData: {
                followers: realTimeData.followers,
                trackCount: realTimeData.trackCount,
                playlistName: realTimeData.playlistName,
                lastFetched: new Date().toISOString()
              }
            };

            // Track follower growth for metrics
            if (realTimeData.followers > 0) {
              const followerData = await spotifyService.trackFollowerGrowth(
                playlist.id, 
                realTimeData.followers
              );
              
              // Update metrics
              const metrics = spotifyService.calculateMonetizationMetrics(followerData);
              updatedMetrics[i] = metrics;
            }
          }
        } catch (err) {
          console.warn(`Failed to refresh data for playlist ${playlist.id}:`, err);
        }
      }

      setPlaylists(updatedPlaylists);
      setMonetizationMetrics(updatedMetrics);
    } catch (err) {
      console.error('Error refreshing follower data:', err);
      setError('Failed to refresh follower data');
    } finally {
      setIsLoading(false);
    }
  }, [playlists, monetizationMetrics]);

  // Get aggregated monetization metrics
  const getAggregatedMetrics = useCallback(() => {
    if (monetizationMetrics.length === 0) {
      return {
        totalFollowers: 0,
        totalGrowth: 0,
        averageGrowthPercentage: 0,
        totalEstimatedMonthlyRevenue: 0,
        totalEstimatedGrowthRevenue: 0,
        averageMonetizationScore: 0
      };
    }

    const totalFollowers = monetizationMetrics.reduce((sum, m) => sum + m.currentFollowers, 0);
    const totalGrowth = monetizationMetrics.reduce((sum, m) => sum + m.followerGrowth, 0);
    const totalEstimatedMonthlyRevenue = monetizationMetrics.reduce((sum, m) => sum + m.estimatedMonthlyRevenue, 0);
    const totalEstimatedGrowthRevenue = monetizationMetrics.reduce((sum, m) => sum + m.estimatedGrowthRevenue, 0);
    
    const averageGrowthPercentage = monetizationMetrics.reduce((sum, m) => sum + m.growthPercentage, 0) / monetizationMetrics.length;
    const averageMonetizationScore = monetizationMetrics.reduce((sum, m) => sum + m.monetizationScore, 0) / monetizationMetrics.length;

    return {
      totalFollowers,
      totalGrowth,
      averageGrowthPercentage: Math.round(averageGrowthPercentage * 100) / 100,
      totalEstimatedMonthlyRevenue: Math.round(totalEstimatedMonthlyRevenue * 100) / 100,
      totalEstimatedGrowthRevenue: Math.round(totalEstimatedGrowthRevenue * 100) / 100,
      averageMonetizationScore: Math.round(averageMonetizationScore * 10) / 10
    };
  }, [monetizationMetrics]);

  // Load playlists on mount
  useEffect(() => {
    loadTrackedPlaylists();
  }, [loadTrackedPlaylists]);

  return {
    playlists,
    monetizationMetrics,
    aggregatedMetrics: getAggregatedMetrics(),
    isLoading,
    error,
    addPlaylist,
    refreshFollowerData,
    loadTrackedPlaylists
  };
};
