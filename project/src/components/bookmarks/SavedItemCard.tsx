import React from 'react';
import { MoreHorizontal } from 'lucide-react';

interface SavedItemProps {
  item: {
    title: string;
    type: string;
    author: string;
    thumbnail: string;
    duration: string;
    savedTime: string;
  };
}

const SavedItemCard: React.FC<SavedItemProps> = ({ item }) => {
  return (
    <div className="flex items-start space-x-3">
      <div className="relative flex-shrink-0">
        <img 
          src={item.thumbnail} 
          alt={item.title} 
          className="w-24 h-24 object-cover rounded-lg"
        />
        <div className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1 rounded">
          {item.duration}
        </div>
      </div>
      <div className="flex-grow">
        <div className="flex justify-between">
          <div>
            <h3 className="font-semibold">{item.title}</h3>
            <p className="text-gray-600 text-sm">
              {item.type} · {item.author}
            </p>
            <p className="text-gray-600 text-sm">
              {item.savedTime}
            </p>
          </div>
          <button className="text-gray-500">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SavedItemCard;