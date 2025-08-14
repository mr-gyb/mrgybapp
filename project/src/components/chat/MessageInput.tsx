import React, { useState, useRef } from 'react';
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
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  isProcessing,
  videoAvatar,
  setVideoAvatar,
}) => {
  const [input, setInput] = useState('');
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileMessage, setFileMessage] = useState<ChatCompletionContentPart[] | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { uploadFileToOpenAI, currentChatId } = useChat();

  // recording feature
  const startRecording = () => {
    // check if the browser supports the web speech api
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    // create a new speech recognition instance and set the properties
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US'; // recognition english

    // set the event handlers setIsRecording to true when the recording starts
    recognition.onstart = () => {
      setIsRecording(true);
    };

    // set the event handler to update the input using setInput(transcript)
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      setInput(transcript);
    };

    // when recording error, setIsRecording to false
    recognition.onerror = (event: SpeechRecognitionError) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    // when recording ends, setIsRecording to false
    recognition.onend = () => {
      setIsRecording(false);
    };

    // start the recording
    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleSendMessage1 = async () => {
    if ((!input.trim() && !selectedFile) || isProcessing) return;

    if (selectedFile && fileMessage) {
      // Add user's query to the file message content
      if (Array.isArray(fileMessage)) {
        fileMessage.push({
          type: 'text',
          text: input.trim() || 'Please analyze this file.',
        });
      }
      await onSendMessage(fileMessage);
      setSelectedFile(null);
      setFileMessage(null);
    } else {
      await onSendMessage(input);
    }
    setInput('');
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage1();
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
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
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
