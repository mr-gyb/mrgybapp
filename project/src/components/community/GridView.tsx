import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/useToast';
import { getAllProfiles } from '../../services/profile.service';
import { watchFollowState, toggleFollow } from '../../services/follow.service';
import { UserProfile } from '../../types/user';
import { Loader2, Users, Star, UserPlus, Check } from 'lucide-react';

interface GridViewProps {
  searchTerm?: string;
}

interface ProfileCardProps {
  profile: UserProfile;
  currentUserId: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile, currentUserId }) => {
  const { showError, showSuccess } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Watch follow state
  useEffect(() => {
    if (!currentUserId || profile.id === currentUserId) {
      setIsChecking(false);
      return;
    }

    const unsubscribe = watchFollowState(currentUserId, profile.id, (following) => {
      setIsFollowing(following);
      setIsChecking(false);
    });

    return () => unsubscribe();
  }, [currentUserId, profile.id]);

  const handleFollowToggle = async () => {
    if (!currentUserId || profile.id === currentUserId || isToggling) {
      return;
    }

    setIsToggling(true);
    const previousState = isFollowing;

    // Optimistic update
    setIsFollowing(!isFollowing);

    try {
      await toggleFollow(currentUserId, profile.id);
      showSuccess(isFollowing ? 'Unfollowed' : 'Following');
    } catch (error: unknown) {
      console.error('Error toggling follow:', error);
      showError(error instanceof Error ? error.message : 'Failed to toggle follow');
      // Revert optimistic update
      setIsFollowing(previousState);
    } finally {
      setIsToggling(false);
    }
  };

  const isOwnProfile = profile.id === currentUserId;

  // Format rating to one decimal place
  const rating = typeof profile.rating === 'number' ? profile.rating.toFixed(1) : '0.0';
  const ratingNum = parseFloat(rating);

  // Get level text from experienceLevel
  const levelText = `Level ${profile.experienceLevel || 1}`;

  // Truncate bio to 2 lines
  const bioLines = profile.bio?.split('\n') || [];
  const truncatedBio = bioLines.length > 2 
    ? bioLines.slice(0, 2).join('\n') + '...'
    : profile.bio || 'No bio available';

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col"
      style={{ 
        height: '100%', 
        minHeight: '400px',
        width: '100%',
        maxWidth: '100%'
      }}
    >
      {/* Banner Image - 180px height, rounded top */}
      <div className="relative w-full flex-shrink-0" style={{ height: '180px', width: '100%', overflow: 'hidden' }}>
        <img
          src={profile.cover_image_url || 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'}
          alt={`${profile.name} cover`}
          className="w-full h-full object-cover"
          style={{ objectFit: 'cover' }}
        />
        
        {/* Follow Button - Top Right */}
        {!isOwnProfile && !isChecking && (
          <div className="absolute top-3 right-3">
            <button
              onClick={handleFollowToggle}
              disabled={isToggling}
              className={`
                px-4 py-1.5 rounded-full text-sm font-medium transition-colors
                flex items-center gap-1.5
                ${
                  isFollowing
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
                shadow-sm
              `}
            >
              {isToggling ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : isFollowing ? (
                <>
                  <Check size={14} />
                  <span>Following</span>
                </>
              ) : (
                <>
                  <UserPlus size={14} />
                  <span>Follow</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Overlapping Avatar - 56px, sitting on banner bottom edge */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
          <div 
            className="rounded-full overflow-hidden border-4 border-white dark:border-gray-800 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center"
            style={{ width: '56px', height: '56px' }}
          >
            {profile.profile_image_url ? (
              <img
                src={profile.profile_image_url}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-semibold text-lg">
                {profile.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content Section - with top padding for avatar overlap */}
      <div 
        className="pt-8 pb-4 px-4 text-center flex-1 flex flex-col" 
        style={{ paddingTop: '32px', paddingBottom: '16px', paddingLeft: '16px', paddingRight: '16px' }}
      >
        {/* Name + Handle + AI Badge */}
        <div className="mb-2">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 dark:text-white text-base">
              {profile.name}
            </h3>
            {profile.isAI && (
              <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">
                AI
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            @{profile.username || profile.id.slice(0, 8)}
          </p>
        </div>

        {/* Category and Level */}
        <div className="flex items-center justify-center gap-3 mb-3 text-xs text-gray-600 dark:text-gray-400">
          <span>{profile.industry || 'General'}</span>
          <span>•</span>
          <span>{levelText}</span>
        </div>

        {/* Bio - 2 lines with ellipsis */}
        <p 
          className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2 flex-1"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            minHeight: '2.5rem',
            maxHeight: '3rem'
          }}
        >
          {truncatedBio}
        </p>

        {/* Rating Row - Stars and Numeric Score */}
        <div className="flex items-center justify-center gap-2 mt-auto">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={14}
                className={
                  star <= Math.round(ratingNum)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300 dark:text-gray-600'
                }
              />
            ))}
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {rating}
          </span>
        </div>
      </div>
    </div>
  );
};

const GridView: React.FC<GridViewProps> = ({ searchTerm = '' }) => {
  const { user, isAuthenticated } = useAuth();
  const { showError } = useToast();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Load profiles and select 3-6 random users
  useEffect(() => {
    const loadProfiles = async () => {
      setLoading(true);
      try {
        const allProfiles = await getAllProfiles();
        // Filter out current user's profile
        const filteredProfiles = allProfiles.filter(
          (p) => p.id !== user?.uid
        );
        
        // Shuffle and select 3-6 random profiles
        const shuffled = [...filteredProfiles].sort(() => Math.random() - 0.5);
        const randomCount = Math.floor(Math.random() * 4) + 3; // Random number between 3-6
        const selectedProfiles = shuffled.slice(0, Math.min(randomCount, shuffled.length));
        
        setProfiles(selectedProfiles);
      } catch (error) {
        console.error('Error loading profiles:', error);
        showError('Failed to load profiles. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      loadProfiles();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user?.uid, showError]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
        <Users size={48} className="text-gray-400 mb-4" />
        <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
          Sign in to see the community grid.
        </p>
      </div>
    );
  }

  return (
    <div className="grid-view-container">
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="animate-spin text-blue-500" size={32} />
        </div>
      ) : (
        <>
          {profiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
              <Users size={48} className="text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
                No profiles available
              </p>
            </div>
          ) : (
            <>
              {/* Responsive Grid: 3 columns desktop, 2 tablet, 1 mobile */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
                {profiles.map((profile) => (
                  <ProfileCard
                    key={profile.id}
                    profile={profile}
                    currentUserId={user?.uid || ''}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default GridView;
