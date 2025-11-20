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
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    this.videoApiKey = import.meta.env.VITE_OPENAI_VIDEO_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('OpenAI API key not found. Please set VITE_OPENAI_API_KEY in your .env file.');
    }
    
    if (!this.videoApiKey) {
      console.warn('OpenAI Video API key not found. Please set VITE_OPENAI_VIDEO_API_KEY in your .env file.');
    }
  }

  /**
   * Analyze a video file and generate summary with suggested shorts
   */
  async analyzeVideo(videoFile: File): Promise<VideoAnalysisResult> {
    if (!this.videoApiKey) {
      throw new Error('OpenAI Video API key not configured');
    }

    try {
      // Use the ChatGPT GPT for video summarization
      const analysis = await this.processVideoWithGPT(videoFile);
      return analysis;
    } catch (error) {
      console.error('Error analyzing video with OpenAI:', error);
      
      // Check if it's an authentication error
      if (error instanceof Error && error.message && error.message.includes('401')) {
        console.warn('OpenAI API key is invalid or expired');
        throw new Error('OpenAI API key is invalid or expired. Please check your API configuration.');
      }
      
      // For other errors, provide a helpful message
      throw new Error(`Video analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      console.error('❌ Error in video processing workflow:', error);
      throw error;
    }
  }

  /**
   * Extract audio from video file
   * Note: Whisper API accepts video files directly, but has a 25MB limit
   * For files larger than 25MB, we need to extract and compress audio
   */
  private async extractAudioFromVideo(videoFile: File): Promise<Blob> {
    const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB limit for Whisper API
    const fileSize = videoFile.size;
    
    console.log('🎵 Processing video file for audio extraction...');
    console.log('📹 File size:', (fileSize / (1024 * 1024)).toFixed(2), 'MB');
    console.log('📹 File type:', videoFile.type);
    
    // Check file size upfront
    if (fileSize > MAX_FILE_SIZE) {
      const errorMsg = `Video file is too large (${(fileSize / (1024 * 1024)).toFixed(2)}MB). Whisper API has a 25MB file size limit. Please compress your video or use a shorter video. You can use online tools like CloudConvert or HandBrake to compress your video before uploading.`;
      console.error('❌', errorMsg);
      throw new Error(errorMsg);
    }
    
    // Whisper API accepts video files directly (mp4, webm, etc.)
    // So we can send the video file as-is if it's under the size limit
    console.log('✅ Video file is within size limit, will send directly to Whisper API');
    console.log('ℹ️ Whisper API accepts video files and will extract audio automatically');
    
    return videoFile;
  }

  /**
   * Transcribe audio using OpenAI Whisper API via backend proxy (to avoid CORS)
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
      
      // Determine file name based on blob type
      // Whisper API accepts both audio and video files
      let fileName = 'audio.mp4';
      
      if (audioBlob.type.includes('webm')) {
        fileName = 'audio.webm';
      } else if (audioBlob.type.includes('ogg')) {
        fileName = 'audio.ogg';
      } else if (audioBlob.type.includes('mp4')) {
        fileName = 'video.mp4'; // Can be video or audio
      } else if (audioBlob.type.includes('quicktime') || audioBlob.type.includes('mov')) {
        fileName = 'video.mov';
      } else if (audioBlob.type.includes('x-matroska') || audioBlob.type.includes('mkv')) {
        fileName = 'video.mkv';
      } else if (audioBlob.type.includes('mp3')) {
        fileName = 'audio.mp3';
      } else if (audioBlob.type.includes('wav')) {
        fileName = 'audio.wav';
      }
      
      // Use backend proxy to avoid CORS issues
      const proxyUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const formData = new FormData();
      formData.append('file', audioBlob, fileName);
      formData.append('language', 'en');
      formData.append('response_format', 'text');

      console.log('🎤 Sending audio to backend proxy for Whisper API...');
      console.log('📤 File type:', audioBlob.type, 'Size:', (fileSize / (1024 * 1024)).toFixed(2), 'MB');
      console.log('🔗 Proxy URL:', `${proxyUrl}/api/openai/transcribe`);
      
      const response = await fetch(`${proxyUrl}/api/openai/transcribe`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        let errorMessage = `Transcription failed: ${response.status} ${response.statusText}`;
        
        // Try to parse error response
        try {
          const errorJson = await response.json();
          if (errorJson.message) {
            errorMessage = errorJson.message;
          } else if (errorJson.error) {
            errorMessage = errorJson.error;
          }
        } catch (e) {
          // If not JSON, try text
          try {
            const errorText = await response.text();
            if (errorText) {
              errorMessage = errorText;
            }
          } catch (e2) {
            // Use default error message
          }
        }
        
        console.error('❌ Transcription error:', response.status, errorMessage);
        
        // Provide user-friendly error messages
        if (response.status === 413) {
          errorMessage = `File too large (${(fileSize / (1024 * 1024)).toFixed(2)}MB). Whisper API has a 25MB limit. Please compress your video or use a shorter video.`;
        } else if (response.status === 401 || response.status === 500) {
          if (errorMessage.includes('API key')) {
            errorMessage = 'OpenAI API key is invalid or expired. Please check your VITE_OPENAI_VIDEO_API_KEY in the .env file.';
          } else {
            errorMessage = 'Server configuration error. Please check that the backend server is running and OpenAI API key is configured.';
          }
        } else if (response.status === 429) {
          errorMessage = 'Rate limit exceeded. Please try again in a few moments.';
        } else if (response.status === 502 || response.status === 503) {
          errorMessage = 'OpenAI service is temporarily unavailable. Please try again later.';
        }
        
        throw new Error(errorMessage);
      }

      const transcript = await response.text();
      console.log('✅ Whisper transcription completed');
      console.log('📝 Transcript length:', transcript.length, 'characters');
      return transcript;

    } catch (error) {
      console.error('❌ Error transcribing audio:', error);
      // Re-throw the error with helpful message
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        throw new Error('Failed to connect to transcription service. Please ensure the backend server is running on port 3000.');
      }
      throw new Error(`Audio transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Analyze transcript with GPT-4 to create structured summary
   */
  private async analyzeTranscriptWithGPT(transcript: string, videoFile: File): Promise<VideoAnalysisResult> {
    try {
      const videoInfo = {
        name: videoFile.name,
        size: (videoFile.size / (1024 * 1024)).toFixed(2),
        type: videoFile.type,
        duration: this.estimateVideoDuration(videoFile.size)
      };

      // Check if transcript is valid
      if (!transcript || transcript.trim().length < 10) {
        console.warn('⚠️ Transcript is too short or empty, analysis may be limited');
        return {
          summary: 'Video analysis completed, but transcript was too short or unclear to provide detailed insights. Please ensure your video has clear audio.',
          keyPoints: ['Transcript was too short for detailed analysis', 'Please check audio quality and try again'],
          suggestedShorts: [],
          duration: videoInfo.duration,
          transcript: transcript || 'No transcript available',
          technicalInfo: {
            fileSize: `${videoInfo.size} MB`,
            duration: `${Math.floor(videoInfo.duration / 60)}:${(videoInfo.duration % 60).toString().padStart(2, '0')}`,
            quality: 'Transcript too short for quality assessment',
            productionValues: 'Unable to assess due to short transcript'
          },
          mainTheme: 'Unable to determine theme due to short transcript',
          suggestedEdits: [],
          revisedScript: undefined,
          whatChanged: [],
          actionableSuggestions: []
        };
      }

      const prompt = `You are an expert video content analyst specializing in creating accurate, detailed summaries that capture the true essence and key points of video content. Your task is to analyze the provided video transcript and create a comprehensive, accurate summary.

VIDEO DETAILS:
- Name: ${videoInfo.name}
- Size: ${videoInfo.size} MB
- Type: ${videoInfo.type}
- Duration: ${Math.floor(videoInfo.duration / 60)}:${(videoInfo.duration % 60).toString().padStart(2, '0')}

TRANSCRIPT:
${transcript}

CRITICAL INSTRUCTIONS:
1. You MUST respond with ONLY valid JSON. No text before or after the JSON.
2. Base your analysis EXCLUSIVELY on the actual transcript content provided above.
3. Do NOT make assumptions or add generic content not present in the transcript.
4. If the transcript is short or unclear, acknowledge this limitation in your analysis.
5. Focus on accurately capturing what was actually said in the video.

ANALYSIS REQUIREMENTS:
- Create a summary that accurately reflects the actual content of the video
- Extract key points that are genuinely mentioned in the transcript
- Identify the main theme based on what was actually discussed
- Provide specific, actionable suggestions based on the actual content
- If the transcript is incomplete or unclear, note this in your analysis

IMPORTANT: You MUST respond with ONLY valid JSON. Start your response with { and end with }.

Respond with ONLY this JSON structure:
{
  "summary": "Accurate, detailed summary based EXCLUSIVELY on the transcript content provided. Capture the main themes, key points, and actual content discussed in the video.",
  "keyPoints": ["Extract 3-5 key points that are actually mentioned in the transcript", "Focus on specific insights or information shared", "Avoid generic statements not supported by the content"],
  "mainTheme": "The core message or primary focus as actually discussed in the video",
  "duration": ${videoInfo.duration},
  "transcript": "${transcript.substring(0, 1000)}...",
  "suggestedEdits": [
    {
      "title": "Specific editing recommendation based on actual content",
      "description": "Detailed suggestion based on what was actually said in the video",
      "reasoning": "Why this improvement would help, based on the actual content",
      "priority": "high"
    }
  ],
  "revisedScript": {
    "originalScript": "Key excerpts from the actual transcript",
    "revisedScript": "Improved version based on the actual content, with specific enhancements",
    "changes": ["Specific changes made based on actual content", "Focus on real improvements to the actual script"]
  },
  "whatChanged": [
    {
      "section": "Specific section from the actual video",
      "original": "Actual content from the transcript",
      "revised": "Improved version based on the actual content",
      "reason": "Specific reason for the change based on the actual content"
    }
  ],
  "suggestedShorts": [
    {
      "title": "Segment title based on actual content",
      "description": "What this segment actually contains",
      "startTime": 0,
      "endTime": 15,
      "reasoning": "Why this segment is valuable based on actual content"
    }
  ],
  "technicalInfo": {
    "fileSize": "${videoInfo.size} MB",
    "duration": "${Math.floor(videoInfo.duration / 60)}:${(videoInfo.duration % 60).toString().padStart(2, '0')}",
    "quality": "Assessment based on transcript clarity and content",
    "productionValues": "Evaluation based on actual content structure"
  },
  "actionableSuggestions": [
    {
      "title": "Suggestion based on actual content",
      "description": "Specific recommendation based on what was actually discussed",
      "impact": "Expected improvement based on actual content analysis"
    }
  ]
}`;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.videoApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an expert video content analyst specializing in creating detailed, structured summaries with clear formatting and actionable insights. Provide comprehensive analysis with professional formatting.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 4000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ GPT-4 API error:', response.status, response.statusText, errorText);
        throw new Error(`GPT-4 API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      console.log('✅ GPT-4 analysis completed');
      
      // Parse the JSON response
      try {
        // Clean the content to extract JSON
        let jsonContent = content.trim();
        
        // If the response starts with text before JSON, extract just the JSON part
        const jsonStart = jsonContent.indexOf('{');
        const jsonEnd = jsonContent.lastIndexOf('}');
        
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
          jsonContent = jsonContent.substring(jsonStart, jsonEnd + 1);
        }
        
        const parsedContent = JSON.parse(jsonContent);
        console.log('✅ Successfully parsed GPT-4 response');
        
        // Validate that we have essential content
        if (!parsedContent.summary || parsedContent.summary.length < 50) {
          console.warn('⚠️ Summary seems too short or generic, may not be accurate');
        }
        
        if (!parsedContent.keyPoints || parsedContent.keyPoints.length === 0) {
          console.warn('⚠️ No key points extracted, analysis may be incomplete');
        }
        
        return {
          summary: parsedContent.summary || 'Video analysis completed - please check if the transcript was clear and complete',
          keyPoints: parsedContent.keyPoints || ['Analysis completed - no specific key points extracted'],
          suggestedShorts: parsedContent.suggestedShorts || [],
          duration: parsedContent.duration || videoInfo.duration,
          transcript: parsedContent.transcript || transcript.substring(0, 1000) + '...',
          // Add new structured data
          technicalInfo: parsedContent.technicalInfo || {
            fileSize: `${videoInfo.size} MB`,
            duration: `${Math.floor(videoInfo.duration / 60)}:${(videoInfo.duration % 60).toString().padStart(2, '0')}`,
            quality: 'Analysis completed',
            productionValues: 'Analysis completed'
          },
          mainTheme: parsedContent.mainTheme || 'Theme not clearly identified from transcript',
          keyLessons: parsedContent.keyLessons || [],
          stories: parsedContent.stories || [],
          frameworks: parsedContent.frameworks || [],
          callToAction: parsedContent.callToAction || '',
          // New fields for enhanced analysis
          keyMoments: parsedContent.keyMoments || [],
          bestSegment: parsedContent.bestSegment || undefined,
          actionableSuggestions: parsedContent.actionableSuggestions || [],
          suggestedEdits: parsedContent.suggestedEdits || [],
          revisedScript: parsedContent.revisedScript || undefined,
          whatChanged: parsedContent.whatChanged || []
        };
      } catch (parseError) {
        console.error('❌ JSON parsing error:', parseError);
        console.log('📝 Raw content:', content);
        console.log('📝 Content length:', content.length);
        console.log('📝 First 200 chars:', content.substring(0, 200));
        
        // Try to create a fallback response with the raw content
        return {
          summary: content.substring(0, 500) + '...',
          keyPoints: ['Analysis completed but JSON parsing failed'],
          suggestedShorts: [],
          duration: videoInfo.duration,
          transcript: transcript.substring(0, 500) + '...',
          technicalInfo: {
            fileSize: `${videoInfo.size} MB`,
            duration: `${Math.floor(videoInfo.duration / 60)}:${(videoInfo.duration % 60).toString().padStart(2, '0')}`,
            quality: 'Analysis completed',
            productionValues: 'Analysis completed'
          },
          mainTheme: 'Video analysis completed',
          keyLessons: [],
          stories: [],
          frameworks: [],
          callToAction: 'Analysis completed',
          // New fields for enhanced analysis
          keyMoments: [],
          bestSegment: undefined,
          actionableSuggestions: [],
          suggestedEdits: [],
          revisedScript: undefined,
          whatChanged: []
        };
      }

    } catch (error) {
      console.error('❌ Error analyzing transcript with GPT:', error);
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
    if (!this.videoApiKey) {
      throw new Error('OpenAI Video API key not configured');
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
    return !!this.videoApiKey;
  }
}

export const openaiService = new OpenAIService();
export type { VideoAnalysisResult, OpenAIResponse };
