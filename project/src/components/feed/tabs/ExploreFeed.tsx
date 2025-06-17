import React, { useState } from 'react';
import { Newspaper, Zap, Globe, Award } from 'lucide-react';

const ExploreFeed: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All', icon: Globe },
    { id: 'news', name: 'News', icon: Newspaper },
    { id: 'tech', name: 'Technology', icon: Zap },
    { id: 'business', name: 'Business', icon: Award }
  ];

  const posts = [
    {
      id: '1',
      category: 'tech',
      title: 'The Future of AI in Business',
      content: 'Artificial Intelligence is revolutionizing how businesses operate...',
      source: 'Tech Daily',
      image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      timestamp: '2 hours ago'
    },
    {
      id: '2',
      category: 'business',
      title: 'Global Markets Update',
      content: 'Markets show strong recovery as tech sector leads gains...',
      source: 'Business Insider',
      image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      timestamp: '4 hours ago'
    }
  ];

  const filteredPosts = selectedCategory === 'all' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center px-4 py-2 rounded-full ${
              selectedCategory === category.id
                ? 'bg-navy-blue text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <category.icon size={18} className="mr-2" />
            {category.name}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <span className="bg-gray-100 px-2 py-1 rounded-full">
                  {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
                </span>
                <span className="mx-2">•</span>
                <span>{post.timestamp}</span>
              </div>
              <h3 className="text-xl font-bold mb-2">{post.title}</h3>
              <p className="text-gray-600 mb-4">{post.content}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Source: {post.source}</span>
                <button className="text-navy-blue hover:text-blue-700 font-medium">
                  Read More
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExploreFeed;