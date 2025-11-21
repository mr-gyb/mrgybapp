import { VideoAnalysisResult } from './openaiService';

export interface ShortVideoSegment {
  id: string;
  title: string;
  description: string;
  startTime: number;
  endTime: number;
  duration: number;
  reasoning: string;
  script: string;
  thumbnail?: string;
  tags: string[];
  engagementScore: number;
}

export interface VideoConversionResult {
  originalVideo: {
    name: string;
    duration: number;
    size: number;
    type: string;
  };
  shortSegments: ShortVideoSegment[];
  bestSegment: ShortVideoSegment;
  conversionSummary: string;
  totalSegments: number;
  averageDuration: number;
  processingTime: number;
}

export interface ConversionOptions {
  maxDuration?: number; // Maximum duration for short videos (default: 60 seconds)
  minDuration?: number; // Minimum duration for short videos (default: 15 seconds)
  targetCount?: number; // Target number of short videos to generate
  focusAreas?: string[]; // Specific areas to focus on (e.g., ['hook', 'main_points', 'conclusion'])
  style?: 'educational' | 'entertainment' | 'promotional' | 'tutorial';
  tone?: 'professional' | 'casual' | 'energetic' | 'calm';
}

class VideoConversionService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!this.apiKey) {
      console.warn('OpenAI API key not found. Please set VITE_OPENAI_API_KEY in your .env file.');
    }
  }

  /**
   * Convert a long video into multiple short video segments
   */
  async convertLongVideoToShorts(
    videoFile: File,
    analysisResult: VideoAnalysisResult,
    options: ConversionOptions = {}
  ): Promise<VideoConversionResult> {
    const startTime = Date.now();
    
    try {
      console.log('🎬 Starting video conversion to shorts...');
      console.log('📁 Video file:', videoFile.name, 'Size:', (videoFile.size / (1024 * 1024)).toFixed(2), 'MB');
      
      // Set default options
      const conversionOptions: Required<ConversionOptions> = {
        maxDuration: options.maxDuration || 60,
        minDuration: options.minDuration || 15,
        targetCount: options.targetCount || 5,
        focusAreas: options.focusAreas || ['hook', 'main_points', 'conclusion'],
        style: options.style || 'educational',
        tone: options.tone || 'professional'
      };

      // Generate short video segments using OpenAI
      const shortSegments = await this.generateShortSegments(analysisResult, conversionOptions);
      
      // Find the best segment based on engagement potential
      const bestSegment = this.findBestSegment(shortSegments);
      
      // Calculate processing time
      const processingTime = Date.now() - startTime;
      
      // Create conversion summary
      const conversionSummary = this.generateConversionSummary(
        videoFile,
        shortSegments,
        bestSegment,
        processingTime
      );

      const result: VideoConversionResult = {
        originalVideo: {
          name: videoFile.name,
          duration: analysisResult.duration,
          size: videoFile.size,
          type: videoFile.type
        },
        shortSegments,
        bestSegment,
        conversionSummary,
        totalSegments: shortSegments.length,
        averageDuration: shortSegments.reduce((sum, seg) => sum + seg.duration, 0) / shortSegments.length,
        processingTime
      };

      console.log('✅ Video conversion completed');
      console.log('📊 Generated', shortSegments.length, 'short segments');
      console.log('⏱️ Processing time:', processingTime, 'ms');
      
      return result;

    } catch (error) {
      console.error('❌ Error converting video to shorts:', error);
      throw new Error(`Video conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate short video segments using OpenAI GPT-4
   */
  private async generateShortSegments(
    analysisResult: VideoAnalysisResult,
    options: Required<ConversionOptions>
  ): Promise<ShortVideoSegment[]> {
    try {
      const prompt = this.buildConversionPrompt(analysisResult, options);
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an expert video editor and content strategist specializing in creating engaging short-form content from long-form videos. You excel at identifying the most valuable segments and creating compelling scripts for short videos.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 3000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ OpenAI API error:', response.status, response.statusText, errorText);
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      console.log('✅ Short segments generated by OpenAI');
      
      // Parse the JSON response
      try {
        const jsonContent = this.extractJSONFromResponse(content);
        const parsedContent = JSON.parse(jsonContent);
        
        return parsedContent.shortSegments.map((segment: any, index: number) => ({
          id: `short_${Date.now()}_${index}`,
          title: segment.title,
          description: segment.description,
          startTime: segment.startTime,
          endTime: segment.endTime,
          duration: segment.endTime - segment.startTime,
          reasoning: segment.reasoning,
          script: segment.script,
          tags: segment.tags || [],
          engagementScore: segment.engagementScore || 0
        }));
      } catch (parseError) {
        console.error('❌ JSON parsing error:', parseError);
        console.log('📝 Raw content:', content);
        
        // Return fallback segments based on suggested shorts from analysis
        return this.createFallbackSegments(analysisResult, options);
      }

    } catch (error) {
      console.error('❌ Error generating short segments:', error);
      throw error;
    }
  }

  /**
   * Build the conversion prompt for OpenAI
   */
  private buildConversionPrompt(
    analysisResult: VideoAnalysisResult,
    options: Required<ConversionOptions>
  ): string {
    return `You are an expert video editor tasked with converting a long-form video into engaging short-form content. 

ORIGINAL VIDEO ANALYSIS:
- Summary: ${analysisResult.summary}
- Duration: ${Math.floor(analysisResult.duration / 60)}:${(analysisResult.duration % 60).toString().padStart(2, '0')}
- Key Points: ${analysisResult.keyPoints?.join(', ') || 'N/A'}
- Main Theme: ${analysisResult.mainTheme || 'N/A'}
- Best Segment: ${analysisResult.bestSegment?.title || 'N/A'}

CONVERSION REQUIREMENTS:
- Target Count: ${options.targetCount} short videos
- Duration Range: ${options.minDuration}-${options.maxDuration} seconds each
- Style: ${options.style}
- Tone: ${options.tone}
- Focus Areas: ${options.focusAreas.join(', ')}

EXISTING SUGGESTED SHORTS:
${analysisResult.suggestedShorts?.map(short => 
  `- ${short.title}: ${short.description} (${short.startTime}s-${short.endTime}s)`
).join('\n') || 'None provided'}

TASK: Create ${options.targetCount} high-quality short video segments that will perform well on social media platforms. Each segment should be self-contained, engaging, and optimized for short-form content consumption.

For each segment, provide:
1. Compelling title that hooks viewers
2. Clear description of content
3. Precise start/end timestamps
4. Reasoning for why this segment will perform well
5. Complete script optimized for short-form content
6. Relevant tags for discoverability
7. Engagement score (1-10) based on viral potential

Respond with ONLY this JSON structure:
{
  "shortSegments": [
    {
      "title": "Compelling Hook Title",
      "description": "What this segment contains and why it's valuable",
      "startTime": 0,
      "endTime": 30,
      "reasoning": "Why this segment will perform well on social media",
      "script": "Complete script optimized for short-form content with hooks, main content, and call-to-action",
      "tags": ["tag1", "tag2", "tag3"],
      "engagementScore": 8
    }
  ]
}`;
  }

  /**
   * Extract JSON from OpenAI response
   */
  private extractJSONFromResponse(content: string): string {
    let jsonContent = content.trim();
    
    // Find JSON boundaries
    const jsonStart = jsonContent.indexOf('{');
    const jsonEnd = jsonContent.lastIndexOf('}');
    
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      jsonContent = jsonContent.substring(jsonStart, jsonEnd + 1);
    }
    
    return jsonContent;
  }

  /**
   * Create fallback segments if OpenAI parsing fails
   */
  private createFallbackSegments(
    analysisResult: VideoAnalysisResult,
    options: Required<ConversionOptions>
  ): ShortVideoSegment[] {
    const segments: ShortVideoSegment[] = [];
    
    // Use existing suggested shorts as base
    if (analysisResult.suggestedShorts && analysisResult.suggestedShorts.length > 0) {
      analysisResult.suggestedShorts.slice(0, options.targetCount).forEach((short, index) => {
        segments.push({
          id: `fallback_${Date.now()}_${index}`,
          title: short.title,
          description: short.description,
          startTime: short.startTime,
          endTime: short.endTime,
          duration: short.endTime - short.startTime,
          reasoning: short.reasoning,
          script: this.generateScriptForSegment(short, analysisResult),
          tags: this.extractTagsFromContent(short.description),
          engagementScore: Math.floor(Math.random() * 5) + 5 // Random score 5-10
        });
      });
    }
    
    // If no suggested shorts, create generic segments
    if (segments.length === 0) {
      const segmentDuration = Math.min(30, Math.floor(analysisResult.duration / options.targetCount));
      
      for (let i = 0; i < options.targetCount; i++) {
        const startTime = i * segmentDuration;
        const endTime = Math.min(startTime + segmentDuration, analysisResult.duration);
        
        segments.push({
          id: `generic_${Date.now()}_${i}`,
          title: `Short Video ${i + 1}`,
          description: `Key insights from the video (${startTime}s-${endTime}s)`,
          startTime,
          endTime,
          duration: endTime - startTime,
          reasoning: 'This segment contains valuable content that can be extracted for short-form content',
          script: this.generateGenericScript(analysisResult, startTime, endTime),
          tags: ['content', 'insights', 'short-form'],
          engagementScore: 6
        });
      }
    }
    
    return segments;
  }

  /**
   * Generate script for a specific segment
   */
  private generateScriptForSegment(short: any, analysisResult: VideoAnalysisResult): string {
    return `🎬 ${short.title}

[Opening Hook - 0-3 seconds]
"Here's something that will change how you think about this topic..."

[Main Content - 3-12 seconds]
"${short.description}"

[Call to Action - 12-15 seconds]
"Follow for more insights like this! What do you think? Comment below!"

#${analysisResult.mainTheme?.toLowerCase().replace(/\s+/g, '') || 'content'} #insights #shortform`;
  }

  /**
   * Generate generic script for fallback segments
   */
  private generateGenericScript(analysisResult: VideoAnalysisResult, _startTime: number, _endTime: number): string {
    return `🎬 Key Insights

[Opening Hook - 0-3 seconds]
"Here's what you need to know about this topic..."

[Main Content - 3-12 seconds]
"${analysisResult.summary.substring(0, 100)}..."

[Call to Action - 12-15 seconds]
"Follow for more valuable content! What's your take? Comment below!"

#${analysisResult.mainTheme?.toLowerCase().replace(/\s+/g, '') || 'content'} #insights #shortform`;
  }

  /**
   * Extract tags from content
   */
  private extractTagsFromContent(content: string): string[] {
    const commonTags = ['content', 'insights', 'tips', 'education', 'shortform'];
    const words = content.toLowerCase().split(/\s+/);
    const relevantTags = words.filter(word => 
      word.length > 3 && 
      !['this', 'that', 'with', 'from', 'they', 'them', 'have', 'will', 'been', 'were'].includes(word)
    ).slice(0, 3);
    
    return [...new Set([...commonTags, ...relevantTags])].slice(0, 5);
  }

  /**
   * Find the best segment based on engagement score
   */
  private findBestSegment(segments: ShortVideoSegment[]): ShortVideoSegment {
    return segments.reduce((best, current) => 
      current.engagementScore > best.engagementScore ? current : best
    );
  }

  /**
   * Generate conversion summary
   */
  private generateConversionSummary(
    videoFile: File,
    segments: ShortVideoSegment[],
    bestSegment: ShortVideoSegment,
    processingTime: number
  ): string {
    const totalDuration = segments.reduce((sum, seg) => sum + seg.duration, 0);
    const averageDuration = totalDuration / segments.length;
    
    return `Successfully converted "${videoFile.name}" into ${segments.length} short video segments. 
    Average duration: ${averageDuration.toFixed(1)}s. 
    Best performing segment: "${bestSegment.title}" (${bestSegment.engagementScore}/10 engagement score). 
    Processing time: ${(processingTime / 1000).toFixed(1)}s.`;
  }

  /**
   * Generate enhanced script for a specific short segment
   */
  async generateEnhancedScript(segment: ShortVideoSegment, analysisResult: VideoAnalysisResult): Promise<string> {
    try {
      const prompt = `Create an enhanced script for this short video segment:

SEGMENT DETAILS:
- Title: ${segment.title}
- Description: ${segment.description}
- Duration: ${segment.duration} seconds
- Reasoning: ${segment.reasoning}

ORIGINAL VIDEO CONTEXT:
- Main Theme: ${analysisResult.mainTheme}
- Key Points: ${analysisResult.keyPoints?.join(', ')}
- Best Segment: ${analysisResult.bestSegment?.title}

Create a compelling script that:
1. Opens with a strong hook (0-3 seconds)
2. Delivers the main value (3-12 seconds)
3. Ends with a clear call-to-action (12-15 seconds)
4. Includes relevant hashtags
5. Is optimized for social media engagement

Respond with the complete script only.`;

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are an expert social media script writer specializing in short-form content that goes viral.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.8
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;

    } catch (error) {
      console.error('Error generating enhanced script:', error);
      return segment.script; // Return original script as fallback
    }
  }

  /**
   * Check if the service is properly configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

export const videoConversionService = new VideoConversionService();

