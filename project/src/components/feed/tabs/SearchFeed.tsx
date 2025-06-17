import React, { useState } from 'react';
import { Search, Users, FileText, Image as ImageIcon, Video } from 'lucide-react';

const SearchFeed: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { id: 'all', name: 'All', icon: Search },
    { id: 'people', name: 'People', icon: Users },
    { id: 'posts', name: 'Posts', icon: FileText },
    { id: 'images', name: 'Images', icon: ImageIcon },
    { id: 'videos', name: 'Videos', icon: Video }
  ];

  return (
    <div className="space-y-6">
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search the community..."
          className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-navy-blue focus:border-transparent"
        />
        <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
      </div>

      <div className="flex space-x-4 overflow-x-auto pb-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`flex items-center px-4 py-2 rounded-full ${
              activeFilter === filter.id
                ? 'bg-navy-blue text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <filter.icon size={18} className="mr-2" />
            {filter.name}
          </button>
        ))}
      </div>

      {!searchQuery ? (
        <div className="text-center py-12">
          <Search size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Search the Community</h3>
          <p className="text-gray-500">
            Find people, posts, images, and videos across the entire community
          </p>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No results found for "{searchQuery}"
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchFeed;