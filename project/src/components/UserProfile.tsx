import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Calendar, Link as LinkIcon, Mail, Star, Bot, ChevronLeft, Briefcase } from 'lucide-react';
import { UserProfile as UserProfileType } from '../types/user';
import { getAIUser, getPlaceholderUser } from '../types/user';
import { getProfile } from '../lib/firebase/profile';

const UserProfile: React.FC = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserProfileType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!userId) return;
      setIsLoading(true);
      setError(null);

      try {
        // First check if this is an AI user
        const aiUser = getAIUser(userId);
        if (aiUser) {
          setUserData(aiUser);
          setIsLoading(false);
          return;
        }

        // Then check if this is a placeholder user
        const placeholderUser = getPlaceholderUser(userId);
        if (placeholderUser) {
          setUserData(placeholderUser);
          setIsLoading(false);
          return;
        }

        // If not AI or placeholder, try to get from database
        const profileData = await getProfile(userId);
        if (profileData) {
          setUserData(profileData);
        } else {
          throw new Error('User profile not found');
        }
      } catch (err) {
        console.error('Error loading user profile:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while loading the profile');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [userId]);

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

  const renderContent = () => {
    if (!userData?.content) return null;

    switch (activeTab) {
      case 'posts':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userData.content.posts?.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow-md p-4">
                <h3 className="font-bold mb-2">{post.title}</h3>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{post.date}</span>
                  <div>
                    <span className="mr-4">❤️ {post.likes}</span>
                    <span>💬 {post.comments}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'media':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {userData.content.media?.map((item) => (
              <div key={item.id} className="relative aspect-square">
                {item.type === 'video' ? (
                  <div className="relative h-full">
                    <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover rounded-lg" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                      <Bot size={24} className="text-white" />
                    </div>
                  </div>
                ) : (
                  <img src={item.url} alt={item.title} className="w-full h-full object-cover rounded-lg" />
                )}
              </div>
            ))}
          </div>
        );

      case 'highlights':
        return (
          <div className="relative">
            <div className="absolute left-4 md:left-1/2 h-full w-0.5 bg-navy-blue transform -translate-x-1/2"></div>
            
            <div className="space-y-8">
              {userData.content.highlights
                ?.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((highlight, index) => (
                  <div
                    key={highlight.id}
                    className={`relative flex flex-col md:flex-row gap-4 md:gap-8 ${
                      index % 2 === 0 ? 'md:flex-row-reverse' : ''
                    }`}
                  >
                    <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-navy-blue rounded-full transform -translate-x-1/2 z-10"></div>
                    
                    <div className={`flex-1 ml-12 md:ml-0 ${
                      index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'
                    }`}>
                      <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <img 
                          src={highlight.image} 
                          alt={highlight.title} 
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`px-3 py-1 rounded-full text-sm ${
                              highlight.category === 'achievement' ? 'bg-green-100 text-green-800' :
                              highlight.category === 'milestone' ? 'bg-blue-100 text-blue-800' :
                              highlight.category === 'award' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {highlight.category}
                            </span>
                            <time className="text-sm text-gray-500">
                              {new Date(highlight.date).toLocaleDateString()}
                            </time>
                          </div>
                          <h3 className="text-xl font-semibold mb-2">{highlight.title}</h3>
                          <p className="text-gray-600">{highlight.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy-blue"></div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen bg-white p-4">
        <Link to="/gyb-live-network" className="flex items-center text-navy-blue mb-4">
          <ChevronLeft size={24} className="mr-2" />
          Back to GYB Live Network
        </Link>
        <div className="text-center mt-8">
          <h2 className="text-xl font-bold text-red-500 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600">{error || 'Profile not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <Link to="/gyb-live-network" className="flex items-center text-navy-blue mb-4">
          <ChevronLeft size={24} className="mr-2" />
          Back to GYB Live Network
        </Link>

        <div className="relative">
          <div 
            className="h-48 bg-cover bg-center rounded-t-lg"
            style={{ backgroundImage: `url(${userData.cover_image_url})` }}
          />
          <div className="absolute -bottom-16 left-8">
            <div className={`w-32 h-32 rounded-full border-4 ${getExperienceColor(userData.experienceLevel)} overflow-hidden bg-white`}>
              <img
                src={userData.profile_image_url}
                alt={userData.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center mt-2">
              <div className={`w-3 h-3 rounded-full ${getExperienceColor(userData.experienceLevel).replace('border-', 'bg-')} mr-2`}></div>
              <span className="text-sm font-medium">
                Level {userData.experienceLevel} - {getExperienceLabel(userData.experienceLevel)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-20 px-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">{userData.name}</h1>
              <p className="text-gray-600 flex items-center">
                {userData.username}
                {userData.isAI && (
                  <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center">
                    <Bot size={16} className="mr-1" />
                    AI
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  className={star <= Math.round(userData.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                />
              ))}
              <span className="ml-2 text-sm text-gray-600">{userData.rating.toFixed(1)}</span>
            </div>
          </div>

          <div className="flex items-center mb-4">
            <Briefcase size={16} className="text-gray-500 mr-2" />
            <span className="text-gray-600">{userData.industry}</span>
          </div>

          <p className="mt-4">{userData.bio}</p>

          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center text-gray-600">
              <MapPin size={16} className="mr-1" />
              {userData.location}
            </div>
            <div className="flex items-center text-gray-600">
              <LinkIcon size={16} className="mr-1" />
              <a href={userData.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {userData.website}
              </a>
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar size={16} className="mr-1" />
              Joined {new Date(userData.created_at).toLocaleDateString()}
            </div>
          </div>

          <div className="flex mt-4 space-x-4 dark:text-black">
            <span><strong>{userData.following}</strong> Following</span>
            <span><strong>{userData.followers}</strong> Followers</span>
          </div>

          <div className="border-b mt-8">
            <div className="flex space-x-8">
              {['Posts', 'Subs', 'Highlights', 'Media'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`pb-4 ${
                    activeTab === tab.toLowerCase()
                      ? 'border-b-2 border-navy-blue text-navy-blue'
                      : 'text-gray-500'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;