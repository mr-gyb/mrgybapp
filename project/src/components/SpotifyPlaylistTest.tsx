import React, { useState } from 'react';
import spotifyService from '../api/services/spotify.service';

const SpotifyPlaylistTest: React.FC = () => {
  const [playlistData, setPlaylistData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testPlaylistUrl = 'https://open.spotify.com/playlist/0xBR12jNDKZUOxYnH5ejnS?si=9ZZOJZoiSByJq3pm371-mg';

  const fetchPlaylistData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🎵 Fetching playlist data for:', testPlaylistUrl);
      
      // Check if we have valid tokens
      if (!spotifyService.isAuthenticated()) {
        throw new Error('Not authenticated with Spotify. Please connect your account first.');
      }
      
      // Use the enhanced service method to fetch playlist data
      const result = await spotifyService.testSpecificPlaylist(testPlaylistUrl);
      
      if (result.success && result.data) {
        console.log('✅ Playlist data retrieved successfully:', result.data);
        
        setPlaylistData({
          id: result.data.id,
          name: result.data.name,
          description: result.data.description || '',
          followers: result.data.followers || 0,
          trackCount: result.data.tracks || 0,
          images: result.data.images || [],
          externalUrl: result.data.externalUrl,
          public: true, // Default values since we're not fetching these
          collaborative: false,
          owner: 'Unknown'
        });
      } else {
        throw new Error(result.error || 'Failed to fetch playlist data');
      }
      
    } catch (err) {
      console.error('❌ Error fetching playlist data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const connectSpotify = () => {
    try {
      spotifyService.initializeAuth();
    } catch (err) {
      setError('Failed to initialize Spotify authentication');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">🎵 Spotify Playlist Test</h1>
      
      {/* Connection Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Connection Status</h2>
        {spotifyService.isAuthenticated() ? (
          <div className="flex items-center space-x-2">
            <span className="text-green-600">✅ Connected to Spotify</span>
            <button
              onClick={() => spotifyService.logout()}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <span className="text-red-600">❌ Not connected to Spotify</span>
            <button
              onClick={connectSpotify}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              🎵 Connect Spotify
            </button>
          </div>
        )}
      </div>

      {/* Test Playlist */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Test Playlist</h2>
        <p className="text-gray-600 mb-2">
          <strong>URL:</strong> {testPlaylistUrl}
        </p>
        <p className="text-gray-600 mb-4">
          <strong>Name:</strong> playlist for girls🎧🌷
        </p>
        
        <button
          onClick={fetchPlaylistData}
          disabled={isLoading || !spotifyService.isAuthenticated()}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? '🔄 Fetching...' : '📊 Fetch Playlist Data'}
        </button>
      </div>

      {/* Results */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-lg font-semibold text-red-800 mb-2">❌ Error</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {playlistData && (
        <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-2xl font-bold text-green-800 mb-4">✅ Playlist Data Retrieved</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div>
              <h4 className="text-lg font-semibold mb-3">📋 Basic Information</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Name:</span>
                  <span>{playlistData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Owner:</span>
                  <span>{playlistData.owner}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Public:</span>
                  <span>{playlistData.public ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Collaborative:</span>
                  <span>{playlistData.collaborative ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div>
              <h4 className="text-lg font-semibold mb-3">📊 Key Metrics</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">👥 Followers:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {playlistData.followers.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">🎵 Track Count:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {playlistData.trackCount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Playlist Image */}
          {playlistData.images && playlistData.images.length > 0 && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-3">🖼️ Playlist Cover</h4>
              <img 
                src={playlistData.images[0].url} 
                alt={playlistData.name}
                className="w-32 h-32 rounded-lg shadow-md"
              />
            </div>
          )}

          {/* External Link */}
          <div className="mt-6">
            <a
              href={playlistData.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              🎵 Open in Spotify
            </a>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">📖 How to Use</h3>
        <ol className="list-decimal list-inside space-y-1 text-yellow-700">
          <li>Connect your Spotify account using the button above</li>
          <li>Authorize the app in the Spotify popup</li>
          <li>Click "Fetch Playlist Data" to get real-time information</li>
          <li>View the follower count and track count from Spotify API</li>
        </ol>
      </div>
    </div>
  );
};

export default SpotifyPlaylistTest;
