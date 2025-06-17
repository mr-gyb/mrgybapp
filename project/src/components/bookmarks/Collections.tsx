import React from 'react';
import CollectionCard from './CollectionCard';

const Collections: React.FC = () => {
  const collections = [
    {
      id: '1',
      title: 'Cool gadgets',
      privacy: 'Only me',
      thumbnail: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    },
    {
      id: '2',
      title: 'Marketing tech',
      privacy: 'Only me',
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-4 dark:text-black">
      {collections.map(collection => (
        <CollectionCard key={collection.id} collection={collection} />
      ))}
    </div>
  );
};

export default Collections;