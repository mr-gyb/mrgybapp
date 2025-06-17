import React, { useState, useEffect } from 'react';
import {
  Filter,
  X,
  Star,
  Users,
  Briefcase,
  TrendingUp,
  BarChart2,
} from 'lucide-react';

interface FilterOptions {
  experience: string[];
  contentType: string[];
  rating: number | null;
  sortBy: 'recent' | 'relevant' | 'rating';
}

interface FloatingFilterProps {
  onFilterChange: (filters: FilterOptions) => void;
}

const FloatingFilter: React.FC<FloatingFilterProps> = ({ onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<FilterOptions>({
    experience: [],
    contentType: [],
    rating: null,
    sortBy: 'recent',
  });

  const experienceLevels = [
    { id: 'beginner', label: 'Beginner' },
    { id: 'intermediate', label: 'Intermediate' },
    { id: 'proficient', label: 'Proficient' },
    { id: 'advanced', label: 'Advanced' },
    { id: 'expert', label: 'Expert' },
  ];

  const contentTypes = [
    { id: 'video', label: 'Video Content' },
    { id: 'photo', label: 'Photography' },
    { id: 'audio', label: 'Audio/Podcast' },
    { id: 'written', label: 'Written Content' },
    { id: 'design', label: 'Design Work' },
  ];

  const sortOptions = [
    { id: 'recent', label: 'Most Recent', icon: TrendingUp },
    { id: 'relevant', label: 'Most Relevant', icon: BarChart2 },
    { id: 'rating', label: 'Highest Rated', icon: Star },
  ];

  const handleFilterChange = (category: keyof FilterOptions, value: any) => {
    setLocalFilters((prev) => {
      const newFilters = { ...prev };

      if (category === 'rating') {
        newFilters.rating = newFilters.rating === value ? null : value;
      } else if (category === 'sortBy') {
        newFilters.sortBy = value;
      } else {
        const array = newFilters[category as 'experience' | 'contentType'];
        if (array.includes(value)) {
          newFilters[category as 'experience' | 'contentType'] = array.filter(
            (item) => item !== value
          );
        } else {
          newFilters[category as 'experience' | 'contentType'] = [
            ...array,
            value,
          ];
        }
      }

      return newFilters;
    });
  };

  useEffect(() => {
    onFilterChange(localFilters);
  }, [localFilters, onFilterChange]);

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-navy-blue text-white p-3 rounded-full shadow-lg transition-transform duration-300 hover:scale-110"
      >
        <Filter size={24} />
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl p-6 w-80 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Filter Network</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Experience Level */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center">
                <Briefcase size={18} className="mr-2" />
                Experience Level
              </h4>
              <div className="space-y-2">
                {experienceLevels.map((level) => (
                  <label
                    key={level.id}
                    className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={localFilters.experience.includes(level.id)}
                      onChange={() =>
                        handleFilterChange('experience', level.id)
                      }
                      className="form-checkbox h-4 w-4 text-navy-blue rounded border-gray-300 focus:ring-navy-blue"
                    />
                    <span className="ml-2">{level.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Content Type */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center">
                <Users size={18} className="mr-2" />
                Content Expertise
              </h4>
              <div className="space-y-2">
                {contentTypes.map((type) => (
                  <label
                    key={type.id}
                    className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={localFilters.contentType.includes(type.id)}
                      onChange={() =>
                        handleFilterChange('contentType', type.id)
                      }
                      className="form-checkbox h-4 w-4 text-navy-blue rounded border-gray-300 focus:ring-navy-blue"
                    />
                    <span className="ml-2">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center">
                <Star size={18} className="mr-2" />
                Minimum Rating
              </h4>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleFilterChange('rating', rating)}
                    className={`flex items-center w-full p-2 rounded transition-colors ${
                      localFilters.rating === rating
                        ? 'bg-navy-blue text-white'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex">
                      {[...Array(rating)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={
                            localFilters.rating === rating
                              ? 'fill-current'
                              : 'text-yellow-400 fill-current'
                          }
                        />
                      ))}
                    </div>
                    <span className="ml-2">& Up</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <h4 className="font-semibold mb-2">Sort By</h4>
              <div className="space-y-2">
                {sortOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleFilterChange('sortBy', option.id)}
                    className={`flex items-center w-full p-2 rounded transition-colors ${
                      localFilters.sortBy === option.id
                        ? 'bg-navy-blue text-white'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <option.icon size={18} className="mr-2" />
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingFilter;
