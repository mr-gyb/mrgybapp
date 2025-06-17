import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Star, Bot, Briefcase, Grid, Map as MapIcon, Newspaper, CheckCircle, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UserProfile } from '../types/user';
import { AI_USERS, PLACEHOLDER_USERS } from '../types/user';
import NetworkFilter from './filters/NetworkFilter';
import NewsFeedView from './feed/NewsFeedView';

type ViewMode = 'grid' | 'feed' | 'map';

const GYBLiveNetwork: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Combine AI and placeholder users
    const allUsers = [...Object.values(AI_USERS), ...Object.values(PLACEHOLDER_USERS)];
    setUsers(allUsers);
    setFilteredUsers(allUsers);
    setIsLoading(false);
  }, []);

  const getExperienceColor = (level: number) => {
    switch (level) {
      case 1: return 'border-red-500';
      case 2: return 'border-orange-500';
      case 3: return 'border-blue-500';
      case 4: return 'border-green-500';
      case 5: return 'border-yellow-400';
      default: return 'border-gray-300';
    }
  };

  const getExperienceLabel = (level: number) => {
    switch (level) {
      case 1: return 'Beginner';
      case 2: return 'Intermediate';
      case 3: return 'Proficient';
      case 4: return 'Advanced';
      case 5: return 'Expert';
      default: return 'Unknown';
    }
  };

  const renderStars = (rating: number | undefined) => (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={16}
          className={star <= Math.round(rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
        />
      ))}
      <span className="ml-1 text-sm text-gray-600">{(rating || 0).toFixed(1)}</span>
    </div>
  );

  const handleFilterChange = (filters: any) => {
    let filtered = [...users];

    if (filters.experience?.length > 0) {
      filtered = filtered.filter(user => 
        filters.experience.includes(getExperienceLabel(user.experiencelevel).toLowerCase())
      );
    }

    if (filters.rating) {
      filtered = filtered.filter(user => user.rating >= filters.rating);
    }

    if (filters.location?.length > 0) {
      filtered = filtered.filter(user => 
        filters.location.some((loc: string) => 
          user.location.toLowerCase().includes(loc.toLowerCase())
        )
      );
    }

    setFilteredUsers(filtered);
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredUsers.map((user) => (
        <div
          key={user.id}
          className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200"
        >
          <div className="h-32 bg-cover bg-center" style={{ backgroundImage: `url(${user.cover_image_url})` }}></div>
          <div className="p-4 relative">
            <div className="absolute -top-12 left-4">
              <div className={`w-24 h-24 rounded-full border-4 ${getExperienceColor(user.experiencelevel)} overflow-hidden bg-white`}>
                <img src={user.profile_image_url} alt={user.name} className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="mt-14">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <h3 className="font-bold text-xl">{user.name || 'Anonymous User'}</h3>
                  {!user.isAI && (
                    <span className="ml-2 text-blue-500">
                      <CheckCircle size={16} className="fill-current" />
                    </span>
                  )}
                </div>
                {user.isAI ? (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center">
                    <Bot size={16} className="mr-1" />
                    AI
                  </span>
                ) : (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm flex items-center">
                    <Users size={16} className="mr-1" />
                    HI
                  </span>
                )}
              </div>
              <p className="text-gray-600 mb-2">{user.username || '@user'}</p>
              
              <div className="flex items-center mb-2">
                <Briefcase size={16} className="text-gray-500 mr-2" />
                <span className="text-gray-600">{user.industry || 'Industry not specified'}</span>
              </div>
              
              <div className="flex items-center mb-2 space-x-2">
                <div className={`w-3 h-3 rounded-full ${getExperienceColor(user.experiencelevel).replace('border-', 'bg-')}`}></div>
                <span className="text-sm font-medium">
                  Level {user.experiencelevel} - {getExperienceLabel(user.experiencelevel)}
                </span>
              </div>
              
              <p className="text-gray-600 mb-2 line-clamp-2">{user.bio || 'No bio available'}</p>
              {renderStars(user.rating)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderMapView = () => (
    <div className="bg-gray-100 rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Map View Coming Soon</h2>
      <p>The map view feature is currently under development.</p>
    </div>
  );

  const getViewTitle = () => {
    switch (viewMode) {
      case 'grid':
        return 'GYB Live Network';
      case 'feed':
        return 'GYB Newsfeed';
      case 'map':
        return 'GYB Local Network';
      default:
        return 'GYB Live Network';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy-blue"></div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen text-navy-blue" ref={containerRef}>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Link to="/dashboard" className="mr-4 text-navy-blue">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold text-navy-blue">{getViewTitle()}</h1>
        </div>

        <div className="flex justify-center mb-6">
          <div className="bg-gray-100 rounded-full p-1 flex space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-full flex items-center ${
                viewMode === 'grid' ? 'bg-navy-blue text-white' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Grid size={20} className="mr-2" />
              Grid
            </button>
            <button
              onClick={() => setViewMode('feed')}
              className={`px-4 py-2 rounded-full flex items-center ${
                viewMode === 'feed' ? 'bg-navy-blue text-white' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Newspaper size={20} className="mr-2" />
              Feed
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 rounded-full flex items-center ${
                viewMode === 'map' ? 'bg-navy-blue text-white' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <MapIcon size={20} className="mr-2" />
              Map
            </button>
          </div>
        </div>

        {viewMode === 'grid' && renderGridView()}
        {viewMode === 'feed' && <NewsFeedView users={filteredUsers} />}
        {viewMode === 'map' && renderMapView()}
      </div>
      <NetworkFilter onFilterChange={handleFilterChange} />
    </div>
  );
};

export default GYBLiveNetwork;