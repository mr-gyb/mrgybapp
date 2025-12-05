/**
 * OpenAI Video Analysis Service
 * 
 * Replaces Descript API with OpenAI Whisper + GPT-4/4o pipeline
 * - Uses Whisper API for transcription with timestamps
 * - Uses GPT-4/4o for content segmentation and metadata generation
 */

require('dotenv').config();

// Use native fetch if available (Node 18+), otherwise use node-fetch
let fetch;
let FormData;
try {
  if (globalThis.fetch) {
    fetch = globalThis.fetch;
    FormData = globalThis.FormData;
    console.log('[openai-video] ✅ Using native fetch and FormData (Node 18+)');
  } else {
    fetch = require('node-fetch');
    FormData = require('form-data');
    console.log('[openai-video] ✅ Using node-fetch and form-data');
  }
} catch (e) {
  fetch = require('node-fetch');
  FormData = require('form-data');
  console.log('[openai-video] ✅ Using node-fetch and form-data (fallback)');
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
// Use o3-mini - cheapest high-quota GPT-3-tier model
const GPT_MODEL = process.env.OPENAI_VIDEO_MODEL || 'o3-mini';

// Constants
const MAX_FILE_SIZE_MB = 25; // Whisper API limit
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;
const MAX_RETRIES = 6; // Increased retries for rate limits
const RETRY_DELAYS = [3000, 6000, 12000, 24000, 48000, 96000]; // Exponential backoff: 3s, 6s, 12s, 24s, 48s, 96s
const TRANSCRIPTION_TIMEOUT_MS = 300000; // 5 minutes
const GPT_TIMEOUT_MS = 60000; // 1 minute (reduced for faster failures)

// Supported audio/video formats
const SUPPORTED_AUDIO_FORMATS = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/webm', 'audio/m4a', 'audio/ogg'];
const SUPPORTED_VIDEO_FORMATS = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/mpeg'];

/**
 * Sleep utility for retry delays
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if error is a billing error (not retryable)
 * Only triggers on EXPLICIT billing keywords, not generic quota messages
 * 
 * Key: "exceeded your current quota" = usage limit, NOT billing
 * Only explicit billing terms like "billing quota", "credit", "payment method" = billing
 */
function isBillingError(error) {
  const errorData = error?.errorData || {};
  const errorMsg = (errorData?.error?.message || error?.message || '').toLowerCase();
  
  // If message says "exceeded your current quota" or "quota exceeded", it's a usage limit
  // (even if it mentions "billing" in the help text)
  if (errorMsg.includes('exceeded your current quota') || errorMsg.includes('quota exceeded')) {
    return false; // This is a usage limit, not billing
  }
  
  // Only treat as billing if message EXPLICITLY mentions billing-related terms
  // (not just in generic help text)
  return (
    errorMsg.includes('billing quota') ||
    errorMsg.includes('credit') ||
    errorMsg.includes('payment method') ||
    errorMsg.includes('no active subscription') ||
    errorMsg.includes('subscription expired') ||
    errorMsg.includes('payment required') ||
    (errorMsg.includes('billing') && !errorMsg.includes('check your plan and billing'))
  );
}

/**
 * Check if error is a usage limit error (TPD/TPM/RPM) - retryable
 */
function isUsageLimitError(error, status) {
  const errorData = error?.errorData || {};
  const errorMsg = (errorData?.error?.message || error?.message || '').toLowerCase();
  const errorCode = errorData?.error?.code || '';
  const errorType = errorData?.error?.type || '';
  
  // 429 status usually means usage limit (unless it's explicitly billing)
  if (status === 429 && !isBillingError(error)) {
    return true;
  }
  
  // Check for usage limit keywords (but NOT billing keywords)
  if (isBillingError(error)) {
    return false; // Explicit billing error, not usage limit
  }
  
  return (
    errorMsg.includes('quota exceeded') ||
    errorMsg.includes('exceeded your current quota') ||
    errorMsg.includes('limit') ||
    errorMsg.includes('rate') ||
    errorCode === 'insufficient_quota' || // Generic quota = usage limit unless billing keywords present
    errorType === 'insufficient_quota'
  );
}

/**
 * Check if error is retryable (network errors, 500-599, timeouts, usage limits)
 * NOTE: Billing errors are NOT retryable, usage limits ARE retryable
 */
function isRetryableError(error, status) {
  // Billing errors - NEVER retryable
  if (isBillingError(error)) {
    return false;
  }
  
  // Network errors - always retryable
  if (error && (
    error.message?.includes('fetch failed') ||
    error.message?.includes('Network error') ||
    error.code === 'ENOTFOUND' ||
    error.code === 'ECONNREFUSED' ||
    error.code === 'ETIMEDOUT' ||
    error.name === 'AbortError'
  )) {
    return true;
  }
  
  // Usage limit errors (429) - retryable with backoff
  if (isUsageLimitError(error, status)) {
    return true;
  }
  
  // Server errors (500-599) - retryable
  if (status >= 500 && status < 600) {
    return true;
  }
  
  return false;
}

/**
 * Retry wrapper with exponential backoff for usage limit errors
 * Handles usage limits (429) and network errors, but NOT billing errors
 */
async function withRetry(fn, retries = 2, context = 'operation') { // Reduced from 3 to 2 retries for speed
  try {
    return await fn();
  } catch (error) {
    const status = error.status || error.response?.status || (error.response?.ok === false ? 500 : null);
    
    // Check if it's actually a usage limit (429 + "exceeded quota" = usage limit, not billing)
    const errorMsg = (error?.errorData?.error?.message || error?.message || '').toLowerCase();
    const isExceededQuota = errorMsg.includes('exceeded your current quota') || errorMsg.includes('quota exceeded');
    const isUsageLimit = (status === 429 && isExceededQuota) || error.isUsageLimitError || isUsageLimitError(error, status);
    const isBilling = error.isBillingError || (isBillingError(error) && !isExceededQuota);
    
    // Never retry billing errors
    if (isBilling && !isExceededQuota) {
      console.error(`[openai-video] ❌ ${context} failed: Billing quota exceeded (not retryable)`, {
        message: error.message,
        status: status
      });
      throw error;
    }
    
    // Retry usage limit errors (including "exceeded your current quota")
    if (isUsageLimit && retries > 0) {
      const delay = (3 - retries) * 500; // Faster: 0.5s, 1s (was 1s, 2s, 3s, 4s, 5s)
      console.warn(`[openai-video] ⚠️ ${context} hit usage limit (attempt ${3 - retries + 1}/3), retrying in ${(delay/1000).toFixed(1)}s...`);
      await sleep(delay);
      return withRetry(fn, retries - 1, context);
    }
    
    // Retry network/server errors
    const isNetworkError = error.isNetworkError || 
                          error.message?.includes('Network error') ||
                          error.message?.includes('fetch failed') ||
                          error.code === 'EPIPE' ||
                          error.code === 'UND_ERR_SOCKET' ||
                          error.code === 'ENOTFOUND' ||
                          error.code === 'ECONNREFUSED';
    
    if ((isRetryableError(error, status) || isNetworkError) && retries > 0) {
      // Faster retries for network errors: 0.3s, 0.6s, 0.9s
      const networkDelays = [300, 600, 900];
      const delay = isNetworkError 
        ? (networkDelays[3 - retries] || networkDelays[networkDelays.length - 1])
        : (RETRY_DELAYS[3 - retries] || RETRY_DELAYS[RETRY_DELAYS.length - 1]);
      const errorType = isNetworkError ? 'network error' : 'error';
      console.warn(`[openai-video] ⚠️ ${context} ${errorType} (attempt ${3 - retries + 1}/3), retrying in ${(delay/1000).toFixed(1)}s...`);
      await sleep(delay);
      return withRetry(fn, retries - 1, context);
    }
    
    // Ensure error has proper structure before throwing
    if (isNetworkError && !error.isNetworkError) {
      error.isNetworkError = true;
      error.status = error.status || 503;
      error.errorType = 'network_error';
    }
    
    throw error;
  }
}

/**
 * Legacy wrapper for backward compatibility
 */
async function retryWithBackoff(fn, context = 'operation') {
  return withRetry(fn, MAX_RETRIES, context);
}

/**
 * Detects if an OpenAI error is billing or usage limit related
 * Returns object with isBilling, isUsageLimit, and isRetryable
 */
function analyzeBillingOrUsageError(status, errorData) {
  const errorType = errorData?.error?.type || errorData?.error?.code;
  const errorCode = errorData?.error?.code;
  const message = (errorData?.error?.message || errorData?.message || '').toLowerCase();
  
  const result = {
    isBilling: false,        // Billing quota (not retryable)
    isUsageLimit: false,     // Usage limit TPD/TPM/RPM (retryable)
    isRetryable: false,
    errorType: 'unknown'
  };
  
  // Check for usage limit FIRST (429 or "exceeded your current quota")
  // "exceeded your current quota" = usage limit, even if message mentions "billing" in help text
  if (
    status === 429 ||
    message.includes('exceeded your current quota') ||
    message.includes('quota exceeded') ||
    message.includes('limit') ||
    message.includes('rate') ||
    errorCode === 'insufficient_quota' ||
    errorType === 'insufficient_quota'
  ) {
    // Double-check: if it's EXPLICITLY billing (not just generic help text), it's billing
    const isExplicitBilling = (
      message.includes('billing quota') ||
      message.includes('credit') ||
      message.includes('payment method') ||
      message.includes('no active subscription') ||
      message.includes('subscription expired') ||
      message.includes('payment required')
    );
    
    if (!isExplicitBilling) {
      result.isUsageLimit = true;
      result.isRetryable = true;
      result.errorType = 'usage_limit';
      return result;
    }
  }
  
  // Check for EXPLICIT billing error (must have explicit billing keywords)
  const hasBillingKeywords = (
    message.includes('billing quota') ||
    message.includes('credit') ||
    message.includes('payment method') ||
    message.includes('no active subscription') ||
    message.includes('subscription expired') ||
    message.includes('payment required') ||
    (message.includes('billing') && !message.includes('check your plan and billing'))
  );
  
  if (hasBillingKeywords) {
    result.isBilling = true;
    result.isRetryable = false;
    result.errorType = 'billing_quota';
    return result;
  }
  
  return result;
}

/**
 * Legacy function for backward compatibility
 * Detects if an OpenAI error is billing quota-related
 */
function isQuotaError(status, errorData) {
  const analysis = analyzeBillingOrUsageError(status, errorData);
  return analysis.isBilling; // Only billing quota
}

/**
 * Extracts retry-after information from response headers or error
 */
function extractRetryAfter(response, errorData) {
  let retryAfterHeader = null;
  if (response?.headers) {
    if (typeof response.headers.get === 'function') {
      retryAfterHeader = response.headers.get('retry-after');
    } else if (response.headers['retry-after']) {
      retryAfterHeader = response.headers['retry-after'];
    }
  }
  
  if (retryAfterHeader) {
    const seconds = parseInt(retryAfterHeader, 10);
    if (!isNaN(seconds)) return seconds;
  }
  
  const message = (errorData?.error?.message || errorData?.message || '').toLowerCase();
  const retryMatch = message.match(/retry.*?(\d+)\s*(?:second|minute|hour)/i);
  if (retryMatch) {
    return parseInt(retryMatch[1], 10);
  }
  
  return null;
}

/**
 * Validate file before processing
 */
function validateFile(fileBuffer, filename, mimeType) {
  // Check file is not empty
  if (!fileBuffer || fileBuffer.length === 0) {
    throw new Error('File is empty. Please upload a valid audio or video file.');
  }
  
  // Check file size
  const fileSizeMB = fileBuffer.length / (1024 * 1024);
  if (fileBuffer.length > MAX_FILE_SIZE) {
    throw new Error(`File is too large (${fileSizeMB.toFixed(2)}MB). Maximum size is ${MAX_FILE_SIZE_MB}MB. Please compress or use a shorter file.`);
  }
  
  // Check file format
  const isAudio = SUPPORTED_AUDIO_FORMATS.some(format => mimeType.includes(format.split('/')[1]));
  const isVideo = SUPPORTED_VIDEO_FORMATS.some(format => mimeType.includes(format.split('/')[1]));
  
  if (!isAudio && !isVideo) {
    const supportedFormats = [...SUPPORTED_AUDIO_FORMATS, ...SUPPORTED_VIDEO_FORMATS].join(', ');
    throw new Error(`Unsupported file format: ${mimeType}. Supported formats: ${supportedFormats}`);
  }
  
  console.log(`[openai-video] ✅ File validated: ${filename} (${fileSizeMB.toFixed(2)}MB, ${mimeType})`);
}

/**
 * Check if OpenAI API is configured
 */
function isConfigured() {
  return !!OPENAI_API_KEY;
}

/**
 * Transcribe audio/video using OpenAI Whisper API with timestamps
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} filename - Original filename
 * @param {string} mimeType - File MIME type
 * @returns {Promise<{text: string, segments: Array, duration: number}>}
 */
async function transcribeWithWhisper(fileBuffer, filename, mimeType) {
  if (!isConfigured()) {
    throw new Error('OpenAI API not configured. Please set OPENAI_API_KEY in your .env file.');
  }

  // Validate file
  validateFile(fileBuffer, filename, mimeType);

  return retryWithBackoff(async () => {
    const startTime = Date.now();
    console.log(`[openai-video] 🎤 Transcribing with OpenAI Whisper... (${(fileBuffer.length / (1024 * 1024)).toFixed(2)}MB)`);

    // Create FormData
    const formData = new FormData();
    
    // Append file - handle both native FormData and form-data package
    const hasNativeFormData = FormData.prototype.append.length === 2;
    const hasBlob = typeof Blob !== 'undefined';
    const hasFile = typeof File !== 'undefined';
    
    if (hasNativeFormData && hasBlob && hasFile) {
      const blob = new Blob([fileBuffer], { type: mimeType });
      const file = new File([blob], filename, { type: mimeType });
      formData.append('file', file);
    } else {
      formData.append('file', fileBuffer, {
        filename: filename,
        contentType: mimeType
      });
    }
    
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');
    formData.append('response_format', 'verbose_json');
    formData.append('temperature', '0.0');

    // Prepare headers
    const headers = {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    };
    
    if (formData.getHeaders) {
      Object.assign(headers, formData.getHeaders());
    }

    // Add timeout
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), TRANSCRIPTION_TIMEOUT_MS) : null;
    
    let response;
    try {
      const fetchOptions = {
        method: 'POST',
        headers: headers,
        body: formData,
      };
      
      if (controller) {
        fetchOptions.signal = controller.signal;
      }
      
      response = await fetch(`${OPENAI_BASE_URL}/audio/transcriptions`, fetchOptions);
      
      if (timeoutId) clearTimeout(timeoutId);
    } catch (fetchError) {
      if (timeoutId) clearTimeout(timeoutId);
      
      // Log full error details
      console.error('[openai-video] ❌ Fetch error details:', {
        message: fetchError.message,
        name: fetchError.name,
        code: fetchError.code,
        cause: fetchError.cause,
        stack: fetchError.stack
      });
      
      if (controller && fetchError.name === 'AbortError') {
        const timeoutError = new Error('Transcription request timed out after 5 minutes. The file may be too large.');
        timeoutError.status = 504;
        timeoutError.isNetworkError = true;
        throw timeoutError;
      }
      
      const errorMsg = fetchError.message || String(fetchError);
      const networkError = new Error(`Network error calling OpenAI API: ${errorMsg}. Please check your internet connection and OpenAI API status.`);
      networkError.status = 503;
      networkError.isNetworkError = true;
      networkError.code = fetchError.code;
      networkError.cause = fetchError.cause;
      
      if (errorMsg.includes('fetch failed') || fetchError.code === 'ENOTFOUND' || fetchError.code === 'ECONNREFUSED' || fetchError.code === 'EPIPE' || fetchError.code === 'UND_ERR_SOCKET') {
        throw networkError;
      }
      throw networkError;
    }

    if (!response.ok) {
      // Safe JSON parsing - fallback to text for HTML errors
      let errorData = {};
      try {
        const text = await response.text();
        try {
          errorData = JSON.parse(text);
        } catch {
          // Not JSON, use text as error message
          errorData = { error: { message: text.substring(0, 200) } };
        }
      } catch {
        errorData = {};
      }
      const errorMessage = errorData.error?.message || `Whisper API error: ${response.statusText}`;
      
      // Log full error details
      console.error('[openai-video] ❌ API error details:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        headers: Object.fromEntries(response.headers.entries() || [])
      });
      
      // Create structured error
      const error = new Error(errorMessage);
      error.status = response.status;
      error.errorData = errorData;
      
      // Check error type - prioritize "exceeded your current quota" as usage limit
      const errorMsg = (errorData?.error?.message || errorMessage || '').toLowerCase();
      const isExceededQuota = errorMsg.includes('exceeded your current quota') || errorMsg.includes('quota exceeded');
      
      let analysis;
      if (isExceededQuota && response.status === 429) {
        // "exceeded your current quota" with 429 = usage limit, NOT billing
        analysis = {
          isBilling: false,
          isUsageLimit: true,
          isRetryable: true,
          errorType: 'usage_limit'
        };
      } else {
        analysis = analyzeBillingOrUsageError(response.status, errorData);
      }
      
      error.isBillingError = analysis.isBilling; // Billing quota
      error.isUsageLimitError = analysis.isUsageLimit; // Usage limit TPD/TPM/RPM
      error.isQuotaError = analysis.isBilling; // Legacy compatibility
      error.isRateLimitError = analysis.isUsageLimit; // Legacy compatibility
      error.errorType = analysis.errorType;
      error.retryAfter = extractRetryAfter(response, errorData);
      
      // Re-throw to trigger retry if retryable
      throw error;
    }

    // Safe JSON parsing
    let result;
    try {
      const text = await response.text();
      result = JSON.parse(text);
    } catch (parseError) {
      throw new Error(`Failed to parse Whisper response: ${parseError.message}`);
    }
    const duration = Date.now() - startTime;
    
    console.log(`[openai-video] ✅ Transcription completed in ${(duration / 1000).toFixed(2)}s`);

    return {
      text: result.text || '',
      segments: result.segments || [],
      duration: result.duration || 0,
    };
  }, 'transcribeWithWhisper');
}

