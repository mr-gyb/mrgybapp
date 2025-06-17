import React from 'react';
import { Lock } from 'lucide-react';

interface CollectionCardProps {
  collection: {
    title: string;
    privacy: string;
    thumbnail: string;
  };
}

const CollectionCard: React.FC<CollectionCardProps> = ({ collection }) => {
  return (
    <div className="rounded-lg overflow-hidden">
      <img 
        src={collection.thumbnail} 
        alt={collection.title} 
        className="w-full h-40 object-cover"
      />
      <div className="p-3 bg-gray-100">
        <h3 className="font-bold mb-1">{collection.title}</h3>
        <div className="flex items-center text-gray-600 text-sm">
          <Lock size={14} className="mr-1" />
          {collection.privacy}
        </div>
      </div>
    </div>
  );
};

export default CollectionCard;