import React from 'react';
import { Timestamp } from 'firebase/firestore';

interface ChatMessageProps {
  id: string;
  senderId: string;
  text: string;
  createdAt: Timestamp;
  isCurrentUser: boolean;
  senderName: string;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  avatarInitial: string;
  avatarColor: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  id,
  senderId,
  text,
  createdAt,
  isCurrentUser,
  senderName,
  isFirstInGroup,
  isLastInGroup,
  avatarInitial,
  avatarColor
}) => {
  // Format timestamp to simple time format (e.g., "5:55 PM")
  const formatTime = (timestamp: Timestamp): string => {
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Determine bubble corner radius based on position in group
  const getBubbleRadius = () => {
    if (isFirstInGroup && isLastInGroup) {
      // Single message
      return isCurrentUser ? "rounded-2xl" : "rounded-2xl";
    } else if (isFirstInGroup) {
      // First message in group
      return isCurrentUser ? "rounded-2xl rounded-br-md" : "rounded-2xl rounded-bl-md";
    } else if (isLastInGroup) {
      // Last message in group
      return isCurrentUser ? "rounded-2xl rounded-tr-md" : "rounded-2xl rounded-tl-md";
    } else {
      // Middle message in group
      return isCurrentUser ? "rounded-2xl rounded-r-md" : "rounded-2xl rounded-l-md";
    }
  };

  return (
    <div
      className={`flex items-end space-x-2 ${
        isFirstInGroup ? "mt-4" : "mt-1"
      } ${isLastInGroup ? "mb-4" : "mb-1"} ${
        isCurrentUser ? "justify-end flex-row-reverse" : "justify-start"
      }`}
    >
      {/* Avatar - only show for other user, and only on first message in group */}
      {!isCurrentUser && isFirstInGroup && (
        <div 
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mb-1 ${avatarColor}`}
        >
          <span className="text-white font-semibold text-sm">
            {avatarInitial}
          </span>
        </div>
      )}
      
      {/* Spacer for other user when not first in group */}
      {!isCurrentUser && !isFirstInGroup && (
        <div className="w-8 h-8 flex-shrink-0"></div>
      )}
      
      <div className={`flex flex-col max-w-xs ${
        isCurrentUser ? "items-end" : "items-start"
      }`}>
        {/* Sender name - only show on first message in group */}
        {isFirstInGroup && (
          <p className="text-xs text-gray-500 mb-1 px-2 font-medium">
            {senderName}
          </p>
        )}
        
        {/* Message bubble with improved styling */}
        <div
          className={`px-4 py-3 shadow-sm transition-all duration-200 hover:shadow-md ${getBubbleRadius()} ${
            isCurrentUser
              ? "bg-yellow-400 text-gray-900"
              : "bg-blue-600 text-white"
          }`}
        >
          <p className="whitespace-pre-wrap text-sm leading-relaxed break-words">{text}</p>
          <span className={`text-xs mt-1 block ${
            isCurrentUser ? "text-gray-600" : "text-blue-100"
          }`}>
            {formatTime(createdAt)}
          </span>
        </div>
      </div>
      
      {/* Avatar for current user - only show on first message in group */}
      {isCurrentUser && isFirstInGroup && (
        <div 
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mb-1 ${avatarColor}`}
        >
          <span className="text-white font-semibold text-sm">
            {avatarInitial}
          </span>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
