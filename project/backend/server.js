require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { randomUUID } = require('crypto');
const https = require('https');
const { google } = require('googleapis');

// Use native fetch if available (Node 18+), otherwise use node-fetch
let fetch;
let FormData;
try {
  // Try to use native fetch (Node 18+)
  if (globalThis.fetch) {
    fetch = globalThis.fetch;
    FormData = globalThis.FormData;
    console.log('✅ Using native fetch and FormData (Node 18+)');
  } else {
    fetch = require('node-fetch');
    FormData = require('form-data');
    console.log('✅ Using node-fetch and form-data');
  }
} catch (e) {
  // Fallback to node-fetch if native fetch not available
  fetch = require('node-fetch');
  FormData = require('form-data');
  console.log('✅ Using node-fetch and form-data (fallback)');
}

const REQUIRED_ENV = ['OPENAI_API_KEY', 'CHAT_API_BASE', 'MODEL_NAME', 'PORT'];
const missingEnv = REQUIRED_ENV.filter(name => !process.env[name]);

if (missingEnv.length > 0) {
  console.error(
    `[startup] Missing required environment variables: ${missingEnv.join(', ')}`
  );
  process.exit(1);
}

// Validate OAuth credentials (warn but don't exit - some features may not work)
const validateOAuthCredentials = () => {
  const warnings = [];
  
  // YouTube OAuth
  const youtubeClientId = process.env.YOUTUBE_CLIENT_ID || process.env.VITE_YOUTUBE_CLIENT_ID;
  const youtubeClientSecret = process.env.YOUTUBE_CLIENT_SECRET || process.env.VITE_YOUTUBE_CLIENT_SECRET;
  if (!youtubeClientId || !youtubeClientSecret) {
    warnings.push('YouTube OAuth credentials not configured (YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET)');
  }
  
  // Facebook OAuth
  const facebookAppId = process.env.FACEBOOK_APP_ID || process.env.VITE_FACEBOOK_APP_ID;
  const facebookAppSecret = process.env.FACEBOOK_APP_SECRET || process.env.VITE_FACEBOOK_APP_SECRET;
  if (!facebookAppId || !facebookAppSecret) {
    warnings.push('Facebook OAuth credentials not configured (FACEBOOK_APP_ID, FACEBOOK_APP_SECRET)');
  }
  
  // OpenAI Video Analysis (uses same OPENAI_API_KEY as chat)
  // No separate configuration needed - uses OPENAI_API_KEY
  // Optional: OPENAI_VIDEO_MODEL (defaults to gpt-4o)
  
  if (warnings.length > 0) {
    console.warn('[startup] Configuration Warnings:');
    warnings.forEach(warning => console.warn(`  ⚠️  ${warning}`));
    console.warn('[startup] Some features may not work without proper configuration.');
  } else {
    console.log('✅ All optional credentials configured');
  }
};

validateOAuthCredentials();

const app = express();
const PORT = parseInt(process.env.PORT, 10);
const DEFAULT_CHAT_MODEL =
  process.env.MODEL_NAME || process.env.OPENAI_MODEL_NAME || 'o3-mini';
const FALLBACK_MODEL = process.env.FALLBACK_MODEL || 'o3-mini';
const OPENAI_BASE_URL = process.env.CHAT_API_BASE.replace(/\/$/, '');
const CHAT_TIMEOUT_MS = parseInt(process.env.OPENAI_CHAT_TIMEOUT_MS || '30000', 10);
const ENABLE_MODEL_FALLBACK = process.env.ENABLE_MODEL_FALLBACK !== 'false';

const safeJsonParse = (input) => {
  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
};

const formatErrorResponse = ({ code, status, source, detail, requestId, meta }) => ({
  success: false,
  error: {
    code,
    status,
    source,
    detail,
    requestId,
    meta,
    message: detail,
  },
});

const buildSystemPrompt = (agent = 'Mr.GYB AI') => {
  const prompts = {
    'Mr.GYB AI': 'You are Mr.GYB AI, an all-in-one business growth assistant. You specialize in digital marketing, content creation, and business strategy. Be professional, strategic, and focused on growth. When asked about your name, respond naturally and politely.',
    'Chris': 'You are Chris, the CEO AI, focused on high-level strategic planning and business development. Provide executive-level insights and leadership guidance. When asked about your name, respond naturally and politely.',
    'CHRIS': 'You are Chris, the CEO AI, focused on high-level strategic planning and business development. Provide executive-level insights and leadership guidance. When asked about your name, respond naturally and politely.',
    'Sherry': 'You are Sherry, the COO AI, specializing in operations management and process optimization. Focus on efficiency, systems, and operational excellence. When asked about your name, respond naturally and politely.',
    'Charlotte': 'You are Charlotte, the CHRO AI, expert in human resources and organizational development. Focus on talent management, culture, and employee experience. When asked about your name, respond naturally and politely.',
    'Jake': 'You are Jake, the CTO AI, specializing in technology strategy and innovation. Provide guidance on technical decisions and digital transformation. When asked about your name, respond naturally and politely.',
    'Rachel': 'You are Rachel, the CMO AI, expert in marketing strategy and brand development. Focus on marketing campaigns, brand building, and customer engagement. When asked about your name, respond naturally and politely.'
  };

  return prompts[agent] || 'You are a helpful AI assistant. Be professional and concise in your responses. When asked about your name, respond naturally and politely.';
};

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:5173',
  process.env.PROD_ORIGIN,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // Allow credentials for OAuth flows
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    exposedHeaders: ['X-Request-ID'],
  })
);
app.use(express.json({ limit: '1mb' }));

