import React, { useState, useRef, useEffect } from 'react';
import { Edit2, Check, X, PlusCircle, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../../contexts/ChatContext';

interface ChatHeaderProps {
  title: string;
  isEditing: boolean;
  editedTitle: string;
  onEditToggle: () => void;
  onTitleChange: (value: string) => void;
  onTitleUpdate: () => void;
  onTitleCancel: () => void;
  onAgentChange: (value: string) => void;
  onNewChat: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  title,
  isEditing,
  editedTitle,
  onEditToggle,
  onTitleChange,
  onTitleUpdate,
  onTitleCancel,
  onAgentChange,
  onNewChat,
}) => {
  const titleInputRef = useRef<HTMLInputElement>(null);
  const { selectedAgent, setSelectedAgent } = useChat();

  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditing]);


  const agents = ['Mr.GYB AI', 'Chris', 'Sherry', 'Charlotte', 'Jake', 'Rachel'];


  const handleAgentChange = (newAgent: string) => {
    setSelectedAgent(newAgent);
    onAgentChange(newAgent);
  };

  return (
    <div className="bg-navy-blue text-white py-4 px-4 fixed w-full z-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-grow">
          {isEditing ? (
            <div className="flex items-center flex-grow mr-2">
              <input
                ref={titleInputRef}
                type="text"
                value={editedTitle}
                onChange={(e) => onTitleChange(e.target.value)}
                className="bg-white/10 text-white px-2 py-1 rounded flex-grow"
                placeholder="Enter chat title..."
              />
              <button
                onClick={onTitleUpdate}
                className="ml-2 p-1 hover:bg-white/10 rounded"
              >
                <Check size={20} />
              </button>
              <button
                onClick={onTitleCancel}
                className="ml-1 p-1 hover:bg-white/10 rounded"
              >
                <X size={20} />
              </button>
            </div>
          ) : (
            <div className="flex items-center">
              <h1 className="text-lg font-semibold mr-2">{title}</h1>
              <button
                onClick={onEditToggle}
                className="p-1 hover:bg-white/10 rounded"
              >
                <Edit2 size={16} />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative flex items-center ml-4">
            <select
              value={selectedAgent || 'Mr.GYB AI'}
              onChange={(e) => handleAgentChange(e.target.value)}
              className="appearance-none bg-transparent text-white pr-10 py-1 focus:outline-none text-center font-bold text-sm sm:text-base flex"
            >
              {agents.map((agent) => (
                <option key={agent} value={agent} className="text-navy-blue">
                  {agent}
                </option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-2 pointer-events-none"
              size={16}
            />
          </div>
          <button
            onClick={onNewChat}
            className="bg-gold text-navy-blue px-3 py-1 rounded-full flex items-center text-sm"
          >
            <PlusCircle size={16} className="mr-1" />
            New Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
