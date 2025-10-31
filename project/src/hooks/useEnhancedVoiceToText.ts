import { useState, useRef, useCallback } from 'react';
import { useVoiceToText } from './useVoiceToText';
import { whisperService } from '../services/whisperService';
import { VoiceRecognitionResult, VoiceRecognitionError } from '../types/voice';

export type VoiceProvider = 'browser' | 'whisper';

export interface UseEnhancedVoiceToTextOptions {
  provider?: VoiceProvider;
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
  onResult?: (result: VoiceRecognitionResult) => void;
  onError?: (error: VoiceRecognitionError) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export const useEnhancedVoiceToText = (options: UseEnhancedVoiceToTextOptions = {}) => {
  const {
    provider = 'browser',
    ...browserOptions
  } = options;

  // Browser SpeechRecognition hook
  const browserVoice = useVoiceToText(browserOptions);
  
  // Whisper-specific state
  const [isRecordingWhisper, setIsRecordingWhisper] = useState(false);
  const [whisperTranscript, setWhisperTranscript] = useState('');
  const [whisperError, setWhisperError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Start Whisper recording
  const startWhisperRecording = useCallback(async () => {
    try {
      setWhisperError(null);
      setWhisperTranscript('');
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const result = await whisperService.transcribeAudio(audioBlob, {
            language: options.language || 'en'
          });
          
          setWhisperTranscript(result.text);
          
          const voiceResult: VoiceRecognitionResult = {
            transcript: result.text,
            confidence: 1.0, // Whisper doesn't provide confidence scores
            isFinal: true
          };
          
          options.onResult?.(voiceResult);
        } catch (error: any) {
          console.error('Whisper transcription error:', error);
          setWhisperError(error.message);
          
          const voiceError: VoiceRecognitionError = {
            error: error.message,
            type: 'network'
          };
          
          options.onError?.(voiceError);
        } finally {
          // Stop all tracks
          stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecordingWhisper(true);
      options.onStart?.();
    } catch (error: any) {
      console.error('Error starting Whisper recording:', error);
      setWhisperError(error.message);
      
      const voiceError: VoiceRecognitionError = {
        error: error.message,
        type: 'audio-capture'
      };
      
      options.onError?.(voiceError);
    }
  }, [options]);

  // Stop Whisper recording
  const stopWhisperRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecordingWhisper) {
      mediaRecorderRef.current.stop();
      setIsRecordingWhisper(false);
      options.onEnd?.();
    }
  }, [isRecordingWhisper, options]);

  // Toggle Whisper recording
  const toggleWhisperRecording = useCallback(() => {
    if (isRecordingWhisper) {
      stopWhisperRecording();
    } else {
      startWhisperRecording();
    }
  }, [isRecordingWhisper, startWhisperRecording, stopWhisperRecording]);

  // Clear Whisper transcript
  const clearWhisperTranscript = useCallback(() => {
    setWhisperTranscript('');
    setWhisperError(null);
  }, []);

  // Reset Whisper state
  const resetWhisper = useCallback(() => {
    stopWhisperRecording();
    clearWhisperTranscript();
  }, [stopWhisperRecording, clearWhisperTranscript]);

  // Choose the appropriate provider
  const isBrowserProvider = provider === 'browser';
  const isWhisperProvider = provider === 'whisper';

  // Return the appropriate state and methods based on provider
  if (isBrowserProvider) {
    return {
      ...browserVoice,
      provider: 'browser' as const,
      isWhisperAvailable: whisperService.isAvailable()
    };
  }

  if (isWhisperProvider) {
    return {
      // State
      isRecording: isRecordingWhisper,
      isSupported: whisperService.isAvailable(),
      isListening: isRecordingWhisper,
      transcript: whisperTranscript,
      interimTranscript: '',
      finalTranscript: whisperTranscript,
      error: whisperError,
      confidence: 1.0,
      
      // Actions
      startRecording: startWhisperRecording,
      stopRecording: stopWhisperRecording,
      toggleRecording: toggleWhisperRecording,
      clearTranscript: clearWhisperTranscript,
      reset: resetWhisper,
      
      // Computed values
      hasTranscript: whisperTranscript.length > 0,
      hasError: !!whisperError,
      isReady: whisperService.isAvailable() && !isRecordingWhisper && !whisperError,
      
      // Provider info
      provider: 'whisper' as const,
      isWhisperAvailable: whisperService.isAvailable()
    };
  }

  // Fallback to browser if provider is not recognized
  return {
    ...browserVoice,
    provider: 'browser' as const,
    isWhisperAvailable: whisperService.isAvailable()
  };
};
