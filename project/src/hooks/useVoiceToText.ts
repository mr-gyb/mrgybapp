import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  VoiceRecognitionState, 
  VoiceRecognitionResult, 
  VoiceRecognitionError, 
  UseVoiceToTextOptions 
} from '../types/voice';

// Extend Window interface to include SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// Type definitions for SpeechRecognition API
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  serviceURI?: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onnomatch: (() => void) | null;
  onspeechstart: (() => void) | null;
  onspeechend: (() => void) | null;
  onsoundstart: (() => void) | null;
  onsoundend: (() => void) | null;
  onaudiostream: (() => void) | null;
  onaudiostart: (() => void) | null;
  onaudioend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

export const useVoiceToText = (options: UseVoiceToTextOptions = {}) => {
  const {
    language = 'en-US',
    continuous = true,
    interimResults = true,
    maxAlternatives = 1,
    onResult,
    onError,
    onStart,
    onEnd
  } = options;

  const [state, setState] = useState<VoiceRecognitionState>({
    isRecording: false,
    isSupported: false,
    isListening: false,
    transcript: '',
    interimTranscript: '',
    finalTranscript: '',
    error: null,
    confidence: 0
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const permissionCheckRef = useRef<boolean>(false);
  
  // Store callbacks in refs to avoid dependency issues
  const callbacksRef = useRef({
    onResult,
    onError,
    onStart,
    onEnd
  });

  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = {
      onResult,
      onError,
      onStart,
      onEnd
    };
  });

  // Detect Safari browser (more robust detection)
  const isSafari = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isSafariUA = /safari/.test(userAgent);
    const isChromeUA = /chrome/.test(userAgent);
    const isEdgeUA = /edg/.test(userAgent);
    // Safari detection: has Safari in UA but not Chrome or Edge
    return isSafariUA && !isChromeUA && !isEdgeUA;
  };

  // Check if SpeechRecognition is supported and initialize
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const isSupported = !!SpeechRecognition;
    const safari = isSafari();
    
    setState(prev => ({ ...prev, isSupported }));

    if (isSupported) {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      // Configure recognition
      // Safari works better with continuous: false for single utterances
      // Chrome/Edge can handle continuous: true
      recognition.continuous = safari ? false : continuous;
      recognition.interimResults = interimResults;
      recognition.lang = language;
      recognition.maxAlternatives = maxAlternatives;
      
      // Safari-specific and general browser configuration
      try {
        // Some browsers support additional configuration
        if ('serviceURI' in recognition) {
          (recognition as any).serviceURI = 'wss://www.google.com/speech-api/full-duplex/v1/up';
        }
        
        // Safari needs longer timeouts for better speech detection
        if (safari) {
          // Try to set longer timeout for speech detection (Safari-specific)
          if ('speechTimeout' in recognition) {
            (recognition as any).speechTimeout = 15000; // 15 seconds for Safari
          }
          
          // Try to set longer timeout for no speech (Safari-specific)
          if ('noSpeechTimeout' in recognition) {
            (recognition as any).noSpeechTimeout = 12000; // 12 seconds for Safari
          }
          
          // Try to configure sensitivity (Safari-specific)
          if ('speechStartTimeout' in recognition) {
            (recognition as any).speechStartTimeout = 8000; // 8 seconds for Safari
          }
        } else {
          // Chrome/Edge configuration
          if ('speechTimeout' in recognition) {
            (recognition as any).speechTimeout = 10000; // 10 seconds
          }
          
          if ('noSpeechTimeout' in recognition) {
            (recognition as any).noSpeechTimeout = 8000; // 8 seconds
          }
          
          if ('speechStartTimeout' in recognition) {
            (recognition as any).speechStartTimeout = 5000; // 5 seconds
          }
        }
      } catch (configError) {
        console.log('Some SpeechRecognition configuration options not supported in this browser');
      }

      // Event handlers
      recognition.onstart = () => {
        console.log('🎤 Voice recognition started');
        setState(prev => ({ 
          ...prev, 
          isRecording: true, 
          isListening: true, 
          error: null 
        }));
        callbacksRef.current.onStart?.();
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = '';
        let finalTranscript = '';
        let confidence = 0;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          confidence = result[0].confidence;

          if (result.isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const fullTranscript = finalTranscript + interimTranscript;
        
        setState(prev => ({
          ...prev,
          transcript: fullTranscript,
          interimTranscript,
          finalTranscript,
          confidence
        }));

        // Call onResult callback
        if (finalTranscript) {
          const result: VoiceRecognitionResult = {
            transcript: finalTranscript,
            confidence,
            isFinal: true
          };
          callbacksRef.current.onResult?.(result);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        // Aborted is a benign condition (e.g., manual stop or quick restart); don't surface as error
        if (event.error === 'aborted') {
          setState(prev => ({
            ...prev,
            isRecording: false,
            isListening: false
          }));
          callbacksRef.current.onEnd?.();
          return;
        }

        // "no-speech" is a normal condition when user doesn't speak or stops speaking
        // Don't treat it as an error - just silently stop recording
        if (event.error === 'no-speech') {
          console.log('🎤 No speech detected (normal condition)');
          setState(prev => ({
            ...prev,
            isRecording: false,
            isListening: false,
            error: null // Don't set error for no-speech
          }));
          callbacksRef.current.onEnd?.();
          return;
        }

        // For other errors, log and handle them
        console.error('🎤 Voice recognition error:', event.error);
        
        // Handle different error types with user-friendly messages
        let userFriendlyError = event.error;
        let shouldRetry = false;
        
        switch (event.error) {
          case 'audio-capture':
            // Audio-capture error usually means permission issue or microphone in use
            // Provide clear, actionable guidance
            if (!navigator.onLine) {
              userFriendlyError = 'No internet connection. Speech recognition requires internet access.';
            } else {
              // Create a helpful error message with actionable steps
              const browserName = navigator.userAgent.includes('Chrome') ? 'Chrome' :
                                  navigator.userAgent.includes('Safari') ? 'Safari' :
                                  navigator.userAgent.includes('Edge') ? 'Edge' : 'browser';
              
              userFriendlyError = 'Microphone not accessible. Quick fixes:\n\n' +
                '🔓 Browser Permissions:\n' +
                '  • Click the lock icon (🔒) in your browser\'s address bar\n' +
                '  • Find "Microphone" and set it to "Allow"\n' +
                '  • Refresh the page and try again\n\n' +
                '🎤 System Settings:\n' +
                '  • Check your system microphone permissions\n' +
                '  • Ensure microphone is not muted\n' +
                '  • Close other apps that might be using the microphone\n\n' +
                '🔄 Still not working?\n' +
                '  • Try refreshing the page\n' +
                '  • Check if your microphone works in other apps\n' +
                '  • Restart your browser';
              
              shouldRetry = true; // Allow retry after user fixes permissions
            }
            // Reset permission check flag so we can try again
            permissionCheckRef.current = false;
            break;
          case 'not-allowed':
            userFriendlyError = 'Microphone access denied. Please:\n1. Click the lock icon in your browser\'s address bar\n2. Allow microphone access\n3. Refresh the page and try again';
            // Reset permission check flag so we can try again
            permissionCheckRef.current = false;
            break;
          case 'network':
            userFriendlyError = 'Network error. Please check your internet connection.';
            shouldRetry = true;
            break;
          case 'service-not-allowed':
            userFriendlyError = 'Speech recognition service not allowed. Please check your browser settings.';
            break;
          case 'bad-grammar':
            userFriendlyError = 'Speech recognition grammar error.';
            break;
          case 'language-not-supported':
            userFriendlyError = 'Language not supported for speech recognition.';
            break;
          default:
            userFriendlyError = `Speech recognition error: ${event.error}`;
            shouldRetry = true;
        }
        
        const error: VoiceRecognitionError = {
          error: userFriendlyError,
          type: event.error as any,
          shouldRetry
        };

        setState(prev => ({
          ...prev,
          error: userFriendlyError,
          isRecording: false,
          isListening: false
        }));

        callbacksRef.current.onError?.(error);
        
        // Auto-retry for network errors with exponential backoff (but not for no-speech)
        if (shouldRetry && event.error === 'network') {
          const retryCount = (recognitionRef.current as any)?._retryCount || 0;
          const maxRetries = 3;
          
          if (retryCount < maxRetries) {
            const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 5000); // Exponential backoff, max 5s
            
            retryTimeoutRef.current = setTimeout(() => {
              console.log(`🔄 Auto-retrying speech recognition after network error (attempt ${retryCount + 1}/${maxRetries})...`);
              if (recognitionRef.current && !state.isRecording) {
                try {
                  // Mark retry count
                  (recognitionRef.current as any)._retryCount = retryCount + 1;
                  recognitionRef.current.start();
                } catch (retryError) {
                  console.log('Retry failed, user can manually try again');
                }
              }
            }, retryDelay);
          }
        }
      };

      recognition.onend = () => {
        console.log('🎤 Voice recognition ended');
        setState(prev => ({
          ...prev,
          isRecording: false,
          isListening: false
        }));
        callbacksRef.current.onEnd?.();
      };

      recognition.onnomatch = () => {
        // This is similar to no-speech - just means nothing was recognized
        // Don't treat it as an error
        console.log('🎤 No speech was recognized (normal condition)');
        setState(prev => ({
          ...prev,
          isRecording: false,
          isListening: false,
          error: null
        }));
        callbacksRef.current.onEnd?.();
      };

      recognition.onspeechstart = () => {
        console.log('🎤 Speech has been detected');
      };

      recognition.onspeechend = () => {
        console.log('🎤 Speech has stopped being detected');
      };

      recognition.onsoundstart = () => {
        console.log('🎤 Sound has been detected');
      };

      recognition.onsoundend = () => {
        console.log('🎤 Sound has stopped being detected');
      };

      recognition.onaudiostart = () => {
        console.log('🎤 Audio capture has started');
      };

      recognition.onaudioend = () => {
        console.log('🎤 Audio capture has ended');
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [language, continuous, interimResults, maxAlternatives]); // Removed callback dependencies

  // Check microphone permission (optional - doesn't block if it fails)
  // Speech recognition API will handle permission prompts naturally
  const checkMicrophonePermission = useCallback(async (): Promise<boolean> => {
    // Skip if we already checked recently (cached success)
    if (permissionCheckRef.current) {
      return true;
    }

    try {
      // Check if permissions API is available (optional check)
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          
          if (permissionStatus.state === 'denied') {
            // Permission explicitly denied - provide guidance but don't block
            console.warn('⚠️ Microphone permission denied in browser settings');
            // Don't set error state here - let speech recognition API try and fail gracefully
            return false;
          }
          
          // Permission is granted or prompt - we're good to try
          if (permissionStatus.state === 'granted') {
            permissionCheckRef.current = true;
          }
        } catch (permError) {
          // Permissions API might not be supported (e.g., Safari)
          // That's okay - we'll proceed and let getUserMedia prompt naturally
          console.log('Permissions API not available, will rely on getUserMedia prompt');
        }
      }

      // Optionally try to access microphone (this will prompt if needed)
      // But don't block if it fails - let speech recognition API try
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Stop the test stream immediately - we just wanted to check permissions
        stream.getTracks().forEach(track => track.stop());
        permissionCheckRef.current = true;
        console.log('✅ Microphone permission verified');
        return true;
      } catch (getUserMediaError: any) {
        // getUserMedia failed, but that's okay - speech recognition will try
        // Just log it for debugging
        console.log('getUserMedia check failed (non-blocking):', getUserMediaError.name);
        
        // Only block if permission is explicitly denied
        if (getUserMediaError.name === 'NotAllowedError' || getUserMediaError.name === 'PermissionDeniedError') {
          console.warn('⚠️ Microphone permission denied');
          return false;
        }
        
        // For other errors, let speech recognition API try (it might work)
        return true;
      }
    } catch (error: any) {
      // Any error in permission check - don't block, let speech recognition try
      console.log('Permission check had an issue (non-blocking), proceeding anyway');
      return true;
    }
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    if (!recognitionRef.current || state.isRecording) {
      return;
    }

    try {
      // Optionally check microphone permissions (non-blocking)
      // Speech recognition API will handle permission prompts naturally
      await checkMicrophonePermission().catch(() => {
        // Permission check failed but don't block - let speech recognition try
        console.log('Permission check had issues, but proceeding with speech recognition');
      });

      // Clear any existing retry timeout
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      
      // Reset retry count
      if (recognitionRef.current) {
        (recognitionRef.current as any)._retryCount = 0;
      }
      
      // Clear previous state
      setState(prev => ({
        ...prev,
        transcript: '',
        interimTranscript: '',
        finalTranscript: '',
        error: null
      }));

      console.log('🎤 Starting voice recognition...');
      recognitionRef.current.start();
    } catch (error) {
      console.error('🎤 Error starting recording:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to start recording. The browser may prompt for microphone permission - please allow it.',
        isRecording: false
      }));
    }
  }, [state.isRecording, checkMicrophonePermission]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (!recognitionRef.current || !state.isRecording) {
      return;
    }

    try {
      recognitionRef.current.stop();
    } catch (error) {
      console.error('🎤 Error stopping recording:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to stop recording',
        isRecording: false
      }));
    }
  }, [state.isRecording]);

  // Toggle recording
  const toggleRecording = useCallback(() => {
    if (state.isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [state.isRecording, startRecording, stopRecording]);

  // Clear transcript
  const clearTranscript = useCallback(() => {
    setState(prev => ({
      ...prev,
      transcript: '',
      interimTranscript: '',
      finalTranscript: '',
      error: null
    }));
  }, []);

  // Reset state
  const reset = useCallback(() => {
    stopRecording();
    clearTranscript();
  }, [stopRecording, clearTranscript]);

  return {
    // State
    ...state,
    
    // Actions
    startRecording,
    stopRecording,
    toggleRecording,
    clearTranscript,
    reset,
    
    // Computed values
    hasTranscript: state.transcript.length > 0,
    hasError: !!state.error,
    isReady: state.isSupported && !state.isRecording && !state.error
  };
};