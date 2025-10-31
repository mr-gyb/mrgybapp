// Voice-to-text related types
export interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export interface VoiceRecognitionError {
  error: string;
  type: 'network' | 'not-allowed' | 'no-speech' | 'aborted' | 'audio-capture' | 'service-not-allowed' | 'bad-grammar' | 'language-not-supported';
  shouldRetry?: boolean;
}

export interface VoiceRecognitionState {
  isRecording: boolean;
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  finalTranscript: string;
  error: string | null;
  confidence: number;
}

export interface UseVoiceToTextOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
  onResult?: (result: VoiceRecognitionResult) => void;
  onError?: (error: VoiceRecognitionError) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export interface VoiceInputProps {
  onTranscript?: (transcript: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  showTranscript?: boolean;
  autoSubmit?: boolean;
}

// Whisper API types (for future implementation)
export interface WhisperTranscriptionOptions {
  model?: string;
  language?: string;
  temperature?: number;
  prompt?: string;
}

export interface WhisperTranscriptionResult {
  text: string;
  language?: string;
  duration?: number;
}
