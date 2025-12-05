import { VideoAnalysisResult } from './openaiService';

export interface VideoShort {
  start: string;
  end: string;
  title: string;
  hook: string;
  description: string;
}

export interface VideoShortsResult {
  success: boolean;
  shorts: VideoShort[];
  requestId?: string;
  metadata?: {
    transcriptLength: number;
    processingTimeMs: number;
  };
}

/**
 * Generate video shorts from transcript using OpenAI agent
 * @param transcript - Video transcript text
 * @returns Promise<VideoShortsResult> - Array of suggested shorts with timestamps
 */
export async function generateVideoShorts(transcript: string): Promise<VideoShortsResult> {
  try {
    console.log('🎬 Generating video shorts from transcript...');
    
    if (!transcript || transcript.trim().length === 0) {
      throw new Error('Transcript is required to generate video shorts');
    }

    const backendUrl = import.meta.env.VITE_CHAT_API_BASE?.replace('/api', '') || 'http://localhost:8080';

    const response = await fetch(`${backendUrl}/api/video/shorts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transcript }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to generate video shorts: ${response.statusText}`);
    }

    const result: VideoShortsResult = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to generate video shorts');
    }

    console.log(`✅ Generated ${result.shorts?.length || 0} video shorts`);
    return result;

  } catch (error) {
    console.error('❌ Error generating video shorts:', error);
    throw error;
  }
}

/**
 * Generate a short video from a long video (legacy function - now uses transcript-based shorts)
 * @param analysisResult - Video analysis result containing transcript
 * @param videoFile - Optional video file (if not provided, will try to get from sessionStorage)
 * @returns Promise<string> - URL of the generated short video (placeholder for now)
 * @deprecated Use generateVideoShorts() instead for better results
 */
export async function generateShortVideo(
  analysisResult: VideoAnalysisResult,
  videoFile?: File
): Promise<string> {
  try {
    console.log('🎬 Generating short video...');
    
    // Try to get transcript from analysis result
    const transcript = analysisResult.transcript || analysisResult.rawTranscript;
    
    if (transcript) {
      // Use new transcript-based shorts generation
      const shortsResult = await generateVideoShorts(transcript);
      
      // Store shorts in sessionStorage for UI to display
      sessionStorage.setItem('generatedShorts', JSON.stringify(shortsResult.shorts));
      
      // For now, return the original video URL
      // In the future, this could trigger actual video trimming based on shorts
      const videoUrl = sessionStorage.getItem('uploadedVideoUrl');
      if (videoUrl) {
        return videoUrl;
      }
    }

    // Fallback: Get video file from sessionStorage if not provided
    let fileToProcess = videoFile;
    if (!fileToProcess) {
      const videoFileData = sessionStorage.getItem('uploadedVideoFile');
      if (videoFileData) {
        try {
          const fileData = JSON.parse(videoFileData);
          if (fileData.url) {
            try {
              const response = await fetch(fileData.url);
              if (response.ok) {
                const blob = await response.blob();
                fileToProcess = new File([blob], fileData.name || 'video.mp4', { 
                  type: fileData.type || blob.type || 'video/mp4' 
                });
              }
            } catch (fetchError) {
              console.warn('Could not fetch video file from URL:', fetchError);
            }
          }
        } catch (parseError) {
          console.warn('Could not parse video file data:', parseError);
        }
      }
    }

    // Return video URL
    if (fileToProcess) {
      return URL.createObjectURL(fileToProcess);
    }

    // Final fallback
    return sessionStorage.getItem('uploadedVideoUrl') || 
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  } catch (error) {
    console.error('Error generating short video:', error);
    throw new Error('Failed to generate short video. Please try again.');
  }
}

