import React, { useState } from 'react';
import { spotifyService } from '../api/services/spotify.service';

const SpotifyDebugTest: React.FC = () => {
  const [playlistUrl, setPlaylistUrl] = useState('https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=JUufMRFkSYW_Jie-215ixA');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testSpotifyAPI = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🧪 Starting Spotify API test...');
      
      // Test 1: Check if service is initialized
      console.log('🔧 Service initialization check...');
      
      // Test 2: Try to extract playlist ID
      const playlistId = (spotifyService as any).extractPlaylistId?.(playlistUrl);
      console.log('🎯 Extracted playlist ID:', playlistId);
      
      if (!playlistId) {
        throw new Error('Failed to extract playlist ID from URL');
      }
      
      // Test 3: Try to get real-time metrics
      console.log('📊 Fetching real-time metrics...');
      const metrics = await spotifyService.getRealTimeMetrics(playlistId);
      
      setResult({
        playlistId,
        metrics,
        timestamp: new Date().toISOString()
      });
      
      console.log('✅ Test completed successfully:', metrics);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('❌ Test failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Spotify API Debug Test</h2>
      
      <div className="space-y-6">
        {/* Test Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Spotify Playlist URL
          </label>
          <input
            type="url"
            value={playlistUrl}
            onChange={(e) => setPlaylistUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="https://open.spotify.com/playlist/..."
          />
        </div>

        {/* Test Button */}
        <button
          onClick={testSpotifyAPI}
          disabled={isLoading}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Testing...' : 'Test Spotify API'}
        </button>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Results Display */}
        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-green-800 mb-2">Test Results</h3>
            <div className="space-y-2 text-sm">
              <div><strong>Playlist ID:</strong> {result.playlistId}</div>
              <div><strong>Success:</strong> {result.metrics.success ? '✅ Yes' : '❌ No'}</div>
              {result.metrics.success ? (
                <>
                  <div><strong>Playlist Name:</strong> {result.metrics.playlistName}</div>
                  <div><strong>Followers:</strong> {result.metrics.followers.toLocaleString()}</div>
                  <div><strong>Track Count:</strong> {result.metrics.trackCount}</div>
                </>
              ) : (
                <div><strong>Error:</strong> {result.metrics.error}</div>
              )}
              <div><strong>Timestamp:</strong> {result.timestamp}</div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-blue-800 mb-2">Setup Instructions</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
            <li>Create a Spotify app at <a href="https://developer.spotify.com/dashboard/" target="_blank" rel="noopener noreferrer" className="underline">Spotify Developer Dashboard</a></li>
            <li>Get your Client ID and Client Secret</li>
            <li>Create a <code className="bg-blue-100 px-1 rounded">.env</code> file in your project root</li>
            <li>Add these environment variables:</li>
          </ol>
          <div className="mt-3 p-3 bg-blue-100 rounded text-sm font-mono">
            VITE_SPOTIFY_CLIENT_ID=your_client_id_here<br/>
            VITE_SPOTIFY_CLIENT_SECRET=your_client_secret_here
          </div>
          <p className="mt-3 text-sm text-blue-700">
            <strong>Note:</strong> After adding the .env file, restart your development server.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SpotifyDebugTest;

