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
   */
  private async processVideoWithGPT(videoFile: File): Promise<VideoAnalysisResult> {
    try {
      console.log('🎬 Starting complete video processing workflow...');
      console.log('📁 Video file:', videoFile.name, 'Size:', (videoFile.size / (1024 * 1024)).toFixed(2), 'MB');
      
      // Step 1: Extract audio from video
      console.log('🎵 Step 1: Extracting audio from video...');
      const audioBlob = await this.extractAudioFromVideo(videoFile);
      
      // Step 2: Transcribe audio using Whisper
      console.log('🎤 Step 2: Transcribing audio with Whisper...');
      const transcript = await this.transcribeAudioWithWhisper(audioBlob);
      console.log('📝 Transcript length:', transcript.length, 'characters');
      
      // Step 3: Analyze transcript with GPT-4
      console.log('🧠 Step 3: Analyzing transcript with GPT-4...');
      const analysis = await this.analyzeTranscriptWithGPT(transcript, videoFile);
      
      console.log('✅ Complete video processing workflow finished');
      return analysis;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      // Only log non-quota errors (quota errors are handled in UI)
      if (!errorMessage.toLowerCase().includes('quota') && !errorMessage.toLowerCase().includes('insufficient_quota')) {
        console.error('❌ Error in video processing workflow:', error);
      } else {
        // Quota errors are expected and handled in UI - just log as warning
        console.warn('⚠️ Video processing quota error - error displayed in UI');
      }
      throw error;
    }
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
   * Transcribe audio using backend proxy (avoids CORS issues)
   */
  private async transcribeAudioWithWhisper(audioBlob: Blob): Promise<string> {
    try {
      const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB limit for Whisper API
      const fileSize = audioBlob.size;
      
      console.log('🎤 Preparing audio for Whisper API...');
      console.log('📦 Audio file size:', (fileSize / (1024 * 1024)).toFixed(2), 'MB');
      
      // Check file size before sending
      if (fileSize > MAX_FILE_SIZE) {
        const errorMsg = `Audio file is too large (${(fileSize / (1024 * 1024)).toFixed(2)}MB). Whisper API has a 25MB limit. Please use a shorter video or compress the video file first.`;
        console.error('❌', errorMsg);
        throw new Error(errorMsg);
      }
      
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.mp3');

      console.log('🎤 Sending audio to backend transcription endpoint...');
      
      // Use backend proxy endpoint to avoid CORS issues
      const backendUrl = import.meta.env.VITE_CHAT_API_BASE?.replace('/api', '') || 'http://localhost:8080';
      const response = await fetch(`${backendUrl}/api/transcribe`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Transcription error: ${response.status} ${response.statusText}`;
        
        // Try to parse error details for better messaging
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.ok === false && errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (parseError) {
          // If parsing fails, use the original error message
          console.warn('Could not parse transcription error response:', parseError);
        }
        
        // Only log non-quota errors for debugging (quota errors are handled in UI)
        if (!errorMessage.toLowerCase().includes('quota') && !errorMessage.toLowerCase().includes('insufficient_quota')) {
          console.error('❌ Transcription error:', response.status, response.statusText, errorText);
        } else {
          // Log quota errors as warnings (they're expected and handled in UI)
          console.warn('⚠️ OpenAI quota exceeded - error displayed in UI');
        }
        // Throw the parsed error message (which includes the exact OpenAI error message)
        throw new Error(errorMessage);
      }

      const result = await response.json();
      const transcript = result.text || result.transcript || '';
      
      if (!transcript) {
        throw new Error('No transcript returned from backend');
      }
      
      console.log('✅ Whisper transcription completed');
      console.log('📝 Transcript length:', transcript.length, 'characters');
      return transcript;

    } catch (error) {
      // Preserve the original error message (which should already include the parsed OpenAI error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Only log non-quota errors (quota errors are handled in UI)
      if (!errorMessage.toLowerCase().includes('quota') && !errorMessage.toLowerCase().includes('insufficient_quota')) {
        console.error('❌ Error transcribing audio:', error);
      } else {
        // Quota errors are expected and handled in UI - just log as warning
        console.warn('⚠️ Audio transcription quota error - error displayed in UI');
      }
      
      // Only wrap if it's not already wrapped
      if (errorMessage.includes('Audio transcription failed:')) {
        throw error; // Already wrapped, re-throw as-is
      } else {
        throw new Error(`Audio transcription failed: ${errorMessage}`);
      }
    }
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
