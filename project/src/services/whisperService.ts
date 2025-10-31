// Whisper API service for future implementation
import { WhisperTranscriptionOptions, WhisperTranscriptionResult } from '../types/voice';

class WhisperService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || import.meta.env.VITE_OPENAI_API_KEY || '';
    this.baseUrl = 'https://api.openai.com/v1';
  }

  /**
   * Transcribe audio using OpenAI Whisper API
   * @param audioBlob - Audio blob to transcribe
   * @param options - Transcription options
   * @returns Promise with transcription result
   */
  async transcribeAudio(
    audioBlob: Blob, 
    options: WhisperTranscriptionOptions = {}
  ): Promise<WhisperTranscriptionResult> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not provided');
    }

    const {
      model = 'whisper-1',
      language = 'en',
      temperature = 0,
      prompt = ''
    } = options;

    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', model);
      formData.append('language', language);
      formData.append('temperature', temperature.toString());
      
      if (prompt) {
        formData.append('prompt', prompt);
      }

      const response = await fetch(`${this.baseUrl}/audio/transcriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Whisper API error: ${errorData.error?.message || response.statusText}`);
      }

      const result = await response.json();
      
      return {
        text: result.text,
        language: result.language,
        duration: result.duration
      };
    } catch (error) {
      console.error('Whisper transcription error:', error);
      throw error;
    }
  }

  /**
   * Check if Whisper API is available
   */
  isAvailable(): boolean {
    return !!this.apiKey;
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): string[] {
    return [
      'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh',
      'ar', 'hi', 'th', 'vi', 'tr', 'pl', 'nl', 'sv', 'da', 'no',
      'fi', 'cs', 'hu', 'ro', 'bg', 'hr', 'sk', 'sl', 'et', 'lv',
      'lt', 'mt', 'ga', 'cy', 'is', 'mk', 'sq', 'sr', 'bs', 'me'
    ];
  }
}

// Create singleton instance
export const whisperService = new WhisperService();

// Export for use in hooks
export default WhisperService;
