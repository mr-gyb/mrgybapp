import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SpotifyTokenManager {
  constructor() {
    this.envPath = path.join(__dirname, '..', '.env');
    this.tokenExpiry = null;
    this.accessToken = null;
    this.isRunning = false;
  }

  // Load environment variables from .env file
  loadEnv() {
    try {
      if (!fs.existsSync(this.envPath)) {
        console.error('.env file not found. Please create one with your Spotify credentials.');
        return false;
      }

      const envContent = fs.readFileSync(this.envPath, 'utf8');
      const envVars = {};

      envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim();
        }
      });

      this.clientId = envVars.VITE_SPOTIFY_CLIENT_ID;
      this.clientSecret = envVars.VITE_SPOTIFY_CLIENT_SECRET;
      this.redirectUri = envVars.VITE_SPOTIFY_REDIRECT_URI;

      if (!this.clientId || !this.clientSecret) {
        console.error('Missing VITE_SPOTIFY_CLIENT_ID or VITE_SPOTIFY_CLIENT_SECRET in .env file');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error loading .env file:', error.message);
      return false;
    }
  }

  // Generate base64 encoded credentials
  generateBasicAuth() {
    const credentials = `${this.clientId}:${this.clientSecret}`;
    return Buffer.from(credentials).toString('base64');
  }

  // Get new access token from Spotify
  async getNewAccessToken() {
    try {
      console.log('🔄 Requesting new Spotify access token...');
      
      const response = await axios.post('https://accounts.spotify.com/api/token', 
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${this.generateBasicAuth()}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      if (response.data && response.data.access_token) {
        this.accessToken = response.data.access_token;
        this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
        
        console.log('✅ New Spotify access token generated successfully');
        console.log(`⏰ Token expires in ${Math.floor(response.data.expires_in / 60)} minutes`);
        
        // Save token to .env file
        this.saveTokenToEnv();
        
        return this.accessToken;
      } else {
        throw new Error('Invalid response from Spotify API');
      }
    } catch (error) {
      console.error('❌ Error getting Spotify access token:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      return null;
    }
  }

  // Save token to .env file
  saveTokenToEnv() {
    try {
      if (!fs.existsSync(this.envPath)) {
        console.error('.env file not found. Cannot save token.');
        return false;
      }

      let envContent = fs.readFileSync(this.envPath, 'utf8');
      
      // Check if VITE_SPOTIFY_ACCESS_TOKEN already exists
      if (envContent.includes('VITE_SPOTIFY_ACCESS_TOKEN=')) {
        // Update existing token
        envContent = envContent.replace(
          /VITE_SPOTIFY_ACCESS_TOKEN=.*/g,
          `VITE_SPOTIFY_ACCESS_TOKEN=${this.accessToken}`
        );
      } else {
        // Add new token line
        envContent = envContent + `\nVITE_SPOTIFY_ACCESS_TOKEN=${this.accessToken}`;
      }

      fs.writeFileSync(this.envPath, envContent);
      console.log('💾 Spotify access token saved to .env file');
      return true;
    } catch (error) {
      console.error('❌ Error saving token to .env file:', error.message);
      return false;
    }
  }

  // Check if token needs refresh
  shouldRefreshToken() {
    if (!this.accessToken || !this.tokenExpiry) {
      return true;
    }
    
    // Refresh token 5 minutes before expiry
    const refreshThreshold = 5 * 60 * 1000; // 5 minutes in milliseconds
    return Date.now() >= (this.tokenExpiry - refreshThreshold);
  }

  // Start the token refresh loop
  async start() {
    if (this.isRunning) {
      console.log('Token manager is already running');
      return;
    }

    if (!this.loadEnv()) {
      console.error('Failed to load environment variables. Exiting...');
      return;
    }

    this.isRunning = true;
    console.log('🚀 Starting Spotify token manager...');
    console.log('⏰ Tokens will be refreshed every 60 minutes');
    console.log(`📝 Using Client ID: ${this.clientId.substring(0, 8)}...`);

    // Get initial token
    await this.getNewAccessToken();

    // Set up periodic token refresh
    setInterval(async () => {
      if (this.shouldRefreshToken()) {
        await this.getNewAccessToken();
      }
    }, 60 * 1000); // Check every minute

    // Set up token expiry check every 5 minutes
    setInterval(async () => {
      if (this.shouldRefreshToken()) {
        console.log('🔄 Token approaching expiry, refreshing...');
        await this.getNewAccessToken();
      }
    }, 5 * 60 * 1000);

    console.log('✅ Spotify token manager is running');
    console.log('Press Ctrl+C to stop');
  }

  // Stop the token manager
  stop() {
    this.isRunning = false;
    console.log('🛑 Spotify token manager stopped');
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  if (tokenManager) {
    tokenManager.stop();
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  if (tokenManager) {
    tokenManager.stop();
  }
  process.exit(0);
});

// Create and start token manager
const tokenManager = new SpotifyTokenManager();

// Start the manager
tokenManager.start().catch(error => {
  console.error('❌ Failed to start token manager:', error.message);
  process.exit(1);
});
