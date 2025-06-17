import React from 'react';
import { Heart, MessageCircle, Repeat2, Share, Star, Bot, MoreHorizontal, Bookmark } from 'lucide-react';
import { UserProfile } from '../../../types/user';

interface ForYouFeedProps {
  users: UserProfile[];
}

const ForYouFeed: React.FC<ForYouFeedProps> = ({ users }) => {
  const posts = [
    {
      id: '1',
      user: users[0],
      content: "Just launched a new digital marketing campaign! 🚀 The results have been incredible so far. Here's what we learned...",
      timestamp: new Date().toISOString(),
      likes: 42,
      comments: 12,
      reposts: 8,
      views: 1234
    },
    {
      id: '2',
      user: users[1],
      content: "Excited to share my latest project! We've been working on revolutionizing how small businesses handle their social media presence.",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      likes: 89,
      comments: 24,
      reposts: 15,
      views: 2567
    }
  ];

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div key={post.id} className="bg-white dark:bg-navy-blue/50 p-4 rounded-lg shadow">
          <div className="flex items-start mb-3">
            <img
              src={post.user?.profile_image_url}
              alt={post.user?.name}
              className="w-12 h-12 rounded-full mr-3"
            />
            <div className="flex-grow">
              <div className="flex items-center">
                <span className="font-bold mr-2">{post.user?.name}</span>
                {post.user?.isAI && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center">
                    <Bot size={12} className="mr-1" />
                    AI
                  </span>
                )}
              </div>
              <span className="text-gray-500 text-sm">
                {new Date(post.timestamp).toLocaleDateString()}
              </span>
            </div>
            <button className="text-gray-500">
              <MoreHorizontal size={20} />
            </button>
          </div>

          <p className="mb-3">{post.content}</p>

          <div className="flex items-center justify-between text-gray-500">
            <div className="flex items-center space-x-6">
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
                <span>{post.reposts}</span>
              </button>
              <button>
                <Bookmark size={18} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ForYouFeed;