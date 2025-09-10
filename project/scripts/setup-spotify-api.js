#!/usr/bin/env node

/**
 * Spotify API Setup Script
 * This script helps you set up Spotify API credentials and generate access tokens
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const envPath = path.join(__dirname, '..', '.env');

async function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupSpotifyAPI() {
  console.log('🎵 Spotify API Setup');
  console.log('==================\n');

  // Check if .env file exists
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found. Creating one...\n');
    
    // Create basic .env file
    const envContent = `# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# Facebook App Configuration (Optional - for additional Facebook features)
VITE_FACEBOOK_APP_ID=your_facebook_app_id
VITE_FACEBOOK_APP_SECRET=your_facebook_app_secret

# Spotify API Configuration
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
VITE_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
VITE_SPOTIFY_REDIRECT_URI=http://localhost:3002/callback
VITE_SPOTIFY_ACCESS_TOKEN=

# YouTube API Configuration
VITE_YOUTUBE_API_KEY=your_youtube_api_key_here

# Instagram API Configuration
VITE_INSTAGRAM_ACCESS_TOKEN=
VITE_INSTAGRAM_CLIENT_ID=
VITE_INSTAGRAM_CLIENT_SECRET=

# TikTok API Configuration
VITE_TIKTOK_ACCESS_TOKEN=
VITE_TIKTOK_CLIENT_ID=

# Facebook API Configuration
VITE_FACEBOOK_ACCESS_TOKEN=
VITE_FACEBOOK_CLIENT_ID=

# Pinterest API Configuration
VITE_PINTEREST_ACCESS_TOKEN=
`;

    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env file\n');
  }

  console.log('📋 To get your Spotify API credentials:');
  console.log('1. Go to https://developer.spotify.com/dashboard');
  console.log('2. Log in with your Spotify account');
  console.log('3. Click "Create App"');
  console.log('4. Fill in the app details:');
  console.log('   - App name: GYB Studio');
  console.log('   - App description: Content monetization tracking');
  console.log('   - Website: http://localhost:3002');
  console.log('   - Redirect URI: http://localhost:3002/callback');
  console.log('5. Click "Save"');
  console.log('6. Copy your Client ID and Client Secret\n');

  const clientId = await question('Enter your Spotify Client ID: ');
  const clientSecret = await question('Enter your Spotify Client Secret: ');

  if (!clientId || !clientSecret) {
    console.log('❌ Client ID and Client Secret are required!');
    rl.close();
    return;
  }

  // Update .env file
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  envContent = envContent.replace(
    'VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id_here',
    `VITE_SPOTIFY_CLIENT_ID=${clientId}`
  );
  
  envContent = envContent.replace(
    'VITE_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here',
    `VITE_SPOTIFY_CLIENT_SECRET=${clientSecret}`
  );

  fs.writeFileSync(envPath, envContent);

  console.log('\n✅ Updated .env file with your Spotify credentials');
  console.log('\n🔄 Now generating access token...\n');

  // Generate access token
  try {
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.access_token) {
      // Update .env file with access token
      envContent = envContent.replace(
        'VITE_SPOTIFY_ACCESS_TOKEN=',
        `VITE_SPOTIFY_ACCESS_TOKEN=${data.access_token}`
      );
      
      fs.writeFileSync(envPath, envContent);
      
      console.log('✅ Successfully generated Spotify access token!');
      console.log(`🔑 Token expires in: ${data.expires_in} seconds`);
      console.log('\n🚀 Your Spotify API is now configured!');
      console.log('   - Restart your development server');
      console.log('   - The monetization section should now work');
    } else {
      console.log('❌ Failed to generate access token');
      console.log('Response:', data);
    }
  } catch (error) {
    console.log('❌ Error generating access token:', error.message);
  }

  rl.close();
}

// Run the setup
setupSpotifyAPI().catch(console.error);
