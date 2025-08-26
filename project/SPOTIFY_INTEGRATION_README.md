# Spotify API Integration Guide

This guide explains how to integrate Spotify API into your application to fetch user data, playlists, and music information.

## 🚀 Quick Start

### 1. Create Spotify App
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click "Create App"
4. Fill in the app details:
   - **App name**: Your app name
   - **App description**: Brief description
   - **Website**: Your website URL
   - **Redirect URI**: `http://localhost:3002/callback` (for development)
5. Accept the terms and create the app
6. Copy your **Client ID** and **Client Secret**

### 2. Environment Setup
Add these variables to your `.env` file:
```env
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
VITE_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
VITE_SPOTIFY_REDIRECT_URI=http://localhost:3002/callback
```

### 3. Add Route
Add this route to your router for handling the OAuth callback:
```tsx
import SpotifyCallback from './components/SpotifyCallback';

// In your router configuration
<Route path="/callback" element={<SpotifyCallback />} />
```

## 📊 What Data Can You Fetch?

### User Profile Information
- **Display name** and **email**
- **Profile picture** and **followers count**
- **Country** and **account type** (free/premium)
- **Profile URL** for external links

### Music Data
- **Top tracks** (short-term, medium-term, long-term)
- **Top artists** with genres and follower counts
- **Recently played tracks**
- **User's playlists** (public and private)

### Search & Discovery
- **Search tracks, artists, and albums**
- **Get recommendations** based on seed tracks/artists
- **Audio features** (danceability, energy, tempo, etc.)
- **Artist top tracks** and **albums**

### Playlist Management
- **Create and modify playlists**
- **Add/remove tracks** from playlists
- **Collaborative playlist** support
- **Playlist metadata** and images

## 🔐 Authentication Flow

### OAuth 2.0 Authorization Code Flow
1. **User clicks "Connect with Spotify"**
2. **Redirect to Spotify** with requested scopes
3. **User authorizes** your app
4. **Spotify redirects back** with authorization code
5. **Exchange code** for access and refresh tokens
6. **Store tokens** securely (localStorage for demo)
7. **Use access token** for API calls

### Required Scopes
```typescript
const scopes = [
  'user-read-private',           // Basic profile info
  'user-read-email',            // User email
  'playlist-read-private',      // Private playlists
  'user-library-read',          // Saved tracks/albums
  'user-top-read',              // Top tracks/artists
  'user-read-recently-played',  // Recently played
];
```

## 🛠️ Usage Examples

### Basic Authentication
```tsx
import spotifyService from '../api/services/spotify.service';

// Check if user is authenticated
if (spotifyService.isAuthenticated()) {
  console.log('User is connected to Spotify');
}

// Start authentication flow
spotifyService.initializeAuth();

// Logout
spotifyService.logout();
```

### Fetch User Data
```tsx
// Get user profile
const profile = await spotifyService.getUserProfile();
console.log('User:', profile.display_name);

// Get top tracks
const topTracks = await spotifyService.getTopTracks('medium_term', 20);
console.log('Top tracks:', topTracks);

// Get user playlists
const playlists = await spotifyService.getUserPlaylists(50);
console.log('Playlists:', playlists);
```

### Search Functionality
```tsx
// Search for tracks
const tracks = await spotifyService.searchTracks('rock music', 20);
console.log('Search results:', tracks);

// Search for artists
const artists = await spotifyService.searchArtists('The Beatles', 10);
console.log('Artists:', artists);
```

### Get Recommendations
```tsx
// Get recommendations based on seed tracks
const recommendations = await spotifyService.getRecommendations(
  ['4iV5W9uYEdYUVa79Axb7Rh'], // Seed track IDs
  undefined,                     // Seed artists
  ['rock'],                     // Seed genres
  20                            // Number of recommendations
);
console.log('Recommendations:', recommendations);
```

## 📱 Component Usage

### SpotifyIntegration Component
The main component that handles authentication and displays user data:

```tsx
import SpotifyIntegration from './components/SpotifyIntegration';

function App() {
  return (
    <div>
      <h1>My Music App</h1>
      <SpotifyIntegration />
    </div>
  );
}
```

### Features
- **Authentication flow** with login/logout
- **Tabbed interface** for different data types
- **Responsive design** for mobile and desktop
- **Loading states** and error handling
- **Direct links** to Spotify for each item

## 🔧 API Endpoints Used

### User Endpoints
- `GET /me` - User profile
- `GET /me/top/tracks` - Top tracks
- `GET /me/top/artists` - Top artists
- `GET /me/playlists` - User playlists
- `GET /me/player/recently-played` - Recently played

### Search Endpoints
- `GET /search?q={query}&type={type}` - Search tracks/artists/albums
- `GET /recommendations` - Get track recommendations

### Content Endpoints
- `GET /artists/{id}/top-tracks` - Artist top tracks
- `GET /artists/{id}/albums` - Artist albums
- `GET /albums/{id}/tracks` - Album tracks
- `GET /audio-features` - Track audio features

## 🚨 Important Notes

### Security
- **Never expose** Client Secret in frontend code
- **Use environment variables** for sensitive data
- **Implement proper token storage** in production
- **Handle token refresh** automatically

### Rate Limits
- **User endpoints**: 25 requests per second
- **Search endpoints**: 25 requests per second
- **Audio features**: 100 requests per second
- **Implement retry logic** for rate limit errors

### Production Considerations
- **Use secure token storage** (httpOnly cookies, secure storage)
- **Implement proper error handling** and user feedback
- **Add loading states** for better UX
- **Handle network errors** gracefully
- **Add retry mechanisms** for failed requests

## 🐛 Troubleshooting

### Common Issues

#### "Invalid client" Error
- Check your Client ID and Secret
- Ensure environment variables are loaded correctly
- Verify app is created in Spotify Developer Dashboard

#### "Redirect URI mismatch" Error
- Check redirect URI in Spotify app settings
- Ensure callback route is properly configured
- Verify URI encoding in environment variables

#### "Invalid scope" Error
- Review requested scopes in the service
- Ensure scopes are properly formatted
- Check if scopes are approved for your app

#### "Token expired" Error
- Implement automatic token refresh
- Check refresh token logic
- Verify token storage and retrieval

### Debug Tips
1. **Check browser console** for error messages
2. **Verify network requests** in Developer Tools
3. **Test with Postman** to isolate API issues
4. **Check Spotify app settings** for configuration issues
5. **Review OAuth flow** step by step

## 📚 Additional Resources

- [Spotify Web API Documentation](https://developer.spotify.com/documentation/web-api/)
- [Spotify OAuth Guide](https://developer.spotify.com/documentation/general/guides/authorization-guide/)
- [Spotify API Reference](https://developer.spotify.com/documentation/web-api/reference/)
- [Spotify Developer Community](https://community.spotify.com/t5/Spotify-for-Developers/bd-p/Spotify_Developer)

## 🎯 Next Steps

1. **Test the integration** with your Spotify account
2. **Customize the UI** to match your app's design
3. **Add more features** like playlist creation
4. **Implement caching** for better performance
5. **Add analytics** to track user engagement
6. **Create mobile-responsive** versions
7. **Add offline support** for cached data

---

**Happy coding! 🎵✨**
