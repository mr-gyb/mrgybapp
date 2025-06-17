import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import SavedItemCard from './SavedItemCard';

const SavedItems: React.FC = () => {
  const recentItems = [
    {
      id: '1',
      title: 'Space saving furnitures',
      type: 'Video',
      author: 'Just U & Me',
      thumbnail: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      duration: '1:12',
      savedTime: 'Just saved'
    },
    {
      id: '2',
      title: 'Items that make life better and easier!',
      type: 'Video',
      author: 'Just U & Me',
      thumbnail: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      duration: '1:28',
      savedTime: 'Just saved'
    },
    {
      id: '3',
      title: 'Updated - Thank you all SOOOO much for your ki...',
      type: 'Video',
      author: 'Gail Turner Brown',
      thumbnail: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      duration: '1:46',
      savedTime: 'Saved 1d ago'
    }
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 dark:text-black">Most recent</h2>
      <div className="space-y-4 dark:text-black">
        {recentItems.map(item => (
          <SavedItemCard key={item.id} item={item} />
        ))}
      </div>
      <button className="w-full py-3 bg-gray-100 text-gray-800 font-semibold mt-4 rounded-lg">
        See all
      </button>
    </div>
  );
};

export default SavedItems;