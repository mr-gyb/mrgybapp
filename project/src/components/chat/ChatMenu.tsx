import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Archive, Trash2, X, AlertTriangle } from 'lucide-react';
import { archiveChat, deleteChatForEveryone, unarchiveChat } from '../../services/chat';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/useToast';
import { doc, updateDoc, deleteDoc, collection, getDocs, query, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface ChatMenuProps {
  chatId: string;
  isArchived?: boolean;
  canDelete?: boolean;
  chatType?: 'direct' | 'team'; // 'direct' uses chatRooms, 'team' uses dream_team_chat
  className?: string;
}

const ChatMenu: React.FC<ChatMenuProps> = ({
  chatId,
  isArchived = false,
  canDelete = false,
  chatType = 'direct', // Default to direct chat
  className = ''
}) => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Archive/unarchive team chat
  const archiveTeamChat = async (chatId: string, uid: string) => {
    const chatRef = doc(db, 'dream_team_chat', chatId);
    const chatDoc = await getDoc(chatRef);
    
    if (!chatDoc.exists()) {
      throw new Error('Chat not found');
    }
    
    const data = chatDoc.data();
    const archivedBy = data.archivedBy || {};
    archivedBy[uid] = true;
    
    await updateDoc(chatRef, {
      archivedBy,
      updatedAt: serverTimestamp()
    });
  };

  // Unarchive team chat
  const unarchiveTeamChat = async (chatId: string, uid: string) => {
    const chatRef = doc(db, 'dream_team_chat', chatId);
    const chatDoc = await getDoc(chatRef);
    
    if (!chatDoc.exists()) {
      throw new Error('Chat not found');
    }
    
    const data = chatDoc.data();
    const archivedBy = data.archivedBy || {};
    delete archivedBy[uid];
    
    await updateDoc(chatRef, {
      archivedBy,
      updatedAt: serverTimestamp()
    });
  };

  // Delete team chat completely
  const deleteTeamChat = async (chatId: string) => {
    const chatRef = doc(db, 'dream_team_chat', chatId);
    
    // Delete all messages in the chat
    const messagesCollection = collection(chatRef, 'messages');
    const messagesSnapshot = await getDocs(query(messagesCollection));
    
    const deletePromises = messagesSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    // Delete the chat document
    await deleteDoc(chatRef);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowDeleteConfirm(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleArchive = async () => {
    if (!user?.uid || isProcessing) return;

    try {
      setIsProcessing(true);
      
      if (chatType === 'team') {
        if (isArchived) {
          await unarchiveTeamChat(chatId, user.uid);
          showSuccess('Team chat unarchived');
        } else {
          await archiveTeamChat(chatId, user.uid);
          showSuccess('Team chat archived');
        }
      } else {
        // Direct chat (chatRooms collection)
        if (isArchived) {
          await unarchiveChat(chatId, user.uid);
          showSuccess('Chat unarchived');
        } else {
          await archiveChat(chatId, user.uid);
          showSuccess('Chat archived');
        }
      }
      
      setIsOpen(false);
    } catch (error: any) {
      console.error('Error archiving/unarchiving chat:', error);
      showError(error.message || 'Failed to archive chat');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!user?.uid || isProcessing) return;

    try {
      setIsProcessing(true);
      
      if (chatType === 'team') {
        await deleteTeamChat(chatId);
        showSuccess('Team chat deleted permanently');
      } else {
        // Direct chat (chatRooms collection)
        await deleteChatForEveryone(chatId, user.uid);
        showSuccess('Chat deleted permanently');
      }
      
      setIsOpen(false);
      setShowDeleteConfirm(false);
    } catch (error: any) {
      console.error('Error deleting chat:', error);
      showError(error.message || 'Failed to delete chat');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user?.uid) return null;

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      {/* Menu Button - Visible Archive/Delete Options */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 hover:text-navy-blue dark:text-gray-300 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent hover:border-gray-300 dark:hover:border-gray-600"
        aria-label="Chat options - Archive or Delete"
        title="Archive or Delete chat"
        disabled={isProcessing}
      >
        <MoreVertical size={20} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && !showDeleteConfirm && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="py-1">
            <button
              onClick={handleArchive}
              disabled={isProcessing}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 disabled:opacity-50"
            >
              <Archive size={16} />
              {isArchived ? 'Unarchive' : 'Archive'}
            </button>
            
            {(canDelete || true) && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isProcessing}
                className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 disabled:opacity-50"
              >
                <Trash2 size={16} />
                Delete
              </button>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="p-4">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  Delete Chat?
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  This will permanently delete this chat and all messages for everyone. This action cannot be undone.
                </p>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isProcessing}
                className="flex-1 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isProcessing}
                className="flex-1 px-3 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatMenu;

