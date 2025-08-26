import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  Plus,
  Camera,
  ImageIcon,
  Folder,
  X,
  VideoIcon,
} from 'lucide-react';
import FileUploadButton from './FileUploadButton';
import { processFileForAI } from '../../api/services/chat.service';
import { OpenAIMessage } from '../../types/chat';
import { ChatCompletionContentPart } from "openai/resources/chat/completions";
import { useChat } from '../../contexts/ChatContext';

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
  interpretation: any;
}

interface SpeechRecognitionError extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionError) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface Window {
  webkitSpeechRecognition: new () => SpeechRecognition;
}

interface MessageInputProps {
  onSendMessage: (content: string | OpenAIMessage | ChatCompletionContentPart[]) => Promise<void>;
  isProcessing: boolean;
  videoAvatar: any;
  setVideoAvatar: any;
  onMessageSent?: () => void; // Callback when message is sent
  onInputClear?: () => void; // Callback when input should be cleared
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  isProcessing,
  videoAvatar,
  setVideoAvatar,
  onMessageSent,
  onInputClear,
}) => {
  const [input, setInput] = useState('');
  const [inputKey, setInputKey] = useState(0); // Add key for forcing re-render
  const [shouldClearInput, setShouldClearInput] = useState(false); // Track when input should be cleared
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileMessage, setFileMessage] = useState<ChatCompletionContentPart[] | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const lastMessageSentRef = useRef<boolean>(false);
  const { uploadFileToOpenAI, currentChatId } = useChat();

  // Monitor input state changes
  useEffect(() => {
    console.log('Input state changed to:', input);
  }, [input]);

  // Force input to be empty when it should be cleared
  useEffect(() => {
    if (input === '' && inputRef.current && inputRef.current.value !== '') {
      console.log('Input state is empty but DOM value is not, forcing DOM update');
      inputRef.current.value = '';
    }
  }, [input]);

  // Monitor shouldClearInput flag and clear input when needed
  useEffect(() => {
    if (shouldClearInput) {
      console.log('shouldClearInput flag is true, clearing input');
      
      // Clear input in multiple ways to ensure it works
      setInput('');
      setInputKey(prev => prev + 1);
      
      // Also force DOM update
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      
      // Reset the flag
      setShouldClearInput(false);
      
      // Double-check after a short delay
      setTimeout(() => {
        if (input !== '') {
          console.log('Input still not cleared after delay, forcing again');
          setInput('');
          setInputKey(prev => prev + 1);
        }
      }, 50);
    }
  }, [shouldClearInput]);

  // Monitor lastMessageSentRef and force clear input if message was just sent
  useEffect(() => {
    if (lastMessageSentRef.current && input !== '' && !isTyping) {
      console.log('Message was just sent but input still has content, forcing clear');
      setInput('');
      setInputKey(prev => prev + 1);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      // Reset the ref
      lastMessageSentRef.current = false;
    }
  }, [input, isTyping]);

  // Only clear input when shouldClearInput flag is true and input has content
  useEffect(() => {
    if (shouldClearInput && input !== '') {
      console.log('shouldClearInput flag is true, clearing input');
      setInput('');
      setInputKey(prev => prev + 1);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      // Reset the flag
      setShouldClearInput(false);
    }
  }, [shouldClearInput, input]);

  // Cleanup speech recognition when component unmounts
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error('Error cleaning up speech recognition:', error);
        }
      }
    };
  }, []);

  // Function to force clear input in all possible ways
  const forceClearInput = () => {
    if (isTyping) {
      console.log('User is typing, not clearing input');
      return;
    }
    
    console.log('Force clearing input in all ways');
    setInput('');
    setInputKey(prev => prev + 1);
    setShouldClearInput(true);
    
    // Force DOM update
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  // More aggressive input clearing function
  const aggressiveClearInput = () => {
    if (isTyping) {
      console.log('User is typing, not clearing input aggressively');
      return;
    }
    
    console.log('Aggressive input clearing triggered');
    
    // Clear state
    setInput('');
    setInputKey(prev => prev + 1);
    
    // Clear DOM
    if (inputRef.current) {
      inputRef.current.value = '';
      // Force input to lose focus and regain it to ensure DOM update
      inputRef.current.blur();
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 10);
    }
    
    // Multiple clearing attempts
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        setInput('');
        setInputKey(prev => prev + 1);
        if (inputRef.current) {
          inputRef.current.value = '';
        }
      }, i * 50);
    }
  };

  // recording feature
  const startRecording = () => {
    // check if the browser supports the web speech api
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    
    // Stop any existing recording first
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    
    // create a new speech recognition instance and set the properties
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false; // Changed to false to avoid continuous errors
    recognition.interimResults = true;
    recognition.lang = 'en-US'; // recognition english
    recognition.maxAlternatives = 1; // Limit alternatives to reduce errors

    // set the event handlers setIsRecording to true when the recording starts
    recognition.onstart = () => {
      console.log('Speech recognition started');
      setIsRecording(true);
    };

    // set the event handler to update the input using setInput(transcript)
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      setInput(transcript);
      console.log('Speech transcript:', transcript);
    };

    // when recording error, setIsRecording to false
    recognition.onerror = (event: SpeechRecognitionError) => {
      console.error('Speech recognition error:', event.error);
      
      // Handle specific error types gracefully
      if (event.error === 'no-speech') {
        console.log('No speech detected, stopping recording gracefully');
        // Don't show error for no-speech, just stop recording
      } else if (event.error === 'audio-capture') {
        console.log('Audio capture error, microphone may not be available');
      } else if (event.error === 'not-allowed') {
        console.log('Microphone permission denied');
      } else {
        console.log('Speech recognition error:', event.error);
      }
      
      setIsRecording(false);
    };

    // when recording ends, setIsRecording to false
    recognition.onend = () => {
      console.log('Speech recognition ended');
      setIsRecording(false);
    };

    // start the recording
    try {
      recognition.start();
      recognitionRef.current = recognition;
      
      // Add a timeout to automatically stop recording after 10 seconds
      // This prevents the recording from running indefinitely
      setTimeout(() => {
        if (recognitionRef.current === recognition && isRecording) {
          console.log('Auto-stopping speech recognition due to timeout');
          stopRecording();
        }
      }, 10000);
      
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
    setIsRecording(false);
  };

  const handleMicClick = () => {
    if (isRecording) {
      console.log('Stopping recording...');
      stopRecording();
    } else {
      console.log('Starting recording...');
      startRecording();
    }
  };

  const handleSendMessage1 = async () => {
    if ((!input.trim() && !selectedFile) || isProcessing) return;

    console.log('Before sending, input value:', input);
    
    // Store the current input value before clearing
    const currentInput = input;

    // IMMEDIATELY clear the input before sending the message
    console.log('Clearing input IMMEDIATELY before sending');
    setInput('');
    setInputKey(prev => prev + 1);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    
    // Mark that a message was just sent
    lastMessageSentRef.current = true;
    
    // Notify parent component that input is being cleared
    if (onInputClear) {
      onInputClear();
    }

    try {
      if (selectedFile && fileMessage) {
        // Add user's query to the file message content
        if (Array.isArray(fileMessage)) {
          fileMessage.push({
            type: 'text',
            text: currentInput.trim() || 'Please analyze this file.',
          });
        }
        await onSendMessage(fileMessage);
        setSelectedFile(null);
        setFileMessage(null);
      } else {
        await onSendMessage(currentInput);
      }
      
      console.log('Message sent successfully, input should already be cleared');
      
      // Call the callback if provided
      if (onMessageSent) {
        onMessageSent();
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      // Even if there's an error, don't restore the input
    } finally {
      // Ensure input is cleared even if there's an error
      console.log('Finally block: ensuring input is cleared');
      setInput('');
      setInputKey(prev => prev + 1);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
    
    // Additional safety: force clear input again after a short delay
    setTimeout(() => {
      if (input !== '') {
        console.log('Safety check: input still not cleared, forcing again');
        setInput('');
        setInputKey(prev => prev + 1);
        if (inputRef.current) {
          inputRef.current.value = '';
        }
      }
    }, 100);
    
    console.log('Input cleared, current input state:', input);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    console.log('Key pressed:', event.key);
    if (event.key === 'Enter' && !event.shiftKey) {
      console.log('Enter key pressed, preventing default and sending message');
      event.preventDefault();
      handleSendMessage1();
      // reset the text area 
      setInput('')
    }
  };

  const handleFileSelect = async (file: File) => {
    if (isProcessing) return;
    try {
      if (file.type.startsWith('application/')) {
        console.log("is it going to start uploadFileToOpenAI? ");
        await uploadFileToOpenAI(currentChatId || '', file);
      } else {
        console.log("handlefileselect file is ", file);
        const message = await processFileForAI(file);
        console.log("handlefileselect message is ", message);
        setSelectedFile(file);
        setFileMessage(message);
        setDropdownOpen(false);
      }
    } catch (error) {
      console.error('Error processing file:', error);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setFileMessage(null);
  };

  return (
    <div className="p-4 border-t border-gray-200 fixed bottom-16 w-full bg-white">
      {selectedFile && (
        <div className="mb-2 p-2 bg-gray-100 rounded-lg flex items-center justify-between">
          <span className="text-sm text-gray-600">{selectedFile.name}</span>
          <button
            onClick={clearSelectedFile}
            className="text-gray-500 hover:text-red-500"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex items-center bg-gray-100 rounded-full">
        <div className="relative flex items-center space-x-1 sm:space-x-2 px-2">
          <button
            onClick={() => setDropdownOpen(!isDropdownOpen)}
            className="p-2 text-gray-600 hover:text-navy-blue"
          >
            <Plus size={20} />
          </button>
          {isDropdownOpen && (
            <div className="absolute bottom-16 left-0 bg-white shadow-lg rounded-lg z-10 transform flex flex-col justify-center">
              <FileUploadButton
                type="camera"
                onFileSelect={handleFileSelect}
                accept="image/*"
                icon={Camera}
              />
              <FileUploadButton
                type="image"
                onFileSelect={handleFileSelect}
                accept="image/*"
                icon={ImageIcon}
              />
              <FileUploadButton
                type="document"
                onFileSelect={handleFileSelect}
                accept=".pdf,.doc,.docx,.txt"
                icon={Folder}
              />
            </div>
          )}
        </div>

        <input
          key={inputKey}
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => {
            const newValue = e.target.value;
            console.log('Input changed from', input, 'to', newValue);
            setInput(newValue);
            setIsTyping(true);
            
            // Clear typing flag after user stops typing for 1 second
            clearTimeout((window as any).typingTimer);
            (window as any).typingTimer = setTimeout(() => {
              setIsTyping(false);
            }, 1000);
          }}
          onKeyDown={handleKeyPress}
          onBlur={() => {
            // Ensure input state and DOM are in sync when losing focus
            if (inputRef.current && inputRef.current.value !== input) {
              console.log('Input blur: syncing DOM with state');
              inputRef.current.value = input;
            }
          }}
          placeholder={
            selectedFile ? 'Add your question or description...' : 'Message'
          }
          className="flex-grow bg-transparent border-none focus:outline-none px-4 py-2 text-navy-blue"
          disabled={isProcessing}
        />

        <div className="flex items-center space-x-1 sm:space-x-2 px-2">
          <button 
            onClick={handleMicClick}
            className={`p-2 ${isRecording ? 'text-red-500' : 'text-gray-600 hover:text-navy-blue'}`}
          >
            <Mic size={20} />
          </button>

          <button className="p-2 text-gray-600 hover:text-navy-blue">
            <VideoIcon
              size={20}
              onClick={() => {
                setVideoAvatar(!videoAvatar);
              }}
            />
          </button>
          <button
            onClick={handleSendMessage1}
            disabled={(!input.trim() && !selectedFile) || isProcessing}
            className={`p-2 ${
              (input.trim() || selectedFile) && !isProcessing
                ? 'text-navy-blue hover:text-blue-600'
                : 'text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send size={20} />
          </button>
          
          {/* Test button for debugging */}
          <button
            onClick={() => {
              console.log('Test button clicked, clearing input');
              aggressiveClearInput();
            }}
            className="p-2 text-red-500 hover:text-red-600"
            title="Test clear input"
          >
            🧪
          </button>
        </div>
        
        {/* recording feature popup if mic is clicked */}
        {isRecording && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center animate-fadeIn">
              <p className="text-lg font-semibold text-red-600 mb-2">🎙️ Listening...</p>
              <p className="text-sm text-gray-600">Speak now. Click X button below to stop.</p>
              <button 
                onClick={handleMicClick}
                className={`p-2 text-gray-600 hover:text-navy-blue`}
              >
              <X size={20} />
            </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageInput;