/**
 * Analyze transcript and generate segments with GPT-4/4o
 */
async function analyzeWithGPT(transcript, segments, duration) {
  if (!isConfigured()) {
    throw new Error('OpenAI API not configured');
  }

  return retryWithBackoff(async () => {
    const startTime = Date.now();
    console.log(`[openai-video] 🤖 Analyzing transcript with ${GPT_MODEL}...`);

    // Optimized prompt - significantly reduced token usage
    // Strategy: Only include key segments (not full transcript), limit segment text length
    const segmentCount = segments.length;
    const maxSegments = 10; // Reduced from 15 to 10 for faster processing
    const keySegments = segments.slice(0, Math.min(maxSegments, segmentCount));
    
    // Limit each segment text to 60 chars for faster processing
    const segmentsContext = keySegments.map((seg, idx) => 
      `[${idx + 1}] ${formatTimestamp(seg.start)}-${formatTimestamp(seg.end)}: ${seg.text.substring(0, 60)}${seg.text.length > 60 ? '...' : ''}`
    ).join('\n');
    
    // Truncate transcript more aggressively (keep first 1000 chars for speed)
    const transcriptPreview = transcript.length > 1000 
      ? transcript.substring(0, 1000) + '... [truncated]'
      : transcript;
    
    // Compact prompt - removed verbose instructions
    const prompt = `Analyze video and generate highlights.

TRANSCRIPT: ${transcriptPreview}
SEGMENTS: ${segmentsContext}
DURATION: ${formatTimestamp(duration)}

Return JSON:
{
  "summary": "2-3 sentence summary",
  "highlights": ["highlight 1", "highlight 2"],
  "segments": [{
    "startTime": 0,
    "endTime": 0,
    "title": "title",
    "caption": "caption",
    "description": "description",
    "hashtags": ["tag1"],
    "hook": "hook text"
  }]
}`;

    // Add timeout
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), GPT_TIMEOUT_MS) : null;
    
    let response;
    try {
      const fetchOptions = {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: GPT_MODEL,
          messages: [
            {
              role: 'system',
              content: 'You are a professional video content analyst. Always return valid JSON only, no markdown formatting.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.5, // Reduced from 0.7 for faster, more deterministic responses
          max_tokens: 1500, // Reduced from 2000 for faster responses
        }),
      };
      
      if (controller) {
        fetchOptions.signal = controller.signal;
      }
      
      response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, fetchOptions);
      
      if (timeoutId) clearTimeout(timeoutId);
    } catch (fetchError) {
      if (timeoutId) clearTimeout(timeoutId);
      
      // Log full error details
      console.error('[openai-video] ❌ GPT fetch error details:', {
        message: fetchError.message,
        name: fetchError.name,
        code: fetchError.code,
        cause: fetchError.cause,
        stack: fetchError.stack
      });
      
      if (controller && fetchError.name === 'AbortError') {
        const timeoutError = new Error('GPT analysis request timed out after 2 minutes.');
        timeoutError.status = 504;
        timeoutError.isNetworkError = true;
        throw timeoutError;
      }
      
      const errorMsg = fetchError.message || String(fetchError);
      const networkError = new Error(`Network error calling OpenAI API: ${errorMsg}. Please check your internet connection and OpenAI API status.`);
      networkError.status = 503;
      networkError.isNetworkError = true;
      networkError.code = fetchError.code;
      networkError.cause = fetchError.cause;
      
      if (errorMsg.includes('fetch failed') || fetchError.code === 'ENOTFOUND' || fetchError.code === 'ECONNREFUSED' || fetchError.code === 'EPIPE' || fetchError.code === 'UND_ERR_SOCKET') {
        throw networkError;
      }
      throw networkError;
    }

    if (!response.ok) {
      // Safe JSON parsing - fallback to text for HTML errors
      let errorData = {};
      try {
        const text = await response.text();
        try {
          errorData = JSON.parse(text);
        } catch {
          // Not JSON, use text as error message
          errorData = { error: { message: text.substring(0, 200) } };
        }
      } catch {
        errorData = {};
      }
      const errorMessage = errorData.error?.message || `GPT API error: ${response.statusText}`;
      
      // Log full error details
      console.error('[openai-video] ❌ GPT API error details:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        headers: Object.fromEntries(response.headers.entries() || [])
      });
      
      // Create structured error
      const error = new Error(errorMessage);
      error.status = response.status;
      error.errorData = errorData;
      
      // Check error type - prioritize "exceeded your current quota" as usage limit
      const errorMsg = (errorData?.error?.message || errorMessage || '').toLowerCase();
      const isExceededQuota = errorMsg.includes('exceeded your current quota') || errorMsg.includes('quota exceeded');
      
      let analysis;
      if (isExceededQuota && response.status === 429) {
        // "exceeded your current quota" with 429 = usage limit, NOT billing
        analysis = {
          isBilling: false,
          isUsageLimit: true,
          isRetryable: true,
          errorType: 'usage_limit'
        };
      } else {
        analysis = analyzeBillingOrUsageError(response.status, errorData);
      }
      
      error.isBillingError = analysis.isBilling;
      error.isUsageLimitError = analysis.isUsageLimit;
      error.isQuotaError = analysis.isBilling; // Legacy compatibility
      error.isRateLimitError = analysis.isUsageLimit; // Legacy compatibility
      error.errorType = analysis.errorType;
      error.retryAfter = extractRetryAfter(response, errorData);
      
      throw error;
    }

    // Safe JSON parsing
    let result;
    try {
      const text = await response.text();
      result = JSON.parse(text);
    } catch (parseError) {
      throw new Error(`Failed to parse GPT response: ${parseError.message}`);
    }
    const content = result.choices?.[0]?.message?.content || '{}';
    
    // Parse JSON response
    let analysis;
    try {
      // Remove markdown code blocks if present
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysis = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('[openai-video] ❌ Failed to parse GPT response:', parseError);
      console.error('[openai-video] Raw response:', content);
      throw new Error('Failed to parse GPT analysis response. The model may have returned invalid JSON.');
    }
    
    const duration = Date.now() - startTime;
    console.log(`[openai-video] ✅ GPT analysis completed in ${(duration / 1000).toFixed(2)}s`);

    return {
      summary: analysis.summary || '',
      highlights: analysis.highlights || [],
      segments: analysis.segments || [],
    };
  }, 'analyzeWithGPT');
}

