import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Send,
  Mic,
  Plus,
  Camera,
  ImageIcon,
  Folder,
  X,
  VideoIcon,
  MessageCirclePlus,
} from 'lucide-react';
import FileUploadButton from './FileUploadButton';
import { processFileForAI } from '../../api/services/chat.service';
import { OpenAIMessage } from '../../types/chat';
import { ChatCompletionContentPart } from "openai/resources/chat/completions";
import { useChat } from '../../contexts/ChatContext';
import { useFriendService } from '../../hooks/useFriendService';
import { useToast } from '../../hooks/useToast';
import { AI_USERS } from '../../types/user';
import { ChatParticipant } from '../../types/chat';
import { UserProfile as FriendProfile } from '../../types/friendship';
import { useAuth } from '../../contexts/AuthContext';
import {
  collection as firestoreCollection,
  doc as firestoreDoc,
  setDoc,
  serverTimestamp,
  getDocs as firestoreGetDocs,
  query as firestoreQuery,
  where as firestoreWhere,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import CommunityAvatar from '../community/CommunityAvatar';
import { useNavigate } from 'react-router-dom';

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
  const [showParticipantMenu, setShowParticipantMenu] = useState(false);
  const [showFriendModal, setShowFriendModal] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [friendSearch, setFriendSearch] = useState('');
  const [debouncedFriendSearch, setDebouncedFriendSearch] = useState('');
  const [agentSearch, setAgentSearch] = useState('');
  const [isAddingParticipant, setIsAddingParticipant] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const lastMessageSentRef = useRef<boolean>(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const participantTriggerRef = useRef<HTMLButtonElement>(null);
  const participantPopoverRef = useRef<HTMLDivElement>(null);
  const friendModalRef = useRef<HTMLDivElement>(null);
  const agentModalRef = useRef<HTMLDivElement>(null);
  const friendSearchRef = useRef<HTMLInputElement>(null);
  const friendPrimaryButtonRef = useRef<HTMLButtonElement>(null);
  const agentPrimaryButtonRef = useRef<HTMLButtonElement>(null);
  const { uploadFileToOpenAI, currentChatId, chats, addParticipant, quotaError } = useChat();
  const { user, userData } = useAuth();
  const { friends, loadFriends, loading: friendsLoading, sendRequest } = useFriendService();
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();

  const currentChat = chats.find((chat) => chat.id === currentChatId);
  const existingParticipantIds = new Set(currentChat?.participants?.map((p) => p.uid) || []);

  const focusableSelector =
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

  const trapFocus = useCallback((event: KeyboardEvent, container: HTMLElement | null) => {
    if (!container) {
      return;
    }
    const focusable = Array.from(
      container.querySelectorAll<HTMLElement>(focusableSelector)
    ).filter((node) => !node.hasAttribute('disabled') && node.getAttribute('tabindex') !== '-1');

    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (event.shiftKey) {
      if (active === first || active === container) {
        event.preventDefault();
        last.focus();
      }
    } else if (active === last || active === container) {
      event.preventDefault();
      first.focus();
    }
  }, []);

  const closeParticipantMenu = useCallback(() => {
    setShowParticipantMenu(false);
  }, []);

  const closeFriendModal = useCallback(() => {
    setShowFriendModal(false);
    setFriendSearch('');
    setDebouncedFriendSearch('');
    setInviteLoading(false);
  }, []);

  const closeAgentModal = useCallback(() => {
    setShowAgentModal(false);
    setAgentSearch('');
  }, []);

  const isValidEmail = useCallback((value: string) => {
    const email = value.trim();
    if (!email) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, []);

  useEffect(() => {
    if (showFriendModal) {
      loadFriends();
    }
  }, [showFriendModal, loadFriends]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedFriendSearch(friendSearch.trim());
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [friendSearch]);

  useEffect(() => {
    if (!showParticipantMenu) {
      return;
    }

    if (typeof document === 'undefined') {
      return;
    }

    const container = participantPopoverRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const firstButton =
      friendPrimaryButtonRef.current ||
      (container ? (container.querySelector('button') as HTMLButtonElement | null) : null);
    firstButton?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeParticipantMenu();
        return;
      }
      if (event.key === 'Tab') {
        trapFocus(event, container);
      }
    };

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        container?.contains(target) ||
        participantTriggerRef.current?.contains(target)
      ) {
        return;
      }
      closeParticipantMenu();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
      previouslyFocused?.focus?.();
    };
  }, [showParticipantMenu, closeParticipantMenu, trapFocus]);

  useEffect(() => {
    if (!showFriendModal) {
      return;
    }

    if (typeof document === 'undefined') {
      return;
    }

    const container = friendModalRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    window.setTimeout(() => {
      friendSearchRef.current?.focus();
    }, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeFriendModal();
        return;
      }
      if (event.key === 'Tab') {
        trapFocus(event, container);
      }
    };

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (container?.contains(target)) {
        return;
      }
      closeFriendModal();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
      previouslyFocused?.focus?.();
    };
  }, [showFriendModal, closeFriendModal, trapFocus]);

  useEffect(() => {
    if (!showAgentModal) {
      return;
    }

    if (typeof document === 'undefined') {
      return;
    }

    const container = agentModalRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusTarget =
      container?.querySelector('input, button') as HTMLElement | null;
    window.setTimeout(() => focusTarget?.focus(), 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeAgentModal();
        return;
      }
      if (event.key === 'Tab') {
        trapFocus(event, container);
      }
    };

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (container?.contains(target)) {
        return;
      }
      closeAgentModal();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
      previouslyFocused?.focus?.();
    };
  }, [showAgentModal, closeAgentModal, trapFocus]);

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
    emitTypingState(false);
    setIsTyping(false);
    
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
      emitTypingState(false);
      setIsTyping(false);
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

  const emitTypingState = async (active: boolean) => {
    if (!currentChatId || !user) return;
    try {
      await setDoc(
        firestoreDoc(firestoreCollection(db, 'chats', currentChatId, 'typing'), user.uid),
        {
          uid: user.uid,
          displayName: userData?.name || user.displayName || user.email || 'You',
          type: 'user',
          isTyping: active,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error('Failed to emit typing state:', error);
    }
  };

  const scheduleTypingTimeout = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      emitTypingState(false);
    }, 1500);
  };

  const agentCatalog = Object.values(AI_USERS);

  const filteredFriends = useMemo(() => {
    const query = debouncedFriendSearch.toLowerCase();
    if (!query) {
      return friends;
    }

    return friends.filter((friend) => {
      const name = friend.name?.toLowerCase() ?? '';
      const email = friend.email?.toLowerCase() ?? '';
      return name.includes(query) || email.includes(query);
    });
  }, [friends, debouncedFriendSearch]);

  const filteredAgents = agentCatalog.filter((agent) =>
    agent.name.toLowerCase().includes(agentSearch.toLowerCase()) ||
    agent.username.toLowerCase().includes(agentSearch.toLowerCase())
  );

  const normalizedEmailQuery = debouncedFriendSearch.trim().toLowerCase();
  const isEmailQuery = isValidEmail(debouncedFriendSearch);
  const alreadyFriendByEmail = friends.some(
    (friend) => (friend.email || '').toLowerCase() === normalizedEmailQuery
  );
  const shouldShowInviteCard =
    isEmailQuery &&
    !friendsLoading &&
    debouncedFriendSearch.length > 0 &&
    !alreadyFriendByEmail &&
    (user?.email ? user.email.toLowerCase() !== normalizedEmailQuery : true);

  const handleInviteByEmail = useCallback(async () => {
    if (!user?.uid) {
      showError('You must be signed in to send friend requests.');
      return;
    }

    if (!isEmailQuery) {
      return;
    }

    setInviteLoading(true);
    try {
      const usersRef = firestoreCollection(db, 'users');
      let snapshot = await firestoreGetDocs(
        firestoreQuery(usersRef, firestoreWhere('email', '==', normalizedEmailQuery))
      );

      if (snapshot.empty) {
        snapshot = await firestoreGetDocs(
          firestoreQuery(usersRef, firestoreWhere('emailLowercase', '==', normalizedEmailQuery))
        );
      }

      if (snapshot.empty) {
        showError('No user found with that email.');
        return;
      }

      const targetDoc = snapshot.docs[0];

      if (targetDoc.id === user.uid) {
        showError('You cannot send a friend request to yourself.');
        return;
      }

      const success = await sendRequest(targetDoc.id);
      if (success) {
        showSuccess('Friend request sent');
        closeFriendModal();
        closeParticipantMenu();
      } else {
        showError('Failed to send friend request');
      }
    } catch (error: any) {
      console.error('Failed to send friend request:', error);
      showError(error?.message || 'Failed to send friend request');
    } finally {
      setInviteLoading(false);
    }
  }, [
    user?.uid,
    normalizedEmailQuery,
    isEmailQuery,
    sendRequest,
    showError,
    showSuccess,
    closeFriendModal,
    closeParticipantMenu,
  ]);

  const handleAddFriendToChat = async (friend: FriendProfile) => {
    if (!currentChatId) {
      showError('Select a chat before adding participants.');
      return;
    }

    if (existingParticipantIds.has(friend.uid)) {
      showError('Already in this chat.');
      return;
    }

    const participant: ChatParticipant = {
      uid: friend.uid,
      type: 'user',
      displayName: friend.name || friend.email,
    };

    setIsAddingParticipant(true);
    try {
      const status = await addParticipant(currentChatId, participant);
      if (status === 'exists') {
        showError('Already in this chat.');
      } else {
        showSuccess(`${participant.displayName} just joined the chat.`);
      }
      closeFriendModal();
      closeParticipantMenu();
    } catch (error: any) {
      console.error(error);
      showError(error?.message || 'Failed to add participant.');
    } finally {
      setIsAddingParticipant(false);
    }
  };

  const handleAddAgentToChat = async (agent: typeof agentCatalog[number]) => {
    if (!currentChatId) {
      showError('Select a chat before adding participants.');
      return;
    }

    if (existingParticipantIds.has(agent.id)) {
      showError('Already in this chat.');
      return;
    }

    const participant: ChatParticipant = {
      uid: agent.id,
      type: 'agent',
      displayName: agent.name,
      photoURL: agent.profile_image_url,
    };

    setIsAddingParticipant(true);
    try {
      const status = await addParticipant(currentChatId, participant);
      if (status === 'exists') {
        showError('Already in this chat.');
      } else {
        showSuccess(`${agent.name} just joined the chat.`);
      }
      closeAgentModal();
      closeParticipantMenu();
    } catch (error: any) {
      console.error(error);
      showError(error?.message || 'Failed to add agent.');
    } finally {
      setIsAddingParticipant(false);
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      emitTypingState(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChatId]);

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
          id="message-input"
          name="message"
          type="text"
          value={input}
          onChange={(e) => {
            const newValue = e.target.value;
            console.log('Input changed from', input, 'to', newValue);
            setInput(newValue);
            setIsTyping(true);
            emitTypingState(true);
            scheduleTypingTimeout();
          }}
          onKeyDown={handleKeyPress}
          onBlur={() => {
            // Ensure input state and DOM are in sync when losing focus
            if (inputRef.current && inputRef.current.value !== input) {
              console.log('Input blur: syncing DOM with state');
              inputRef.current.value = input;
            }
            setIsTyping(false);
            emitTypingState(false);
          }}
          placeholder={
            quotaError 
              ? 'AI quota exceeded. Please wait...' 
              : selectedFile 
                ? 'Add your question or description...' 
                : 'Message'
          }
          className="flex-grow bg-transparent border-none focus:outline-none px-4 py-2 text-navy-blue"
          disabled={isProcessing || !!quotaError}
        />

        <div className="flex items-center space-x-1 sm:space-x-2 px-2">
          <button 
            onClick={handleMicClick}
            disabled={!!quotaError}
            className={`p-2 ${isRecording ? 'text-red-500' : quotaError ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:text-navy-blue'}`}
            title={quotaError ? 'AI quota exceeded. Please wait...' : 'Voice input'}
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
          <div className="relative">
            <button
              ref={participantTriggerRef}
              onClick={() => setShowParticipantMenu((prev) => !prev)}
              className="p-2 text-gray-600 hover:text-navy-blue"
              title="Add participants"
              aria-haspopup="dialog"
              aria-expanded={showParticipantMenu}
              aria-controls="add-participant-popover"
            >
              <MessageCirclePlus size={20} />
            </button>
            {showParticipantMenu && (
              <div
                ref={participantPopoverRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="add-participant-heading"
                id="add-participant-popover"
                className="absolute bottom-14 right-0 z-30 w-60 space-y-3 rounded-lg border border-gray-200 bg-white p-4 shadow-xl"
              >
                <p
                  id="add-participant-heading"
                  className="text-center text-sm font-medium text-gray-800"
                >
                  Who do you want to add to this chat?
                </p>
                <button
                  ref={friendPrimaryButtonRef}
                  className="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600"
                  onClick={() => {
                    setShowFriendModal(true);
                    closeParticipantMenu();
                    setFriendSearch('');
                  }}
                >
                  A Friend
                </button>
                <button
                  ref={agentPrimaryButtonRef}
                  className="w-full rounded-md bg-yellow-300 px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-yellow-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-yellow-400"
                  onClick={() => {
                    setShowAgentModal(true);
                    closeParticipantMenu();
                    setAgentSearch('');
                  }}
                >
                  An AI Expert
                </button>
              </div>
            )}
          </div>
          <button
            onClick={handleSendMessage1}
            disabled={(!input.trim() && !selectedFile) || isProcessing || !!quotaError}
            className={`p-2 ${
              (input.trim() || selectedFile) && !isProcessing && !quotaError
                ? 'text-navy-blue hover:text-blue-600'
                : 'text-gray-400 cursor-not-allowed'
            }`}
            title={quotaError ? 'AI quota exceeded. Please wait...' : 'Send message'}
          >
            <Send size={20} />
          </button>
        </div>
        
        {/* Friend selection modal */}
        {showFriendModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onMouseDown={closeFriendModal}
          >
            <div
              ref={friendModalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="add-friend-heading"
              className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 id="add-friend-heading" className="text-lg font-semibold text-navy-blue">
                  Add a Friend to this Chat
                </h3>
                <button
                  onClick={closeFriendModal}
                  className="rounded-full p-1 text-gray-500 hover:text-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-navy-blue"
                  aria-label="Close friend selector"
                >
                  <X size={18} />
                </button>
              </div>
              <input
                ref={friendSearchRef}
                type="text"
                value={friendSearch}
                onChange={(event) => setFriendSearch(event.target.value)}
                placeholder="Search friends…"
                className="mb-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {friendsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                  </div>
                ) : (
                  <>
                    {shouldShowInviteCard && (
                      <div className="flex items-start justify-between gap-3 rounded-md border border-indigo-100 bg-indigo-50 px-3 py-2">
                        <div>
                          <p className="text-sm font-medium text-indigo-900">
                            Invite {debouncedFriendSearch}?
                          </p>
                          <p className="text-xs text-indigo-700">
                            Send a friend request to chat together.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleInviteByEmail}
                          disabled={inviteLoading}
                          className="flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:bg-indigo-300"
                        >
                          {inviteLoading ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          ) : (
                            'Send Friend Request'
                          )}
                        </button>
                      </div>
                    )}
                    {filteredFriends.length === 0 && !shouldShowInviteCard ? (
                      <div className="py-6 text-center text-sm text-gray-500">
                        <p>You don’t have any friends yet.</p>
                        <button
                          type="button"
                          onClick={() => {
                            closeFriendModal();
                            closeParticipantMenu();
                            navigate('/community?view=users');
                          }}
                          className="mt-2 text-sm font-medium text-navy-blue hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-navy-blue"
                        >
                          Find friends
                        </button>
                      </div>
                    ) : (
                      filteredFriends.map((friend) => {
                        const disabled = existingParticipantIds.has(friend.uid) || isAddingParticipant;
                        const displayName = friend.name || friend.email || 'Unnamed friend';
                        return (
                          <div
                            key={friend.uid}
                            className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2"
                          >
                            <div className="flex items-center gap-3">
                              <CommunityAvatar
                                name={friend.name}
                                email={friend.email}
                                size={40}
                                className="flex-shrink-0"
                              />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{displayName}</p>
                                <p className="text-xs text-gray-500">
                                  {friend.email || 'No email listed'}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              disabled={disabled}
                              onClick={() => handleAddFriendToChat(friend)}
                              className={`rounded-md px-3 py-1 text-sm font-medium ${
                                disabled
                                  ? 'cursor-not-allowed bg-gray-200 text-gray-500'
                                  : 'bg-indigo-600 text-white hover:bg-indigo-500'
                              }`}
                            >
                              {existingParticipantIds.has(friend.uid) ? 'Added' : 'Add'}
                            </button>
                          </div>
                        );
                      })
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Agent selection modal */}
        {showAgentModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onMouseDown={closeAgentModal}
          >
            <div
              ref={agentModalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="add-agent-heading"
              className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 id="add-agent-heading" className="text-lg font-semibold text-navy-blue">
                  Add an AI Expert
                </h3>
                <button
                  onClick={closeAgentModal}
                  className="rounded-full p-1 text-gray-500 hover:text-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
                  aria-label="Close AI expert selector"
                >
                  <X size={18} />
                </button>
              </div>
              <input
                type="text"
                value={agentSearch}
                onChange={(event) => setAgentSearch(event.target.value)}
                placeholder="Search agents..."
                className="mb-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <div className="max-h-64 space-y-2 overflow-y-auto">
                {filteredAgents.map((agent) => {
                  const disabled = existingParticipantIds.has(agent.id) || isAddingParticipant;
                  return (
                    <div
                      key={agent.id}
                      className="flex items-start justify-between gap-3 rounded-md border border-gray-200 px-3 py-2"
                    >
                      <div className="flex items-start gap-3">
                        <CommunityAvatar
                          name={agent.name}
                          email={agent.email}
                          photoURL={agent.profile_image_url}
                          size={40}
                          className="flex-shrink-0"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{agent.name}</p>
                          <p className="text-xs text-gray-500">{agent.bio}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => handleAddAgentToChat(agent)}
                        className={`rounded-md px-3 py-1 text-sm font-medium ${
                          disabled
                            ? 'cursor-not-allowed bg-gray-200 text-gray-500'
                            : 'bg-yellow-300 text-slate-900 hover:bg-yellow-200'
                        }`}
                      >
                        {existingParticipantIds.has(agent.id) ? 'Added' : 'Add'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

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
