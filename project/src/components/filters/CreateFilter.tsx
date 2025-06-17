import React, { useState } from 'react';
import { Filter, X, Palette } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CreateFilterProps {
  onFilterChange: (filters: {
    contentType: string[];
    status: string[];
  }) => void;
}

const CreateFilter: React.FC<CreateFilterProps> = ({ onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigateToMedia = () => {
    navigate('/new-post');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-navy-blue text-white p-3 rounded-full shadow-lg transition-transform duration-300 hover:scale-110"
      >
        <Filter size={24} />
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl p-6 w-80">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Content Tools</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleNavigateToMedia}
              className="w-full flex items-center p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Palette size={20} className="mr-3 text-navy-blue" />
              <div>
                <h4 className="font-semibold">GYB Media</h4>
                <p className="text-sm text-gray-600">Create and manage media content</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateFilter;