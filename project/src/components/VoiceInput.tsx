import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react';
import { useVoiceToText } from '../hooks/useVoiceToText';
import { transcribeWithWhisper, isWhisperApiAvailable, validateAudioForWhisper } from '../utils/whisperApi';
import { VoiceInputProps } from '../types/voice';
import { VoiceTroubleshooting } from './VoiceTroubleshooting';

const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscript,
  onError,
  disabled = false,
  className = '',
  placeholder = 'Click mic to start voice input...',
  showTranscript = true,
  autoSubmit = false
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [isAltRecording, setIsAltRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const isAltRecordingRef = useRef(false);

  // Store callbacks in refs to avoid dependency issues
  const callbacksRef = useRef({
    onTranscript,
    onError
  });

  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = {
      onTranscript,
      onError
    };
  }, [onTranscript, onError]);

  const {
    isRecording,
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    finalTranscript,
    error,
    confidence,
    hasTranscript,
    hasError,
    toggleRecording,
    clearTranscript,
    reset
  } = useVoiceToText({
    language: 'en-US',
    continuous: true,
    interimResults: true,
    onResult: (result) => {
      if (result.isFinal) {
        setInputValue(result.transcript);
        callbacksRef.current.onTranscript?.(result.transcript);
        
        if (autoSubmit) {
          setIsProcessing(true);
          // Auto-submit after a short delay
          setTimeout(() => {
            setIsProcessing(false);
            clearTranscript();
          }, 1000);
        }
      }
    },
    onError: (error) => {
      // Silently handle no-speech, aborted, and audio-capture errors (these are normal conditions)
      if (error.type === 'no-speech' || error.type === 'aborted') {
        // These are normal - user didn't speak or manually stopped
        // Don't log as errors or show to user
        return;
      }
      
      console.error('Voice recognition error:', error);
      
      // Only fall back to Whisper on critical errors
      const isCriticalError = error.type !== 'audio-capture';
      
      if (isCriticalError && isWhisperApiAvailable()) {
        try {
          if (isRecording) {
            toggleRecording();
          }
          // Wait a bit to ensure SR is fully stopped
          setTimeout(() => {
            startAltRecording();
          }, 100);
          return;
        } catch (e) {
          console.error('Fallback to Whisper failed:', e);
        }
      }
      
      // Show error for critical errors or if fallback isn't available
      if (isCriticalError || !isWhisperApiAvailable()) {
        callbacksRef.current.onError?.(error.error || 'Voice recognition error');
      }
    },
    onStart: () => {
      console.log('Voice recording started');
    },
    onEnd: () => {
      console.log('Voice recording ended');
    }
  });

  // Try Web Speech API first (free, no quota), fallback to Whisper if needed
  const preferWhisper = !isSupported && isWhisperApiAvailable();

  // Update input value when transcript changes
  useEffect(() => {
    if (transcript) {
      setInputValue(transcript);
    }
  }, [transcript]);

  // Handle manual input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onTranscript?.(inputValue.trim());
      setInputValue('');
      clearTranscript();
    }
  };

  // Handle mic button click
  const stopAltRecording = async () => {
    if (!mediaRecorderRef.current) return;
    mediaRecorderRef.current.stop();
    setIsAltRecording(false);
    isAltRecordingRef.current = false;
  };

  const startAltRecording = async () => {
    try {
      setIsProcessing(false);
      setIsAltRecording(true);
      isAltRecordingRef.current = true;
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 16000, channelCount: 1 }
      });
      streamRef.current = stream;
      audioChunksRef.current = [];
      let mediaRecorder: MediaRecorder;
      try {
        mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      } catch (_e) {
        // Fallback to default mimeType when specific codec unsupported (iOS/Safari)
        mediaRecorder = new MediaRecorder(stream);
      }
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      mediaRecorder.onstop = async () => {
        setIsAltRecording(false);
        isAltRecordingRef.current = false;
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
          streamRef.current = null;
        }
        if (audioBlob.size === 0) {
          setIsProcessing(false);
          return;
        }
        try {
          setIsProcessing(true);
          if (!validateAudioForWhisper(audioBlob)) {
            throw new Error('Unsupported audio format');
          }
          const result = await transcribeWithWhisper(audioBlob);
          setInputValue(result.text);
          callbacksRef.current.onTranscript?.(result.text);
          if (autoSubmit) {
            callbacksRef.current.onTranscript?.(result.text);
          }
        } catch (err: any) {
          console.error('Whisper transcription error:', err);
          const message = err?.message || '';
          // If OpenAI quota exceeded (429), fall back to on-device Web Speech if available
          if ((/429/.test(message) || /quota/i.test(message)) && isSupported) {
            callbacksRef.current.onError?.('OpenAI quota exceeded. Switching to on-device speech recognition...');
            try {
              // Give a brief pause to ensure MediaRecorder stream is released
              setTimeout(() => {
                // Start Web Speech recognition as a fallback
                if (!isRecording) {
                  toggleRecording();
                }
              }, 200);
            } catch {}
          } else {
            callbacksRef.current.onError?.(message || 'Voice transcription failed');
          }
        } finally {
          setIsProcessing(false);
        }
      };
      mediaRecorder.start();
      console.log('🎤 Whisper recording started');
    } catch (err: any) {
      setIsAltRecording(false);
      isAltRecordingRef.current = false;
      console.error('Alt recording error:', err);
      callbacksRef.current.onError?.(err?.message || 'Microphone error');
    }
  };

  const handleMicClick = () => {
    if (disabled) return;
    
    // Try Web Speech API first (free, no quota) - works on Chrome and Safari
    if (isSupported) {
      if (isRecording) {
        toggleRecording();
      } else {
        // Don't pre-check permissions - let speech recognition API handle it naturally
        // This avoids double prompts and permission conflicts
        setInputValue('');
        clearTranscript();
        toggleRecording();
      }
      return;
    }
    
    // If Web Speech not supported, use Whisper as fallback
    if (preferWhisper) {
      if (!isWhisperApiAvailable()) {
        callbacksRef.current.onError?.('Voice transcription requires VITE_OPENAI_API_KEY. Please configure it.');
        return;
      }
      if (isAltRecording || mediaRecorderRef.current) {
        stopAltRecording();
      } else {
        setInputValue('');
        clearTranscript();
        startAltRecording();
      }
      return;
    }
    
    // No voice support available
    callbacksRef.current.onError?.('Voice input not supported in this browser. Web Speech API not available.');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
      } catch {}
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      clearTranscript();
    };
  }, []);

  // Get mic button icon
  const getMicIcon = () => {
    if (isAltRecording) return <MicOff size={20} />;
    if (!isSupported && !preferWhisper) return <VolumeX size={20} />;
    if (isRecording) return <MicOff size={20} />;
    return <Mic size={20} />;
  };

  // Get mic button color
  const getMicButtonColor = () => {
    if (isAltRecording) return 'bg-red-500 hover:bg-red-600';
    if (!isSupported && !preferWhisper) return 'bg-gray-400 cursor-not-allowed';
    if (isRecording) return 'bg-red-500 hover:bg-red-600';
    if (hasError) return 'bg-yellow-500 hover:bg-yellow-600';
    return 'bg-blue-500 hover:bg-blue-600';
  };

  // Get status indicator
  const getStatusIndicator = () => {
    if (isProcessing) {
      return (
        <div className="flex items-center text-blue-500 text-sm">
          <Volume2 size={16} className="mr-1 animate-pulse" />
          Processing transcription...
        </div>
      );
    }

    if (isAltRecording) {
      return (
        <div className="flex items-center text-red-500 text-sm">
          <Volume2 size={16} className="mr-1 animate-pulse" />
          Recording... (click to stop)
        </div>
      );
    }

    if (!isSupported && !preferWhisper) {
      return (
        <div className="flex items-center text-gray-500 text-sm">
          <AlertCircle size={16} className="mr-1" />
          Voice input not supported
        </div>
      );
    }

    if (hasError) {
      return (
        <div className="flex items-center text-red-500 text-sm">
          <AlertCircle size={16} className="mr-1" />
          {error}
        </div>
      );
    }

    if (isRecording) {
      return (
        <div className="flex items-center text-red-500 text-sm">
          <Volume2 size={16} className="mr-1 animate-pulse" />
          {isListening ? 'Listening...' : 'Processing...'}
        </div>
      );
    }

    if (hasTranscript) {
      return (
        <div className="flex items-center text-green-500 text-sm">
          <CheckCircle size={16} className="mr-1" />
          Ready to send
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`voice-input-container ${className}`}>
      {/* Main input form */}
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        {/* Text input */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          />
          
          {/* Transcript overlay for interim results */}
          {showTranscript && interimTranscript && !finalTranscript && (
            <div className="absolute inset-0 px-4 py-2 text-gray-500 dark:text-gray-400 pointer-events-none">
              {interimTranscript}
            </div>
          )}
        </div>

        {/* Mic button */}
        <button
          type="button"
          onClick={handleMicClick}
          disabled={disabled || (!isSupported && !preferWhisper)}
          className={`p-2 rounded-lg text-white transition-colors duration-200 ${getMicButtonColor()} disabled:opacity-50 disabled:cursor-not-allowed`}
          title={(isAltRecording || isRecording) ? 'Stop recording' : 'Start recording'}
        >
          {getMicIcon()}
        </button>

        {/* Help button */}
        <button
          type="button"
          onClick={() => setShowTroubleshooting(true)}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-200"
          title="Voice recognition help"
        >
          <HelpCircle size={20} />
        </button>

        {/* Submit button */}
        <button
          type="submit"
          disabled={disabled || !inputValue.trim()}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
        >
          Send
        </button>
      </form>

      {/* Status indicator */}
      {getStatusIndicator() && (
        <div className="mt-2">
          {getStatusIndicator()}
        </div>
      )}

      {/* Confidence indicator */}
      {hasTranscript && confidence > 0 && (
        <div className="mt-1 text-xs text-gray-500">
          Confidence: {Math.round(confidence * 100)}%
        </div>
      )}

      {/* Clear button */}
      {hasTranscript && (
        <button
          onClick={() => {
            setInputValue('');
            clearTranscript();
          }}
          className="mt-2 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          Clear
        </button>
      )}

      {/* Troubleshooting modal */}
      <VoiceTroubleshooting
        isVisible={showTroubleshooting}
        onClose={() => setShowTroubleshooting(false)}
      />
    </div>
  );
};

export default VoiceInput;