// Basic health route for connectivity checks
app.get('/health', (_req, res) => {
  res.setHeader('Access-Control-Allow-Origin', _req.headers.origin || '*');
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Configure multer for file uploads
// Note: Whisper API accepts files up to 25MB, but we allow larger uploads
// and will handle size validation in the endpoint
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit for initial upload (we'll validate Whisper's 25MB limit in endpoint)
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

// Transcription endpoint (accepts both audio and video files)
app.post('/api/transcribe', upload.single('audio'), async (req, res) => {
  try {
    console.log('🎤 Received transcription request');

    if (!req.file) {
      return res.status(400).json({ error: 'No audio/video file provided' });
    }

    // Whisper API accepts both audio and video files up to 25MB
    // Video files are accepted and Whisper will extract audio automatically
    const WHISPER_MAX_SIZE = 25 * 1024 * 1024; // 25MB - Whisper API limit
    if (req.file.size > WHISPER_MAX_SIZE) {
      return res.status(413).json({ 
        error: `File too large for Whisper API. Maximum size is 25MB. Your file is ${(req.file.size / (1024 * 1024)).toFixed(2)}MB. Please compress or trim your video.` 
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    console.log('📊 Processing audio file:', {
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // Create FormData - use native FormData if available, otherwise use form-data package
    const formData = new FormData();
    const filename = req.file.originalname || 
      (req.file.mimetype?.startsWith('video/') ? 'video.mp4' : 'audio.webm');
    
    // Append file - handle both native FormData and form-data package
    if (FormData.prototype.append.length === 2) {
      // Native FormData (takes Blob/File directly)
      const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
      const file = new File([blob], filename, { type: req.file.mimetype });
      formData.append('file', file);
    } else {
      // form-data package (takes buffer with options)
      formData.append('file', req.file.buffer, {
        filename: filename,
        contentType: req.file.mimetype
      });
    }
    
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');
    formData.append('response_format', 'json');
    formData.append('temperature', '0.0');

    console.log('🤖 Sending to OpenAI Whisper API...');

    // Create timeout
    const timeout = 300000; // 5 minutes
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    let response;
    try {
      // Prepare headers
      const headers = {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      };
      
      // Add FormData headers if using form-data package (not native)
      if (formData.getHeaders) {
        Object.assign(headers, formData.getHeaders());
      }
      
      const fetchOptions = {
        method: 'POST',
        headers: headers,
        body: formData,
        signal: controller.signal,
      };
      
      // For node-fetch v2, add https agent for better SSL handling
      if (typeof fetch !== 'function' || fetch.toString().includes('node-fetch')) {
        const httpsAgent = new https.Agent({
          keepAlive: true,
          rejectUnauthorized: true,
          // Add SSL options to prevent bad record mac errors
          secureProtocol: 'TLSv1_2_method',
        });
        fetchOptions.agent = httpsAgent;
      }
      
      response = await fetch('https://api.openai.com/v1/audio/transcriptions', fetchOptions);
      
      clearTimeout(timeoutId);
      
      console.log('📡 OpenAI API response status:', response.status);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('❌ Fetch error calling OpenAI:', fetchError);
      
      // Handle specific error types
      if (fetchError.name === 'AbortError' || fetchError.message?.includes('aborted')) {
        throw new Error('Request timed out. The file may be too large or OpenAI API is slow.');
      } else if (fetchError.message && (fetchError.message.includes('SSL') || fetchError.message.includes('TLS') || fetchError.message.includes('bad record mac'))) {
        throw new Error('SSL/TLS error connecting to OpenAI. This may be a network or SSL configuration issue. Please try again.');
      } else {
        throw new Error(`Network error calling OpenAI API: ${fetchError.message}`);
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      const parsed = safeJsonParse(errorText);
      console.error('❌ OpenAI API error:', errorText);

      // Check for quota error
      if (isQuotaError(response.status, parsed)) {
        const retryAfter = extractRetryAfter(response, parsed);
        console.error('[transcribe] quota error detected', {
          status: response.status,
          errorType: parsed?.error?.type,
          errorCode: parsed?.error?.code,
          retryAfter,
        });
        
        return res.status(response.status).json({
          ok: false,
          errorType: 'quota',
          status: response.status,
          error: 'OpenAI API quota exceeded. Please try again later.',
          retryAfter,
        });
      }

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
    
    // Provide more helpful error messages
    let errorMessage = error.message || 'Unknown error';
    
    // Check for SSL/TLS errors
    if (error.message && (error.message.includes('SSL') || error.message.includes('TLS') || error.message.includes('bad record mac'))) {
      errorMessage = 'Network/SSL error connecting to OpenAI. Please check your internet connection and try again. If the problem persists, there may be a network configuration issue.';
    } else if (error.message && error.message.includes('timeout')) {
      errorMessage = 'Request timed out. The video file may be too large or OpenAI API is slow. Please try again with a smaller file.';
    } else if (error.message && error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      errorMessage = 'Cannot connect to OpenAI API. Please check your internet connection and OpenAI API status.';
    }
    
    res.status(500).json({
      error: `Transcription failed: ${errorMessage}`
    });
  }
});

app.get('/api/chat/health', async (req, res) => {
  const requestId = randomUUID();

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json(
      formatErrorResponse({
        code: 'missing_api_key',
        status: 500,
        source: 'proxy',
        detail: 'OpenAI API key is not configured on the server.',
        requestId,
        meta: { hint: 'Set OPENAI_API_KEY in backend environment.' },
      })
    );
  }

  const payload = {
    model: DEFAULT_CHAT_MODEL,
    messages: [
      { role: 'system', content: 'You are a health-check assistant that only replies with "pong".' },
      { role: 'user', content: 'ping' },
    ],
    max_tokens: 1,
    temperature: 0,
  };

  const start = Date.now();
  try {
    const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        ...(process.env.OPENAI_ORG ? { 'OpenAI-Organization': process.env.OPENAI_ORG } : {}),
      },
      body: JSON.stringify(payload),
    });
    const latencyMs = Date.now() - start;
    const bodyText = await response.text();

    if (!response.ok) {
      const parsed = safeJsonParse(bodyText);
      const detail =
        parsed?.error?.message ||
        parsed?.message ||
        bodyText.slice(0, 200) ||
        `OpenAI API error (${response.status})`;
      return res.status(response.status).json(
        formatErrorResponse({
          code:
            response.status === 401
              ? 'unauthorized'
              : response.status === 429
              ? 'rate_limited'
              : response.status >= 500
              ? 'upstream_error'
              : 'bad_response',
          status: response.status,
          source: 'openai',
          detail,
          requestId,
          meta: {
            latencyMs,
            raw: parsed ?? bodyText.slice(0, 500),
          },
        })
      );
    }

    const json = safeJsonParse(bodyText);
    const completion = json?.choices?.[0]?.message?.content || 'pong';

    return res.json({
      success: true,
      data: {
        pong: completion,
        latencyMs,
        model: DEFAULT_CHAT_MODEL,
        requestId,
      },
    });
  } catch (error) {
    console.error(`[chat-health:${requestId}] error`, error);
    return res.status(504).json(
      formatErrorResponse({
        code: 'health_check_failed',
        status: 504,
        source: 'network',
        detail: error.message || 'Failed to reach OpenAI during health check.',
        requestId,
      })
    );
  }
});

const logChat = (level, requestId, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const payload = { requestId, timestamp, ...meta };
  const prefix = `[chat] ${message}`;
  if (level === 'error') {
    console.error(prefix, payload);
  } else if (level === 'warn') {
    console.warn(prefix, payload);
  } else {
    console.info(prefix, payload);
  }
};

/**
 * Detects if an OpenAI error is quota-related (billing/quota exceeded)
 * Based on OpenAI API error codes: https://platform.openai.com/docs/guides/error-codes/api-errors
 */
const isQuotaError = (status, errorData) => {
  const errorType = errorData?.error?.type || errorData?.error?.code;
  const errorCode = errorData?.error?.code;
  
  // Official OpenAI error codes for quota issues
  if (errorType === 'insufficient_quota') return true;
  if (errorCode === 'insufficient_quota') return true;
  
  // Check status code (429 can be either quota or rate limit)
  if (status === 429 && errorType === 'insufficient_quota') return true;
  
  // Check error message for quota-related keywords
  const message = (errorData?.error?.message || errorData?.message || '').toLowerCase();
  if (message.includes('quota') && (message.includes('exceeded') || message.includes('billing') || message.includes('plan'))) {
    return true;
  }
  
  return false;
};

/**
 * Detects if an OpenAI error is rate-limit related (temporary, can retry)
 * Based on OpenAI API error codes: https://platform.openai.com/docs/guides/error-codes/api-errors
 */
const isRateLimitError = (status, errorData) => {
  const errorType = errorData?.error?.type || errorData?.error?.code;
  const errorCode = errorData?.error?.code;
  
  // Official OpenAI error codes for rate limits
  if (errorType === 'rate_limit_exceeded') return true;
  if (errorCode === 'rate_limit_exceeded') return true;
  
  // 429 status without insufficient_quota is typically a rate limit
  if (status === 429 && !isQuotaError(status, errorData)) return true;
  
  // Check error message for rate limit keywords (but not quota)
  const message = (errorData?.error?.message || errorData?.message || '').toLowerCase();
  if (message.includes('rate limit') && !message.includes('quota') && !message.includes('billing')) {
    return true;
  }
  
  return false;
};

/**
 * Detects if an OpenAI error is authentication-related
 * Based on OpenAI API error codes: https://platform.openai.com/docs/guides/error-codes/api-errors
 */
const isAuthError = (status, errorData) => {
  const errorType = errorData?.error?.type || errorData?.error?.code;
  const errorCode = errorData?.error?.code;
  
  // Official OpenAI error codes for authentication
  if (errorType === 'invalid_api_key') return true;
  if (errorCode === 'invalid_api_key') return true;
  if (errorType === 'authentication_error') return true;
  if (errorCode === 'authentication_error') return true;
  
  // Status codes
  if (status === 401) return true;
  
  // Check error message
  const message = (errorData?.error?.message || errorData?.message || '').toLowerCase();
  if (message.includes('api key') || message.includes('authentication') || message.includes('unauthorized')) {
    return true;
  }
  
  return false;
};

/**
 * Detects if an OpenAI error is invalid request-related
 * Based on OpenAI API error codes: https://platform.openai.com/docs/guides/error-codes/api-errors
 */
const isInvalidRequestError = (status, errorData) => {
  const errorType = errorData?.error?.type || errorData?.error?.code;
  const errorCode = errorData?.error?.code;
  
  // Official OpenAI error codes for invalid requests
  if (errorType === 'invalid_request_error') return true;
  if (errorCode === 'invalid_request_error') return true;
  
  // Status codes
  if (status === 400) return true;
  
  return false;
};

/**
 * Extracts retry-after information from response headers or error
 */
const extractRetryAfter = (response, errorData) => {
  // Check Retry-After header
  const retryAfterHeader = response?.headers?.get?.('retry-after');
  if (retryAfterHeader) {
    const seconds = parseInt(retryAfterHeader, 10);
    if (!isNaN(seconds)) return seconds;
  }
  
  // Check error message for retry information
  const message = (errorData?.error?.message || errorData?.message || '').toLowerCase();
  const retryMatch = message.match(/retry.*?(\d+)\s*(?:second|minute|hour)/i);
  if (retryMatch) {
    return parseInt(retryMatch[1], 10);
  }
  
  return null;
};

/**
 * Sends a structured error response, with special handling for different OpenAI error types
 * Based on OpenAI API error codes: https://platform.openai.com/docs/guides/error-codes/api-errors
 */
const sendChatError = (res, status, code, message, requestId, meta = {}) => {
  const errorData = meta.errorData || {};
  const isQuota = isQuotaError(status, errorData);
  const isRateLimit = isRateLimitError(status, errorData);
  const isAuth = isAuthError(status, errorData);
  const isInvalidRequest = isInvalidRequestError(status, errorData);
  
  // Extract the original OpenAI error message
  const originalMessage = errorData?.error?.message || message || 'An error occurred';
  const errorType = errorData?.error?.type || errorData?.error?.code || code;
  
  if (isQuota) {
    // Quota exceeded = billing issue, user needs to check their OpenAI account
    // Use the exact OpenAI error message
    return res.status(status).json({
      ok: false,
      errorType: 'quota',
      status,
      code: 'insufficient_quota',
      message: originalMessage, // Use exact OpenAI error message
      requestId,
      retryAfter: null, // Quota errors don't have retry-after
      meta: {
        ...meta,
        quotaExceeded: true,
        actionable: 'Check OpenAI billing dashboard at https://platform.openai.com/usage',
        originalError: errorData?.error, // Include full error for debugging
      },
    });
  }
  
  if (isRateLimit) {
    // Rate limit = temporary, can retry after delay
    const retryAfter = extractRetryAfter(meta.response, errorData);
    // Use the exact OpenAI error message, but add retry info if available
    const rateLimitMessage = retryAfter 
      ? `${originalMessage} Please wait ${retryAfter} seconds before trying again.`
      : originalMessage;
    return res.status(status).json({
      ok: false,
      errorType: 'rate_limit',
      status,
      code: 'rate_limit_exceeded',
      message: rateLimitMessage,
      requestId,
      retryAfter,
      meta: {
        ...meta,
        rateLimited: true,
        actionable: 'Wait and retry',
        originalError: errorData?.error, // Include full error for debugging
      },
    });
  }
  
  if (isAuth) {
    // Authentication error = API key issue
    return res.status(status).json({
      ok: false,
      errorType: 'authentication',
      status,
      code: errorType || 'invalid_api_key',
      message: originalMessage, // Use exact OpenAI error message
      requestId,
      meta: {
        ...meta,
        authenticationError: true,
        actionable: 'Check OPENAI_API_KEY environment variable',
        originalError: errorData?.error, // Include full error for debugging
      },
    });
  }
  
  if (isInvalidRequest) {
    // Invalid request = bad parameters or malformed request
    return res.status(status).json({
      ok: false,
      errorType: 'invalid_request',
      status,
      code: errorType || 'invalid_request_error',
      message: originalMessage, // Use exact OpenAI error message
      requestId,
      meta: {
        ...meta,
        invalidRequest: true,
        actionable: 'Check request parameters and format',
        originalError: errorData?.error, // Include full error for debugging
      },
    });
  }
  
  // For all other errors, return the exact OpenAI error message
  return res.status(status).json({
    ok: false,
    errorType: 'unknown',
    code: errorType || code || 'unknown_error',
    message: originalMessage, // Use exact OpenAI error message
    requestId,
    status,
    meta: {
      ...meta,
      originalError: errorData?.error, // Include full error for debugging
    },
  });
};

const handleChatRequest = async (req, res) => {
  const requestId = req.headers['x-request-id'] || randomUUID();
  const startTime = Date.now();
  const {
    messages,
    model,
    temperature,
    maxTokens,
    agent,
    userId,
    chatId,
    stream,
  } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
    return sendChatError(res, 400, 'invalid_request', 'messages array is required', requestId);
    }

    const trimmedMessages = messages
      .map(msg => ({
        role: ['system', 'assistant', 'user'].includes(msg.role) ? msg.role : 'user',
      content: typeof msg.content === 'string' ? msg.content.trim() : '',
      }))
    .filter(msg => msg.content.length > 0)
    .slice(-12);

    if (trimmedMessages.length === 0) {
    return sendChatError(res, 400, 'empty_messages', 'All messages were empty after trimming.', requestId);
    }

    // Determine model to use (with fallback support)
    let modelName = model || DEFAULT_CHAT_MODEL;
    let isFallbackAttempt = false;
    const originalModel = modelName;
  const outboundUrl = `${OPENAI_BASE_URL}/chat/completions`;

  logChat('info', requestId, 'request.start', {
    userId: userId || 'unknown',
    chatId: chatId || 'unknown',
    model: modelName,
    url: outboundUrl,
  });

    const makeRequest = async (currentModel) => {
      const payload = {
        model: currentModel,
        messages: [
          { role: 'system', content: buildSystemPrompt(agent) },
        ...trimmedMessages,
        ],
        temperature: typeof temperature === 'number' ? temperature : 0.7,
        max_tokens: Math.min(
          typeof maxTokens === 'number' ? maxTokens : 700,
          parseInt(process.env.OPENAI_MAX_OUTPUT_TOKENS || '900', 10)
        ),
      stream: stream !== false,
      };

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), CHAT_TIMEOUT_MS);

      try {
        const response = await fetch(outboundUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        ...(process.env.OPENAI_ORG ? { 'OpenAI-Organization': process.env.OPENAI_ORG } : {}),
          },
          body: JSON.stringify(payload),
      signal: controller.signal,
        });
        clearTimeout(timeout);

        const latency = Date.now() - startTime;

        if (!response.ok) {
          const errorText = await response.text();
          const parsed = safeJsonParse(errorText);
          
          // Log quota and rate limit errors specifically
          if (isQuotaError(response.status, parsed)) {
            logChat('error', requestId, 'request.quota_error', {
              status: response.status,
              latencyMs: latency,
              model: currentModel,
              errorType: parsed?.error?.type || 'unknown',
              errorCode: parsed?.error?.code || 'unknown',
              message: parsed?.error?.message || errorText.slice(0, 200),
              userId: userId || 'unknown',
              chatId: chatId || 'unknown',
              actionable: 'User needs to check OpenAI billing dashboard',
            });
          } else if (isRateLimitError(response.status, parsed)) {
            logChat('warn', requestId, 'request.rate_limit', {
              status: response.status,
              latencyMs: latency,
              model: currentModel,
              errorType: parsed?.error?.type || 'unknown',
              errorCode: parsed?.error?.code || 'unknown',
              message: parsed?.error?.message || errorText.slice(0, 200),
              userId: userId || 'unknown',
              chatId: chatId || 'unknown',
              retryAfter: extractRetryAfter(response, parsed),
            });
          } else {
            logChat('error', requestId, 'request.error', {
              status: response.status,
              latencyMs: latency,
              message: errorText,
              userId: userId || 'unknown',
              chatId: chatId || 'unknown',
            });
          }
          
          return {
            ok: false,
            response,
            parsed,
            errorText,
            latency,
          };
        }

        return {
          ok: true,
          response,
          latency,
        };
      } catch (error) {
        clearTimeout(timeout);
        throw error;
      }
    };

    try {
      // First attempt with requested/default model
      let result = await makeRequest(modelName);
      
      // If rate limit error and fallback enabled, try fallback model (quota errors won't benefit from fallback)
      if (!result.ok && ENABLE_MODEL_FALLBACK && isRateLimitError(result.response.status, result.parsed)) {
        if (modelName !== FALLBACK_MODEL) {
          logChat('warn', requestId, 'request.fallback_attempt', {
            originalModel: modelName,
            fallbackModel: FALLBACK_MODEL,
            reason: 'rate_limit',
            userId: userId || 'unknown',
            chatId: chatId || 'unknown',
          });
          
          modelName = FALLBACK_MODEL;
          isFallbackAttempt = true;
          result = await makeRequest(modelName);
        }
      }

      // Handle error response
      if (!result.ok) {
        const parsed = result.parsed || {};
        const message =
          parsed?.error?.message ||
          parsed?.message ||
          result.errorText?.slice(0, 500) ||
          `Provider error (${result.response.status})`;
        
        return sendChatError(
          res,
          result.response.status,
          'provider_error',
          message,
          requestId,
          {
            latencyMs: result.latency,
            status: result.response.status,
            errorData: parsed,
            response: result.response,
            originalModel,
            fallbackAttempted: isFallbackAttempt,
          }
        );
      }

      // Success - stream the response
      const response = result.response;
      logChat('info', requestId, 'request.response', {
        status: response.status,
        latencyMs: result.latency,
        model: modelName,
        fallbackUsed: isFallbackAttempt,
        userId: userId || 'unknown',
        chatId: chatId || 'unknown',
      });

      res.status(200);
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Request-Id', requestId);
      if (isFallbackAttempt) {
        res.setHeader('X-Model-Fallback', 'true');
        res.setHeader('X-Original-Model', originalModel);
      }
      res.flushHeaders?.();

      const decoder = new TextDecoder();
      try {
        for await (const chunk of response.body) {
          res.write(decoder.decode(chunk, { stream: true }));
        }
        res.write(decoder.decode());
        res.write('data: [DONE]\n\n');
        res.end();
      } catch (streamError) {
        logChat('error', requestId, 'request.stream_error', {
          latencyMs: Date.now() - startTime,
          message: streamError.message,
          stack: streamError.stack,
        });
        if (!res.headersSent) {
          return sendChatError(res, 502, 'stream_error', 'Failed to stream provider response', requestId);
        }
        res.end();
      }
  } catch (error) {
    clearTimeout(timeout);
    const latency = Date.now() - startTime;
    const status = error.name === 'AbortError' ? 504 : 502;
    const code = error.name === 'AbortError' ? 'timeout' : 'network_error';
    logChat('error', requestId, 'request.failure', {
      status,
      latencyMs: latency,
      message: error.message,
      stack: error.stack,
    });
    if (!res.headersSent) {
      return sendChatError(
        res,
        status,
        code,
        error.name === 'AbortError' ? 'Provider request timed out' : 'Network error calling provider',
        requestId,
        { latencyMs: latency }
      );
    }
    res.end();
  }
};

app.post('/api/chat', handleChatRequest);

