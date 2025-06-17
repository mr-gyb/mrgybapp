import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import SavedItems from './SavedItems';
import Collections from './Collections';

const BookmarksPage: React.FC = () => {
  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link to="/dashboard" className="mr-4">
              <ChevronLeft size={24} className="text-black" />
            </Link>
            <h1 className="text-2xl font-bold">Saved</h1>
          </div>
        </div>

        <SavedItems />
        
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold  dark:text-black">Collections</h2>
            <button className="text-blue-500 font-semibold">Create</button>
          </div>
          <Collections />
        </div>
      </div>
    </div>
  );
};

export default BookmarksPage;