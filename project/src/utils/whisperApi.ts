/**
 * OpenAI Whisper API Integration
 * Handles audio transcription using OpenAI's Whisper API
 */

export interface WhisperTranscriptionResult {
  text: string;
  language?: string;
  duration?: number;
}

export interface WhisperApiError {
  error: string;
  code?: string;
  status?: number;
}

/**
 * Transcribe audio using OpenAI Whisper API
 * @param audioBlob - The audio blob to transcribe
 * @param options - Optional configuration
 * @returns Promise with transcription result
 */
export const transcribeWithWhisper = async (
  audioBlob: Blob,
  options: {
    model?: string;
    language?: string;
    prompt?: string;
    responseFormat?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
    temperature?: number;
  } = {}
): Promise<WhisperTranscriptionResult> => {
  const {
    model = 'whisper-1',
    language = 'en',
    prompt = '',
    responseFormat = 'json',
    temperature = 0
  } = options;

  // Check if API key is available
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not found. Please set VITE_OPENAI_API_KEY in your environment variables.');
  }

  // Validate audio blob
  if (!audioBlob || audioBlob.size === 0) {
    throw new Error('No audio data provided');
  }

  // Check file size (Whisper API has a 25MB limit)
  const maxSize = 25 * 1024 * 1024; // 25MB
  if (audioBlob.size > maxSize) {
    throw new Error('Audio file is too large. Maximum size is 25MB.');
  }

  // Create form data
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');
  formData.append('model', model);
  formData.append('language', language);
  formData.append('response_format', responseFormat);
  formData.append('temperature', temperature.toString());
  
  if (prompt) {
    formData.append('prompt', prompt);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Whisper API error (${response.status}): ${
          errorData.error?.message || response.statusText
        }`
      );
    }

    const result = await response.json();
    
    return {
      text: result.text || '',
      language: result.language,
      duration: result.duration
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to transcribe audio with Whisper API');
  }
};

/**
 * Check if Whisper API is available (has API key)
 */
export const isWhisperApiAvailable = (): boolean => {
  return !!import.meta.env.VITE_OPENAI_API_KEY;
};

/**
 * Validate audio format for Whisper API
 */
export const validateAudioForWhisper = (audioBlob: Blob): boolean => {
  const supportedTypes = [
    'audio/mp3',
    'audio/mp4',
    'audio/mpeg',
    'audio/mpga',
    'audio/m4a',
    'audio/wav',
    'audio/webm',
    'audio/ogg'
  ];
  
  return supportedTypes.includes(audioBlob.type) || 
         audioBlob.type.startsWith('audio/');
};

/**
 * Convert audio blob to supported format for Whisper
 * This is a basic implementation - you might want to use a library like ffmpeg.js for more complex conversions
 */
export const convertAudioForWhisper = async (audioBlob: Blob): Promise<Blob> => {
  // For now, return the original blob
  // In a production app, you might want to convert to a specific format
  return audioBlob;
};
