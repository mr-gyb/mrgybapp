const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fetch = require('node-fetch');
const FormData = require('form-data');
require('dotenv').config();

const app = express();
const PORT = 8080;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3002'], // Allow requests from both frontend ports
  credentials: true
}));
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB limit
  }
});

// Health check endpoint
app.get('/api/transcribe/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'transcription',
    openai_configured: !!process.env.OPENAI_API_KEY
  });
});

// Transcription endpoint
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  try {
    console.log('🎤 Received transcription request');
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }
    
    // Check file size
    if (req.file.size > 25 * 1024 * 1024) {
      return res.status(413).json({ error: 'Audio file too large. Maximum size is 25MB.' });
    }
    
    // Check API key
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }
    
    console.log('📊 Processing audio file:', {
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
    
    // Prepare request to OpenAI Whisper API
    const formData = new FormData();
    formData.append('file', req.file.buffer, {
      filename: req.file.originalname || 'audio.webm',
      contentType: req.file.mimetype
    });
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');
    formData.append('response_format', 'json');
    formData.append('temperature', '0.0');
    
    console.log('🤖 Sending to OpenAI Whisper API...');
    
    // Make request to OpenAI
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        ...formData.getHeaders()
      },
      body: formData
    });
    
    console.log('📡 OpenAI API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API error:', errorText);
      
      let errorMessage = 'Transcription failed';
      if (response.status === 401) {
        errorMessage = 'OpenAI API key invalid or expired';
      } else if (response.status === 429) {
        errorMessage = 'OpenAI API quota exceeded. Please try again later.';
      } else if (response.status === 413) {
        errorMessage = 'Audio file too large for processing';
      } else {
        errorMessage = `OpenAI API error: ${response.status}`;
      }
      
      return res.status(response.status).json({ error: errorMessage });
    }
    
    const result = await response.json();
    console.log('✅ Transcription successful:', result.text);
    
    res.json({
      text: result.text,
      success: true
    });
    
  } catch (error) {
    console.error('❌ Transcription error:', error);
    res.status(500).json({ 
      error: `Transcription failed: ${error.message}` 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Voice Chat Backend Server Started!');
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`🎤 Transcription endpoint: http://localhost:${PORT}/api/transcribe`);
  console.log(`❤️  Health check: http://localhost:${PORT}/api/transcribe/health`);
  console.log('');
  console.log('📝 Make sure to set OPENAI_API_KEY in your .env file');
});

module.exports = app;
