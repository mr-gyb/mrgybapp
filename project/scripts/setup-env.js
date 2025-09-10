#!/usr/bin/env node

/**
 * Environment Setup Script
 * This script helps you create the .env file with proper configuration
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');

function createEnvFile() {
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

  try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env file successfully!');
    console.log('📝 Please update the environment variables with your actual API credentials');
    console.log('🔧 For Spotify API setup, run: node scripts/setup-spotify-api.js');
  } catch (error) {
    console.error('❌ Error creating .env file:', error.message);
  }
}

// Check if .env already exists
if (fs.existsSync(envPath)) {
  console.log('⚠️ .env file already exists');
  console.log('📝 If you need to update it, please edit it manually or delete it first');
} else {
  createEnvFile();
}
