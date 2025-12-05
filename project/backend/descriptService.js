/**
 * Descript API Service
 * 
 * Handles media upload, transcription, and analysis using Descript API
 * Documentation: https://docs.descriptapi.com/
 */

require('dotenv').config();

const DESCRIPT_API_BASE = 'https://api.descript.com/api/v1';
const DESCRIPT_API_KEY = process.env.DESCRIPT_API_KEY || process.env.VITE_DESCRIPT_API_KEY;
const DESCRIPT_PROJECT_ID = process.env.DESCRIPT_PROJECT_ID || process.env.VITE_DESCRIPT_PROJECT_ID;

// Use native fetch if available (Node 18+), otherwise use node-fetch
let fetch;
let FormData;
try {
  if (globalThis.fetch) {
    fetch = globalThis.fetch;
    FormData = globalThis.FormData;
  } else {
    fetch = require('node-fetch');
    FormData = require('form-data');
  }
} catch (e) {
  fetch = require('node-fetch');
  FormData = require('form-data');
}

/**
 * Check if Descript API is configured
 */
function isConfigured() {
  return !!(DESCRIPT_API_KEY && DESCRIPT_PROJECT_ID);
}

/**
 * Upload media file to Descript
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} filename - Original filename
 * @param {string} mimeType - File MIME type
 * @returns {Promise<{uploadId: string, projectId: string}>}
 */
