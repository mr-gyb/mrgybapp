import { useState, useRef, useCallback } from 'react';
import { API_BASE } from '../api/config';

export interface VoiceState {
  isRecording: boolean;
  isProcessing: boolean;
  error: string | null;
  hasPermission: boolean;
}

export interface VoiceResult {
  success: boolean;
  text?: string;
  error?: string;
}

export interface UseVoiceReturn {
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<VoiceResult>;
  recordingState: VoiceState;
  cleanup: () => void;
}

/**
 * Custom hook for voice recording and transcription
 * Handles microphone access, audio recording, and API communication
 */
export const useVoice = (): UseVoiceReturn => {
  const [recordingState, setRecordingState] = useState<VoiceState>({
    isRecording: false,
    isProcessing: false,
    error: null,
    hasPermission: false,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  /**
   * Request microphone permission and test audio access
   */
  const requestMicrophonePermission = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🎤 Requesting microphone permission...');
      
      // Request microphone access with optimal settings
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1
        }
      });

      streamRef.current = stream;
      
      console.log('✅ Microphone permission granted');
      console.log('🎵 Audio stream details:', {
        id: stream.id,
        active: stream.active,
        tracks: stream.getAudioTracks().length,
        trackSettings: stream.getAudioTracks()[0]?.getSettings()
      });

      setRecordingState(prev => ({ ...prev, hasPermission: true, error: null }));
      return true;

    } catch (error: any) {
      console.error('❌ Microphone permission denied:', error);
      
      let errorMessage = 'Microphone access failed';
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Microphone access denied. Please allow microphone access and try again.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No microphone found. Please connect a microphone and try again.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Microphone is being used by another application. Please close other applications and try again.';
      } else {
        errorMessage = `Microphone error: ${error.message}`;
      }
      
      setRecordingState(prev => ({ 
        ...prev, 
        hasPermission: false, 
        error: errorMessage 
      }));
      
      return false;
    }
  }, []);

  /**
   * Start audio recording
   */
  const startRecording = useCallback(async (): Promise<void> => {
    try {
      console.log('🎙️ Starting voice recording...');
      
      // Check if already recording
      if (recordingState.isRecording) {
        console.log('⚠️ Recording already in progress');
        return;
      }

      // Request microphone permission first
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        throw new Error(recordingState.error || 'Microphone permission denied');
      }

      if (!streamRef.current) {
        throw new Error('No audio stream available');
      }

      // Clear previous chunks
      audioChunksRef.current = [];

      // Get supported MIME type
      const mimeType = getSupportedMimeType();
      console.log('🎵 Using MIME type:', mimeType);

      // Create MediaRecorder with optimal settings
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType,
        audioBitsPerSecond: 128000
      });

      mediaRecorderRef.current = mediaRecorder;

      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log('📊 Audio chunk received:', event.data.size, 'bytes');
        }
      };

      mediaRecorder.onstart = () => {
        console.log('✅ Recording started');
        setRecordingState(prev => ({ 
          ...prev, 
          isRecording: true, 
          error: null 
        }));
      };

      mediaRecorder.onerror = (event) => {
        console.error('❌ Recording error:', event);
        setRecordingState(prev => ({ 
          ...prev, 
          isRecording: false, 
          error: 'Recording failed' 
        }));
      };

      // Start recording
      mediaRecorder.start(1000); // Collect data every second
      console.log('✅ Voice recording started successfully');

    } catch (error: any) {
      console.error('❌ Failed to start recording:', error);
      setRecordingState(prev => ({ 
        ...prev, 
        isRecording: false, 
        error: error.message 
      }));
      throw error;
    }
  }, [recordingState.isRecording, recordingState.error, requestMicrophonePermission]);

  /**
   * Stop audio recording and transcribe
   */
  const stopRecording = useCallback(async (): Promise<VoiceResult> => {
    try {
      console.log('⏹️ Stopping voice recording...');
      
      if (!mediaRecorderRef.current || !recordingState.isRecording) {
        throw new Error('No active recording to stop');
      }

      // Set processing state
      setRecordingState(prev => ({ 
        ...prev, 
        isRecording: false, 
        isProcessing: true 
      }));

      // Stop recording
      mediaRecorderRef.current.stop();
      
      // Wait for data to be available
      await new Promise<void>((resolve) => {
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.onstop = () => resolve();
        }
      });

      if (audioChunksRef.current.length === 0) {
        throw new Error('No audio data recorded');
      }

      // Combine audio chunks
      const audioBlob = new Blob(audioChunksRef.current, { 
        type: mediaRecorderRef.current?.mimeType || 'audio/webm' 
      });
      
      console.log('🎵 Audio blob created:', {
        size: audioBlob.size,
        type: audioBlob.type
      });

      // Transcribe audio
      const result = await transcribeAudio(audioBlob);
      
      setRecordingState(prev => ({ 
        ...prev, 
        isProcessing: false 
      }));

      return result;

    } catch (error: any) {
      console.error('❌ Error stopping recording:', error);
      setRecordingState(prev => ({ 
        ...prev, 
        isRecording: false, 
        isProcessing: false, 
        error: error.message 
      }));
      
      return {
        success: false,
        error: error.message
      };
    }
  }, [recordingState.isRecording]);

  /**
   * Transcribe audio using backend API with Web Speech API fallback
   */
  const transcribeAudio = useCallback(async (audioBlob: Blob): Promise<VoiceResult> => {
    try {
      console.log('🤖 Sending audio to transcription API...');
      
      // Create FormData for API request
      const formData = new FormData();
      formData.append('audio', audioBlob, 'audio.webm');
      
      // Make API request to backend
      const response = await fetch(`${API_BASE}/api/transcribe`, {
        method: 'POST',
        body: formData
      });

      console.log('📡 Transcription API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Transcription API error:', errorData);
        
        // If quota exceeded, try Web Speech API fallback
        if (response.status === 429) {
          console.log('🔄 OpenAI quota exceeded, trying Web Speech API fallback...');
          return await transcribeWithWebSpeech();
        }
        
        let errorMessage = 'Transcription failed';
        if (response.status === 401) {
          errorMessage = 'API key invalid or missing. Please check your OpenAI configuration.';
        } else if (response.status === 413) {
          errorMessage = 'Audio file too large. Please record a shorter message.';
        } else if (response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = errorData.error || `Transcription failed: ${response.status}`;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ Transcription successful:', result);

      return {
        success: true,
        text: result.text
      };

    } catch (error: any) {
      console.error('❌ Transcription failed:', error);
      
      // If it's a network error or quota issue, try Web Speech API fallback
      if (error.message.includes('quota') || error.message.includes('Failed to fetch')) {
        console.log('🔄 API unavailable, trying Web Speech API fallback...');
        return await transcribeWithWebSpeech();
      }
      
      return {
        success: false,
        error: error.message || 'Transcription failed'
      };
    }
  }, []);

  /**
   * Fallback transcription using Web Speech API
   */
  const transcribeWithWebSpeech = useCallback((): Promise<VoiceResult> => {
    return new Promise((resolve) => {
      console.log('🎤 Using Web Speech API fallback...');
      
      // Check if Web Speech API is supported
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.error('❌ Web Speech API not supported');
        resolve({
          success: false,
          error: 'Speech recognition not supported in this browser'
        });
        return;
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      // Configure recognition with better settings
      recognition.continuous = false;
      recognition.interimResults = true; // Enable interim results for better feedback
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      let hasResult = false;
      let timeoutId: NodeJS.Timeout;

      recognition.onstart = () => {
        console.log('🎤 Web Speech API started - please speak now');
        
        // Set a longer timeout for speech detection
        timeoutId = setTimeout(() => {
          if (!hasResult) {
            console.log('⏰ Web Speech API timeout - no speech detected');
            recognition.stop();
            resolve({
              success: false,
              error: 'No speech detected. Please try speaking louder or closer to the microphone.'
            });
          }
        }, 15000); // 15 second timeout
      };

      recognition.onresult = (event: any) => {
        hasResult = true;
        clearTimeout(timeoutId);
        
        // Get the final result
        const result = event.results[event.results.length - 1];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence;
        
        console.log('✅ Web Speech API transcription:', transcript, 'Confidence:', confidence);
        
        // Only resolve if we have a final result with good confidence
        if (result.isFinal && confidence > 0.3) {
          resolve({
            success: true,
            text: transcript.trim()
          });
        }
      };

      recognition.onerror = (event: any) => {
        clearTimeout(timeoutId);
        console.error('❌ Web Speech API error:', event.error);
        
        let errorMessage = 'Speech recognition error';
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please speak louder or closer to the microphone.';
            break;
          case 'audio-capture':
            errorMessage = 'Microphone not accessible. Please check your microphone permissions.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone permission denied. Please allow microphone access.';
            break;
          case 'network':
            errorMessage = 'Network error. Please check your internet connection.';
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }
        
        resolve({
          success: false,
          error: errorMessage
        });
      };

      recognition.onend = () => {
        clearTimeout(timeoutId);
        console.log('🎤 Web Speech API ended');
        
        // If we haven't resolved yet and no result, it means no speech was detected
        if (!hasResult) {
          resolve({
            success: false,
            error: 'No speech detected. Please try speaking again.'
          });
        }
      };

      // Start recognition
      try {
        recognition.start();
      } catch (error) {
        console.error('❌ Failed to start Web Speech API:', error);
        resolve({
          success: false,
          error: 'Failed to start speech recognition'
        });
      }
    });
  }, []);

  /**
   * Get supported MIME type for MediaRecorder
   */
  const getSupportedMimeType = (): string => {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
      'audio/wav'
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    console.warn('⚠️ No supported MIME type found, using default');
    return 'audio/webm';
  };

  /**
   * Clean up resources
   */
  const cleanup = useCallback(() => {
    console.log('🧹 Cleaning up voice recording resources...');
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    audioChunksRef.current = [];
    mediaRecorderRef.current = null;
    
    setRecordingState({
      isRecording: false,
      isProcessing: false,
      error: null,
      hasPermission: false,
    });
  }, []);

  return {
    startRecording,
    stopRecording,
    recordingState,
    cleanup
  };
};
