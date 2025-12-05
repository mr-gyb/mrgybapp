interface VideoAnalysisResult {
  summary: string;
  keyPoints: string[];
  suggestedShorts: {
    title: string;
    description: string;
    startTime: number;
    endTime: number;
    reasoning: string;
  }[];
  duration: number;
  transcript?: string;
  // New structured data
  technicalInfo?: {
    fileSize: string;
    duration: string;
    quality: string;
    productionValues: string;
  };
  mainTheme?: string;
  keyLessons?: {
    heading: string;
    content: string;
    timestamp: string;
  }[];
  stories?: {
    title: string;
    description: string;
    significance: string;
  }[];
  frameworks?: {
    name: string;
    steps: string[];
    description: string;
  }[];
  callToAction?: string;
  // New fields for enhanced analysis
  keyMoments?: {
    title: string;
    description: string;
    timestamp: string;
  }[];
  bestSegment?: {
    title: string;
    description: string;
    timestamp: string;
    reasoning: string;
  };
  actionableSuggestions?: {
    title: string;
    description: string;
    impact: string;
  }[];
  // Additional fields for summary page
  suggestedEdits?: {
    title: string;
    description: string;
    reasoning: string;
    priority: 'high' | 'medium' | 'low';
  }[];
  revisedScript?: {
    originalScript: string;
    revisedScript: string;
    changes: string[];
  };
  whatChanged?: {
    section: string;
    original: string;
    revised: string;
    reason: string;
  }[];
}

interface OpenAIResponse {
  summary: string;
  keyPoints: string[];
  suggestedShorts: {
    title: string;
    description: string;
    startTime: number;
    endTime: number;
    reasoning: string;
  }[];
  duration: number;
  transcript?: string;
}

class OpenAIService {
  private apiKey: string;
  private videoApiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    // Use video API key if provided, otherwise fall back to regular API key
    this.videoApiKey = import.meta.env.VITE_OPENAI_VIDEO_API_KEY || this.apiKey;
    
    if (!this.apiKey) {
      console.warn('OpenAI API key not found. Please set VITE_OPENAI_API_KEY in your .env file.');
    }
    
