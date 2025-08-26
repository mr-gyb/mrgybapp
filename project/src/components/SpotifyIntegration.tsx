import React, { useState, useEffect } from 'react';
import spotifyService, { 
  SpotifyTrack, 
  SpotifyPlaylist, 
  SpotifyArtist, 
  SpotifyAlbum,
  SpotifyUser 
} from '../api/services/spotify.service';

const SpotifyIntegration: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<SpotifyUser | null>(null);
  const [topTracks, setTopTracks] = useState<SpotifyTrack[]>([]);
  const [topArtists, setTopArtists] = useState<SpotifyArtist[]>([]);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'tracks' | 'artists' | 'playlists' | 'recent'>('profile');

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    setIsAuthenticated(spotifyService.isAuthenticated());
    if (spotifyService.isAuthenticated()) {
      loadUserData();
    }
  };

  const handleLogin = () => {
    spotifyService.initializeAuth();
  };

  const handleLogout = () => {
    spotifyService.logout();
    setIsAuthenticated(false);
    setUserProfile(null);
    setTopTracks([]);
    setTopArtists([]);
    setPlaylists([]);
    setRecentlyPlayed([]);
  };

  const loadUserData = async () => {
    if (!spotifyService.isAuthenticated()) return;

    setLoading(true);
    try {
      // Load user profile
      const profile = await spotifyService.getUserProfile();
      setUserProfile(profile);

      // Load top tracks
      const tracks = await spotifyService.getTopTracks('medium_term', 10);
      setTopTracks(tracks);

      // Load top artists
      const artists = await spotifyService.getTopArtists('medium_term', 10);
      setTopArtists(artists);

      // Load playlists
      const userPlaylists = await spotifyService.getUserPlaylists(20);
      setPlaylists(userPlaylists);

      // Load recently played
      const recent = await spotifyService.getRecentlyPlayed(20);
      setRecentlyPlayed(recent);

    } catch (error) {
      console.error('Failed to load Spotify data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-green-500 text-6xl mb-4">🎵</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Connect Your Spotify Account</h2>
          <p className="text-gray-600 mb-8 text-lg">
            Connect your Spotify account to access your music data, playlists, and get personalized recommendations.
          </p>
          <button
            onClick={handleLogin}
            className="bg-green-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-600 transition-colors shadow-lg"
          >
            Connect with Spotify
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {userProfile?.images?.[0] && (
              <img 
                src={userProfile.images[0].url} 
                alt={userProfile.display_name}
                className="w-16 h-16 rounded-full"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Welcome, {userProfile?.display_name}!
              </h1>
              <p className="text-gray-600">
                {userProfile?.followers?.total} followers • {playlists.length} playlists
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Disconnect
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-lg mb-6">
        <div className="flex border-b">
          {[
            { id: 'profile', label: 'Profile', icon: '👤' },
            { id: 'tracks', label: 'Top Tracks', icon: '🎵' },
            { id: 'artists', label: 'Top Artists', icon: '🎤' },
            { id: 'playlists', label: 'Playlists', icon: '📚' },
            { id: 'recent', label: 'Recently Played', icon: '⏰' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-4 py-3 text-center border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-green-500 text-green-600 bg-green-50'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your Spotify data...</p>
          </div>
        ) : (
          <>
            {/* Profile Tab */}
            {activeTab === 'profile' && userProfile && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800">Profile Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Display Name</label>
                      <p className="text-lg text-gray-800">{userProfile.display_name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-lg text-gray-800">{userProfile.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Country</label>
                      <p className="text-lg text-gray-800">{userProfile.country}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Followers</label>
                      <p className="text-lg text-gray-800">{userProfile.followers?.total?.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Account Type</label>
                      <p className="text-lg text-gray-800 capitalize">{userProfile.product}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Profile URL</label>
                      <a 
                        href={userProfile.external_urls.spotify} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-800 underline"
                      >
                        Open in Spotify
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Top Tracks Tab */}
            {activeTab === 'tracks' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800">Your Top Tracks</h3>
                <div className="space-y-3">
                  {topTracks.map((track, index) => (
                    <div key={track.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50">
                      <div className="w-8 text-center font-semibold text-gray-500">{index + 1}</div>
                      {track.album.images[0] && (
                        <img 
                          src={track.album.images[0].url} 
                          alt={track.album.name}
                          className="w-12 h-12 rounded"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{track.name}</p>
                        <p className="text-sm text-gray-600">
                          {track.artists.map(a => a.name).join(', ')} • {track.album.name}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">{formatDuration(track.duration_ms)}</div>
                      <a 
                        href={track.external_urls.spotify} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-800"
                      >
                        🎵
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Artists Tab */}
            {activeTab === 'artists' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800">Your Top Artists</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {topArtists.map((artist, index) => (
                    <div key={artist.id} className="text-center p-4 rounded-lg hover:bg-gray-50">
                      <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-semibold">
                        {index + 1}
                      </div>
                      {artist.images[0] && (
                        <img 
                          src={artist.images[0].url} 
                          alt={artist.name}
                          className="w-24 h-24 rounded-full mx-auto mb-3"
                        />
                      )}
                      <h4 className="font-medium text-gray-800 mb-1">{artist.name}</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {artist.followers.total.toLocaleString()} followers
                      </p>
                      <p className="text-xs text-gray-500">
                        {artist.genres.slice(0, 2).join(', ')}
                      </p>
                      <a 
                        href={artist.external_urls.spotify} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-800 text-sm"
                      >
                        View on Spotify
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Playlists Tab */}
            {activeTab === 'playlists' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800">Your Playlists</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {playlists.map((playlist) => (
                    <div key={playlist.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                      {playlist.images[0] && (
                        <img 
                          src={playlist.images[0].url} 
                          alt={playlist.name}
                          className="w-full h-32 object-cover rounded mb-3"
                        />
                      )}
                      <h4 className="font-medium text-gray-800 mb-2">{playlist.name}</h4>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {playlist.description || 'No description'}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{playlist.tracks.total} tracks</span>
                        <span>{playlist.owner.display_name}</span>
                      </div>
                      <a 
                        href={playlist.external_urls.spotify} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-800 text-sm mt-2 inline-block"
                      >
                        Open Playlist
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recently Played Tab */}
            {activeTab === 'recent' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800">Recently Played</h3>
                <div className="space-y-3">
                  {recentlyPlayed.map((track, index) => (
                    <div key={`${track.id}-${index}`} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50">
                      <div className="w-8 text-center font-semibold text-gray-500">{index + 1}</div>
                      {track.album.images[0] && (
                        <img 
                          src={track.album.images[0].url} 
                          alt={track.album.name}
                          className="w-12 h-12 rounded"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{track.name}</p>
                        <p className="text-sm text-gray-600">
                          {track.artists.map(a => a.name).join(', ')} • {track.album.name}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500">{formatDuration(track.duration_ms)}</div>
                      <a 
                        href={track.external_urls.spotify} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-800"
                      >
                        🎵
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SpotifyIntegration;