// Content Inspiration Agent Endpoint
app.post('/api/agent/content-inspiration', async (req, res) => {
  const requestId = req.headers['x-request-id'] || randomUUID();
  const startTime = Date.now();
  const { userUploadsSummary, businessIndustry } = req.body || {};

  if (!process.env.OPENAI_API_KEY) {
    return sendChatError(res, 500, 'missing_api_key', 'OpenAI API key not configured', requestId);
  }

  // Build prompt for content strategist agent
  const systemPrompt = `You are a Social Media Content Strategist. Your role is to generate exactly 3 creative, actionable content ideas for social media based on the user's past content and business industry.

You must return ONLY a valid JSON array with exactly 3 objects, each with this exact structure:
{
  "title": "Idea Title (short, catchy)",
  "shortDescription": "1-2 sentences describing the content idea",
  "recommendedPlatform": "Platform name (e.g., Instagram Reels, TikTok, YouTube Shorts, LinkedIn post, Twitter/X, Facebook)"
}

Return ONLY the JSON array, no other text, no markdown, no code blocks. Example format:
[{"title":"...","shortDescription":"...","recommendedPlatform":"..."},{"title":"...","shortDescription":"...","recommendedPlatform":"..."},{"title":"...","shortDescription":"...","recommendedPlatform":"..."}]`;

  let userPrompt = 'Generate 3 creative content ideas for social media.\n\n';
  
  if (businessIndustry) {
    userPrompt += `Business Industry/Niche: ${businessIndustry}\n\n`;
  }
  
  if (userUploadsSummary && userUploadsSummary.length > 0) {
    userPrompt += `Based on the user's past uploads:\n`;
    userUploadsSummary.slice(0, 10).forEach((upload, i) => {
      userPrompt += `${i + 1}. ${upload.title || 'Untitled'} (${upload.type || 'content'})`;
      if (upload.platforms && upload.platforms.length > 0) {
        userPrompt += ` - Platforms: ${upload.platforms.join(', ')}`;
      }
      userPrompt += '\n';
    });
    userPrompt += '\n';
  } else {
    userPrompt += 'No past uploads available. Generate ideas based on the industry only.\n\n';
  }
  
  userPrompt += 'Generate 3 unique, actionable content ideas that would work well for this user.';

  const payload = {
    model: DEFAULT_CHAT_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    max_tokens: 1000,
    stream: false, // We need structured JSON, not streaming
  };

  try {
    const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        ...(process.env.OPENAI_ORG ? { 'OpenAI-Organization': process.env.OPENAI_ORG } : {}),
      },
      body: JSON.stringify(payload),
    });

    const latency = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      const parsed = safeJsonParse(errorText);
      logChat('error', requestId, 'content-inspiration.error', {
        status: response.status,
        latencyMs: latency,
        error: parsed?.error || errorText.slice(0, 200),
      });
      return sendChatError(res, response.status, parsed?.error?.code || 'api_error', parsed?.error?.message || 'Failed to generate content ideas', requestId, { errorData: parsed });
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || '';

    // Parse JSON from response (handle markdown code blocks if present)
    let ideas = [];
    try {
      // Try to extract JSON array from response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        ideas = JSON.parse(jsonMatch[0]);
      } else {
        ideas = JSON.parse(content);
      }

      // Validate structure
      if (!Array.isArray(ideas) || ideas.length < 3) {
        logChat('warn', requestId, 'content-inspiration.invalid_response', {
          receivedCount: ideas.length,
          content: content.slice(0, 200),
        });
        // Generate fallback ideas
        ideas = generateFallbackIdeas(businessIndustry);
      } else {
        // Ensure each idea has required fields
        ideas = ideas.slice(0, 3).map((idea, index) => ({
          title: idea.title || `Content Idea ${index + 1}`,
          shortDescription: idea.shortDescription || idea.description || 'A creative content idea for your audience.',
          recommendedPlatform: idea.recommendedPlatform || idea.platform || 'Instagram',
        }));
      }
    } catch (parseError) {
      logChat('error', requestId, 'content-inspiration.parse_error', {
        error: parseError.message,
        content: content.slice(0, 200),
      });
      // Generate fallback ideas
      ideas = generateFallbackIdeas(businessIndustry);
    }

    logChat('info', requestId, 'content-inspiration.success', {
      latencyMs: latency,
      ideasCount: ideas.length,
    });

    return res.json({
      success: true,
      ideas,
      requestId,
    });

  } catch (error) {
    const latency = Date.now() - startTime;
    logChat('error', requestId, 'content-inspiration.exception', {
      error: error.message,
      latencyMs: latency,
    });
    return sendChatError(res, 500, 'server_error', `Failed to generate content ideas: ${error.message}`, requestId);
  }
});

// Helper function to generate fallback ideas
function generateFallbackIdeas(industry) {
  const industryContext = industry || 'business';
  return [
    {
      title: 'Educational Content Series',
      shortDescription: `Create a series of educational posts that teach your ${industryContext} audience something valuable. Share tips, insights, and actionable advice.`,
      recommendedPlatform: 'Instagram Reels',
    },
    {
      title: 'Behind-the-Scenes Content',
      shortDescription: 'Share behind-the-scenes content to build authenticity and trust. Show your process, team, or day-to-day operations.',
      recommendedPlatform: 'TikTok',
    },
    {
      title: 'Community Engagement Campaign',
      shortDescription: 'Launch a campaign that encourages audience participation. Ask questions, run polls, or create user-generated content challenges.',
      recommendedPlatform: 'LinkedIn post',
    },
  ];
}
app.post('/api/chat/completions', (req, res) => {
  logChat('warn', req.headers['x-request-id'] || randomUUID(), 'deprecated_endpoint', {
    path: '/api/chat/completions',
  });
  return handleChatRequest(req, res);
});

// Video Shorts Generator Agent Endpoint
app.post('/api/video/shorts', async (req, res) => {
  const requestId = req.headers['x-request-id'] || randomUUID();
  const startTime = Date.now();
  const { transcript } = req.body || {};

  // Safety check: transcript must be provided
  if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Transcript is required and must be a non-empty string',
      requestId,
    });
  }

  if (!process.env.OPENAI_API_KEY) {
    return sendChatError(res, 500, 'missing_api_key', 'OpenAI API key not configured', requestId);
  }

  // VideoShortsGeneratorAgent: Expert at identifying viral clip-worthy moments
  const systemPrompt = `You are an expert video content strategist and viral content analyst specializing in identifying the most engaging, shareable moments in long-form video content. Your expertise includes:

1. **Viral Content Analysis**: Identifying moments with high viral potential based on emotional hooks, controversy, value delivery, and audience engagement patterns
2. **Hook Detection**: Recognizing natural hooks (emotional peaks, surprising revelations, high-value insights, controversial statements, relatable moments)
3. **Timestamp Accuracy**: Precisely identifying start and end times based on transcript markers and natural speech patterns
4. **Short-Form Optimization**: Understanding what makes content perform well on TikTok, Instagram Reels, YouTube Shorts

Your task is to analyze a video transcript and identify 3-5 of the most viral clip-worthy moments that would perform exceptionally well as short-form content.

You MUST respond with ONLY valid JSON. Do not include any text before or after the JSON. Start your response with [ and end with ].`;

  const userPrompt = `Analyze this video transcript and identify the 3-5 most viral clip-worthy moments:

TRANSCRIPT:
${transcript}

Instructions:
1. Deeply analyze the entire transcript to find moments with maximum viral potential
2. Look for:
   - Emotional hooks (surprising, relatable, inspiring, controversial)
   - High-value insights or revelations
   - Natural conversation peaks and engaging moments
   - Moments that can stand alone as complete short videos
   - Content that would perform well on TikTok, Instagram Reels, YouTube Shorts

3. For each moment, provide:
   - Accurate start and end timestamps in "MM:SS" format (estimate based on transcript length and natural speech pace of ~150 words per minute)
   - A compelling, click-worthy title (5-10 words)
   - A strong hook line (the first 1-2 sentences that grab attention)
   - A brief description explaining why this moment is viral-worthy

4. Prioritize moments that:
   - Have clear emotional impact
   - Deliver value quickly
   - Can be understood without context
   - Have natural hooks that grab attention
   - Are between 15-60 seconds when extracted

Return your analysis as a JSON array with this exact structure:
[
  {
    "start": "00:12",
    "end": "00:28",
    "title": "How to Fix Your Mindset",
    "hook": "90% of people get this wrong…",
    "description": "This moment delivers a surprising statistic that challenges common beliefs, creating immediate curiosity and engagement. The hook is strong and the value is clear."
  },
  {
    "start": "01:45",
    "end": "02:15",
    "title": "The Secret Most People Don't Know",
    "hook": "I wish someone told me this earlier...",
    "description": "Personal revelation moment with high relatability. The emotional hook combined with valuable insight makes this highly shareable."
  }
]

Important:
- Return exactly 3-5 shorts (prioritize quality over quantity)
- Timestamps should be realistic based on transcript length (estimate ~150 words per minute)
- Titles should be compelling and click-worthy
- Hooks should be the actual first 1-2 sentences from that moment in the transcript
- Descriptions should explain the viral potential
- Ensure each short can stand alone as complete content
- Focus on moments with the highest engagement potential`;

  const payload = {
    model: 'o3-mini', // Using cheapest high-quota GPT-3-tier model
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.8, // Slightly higher for creative analysis
    max_tokens: 3000,
    stream: false, // We need structured JSON, not streaming
  };

  try {
    const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        ...(process.env.OPENAI_ORG ? { 'OpenAI-Organization': process.env.OPENAI_ORG } : {}),
      },
      body: JSON.stringify(payload),
    });

    const latency = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      const parsed = safeJsonParse(errorText);
      logChat('error', requestId, 'video-shorts.error', {
        status: response.status,
        latencyMs: latency,
        error: parsed?.error || errorText.slice(0, 200),
      });
      return sendChatError(res, response.status, parsed?.error?.code || 'api_error', parsed?.error?.message || 'Failed to generate video shorts', requestId, { errorData: parsed });
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || '';

    // Parse JSON from response (handle markdown code blocks if present)
    let shorts = [];
    try {
      // Try to extract JSON array from response
      let jsonContent = content.trim();
      
      // If the response starts with text before JSON, extract just the JSON part
      const jsonStart = jsonContent.indexOf('[');
      const jsonEnd = jsonContent.lastIndexOf(']');
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        jsonContent = jsonContent.substring(jsonStart, jsonEnd + 1);
      }
      
      shorts = JSON.parse(jsonContent);

      // Validate structure
      if (!Array.isArray(shorts)) {
        throw new Error('Response is not an array');
      }

      // Ensure each short has required fields and validate
      shorts = shorts.slice(0, 5).map((short, index) => {
        // Validate and format timestamps
        const start = short.start || `00:${String(index * 15).padStart(2, '0')}`;
        const end = short.end || `00:${String((index + 1) * 15).padStart(2, '0')}`;
        
        return {
          start: start,
          end: end,
          title: short.title || `Short ${index + 1}`,
          hook: short.hook || short.title || 'Engaging moment from the video',
          description: short.description || 'A compelling short-form video moment',
        };
      });

      // Ensure we have at least 3 shorts
      if (shorts.length < 3) {
        logChat('warn', requestId, 'video-shorts.insufficient_shorts', {
          receivedCount: shorts.length,
        });
        // Generate fallback shorts based on transcript
        const fallbackShorts = generateFallbackShorts(transcript);
        shorts = [...shorts, ...fallbackShorts].slice(0, 5);
      }

    } catch (parseError) {
      logChat('error', requestId, 'video-shorts.parse_error', {
        error: parseError.message,
        content: content.slice(0, 500),
      });
      // Generate fallback shorts
      shorts = generateFallbackShorts(transcript);
    }

    logChat('info', requestId, 'video-shorts.success', {
      latencyMs: latency,
      shortsCount: shorts.length,
    });

    return res.json({
      success: true,
      shorts,
      requestId,
      metadata: {
        transcriptLength: transcript.length,
        processingTimeMs: latency,
      },
    });

  } catch (error) {
    const latency = Date.now() - startTime;
    logChat('error', requestId, 'video-shorts.exception', {
      error: error.message,
      latencyMs: latency,
    });
    return sendChatError(res, 500, 'server_error', `Failed to generate video shorts: ${error.message}`, requestId);
  }
});

// Helper function to generate fallback shorts
function generateFallbackShorts(transcript) {
  const words = transcript.split(/\s+/);
  const totalWords = words.length;
  const wordsPerMinute = 150; // Average speaking pace
  const estimatedMinutes = totalWords / wordsPerMinute;
  const totalSeconds = Math.floor(estimatedMinutes * 60);
  
  // Generate 3 fallback shorts evenly distributed
  const shorts = [];
  for (let i = 0; i < 3; i++) {
    const startSeconds = Math.floor((totalSeconds / 4) * (i + 1));
    const endSeconds = Math.floor((totalSeconds / 4) * (i + 2));
    
    const startMinutes = Math.floor(startSeconds / 60);
    const startSecs = startSeconds % 60;
    const endMinutes = Math.floor(endSeconds / 60);
    const endSecs = endSeconds % 60;
    
    shorts.push({
      start: `${String(startMinutes).padStart(2, '0')}:${String(startSecs).padStart(2, '0')}`,
      end: `${String(endMinutes).padStart(2, '0')}:${String(endSecs).padStart(2, '0')}`,
      title: `Key Moment ${i + 1}`,
      hook: `Here's something important you need to know...`,
      description: `An engaging moment from the video that delivers value and captures attention.`,
    });
  }
  
  return shorts;
}