    if (!this.videoApiKey) {
      console.warn('OpenAI Video API key not found. Please set VITE_OPENAI_VIDEO_API_KEY or VITE_OPENAI_API_KEY in your .env file.');
    }
  }

  /**
   * Analyze a video file and generate summary with suggested shorts
   */
  async analyzeVideo(videoFile: File): Promise<VideoAnalysisResult> {
    // Check if any API key is configured
    if (!this.videoApiKey && !this.apiKey) {
      throw new Error('OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in your .env file.');
    }

    try {
      // Use the ChatGPT GPT for video summarization
      const analysis = await this.processVideoWithGPT(videoFile);
      return analysis;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Handle 404 errors specifically
      if (errorMessage.includes('404') || errorMessage.includes('ENDPOINT_NOT_FOUND') || errorMessage.includes('not found')) {
        console.error('❌ Endpoint not found. Backend server may need to be restarted.');
        throw new Error('The video processing endpoint is not available. Please ensure the backend server is running and has been restarted to load the latest routes.');
      }
      
      // Check if it's an authentication error
      if (errorMessage.includes('401')) {
        console.warn('OpenAI API key is invalid or expired');
        throw new Error('OpenAI API key is invalid or expired. Please check your API configuration.');
      }
      
      // Only log non-quota errors (quota errors are handled in UI)
      if (!errorMessage.toLowerCase().includes('quota') && !errorMessage.toLowerCase().includes('insufficient_quota')) {
        console.error('Error analyzing video with OpenAI:', error);
      } else {
        // Quota errors are expected and handled in UI - just log as warning
        console.warn('⚠️ Video analysis quota error - error displayed in UI');
      }
      
      // For other errors, provide a helpful message
      throw new Error(`Video analysis failed: ${errorMessage}`);
    }
  }

  /**
   * Process video with complete OpenAI workflow: Extract audio → Whisper transcription → GPT analysis
   * Now uses the backend /api/descript/upload endpoint which handles the full pipeline
   */
  private async processVideoWithGPT(videoFile: File): Promise<VideoAnalysisResult> {
    const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB limit
    
    // Validate file
    if (!videoFile || videoFile.size === 0) {
      throw new Error('Video file is empty. Please upload a valid video file.');
    }
    
    if (videoFile.size > MAX_FILE_SIZE) {
      const fileSizeMB = (videoFile.size / (1024 * 1024)).toFixed(2);
      throw new Error(`Video file is too large (${fileSizeMB}MB). Maximum size is 25MB. Please compress or use a shorter video.`);
    }
    
    return this.retryWithBackoff(async () => {
      const startTime = Date.now();
      console.log('🎬 Starting complete video processing workflow...');
      console.log('📁 Video file:', videoFile.name, 'Size:', (videoFile.size / (1024 * 1024)).toFixed(2), 'MB');
      
      const formData = new FormData();
      formData.append('media', videoFile);

      console.log('🎤 Sending video to backend for transcription and analysis...');
      
      // Use backend endpoint that handles full pipeline
      const backendUrl = import.meta.env.VITE_CHAT_API_BASE?.replace('/api', '') || 'http://localhost:8080';
      
      let response: Response;
      try {
        response = await fetch(`${backendUrl}/api/descript/upload`, {
          method: 'POST',
          body: formData
        });
      } catch (fetchError) {
        // Log full error details
        console.error('❌ Video upload fetch error details:', {
          message: fetchError instanceof Error ? fetchError.message : String(fetchError),
          name: fetchError instanceof Error ? fetchError.name : undefined,
          stack: fetchError instanceof Error ? fetchError.stack : undefined,
          cause: fetchError instanceof Error ? (fetchError as any).cause : undefined
        });
        
        const errorMsg = fetchError instanceof Error ? fetchError.message : String(fetchError);
        if (errorMsg.includes('fetch failed') || errorMsg.includes('NetworkError')) {
          throw new Error(`Network error: Unable to connect to backend server. Please check your internet connection and ensure the backend is running.`);
        }
        throw new Error(`Video processing failed: ${errorMsg}`);
      }

      if (!response.ok) {
        const contentType = response.headers.get('content-type') || '';
        const isJson = contentType.includes('application/json');
        let errorText: string;
        let errorMessage = `Video processing error: ${response.status} ${response.statusText}`;
        
        // Safely get response text
        try {
          errorText = await response.text();
        } catch (textError) {
          errorText = `Failed to read error response: ${textError}`;
        }
        
        // Log full error details
        console.error('❌ Video processing API error details:', {
          status: response.status,
          statusText: response.statusText,
          contentType,
          isJson,
          errorText: errorText.substring(0, 500), // Limit log size
          headers: Object.fromEntries(response.headers.entries())
        });
        
        // Handle 404 specifically
        if (response.status === 404) {
          errorMessage = `Endpoint not found: /api/descript/upload. The backend server may need to be restarted, or the endpoint may not be available. Please check that the backend server is running and the route is registered.`;
          const error = new Error(errorMessage);
          (error as any).status = 404;
          (error as any).errorType = 'not_found';
          throw error;
        }
        
        // Handle 503 (Service Unavailable) - network errors, retryable
        if (response.status === 503) {
          let errorData: any = {};
          // Try to parse error message from JSON
          if (isJson && errorText) {
            try {
              errorData = JSON.parse(errorText);
              errorMessage = errorData.error || errorData.message || 'Network error connecting to OpenAI API';
            } catch {
              errorMessage = 'Network error connecting to OpenAI API. Please check your internet connection and try again.';
            }
          } else {
            errorMessage = 'Network error connecting to OpenAI API. Please check your internet connection and try again.';
          }
          
          const error = new Error(errorMessage);
          (error as any).status = 503;
          (error as any).errorType = 'network_error';
          (error as any).isRetryable = true;
          throw error; // Will be caught by retryWithBackoff
        }
        
        // Try to parse error details only if it's JSON
        if (isJson && errorText) {
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.error?.message) {
              errorMessage = errorData.error.message;
            } else if (errorData.error?.detail) {
              errorMessage = errorData.error.detail;
            } else if (errorData.error) {
              errorMessage = typeof errorData.error === 'string' ? errorData.error : JSON.stringify(errorData.error);
            } else if (errorData.message) {
              errorMessage = errorData.message;
            } else if (errorData.detail) {
              errorMessage = errorData.detail;
            }
          } catch (parseError) {
            // If JSON parsing fails, use the text as-is (but sanitize HTML)
            if (errorText.startsWith('<!DOCTYPE') || errorText.startsWith('<html')) {
              errorMessage = `Server returned HTML instead of JSON. This usually means the endpoint doesn't exist (404) or there's a server error. Status: ${response.status}`;
            } else {
              errorMessage = errorText.substring(0, 200); // Use first 200 chars of error text
            }
            console.warn('Could not parse video processing error response as JSON:', parseError);
          }
        } else if (errorText && !isJson) {
          // Handle HTML or plain text responses
          if (errorText.startsWith('<!DOCTYPE') || errorText.startsWith('<html')) {
            errorMessage = `Server returned HTML (likely 404 page). The endpoint /api/descript/upload may not exist. Please check that the backend server is running and the route is registered.`;
          } else {
            errorMessage = errorText.substring(0, 200);
          }
        }
        
        // Parse error data to check error type
        let errorData: any = {};
        if (isJson && errorText) {
          try {
            errorData = JSON.parse(errorText);
          } catch {
            // Ignore parse errors, use defaults
          }
        }
        
        // Check error type from backend
        const isBilling = errorData.errorType === 'billing_quota';
        const isUsageLimit = errorData.errorType === 'usage_limit' || errorData.errorType === 'rate_limit';
        const isNetwork = errorData.errorType === 'network_error' || response.status === 503;
        
        // Only log non-quota/network errors
        if (isBilling || isUsageLimit) {
          console.warn(`⚠️ Video processing ${isBilling ? 'billing' : 'usage limit'} error - error displayed in UI`);
        } else if (isNetwork) {
          console.warn('⚠️ Network error - will retry automatically');
        } else {
          console.error('❌ Video processing error:', response.status, response.statusText);
        }
        
        const error = new Error(errorMessage);
        (error as any).status = response.status;
        (error as any).errorType = errorData.errorType || (isNetwork ? 'network_error' : 'unknown');
        (error as any).isRetryable = isNetwork || (response.status >= 500 && response.status < 600);
        throw error;
      }

      // Safely parse JSON response
      let result: any;
      try {
        const responseText = await response.text();
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ Failed to parse response as JSON:', parseError);
        throw new Error('Server returned invalid JSON response. Please check the backend server logs.');
      }
      
      if (!result.success || !result.data) {
        throw new Error(result.error?.message || result.error || 'Video processing failed: No data returned');
      }
      
      const duration = Date.now() - startTime;
      console.log(`✅ Complete video processing workflow finished in ${(duration / 1000).toFixed(2)}s`);
      
      // Transform backend response to frontend format
      return {
        summary: result.data.summary || '',
        keyPoints: result.data.highlights || [],
        suggestedShorts: (result.data.segments || []).map((seg: any) => ({
          title: seg.title || '',
          description: seg.description || seg.caption || '',
          startTime: seg.startTime || seg.start || 0,
          endTime: seg.endTime || seg.end || 0,
          reasoning: seg.reasoning || seg.description || '',
        })),
        duration: result.data.duration || 0,
        transcript: result.data.transcript || '',
      };
    }, 'processVideoWithGPT').catch((error) => {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorType = (error as any)?.errorType;
      const isBilling = errorType === 'billing_quota';
      const isUsageLimit = errorType === 'usage_limit' || errorType === 'rate_limit';
      const isNetwork = errorType === 'network_error' || (error as any)?.status === 503;
      
      // Only log non-quota/network errors
      if (isBilling || isUsageLimit) {
        console.warn(`⚠️ Video processing ${isBilling ? 'billing' : 'usage limit'} error - error displayed in UI`);
      } else if (isNetwork) {
        console.warn('⚠️ Network error - will retry automatically');
      } else {
        console.error('❌ Error in video processing workflow:', {
          message: errorMessage,
          error: error,
          stack: error instanceof Error ? error.stack : undefined
        });
      }
      
      throw error;
    });
  }

  /**
   * Extract audio from video file
   * Note: Whisper API can accept video files directly and will extract audio automatically
   * So we can pass the video file as-is to the backend
   */
  private async extractAudioFromVideo(videoFile: File): Promise<Blob> {
    // Whisper API accepts video files and extracts audio automatically
    // So we can use the video file directly without client-side extraction
    console.log('🎵 Using video file directly (Whisper API will extract audio)');
    return videoFile;
  }

  /**
   * Retry wrapper with exponential backoff for frontend
   */
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    context: string,
    maxRetries: number = 2, // Reduced from 3 to 2 for faster failures
    delays: number[] = [500, 1000] // Reduced delays: 0.5s, 1s (was 1s, 2s, 4s)
  ): Promise<T> {
    let lastError: Error | unknown;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        // Check if error is retryable
        const errorMessage = error instanceof Error ? error.message : String(error);
        const status = (error as any)?.status || (error as any)?.response?.status;
        
        // Check if error is retryable
        const isNetworkError = errorMessage.includes('fetch failed') ||
                              errorMessage.includes('Network error') ||
                              errorMessage.includes('timeout') ||
                              errorMessage.includes('ECONNREFUSED') ||
                              errorMessage.includes('ENOTFOUND') ||
                              errorMessage.includes('EPIPE') ||
                              errorMessage.includes('UND_ERR_SOCKET') ||
                              status === 503 ||
                              (error as any)?.errorType === 'network_error' ||
                              (error as any)?.isRetryable === true;
        
        const isRetryable = isNetworkError || (status >= 500 && status < 600);
        
        if (attempt < maxRetries && isRetryable) {
          const delay = delays[attempt] || delays[delays.length - 1];
          const errorType = (error as any)?.errorType || (isNetworkError ? 'network_error' : 'server_error');
          const retryMsg = errorType === 'network_error' 
            ? `Network error detected, retrying...`
            : `Server error (${status}), retrying...`;
          console.warn(`⚠️ ${context} ${retryMsg} (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${(delay/1000).toFixed(1)}s...`, {
            error: errorMessage.substring(0, 100),
            status,
            errorType
          });
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        throw error;
      }
    }
    
    throw lastError;
  }

  /**
   * Transcribe audio using backend proxy (avoids CORS issues)
   * Now uses the video analysis endpoint which handles transcription + analysis
   */
  private async transcribeAudioWithWhisper(audioBlob: Blob): Promise<string> {
      const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB limit for Whisper API
      const fileSize = audioBlob.size;
      
    // Validate file
    if (!audioBlob || fileSize === 0) {
      throw new Error('Audio file is empty. Please upload a valid audio or video file.');
    }
    
    if (fileSize > MAX_FILE_SIZE) {
      const errorMsg = `Audio file is too large (${(fileSize / (1024 * 1024)).toFixed(2)}MB). Maximum size is 25MB. Please use a shorter video or compress the file.`;
      console.error('❌', errorMsg);
      throw new Error(errorMsg);
    }
    
    return this.retryWithBackoff(async () => {
      const startTime = Date.now();
      console.log('🎤 Preparing audio for Whisper API...');
      console.log('📦 Audio file size:', (fileSize / (1024 * 1024)).toFixed(2), 'MB');
      
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.mp3');

      console.log('🎤 Sending audio to backend transcription endpoint...');
      
      // Use backend proxy endpoint to avoid CORS issues
      const backendUrl = import.meta.env.VITE_CHAT_API_BASE?.replace('/api', '') || 'http://localhost:8080';
      
      let response: Response;
      try {
        response = await fetch(`${backendUrl}/api/transcribe`, {
        method: 'POST',
        body: formData
      });
      } catch (fetchError) {
        // Log full error details
        console.error('❌ Fetch error details:', {
          message: fetchError instanceof Error ? fetchError.message : String(fetchError),
          name: fetchError instanceof Error ? fetchError.name : undefined,
          stack: fetchError instanceof Error ? fetchError.stack : undefined,
          cause: fetchError instanceof Error ? (fetchError as any).cause : undefined
        });
        
        const errorMsg = fetchError instanceof Error ? fetchError.message : String(fetchError);
        if (errorMsg.includes('fetch failed') || errorMsg.includes('NetworkError')) {
          throw new Error(`Network error: Unable to connect to backend server. Please check your internet connection and ensure the backend is running.`);
        }
        throw new Error(`Transcription failed: ${errorMsg}`);
      }

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Transcription error: ${response.status} ${response.statusText}`;
        
        // Log full error details
        console.error('❌ Transcription API error details:', {
          status: response.status,
          statusText: response.statusText,
          errorText,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        // Try to parse error details for better messaging
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          } else if (errorData.error) {
            errorMessage = typeof errorData.error === 'string' ? errorData.error : JSON.stringify(errorData.error);
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          }
        } catch (parseError) {
          console.warn('Could not parse transcription error response:', parseError);
        }
        
        // Only log non-quota errors for debugging (quota errors are handled in UI)
        if (!errorMessage.toLowerCase().includes('quota') && !errorMessage.toLowerCase().includes('insufficient_quota')) {
          console.error('❌ Transcription error:', response.status, response.statusText, errorText);
        } else {
          console.warn('⚠️ OpenAI quota exceeded - error displayed in UI');
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      const transcript = result.text || result.transcript || '';
      
      if (!transcript) {
        throw new Error('No transcript returned from backend. The audio may be too quiet or unclear.');
      }
      
      const duration = Date.now() - startTime;
      console.log(`✅ Whisper transcription completed in ${(duration / 1000).toFixed(2)}s`);
      console.log('📝 Transcript length:', transcript.length, 'characters');
      return transcript;
    }, 'transcribeAudioWithWhisper').catch((error) => {
      // Preserve the original error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Only log non-quota errors (quota errors are handled in UI)
      if (!errorMessage.toLowerCase().includes('quota') && !errorMessage.toLowerCase().includes('insufficient_quota')) {
        console.error('❌ Error transcribing audio:', {
          message: errorMessage,
          error: error,
          stack: error instanceof Error ? error.stack : undefined
        });
      } else {
        console.warn('⚠️ Audio transcription quota error - error displayed in UI');
      }
      
      // Only wrap if it's not already wrapped
      if (errorMessage.includes('Audio transcription failed:') || errorMessage.includes('Transcription failed:')) {
        throw error;
      } else {
        throw new Error(`Audio transcription failed: ${errorMessage}`);
      }
    });
  }

  /**
   * Analyze transcript using backend VideoAnalysisAgent
   */
  private async analyzeTranscriptWithGPT(transcript: string, videoFile: File): Promise<VideoAnalysisResult> {
    try {
      const videoInfo = {
        name: videoFile.name,
        size: (videoFile.size / (1024 * 1024)).toFixed(2),
        type: videoFile.type,
        duration: this.estimateVideoDuration(videoFile.size)
      };

      console.log('🧠 Step 3: Analyzing transcript with VideoAnalysisAgent...');
      
      // Call backend VideoAnalysisAgent endpoint
      const backendUrl = import.meta.env.VITE_CHAT_API_BASE?.replace('/api', '') || 'http://localhost:8080';
      const response = await fetch(`${backendUrl}/api/video/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: transcript
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Video analysis error: ${response.status} ${response.statusText}`;
        
        // Try to parse error details
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (parseError) {
          console.warn('Could not parse analysis error response:', parseError);
        }
        
        // Only log non-quota errors (quota errors are handled in UI)
        if (!errorMessage.toLowerCase().includes('quota') && !errorMessage.toLowerCase().includes('insufficient_quota')) {
          console.error('❌ Video analysis error:', response.status, response.statusText, errorText);
        } else {
          console.warn('⚠️ Video analysis quota error - error displayed in UI');
        }
        throw new Error(errorMessage);
      }

      const analysisData = await response.json();
      
      if (!analysisData.success) {
        throw new Error(analysisData.error || 'Video analysis failed');
      }
      
      console.log('✅ VideoAnalysisAgent analysis completed');
      
      // Map backend response to VideoAnalysisResult format
      // Convert improvements array to suggestedEdits format
      const suggestedEdits = (analysisData.improvements || []).map((improvement: string, index: number) => {
        // Try to parse improvement string (format: "Title: Description")
        const parts = improvement.split(':');
        const title = parts[0]?.trim() || `Improvement ${index + 1}`;
        const description = parts.slice(1).join(':').trim() || improvement;
        
        return {
          title: title,
          description: description,
          reasoning: description,
          priority: index < 2 ? 'high' : 'medium' as 'high' | 'medium' | 'low'
        };
      });
      
      // Convert revisedScript (string) to revisedScript object format
      const revisedScriptObj = analysisData.revisedScript ? {
        originalScript: transcript.substring(0, 1000) + '...',
        revisedScript: analysisData.revisedScript,
        changes: analysisData.improvements || []
      } : undefined;
      
      return {
        summary: analysisData.summary || 'Video analysis completed',
        keyPoints: analysisData.keyPoints || [],
        suggestedShorts: [], // Not provided by new agent
        duration: videoInfo.duration,
        transcript: analysisData.rawTranscript || transcript.substring(0, 500) + '...',
        // Map improvements to suggestedEdits
        suggestedEdits: suggestedEdits,
        revisedScript: revisedScriptObj,
        whatChanged: [], // Not provided by new agent, can be derived from improvements
        // Legacy fields (optional)
        technicalInfo: {
          fileSize: `${videoInfo.size} MB`,
          duration: `${Math.floor(videoInfo.duration / 60)}:${(videoInfo.duration % 60).toString().padStart(2, '0')}`,
          quality: 'Analysis completed',
          productionValues: 'Analysis completed'
        },
        mainTheme: analysisData.summary?.substring(0, 100) || '',
        keyLessons: [],
        stories: [],
        frameworks: [],
        callToAction: '',
        keyMoments: [],
        bestSegment: undefined,
        actionableSuggestions: []
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Only log non-quota errors (quota errors are handled in UI)
      if (!errorMessage.toLowerCase().includes('quota') && !errorMessage.toLowerCase().includes('insufficient_quota')) {
        console.error('❌ Error analyzing transcript with VideoAnalysisAgent:', error);
      } else {
        console.warn('⚠️ Video analysis quota error - error displayed in UI');
      }
      throw error;
    }
  }




  private estimateVideoDuration(fileSize: number): number {
    // Rough estimation: 1MB ≈ 1 minute for typical video compression
    const estimatedMinutes = Math.max(1, Math.round(fileSize / (1024 * 1024)));
    return estimatedMinutes * 60; // Convert to seconds
  }


  /**
   * Generate a script for a specific short video segment
   */
  async generateScriptForShort(shortData: {
    title: string;
    description: string;
    startTime: number;
    endTime: number;
    originalTranscript: string;
  }): Promise<string> {
    // Check if any API key is configured
    if (!this.videoApiKey && !this.apiKey) {
      throw new Error('OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in your .env file.');
    }

    try {
      // Simulate script generation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return `🎬 ${shortData.title}

${shortData.description}

[Opening Hook - 0-3 seconds]
"Did you know that 90% of people fail at their goals? Here's the secret that changed everything..."

[Main Content - 3-12 seconds]
"${shortData.description}"

[Call to Action - 12-15 seconds]
"Follow for more tips like this! What's your biggest challenge? Comment below!"

#productivity #goals #success #motivation #tips`;
    } catch (error) {
      console.error('Error generating script:', error);
      throw new Error('Failed to generate script');
    }
  }

  /**
   * Check if OpenAI service is properly configured
   */
  isConfigured(): boolean {
    // Can use either video API key or regular API key
    return !!(this.videoApiKey || this.apiKey);
  }
}

export const openaiService = new OpenAIService();
export type { VideoAnalysisResult, OpenAIResponse };
