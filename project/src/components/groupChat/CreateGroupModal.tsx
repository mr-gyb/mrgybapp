import React, { useState, useEffect } from 'react';
import { X, UserPlus, Bot, Search, Check } from 'lucide-react';
import { CreateGroupChatInput } from '../../types/groupChat';
import { AI_USERS } from '../../types/user';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface CreateGroupModalProps {
  onClose: () => void;
  onCreate: (input: CreateGroupChatInput) => Promise<void>;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ onClose, onCreate }) => {
  const { user } = useAuth();
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | undefined>(undefined);
  const [availableUsers, setAvailableUsers] = useState<Array<{ id: string; name: string; email: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Search for users
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setAvailableUsers([]);
      return;
    }

    const searchUsers = async () => {
      setIsSearching(true);
      try {
        // Search users collection by email (prefix search)
        const usersRef = collection(db, 'users');
        const searchLower = searchQuery.toLowerCase();
        
        // Try email search first
        let q = query(
          usersRef,
          where('email', '>=', searchLower),
          where('email', '<=', searchLower + '\uf8ff'),
          limit(10)
        );

        let snapshot;
        try {
          snapshot = await getDocs(q);
        } catch (indexError: any) {
          // If index error, try searching by name instead
          if (indexError.message?.includes('index')) {
            console.warn('Email index not available, trying name search');
            q = query(
              usersRef,
              where('name', '>=', searchQuery),
              where('name', '<=', searchQuery + '\uf8ff'),
              limit(10)
            );
            snapshot = await getDocs(q);
          } else {
            throw indexError;
          }
        }

        const users = snapshot.docs
          .map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name || data.displayName || data.email?.split('@')[0] || 'Unknown',
              email: data.email || '',
            };
          })
          .filter((u) => u.id !== user?.uid && u.email) // Exclude current user and users without email
          .slice(0, 10); // Limit to 10 results

        setAvailableUsers(users);
      } catch (error: any) {
        console.error('Error searching users:', error);
        // Show user-friendly error
        if (error.message?.includes('index')) {
          console.warn('Firestore index required for user search. Users can still be added by ID.');
        }
        setAvailableUsers([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, user?.uid]);

  const handleUserToggle = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleAgentToggle = (agentId: string) => {
    setSelectedAgent((prev) => (prev === agentId ? undefined : agentId));
  };

  const handleCreate = async () => {
    if (!groupName.trim()) {
      alert('Please enter a group name');
      return;
    }

    if (selectedUsers.length === 0 && !selectedAgent) {
      alert('Please invite at least one user or select an AI agent');
      return;
    }

    if (!user?.uid) {
      alert('You must be logged in');
      return;
    }

    setIsLoading(true);
    try {
      const result = await onCreate({
        name: groupName.trim(),
        userId: user.uid,
        invitedUserIds: selectedUsers,
        selectedAgentId: selectedAgent,
      });
      
      if (!result) {
        // Error was already set by the hook, don't throw again
        console.error('Group creation returned null - check error message above');
        return;
      }
    } catch (error: any) {
      console.error('Error creating group:', error);
      const errorMessage = error.message || 'Failed to create group chat. Please try again.';
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const availableAgents = Object.values(AI_USERS).filter((agent) => agent.isAI);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Create Group Chat</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Group Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Name
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Invite Users */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invite Users
            </label>
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users by email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Search Results */}
            {isSearching && (
              <div className="text-sm text-gray-500 py-2">Searching...</div>
            )}

            {availableUsers.length > 0 && (
              <div className="border border-gray-200 rounded-lg mt-2 max-h-40 overflow-y-auto">
                {availableUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleUserToggle(user.id)}
                    className={`w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between ${
                      selectedUsers.includes(user.id) ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    {selectedUsers.includes(user.id) && (
                      <Check className="w-5 h-5 text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Selected Users */}
            {selectedUsers.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedUsers.map((userId) => {
                  const user = availableUsers.find((u) => u.id === userId);
                  return (
                    <div
                      key={userId}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
                    >
                      <span>{user?.name || userId.substring(0, 8)}</span>
                      <button
                        onClick={() => handleUserToggle(userId)}
                        className="hover:text-blue-900"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Select AI Agent */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add AI Agent (Optional)
            </label>
            <div className="grid grid-cols-2 gap-3">
              {availableAgents.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => handleAgentToggle(agent.id)}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectedAgent === agent.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={agent.profile_image_url}
                      alt={agent.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{agent.name}</p>
                      <p className="text-xs text-gray-500 truncate">{agent.bio}</p>
                    </div>
                    {selectedAgent === agent.id && (
                      <Check className="w-5 h-5 text-purple-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={isLoading || !groupName.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isLoading ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;