/**
 * Format timestamp in seconds to MM:SS format
 */
function formatTimestamp(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Main function: Transcribe and analyze video
 * Wrapped in queue to prevent concurrent processing
 */
async function transcribeAndAnalyze(fileBuffer, filename, mimeType) {
  // Import queue (lazy load to avoid circular dependencies)
  const videoQueue = require('./videoProcessingQueue');
  
  // Enqueue the job to ensure sequential processing
  return videoQueue.enqueue(async () => {
    const overallStartTime = Date.now();
    
    try {
      console.log(`[openai-video] 🚀 Starting video analysis pipeline for: ${filename}`);
      
      // Step 1: Transcribe
      const transcription = await transcribeWithWhisper(fileBuffer, filename, mimeType);
      
      if (!transcription.text) {
        throw new Error('Transcription returned empty text. The audio may be too quiet or unclear.');
      }
      
      // Step 2: Analyze
      const analysis = await analyzeWithGPT(
        transcription.text,
        transcription.segments,
        transcription.duration
      );
      
      const overallDuration = Date.now() - overallStartTime;
      console.log(`[openai-video] ✅ Complete pipeline finished in ${(overallDuration / 1000).toFixed(2)}s`);
      
      return {
        transcript: transcription.text,
        segments: transcription.segments,
        duration: transcription.duration,
        summary: analysis.summary,
        highlights: analysis.highlights,
        segments: analysis.segments,
      };
    } catch (error) {
      const overallDuration = Date.now() - overallStartTime;
      
      // Check error type - prioritize "exceeded your current quota" as usage limit
      const errorMsg = (error?.errorData?.error?.message || error?.message || '').toLowerCase();
      const isExceededQuota = errorMsg.includes('exceeded your current quota') || errorMsg.includes('quota exceeded');
      
      // If it says "exceeded your current quota", it's ALWAYS a usage limit, not billing
      const isUsageLimit = isExceededQuota || error.isUsageLimitError || error.isRateLimitError;
      const isBilling = !isExceededQuota && (error.isBillingError || error.isQuotaError);
      
      if (isBilling) {
        console.warn(`[openai-video] ⚠️ Billing quota exceeded after ${(overallDuration / 1000).toFixed(2)}s:`, {
          message: error.message,
          status: error.status
        });
      } else if (isUsageLimit) {
        console.warn(`[openai-video] ⚠️ Usage limit (TPD/TPM/RPM) hit after ${(overallDuration / 1000).toFixed(2)}s:`, {
          message: error.message,
          status: error.status,
          errorType: error.errorType || 'usage_limit'
        });
      } else {
        // Log full error details for non-quota errors
        console.error('[openai-video] ❌ Pipeline error details:', {
          message: error.message,
          status: error.status,
          name: error.name,
          code: error.code,
          duration: `${(overallDuration / 1000).toFixed(2)}s`
        });
      }
      
      // Re-throw with structured error for endpoint handling
      // Prioritize "exceeded your current quota" as usage limit (errorMsg already declared above)
      const structuredError = new Error(error.message || 'Video processing failed');
      
      // Check for network errors
      const isNetworkError = error.isNetworkError || 
                            error.message?.includes('Network error') ||
                            error.message?.includes('fetch failed') ||
                            error.code === 'EPIPE' ||
                            error.code === 'UND_ERR_SOCKET' ||
                            error.code === 'ENOTFOUND' ||
                            error.code === 'ECONNREFUSED';
      
      structuredError.status = error.status || (isNetworkError ? 503 : 500);
      structuredError.errorData = error.errorData;
      structuredError.isNetworkError = isNetworkError;
      structuredError.code = error.code;
      structuredError.cause = error.cause;
      
      // "exceeded your current quota" = usage limit, NOT billing
      if (isExceededQuota) {
        structuredError.isBillingError = false;
        structuredError.isUsageLimitError = true;
        structuredError.isQuotaError = false;
        structuredError.isRateLimitError = true;
        structuredError.errorType = 'usage_limit';
      } else if (isNetworkError) {
        // Network errors
        structuredError.isBillingError = false;
        structuredError.isUsageLimitError = false;
        structuredError.isQuotaError = false;
        structuredError.isRateLimitError = false;
        structuredError.errorType = 'network_error';
      } else {
        structuredError.isBillingError = error.isBillingError || false;
        structuredError.isUsageLimitError = error.isUsageLimitError || false;
        structuredError.isQuotaError = error.isBillingError || false;
        structuredError.isRateLimitError = error.isUsageLimitError || false;
        structuredError.errorType = error.errorType || 'unknown';
      }
      
      structuredError.retryAfter = error.retryAfter;
      throw structuredError;
    }
  });
}

module.exports = {
  transcribeAndAnalyze,
  isConfigured,
  MAX_FILE_SIZE_MB,
};
