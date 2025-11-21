import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PlusCircle, Edit2, Check, X, ArrowDown, FileText } from "lucide-react";
import { useChat } from "../contexts/ChatContext";
import { useAuth } from "../contexts/AuthContext";
import { getChat } from "../lib/firebase/chats";
import HomeFilter from "./filters/HomeFilter";
import AIVideoAvatar from "./AIVideoAvatar";
import { OpenAIMessage } from "../types/chat";
import { Message } from "../types/chat";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatCompletionContentPart } from "openai/resources/chat/completions";
import ChatHeader from "./chat/ChatHeader";
import { AI_USERS } from "../types/user";
import { collection as firestoreCollection, onSnapshot as firestoreOnSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { runChatConnectivityTest } from "../api/services/chat.service";
import { useToast } from "../hooks/useToast";
import ToastContainer from "./ToastContainer";
import MessageInput from "./chat/MessageInput";

const Chat: React.FC = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const {
    chats,
    addMessage,
    updateChatTitle,
    isProcessingAI,
    newchatButton,
    addImage,
    createNewChat,
    selectedAgent,
    setSelectedAgent,
    chatDiagnostics,
    clearChatDiagnostics,
    streamingResponses,
    retryableChats,
    retryLastPrompt,
    quotaError,
  } = useChat();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [videoAvatar, setVideoAvatar] = useState(false);
  const [typingParticipants, setTypingParticipants] = useState<Array<{ uid: string; displayName: string; type: 'user' | 'agent'; isTyping?: boolean }>>([]);
  const showDiagnosticsBanner = import.meta.env.VITE_SHOW_DIAGNOSTIC_ERRORS === 'true';
  const { toasts, removeToast, showSuccess, showError } = useToast();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const currentChat = chats.find((c) => c.id === chatId);

  // Debug logging
  console.log('Chat component - selectedAgent:', selectedAgent);
  console.log('Chat component - currentChat:', currentChat);

  const streamingState = currentChat ? streamingResponses?.[currentChat.id] : undefined;
  const retryState = currentChat ? retryableChats?.[currentChat.id] : undefined;

  useEffect(() => {
    if (!showDiagnosticsBanner || !chatDiagnostics) return;
    if (chatDiagnostics.code === 'ok' || chatDiagnostics.code === 'rate_limited_recovered') {
      const timeout = window.setTimeout(() => clearChatDiagnostics(), 5000);
      return () => window.clearTimeout(timeout);
    }
  }, [chatDiagnostics, showDiagnosticsBanner, clearChatDiagnostics]);

  useEffect(() => {
    const loadChat = async () => {
      if (chatId) {
        setIsLoading(true);
        const chatData = await getChat(chatId);
        if (chatData) {
          setEditedTitle(chatData.title);
          // Try to restore selectedAgent from chat messages
          const lastAiMessage = chatData.messages?.find((m) => m.role === "assistant");
          if (lastAiMessage?.aiAgent) {
            setSelectedAgent(lastAiMessage.aiAgent);
          } else {
            // If no agent found in messages, check if selectedAgent is already set
            // If not, use default fallback (Chris)
            if (!selectedAgent) {
              setSelectedAgent('Chris');
            }
          }
        } else {
          navigate("/new-chat");
        }
        setIsLoading(false);
      }
    };

    loadChat();
  }, [chatId, navigate, setSelectedAgent]);

  // Restore selectedAgent from current chat messages when chat changes
  useEffect(() => {
    if (currentChat?.messages && currentChat.messages.length > 0) {
      const aiMessages = currentChat.messages
        .filter((m) => m.role === "assistant" && m.aiAgent)
        .reverse();

      if (aiMessages.length > 0 && aiMessages[0].aiAgent) {
        if (selectedAgent !== aiMessages[0].aiAgent) {
          setSelectedAgent(aiMessages[0].aiAgent);
        }
      } else if (!selectedAgent) {
        setSelectedAgent('Chris');
      }

      const lastMessage = currentChat.messages[currentChat.messages.length - 1];
      if (
        currentChat.messages.length > 1 &&
        (lastMessage.role === "assistant" || lastMessage.role === "user")
      ) {
        scrollToBottom();
      }
    }
  }, [currentChat?.messages, selectedAgent, setSelectedAgent]);

  useEffect(() => {
    if (!chatId) {
      setTypingParticipants([]);
      return;
    }

    const typingCollection = firestoreCollection(db, 'chats', chatId, 'typing');
    const unsubscribe = firestoreOnSnapshot(
      typingCollection,
      (snapshot) => {
        const activeTypers = snapshot.docs
          .map((docSnap) => {
            const data = docSnap.data() as any;
            return {
              uid: data.uid || docSnap.id,
              displayName: data.displayName || 'Someone',
              type: (data.type || 'user') as 'user' | 'agent',
              isTyping: data.isTyping,
            };
          })
          .filter((typist) => typist.isTyping);

        setTypingParticipants(activeTypers);
      },
      (error) => {
        console.error('Error listening to typing state:', error);
      }
    );

    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    const checkScrollPosition = () => {
      const container = messagesContainerRef.current;
      if (!container) return;

      const { scrollTop, scrollHeight, clientHeight } = container;
      const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100;
      setShowScrollButton(isScrolledUp);
    };

    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScrollPosition);
      return () => container.removeEventListener("scroll", checkScrollPosition);
    }
  }, []);

  // For storing the state of the page change, ai agent change
  useEffect(() => {
    return () => {
      setIsProcessing(false);
    };
  }, [chatId]);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleConnectivityTestClick = async () => {
    try {
      const result = await runChatConnectivityTest();
      console.info('[chat] connectivity test', result);
      if (result.ok) {
        showSuccess(`Connectivity healthy (status ${result.status})`);
      } else {
        showError(`Connectivity failed (${result.status}): ${result.message}`);
      }
    } catch (error) {
      console.error('[chat] connectivity test error', error);
      const message = error instanceof Error ? error.message : 'Connectivity test failed';
      showError(message);
    }
  };

  const handleSendMessage = async (
    content: string | OpenAIMessage | ChatCompletionContentPart[]
  ) => {
    console.log("handlesendmessage");
    console.log("image type is ", typeof content);

    if (isProcessing || !chatId) return;

    // Ensure selectedAgent is set (fallback to Chris if null)
    const activeAgent = selectedAgent || 'Chris';
    if (!selectedAgent) {
      setSelectedAgent(activeAgent);
    }

    console.log("Setting isProcessing to true");
    setIsProcessing(true);

    // Add a timeout to ensure isProcessing is reset even if operations hang
    const timeoutId = setTimeout(() => {
      console.log("Timeout reached, forcing isProcessing to false");
      setIsProcessing(false);
    }, 10000); // 10 second timeout

    try {
      // Add user message
      if (typeof content === 'object') {
        if (Array.isArray(content)) {
          console.log("Adding image message");
          await addImage(chatId, content, 'user', user?.uid, activeAgent);
          console.log("Image message added successfully");
        }
      } else {
        console.log("selectedAgent is ", activeAgent);
        console.log("Adding text message:", content);
        await addMessage(chatId, content, 'user', user?.uid, activeAgent);
        console.log("Text message added successfully");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Optionally show error to user
    } finally {
      clearTimeout(timeoutId);
      console.log("Finally block executed, setting isProcessing to false");
      setIsProcessing(false);
    }
  };

  const handleTitleUpdate = async () => {
    if (chatId && editedTitle.trim()) {
      const success = await updateChatTitle(chatId, editedTitle.trim());
      if (success) {
        setIsEditingTitle(false);
      }
    }
  };

  // For new chat button
  const handleNewChat = async () => {
    const newChatId = await newchatButton();
    if (newChatId) {
      navigate(`/chat/${newChatId}`);
    }
  };

  // For agent change - create new chat with selected agent
  const handleAgentChange = async (newAgent: string) => {
    if (newAgent === selectedAgent) return; // No change needed
    console.log(newAgent);

    try {
      // First, check if there's an existing chat with this agent
      const existingChat = chats.find((chat) => {
        // Check if the chat has messages from this agent
        return (
          chat.messages &&
          chat.messages.some(
            (message) =>
              message.role === "assistant" && message.aiAgent === newAgent
          )
        );
      });

      if (existingChat) {
        // If existing chat found, navigate to it
        navigate(`/chat/${existingChat.id}`);
        // Get the actual agent from the existing chat's messages
        const agentMessage = existingChat.messages?.find(
          (message) =>
            message.role === "assistant" && message.aiAgent === newAgent
        );
        if (agentMessage?.aiAgent) {
          setSelectedAgent(agentMessage.aiAgent);
        } else {
          setSelectedAgent(newAgent);
        }
      } else {
        // If no existing chat, create new chat with the selected agent
        const newChatId = await createNewChat();
        if (newChatId) {
          // Add initial message from the new agent
          const initialMessage = `Hello! I'm ${newAgent}. How can I help you today?`;
          await addMessage(
            newChatId,
            initialMessage,
            "assistant",
            undefined,
            newAgent
          );

          // Navigate to the new chat
          navigate(`/chat/${newChatId}`);
          // Update the current agent state
          setSelectedAgent(newAgent);
        }
      }
    } catch (error) {
      console.error("Error handling agent change:", error);
    }
  };

  const handleTitleKeyPress = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      handleTitleUpdate();
    } else if (event.key === "Escape") {
      setIsEditingTitle(false);
      setEditedTitle(currentChat?.title || "");
    }
  };

  // Function to get AI profile image based on selected agent
  const getAIProfileImage = (agentName: string) => {
    console.log('getAIProfileImage called with:', agentName);
    console.log('Agent name type:', typeof agentName);
    console.log('Agent name length:', agentName?.length);
    console.log('AI_USERS object:', AI_USERS);

    // Handle null/undefined agent names
    if (!agentName) {
      console.log('Agent name is null/undefined, using Mr.GYB AI image');
      const mrGybUrl = "https://firebasestorage.googleapis.com/v0/b/mr-gyb-ai-app-108.firebasestorage.app/o/profile-images%2FMr.GYB_AI.png?alt=media&token=40ed698e-e2d0-45ff-b33a-508683c51a58";
      const url = new URL(mrGybUrl);
      url.searchParams.set('t', Date.now().toString());
      return url.toString();
    }

    // First check if it's Mr.GYB AI with any variation
    const mrGybVariations = ["Mr.GYB AI", "mr.gyb ai", "mr gyb ai", "mrgyb ai"];
    if (mrGybVariations.includes(agentName)) {
      const mrGybUrl = "https://firebasestorage.googleapis.com/v0/b/mr-gyb-ai-app-108.firebasestorage.app/o/profile-images%2FMr.GYB_AI.png?alt=media&token=40ed698e-e2d0-45ff-b33a-508683c51a58";
      const url = new URL(mrGybUrl);
      url.searchParams.set('t', Date.now().toString());
      console.log('Using specific Mr.GYB AI URL:', url.toString());
      return url.toString();
    }

    // Additional check for any variation containing "GYB" or "Mr"
    const lowerAgentName = agentName.toLowerCase();
    if (lowerAgentName.includes('gyb') || lowerAgentName.includes('mr')) {
      console.log('Agent name contains GYB or Mr, using Mr.GYB AI image');
      const mrGybUrl = "https://firebasestorage.googleapis.com/v0/b/mr-gyb-ai-app-108.firebasestorage.app/o/profile-images%2FMr.GYB_AI.png?alt=media&token=40ed698e-e2d0-45ff-b33a-508683c51a58";
      const url = new URL(mrGybUrl);
      url.searchParams.set('t', Date.now().toString());
      return url.toString();
    }

    let agentNewName = agentName.toLowerCase().trim();

    // Handle various forms of Mr.GYB AI name
    if (agentNewName === "mr.gyb ai" || agentNewName === "mr gyb ai" || agentNewName === "mrgyb ai") {
      agentNewName = "mr-gyb-ai";
    }

    console.log('Looking for AI user with id:', agentNewName);
    console.log('Available AI users:', Object.keys(AI_USERS));

    const aiUser = Object.values(AI_USERS).find((ai) => ai.id === agentNewName);
    if (aiUser) {
      console.log('AI User found:', aiUser.name, 'Image URL:', aiUser.profile_image_url);
      // Handle relative paths (like /images/team/jake.png) vs absolute URLs
      if (aiUser.profile_image_url.startsWith('/') || aiUser.profile_image_url.startsWith('./')) {
        // Relative path - return as-is with cache-busting query param
        const separator = aiUser.profile_image_url.includes('?') ? '&' : '?';
        return `${aiUser.profile_image_url}${separator}t=${Date.now()}`;
      } else {
        // Absolute URL - use URL constructor
        try {
          const url = new URL(aiUser.profile_image_url);
          url.searchParams.set('t', Date.now().toString());
          return url.toString();
        } catch (error) {
          console.error('Invalid URL for AI user image:', aiUser.profile_image_url, error);
          // Fallback to relative path handling
          const separator = aiUser.profile_image_url.includes('?') ? '&' : '?';
          return `${aiUser.profile_image_url}${separator}t=${Date.now()}`;
        }
      }
    }

    console.log('AI User not found for:', agentName, 'fallback to Mr.GYB AI image');
    // Fallback to Mr.GYB AI image instead of generic logo
    const mrGybUrl = "https://firebasestorage.googleapis.com/v0/b/mr-gyb-ai-app-108.firebasestorage.app/o/profile-images%2FMr.GYB_AI.png?alt=media&token=40ed698e-e2d0-45ff-b33a-508683c51a58";
    const url = new URL(mrGybUrl);
    url.searchParams.set('t', Date.now().toString());
    return url.toString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy-blue"></div>
      </div>
    );
  }

  if (!currentChat) {
    return null;
  }

  const renderMessageContent = (message: Message) => {
    try {
      // Try to parse as JSON for complex message types (like those with images)
      if (typeof message.content === "string") {
        try {
          const parsedContent = JSON.parse(message.content);
          if (Array.isArray(parsedContent.content)) {
            return (
              <div className="space-y-2">
                {parsedContent.content.map((item: any, index: number) => {
                  if (item.type === "image_url") {
                    return (
                      <img
                        key={index}
                        src={item.image_url.url}
                        alt="Uploaded content"
                        className="max-w-xs rounded-lg mb-2"
                      />
                    );
                  }
                  if (item.type === "text") {
                    return (
                      <ReactMarkdown
                        key={index}
                        className="prose prose-sm max-w-none"
                        remarkPlugins={[remarkGfm]}
                      >
                        {item.text}
                      </ReactMarkdown>
                    );
                  }
                  return null;
                })}
              </div>
            );
          }
        } catch (e) {
          // Not JSON, continue with normal rendering
        }
      }

      if (message.fileType && message.fileName) {
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <FileText size={20} />
              <span>{message.fileName}</span>
            </div>
            <ReactMarkdown
              className="prose prose-sm max-w-none"
              remarkPlugins={[remarkGfm]}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        );
      }

      return (
        <ReactMarkdown
          className="prose prose-sm max-w-none"
          remarkPlugins={[remarkGfm]}
        >
          {typeof message.content === "string" ? message.content : ""}
        </ReactMarkdown>
      );
    } catch (error) {
      return <p>{message.content}</p>;
    }
  };


  return (
    <div className="min-h-[90vh] flex flex-col bg-white">
      {showDiagnosticsBanner && chatDiagnostics && (
        <div className="mx-4 mt-4 rounded-md border border-yellow-400 bg-yellow-50 px-3 py-2 text-xs text-yellow-900 shadow-sm flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="font-semibold uppercase tracking-wide text-[10px]">LLM Diagnostics</div>
            <div>
              <span className="font-medium">Code:</span> {chatDiagnostics.code}
              {chatDiagnostics.status !== undefined && (
                <span className="ml-2 font-medium">
                  Status: {chatDiagnostics.status}
                </span>
              )}
            </div>
            {chatDiagnostics.detail && <div className="break-words">{chatDiagnostics.detail}</div>}
            {chatDiagnostics.requestId && (
              <div className="text-[10px] uppercase text-yellow-800/80">
                requestId: {chatDiagnostics.requestId}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={clearChatDiagnostics}
            className="ml-auto text-lg leading-none text-yellow-800 hover:text-yellow-600"
            aria-label="Dismiss diagnostics"
          >
            ×
          </button>
        </div>
      )}
      {quotaError && (
        <div className="mx-4 mt-3 rounded-md border border-red-400 bg-red-50 px-3 py-3 text-xs text-red-900 shadow-sm">
          <div className="space-y-1">
            <div className="font-semibold uppercase tracking-wide text-[10px]">
              AI Service Error
            </div>
            <div className="break-words">
              {quotaError.message}
            </div>
            {quotaError.retryAfter && (
              <div className="text-[10px] uppercase text-red-700/70 mt-1">
                Please wait {quotaError.retryAfter} seconds before trying again.
              </div>
            )}
          </div>
        </div>
      )}
      {retryState && currentChat && !quotaError && (
        <div className="mx-4 mt-3 rounded-md border border-red-300 bg-red-50 px-3 py-3 text-xs text-red-900 shadow-sm flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="font-semibold uppercase tracking-wide text-[10px]">
              AI Service Unavailable
            </div>
            <div>
              Unable to reach the AI service
              {retryState.status ? ` (status ${retryState.status})` : ''}.
              {retryState.message ? ` ${retryState.message}` : ' Please try again shortly.'}
            </div>
            {retryState.requestId && (
              <div className="text-[10px] uppercase text-red-700/70">
                requestId: {retryState.requestId}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => retryLastPrompt(currentChat.id)}
            disabled={isProcessingAI}
            className="inline-flex items-center justify-center rounded-md border border-red-400 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Retry
          </button>
        </div>
      )}
      {import.meta.env.DEV && (
        <div className="mx-4 mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <button
            type="button"
            onClick={handleConnectivityTestClick}
            className="rounded-md border border-slate-300 bg-white px-3 py-1 font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Run connectivity test
          </button>
        </div>
      )}
      {/* Fixed Header */}
      <ChatHeader
        title={currentChat.title}
        isEditing={isEditingTitle}
        editedTitle={editedTitle}
        onEditToggle={() => setIsEditingTitle(true)}
        onTitleChange={setEditedTitle}
        onTitleUpdate={handleTitleUpdate}
        onTitleCancel={() => {
          setIsEditingTitle(false);
          setEditedTitle(currentChat.title);
        }}
        onAgentChange={handleAgentChange}
        onNewChat={handleNewChat}
      />

      {/* Scrollable Chat Content */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-hidden mt-20 mb-24 px-4 relative"
      >
        {videoAvatar ? (
          <AIVideoAvatar />
        ) : (
          <div className="w-full">
            <div className="space-y-4">
              {currentChat.messages?.map((message: any, index: number) => {
                const key = message.id || `message-${index}`;

                if (message.role === "system") {
                  return (
                    <div key={key} className="flex justify-center">
                      <div className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                        {typeof message.content === "string" ? message.content : ""}
                      </div>
                    </div>
                  );
                }

                if (message.role === "user") {
                  return (
                    <div key={key} className="flex justify-end">
                      <div className="flex items-start space-x-2">
                        <div className="max-w-xs sm:max-w-md lg:max-w-lg rounded-lg p-3 bg-gold text-navy-blue">
                          {renderMessageContent(message)}
                        </div>
                        {userData?.profile_image_url?.startsWith('http') ? (
                          <img
                            src={userData?.profile_image_url}
                            alt="Profile"
                            className="w-8 h-8 rounded-full flex-shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center text-lg font-semibold bg-gold/40 rounded-full">
                            {(userData?.name?.charAt(0) || 'U').toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={key} className="flex justify-start">
                    <div className="flex items-start space-x-2">
                      <img
                        src={getAIProfileImage(selectedAgent || "Mr.GYB AI")}
                        alt={`${selectedAgent || "Mr.GYB AI"} Profile`}
                        className="w-8 h-8 rounded-full flex-shrink-0"
                        onError={(e) => {
                          console.error('Failed to load AI profile image:', e.currentTarget.src);
                          console.error('Selected agent:', selectedAgent);
                          e.currentTarget.src = "https://firebasestorage.googleapis.com/v0/b/mr-gyb-ai-app-108.firebasestorage.app/o/profile-images%2FMr.GYB_AI.png?alt=media&token=40ed698e-e2d0-45ff-b33a-508683c51a58";
                        }}
                        onLoad={() => {
                          console.log('AI profile image loaded successfully for:', selectedAgent);
                        }}
                        key={`${selectedAgent}-${Date.now()}`}
                      />
                      <div className="max-w-xs sm:max-w-md lg:max-w-lg rounded-lg p-3 bg-navy-blue text-white">
                        {renderMessageContent(message)}
                      </div>
                    </div>
                  </div>
                );
              })}

              {streamingState && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2">
                    <img
                      src={getAIProfileImage(streamingState.agent || selectedAgent || "Mr.GYB AI")}
                      alt={`${streamingState.agent || selectedAgent || "Mr.GYB AI"} Profile`}
                      className="w-8 h-8 rounded-full flex-shrink-0"
                    />
                    <div className="max-w-xs sm:max-w-md lg:max-w-lg rounded-lg bg-gray-100 px-3 py-2 text-gray-900">
                      {streamingState.content ? (
                        <ReactMarkdown
                          className="prose prose-sm max-w-none"
                          remarkPlugins={[remarkGfm]}
                        >
                          {streamingState.content}
                        </ReactMarkdown>
                      ) : (
                        <span className="text-xs text-gray-500">Streaming response…</span>
                      )}
                      <div className="mt-2 flex items-center gap-2 text-[10px] uppercase tracking-wide text-gray-500">
                        <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                        Streaming
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {typingParticipants
                .filter((typist) => typist.uid !== user?.uid)
                .map((typist) => (
                  <div key={`typing-${typist.uid}`} className="flex justify-start">
                    <div className="flex items-start space-x-2">
                      {typist.type === 'agent' && (
                        <img
                          src={getAIProfileImage(typist.displayName)}
                          alt={`${typist.displayName} avatar`}
                          className="w-8 h-8 rounded-full flex-shrink-0"
                        />
                      )}
                      <div
                        className={`max-w-xs sm:max-w-md lg:max-w-lg rounded-lg p-3 text-sm italic ${
                          typist.type === 'agent'
                            ? 'bg-navy-blue text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {`${typist.displayName} is typing…`}
                      </div>
                    </div>
                  </div>
                ))}

              {/* For AI typing */}
              {isProcessingAI && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2">
                    <img
                      src={getAIProfileImage(selectedAgent || 'Mr.GYB AI')}
                      alt={`${selectedAgent || 'Mr.GYB AI'} Profile`}
                      className="w-8 h-8 rounded-full flex-shrink-0"
                      onError={(e) => {
                        console.error('Failed to load AI profile image (typing):', e.currentTarget.src);
                        console.error('Selected agent (typing):', selectedAgent);
                        e.currentTarget.src = "https://firebasestorage.googleapis.com/v0/b/mr-gyb-ai-app-108.firebasestorage.app/o/profile-images%2FMr.GYB_AI.png?alt=media&token=40ed698e-e2d0-45ff-b33a-508683c51a58";
                      }}
                      onLoad={() => {
                        console.log('AI profile image loaded successfully (typing) for:', selectedAgent);
                      }}
                      key={`${selectedAgent}-typing-${Date.now()}`}
                    />
                    <div className="max-w-xs sm:max-w-md lg:max-w-lg rounded-lg p-3 bg-navy-blue text-white">
                      <p className="text-sm sm:text-base italic">
                        {selectedAgent || 'Mr.GYB AI'} is looking to assist you with a better solution…
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Scroll to bottom button */}
        {showScrollButton && !videoAvatar && (
          <button
            onClick={scrollToBottom}
            className="fixed bottom-24 right-4 bg-navy-blue text-white p-2 rounded-full shadow-lg hover:bg-opacity-90 transition-all duration-200 z-30"
            aria-label="Scroll to bottom"
          >
            <ArrowDown size={20} />
          </button>
        )}
      </div>

      {/* Fixed Message Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        isProcessing={isProcessing}
        videoAvatar={videoAvatar}
        setVideoAvatar={setVideoAvatar}
        onMessageSent={() => {
          console.log("Message sent callback triggered");
          // Force isProcessing to false to ensure input can be cleared
          setIsProcessing(false);
        }}
        onInputClear={() => {
          console.log("Input clear callback triggered");
          // Force isProcessing to false to ensure input can be cleared
          setIsProcessing(false);
        }}
      />

      <HomeFilter onFilterChange={() => {}} />
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
};

export default Chat;
