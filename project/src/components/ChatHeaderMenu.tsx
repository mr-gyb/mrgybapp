import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Archive, Trash2, AlertTriangle } from 'lucide-react';
import { archiveChat, unarchiveChat, deleteChatForEveryone, deleteChatForUser, getRoom } from '../services/chats';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';

interface ChatHeaderMenuProps {
  chatId: string;
  isArchived?: boolean;
  onChatArchived?: () => void;
  onChatDeleted?: () => void;
}

const ChatHeaderMenu: React.FC<ChatHeaderMenuProps> = ({ 
  chatId, 
  isArchived = false, 
  onChatArchived, 
  onChatDeleted 
}) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [chatData, setChatData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Load chat data
  useEffect(() => {
    const loadChatData = async () => {
      try {
        const room = await getRoom(chatId);
        setChatData(room);
      } catch (error) {
        console.error('Error loading chat data:', error);
      }
    };

    if (chatId) {
      loadChatData();
    }
  }, [chatId]);

  const handleArchive = async () => {
    if (!user?.uid || !chatId) return;
    
    setLoading(true);
    try {
      if (isArchived) {
        await unarchiveChat(chatId, user.uid);
        showSuccess('Chat restored');
        onChatArchived?.();
      } else {
        await archiveChat(chatId, user.uid);
        showSuccess('Chat archived');
        onChatArchived?.();
      }
    } catch (error: any) {
      console.error('Error archiving chat:', error);
      showError(error.message || 'Failed to archive chat');
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!user?.uid || !chatId || !chatData) return;
    
    const canHardDelete = chatData.canHardDelete?.includes(user.uid);
    const confirmed = window.confirm(
      canHardDelete
        ? 'Permanently delete this chat for everyone? This cannot be undone.'
        : 'Delete this chat for you? If both users delete, it will be permanently removed.'
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      if (canHardDelete) {
        await deleteChatForEveryone(chatId, user.uid);
        showSuccess('Chat permanently deleted');
      } else {
        await deleteChatForUser(chatId, user.uid);
        showSuccess('Chat deleted for you');
      }
      onChatDeleted?.();
    } catch (error: any) {
      console.error('Error deleting chat:', error);
      showError(error.message || 'Failed to delete chat');
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  const canDelete = chatData?.canHardDelete?.includes(user?.uid || '');

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
        disabled={loading}
      >
        <MoreVertical size={20} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="py-1">
            {/* Archive/Unarchive Option */}
            <button
              onClick={handleArchive}
              disabled={loading}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Archive size={16} />
              {isArchived ? 'Restore Chat' : 'Archive Chat'}
            </button>

            {/* Delete Options */}
            <button
              onClick={handleDelete}
              disabled={loading}
              className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Trash2 size={16} />
              {canDelete ? 'Delete Chat' : 'Delete For Me'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHeaderMenu;
