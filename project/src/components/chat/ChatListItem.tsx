import React, { useState } from 'react';
import { MoreVertical, Archive, Trash2, X } from 'lucide-react';
import { ChatRoom } from '../types/friendships';
import { archiveChat, deleteChatForEveryone, deleteChatForUser } from '../services/chats';
import { useAuth } from '../contexts/AuthContext';

interface ChatListItemProps {
  chat: ChatRoom;
  otherUserName?: string;
  lastMessage?: string;
  onChatClick?: (chatId: string) => void;
  onArchive?: () => void;
  onDelete?: () => void;
}

export const ChatListItem: React.FC<ChatListItemProps> = ({
  chat,
  otherUserName,
  lastMessage,
  onChatClick,
  onArchive,
  onDelete
}) => {
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!user) return null;

  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsArchiving(true);
    try {
      await archiveChat(chat.id, user.uid);
      console.log('✅ Chat archived:', chat.id);
      if (onArchive) onArchive();
    } catch (error) {
      console.error('❌ Error archiving chat:', error);
    } finally {
      setIsArchiving(false);
      setShowMenu(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this chat? If both users delete, it will be permanently removed.')) {
      return;
    }
    
    setIsDeleting(true);
    try {
      // Check if user is allowed to hard delete
      const canHardDelete = chat.canHardDelete?.includes(user.uid);
      
      if (canHardDelete) {
        await deleteChatForEveryone(chat.id, user.uid);
        console.log('✅ Chat permanently deleted:', chat.id);
      } else {
        // Per-user delete
        await deleteChatForUser(chat.id, user.uid);
        console.log('✅ Chat deleted for current user:', chat.id);
      }
      
      if (onDelete) onDelete();
    } catch (error) {
      console.error('❌ Error deleting chat:', error);
    } finally {
      setIsDeleting(false);
      setShowMenu(false);
    }
  };

  const handleClick = () => {
    if (onChatClick) {
      onChatClick(chat.id);
    }
  };

  return (
    <div 
      className="relative flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors group"
      onClick={handleClick}
    >
      {/* Avatar */}
      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium mr-3">
        {(otherUserName || 'U').charAt(0).toUpperCase()}
      </div>

      {/* Chat Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-medium text-gray-900 dark:text-white truncate">
            {otherUserName || 'Unknown User'}
          </h4>
          {lastMessage && (
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
              {chat.lastMessageAt?.toDate?.()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
        {lastMessage && (
          <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
            {lastMessage}
          </p>
        )}
      </div>

      {/* Menu Button */}
      <div className="relative ml-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical size={18} className="text-gray-600 dark:text-gray-400" />
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(false);
              }}
            />
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
              <button
                onClick={handleArchive}
                disabled={isArchiving || isDeleting}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50"
              >
                <Archive size={16} />
                {isArchiving ? 'Archiving...' : 'Archive Chat'}
              </button>
              <button
                onClick={handleDelete}
                disabled={isArchiving || isDeleting}
                className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50"
              >
                <Trash2 size={16} />
                {isDeleting ? 'Deleting...' : 'Delete Chat'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
