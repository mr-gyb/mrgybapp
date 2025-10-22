import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Check, X, Building, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/useToast';
import { 
  sendFriendRequest,
  getUserProfile 
} from '../services/userFriendship.service';

interface FriendSearchProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

interface SearchResult {
  uid: string;
  name: string;
  businessName: string;
  industry: string;
  email: string;
}

const FriendSearch: React.FC<FriendSearchProps> = ({ 
  isOpen, 
  onClose, 
  className = '' 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState<Set<string>>(new Set());
  const { user, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useToast();

  // Mock search function - in real app, this would query your user database
  const searchUsers = async (query: string): Promise<SearchResult[]> => {
    if (!query.trim()) return [];
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock data - replace with actual user search API
    const mockUsers: SearchResult[] = [
      {
        uid: 'user1',
        name: 'John Smith',
        businessName: 'Tech Solutions Inc',
        industry: 'Technology',
        email: 'john@techsolutions.com'
      },
      {
        uid: 'user2',
        name: 'Sarah Johnson',
        businessName: 'Marketing Pro',
        industry: 'Marketing',
        email: 'sarah@marketingpro.com'
      },
      {
        uid: 'user3',
        name: 'Mike Wilson',
        businessName: 'Design Studio',
        industry: 'Design',
        email: 'mike@designstudio.com'
      },
      {
        uid: 'user4',
        name: 'Lisa Brown',
        businessName: 'Consulting Group',
        industry: 'Consulting',
        email: 'lisa@consulting.com'
      }
    ];
    
    return mockUsers.filter(user => 
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.businessName.toLowerCase().includes(query.toLowerCase()) ||
      user.industry.toLowerCase().includes(query.toLowerCase())
    );
  };

  // Handle search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const performSearch = async () => {
      setLoading(true);
      try {
        const results = await searchUsers(searchTerm);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
        showError('Failed to search users');
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, showError]);

  const handleSendRequest = async (targetUid: string, targetName: string) => {
    if (!user?.uid || sending.has(targetUid)) return;

    try {
      setSending(prev => new Set(prev).add(targetUid));
      
      await sendFriendRequest(user.uid, targetUid);
      showSuccess(`Friend request sent to ${targetName}`);
      
    } catch (error: any) {
      console.error('Error sending friend request:', error);
      showError(error.message || 'Failed to send friend request');
    } finally {
      setSending(prev => {
        const newSet = new Set(prev);
        newSet.delete(targetUid);
        return newSet;
      });
    }
  };

  const handleClose = () => {
    setSearchTerm('');
    setSearchResults([]);
    onClose();
  };

  if (!isOpen || !isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${className}`}>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Add Friends
              </h3>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                <X size={20} className="text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>

          {/* Search Input */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, business, or industry..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>
          </div>

          {/* Search Results */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="px-6 py-8 text-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">Searching...</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="px-6 py-8 text-center">
                {searchTerm ? (
                  <>
                    <UserPlus size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No users found matching "{searchTerm}"
                    </p>
                  </>
                ) : (
                  <>
                    <Search size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Start typing to search for friends
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="px-6 py-4 space-y-3">
                {searchResults.map((user) => (
                  <div
                    key={user.uid}
                    className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    {/* User Info */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {user.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <Building size={12} />
                          <span className="truncate">{user.businessName}</span>
                          <span>•</span>
                          <span>{user.industry}</span>
                        </div>
                      </div>
                    </div>

                    {/* Add Button */}
                    <button
                      onClick={() => handleSendRequest(user.uid, user.name)}
                      disabled={sending.has(user.uid)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white text-xs font-medium rounded-md transition-colors"
                    >
                      {sending.has(user.uid) ? (
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <UserPlus size={12} />
                      )}
                      {sending.has(user.uid) ? 'Sending...' : 'Add'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Search for users by name, business, or industry
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default FriendSearch;
