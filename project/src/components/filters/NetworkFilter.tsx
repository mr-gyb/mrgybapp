import React, { useState } from 'react';
import { Filter, X, Star, Users, Target, TrendingUp, Clock, FileText, Image as ImageIcon, Video, Headphones } from 'lucide-react';

interface FilterOptions {
  sortBy: 'recent' | 'relevant';
  contentType: string[];
  profileType: string[];
  experienceLevel: number[];
  minRating: number | null;
}

interface NetworkFilterProps {
  onFilterChange: (filters: FilterOptions) => void;
}

const NetworkFilter: React.FC<NetworkFilterProps> = ({ onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    sortBy: 'recent',
    contentType: [],
    profileType: [],
    experienceLevel: [],
    minRating: null
  });

  const contentTypes = [
    { id: 'photo', label: 'Photos', icon: ImageIcon },
    { id: 'video', label: 'Videos', icon: Video },
    { id: 'audio', label: 'Audio', icon: Headphones },
    { id: 'written', label: 'Written', icon: FileText }
  ];

  const profileTypes = [
    'Writer', 'Editor', 'Developer', 'Designer', 'Marketer', 'Consultant'
  ];

  const experienceLevels = [
    { level: 1, label: 'Beginner' },
    { level: 2, label: 'Intermediate' },
    { level: 3, label: 'Proficient' },
    { level: 4, label: 'Advanced' },
    { level: 5, label: 'Expert' }
  ];

  const handleFilterChange = (category: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters };

    if (category === 'sortBy') {
      newFilters.sortBy = value;
    } else if (category === 'minRating') {
      newFilters.minRating = newFilters.minRating === value ? null : value;
    } else {
      const array = newFilters[category] as string[] | number[];
      if (array.includes(value)) {
        newFilters[category] = array.filter(item => item !== value);
      } else {
        newFilters[category] = [...array, value];
      }
    }

    setFilters(newFilters);
    onFilterChange(newFilters);
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white w-80 h-full p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Filter Content</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-500">
                <X size={24} />
              </button>
            </div>

            {/* Sort Options */}
            <div className="mb-6">
              <h4 className="font-semibold mb-2 flex items-center">
                <TrendingUp size={18} className="mr-2" />
                Sort By
              </h4>
              <div className="space-y-2">
                <button
                  onClick={() => handleFilterChange('sortBy', 'recent')}
                  className={`w-full p-2 rounded-lg flex items-center ${
                    filters.sortBy === 'recent' ? 'bg-navy-blue text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  <Clock size={18} className="mr-2" />
                  Most Recent
                </button>
                <button
                  onClick={() => handleFilterChange('sortBy', 'relevant')}
                  className={`w-full p-2 rounded-lg flex items-center ${
                    filters.sortBy === 'relevant' ? 'bg-navy-blue text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  <TrendingUp size={18} className="mr-2" />
                  Most Relevant
                </button>
              </div>
            </div>

            {/* Content Type Filter */}
            <div className="mb-6">
              <h4 className="font-semibold mb-2 flex items-center">
                <FileText size={18} className="mr-2" />
                Content Type
              </h4>
              <div className="space-y-2">
                {contentTypes.map(type => (
                  <label
                    key={type.id}
                    className="flex items-center p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={filters.contentType.includes(type.id)}
                      onChange={() => handleFilterChange('contentType', type.id)}
                      className="form-checkbox h-4 w-4 text-navy-blue rounded border-gray-300"
                    />
                    <type.icon size={18} className="ml-2 mr-2" />
                    <span>{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Profile Type Filter */}
            <div className="mb-6">
              <h4 className="font-semibold mb-2 flex items-center">
                <Users size={18} className="mr-2" />
                Profile Type
              </h4>
              <div className="space-y-2">
                {profileTypes.map(type => (
                  <label
                    key={type}
                    className="flex items-center p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={filters.profileType.includes(type)}
                      onChange={() => handleFilterChange('profileType', type)}
                      className="form-checkbox h-4 w-4 text-navy-blue rounded border-gray-300"
                    />
                    <span className="ml-2">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Experience Level Filter */}
            <div className="mb-6">
              <h4 className="font-semibold mb-2 flex items-center">
                <Target size={18} className="mr-2" />
                Experience Level
              </h4>
              <div className="space-y-2">
                {experienceLevels.map(({ level, label }) => (
                  <label
                    key={level}
                    className="flex items-center p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={filters.experienceLevel.includes(level)}
                      onChange={() => handleFilterChange('experienceLevel', level)}
                      className="form-checkbox h-4 w-4 text-navy-blue rounded border-gray-300"
                    />
                    <span className="ml-2">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rating Filter */}
            <div className="mb-6">
              <h4 className="font-semibold mb-2 flex items-center">
                <Star size={18} className="mr-2" />
                Minimum Rating
              </h4>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map(rating => (
                  <button
                    key={rating}
                    onClick={() => handleFilterChange('minRating', rating)}
                    className={`w-full p-2 rounded-lg flex items-center ${
                      filters.minRating === rating ? 'bg-navy-blue text-white' : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex">
                      {[...Array(rating)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={filters.minRating === rating ? 'fill-current' : 'text-yellow-400 fill-current'}
                        />
                      ))}
                    </div>
                    <span className="ml-2">{rating}+ Stars</span>
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

export default NetworkFilter;