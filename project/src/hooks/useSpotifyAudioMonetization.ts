import { useState, useEffect, useCallback } from 'react';
import { ContentItem } from '../types/content';
import { PlatformApiService } from '../api/services/platform-apis.service';

export interface SpotifyAudioData {
  playlistId: string;
  playlistName: string;
  followers: number;
  trackCount: number;
  lastUpdated: string;
}

export interface SpotifyAudioAggregatedData {
  totalPlaylists: number;
  totalFollowers: number;
  totalTracks: number;
  averageFollowers: number;
  averageTracks: number;
  lastUpdated: string;
}

export const useSpotifyAudioMonetization = (userContent: ContentItem[]) => {
  const [spotifyAudioData, setSpotifyAudioData] = useState<SpotifyAudioAggregatedData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const platformApiService = new PlatformApiService();

  const fetchSpotifyAudioData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching Spotify audio data for', userContent.length, 'content items');
      
      // Filter content items that are audio type and have Spotify platform
      const spotifyAudioItems = userContent.filter(item => 
        item.type === 'audio' && 
        item.platforms?.some(p => p.toLowerCase() === 'spotify') &&
        item.originalUrl
      );

      if (spotifyAudioItems.length === 0) {
        setSpotifyAudioData({
          totalPlaylists: 0,
          totalFollowers: 0,
          totalTracks: 0,
          averageFollowers: 0,
          averageTracks: 0,
          lastUpdated: new Date().toISOString()
        });
        setIsLoading(false);
        return;
      }

      const audioData: SpotifyAudioData[] = [];
      let totalFollowers = 0;
      let totalTracks = 0;

      for (const item of spotifyAudioItems) {
        try {
          const result = await platformApiService.fetchSpotifyPlaylistData(item);
          if (result.success && result.data) {
            const data = result.data;
            audioData.push({
              playlistId: item.id,
              playlistName: item.title || 'Unknown Playlist',
              followers: data.followers || 0,
              trackCount: data.trackCount || 0,
              lastUpdated: data.lastUpdated
            });

            totalFollowers += data.followers || 0;
            totalTracks += data.trackCount || 0;
          }
        } catch (error) {
          console.error('Error fetching Spotify audio data for item:', item.originalUrl, error);
        }
      }

      const averageFollowers = spotifyAudioItems.length > 0 ? Math.round(totalFollowers / spotifyAudioItems.length) : 0;
      const averageTracks = spotifyAudioItems.length > 0 ? Math.round(totalTracks / spotifyAudioItems.length) : 0;

      const aggregatedData: SpotifyAudioAggregatedData = {
        totalPlaylists: spotifyAudioItems.length,
        totalFollowers,
        totalTracks,
        averageFollowers,
        averageTracks,
        lastUpdated: new Date().toISOString()
      };

      setSpotifyAudioData(aggregatedData);
      setLastUpdated(new Date());
      console.log('Spotify audio data fetched successfully:', aggregatedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch Spotify audio data';
      setError(errorMessage);
      console.error('Error fetching Spotify audio data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userContent]);

  // Fetch data when userContent changes
  useEffect(() => {
    if (userContent.length > 0) {
      fetchSpotifyAudioData();
    }
  }, [fetchSpotifyAudioData]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (userContent.length > 0) {
        fetchSpotifyAudioData();
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [fetchSpotifyAudioData, userContent.length]);

  const refreshData = useCallback(() => {
    fetchSpotifyAudioData();
  }, [fetchSpotifyAudioData]);

  return {
    spotifyAudioData,
    isLoading,
    error,
    lastUpdated,
    refreshData
  };
};