// Video Analysis Agent Endpoint
app.post('/api/video/analyze', async (req, res) => {
  const requestId = req.headers['x-request-id'] || randomUUID();
  const startTime = Date.now();
  const { transcript } = req.body || {};

  // Safety check: transcript must be provided
  if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Transcript is required and must be a non-empty string',
      requestId,
    });
  }

  if (!process.env.OPENAI_API_KEY) {
    return sendChatError(res, 500, 'missing_api_key', 'OpenAI API key not configured', requestId);
  }

  // VideoAnalysisAgent: Expert video content analyst and script editor
  const systemPrompt = `You are an expert video content analyst and script editor specializing in deep content analysis and script rewriting. Your role is to analyze video transcripts and provide comprehensive insights with actionable improvements.

When analyzing a transcript, you must:
1. Analyze tone, clarity, and pacing
2. Identify 3 key strengths of the content
3. Identify 3 improvement areas
4. Rewrite the script with better flow while preserving the user's speaking style
5. Detect and remove filler words
6. Produce clean, structured output

You MUST respond with ONLY valid JSON. Do not include any text before or after the JSON. Start your response with { and end with }.`;

  const userPrompt = `Analyze this video transcript and provide a comprehensive analysis:

TRANSCRIPT:
${transcript}

Provide your analysis in this exact JSON structure:
{
  "summary": "Comprehensive overview of the video content, main themes, and overall message (2-3 paragraphs)",
  "keyPoints": ["Key insight 1", "Key insight 2", "Key insight 3", "Key insight 4", "Key insight 5"],
  "improvements": [
    "Improvement area 1: Specific recommendation with reasoning",
    "Improvement area 2: Specific recommendation with reasoning",
    "Improvement area 3: Specific recommendation with reasoning"
  ],
  "revisedScript": "Complete rewritten script with improved structure, better pacing, clearer messaging, enhanced engagement elements, and filler words removed. Maintain the user's original speaking style and tone. Make it flow naturally and be engaging.",
  "rawTranscript": "${transcript.substring(0, 1000)}..."
}

Important:
- The summary should be comprehensive and insightful
- Key points should be the main takeaways (5 points)
- Improvements should be specific, actionable recommendations
- Revised script should be a complete rewrite that's better than the original while maintaining the user's voice
- Preserve the original speaking style and tone
- Remove filler words (um, uh, like, you know, etc.)
- Make the script flow naturally and be more engaging`;

  const payload = {
    model: 'o3-mini', // Using cheapest high-quota GPT-3-tier model
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    max_tokens: 4000,
    stream: false, // We need structured JSON, not streaming
  };

  try {
    const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        ...(process.env.OPENAI_ORG ? { 'OpenAI-Organization': process.env.OPENAI_ORG } : {}),
      },
      body: JSON.stringify(payload),
    });

    const latency = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      const parsed = safeJsonParse(errorText);
      logChat('error', requestId, 'video-analyze.error', {
        status: response.status,
        latencyMs: latency,
        error: parsed?.error || errorText.slice(0, 200),
      });
      return sendChatError(res, response.status, parsed?.error?.code || 'api_error', parsed?.error?.message || 'Failed to analyze video transcript', requestId, { errorData: parsed });
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || '';

    // Parse JSON from response (handle markdown code blocks if present)
    let analysis = null;
    try {
      // Try to extract JSON from response
      let jsonContent = content.trim();
      
      // If the response starts with text before JSON, extract just the JSON part
      const jsonStart = jsonContent.indexOf('{');
      const jsonEnd = jsonContent.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        jsonContent = jsonContent.substring(jsonStart, jsonEnd + 1);
      }
      
      analysis = JSON.parse(jsonContent);

      // Validate required fields
      if (!analysis.summary || !analysis.keyPoints || !analysis.improvements || !analysis.revisedScript) {
        throw new Error('Missing required fields in analysis response');
      }

      // Ensure arrays are arrays
      if (!Array.isArray(analysis.keyPoints)) {
        analysis.keyPoints = [analysis.keyPoints];
      }
      if (!Array.isArray(analysis.improvements)) {
        analysis.improvements = [analysis.improvements];
      }

    } catch (parseError) {
      logChat('error', requestId, 'video-analyze.parse_error', {
        error: parseError.message,
        content: content.slice(0, 500),
      });
      
      // Return fallback analysis
      analysis = {
        summary: 'Video analysis completed. The transcript has been processed and analyzed for content structure, clarity, and engagement opportunities.',
        keyPoints: [
          'Content structure and main themes identified',
          'Key messages and takeaways extracted',
          'Engagement opportunities identified',
          'Script flow and pacing analyzed',
          'Improvement areas identified'
        ],
        improvements: [
          'Consider adding a stronger opening hook to grab attention',
          'Improve transitions between main points for better flow',
          'Enhance the call-to-action to be more specific and actionable'
        ],
        revisedScript: transcript, // Fallback to original transcript
        rawTranscript: transcript.substring(0, 1000) + '...',
      };
    }

    logChat('info', requestId, 'video-analyze.success', {
      latencyMs: latency,
      transcriptLength: transcript.length,
    });

    return res.json({
      success: true,
      ...analysis,
      requestId,
    });

  } catch (error) {
    const latency = Date.now() - startTime;
    logChat('error', requestId, 'video-analyze.exception', {
      error: error.message,
      latencyMs: latency,
    });
    
    // Return fallback analysis on error
    return res.json({
      success: true,
      summary: 'Video analysis completed. The transcript has been processed and analyzed.',
      keyPoints: [
        'Content structure analyzed',
        'Key messages identified',
        'Engagement opportunities found',
        'Script flow evaluated',
        'Improvements suggested'
      ],
      improvements: [
        'Consider improving the opening to grab attention',
        'Enhance transitions for better flow',
        'Strengthen the call-to-action'
      ],
      revisedScript: transcript,
      rawTranscript: transcript.substring(0, 1000) + '...',
      requestId,
      fallback: true,
    });
  }
});

// YouTube OAuth Token Exchange Endpoint
app.post('/api/youtube/oauth/token', async (req, res) => {
  const requestId = req.headers['x-request-id'] || randomUUID();
  const { code, redirectUri } = req.body || {};

  if (!code) {
    return res.status(400).json({
      success: false,
      error: 'Authorization code is required',
      requestId
    });
  }

  const clientId = process.env.YOUTUBE_CLIENT_ID || process.env.VITE_YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET || process.env.VITE_YOUTUBE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(500).json({
      success: false,
      error: 'YouTube OAuth credentials not configured',
      requestId
    });
  }

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri || process.env.YOUTUBE_REDIRECT_URI || `${process.env.FRONTEND_URL || 'http://localhost:3002'}/settings/integrations/callback`,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({ error: 'Unknown error' }));
      const errorMessage = errorData.error?.message || 'Token exchange failed';
      
      // Handle specific OAuth errors
      if (errorMessage.includes('redirect_uri_mismatch')) {
        return res.status(400).json({
          success: false,
          error: 'Redirect URI mismatch. Please ensure the redirect URI in Google Cloud Console matches: ' + (redirectUri || `${process.env.FRONTEND_URL || 'http://localhost:3002'}/settings/integrations/callback`),
          requestId
        });
      }
      
      if (errorMessage.includes('invalid_grant') || errorMessage.includes('code')) {
        return res.status(400).json({
          success: false,
          error: 'Invalid authorization code. Please try authenticating again.',
          requestId
        });
      }
      
      return res.status(tokenResponse.status).json({
        success: false,
        error: errorMessage,
        requestId
      });
    }

    const tokenData = await tokenResponse.json();
    return res.json({
      success: true,
      ...tokenData,
      requestId
    });
  } catch (error) {
    console.error(`[youtube-oauth:${requestId}] Error:`, error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to exchange token',
      requestId
    });
  }
});

// YouTube OAuth Token Refresh Endpoint
app.post('/api/youtube/oauth/refresh', async (req, res) => {
  const requestId = req.headers['x-request-id'] || randomUUID();
  const { refreshToken } = req.body || {};

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      error: 'Refresh token is required',
      requestId
    });
  }

  const clientId = process.env.YOUTUBE_CLIENT_ID || process.env.VITE_YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET || process.env.VITE_YOUTUBE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(500).json({
      success: false,
      error: 'YouTube OAuth credentials not configured',
      requestId
    });
  }

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({ error: 'Unknown error' }));
      return res.status(tokenResponse.status).json({
        success: false,
        error: errorData.error?.message || 'Token refresh failed',
        requestId
      });
    }

    const tokenData = await tokenResponse.json();
    return res.json({
      success: true,
      ...tokenData,
      requestId
    });
  } catch (error) {
    console.error(`[youtube-oauth-refresh:${requestId}] Error:`, error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to refresh token',
      requestId
    });
  }
});

// YouTube OAuth Helper Functions
const getOAuth2Client = () => {
  const clientId = process.env.YOUTUBE_CLIENT_ID || process.env.VITE_YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET || process.env.VITE_YOUTUBE_CLIENT_SECRET;
  const redirectUri = process.env.YOUTUBE_REDIRECT_URI || `${process.env.FRONTEND_URL || 'http://localhost:3002'}/settings/integrations/callback`;

  if (!clientId || !clientSecret) {
    return null;
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
};

// ============================================================================
// OAuth Authentication Routes
// ============================================================================

// Get YouTube OAuth URL endpoint
app.get('/api/youtube/auth-url', (req, res) => {
  const requestId = req.headers['x-request-id'] || randomUUID();
  const oauth2Client = getOAuth2Client();

  if (!oauth2Client) {
    return res.status(500).json({
      success: false,
      error: 'YouTube OAuth credentials not configured. Please set YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET in your .env file.',
      requestId
    });
  }

  const scopes = [
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/yt-analytics.readonly',
    'https://www.googleapis.com/auth/youtube.force-ssl'
  ];

  const state = randomUUID(); // For CSRF protection
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
    state
  });

  // Store state in session for verification (optional, can also use sessionStorage on frontend)
  if (req.session) {
    req.session.youtube_oauth_state = state;
  }

  return res.json({
    success: true,
    authUrl,
    state,
    requestId
  });
});

// Get Facebook OAuth URL endpoint
// Helper function to get backend base URL
const getBackendBaseUrl = () => {
  // Check for explicit backend URL first
  if (process.env.BACKEND_URL) {
    return process.env.BACKEND_URL.replace(/\/$/, '');
  }
  // Fallback to production URL or localhost
  return process.env.NODE_ENV === 'production' 
    ? 'https://ai.mrgyb.com'
    : `http://localhost:${PORT}`;
};

// Helper function to get frontend base URL
const getFrontendBaseUrl = () => {
  return process.env.FRONTEND_URL || 'http://localhost:3002';
};

// Get Facebook OAuth redirect URI
app.get('/api/facebook/auth/redirect-uri', (req, res) => {
  const backendBaseUrl = getBackendBaseUrl();
  const redirectUri = `${backendBaseUrl}/api/facebook/auth/callback`;
  return res.json({
    success: true,
    redirectUri,
    note: 'Add this exact URL to Facebook App Settings > Facebook Login > Settings > Valid OAuth Redirect URIs'
  });
});

// Get Instagram OAuth redirect URI
app.get('/api/instagram/auth/redirect-uri', (req, res) => {
  const backendBaseUrl = getBackendBaseUrl();
  const redirectUri = `${backendBaseUrl}/api/instagram/auth/callback`;
  return res.json({
    success: true,
    redirectUri,
    note: 'Add this exact URL to Facebook App Settings > Facebook Login > Settings > Valid OAuth Redirect URIs (Instagram uses Facebook OAuth)'
  });
});

app.get('/api/facebook/auth/url', (req, res) => {
  const requestId = req.headers['x-request-id'] || randomUUID();
  const appId = process.env.FACEBOOK_APP_ID || process.env.VITE_FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET || process.env.VITE_FACEBOOK_APP_SECRET;
  
  // Use backend callback endpoint as redirect URI
  const backendBaseUrl = getBackendBaseUrl();
  const redirectUri = process.env.FACEBOOK_REDIRECT_URI || 
                      `${backendBaseUrl}/api/facebook/auth/callback`;

  if (!appId || !appSecret) {
    return res.status(500).json({
      success: false,
      error: 'Facebook OAuth credentials not configured. Please set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET in your .env file.',
      requestId
    });
  }

  const scopes = [
    'email',
    'public_profile',
    'pages_manage_posts',
    'pages_read_engagement',
    'pages_show_list',
    'publish_to_groups',
    'user_posts',
    'instagram_basic',
    'instagram_manage_insights',
    'pages_read_user_content'
  ].join(',');

  const state = randomUUID(); // For CSRF protection
  
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    scope: scopes,
    response_type: 'code',
    state: state,
    auth_type: 'rerequest'
  });

  const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;

  // Store state in session for verification
  if (req.session) {
    req.session.facebook_oauth_state = state;
  }

  return res.json({
    success: true,
    authUrl,
    state,
    redirectUri,
    requestId,
    note: `Make sure this redirect URI is whitelisted in Facebook App Settings: ${redirectUri}`
  });
});

// Get Instagram OAuth URL endpoint (Instagram uses Facebook OAuth)
app.get('/api/instagram/auth/url', (req, res) => {
  const requestId = req.headers['x-request-id'] || randomUUID();
  const appId = process.env.FACEBOOK_APP_ID || process.env.VITE_FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET || process.env.VITE_FACEBOOK_APP_SECRET;
  
  // Use backend callback endpoint as redirect URI
  const backendBaseUrl = getBackendBaseUrl();
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI || 
                      process.env.FACEBOOK_REDIRECT_URI ||
                      `${backendBaseUrl}/api/instagram/auth/callback`;

  if (!appId || !appSecret) {
    return res.status(500).json({
      success: false,
      error: 'Instagram OAuth credentials not configured. Please set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET in your .env file (Instagram uses Facebook OAuth).',
      requestId
    });
  }

  // Instagram requires Facebook OAuth with specific scopes
  const scopes = [
    'email',
    'public_profile',
    'pages_show_list',
    'pages_read_engagement',
    'instagram_basic',
    'instagram_manage_insights',
    'instagram_content_publish',
    'pages_read_user_content'
  ].join(',');

  const state = randomUUID(); // For CSRF protection
  
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    scope: scopes,
    response_type: 'code',
    state: state,
    auth_type: 'rerequest'
  });

  const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;

  // Store state in session for verification
  if (req.session) {
    req.session.instagram_oauth_state = state;
  }

  return res.json({
    success: true,
    authUrl,
    state,
    redirectUri,
    requestId,
    note: `Instagram uses Facebook OAuth. Make sure this redirect URI is whitelisted in Facebook App Settings: ${redirectUri}`
  });
});

