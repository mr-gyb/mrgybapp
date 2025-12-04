import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PlusCircle, Edit2, Check, X, ArrowDown, FileText } from "lucide-react";
import { useChat } from "../contexts/ChatContext";
import { useAuth } from "../contexts/AuthContext";
import { getChat } from "../lib/firebase/chats";
import MessageInput from "./chat/MessageInput";
import HomeFilter from "./filters/HomeFilter";
import AIVideoAvatar from "./AIVideoAvatar";
import { OpenAIMessage } from "../types/chat";
import { Message } from "../types/chat";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatCompletionContentPart } from "openai/resources/chat/completions";
import ChatHeader from "./chat/ChatHeader";
import { AI_USERS } from "../types/user";

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
  } = useChat();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [videoAvatar, setVideoAvatar] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const currentChat = chats.find((c) => c.id === chatId);
  
  // Debug logging
  console.log('Chat component - selectedAgent:', selectedAgent);
  console.log('Chat component - currentChat:', currentChat);


  
  useEffect(() => {
    const loadChat = async () => {
      if (chatId) {
        setIsLoading(true);
        const chatData = await getChat(chatId);
        if (chatData) {
          setEditedTitle(chatData.title);
          const lastAiMessage = chatData.messages?.find(
            (m) => m.role === "assistant"
          );
          if (lastAiMessage?.aiAgent) {
            setSelectedAgent(lastAiMessage.aiAgent);
          }
        } else {
          navigate("/new-chat");
        }
        setIsLoading(false);
      }
    };

    loadChat();
  }, [chatId, navigate]);

  useEffect(() => {
    if (currentChat?.messages && currentChat.messages.length > 0) {
      const lastMessage = currentChat.messages[currentChat.messages.length - 1];
      if (
        currentChat.messages.length > 1 &&
        (lastMessage.role === "assistant" || lastMessage.role === "user")
      ) {
        scrollToBottom();
      }
    }
  }, [currentChat?.messages]);

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

  const handleSendMessage = async (
    content: string | OpenAIMessage | ChatCompletionContentPart[]
  ) => {
    console.log("handlesendmessage");
    console.log("image type is ", typeof content);
    
    if (isProcessing || !chatId) return;
    
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
          await addImage(chatId, content, 'user', user?.uid);
          console.log("Image message added successfully");
        }
      } else {
        console.log("selectedAgent is ", selectedAgent);
        console.log("Adding text message:", content);
        await addMessage(chatId, content, 'user', user?.uid, selectedAgent);
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
      // Add cache-busting parameter to force fresh load
      const url = new URL(aiUser.profile_image_url);
      url.searchParams.set('t', Date.now().toString());
      return url.toString();
    }
    
    /* Existing changes
    console.log('AI User not found for:', agentName, 'fallback to Mr.GYB AI image');
    // Fallback to Mr.GYB AI image instead of generic logo
    const mrGybUrl = "https://firebasestorage.googleapis.com/v0/b/mr-gyb-ai-app-108.firebasestorage.app/o/profile-images%2FMr.GYB_AI.png?alt=media&token=40ed698e-e2d0-45ff-b33a-508683c51a58";
    const url = new URL(mrGybUrl);
    url.searchParams.set('t', Date.now().toString());
    return url.toString();*/
    console.log('AI User not found for:', agentName, 'fallback to default');
    // Fallback to default AI profile image
    return "/gyb-logo.png";
    
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
              {currentChat.messages?.map((message: any, index: number) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "user" ? (
                    // User message: profile image on right side
                    <div className="flex items-start space-x-2">
                      <div className="max-w-xs sm:max-w-md lg:max-w-lg rounded-lg p-3 bg-gold text-navy-blue">
                        {renderMessageContent(message)}
                      </div>
                      {userData?.profile_image_url.startsWith('http') ? (
                        <img
                        src={userData?.profile_image_url}
                        alt="Profile"
                        className="w-8 h-8 rounded-full flex-shrink-0"
                      />
                      ) : (
                        <div className="w-8 h-8 flex-shrink-0 items-center justify-center text-2xl font-bold object-cover pb-1">
                          {userData?.profile_image_url}
                        </div>
                      )}
                    </div>
                  ) : (
                    // AI message: profile image on left side
                    <div className="flex items-start space-x-2">
                      <img
                        src={getAIProfileImage(selectedAgent || "Mr.GYB AI")}
                        alt={`${selectedAgent || "Mr.GYB AI"} Profile`}
                        className="w-8 h-8 rounded-full flex-shrink-0"
                        onError={(e) => {
                          console.error('Failed to load AI profile image:', e.currentTarget.src);
                          /*Existing code:
                          console.error('Selected agent:', selectedAgent);
                          e.currentTarget.src = "https://firebasestorage.googleapis.com/v0/b/mr-gyb-ai-app-108.firebasestorage.app/o/profile-images%2FMr.GYB_AI.png?alt=media&token=40ed698e-e2d0-45ff-b33a-508683c51a58";
                          */
                          e.currentTarget.src = "/gyb-logo.png";
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
                  )}
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
                        /* Existing code:
                        console.error('Selected agent (typing):', selectedAgent);
                        e.currentTarget.src = "https://firebasestorage.googleapis.com/v0/b/mr-gyb-ai-app-108.firebasestorage.app/o/profile-images%2FMr.GYB_AI.png?alt=media&token=40ed698e-e2d0-45ff-b33a-508683c51a58";
                        */
                        e.currentTarget.src = "/gyb-logo.png";
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
    </div>
  );
};

export default Chat;
