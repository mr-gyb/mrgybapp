import React, { useState } from 'react';
import { Music, TrendingUp, Users, DollarSign, RefreshCw, Plus, ExternalLink, BarChart3 } from 'lucide-react';
import { useSpotifyMonetization } from '../../hooks/useSpotifyMonetization';

const SpotifyMonetization: React.FC = () => {
  const {
    playlists,
    monetizationMetrics,
    aggregatedMetrics,
    isLoading,
    error,
    addPlaylist,
    refreshFollowerData
  } = useSpotifyMonetization();

  const [showAddPlaylist, setShowAddPlaylist] = useState(false);
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [isAddingPlaylist, setIsAddingPlaylist] = useState(false);

  const handleAddPlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistUrl.trim()) return;

    setIsAddingPlaylist(true);
    try {
      const result = await addPlaylist(playlistUrl.trim());
      if (result.success) {
        setPlaylistUrl('');
        setShowAddPlaylist(false);
      }
    } finally {
      setIsAddingPlaylist(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-red-600">
          <Music className="h-5 w-5" />
          <span className="font-medium">Spotify Integration Error</span>
        </div>
        <p className="text-red-600 mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Music className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Spotify Monetization</h3>
            <p className="text-sm text-gray-600">Track playlist follower growth and revenue potential</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAddPlaylist(true)}
            className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Playlist</span>
          </button>
          
          <button
            onClick={refreshFollowerData}
            disabled={isLoading}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Add Playlist Modal */}
      {showAddPlaylist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h4 className="text-lg font-semibold mb-4">Add Spotify Playlist</h4>
            <form onSubmit={handleAddPlaylist} className="space-y-4">
              <div>
                <label htmlFor="playlistUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  Playlist URL
                </label>
                <input
                  type="url"
                  id="playlistUrl"
                  value={playlistUrl}
                  onChange={(e) => setPlaylistUrl(e.target.value)}
                  placeholder="https://open.spotify.com/playlist/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={isAddingPlaylist || !playlistUrl.trim()}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {isAddingPlaylist ? 'Adding...' : 'Add Playlist'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddPlaylist(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Real-Time Spotify Metrics */}
      {playlists.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-600">Total Followers</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {formatNumber(aggregatedMetrics.totalFollowers)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Live from Spotify API</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Music className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-gray-600">Total Tracks</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {playlists.reduce((total, playlist) => total + playlist.tracks, 0)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Live from Spotify API</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-gray-600">Active Playlists</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {playlists.length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Currently tracking</p>
          </div>
        </div>
      )}

      {/* Playlist List */}
      {playlists.length > 0 ? (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Tracked Playlists</h4>
          {playlists.map((playlist, index) => {
            const metrics = monetizationMetrics[index];
            return (
              <div key={playlist.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Music className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900">{playlist.name}</h5>
                      <p className="text-sm text-gray-600">
                        {formatNumber(playlist.followers)} followers
                      </p>
                    </div>
                  </div>
                  
                  <a
                    href={playlist.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-800 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Followers:</span>
                    <span className="ml-2 font-medium text-green-600">
                      {formatNumber(playlist.followers)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Tracks:</span>
                    <span className="ml-2 font-medium text-blue-600">
                      {playlist.tracks}
                    </span>
                  </div>
                </div>
                
                <p className="text-xs text-gray-500 mt-2">
                  Last updated: {new Date(playlist.lastUpdated).toLocaleDateString()}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Playlists Tracked</h4>
          <p className="text-gray-600 mb-4">
            Add Spotify playlists to start tracking follower growth and monetization potential.
          </p>
          <button
            onClick={() => setShowAddPlaylist(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Add Your First Playlist
          </button>
        </div>
      )}
    </div>
  );
};

export default SpotifyMonetization;