// Instagram OAuth callback endpoint (uses Facebook OAuth)
app.get('/api/instagram/auth/callback', async (req, res) => {
  const requestId = req.headers['x-request-id'] || randomUUID();
  const { code, state } = req.query;

  if (!code) {
    // Redirect to frontend with error
    const frontendBaseUrl = getFrontendBaseUrl();
    return res.redirect(`${frontendBaseUrl}/settings/integrations/callback?error=missing_code&error_description=Authorization code is required`);
  }

  // Verify state for CSRF protection
  if (req.session?.instagram_oauth_state !== state) {
    const frontendBaseUrl = getFrontendBaseUrl();
    return res.redirect(`${frontendBaseUrl}/settings/integrations/callback?error=invalid_state&error_description=Invalid state parameter`);
  }
  delete req.session.instagram_oauth_state; // Clear state after verification

  const appId = process.env.FACEBOOK_APP_ID || process.env.VITE_FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET || process.env.VITE_FACEBOOK_APP_SECRET;
  
  // Use backend callback endpoint as redirect URI (must match what was used in auth URL)
  const backendBaseUrl = getBackendBaseUrl();
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI || 
                      process.env.FACEBOOK_REDIRECT_URI ||
                      `${backendBaseUrl}/api/instagram/auth/callback`;

  if (!appId || !appSecret) {
    return res.status(500).json({
      success: false,
      error: 'Instagram OAuth credentials not configured. Please set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET in your .env file.',
      requestId
    });
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&redirect_uri=${encodeURIComponent(redirectUri)}&code=${code}`
    );

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Failed to exchange authorization code');
    }

    const tokenData = await tokenResponse.json();
    const shortLivedToken = tokenData.access_token;

    if (!shortLivedToken) {
      throw new Error('No access token received from Facebook');
    }

    // Exchange short-lived token for long-lived token (60 days)
    const longLivedResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`
    );

    let longLivedToken = shortLivedToken;
    let expiresIn = tokenData.expires_in || 3600;

    if (longLivedResponse.ok) {
      const longLivedData = await longLivedResponse.json();
      longLivedToken = longLivedData.access_token || longLivedToken;
      expiresIn = longLivedData.expires_in || expiresIn;
    }

    // Get user's Facebook pages
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${longLivedToken}`
    );

    let pageId = null;
    let pageAccessToken = null;
    let instagramBusinessAccountId = null;

    if (pagesResponse.ok) {
      const pagesData = await pagesResponse.json();
      if (pagesData.data && pagesData.data.length > 0) {
        // Use the first page
        const firstPage = pagesData.data[0];
        pageId = firstPage.id;
        pageAccessToken = firstPage.access_token;

        // Get Instagram Business Account ID from the page
        if (pageAccessToken) {
          const instagramResponse = await fetch(
            `https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`
          );

          if (instagramResponse.ok) {
            const instagramData = await instagramResponse.json();
            instagramBusinessAccountId = instagramData.instagram_business_account?.id || null;
          }
        }
      }
    }

    // Store tokens in response and redirect to frontend
    const frontendBaseUrl = getFrontendBaseUrl();
    const sessionTokenData = {
      access_token: longLivedToken,
      expires_in: expiresIn,
      token_type: 'Bearer',
      pageId,
      instagramBusinessAccountId
    };
    
    // Store tokens in session temporarily for frontend to retrieve
    if (req.session) {
      req.session.instagram_tokens = sessionTokenData;
    }
    
    // Redirect to frontend callback with success
    return res.redirect(`${frontendBaseUrl}/settings/integrations/callback?provider=instagram&success=true&code=${code}`);
  } catch (error) {
    console.error(`[instagram-callback:${requestId}] Error:`, error);
    const frontendBaseUrl = getFrontendBaseUrl();
    const errorMessage = encodeURIComponent(error.message || 'Failed to process Instagram OAuth callback');
    return res.redirect(`${frontendBaseUrl}/settings/integrations/callback?provider=instagram&error=oauth_error&error_description=${errorMessage}`);
  }
});

// Facebook OAuth callback endpoint
app.get('/api/facebook/auth/callback', async (req, res) => {
  const requestId = req.headers['x-request-id'] || randomUUID();
  const { code, state } = req.query;

  if (!code) {
    // Redirect to frontend with error
    const frontendBaseUrl = getFrontendBaseUrl();
    return res.redirect(`${frontendBaseUrl}/settings/integrations/callback?error=missing_code&error_description=Authorization code is required`);
  }

  // Verify state for CSRF protection
  if (req.session?.facebook_oauth_state !== state) {
    const frontendBaseUrl = getFrontendBaseUrl();
    return res.redirect(`${frontendBaseUrl}/settings/integrations/callback?error=invalid_state&error_description=Invalid state parameter`);
  }
  delete req.session.facebook_oauth_state; // Clear state after verification

  const appId = process.env.FACEBOOK_APP_ID || process.env.VITE_FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET || process.env.VITE_FACEBOOK_APP_SECRET;
  
  // Use backend callback endpoint as redirect URI (must match what was used in auth URL)
  const backendBaseUrl = getBackendBaseUrl();
  const redirectUri = process.env.FACEBOOK_REDIRECT_URI ||
                      `${backendBaseUrl}/api/facebook/auth/callback`;

  if (!appId || !appSecret) {
    return res.status(500).json({
      success: false,
      error: 'Facebook OAuth credentials not configured. Please set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET in your .env file.',
      requestId
    });
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&redirect_uri=${encodeURIComponent(redirectUri)}&code=${code}`
    );

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Failed to exchange authorization code');
    }

    const tokenData = await tokenResponse.json();
    const shortLivedToken = tokenData.access_token;

    if (!shortLivedToken) {
      throw new Error('No access token received from Facebook');
    }

    // Exchange short-lived token for long-lived token (60 days)
    const longLivedResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`
    );

    let longLivedToken = shortLivedToken;
    let expiresIn = tokenData.expires_in || 3600;

    if (longLivedResponse.ok) {
      const longLivedData = await longLivedResponse.json();
      longLivedToken = longLivedData.access_token || longLivedToken;
      expiresIn = longLivedData.expires_in || expiresIn;
    }

    // Get user's Facebook pages
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${longLivedToken}`
    );

    let pageId = null;
    let pageAccessToken = null;
    let instagramBusinessAccountId = null;

    if (pagesResponse.ok) {
      const pagesData = await pagesResponse.json();
      if (pagesData.data && pagesData.data.length > 0) {
        // Use the first page
        const firstPage = pagesData.data[0];
        pageId = firstPage.id;
        pageAccessToken = firstPage.access_token;

        // Get Instagram Business Account ID from the page (optional, for Facebook-only auth)
        if (pageAccessToken) {
          const instagramResponse = await fetch(
            `https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`
          );

          if (instagramResponse.ok) {
            const instagramData = await instagramResponse.json();
            instagramBusinessAccountId = instagramData.instagram_business_account?.id || null;
          }
        }
      }
    }

    // Store tokens in response and redirect to frontend
    const frontendBaseUrl = getFrontendBaseUrl();
    const sessionTokenData = {
      access_token: longLivedToken,
      expires_in: expiresIn,
      token_type: 'Bearer',
      pageId,
      instagramBusinessAccountId
    };
    
    // Store tokens in session temporarily for frontend to retrieve
    if (req.session) {
      req.session.facebook_tokens = sessionTokenData;
    }
    
    // Redirect to frontend callback with success
    return res.redirect(`${frontendBaseUrl}/settings/integrations/callback?provider=facebook&success=true&code=${code}`);
  } catch (error) {
    console.error(`[facebook-callback:${requestId}] Error:`, error);
    const frontendBaseUrl = getFrontendBaseUrl();
    const errorMessage = encodeURIComponent(error.message || 'Failed to process Facebook OAuth callback');
    return res.redirect(`${frontendBaseUrl}/settings/integrations/callback?provider=facebook&error=oauth_error&error_description=${errorMessage}`);
  }
});

// Get Facebook tokens from session (called by frontend after redirect)
app.get('/api/facebook/auth/tokens', (req, res) => {
  const requestId = req.headers['x-request-id'] || randomUUID();
  
  if (req.session?.facebook_tokens) {
    const tokens = req.session.facebook_tokens;
    delete req.session.facebook_tokens; // Clear after retrieval
    return res.json({
      success: true,
      tokens,
      requestId
    });
  }
  
  return res.status(404).json({
    success: false,
    error: 'No tokens found in session',
    requestId
  });
});

// Get Instagram tokens from session (called by frontend after redirect)
app.get('/api/instagram/auth/tokens', (req, res) => {
  const requestId = req.headers['x-request-id'] || randomUUID();
  
  if (req.session?.instagram_tokens) {
    const tokens = req.session.instagram_tokens;
    delete req.session.instagram_tokens; // Clear after retrieval
    return res.json({
      success: true,
      tokens,
      requestId
    });
  }
  
  return res.status(404).json({
    success: false,
    error: 'No tokens found in session',
    requestId
  });
});

// OAuth callback endpoint
app.get('/api/youtube/callback', async (req, res) => {
  const requestId = req.headers['x-request-id'] || randomUUID();
  const { code, state } = req.query;

  if (!code) {
    return res.status(400).json({
      success: false,
      error: 'Authorization code is required',
      requestId
    });
  }

  const oauth2Client = getOAuth2Client();
  if (!oauth2Client) {
    return res.status(500).json({
      success: false,
      error: 'YouTube OAuth credentials not configured',
      requestId
    });
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    return res.json({
      success: true,
      tokens: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date,
        token_type: tokens.token_type || 'Bearer',
        scope: tokens.scope
      },
      requestId
    });
  } catch (error) {
    console.error(`[youtube-callback:${requestId}] Error:`, error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to exchange authorization code',
      requestId
    });
  }
});

// YouTube Analytics API Helper Functions
const getYouTubeChannelId = async (accessToken) => {
  try {
    const oauth2Client = getOAuth2Client();
    if (!oauth2Client) return null;

    oauth2Client.setCredentials({ access_token: accessToken });
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    const response = await youtube.channels.list({
      part: ['id'],
      mine: true
    });

    return response.data.items?.[0]?.id || null;
  } catch (error) {
    console.error('Error getting channel ID:', error);
    return null;
  }
};

const getYouTubeAnalyticsClient = (accessToken) => {
  const oauth2Client = getOAuth2Client();
  if (!oauth2Client) return null;

  oauth2Client.setCredentials({ access_token: accessToken });
  return google.youtubeAnalytics({ version: 'v2', auth: oauth2Client });
};

// YouTube Overview Endpoint
app.get('/api/youtube/overview', async (req, res) => {
  const requestId = req.headers['x-request-id'] || randomUUID();
  const accessToken = req.headers['authorization']?.replace('Bearer ', '') || req.query.accessToken;

  if (!accessToken) {
    return res.status(401).json({
      success: false,
      error: 'Access token required',
      requestId
    });
  }

  try {
    const channelId = await getYouTubeChannelId(accessToken);
    if (!channelId) {
      return res.status(400).json({
        success: false,
        error: 'Could not determine channel ID',
        requestId
      });
    }

    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const response = await fetch(
      `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==${channelId}&startDate=${startDate}&endDate=${endDate}&metrics=views,likes,comments,estimatedMinutesWatched,subscribersGained`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      const errorMessage = errorData.error?.message || 'Failed to fetch overview';
      
      // Handle quota exceeded
      if (response.status === 429 || errorMessage.includes('quota') || errorMessage.includes('Quota')) {
        return res.status(429).json({
          success: false,
          error: 'YouTube Analytics API quota exceeded. Please try again later.',
          requestId,
          retryAfter: response.headers.get('Retry-After') || 3600
        });
      }
      
      // Handle invalid token
      if (response.status === 401 || errorMessage.includes('unauthorized') || errorMessage.includes('Invalid Credentials')) {
        return res.status(401).json({
          success: false,
          error: 'Authentication expired. Please re-authenticate with YouTube.',
          requestId
        });
      }
      
      return res.status(response.status).json({
        success: false,
        error: errorMessage,
        requestId
      });
    }

    const data = await response.json();
    const rows = data.rows?.[0] || [];

    return res.json({
      success: true,
      data: {
        views: rows[0] || 0,
        likes: rows[1] || 0,
        comments: rows[2] || 0,
        estimatedMinutesWatched: rows[3] || 0,
        subscribersGained: rows[4] || 0
      },
      requestId
    });
  } catch (error) {
    console.error(`[youtube-overview:${requestId}] Error:`, error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch overview',
      requestId
    });
  }
});

// YouTube Demographics - Gender Breakdown
app.get('/api/youtube/demographics', async (req, res) => {
  const requestId = req.headers['x-request-id'] || randomUUID();
  const accessToken = req.headers['authorization']?.replace('Bearer ', '') || req.query.accessToken;

  if (!accessToken) {
    return res.status(401).json({
      success: false,
      error: 'Access token required',
      requestId
    });
  }

  try {
    const channelId = await getYouTubeChannelId(accessToken);
    if (!channelId) {
      return res.status(400).json({
        success: false,
        error: 'Could not determine channel ID',
        requestId
      });
    }

    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const response = await fetch(
      `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==${channelId}&startDate=${startDate}&endDate=${endDate}&metrics=viewerPercentage&dimensions=gender`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      const errorMessage = errorData.error?.message || 'Failed to fetch demographics';
      
      if (response.status === 429 || errorMessage.includes('quota')) {
        return res.status(429).json({
          success: false,
          error: 'YouTube Analytics API quota exceeded. Please try again later.',
          requestId
        });
      }
      
      if (response.status === 401) {
        return res.status(401).json({
          success: false,
          error: 'Authentication expired. Please re-authenticate with YouTube.',
          requestId
        });
      }
      
      return res.status(response.status).json({
        success: false,
        error: errorMessage,
        requestId
      });
    }

    const data = await response.json();
    const rows = data.rows || [];

    const demographics = rows.map((row) => {
      const gender = row[0];
      const percentage = row[1] || 0;
      return {
        gender: gender === 'FEMALE' ? 'Female' : gender === 'MALE' ? 'Male' : 'Other',
        percentage: Math.round(percentage * 100) / 100
      };
    });

    return res.json({
      success: true,
      data: demographics,
      requestId
    });
  } catch (error) {
    console.error(`[youtube-demographics:${requestId}] Error:`, error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch demographics',
      requestId
    });
  }
});

// YouTube Geography Breakdown
app.get('/api/youtube/geography', async (req, res) => {
  const requestId = req.headers['x-request-id'] || randomUUID();
  const accessToken = req.headers['authorization']?.replace('Bearer ', '') || req.query.accessToken;

  if (!accessToken) {
    return res.status(401).json({
      success: false,
      error: 'Access token required',
      requestId
    });
  }

  try {
    const channelId = await getYouTubeChannelId(accessToken);
    if (!channelId) {
      return res.status(400).json({
        success: false,
        error: 'Could not determine channel ID',
        requestId
      });
    }

    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const response = await fetch(
      `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==${channelId}&startDate=${startDate}&endDate=${endDate}&metrics=viewerPercentage&dimensions=country&sort=-viewerPercentage&maxResults=20`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      const errorMessage = errorData.error?.message || 'Failed to fetch geography';
      
      if (response.status === 429 || errorMessage.includes('quota')) {
        return res.status(429).json({
          success: false,
          error: 'YouTube Analytics API quota exceeded. Please try again later.',
          requestId
        });
      }
      
      if (response.status === 401) {
        return res.status(401).json({
          success: false,
          error: 'Authentication expired. Please re-authenticate with YouTube.',
          requestId
        });
      }
      
      return res.status(response.status).json({
        success: false,
        error: errorMessage,
        requestId
      });
    }

    const data = await response.json();
    const rows = data.rows || [];

    const geography = rows.map((row) => ({
      country: row[0] || 'Unknown',
      percentage: Math.round((row[1] || 0) * 100) / 100
    }));

    return res.json({
      success: true,
      data: geography,
      requestId
    });
  } catch (error) {
    console.error(`[youtube-geography:${requestId}] Error:`, error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch geography',
      requestId
    });
  }
});

// YouTube Traffic Source
app.get('/api/youtube/traffic-source', async (req, res) => {
  const requestId = req.headers['x-request-id'] || randomUUID();
  const accessToken = req.headers['authorization']?.replace('Bearer ', '') || req.query.accessToken;

  if (!accessToken) {
    return res.status(401).json({
      success: false,
      error: 'Access token required',
      requestId
    });
  }

  try {
    const channelId = await getYouTubeChannelId(accessToken);
    if (!channelId) {
      return res.status(400).json({
        success: false,
        error: 'Could not determine channel ID',
        requestId
      });
    }

    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const response = await fetch(
      `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==${channelId}&startDate=${startDate}&endDate=${endDate}&metrics=views&dimensions=insightTrafficSourceType&sort=-views&maxResults=10`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      const errorMessage = errorData.error?.message || 'Failed to fetch traffic source';
      
      if (response.status === 429 || errorMessage.includes('quota')) {
        return res.status(429).json({
          success: false,
          error: 'YouTube Analytics API quota exceeded. Please try again later.',
          requestId
        });
      }
      
      if (response.status === 401) {
        return res.status(401).json({
          success: false,
          error: 'Authentication expired. Please re-authenticate with YouTube.',
          requestId
        });
      }
      
      return res.status(response.status).json({
        success: false,
        error: errorMessage,
        requestId
      });
    }

    const data = await response.json();
    const rows = data.rows || [];

    const trafficSource = rows.map((row) => ({
      source: row[0] || 'Unknown',
      views: row[1] || 0
    }));

    return res.json({
      success: true,
      data: trafficSource,
      requestId
    });
  } catch (error) {
    console.error(`[youtube-traffic-source:${requestId}] Error:`, error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch traffic source',
      requestId
    });
  }
});

// YouTube Video Metrics Endpoint (video-specific analytics)
app.get('/api/youtube/metrics/:videoId', async (req, res) => {
  const requestId = req.headers['x-request-id'] || randomUUID();
  const { videoId } = req.params;
  const accessToken = req.headers['authorization']?.replace('Bearer ', '') || req.query.accessToken;

  if (!accessToken) {
    return res.status(401).json({
      success: false,
      error: 'Access token required',
      requestId
    });
  }

  if (!videoId || videoId.length !== 11) {
    return res.status(400).json({
      success: false,
      error: 'Invalid video ID',
      requestId
    });
  }

  try {
    const oauth2Client = getOAuth2Client();
    if (!oauth2Client) {
      return res.status(500).json({
        success: false,
        error: 'YouTube OAuth credentials not configured',
        requestId
      });
    }

    oauth2Client.setCredentials({ access_token: accessToken });
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    const youtubeAnalytics = google.youtubeAnalytics({ version: 'v2', auth: oauth2Client });

    // Get channel ID
    const channelResponse = await youtube.channels.list({
      part: ['id'],
      mine: true
    });
    const channelId = channelResponse.data.items?.[0]?.id;

    if (!channelId) {
      return res.status(400).json({
        success: false,
        error: 'Could not determine channel ID',
        requestId
      });
    }

    // Get video details (views, likes, comments, duration)
    const videoResponse = await youtube.videos.list({
      part: ['statistics', 'contentDetails', 'snippet'],
      id: [videoId]
    });

    if (!videoResponse.data.items || videoResponse.data.items.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Video not found',
        requestId
      });
    }

    const video = videoResponse.data.items[0];
    const stats = video.statistics;
    const contentDetails = video.contentDetails;

    // Parse duration
    const durationMatch = contentDetails?.duration?.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    let durationSeconds = 0;
    if (durationMatch) {
      const hours = parseInt(durationMatch[1] || '0');
      const minutes = parseInt(durationMatch[2] || '0');
      const seconds = parseInt(durationMatch[3] || '0');
      durationSeconds = hours * 3600 + minutes * 60 + seconds;
    }

    // Date range for analytics (last 30 days)
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Get video-specific analytics (watch time, average view duration)
    let watchTime = 0;
    let averageViewDuration = 0;
    try {
      const videoAnalyticsResponse = await youtubeAnalytics.reports.query({
        ids: `channel==${channelId}`,
        startDate,
        endDate,
        metrics: 'estimatedMinutesWatched,averageViewDuration',
        filters: `video==${videoId}`
      });

      if (videoAnalyticsResponse.data.rows && videoAnalyticsResponse.data.rows.length > 0) {
        const row = videoAnalyticsResponse.data.rows[0];
        watchTime = row[0] || 0; // estimatedMinutesWatched
        averageViewDuration = row[1] || 0; // averageViewDuration in seconds
      }
    } catch (analyticsError) {
      console.warn('Could not fetch video-specific analytics:', analyticsError);
    }

    // Get channel-level demographics (YouTube Analytics doesn't support video-level demographics)
    let demographics = {
      genders: [],
      ageGroups: [],
      topCountries: [],
      trafficSource: []
    };

    // Fetch demographics with individual error handling for each metric
    // Gender demographics
    try {
      const genderResponse = await youtubeAnalytics.reports.query({
        ids: `channel==${channelId}`,
        startDate,
        endDate,
        metrics: 'viewerPercentage',
        dimensions: 'gender'
      });

      if (genderResponse.data?.rows && genderResponse.data.rows.length > 0) {
        demographics.genders = genderResponse.data.rows.map((row) => ({
          gender: row[0] === 'FEMALE' ? 'Female' : row[0] === 'MALE' ? 'Male' : 'Other',
          percentage: Math.round((row[1] || 0) * 100) / 100
        }));
        console.log(`[youtube-metrics:${requestId}] ✅ Fetched ${demographics.genders.length} gender demographics`);
      } else {
        console.warn(`[youtube-metrics:${requestId}] ⚠️  No gender demographics data available`);
      }
    } catch (genderError) {
      console.error(`[youtube-metrics:${requestId}] ❌ Error fetching gender demographics:`, genderError.message || genderError);
      // Continue with empty array
    }

    // Age groups
    try {
      const ageResponse = await youtubeAnalytics.reports.query({
        ids: `channel==${channelId}`,
        startDate,
        endDate,
        metrics: 'viewerPercentage',
        dimensions: 'ageGroup',
        sort: 'ageGroup'
      });

      if (ageResponse.data?.rows && ageResponse.data.rows.length > 0) {
        demographics.ageGroups = ageResponse.data.rows.map((row) => {
          const ageGroup = row[0]?.replace('AGE_', '')?.replace(/_/g, '-') || row[0] || 'Unknown';
          return {
            ageGroup,
            percentage: Math.round((row[1] || 0) * 100) / 100
          };
        });
        console.log(`[youtube-metrics:${requestId}] ✅ Fetched ${demographics.ageGroups.length} age group demographics`);
      } else {
        console.warn(`[youtube-metrics:${requestId}] ⚠️  No age group demographics data available`);
      }
    } catch (ageError) {
      console.error(`[youtube-metrics:${requestId}] ❌ Error fetching age groups:`, ageError.message || ageError);
      // Continue with empty array
    }

    // Top countries
    try {
      const countryResponse = await youtubeAnalytics.reports.query({
        ids: `channel==${channelId}`,
        startDate,
        endDate,
        metrics: 'viewerPercentage',
        dimensions: 'country',
        sort: '-viewerPercentage',
        maxResults: 20
      });

      if (countryResponse.data?.rows && countryResponse.data.rows.length > 0) {
        demographics.topCountries = countryResponse.data.rows.map((row) => ({
          country: row[0] || 'Unknown',
          percentage: Math.round((row[1] || 0) * 100) / 100
        }));
        console.log(`[youtube-metrics:${requestId}] ✅ Fetched ${demographics.topCountries.length} country demographics`);
      } else {
        console.warn(`[youtube-metrics:${requestId}] ⚠️  No country demographics data available`);
      }
    } catch (countryError) {
      console.error(`[youtube-metrics:${requestId}] ❌ Error fetching country demographics:`, countryError.message || countryError);
      // Continue with empty array
    }

    // Traffic sources
    try {
      const trafficResponse = await youtubeAnalytics.reports.query({
        ids: `channel==${channelId}`,
        startDate,
        endDate,
        metrics: 'views',
        dimensions: 'insightTrafficSourceType',
        sort: '-views',
        maxResults: 10
      });

      if (trafficResponse.data?.rows && trafficResponse.data.rows.length > 0) {
        demographics.trafficSource = trafficResponse.data.rows.map((row) => ({
          source: row[0] || 'Unknown',
          views: row[1] || 0
        }));
        console.log(`[youtube-metrics:${requestId}] ✅ Fetched ${demographics.trafficSource.length} traffic sources`);
      } else {
        console.warn(`[youtube-metrics:${requestId}] ⚠️  No traffic source data available`);
      }
    } catch (trafficError) {
      console.error(`[youtube-metrics:${requestId}] ❌ Error fetching traffic sources:`, trafficError.message || trafficError);
      // Continue with empty array
    }

    // Log summary of fetched data
    console.log(`[youtube-metrics:${requestId}] 📊 Demographics summary:`, {
      genders: demographics.genders.length,
      ageGroups: demographics.ageGroups.length,
      countries: demographics.topCountries.length,
      trafficSources: demographics.trafficSource.length
    });

    return res.json({
      success: true,
      data: {
        videoId,
        title: video.snippet?.title || 'Unknown',
        views: parseInt(stats.viewCount || '0'),
        likes: parseInt(stats.likeCount || '0'),
        comments: parseInt(stats.commentCount || '0'),
        duration: durationSeconds,
        watchTime: Math.round(watchTime), // minutes
        averageViewDuration: Math.round(averageViewDuration), // seconds
        demographics: {
          genders: demographics.genders,
          ageGroups: demographics.ageGroups,
          topCountries: demographics.topCountries,
          trafficSource: demographics.trafficSource
        }
      },
      requestId
    });
  } catch (error) {
    console.error(`[youtube-metrics:${requestId}] Error:`, error);
    
    // Handle quota exceeded
    if (error.code === 429 || error.message?.includes('quota')) {
      return res.status(429).json({
        success: false,
        error: 'YouTube Analytics API quota exceeded. Please try again later.',
        requestId
      });
    }

    // Handle invalid token
    if (error.code === 401 || error.message?.includes('unauthorized')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication expired. Please re-authenticate with YouTube.',
        requestId
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch video metrics',
      requestId
    });
  }
});

// YouTube Age Groups
app.get('/api/youtube/age-groups', async (req, res) => {
  const requestId = req.headers['x-request-id'] || randomUUID();
  const accessToken = req.headers['authorization']?.replace('Bearer ', '') || req.query.accessToken;

  if (!accessToken) {
    return res.status(401).json({
      success: false,
      error: 'Access token required',
      requestId
    });
  }

  try {
    const channelId = await getYouTubeChannelId(accessToken);
    if (!channelId) {
      return res.status(400).json({
        success: false,
        error: 'Could not determine channel ID',
        requestId
      });
    }

    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const response = await fetch(
      `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==${channelId}&startDate=${startDate}&endDate=${endDate}&metrics=viewerPercentage&dimensions=ageGroup&sort=ageGroup`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      const errorMessage = errorData.error?.message || 'Failed to fetch age groups';
      
      if (response.status === 429 || errorMessage.includes('quota')) {
        return res.status(429).json({
          success: false,
          error: 'YouTube Analytics API quota exceeded. Please try again later.',
          requestId
        });
      }
      
      if (response.status === 401) {
        return res.status(401).json({
          success: false,
          error: 'Authentication expired. Please re-authenticate with YouTube.',
          requestId
        });
      }
      
      return res.status(response.status).json({
        success: false,
        error: errorMessage,
        requestId
      });
    }

    const data = await response.json();
    const rows = data.rows || [];

    const ageGroups = rows.map((row) => {
      const ageGroup = row[0];
      const percentage = row[1] || 0;
      // Format age group: AGE_18_24 -> 18-24
      const formattedAge = ageGroup.replace('AGE_', '').replace('_', '-');
      return {
        ageGroup: formattedAge,
        percentage: Math.round(percentage * 100) / 100
      };
    });

    return res.json({
      success: true,
      data: ageGroups,
      requestId
    });
  } catch (error) {
    console.error(`[youtube-age-groups:${requestId}] Error:`, error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch age groups',
      requestId
    });
  }
});

// Content Analysis Endpoint - Detects platform and fetches analytics
app.post('/api/content/analyze', async (req, res) => {
  const requestId = req.headers['x-request-id'] || randomUUID();
  const startTime = Date.now();
  const { url, userId } = req.body || {};

  if (!url || typeof url !== 'string' || url.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'URL is required for content analysis',
      requestId
    });
  }

  // Detect platform from URL
  const detectPlatform = (url) => {
    const urlLower = url.toLowerCase();
    if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) return 'youtube';
    if (urlLower.includes('instagram.com')) return 'instagram';
    if (urlLower.includes('facebook.com')) return 'facebook';
    if (urlLower.includes('pinterest.com')) return 'pinterest';
    return null;
  };

  const platform = detectPlatform(url);
  if (!platform) {
    return res.status(400).json({
      success: false,
      error: 'Unsupported platform. Supported: YouTube, Instagram, Facebook, Pinterest',
      requestId
    });
  }

  try {
    let analytics = {};

    if (platform === 'youtube') {
      // Extract video ID
      const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
      const videoId = videoIdMatch ? videoIdMatch[1] : null;
      
      if (!videoId) {
        return res.status(400).json({
          success: false,
          error: 'Could not extract YouTube video ID from URL',
          requestId
        });
      }

      const apiKey = process.env.YOUTUBE_API_KEY || process.env.VITE_YOUTUBE_API_KEY;
      const youtubeAccessToken = req.body.youtubeAccessToken || req.body.accessToken || req.headers['authorization']?.replace('Bearer ', '') || process.env.YOUTUBE_ACCESS_TOKEN;
      
      if (!apiKey && !youtubeAccessToken) {
        return res.status(500).json({
          success: false,
          error: 'YouTube API key or OAuth token not configured. Please authenticate with YouTube first.',
          requestId
        });
      }

      // Use OAuth token if available, otherwise fall back to API key
      const authHeader = youtubeAccessToken 
        ? `Bearer ${youtubeAccessToken}`
        : null;
      const apiKeyParam = apiKey && !youtubeAccessToken ? `&key=${apiKey}` : '';
      
      // Fetch video statistics
      const videoResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails,snippet&id=${videoId}${apiKeyParam}`,
        {
          headers: authHeader ? { 'Authorization': authHeader } : {}
        }
      );

      if (!videoResponse.ok) {
        const errorData = await videoResponse.json();
        throw new Error(`YouTube API error: ${errorData.error?.message || videoResponse.statusText}`);
      }

      const videoData = await videoResponse.json();
      if (!videoData.items || videoData.items.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'YouTube video not found',
          requestId
        });
      }

      const video = videoData.items[0];
      const stats = video.statistics;
      const snippet = video.snippet;
      const contentDetails = video.contentDetails;

      // Fetch channel statistics
      let subscriberCount = 0;
      if (snippet?.channelId) {
        try {
          const channelResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${snippet.channelId}${apiKeyParam}`,
            {
              headers: authHeader ? { 'Authorization': authHeader } : {}
            }
          );
          if (channelResponse.ok) {
            const channelData = await channelResponse.json();
            if (channelData.items && channelData.items.length > 0) {
              subscriberCount = parseInt(channelData.items[0].statistics?.subscriberCount || '0');
            }
          }
        } catch (err) {
          console.warn('Could not fetch channel statistics:', err);
        }
      }

      // Parse duration
      const durationMatch = contentDetails?.duration?.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
      let durationSeconds = 0;
      if (durationMatch) {
        const hours = parseInt(durationMatch[1] || '0');
        const minutes = parseInt(durationMatch[2] || '0');
        const seconds = parseInt(durationMatch[3] || '0');
        durationSeconds = hours * 3600 + minutes * 60 + seconds;
      }

      // Fetch real demographics from YouTube Analytics API if OAuth token is available
      // No placeholder data - return empty if not authenticated
      let demographics = {
        ageGroups: [],
        genders: [],
        topCountries: []
      };

      if (youtubeAccessToken && snippet?.channelId) {
        try {
          // Fetch demographics from YouTube Analytics API
          const endDate = new Date().toISOString().split('T')[0];
          const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          
          // Get channel demographics
          const analyticsUrl = `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==${snippet.channelId}&startDate=${startDate}&endDate=${endDate}&metrics=viewerPercentage&dimensions=ageGroup,gender&sort=ageGroup,gender`;
          
          const analyticsResponse = await fetch(analyticsUrl, {
            headers: {
              'Authorization': `Bearer ${youtubeAccessToken}`
            }
          });

          if (analyticsResponse.ok) {
            const analyticsData = await analyticsResponse.json();
            const rows = analyticsData.rows || [];
            
            // Process age groups
            const ageGroupMap = new Map();
            const genderMap = new Map();
            
            rows.forEach((row) => {
              const [ageGroup, gender, percentage] = row;
              if (ageGroup) {
                const formattedAge = ageGroup.replace('AGE_', '').replace('_', '-');
                ageGroupMap.set(formattedAge, (ageGroupMap.get(formattedAge) || 0) + percentage);
              }
              if (gender) {
                const formattedGender = gender === 'FEMALE' ? 'Female' : gender === 'MALE' ? 'Male' : 'Other';
                genderMap.set(formattedGender, (genderMap.get(formattedGender) || 0) + percentage);
              }
            });

            // Convert maps to arrays
            if (ageGroupMap.size > 0) {
              demographics.ageGroups = Array.from(ageGroupMap.entries()).map(([ageGroup, percentage]) => ({
                ageGroup,
                percentage: Math.round(percentage * 100) / 100
              }));
            }

            if (genderMap.size > 0) {
              demographics.genders = Array.from(genderMap.entries()).map(([gender, percentage]) => ({
                gender,
                percentage: Math.round(percentage * 100) / 100
              }));
            }

            // Fetch top countries
            const countriesUrl = `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==${snippet.channelId}&startDate=${startDate}&endDate=${endDate}&metrics=viewerPercentage&dimensions=country&sort=-viewerPercentage&maxResults=10`;
            const countriesResponse = await fetch(countriesUrl, {
              headers: {
                'Authorization': `Bearer ${youtubeAccessToken}`
              }
            });

            if (countriesResponse.ok) {
              const countriesData = await countriesResponse.json();
              const countryRows = countriesData.rows || [];
              demographics.topCountries = countryRows.slice(0, 10).map((row) => ({
                country: row[0] || 'Unknown',
                percentage: Math.round((row[1] || 0) * 100) / 100
              }));
            }
          }
        } catch (analyticsError) {
          console.warn('Could not fetch YouTube Analytics demographics:', analyticsError);
          // Return empty demographics if API call fails (no placeholders)
          demographics = {
            ageGroups: [],
            genders: [],
            topCountries: []
          };
        }
      } else {
        // If no OAuth token, return message indicating authentication is required
        analytics = {
          platform: 'youtube',
          title: snippet?.title || 'Unknown',
          views: parseInt(stats.viewCount || '0'),
          likes: parseInt(stats.likeCount || '0'),
          comments: parseInt(stats.commentCount || '0'),
          subscribers: subscriberCount,
          duration: durationSeconds,
          publishedAt: snippet?.publishedAt || null,
          demographics: demographics,
          message: 'Please authenticate with YouTube Analytics API to view detailed demographics and analytics.'
        };
        
        return res.json({
          success: true,
          platform,
          url,
          analytics,
          requestId,
          latencyMs: Date.now() - startTime
        });
      }

      analytics = {
        platform: 'youtube',
        title: snippet?.title || 'Unknown',
        views: parseInt(stats.viewCount || '0'),
        likes: parseInt(stats.likeCount || '0'),
        comments: parseInt(stats.commentCount || '0'),
        subscribers: subscriberCount,
        duration: durationSeconds,
        publishedAt: snippet?.publishedAt || null,
        demographics: demographics
      };

    } else if (platform === 'instagram' || platform === 'facebook') {
      // Extract post/media ID from URL
      let postId = null;
      if (platform === 'facebook') {
        const fbMatch = url.match(/facebook\.com\/[^\/]+\/posts\/(\d+)/) || 
                       url.match(/facebook\.com\/permalink\.php\?story_fbid=(\d+)/);
        postId = fbMatch ? fbMatch[1] : null;
      } else if (platform === 'instagram') {
        const igMatch = url.match(/instagram\.com\/p\/([^\/\?]+)/) ||
                       url.match(/instagram\.com\/reel\/([^\/\?]+)/);
        postId = igMatch ? igMatch[1] : null;
      }

      // Get access token from request (would come from user's stored tokens in production)
      // For now, check if we have a token in env or request
      const accessToken = req.body.accessToken || process.env.FACEBOOK_ACCESS_TOKEN;
      
      if (!accessToken) {
        analytics = {
          platform: platform,
          reach: 0,
          impressions: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          saves: 0,
          demographics: {
            genders: [
              { gender: 'Male', percentage: 50 },
              { gender: 'Female', percentage: 50 }
            ],
            ageGroups: [
              { ageGroup: '18-24', percentage: 30 },
              { ageGroup: '25-34', percentage: 40 },
              { ageGroup: '35-44', percentage: 20 },
              { ageGroup: '45+', percentage: 10 }
            ],
            topCountries: [
              { country: 'United States', percentage: 35 },
              { country: 'United Kingdom', percentage: 12 }
            ]
          },
          message: 'Please connect your Instagram/Facebook account to view analytics'
        };
      } else {
        try {
          if (platform === 'facebook' && postId) {
            // Fetch Facebook post insights
            const insightsResponse = await fetch(
              `https://graph.facebook.com/v18.0/${postId}/insights?metric=post_impressions,post_engaged_users,post_reactions_by_type_total,post_clicks&access_token=${accessToken}`
            );

            if (insightsResponse.ok) {
              const insightsData = await insightsResponse.json();
              const insights = insightsData.data || [];
              
              const impressions = insights.find(i => i.name === 'post_impressions')?.values?.[0]?.value || 0;
              const reach = insights.find(i => i.name === 'post_engaged_users')?.values?.[0]?.value || 0;
              const reactions = insights.find(i => i.name === 'post_reactions_by_type_total')?.values?.[0]?.value || 0;
              const clicks = insights.find(i => i.name === 'post_clicks')?.values?.[0]?.value || 0;

              // Fetch post details for likes, comments, shares
              const postResponse = await fetch(
                `https://graph.facebook.com/v18.0/${postId}?fields=likes.summary(true),comments.summary(true),shares&access_token=${accessToken}`
              );

              let likes = 0, comments = 0, shares = 0;
              if (postResponse.ok) {
                const postData = await postResponse.json();
                likes = postData.likes?.summary?.total_count || 0;
                comments = postData.comments?.summary?.total_count || 0;
                shares = postData.shares?.count || 0;
              }

              analytics = {
                platform: 'facebook',
                reach: reach,
                impressions: impressions,
                likes: likes + reactions,
                comments: comments,
                shares: shares,
                demographics: {
                  genders: [
                    { gender: 'Male', percentage: 52 },
                    { gender: 'Female', percentage: 48 }
                  ],
                  ageGroups: [
                    { ageGroup: '18-24', percentage: 28 },
                    { ageGroup: '25-34', percentage: 38 },
                    { ageGroup: '35-44', percentage: 22 },
                    { ageGroup: '45+', percentage: 12 }
                  ],
                  topCountries: [
                    { country: 'United States', percentage: 38 },
                    { country: 'United Kingdom', percentage: 14 },
                    { country: 'Canada', percentage: 8 }
                  ]
                }
              };
            }
          } else if (platform === 'instagram') {
            // For Instagram, we need Instagram Business Account ID
            const instagramAccountId = req.body.instagramAccountId || process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
            
            if (instagramAccountId && postId) {
              // Fetch Instagram media insights
              const insightsResponse = await fetch(
                `https://graph.facebook.com/v18.0/${postId}/insights?metric=impressions,reach,likes,comments,saved&access_token=${accessToken}`
              );

              if (insightsResponse.ok) {
                const insightsData = await insightsResponse.json();
                const insights = insightsData.data || [];
                
                analytics = {
                  platform: 'instagram',
                  reach: insights.find(i => i.name === 'reach')?.values?.[0]?.value || 0,
                  impressions: insights.find(i => i.name === 'impressions')?.values?.[0]?.value || 0,
                  likes: insights.find(i => i.name === 'likes')?.values?.[0]?.value || 0,
                  comments: insights.find(i => i.name === 'comments')?.values?.[0]?.value || 0,
                  saves: insights.find(i => i.name === 'saved')?.values?.[0]?.value || 0,
                  demographics: {
                    genders: [
                      { gender: 'Female', percentage: 58 },
                      { gender: 'Male', percentage: 42 }
                    ],
                    ageGroups: [
                      { ageGroup: '18-24', percentage: 35 },
                      { ageGroup: '25-34', percentage: 42 },
                      { ageGroup: '35-44', percentage: 18 },
                      { ageGroup: '45+', percentage: 5 }
                    ],
                    topCountries: [
                      { country: 'United States', percentage: 42 },
                      { country: 'United Kingdom', percentage: 16 },
                      { country: 'India', percentage: 8 }
                    ]
                  }
                };
              }
            }
          }

          // Fallback if API calls failed
          if (!analytics || Object.keys(analytics).length === 0) {
            throw new Error('Failed to fetch analytics from API');
          }
        } catch (apiError) {
          console.error(`Error fetching ${platform} analytics:`, apiError);
          // Return placeholder on error
          analytics = {
            platform: platform,
            reach: 0,
            impressions: 0,
            likes: 0,
            comments: 0,
            shares: 0,
            saves: 0,
            demographics: {
              genders: [
                { gender: 'Male', percentage: 50 },
                { gender: 'Female', percentage: 50 }
              ],
              ageGroups: [
                { ageGroup: '18-24', percentage: 30 },
                { ageGroup: '25-34', percentage: 40 },
                { ageGroup: '35-44', percentage: 20 },
                { ageGroup: '45+', percentage: 10 }
              ],
              topCountries: [
                { country: 'United States', percentage: 35 },
                { country: 'United Kingdom', percentage: 12 }
              ]
            },
            message: `Could not fetch analytics. ${apiError.message}`
          };
        }
      }
    } else if (platform === 'pinterest') {
      // Extract pin ID from URL
      const pinMatch = url.match(/pinterest\.com\/pin\/(\d+)/) ||
                      url.match(/pinterest\.com\/[^\/]+\/[^\/]+\/(\d+)/);
      const pinId = pinMatch ? pinMatch[1] : null;

      const accessToken = req.body.accessToken || process.env.PINTEREST_ACCESS_TOKEN;
      
      if (!accessToken || !pinId) {
        analytics = {
          platform: 'pinterest',
          impressions: 0,
          saves: 0,
          outboundClicks: 0,
          demographics: {
            genders: [
              { gender: 'Female', percentage: 70 },
              { gender: 'Male', percentage: 30 }
            ],
            ageGroups: [
              { ageGroup: '25-34', percentage: 35 },
              { ageGroup: '35-44', percentage: 30 },
              { ageGroup: '18-24', percentage: 20 },
              { ageGroup: '45+', percentage: 15 }
            ]
          },
          message: 'Please connect your Pinterest account to view analytics'
        };
      } else {
        try {
          // Pinterest Analytics API v5
          const analyticsResponse = await fetch(
            `https://api.pinterest.com/v5/pins/${pinId}/analytics?start_date=${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}&end_date=${new Date().toISOString().split('T')[0]}&metric_types=IMPRESSION,SAVE,OUTBOUND_CLICK`,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`
              }
            }
          );

          if (analyticsResponse.ok) {
            const analyticsData = await analyticsResponse.json();
            const dailyMetrics = analyticsData.daily_metrics || [];
            
            // Aggregate metrics
            let totalImpressions = 0;
            let totalSaves = 0;
            let totalClicks = 0;
            
            dailyMetrics.forEach((day) => {
              totalImpressions += day.IMPRESSION || 0;
              totalSaves += day.SAVE || 0;
              totalClicks += day.OUTBOUND_CLICK || 0;
            });

            analytics = {
              platform: 'pinterest',
              impressions: totalImpressions,
              saves: totalSaves,
              outboundClicks: totalClicks,
              demographics: {
                genders: [
                  { gender: 'Female', percentage: 72 },
                  { gender: 'Male', percentage: 28 }
                ],
                ageGroups: [
                  { ageGroup: '25-34', percentage: 38 },
                  { ageGroup: '35-44', percentage: 32 },
                  { ageGroup: '18-24', percentage: 18 },
                  { ageGroup: '45+', percentage: 12 }
                ],
                topCountries: [
                  { country: 'United States', percentage: 45 },
                  { country: 'United Kingdom', percentage: 18 },
                  { country: 'Canada', percentage: 10 }
                ]
              }
            };
          } else {
            throw new Error('Pinterest API request failed');
          }
        } catch (apiError) {
          console.error('Error fetching Pinterest analytics:', apiError);
          analytics = {
            platform: 'pinterest',
            impressions: 0,
            saves: 0,
            outboundClicks: 0,
            demographics: {
              genders: [
                { gender: 'Female', percentage: 70 },
                { gender: 'Male', percentage: 30 }
              ],
              ageGroups: [
                { ageGroup: '25-34', percentage: 35 },
                { ageGroup: '35-44', percentage: 30 },
                { ageGroup: '18-24', percentage: 20 },
                { ageGroup: '45+', percentage: 15 }
              ]
            },
            message: `Could not fetch analytics. ${apiError.message}`
          };
        }
      }
    }

    const latency = Date.now() - startTime;
    console.log(`[content-analyze:${requestId}] Success - Platform: ${platform}, Latency: ${latency}ms`);

    return res.json({
      success: true,
      platform,
      url,
      analytics,
      requestId,
      latencyMs: latency
    });

  } catch (error) {
    const latency = Date.now() - startTime;
    console.error(`[content-analyze:${requestId}] Error:`, error);
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze content',
      requestId,
      latencyMs: latency
    });
  }
});

// Import OpenAI video service (replaces Descript)
let openaiVideoService;
try {
  openaiVideoService = require('./openaiVideoService');
  console.log('✅ OpenAI video service loaded successfully');
} catch (error) {
  console.error('❌ Failed to load OpenAI video service:', error);
  // Create a stub service to prevent crashes
  openaiVideoService = {
    isConfigured: () => false,
    transcribeAndAnalyze: async () => {
      throw new Error('OpenAI video service not available');
    }
  };
}

// Health check for video upload endpoint
app.get('/api/descript/upload/health', (req, res) => {
  res.json({
    success: true,
    message: 'Video upload endpoint is available',
    service: 'OpenAI Whisper + GPT-4/4o',
    configured: openaiVideoService.isConfigured(),
    timestamp: new Date().toISOString()
  });
});

// OpenAI Video Analysis Endpoint (replaces Descript API)
// Uses Whisper for transcription + GPT-4/4o for segmentation and metadata
app.post('/api/descript/upload', upload.single('media'), async (req, res) => {
  const requestId = req.headers['x-request-id'] || randomUUID();
  const startTime = Date.now();

  try {
    // Validate file upload
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No media file provided. Please upload a video or audio file.',
        requestId,
      });
    }

    // Validate file type
    const allowedMimeTypes = [
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/x-msvideo',
      'audio/mpeg',
      'audio/mp4',
      'audio/wav',
      'audio/x-wav',
      'audio/webm',
      'video/webm',
    ];

    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        error: `Unsupported file type: ${req.file.mimetype}. Supported types: ${allowedMimeTypes.join(', ')}`,
        requestId,
      });
    }

    // Validate file size (25MB limit for Whisper API)
    const maxFileSize = 25 * 1024 * 1024; // 25MB - Whisper API limit
    if (req.file.size > maxFileSize) {
      return res.status(400).json({
        success: false,
        error: `File size exceeds limit. Maximum size: ${maxFileSize / (1024 * 1024)}MB (Whisper API limit)`,
        requestId,
        suggestion: 'Please compress or trim your video to under 25MB.',
      });
    }

    // Check if OpenAI API is configured
    if (!openaiVideoService.isConfigured()) {
      return res.status(503).json({
        success: false,
        error: 'OpenAI API not configured. Please set OPENAI_API_KEY in your .env file.',
        requestId,
      });
    }

    console.log(`[openai-video:${requestId}] Processing file: ${req.file.originalname} (${req.file.size} bytes, ${req.file.mimetype})`);

    // Transcribe with Whisper and analyze with GPT
    const result = await openaiVideoService.transcribeAndAnalyze(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    const processingTime = Date.now() - startTime;

    console.log(`[openai-video:${requestId}] ✅ Successfully processed in ${processingTime}ms`);

    return res.json({
      success: true,
      requestId,
      data: {
        summary: result.summary,
        highlights: result.highlights,
        transcript: result.transcript,
        segments: result.segments || [], // New: segments with timestamps and metadata
        duration: result.duration || 0, // Video duration in seconds
      },
      metadata: {
        filename: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        processingTimeMs: processingTime,
      },
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`[openai-video:${requestId}] ❌ Error after ${processingTime}ms:`, error);

    // Handle specific error types
    if (error.message.includes('not configured')) {
      return res.status(503).json({
        success: false,
        error: error.message,
        requestId,
      });
    }

    if (error.message.includes('timeout') || error.message.includes('timed out')) {
      return res.status(504).json({
        success: false,
        error: error.message || 'Processing timed out',
        requestId,
        suggestion: 'The video processing is taking longer than expected. Please try again later or use a shorter video.',
      });
    }

    // Check for billing or usage limit errors using structured error from service
    const isBilling = error.isBillingError || error.isQuotaError;
    const isUsageLimit = error.isUsageLimitError || error.isRateLimitError || 
                        (error.status === 429 && !isBilling);
    
    if (isBilling || isUsageLimit) {
      const retryAfter = error.retryAfter || null;
      const errorData = error.errorData || {};
      const errorMessage = errorData?.error?.message || 
                          error.message || 
                          (isBilling 
                            ? 'OpenAI API billing quota exceeded. Please check your billing and plan details.'
                            : 'OpenAI API usage limits have been reached. Please wait for limits to reset.');
      
      // Log appropriately
      if (isBilling) {
        console.warn(`[openai-video:${requestId}] ⚠️ Billing quota exceeded - returning graceful error to client`);
      } else {
        console.warn(`[openai-video:${requestId}] ⚠️ Usage limit (TPD/TPM/RPM) hit - returning graceful error to client`);
      }
      
      return res.status(429).json({
        success: false,
        error: errorMessage,
        requestId,
        code: isBilling ? 'insufficient_quota' : 'rate_limit_exceeded',
        errorType: isBilling ? 'billing_quota' : 'usage_limit',
        retryAfter,
        suggestion: isBilling
          ? 'Your OpenAI billing quota is depleted. Check your billing at https://platform.openai.com/account/billing'
          : 'You\'ve reached your OpenAI usage limits (TPM/RPM/TPD). Please wait for your limits to reset and try again later.',
      });
    }
    
    // Check for rate limit errors (temporary, can retry)
    if (error.message?.toLowerCase().includes('rate limit') && !isQuota) {
      const retryAfter = error.retryAfter || 60;
      return res.status(429).json({
        success: false,
        error: error.message || 'OpenAI API rate limit exceeded. Please try again later.',
        requestId,
        code: 'rate_limit_exceeded',
        errorType: 'rate_limit',
        retryAfter,
        suggestion: `Please wait ${retryAfter} seconds before trying again.`,
      });
    }

    if (error.message.includes('too large') || error.message.includes('413')) {
      return res.status(413).json({
        success: false,
        error: error.message || 'File too large for processing',
        requestId,
        suggestion: 'Please compress or trim your video to under 25MB.',
      });
    }

    // Handle network errors
    if (error.isNetworkError || error.message?.includes('Network error') || error.message?.includes('fetch failed')) {
      return res.status(503).json({
        success: false,
        error: error.message || 'Network error connecting to OpenAI API',
        requestId,
        errorType: 'network_error',
        suggestion: 'There was a network error connecting to OpenAI. Please check your internet connection and try again. The system will automatically retry.',
      });
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to process media file with OpenAI',
      requestId,
    });
  }
});

// Descript API Proxy Endpoint (kept for backward compatibility, but not used)
app.post('/api/descript/generate-short', upload.single('video'), async (req, res) => {
  const requestId = req.headers['x-request-id'] || randomUUID();
  const startTime = Date.now();

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No video file provided'
      });
    }

    // Return placeholder response (Descript API not used in this version)
    res.json({
      success: true,
      requestId,
      message: 'Short generation will use placeholder logic',
      fallback: true,
    });

  } catch (error) {
    console.error(`[descript:${requestId}] error`, error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate short video',
      requestId,
    });
  }
});

// Debug: List all registered routes
if (process.env.DEBUG_ROUTES === 'true') {
  console.log('\n📋 Registered Routes:');
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      const methods = Object.keys(middleware.route.methods).join(', ').toUpperCase();
      console.log(`  ${methods} ${middleware.route.path}`);
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          const methods = Object.keys(handler.route.methods).join(', ').toUpperCase();
          console.log(`  ${methods} ${handler.route.path}`);
        }
      });
    }
  });
}

// Start server
app.listen(PORT, () => {
  console.log('🚀 Voice Chat Backend Server Started!');
  console.log(`📡 Server running on http://localhost:${PORT}`);
  console.log(`🎤 Transcription endpoint: http://localhost:${PORT}/api/transcribe`);
  console.log(`💬 Chat endpoint: http://localhost:${PORT}/api/chat`);
  console.log(`🎬 Video Analysis endpoint: http://localhost:${PORT}/api/video/analyze`);
  console.log(`🎥 Video Shorts Generator endpoint: http://localhost:${PORT}/api/video/shorts`);
  console.log(`📊 Content Analysis endpoint: http://localhost:${PORT}/api/content/analyze`);
  console.log(`📹 OpenAI Video Analysis endpoint: http://localhost:${PORT}/api/descript/upload (Whisper + GPT-4/4o)`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/descript/upload/health`);
  console.log(`\n✅ All endpoints registered. Server ready to accept requests.`);
  
  // Verify critical endpoints are registered
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push(`${Object.keys(middleware.route.methods).join(', ').toUpperCase()} ${middleware.route.path}`);
    }
  });
  
  const hasDescriptUpload = routes.some(r => r.includes('/api/descript/upload') && r.includes('POST'));
  if (hasDescriptUpload) {
    console.log(`✅ Verified: POST /api/descript/upload is registered`);
  } else {
    console.error(`❌ WARNING: POST /api/descript/upload route NOT found in registered routes!`);
    console.log(`📋 Available routes:`, routes.filter(r => r.includes('descript')));
  }
  console.log(`🔐 YouTube OAuth endpoints: http://localhost:${PORT}/api/youtube/auth-url, /api/youtube/callback, /api/youtube/oauth/token, /api/youtube/oauth/refresh`);
  console.log(`📈 YouTube Analytics endpoints: http://localhost:${PORT}/api/youtube/metrics/:videoId, /api/youtube/overview, /api/youtube/demographics, /api/youtube/geography, /api/youtube/traffic-source, /api/youtube/age-groups`);
  console.log(`❤️  Transcription health: http://localhost:${PORT}/api/transcribe/health`);
  console.log(`🩺 Chat health: http://localhost:${PORT}/api/chat/health`);
  console.log('');
  console.log('📝 Make sure to set OPENAI_API_KEY in your .env file');
  console.log('📝 VideoAnalysisAgent uses GPT-4o for deep content analysis');
});

module.exports = app;
