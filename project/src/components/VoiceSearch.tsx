import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { transcribeWithWhisper, isWhisperApiAvailable, validateAudioForWhisper } from '../utils/whisperApi';
import './VoiceSearch.css';

interface VoiceSearchProps {
  onTranscriptionComplete: (text: string) => void;
  isRecording?: boolean;
  disabled?: boolean;
  className?: string;
}

interface TranscriptionResult {
  text: string;
  confidence?: number;
}

const VoiceSearch: React.FC<VoiceSearchProps> = ({
  onTranscriptionComplete,
  isRecording = false,
  disabled = false,
  className = ''
}) => {
  // State management
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string>('');
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);

  // Refs for audio handling
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);

  // Check for browser compatibility
  const isSpeechRecognitionSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  const isMediaRecorderSupported = 'MediaRecorder' in window;

  // Initialize speech recognition (browser fallback)
  const initializeSpeechRecognition = useCallback(() => {
    if (!isSpeechRecognitionSupported) return null;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscription(finalTranscript || interimTranscript);
      
      if (finalTranscript) {
        handleTranscriptionComplete(finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setError(`Speech recognition error: ${event.error}`);
      setIsListening(false);
      setIsProcessing(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (transcription) {
        handleTranscriptionComplete(transcription);
      }
    };

    return recognition;
  }, [isSpeechRecognitionSupported]);

  // Initialize speech recognition on mount
  useEffect(() => {
    if (isSpeechRecognitionSupported) {
      speechRecognitionRef.current = initializeSpeechRecognition();
    }
  }, [initializeSpeechRecognition]);

  // Check microphone permissions
  const checkMicrophonePermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissionGranted(true);
      stream.getTracks().forEach(track => track.stop()); // Stop the test stream
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setPermissionGranted(false);
      setError('Microphone permission is required for voice search');
      return false;
    }
  }, []);

  // Use the imported Whisper API helper
  const handleWhisperTranscription = async (audioBlob: Blob): Promise<TranscriptionResult> => {
    try {
      const result = await transcribeWithWhisper(audioBlob, {
        language: 'en',
        responseFormat: 'json'
      });
      return { text: result.text };
    } catch (error) {
      console.error('Whisper transcription error:', error);
      throw error;
    }
  };

  // Handle transcription completion
  const handleTranscriptionComplete = useCallback((text: string) => {
    if (text.trim()) {
      onTranscriptionComplete(text.trim());
      setTranscription('');
    }
    setIsProcessing(false);
    setIsListening(false);
  }, [onTranscriptionComplete]);

  // Start recording with MediaRecorder (for Whisper API)
  const startRecordingWithMediaRecorder = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        } 
      });
      
      streamRef.current = stream;
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        if (audioBlob.size > 0) {
          setIsProcessing(true);
          try {
            // Validate audio format
            if (!validateAudioForWhisper(audioBlob)) {
              throw new Error('Unsupported audio format');
            }
            
            // Try Whisper API first
            try {
              const result = await handleWhisperTranscription(audioBlob);
              handleTranscriptionComplete(result.text);
            } catch (whisperError: any) {
              // If Whisper API fails (429, quota exceeded, etc.), fall back to browser SpeechRecognition
              if (whisperError?.message?.includes('429') || 
                  whisperError?.message?.includes('quota') ||
                  whisperError?.message?.includes('exceeded')) {
                console.warn('Whisper API quota exceeded, falling back to browser SpeechRecognition');
                
                // Fallback to browser SpeechRecognition
                if (isSpeechRecognitionSupported) {
                  // Re-initialize speech recognition if needed
                  if (!speechRecognitionRef.current) {
                    speechRecognitionRef.current = initializeSpeechRecognition();
                  }
                  
                  if (speechRecognitionRef.current) {
                    // Set up handlers for fallback recognition
                    const recognition = speechRecognitionRef.current;
                    let finalText = '';
                    
                    recognition.onresult = (event: any) => {
                      for (let i = event.resultIndex; i < event.results.length; i++) {
                        if (event.results[i].isFinal) {
                          finalText += event.results[i][0].transcript;
                        }
                      }
                      if (finalText) {
                        handleTranscriptionComplete(finalText.trim());
                      }
                    };
                    
                    recognition.onend = () => {
                      if (finalText) {
                        handleTranscriptionComplete(finalText.trim());
                      } else {
                        setError('Could not transcribe audio. Please try again.');
                        setIsProcessing(false);
                      }
                    };
                    
                    recognition.onerror = (event: any) => {
                      console.error('SpeechRecognition fallback error:', event.error);
                      setError('Speech recognition failed. Please try again.');
                      setIsProcessing(false);
                    };
                    
                    // Start browser speech recognition
                    recognition.start();
                    setIsListening(true);
                  } else {
                    throw new Error('Whisper API quota exceeded. Browser speech recognition not available.');
                  }
                } else {
                  throw new Error('Whisper API quota exceeded. Browser speech recognition not available.');
                }
              } else {
                // Re-throw other errors
                throw whisperError;
              }
            }
          } catch (error) {
            console.error('Transcription error:', error);
            setError(error instanceof Error ? error.message : 'Failed to transcribe audio. Please try again.');
            setIsProcessing(false);
          }
        } else {
          setError('No audio recorded. Please try again.');
          setIsProcessing(false);
        }

        // Clean up
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsListening(true);
      setError(null);
    } catch (error) {
      console.error('MediaRecorder error:', error);
      setError('Failed to start recording. Please check microphone permissions.');
    }
  }, [handleTranscriptionComplete]);

  // Start recording with SpeechRecognition (browser fallback)
  const startRecordingWithSpeechRecognition = useCallback(() => {
    if (speechRecognitionRef.current) {
      setTranscription('');
      speechRecognitionRef.current.start();
    }
  }, []);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
    }
    
    setIsListening(false);
  }, []);

  // Main start recording function
  const startRecording = useCallback(async () => {
    if (disabled || isListening || isProcessing) return;

    setError(null);
    setTranscription('');

    // Check permissions first
    const hasPermission = await checkMicrophonePermission();
    if (!hasPermission) return;

    // Choose transcription method - prefer browser SpeechRecognition if available
    // to avoid Whisper API quota issues
    if (isSpeechRecognitionSupported) {
      // Use browser SpeechRecognition first (no quota limits)
      startRecordingWithSpeechRecognition();
    } else if (isMediaRecorderSupported && isWhisperApiAvailable()) {
      // Fallback to Whisper API if browser SpeechRecognition not available
      await startRecordingWithMediaRecorder();
    } else {
      setError('Voice search is not supported in this browser');
    }
  }, [disabled, isListening, isProcessing, checkMicrophonePermission, startRecordingWithMediaRecorder, startRecordingWithSpeechRecognition]);

  // Handle button click
  const handleMicClick = useCallback(() => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isListening, startRecording, stopRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
    };
  }, []);

  // Get button state and styling
  const getButtonState = () => {
    if (error) return 'error';
    if (isProcessing) return 'processing';
    if (isListening) return 'listening';
    if (permissionGranted === false) return 'denied';
    return 'idle';
  };

  const buttonState = getButtonState();

  return (
    <div className={`voice-search-container ${className}`}>
      <button
        onClick={handleMicClick}
        disabled={disabled || isProcessing || permissionGranted === false}
        className={`
          voice-search-button
          ${buttonState}
          ${disabled ? 'disabled' : ''}
        `}
        title={
          error ? 'Error occurred' :
          isProcessing ? 'Processing audio...' :
          isListening ? 'Click to stop recording' :
          permissionGranted === false ? 'Microphone permission denied' :
          'Click to start voice search'
        }
      >
        {buttonState === 'processing' && <Loader2 className="animate-spin" size={20} />}
        {buttonState === 'listening' && <MicOff size={20} />}
        {buttonState === 'error' && <AlertCircle size={20} />}
        {buttonState === 'denied' && <AlertCircle size={20} />}
        {buttonState === 'idle' && <Mic size={20} />}
      </button>

      {/* Status indicator */}
      {(isListening || isProcessing || error) && (
        <div className="voice-search-status">
          {isListening && (
            <div className="recording-indicator">
              <div className="pulse-dot"></div>
              <span>Listening...</span>
            </div>
          )}
          {isProcessing && (
            <div className="processing-indicator">
              <Loader2 className="animate-spin" size={16} />
              <span>Processing...</span>
            </div>
          )}
          {error && (
            <div className="error-indicator">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}

      {/* Transcription preview */}
      {transcription && (
        <div className="transcription-preview">
          <span className="transcription-text">{transcription}</span>
        </div>
      )}
    </div>
  );
};

export default VoiceSearch;
