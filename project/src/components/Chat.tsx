import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  Edit2,
  Check,
  X,
  ArrowDown,
  FileText,
} from 'lucide-react';
import { useChat } from '../contexts/ChatContext';
import { useAuth } from '../contexts/AuthContext';
import { getChat } from '../lib/firebase/chats';
import MessageInput from './chat/MessageInput';
import HomeFilter from './filters/HomeFilter';
import AIVideoAvatar from './AIVideoAvatar';
import { OpenAIMessage } from '../types/chat';
import { Message } from '../types/chat';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatCompletionContentPart } from "openai/resources/chat/completions";



const Chat: React.FC = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { chats, addMessage, updateChatTitle, isProcessingAI, newchatButton, addImage } = useChat();
  const [currentAgent, setCurrentAgent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
 // const [currentChat, setCurrentChat] = useState<any>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const currentChat = chats.find(c => c.id === chatId);
  const [isProcessing, setIsProcessing] = useState(false);
  const [videoAvatar, setVideoAvatar] = useState(false);

  useEffect(() => {
    const loadChat = async () => {
      if (chatId) {
        setIsLoading(true);
        const chatData = await getChat(chatId);
        if (chatData) {
          //setCurrentChat(chatData);
          setEditedTitle(chatData.title);
          const lastAiMessage = chatData.messages?.find(
            (m) => m.role === 'assistant'
          );
          if (lastAiMessage?.aiAgent) {
            setCurrentAgent(lastAiMessage.aiAgent);
          }
        } else {
          navigate('/new-chat');
        }
        setIsLoading(false);
      }
    };

    loadChat();
  }, [chatId, navigate]);

  useEffect(() => {
    if (currentChat?.messages && currentChat.messages.length > 0) {
      const lastMessage = currentChat.messages[currentChat.messages.length - 1];
      if (currentChat.messages.length > 1 && (lastMessage.role === 'assistant' || lastMessage.role === 'user')) {
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
      container.addEventListener('scroll', checkScrollPosition);
      return () => container.removeEventListener('scroll', checkScrollPosition);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content: string | OpenAIMessage | ChatCompletionContentPart[]) => {
    console.log("handlesendmessage")
    console.log("image type is ", typeof content);
    if (isProcessing || !chatId) return;
    setIsProcessing(true);

    try {
      // Add user message
      if(typeof content === 'object'){
        if(Array.isArray(content)){
          await addImage(chatId, content, 'user', user?.uid);
        }
      }else{
        console.log(content);
        await addMessage(chatId, content, 'user', user?.uid);
      }
      /* Update local state immediately
      setCurrentChat((prev) => ({
        ...prev,
        messages: [
          ...(prev.messages || []),
          {
            id: Date.now().toString(),
            chatId,
            content: messageContent,
            role: 'user',
            createdAt: new Date().toISOString(),
          },
        ],
      }));

      
      setTimeout(async () => {
        //Simulate AI response
        const aiResponse = `This is a response from ${
          currentAgent || 'AI Assistant'
        } to your message: "${messageContent}"`;
        await addMessage(
          chatId,
          aiResponse,
          'assistant',
          undefined,
          currentAgent
        );
        

        /* Update local state with AI response
        setCurrentChat((prev) => ({
          ...prev,
          messages: [
            ...(prev.messages || []),
            {
              id: (Date.now() + 1).toString(),
              chatId,
              content: aiResponse,
              role: 'assistant',
              aiAgent: currentAgent,
              createdAt: new Date().toISOString(),
            },
          ],
        }));

        // Scroll to bottom
        scrollToBottom();
      }, 1000);*/
    } catch (error) {
      console.error('Error sending message:', error);
      // Optionally show error to user
    } finally {
      setIsProcessing(false);
    }
  };



  const handleTitleUpdate = async () => {
    if (chatId && editedTitle.trim()) {
      const success = await updateChatTitle(chatId, editedTitle.trim());
      if (success) {
        //setCurrentChat((prev) => ({ ...prev, title: editedTitle.trim() }));
        setIsEditingTitle(false);
      }
    }
  };

  // for new chat button 
  const handleNewChat = async () => {
    const newChatId = await newchatButton();
    if (newChatId) {
      navigate(`/chat/${newChatId}`);
    }
  }

  const handleTitleKeyPress = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === 'Enter') {
      handleTitleUpdate();
    } else if (event.key === 'Escape') {
      setIsEditingTitle(false);
      setEditedTitle(currentChat?.title || '');
    }
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
      if (typeof message.content === 'string') {
        try {
          const parsedContent = JSON.parse(message.content);
          if (Array.isArray(parsedContent.content)) {
            return (
              <div className="space-y-2">
                {parsedContent.content.map((item: any, index: number) => {
                  if (item.type === 'image_url') {
                    return (
                      <img
                        key={index}
                        src={item.image_url.url}
                        alt="Uploaded content"
                        className="max-w-xs rounded-lg mb-2"
                      />
                    );
                  }
                  if (item.type === 'text') {
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
          <div className="space-y-2 ">
            <div className="flex items-center space-x-2 ">
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
          {typeof message.content === 'string' ? message.content : ''}
        </ReactMarkdown>
      );
    } catch (error) {
      return <p>{message.content}</p>;
    }
  };

  return (
    <div className="min-h-[90vh] flex flex-col bg-white border-8 border-red-500">
      {/* Fixed Header */}
      <div className="fixed top-16 left-0 right-0 z-20 bg-navy-blue text-white">
        <div className="max-w-7xl mx-auto px-4 py-2  ">
          <div className="flex items-center justify-between ">
            <div className="flex-grow mr-4">
              {isEditingTitle ? (
                <div className="flex items-center">
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onKeyDown={handleTitleKeyPress}
                    className="bg-white/10 text-white px-2 py-1 rounded flex-grow"
                    placeholder="Enter chat title..."
                  />
                  <button
                    onClick={handleTitleUpdate}
                    className="ml-2 p-1 hover:bg-white/10 rounded"
                  >
                    <Check size={20} />
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingTitle(false);
                      setEditedTitle(currentChat.title);
                    }}
                    className="ml-1 p-1 hover:bg-white/10 rounded"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center">
                  <h1 className="text-lg font-semibold mr-2">
                    {currentChat.title}
                  </h1>
                  <button
                    onClick={() => setIsEditingTitle(true)}
                    className="p-1 hover:bg-white/10 rounded"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {currentAgent && (
                <p className="text-sm opacity-75">
                  Chatting with: {currentAgent}
                </p>
              )}
              <button
                onClick={handleNewChat}
                className="bg-gold text-navy-blue px-3 py-1 rounded-full flex items-center text-sm"
              >
                <PlusCircle size={16} className="mr-1" />
                New Chat
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Chat Content */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-hidden mt-20 mb-24 px-4 relative "
      >
        {videoAvatar ? (
          <AIVideoAvatar />
        ) : (
          <div className="max-w-7xl mx-auto">
            <div className="space-y-4">
              {currentChat.messages?.map((message: any, index: number) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs sm:max-w-md lg:max-w-lg rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-gold text-navy-blue'
                        : 'bg-navy-blue text-white'
                    }`}
                  >
                    {renderMessageContent(message)}
                  </div>
                </div>
              ))}
              {/* For AI typing */}
              {isProcessingAI && (
                <div className="flex justify-start">
                  <div className="max-w-xs sm:max-w-md lg:max-w-lg rounded-lg p-3 bg-navy-blue text-white">
                    <p className="text-sm sm:text-base italic">GYBAI is thinking...</p>
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
      />

      <HomeFilter onFilterChange={() => {}} />
        
      
    </div>
  );
};

export default Chat;