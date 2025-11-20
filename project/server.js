import express from 'express';
import passport from 'passport';
import session from 'express-session';
import dotenv from 'dotenv';
import cors from 'cors';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import multer from 'multer';
import FormData from 'form-data';

// Load environment variables
dotenv.config();

const app = express();

// Enable CORS for frontend
app.use(cors({
  origin: ['http://localhost:3002', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads (memory storage for OpenAI API)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB limit (Whisper API limit)
  }
});

// Facebook Passport Strategy Configuration
// Note: In ES modules, we use import instead of require
// const FacebookStrategy = require("passport-facebook").Strategy; // CommonJS syntax
// import { Strategy as FacebookStrategy } from 'passport-facebook'; // ES module syntax (used here)

const FACEBOOK_APP_ID = process.env.VITE_FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.VITE_FACEBOOK_APP_SECRET;

// Validate Facebook credentials
if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET) {
  console.warn('⚠️  Warning: Facebook App ID or Secret not found in environment variables.');
  console.warn('   Please set VITE_FACEBOOK_APP_ID and VITE_FACEBOOK_APP_SECRET in your .env file.');
  console.warn('   Facebook authentication will not work without these credentials.');
}

// Configure session middleware (required for passport.session())
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-this-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Configure Facebook Strategy - using the exact code from requirements
// Only configure if credentials are available
if (FACEBOOK_APP_ID && FACEBOOK_APP_SECRET) {
  passport.use(new FacebookStrategy({
      clientID: FACEBOOK_APP_ID,
      clientSecret: FACEBOOK_APP_SECRET,
      callbackURL: "http://localhost:3000/auth/facebook/callback",
      profileFields: ['id', 'displayName', 'email', 'picture.type(large)']
    },
    function(accessToken, refreshToken, profile, cb) {
      // Store user profile and tokens
      // Note: In a real app, you'd save this to your database
      // For now, we'll return the profile with tokens
      const user = {
        facebookId: profile.id,
        displayName: profile.displayName,
        email: profile.emails && profile.emails[0] ? profile.emails[0].value : null,
        photo: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
        accessToken: accessToken,
        refreshToken: refreshToken
      };
      
      // In production, you would do:
      // User.findOrCreate({ facebookId: profile.id }, function (err, user) {
      //   return cb(err, user);
      // });
      
      return cb(null, user);
    }
  ));
} else {
  console.warn('⚠️  Facebook Strategy not configured - missing credentials');
}

// Serialize/Deserialize user for session management
passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Facebook authentication routes
app.get('/auth/facebook', (req, res) => {
  if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET) {
    return res.status(500).json({ 
      error: 'Facebook authentication not configured',
      message: 'Please set VITE_FACEBOOK_APP_ID and VITE_FACEBOOK_APP_SECRET in your .env file'
    });
  }
  passport.authenticate('facebook', { scope: ['email', 'public_profile'] })(req, res);
});

app.get('/auth/facebook/callback',
  (req, res, next) => {
    if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET) {
      return res.redirect('http://localhost:3002/chris-ai-coach?error=facebook_not_configured');
    }
    next();
  },
  passport.authenticate('facebook', { failureRedirect: 'http://localhost:3002/chris-ai-coach?error=facebook_auth_failed' }),
  function(req, res) {
    // Successful authentication, redirect back to frontend with success
    // Store the user info in session or pass as query params
    const userInfo = {
      id: req.user.facebookId,
      name: req.user.displayName,
      email: req.user.email,
      photo: req.user.photo
    };
    
    // Redirect to frontend with success and user info
    const redirectUrl = new URL('http://localhost:3002/chris-ai-coach');
    redirectUrl.searchParams.set('facebook_connected', 'true');
    redirectUrl.searchParams.set('user_id', userInfo.id);
    redirectUrl.searchParams.set('user_name', userInfo.name || '');
    
    res.redirect(redirectUrl.toString());
  });

// Check Facebook connection status
app.get('/api/facebook/status', (req, res) => {
  // Check if user is authenticated via session
  if (req.user) {
    res.json({ 
      connected: true, 
      user: {
        id: req.user.facebookId,
        name: req.user.displayName,
        email: req.user.email,
        photo: req.user.photo
      }
    });
  } else {
    res.json({ connected: false });
  }
});

// Logout Facebook connection
app.get('/api/facebook/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.json({ success: true, message: 'Disconnected from Facebook' });
  });
});

// OpenAI Whisper API Proxy Endpoint (to avoid CORS issues)
app.post('/api/openai/transcribe', upload.single('file'), async (req, res) => {
  try {
    const OPENAI_API_KEY = process.env.VITE_OPENAI_VIDEO_API_KEY || process.env.VITE_OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ 
        error: 'OpenAI API key not configured',
        message: 'Please set VITE_OPENAI_VIDEO_API_KEY or VITE_OPENAI_API_KEY in your .env file'
      });
    }

    if (!req.file) {
      return res.status(400).json({ 
        error: 'No file provided',
        message: 'Please provide a file to transcribe'
      });
    }

    console.log('🎤 Proxying transcription request to OpenAI...');
    console.log('📦 File size:', (req.file.size / (1024 * 1024)).toFixed(2), 'MB');
    console.log('📄 File type:', req.file.mimetype);

    // Check file size
    const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
    if (req.file.size > MAX_FILE_SIZE) {
      return res.status(413).json({
        error: 'File too large',
        message: `File size (${(req.file.size / (1024 * 1024)).toFixed(2)}MB) exceeds the 25MB limit for Whisper API`
      });
    }

    // Create FormData for OpenAI API
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname || 'audio.mp4',
      contentType: req.file.mimetype
    });
    formData.append('model', 'whisper-1');
    formData.append('language', req.body.language || 'en');
    formData.append('response_format', req.body.response_format || 'text');

    // Forward request to OpenAI
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        ...formData.getHeaders()
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `OpenAI API error: ${response.status} ${response.statusText}`;
      
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.message) {
          errorMessage = errorJson.error.message;
        }
      } catch (e) {
        // If not JSON, use the text as-is
      }

      console.error('❌ OpenAI API error:', response.status, errorMessage);
      
      return res.status(response.status).json({
        error: 'Transcription failed',
        message: errorMessage,
        status: response.status
      });
    }

    const transcript = await response.text();
    console.log('✅ Transcription completed successfully');
    console.log('📝 Transcript length:', transcript.length, 'characters');

    // Return transcript as text
    res.setHeader('Content-Type', 'text/plain');
    res.send(transcript);

  } catch (error) {
    console.error('❌ Error in transcription proxy:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'An error occurred while processing the transcription request'
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n✅ Backend Server running on http://localhost:${PORT}`);
  console.log(`📡 Facebook Auth Endpoint: http://localhost:${PORT}/auth/facebook`);
  console.log(`📊 Status Check Endpoint: http://localhost:${PORT}/api/facebook/status`);
  console.log(`🎤 OpenAI Transcription Proxy: http://localhost:${PORT}/api/openai/transcribe\n`);
  
  if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET) {
    console.warn('⚠️  Facebook credentials not configured. Please check your .env file.');
  }
  
  const OPENAI_API_KEY = process.env.VITE_OPENAI_VIDEO_API_KEY || process.env.VITE_OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    console.warn('⚠️  OpenAI API key not configured. Transcription proxy will not work.');
    console.warn('   Please set VITE_OPENAI_VIDEO_API_KEY or VITE_OPENAI_API_KEY in your .env file.\n');
  } else {
    console.log('✅ OpenAI API key configured for transcription proxy\n');
  }
});

