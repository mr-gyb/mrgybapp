import React, { useState } from 'react';
import { Heart, MessageCircle, Repeat2, Share, Star, Bot, MoreHorizontal, Send, Bookmark, Eye, Link2, Twitter, Facebook, Linkedin, Mail } from 'lucide-react';
import { UserProfile } from '../../types/user';
import ForYouFeed from './tabs/ForYouFeed';
import GroupsFeed from './tabs/GroupsFeed';
import ExploreFeed from './tabs/ExploreFeed';
import SearchFeed from './tabs/SearchFeed';

interface NewsFeedViewProps {
  users: UserProfile[];
}

const NewsFeedView: React.FC<NewsFeedViewProps> = ({ users }) => {
  const [activeTab, setActiveTab] = useState<'for-you' | 'groups' | 'explore' | 'search'>('for-you');
  const [newPost, setNewPost] = useState('');

  const handleNewPost = () => {
    if (!newPost.trim()) return;
    // Handle new post creation
    setNewPost('');
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* New Post Input */}
      <div className="bg-white dark:bg-navy-blue/50 p-4 mb-4 rounded-lg shadow">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="What's happening?"
          className="w-full p-3 rounded-lg border dark:border-gray-700 dark:bg-navy-blue/30 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-navy-blue"
          rows={3}
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={handleNewPost}
            disabled={!newPost.trim()}
            className="bg-navy-blue text-white px-4 py-2 rounded-full disabled:opacity-50 hover:bg-opacity-90"
          >
            Post
          </button>
        </div>
      </div>

      {/* Feed Tabs */}
      <div className="flex justify-center mb-6">
        <div className="bg-gray-100 rounded-full p-1 flex space-x-2">
          <button
            onClick={() => setActiveTab('for-you')}
            className={`px-6 py-2 rounded-full flex items-center ${
              activeTab === 'for-you' ? 'bg-navy-blue text-white' : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            For You
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`px-6 py-2 rounded-full flex items-center ${
              activeTab === 'groups' ? 'bg-navy-blue text-white' : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            Groups
          </button>
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-6 py-2 rounded-full flex items-center ${
              activeTab === 'explore' ? 'bg-navy-blue text-white' : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            Explore
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`px-6 py-2 rounded-full flex items-center ${
              activeTab === 'search' ? 'bg-navy-blue text-white' : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            Search
          </button>
        </div>
      </div>

      {/* Feed Content */}
      {activeTab === 'for-you' && <ForYouFeed users={users} />}
      {activeTab === 'groups' && <GroupsFeed />}
      {activeTab === 'explore' && <ExploreFeed />}
      {activeTab === 'search' && <SearchFeed />}
    </div>
  );
};

export default NewsFeedView;