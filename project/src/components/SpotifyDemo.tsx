import React, { useState } from 'react';
import SpotifyIntegration from './SpotifyIntegration';

const SpotifyDemo: React.FC = () => {
  const [showIntegration, setShowIntegration] = useState(false);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center mb-8">
        <div className="text-green-500 text-6xl mb-4">🎵</div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Spotify API Integration Demo</h1>
        <p className="text-gray-600 mb-8 text-lg max-w-2xl mx-auto">
          This demo shows how to integrate Spotify API to fetch user data, playlists, 
          top tracks, and more. Click the button below to see the full integration in action.
        </p>
        
        <div className="space-y-4">
          <button
            onClick={() => setShowIntegration(!showIntegration)}
            className="bg-green-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-600 transition-colors shadow-lg"
          >
            {showIntegration ? 'Hide Spotify Integration' : 'Show Spotify Integration'}
          </button>
          
          {!showIntegration && (
            <div className="mt-8 text-left bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">What You'll See:</h3>
              <ul className="space-y-2 text-gray-600">
                <li>✅ <strong>Authentication Flow:</strong> Connect your Spotify account securely</li>
                <li>✅ <strong>User Profile:</strong> Display name, email, followers, profile picture</li>
                <li>✅ <strong>Top Tracks:</strong> Your most listened tracks with album art</li>
                <li>✅ <strong>Top Artists:</strong> Your favorite artists with genres</li>
                <li>✅ <strong>Playlists:</strong> All your public and private playlists</li>
                <li>✅ <strong>Recently Played:</strong> Your recent listening history</li>
                <li>✅ <strong>Search & Discovery:</strong> Find new music and get recommendations</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {showIntegration && (
        <div className="mb-8">
          <SpotifyIntegration />
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">🔐 Authentication</h3>
            <p className="text-gray-600 text-sm">
              Uses OAuth 2.0 to securely connect to your Spotify account. 
              No passwords are stored - only secure tokens.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">📊 Data Fetching</h3>
            <p className="text-gray-600 text-sm">
              Fetches real-time data from Spotify API including your profile, 
              playlists, listening history, and top content.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">🎨 Beautiful UI</h3>
            <p className="text-gray-600 text-sm">
              Responsive design with tabs, loading states, and direct links 
              to Spotify for each track, artist, and playlist.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">⚡ Performance</h3>
            <p className="text-gray-600 text-sm">
              Efficient API calls with proper error handling, token refresh, 
              and loading states for optimal user experience.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">API Features Used</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2">User Data</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Profile information</li>
              <li>• Top tracks & artists</li>
              <li>• Recently played</li>
              <li>• User playlists</li>
            </ul>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Search & Discovery</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Track search</li>
              <li>• Artist search</li>
              <li>• Album search</li>
              <li>• Recommendations</li>
            </ul>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-800 mb-2">Content Details</h4>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Audio features</li>
              <li>• Album tracks</li>
              <li>• Artist albums</li>
              <li>• Playlist metadata</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpotifyDemo;
