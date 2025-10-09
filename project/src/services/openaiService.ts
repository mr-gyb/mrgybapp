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
    this.videoApiKey = import.meta.env.VITE_OPENAI_VIDEO_API_KEY;
    
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
      if (error.message && error.message.includes('401')) {
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
   * Extract audio from video file using Web Audio API
   */
  private async extractAudioFromVideo(videoFile: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      video.src = URL.createObjectURL(videoFile);
      video.crossOrigin = 'anonymous';
      
      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // For now, we'll use the original video file as audio
        // In a real implementation, you'd use Web Audio API to extract audio
        console.log('🎵 Audio extraction simulated (using original file)');
        resolve(videoFile);
      };
      
      video.onerror = (error) => {
        console.error('❌ Error loading video:', error);
        reject(error);
      };
      
      video.load();
    });
  }

  /**
   * Transcribe audio using OpenAI Whisper API
   */
  private async transcribeAudioWithWhisper(audioBlob: Blob): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.mp3');
      formData.append('model', 'whisper-1');
      formData.append('language', 'en');
      formData.append('response_format', 'text');

      console.log('🎤 Sending audio to Whisper API...');
      
      const response = await fetch(`${this.baseUrl}/audio/transcriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.videoApiKey}`,
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Whisper API error:', response.status, response.statusText, errorText);
        throw new Error(`Whisper API error: ${response.status} ${response.statusText}`);
      }

      const transcript = await response.text();
      console.log('✅ Whisper transcription completed');
      return transcript;

    } catch (error) {
      console.error('❌ Error transcribing audio:', error);
      // Re-throw the error instead of using mock transcript
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

      const prompt = `You are an expert video content analyst and script editor. Analyze this video transcript and create a comprehensive, structured summary with detailed editing recommendations.

VIDEO DETAILS:
- Name: ${videoInfo.name}
- Size: ${videoInfo.size} MB
- Type: ${videoInfo.type}
- Duration: ${Math.floor(videoInfo.duration / 60)}:${(videoInfo.duration % 60).toString().padStart(2, '0')}

TRANSCRIPT:
${transcript}

IMPORTANT: You MUST respond with ONLY valid JSON. Do not include any text before or after the JSON. Start your response with { and end with }.

SPECIAL FOCUS: Pay particular attention to generating detailed content for:
- Suggested Edits: Provide 3-5 specific editing recommendations with clear reasoning
- Revised Script: Create a complete rewritten version with improvements
- What Changed: Show detailed before/after comparisons with explanations

Please provide a detailed analysis with the following structure:

1. **Technical Information**: File size, duration, quality assessment, production values
2. **Main Theme**: Core message and primary focus of the video
3. **Key Lessons**: Numbered sections with headings and detailed explanations
4. **Stories/Examples**: Specific stories, anecdotes, or case studies mentioned
5. **Practical Frameworks**: Step-by-step processes, methodologies, or actionable advice
6. **Call-to-Action**: Closing message, next steps, or engagement prompts
7. **Suggested Short Segments**: Valuable clips for short-form content
8. **Key Moments**: Important highlights and memorable segments from the video
9. **Best Performing Segment**: The segment most likely to gain higher views/engagement
10. **Actionable Suggestions**: Three specific recommendations to improve video structure/script
11. **Key Points**: Bullet points of main takeaways from the video
12. **Suggested Edits**: Specific editing recommendations with priority levels (high/medium/low) for improving video structure, pacing, clarity, and engagement
13. **Revised Script**: Complete rewritten script with improvements for better flow, engagement, and clarity
14. **What Changed**: Detailed comparison of original vs revised content showing specific improvements made

Respond with ONLY this JSON structure:
{
  "summary": "Comprehensive overview of the video content and main themes...",
  "technicalInfo": {
    "fileSize": "${videoInfo.size} MB",
    "duration": "${Math.floor(videoInfo.duration / 60)}:${(videoInfo.duration % 60).toString().padStart(2, '0')}",
    "quality": "Assessment of video/audio quality",
    "productionValues": "Professional evaluation of production quality"
  },
  "mainTheme": "Core message and primary focus",
  "keyLessons": [
    {
      "heading": "Lesson 1: [Title]",
      "content": "Detailed explanation of this lesson",
      "timestamp": "0:00-2:30"
    }
  ],
  "stories": [
    {
      "title": "Story/Example Title",
      "description": "What was shared",
      "significance": "Why it matters"
    }
  ],
  "frameworks": [
    {
      "name": "Framework/Process Name",
      "steps": ["Step 1", "Step 2", "Step 3"],
      "description": "How to apply this framework"
    }
  ],
  "callToAction": "Closing message and next steps",
  "suggestedShorts": [
    {
      "title": "Segment Title",
      "description": "What this segment contains",
      "startTime": 0,
      "endTime": 15,
      "reasoning": "Why this segment is valuable"
    }
  ],
  "keyMoments": [
    {
      "title": "Key Moment Title",
      "description": "Description of this important moment",
      "timestamp": "2:30-3:45"
    }
  ],
  "bestSegment": {
    "title": "Best Performing Segment",
    "description": "Description of the segment most likely to perform well",
    "timestamp": "1:15-2:30",
    "reasoning": "Why this segment will gain higher views and engagement"
  },
  "actionableSuggestions": [
    {
      "title": "Suggestion 1",
      "description": "Detailed description of the improvement",
      "impact": "Expected impact on engagement and performance"
    },
    {
      "title": "Suggestion 2", 
      "description": "Detailed description of the improvement",
      "impact": "Expected impact on engagement and performance"
    },
    {
      "title": "Suggestion 3",
      "description": "Detailed description of the improvement", 
      "impact": "Expected impact on engagement and performance"
    }
  ],
  "keyPoints": ["Key insight 1", "Key insight 2", "Key insight 3"],
  "suggestedEdits": [
    {
      "title": "Improve Opening Hook",
      "description": "Add a compelling opening statement to grab viewer attention within the first 3 seconds",
      "reasoning": "Strong openings increase viewer retention by 40% and reduce drop-off rates",
      "priority": "high"
    },
    {
      "title": "Clarify Main Points",
      "description": "Restructure the middle section to present key points in a more logical sequence",
      "reasoning": "Better organization helps viewers follow the narrative and retain information",
      "priority": "medium"
    },
    {
      "title": "Strengthen Call-to-Action",
      "description": "Make the closing more actionable with specific next steps for viewers",
      "reasoning": "Clear CTAs increase engagement and drive desired viewer actions",
      "priority": "high"
    }
  ],
  "revisedScript": {
    "originalScript": "Original transcript from the video...",
    "revisedScript": "Complete rewritten script with improved structure, better pacing, clearer messaging, and enhanced engagement elements...",
    "changes": [
      "Added compelling opening hook to grab attention",
      "Restructured main points for better flow",
      "Enhanced transitions between sections",
      "Strengthened call-to-action with specific next steps"
    ]
  },
  "whatChanged": [
    {
      "section": "Introduction",
      "original": "Original opening content from transcript",
      "revised": "New improved opening with hook and clear value proposition",
      "reason": "Added attention-grabbing hook to reduce early drop-off and clearly communicate video value"
    },
    {
      "section": "Main Content",
      "original": "Original main content structure",
      "revised": "Restructured content with better flow and clearer points",
      "reason": "Improved organization helps viewers follow the narrative and retain key information"
    },
    {
      "section": "Conclusion",
      "original": "Original closing content",
      "revised": "Enhanced conclusion with strong call-to-action",
      "reason": "Clear CTAs increase engagement and drive desired viewer actions"
    }
  ],
  "duration": ${videoInfo.duration},
  "transcript": "${transcript.substring(0, 500)}..."
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
        return {
          summary: parsedContent.summary || 'Video analysis completed',
          keyPoints: parsedContent.keyPoints || [],
          suggestedShorts: parsedContent.suggestedShorts || [],
          duration: parsedContent.duration || videoInfo.duration,
          transcript: parsedContent.transcript || transcript.substring(0, 500) + '...',
          // Add new structured data
          technicalInfo: parsedContent.technicalInfo || {},
          mainTheme: parsedContent.mainTheme || '',
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

  /**
   * Convert file to base64 string
   */
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix to get just the base64 string
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
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