async function uploadMedia(fileBuffer, filename, mimeType) {
  if (!isConfigured()) {
    throw new Error('Descript API not configured. Please set DESCRIPT_API_KEY and DESCRIPT_PROJECT_ID in your .env file.');
  }

  try {
    // Step 1: Create upload URL
    const uploadUrlResponse = await fetch(`${DESCRIPT_API_BASE}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DESCRIPT_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: filename,
        content_type: mimeType,
      }),
    });

    if (!uploadUrlResponse.ok) {
      const errorData = await uploadUrlResponse.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Failed to create upload URL: ${uploadUrlResponse.statusText}`);
    }

    const uploadData = await uploadUrlResponse.json();
    const { upload_url, upload_id } = uploadData;

    if (!upload_url || !upload_id) {
      throw new Error('Invalid response from Descript upload API');
    }

    // Step 2: Upload file to the provided URL
    const uploadResponse = await fetch(upload_url, {
      method: 'PUT',
      headers: {
        'Content-Type': mimeType,
      },
      body: fileBuffer,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload file to Descript: ${uploadResponse.statusText}`);
    }

    return {
      uploadId: upload_id,
      projectId: DESCRIPT_PROJECT_ID,
    };
  } catch (error) {
    console.error('❌ Descript upload error:', error);
    throw error;
  }
}

/**
 * Create a transcription job in Descript
 * @param {string} uploadId - Upload ID from uploadMedia
 * @returns {Promise<{jobId: string, projectId: string}>}
 */
async function createTranscriptionJob(uploadId) {
  if (!isConfigured()) {
    throw new Error('Descript API not configured');
  }

  try {
    const response = await fetch(`${DESCRIPT_API_BASE}/projects/${DESCRIPT_PROJECT_ID}/transcription`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DESCRIPT_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        upload_id: uploadId,
        language: 'en', // Default to English, can be made configurable
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Failed to create transcription job: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      jobId: data.job_id || data.id,
      projectId: DESCRIPT_PROJECT_ID,
    };
  } catch (error) {
    console.error('❌ Descript transcription job creation error:', error);
    throw error;
  }
}

/**
 * Poll transcription job until complete
 * @param {string} jobId - Transcription job ID
 * @param {number} maxWaitTime - Maximum wait time in milliseconds (default: 5 minutes)
 * @param {number} pollInterval - Poll interval in milliseconds (default: 3 seconds)
 * @returns {Promise<{status: string, transcript?: object}>}
 */
async function pollTranscriptionJob(jobId, maxWaitTime = 5 * 60 * 1000, pollInterval = 3000) {
  if (!isConfigured()) {
    throw new Error('Descript API not configured');
  }

  const startTime = Date.now();
  let lastStatus = null;

  while (Date.now() - startTime < maxWaitTime) {
    try {
      const response = await fetch(`${DESCRIPT_API_BASE}/projects/${DESCRIPT_PROJECT_ID}/transcription/${jobId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${DESCRIPT_API_KEY}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Failed to check transcription status: ${response.statusText}`);
      }

      const data = await response.json();
      const status = data.status || data.state;

      lastStatus = status;

      if (status === 'completed' || status === 'done' || status === 'success') {
        return {
          status: 'completed',
          transcript: data.transcript || data,
        };
      }

      if (status === 'failed' || status === 'error') {
        throw new Error(data.error?.message || 'Transcription job failed');
      }

      // Job is still processing, wait and poll again
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    } catch (error) {
      if (error.message.includes('Failed to check')) {
        throw error;
      }
      // Retry on network errors
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
  }

  // Timeout
  throw new Error(`Transcription job timed out after ${maxWaitTime}ms. Last status: ${lastStatus}`);
}

/**
 * Get transcript from Descript project
 * @param {string} projectId - Descript project ID
 * @returns {Promise<{transcript: string, summary?: string, highlights?: string[]}>}
 */
async function getTranscript(projectId) {
  if (!isConfigured()) {
    throw new Error('Descript API not configured');
  }

  try {
    // Get project metadata which includes transcript
    const response = await fetch(`${DESCRIPT_API_BASE}/projects/${projectId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${DESCRIPT_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Failed to get transcript: ${response.statusText}`);
    }

    const projectData = await response.json();
    
    // Extract transcript text
    let transcript = '';
    let summary = '';
    let highlights = [];

    // Descript API structure may vary, try multiple possible paths
    if (projectData.transcript) {
      if (typeof projectData.transcript === 'string') {
        transcript = projectData.transcript;
      } else if (projectData.transcript.text) {
        transcript = projectData.transcript.text;
      } else if (projectData.transcript.content) {
        transcript = projectData.transcript.content;
      }
    }

    // Try to get summary if available
    if (projectData.summary) {
      summary = typeof projectData.summary === 'string' 
        ? projectData.summary 
        : projectData.summary.text || '';
    }

    // Try to get highlights/key moments if available
    if (projectData.highlights) {
      highlights = Array.isArray(projectData.highlights)
        ? projectData.highlights
        : projectData.highlights.items || [];
    } else if (projectData.key_moments) {
      highlights = Array.isArray(projectData.key_moments)
        ? projectData.key_moments
        : projectData.key_moments.items || [];
    }

    return {
      transcript: transcript || 'Transcript not available',
      summary: summary || undefined,
      highlights: highlights.length > 0 ? highlights : undefined,
    };
  } catch (error) {
    console.error('❌ Descript get transcript error:', error);
    throw error;
  }
}

/**
 * Complete workflow: Upload, transcribe, and get results
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} filename - Original filename
 * @param {string} mimeType - File MIME type
 * @returns {Promise<{summary: string, highlights: string[], transcript: string}>}
 */
async function uploadAndTranscribe(fileBuffer, filename, mimeType) {
  try {
    console.log('📤 Uploading media to Descript...');
    const { uploadId, projectId } = await uploadMedia(fileBuffer, filename, mimeType);
    console.log(`✅ Upload successful. Upload ID: ${uploadId}`);

    console.log('🔄 Creating transcription job...');
    const { jobId } = await createTranscriptionJob(uploadId);
    console.log(`✅ Transcription job created. Job ID: ${jobId}`);

    console.log('⏳ Waiting for transcription to complete...');
    await pollTranscriptionJob(jobId);
    console.log('✅ Transcription completed');

    console.log('📄 Retrieving transcript...');
    const result = await getTranscript(projectId);
    console.log('✅ Transcript retrieved');

    return {
      summary: result.summary || 'No summary available',
      highlights: result.highlights || [],
      transcript: result.transcript,
    };
  } catch (error) {
    console.error('❌ Descript workflow error:', error);
    throw error;
  }
}

module.exports = {
  isConfigured,
  uploadMedia,
  createTranscriptionJob,
  pollTranscriptionJob,
  getTranscript,
  uploadAndTranscribe,
};


