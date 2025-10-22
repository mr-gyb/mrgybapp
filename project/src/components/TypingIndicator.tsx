import React from 'react';

interface TypingIndicatorProps {
  typingUsers: {[userId: string]: boolean};
  userProfiles: {[uid: string]: {name: string, email: string}};
  avatarColor?: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ 
  typingUsers, 
  userProfiles,
  avatarColor = 'bg-gradient-to-br from-blue-400 to-purple-500'
}) => {
  const typingUserIds = Object.keys(typingUsers);
  
  if (typingUserIds.length === 0) return null;

  const firstTypingUser = typingUserIds[0];
  const userName = userProfiles[firstTypingUser]?.name || 'Someone';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="flex items-center space-x-2 mb-4 mt-2">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${avatarColor}`}>
        <span className="text-white font-semibold text-sm">
          {userInitial}
        </span>
      </div>
      <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div 
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
              style={{animationDelay: '0.1s'}}
            ></div>
            <div 
              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
              style={{animationDelay: '0.2s'}}
            ></div>
          </div>
          <span className="text-xs text-gray-600 font-medium">
            {userName} is typing...
          </span>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
