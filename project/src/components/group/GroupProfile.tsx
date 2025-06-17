import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Users, MessageCircle, Settings, Bell, Share2, Plus, Heart, Repeat2, Bookmark, MoreHorizontal } from 'lucide-react';

const GroupProfile: React.FC = () => {
  const { groupId } = useParams();
  const [activeTab, setActiveTab] = useState('posts');
  const [newPost, setNewPost] = useState('');

  // Mock group data - in a real app, fetch this based on groupId
  const group = {
    id: groupId,
    name: 'Digital Marketing Pros',
    description: 'A community of digital marketing professionals sharing insights and strategies',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    members: 1234,
    posts: 567,
    isAdmin: true,
    isMember: true
  };

  const posts = [
    {
      id: '1',
      author: {
        name: 'John Doe',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
      },
      content: 'Just shared a new case study on our latest social media campaign!',
      timestamp: '2 hours ago',
      likes: 42,
      comments: 12,
      shares: 5
    },
    {
      id: '2',
      author: {
        name: 'Jane Smith',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80'
      },
      content: 'Looking for recommendations on email marketing platforms. Any suggestions?',
      timestamp: '5 hours ago',
      likes: 28,
      comments: 15,
      shares: 2
    }
  ];

  const handleNewPost = () => {
    if (!newPost.trim()) return;
    // Handle new post creation
    setNewPost('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center mb-4">
            <Link to="/gyb-live-network" className="mr-4">
              <ChevronLeft size={24} />
            </Link>
            <h1 className="text-2xl font-bold">{group.name}</h1>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Users size={16} className="mr-1" />
                <span>{group.members.toLocaleString()} members</span>
              </div>
              <div className="flex items-center">
                <MessageCircle size={16} className="mr-1" />
                <span>{group.posts.toLocaleString()} posts</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {group.isMember ? (
                <>
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                    <Bell size={20} />
                  </button>
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                    <Share2 size={20} />
                  </button>
                  {group.isAdmin && (
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                      <Settings size={20} />
                    </button>
                  )}
                </>
              ) : (
                <button className="bg-navy-blue text-white px-4 py-2 rounded-full flex items-center">
                  <Plus size={20} className="mr-2" />
                  Join Group
                </button>
              )}
            </div>
          </div>

          <div className="flex space-x-8 mt-6">
            {['Posts', 'About', 'Members', 'Media'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`pb-2 ${
                  activeTab === tab.toLowerCase()
                    ? 'border-b-2 border-navy-blue text-navy-blue'
                    : 'text-gray-500'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {activeTab === 'posts' && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* New Post Input */}
            {group.isMember && (
              <div className="bg-white p-4 rounded-lg shadow">
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder="Share something with the group..."
                  className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-navy-blue resize-none"
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
            )}

            {/* Posts */}
            {posts.map((post) => (
              <div key={post.id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-start mb-4">
                  <img
                    src={post.author.image}
                    alt={post.author.name}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{post.author.name}</h3>
                        <span className="text-sm text-gray-500">{post.timestamp}</span>
                      </div>
                      <button className="text-gray-500">
                        <MoreHorizontal size={20} />
                      </button>
                    </div>
                    <p className="mt-2">{post.content}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-gray-500 border-t pt-3">
                  <button className="flex items-center space-x-1">
                    <Heart size={18} />
                    <span>{post.likes}</span>
                  </button>
                  <button className="flex items-center space-x-1">
                    <MessageCircle size={18} />
                    <span>{post.comments}</span>
                  </button>
                  <button className="flex items-center space-x-1">
                    <Repeat2 size={18} />
                    <span>{post.shares}</span>
                  </button>
                  <button>
                    <Bookmark size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupProfile;