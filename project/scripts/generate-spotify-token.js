import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateSpotifyToken() {
  const envPath = path.join(__dirname, '..', '.env');
  
  try {
    // Check if .env file exists
    if (!fs.existsSync(envPath)) {
      console.error('❌ .env file not found. Please create one with your Spotify credentials first.');
      console.log('💡 Copy env-template.txt to .env and fill in your Spotify credentials.');
      return;
    }

    // Load environment variables
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};

    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    });

    const clientId = envVars.VITE_SPOTIFY_CLIENT_ID;
    const clientSecret = envVars.VITE_SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error('❌ Missing VITE_SPOTIFY_CLIENT_ID or VITE_SPOTIFY_CLIENT_SECRET in .env file');
      console.log('💡 Please add your Spotify credentials to the .env file first.');
      return;
    }

    console.log('🔄 Generating Spotify access token...');
    console.log(`📝 Using Client ID: ${clientId.substring(0, 8)}...`);
    
    // Generate base64 encoded credentials
    const credentials = `${clientId}:${clientSecret}`;
    const basicAuth = Buffer.from(credentials).toString('base64');

    // Request token from Spotify
    const response = await axios.post('https://accounts.spotify.com/api/token', 
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    if (response.data && response.data.access_token) {
      const accessToken = response.data.access_token;
      const expiresIn = response.data.expires_in;
      
      console.log('✅ Spotify access token generated successfully!');
      console.log(`⏰ Token expires in ${Math.floor(expiresIn / 60)} minutes`);
      
      // Save token to .env file
      let newEnvContent = envContent;
      
      if (envContent.includes('VITE_SPOTIFY_ACCESS_TOKEN=')) {
        // Update existing token
        newEnvContent = envContent.replace(
          /VITE_SPOTIFY_ACCESS_TOKEN=.*/g,
          `VITE_SPOTIFY_ACCESS_TOKEN=${accessToken}`
        );
      } else {
        // Add new token line
        newEnvContent = envContent + `\nVITE_SPOTIFY_ACCESS_TOKEN=${accessToken}`;
      }

      fs.writeFileSync(envPath, newEnvContent);
      console.log('💾 Access token saved to .env file as VITE_SPOTIFY_ACCESS_TOKEN');
      console.log('🎉 You can now use this token in your application!');
      
      // Show token info
      console.log('\n📋 Token Information:');
      console.log(`   Expires in: ${Math.floor(expiresIn / 60)} minutes`);
      console.log(`   Token preview: ${accessToken.substring(0, 20)}...`);
      
    } else {
      throw new Error('Invalid response from Spotify API');
    }

  } catch (error) {
    console.error('❌ Error generating Spotify access token:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the token generation
generateSpotifyToken();
