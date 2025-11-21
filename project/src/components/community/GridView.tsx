import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/useToast';
import { getAllProfiles } from '../../services/profile.service';
import { watchFollowState, toggleFollow } from '../../services/follow.service';
import { UserProfile, AI_USERS } from '../../types/user';
import { Loader2, Users, Star, UserPlus, Check, Bot, Briefcase, CheckCircle } from 'lucide-react';
import { getInitials } from '../../utils/avatar';
import { Link } from 'react-router-dom';

interface GridViewProps {
  searchTerm?: string;
}

interface ProfileCardProps {
  profile: UserProfile;
  currentUserId: string;
}

// Team member image mapping
const TEAM_IMAGE_MAP: Record<string, string> = {
  'chris': '/images/team/chris.jpg',
  'charlotte': '/images/team/charlotte.jpg',
  'alex': '/images/team/alex.jpg',
  'devin': '/images/team/devin.jpg',
  'jake': '/images/team/jake.png',
  'mr-gyb-ai': '/images/team/mrgyb-ai.png',
  'mrgyb': '/images/team/mrgyb-ai.png',
};

// Team member ordering and roles
const TEAM_ORDER = ['chris', 'charlotte', 'alex', 'devin', 'jake', 'mr-gyb-ai'];
const TEAM_ROLES: Record<string, { role: string; department: string }> = {
  'chris': { role: 'CEO', department: 'Executive Leadership' },
  'charlotte': { role: 'CHRO', department: 'Human Resources' },
  'alex': { role: 'Operations Expert', department: 'Operations Management' },
  'devin': { role: 'Team Member', department: 'Technology & Development' },
  'jake': { role: 'Tech Expert', department: 'Technology' },
  'mr-gyb-ai': { role: 'Business Growth Expert', department: 'Business Growth' },
  'mrgyb': { role: 'Business Growth Expert', department: 'Business Growth' },
};

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
        aria-label={`${star} star${star > 1 ? 's' : ''}`}
      />
    ))}
    <span className="ml-1 text-sm text-gray-600">{(rating || 0).toFixed(1)}</span>
  </div>
);

const ProfileCard: React.FC<ProfileCardProps> = ({ profile, currentUserId }) => {
  const { showError, showSuccess } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [coverError, setCoverError] = useState(false);

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

  // Get team image if available
  const teamImage = TEAM_IMAGE_MAP[profile.id.toLowerCase()];
  const profileImageUrl = teamImage || profile.profile_image_url;
  const hasImageError = imageError || (!profileImageUrl && !teamImage);

  // Get initials for fallback
  const initials = getInitials(profile.name);

  // Get role and department
  const teamInfo = TEAM_ROLES[profile.id.toLowerCase()] || TEAM_ROLES[profile.name.toLowerCase()];
  const department = teamInfo?.department || profile.industry || 'General';
  const role = teamInfo?.role || 'Team Member';

  // Format rating
  const rating = typeof profile.rating === 'number' ? profile.rating.toFixed(1) : '0.0';
  const ratingNum = parseFloat(rating);

  // Get level text - always show "Level - Unknown"
  const levelText = 'Level - Unknown';

  // Truncate bio
  const bio = profile.bio || 'No bio available';
  const truncatedBio = bio.length > 100 ? bio.substring(0, 100) + '...' : bio;

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200 focus-within:ring-2 focus-within:ring-navy-blue focus-within:outline-none"
      tabIndex={0}
      role="article"
      aria-label={`Profile card for ${profile.name}`}
    >
      {/* Cover image section */}
      <div className="h-32 bg-cover bg-center relative">
        {!coverError && profile.cover_image_url ? (
          <img
            src={profile.cover_image_url}
            alt={`${profile.name} cover`}
            className="w-full h-32 object-cover"
            onError={() => setCoverError(true)}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-32 bg-gradient-to-br from-navy-blue to-blue-600"></div>
        )}
      </div>
      
      {/* Content section with overlapping avatar */}
      <div className="p-4 relative">
        {/* Profile avatar - overlapping the cover */}
        <div className="absolute -top-12 left-4">
          <div className="w-24 h-24 rounded-full border-4 border-gray-300 overflow-hidden bg-white shadow-md">
            {hasImageError ? (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-navy-blue to-blue-600">
                <span className="text-white text-2xl font-bold" aria-label={`Initials for ${profile.name}`}>
                  {initials}
                </span>
              </div>
            ) : (
              <img
                src={profileImageUrl}
                alt={`${profile.name} profile`}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
                onError={() => setImageError(true)}
              />
            )}
          </div>
        </div>
        
        {/* Content */}
        <div className="mt-14">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <h3 className="font-bold text-xl">{profile.name || 'Anonymous User'}</h3>
              {!profile.isAI && (
                <span className="ml-2 text-blue-500" aria-label="Verified user">
                  <CheckCircle size={16} className="fill-current" />
                </span>
              )}
            </div>
            {profile.isAI ? (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center" aria-label="AI Agent">
                <Bot size={16} className="mr-1" />
                AI
              </span>
            ) : (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm flex items-center">
                <Briefcase size={16} className="mr-1" />
                {role}
              </span>
            )}
          </div>
          
          <p className="text-gray-600 mb-2">{profile.username || `@${profile.id.slice(0, 8)}`}</p>
          
          <div className="flex items-center mb-2">
            <Briefcase size={16} className="text-gray-500 mr-2" />
            <span className="text-gray-600">{department}</span>
          </div>
          
          <div className="flex items-center mb-2 space-x-2">
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
            <span className="text-sm font-medium">{levelText}</span>
          </div>
          
          <p className="text-gray-600 mb-2 line-clamp-2">{truncatedBio}</p>
          
          {/* Rating stars */}
          <div aria-label={`Rating: ${rating} out of 5 stars`}>
            {renderStars(profile.rating)}
          </div>
        </div>
      </div>
    </div>
  );
};

// Skeleton loader component
const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
    <div className="h-32 bg-gray-200"></div>
    <div className="p-4 relative">
      <div className="absolute -top-12 left-4">
        <div className="w-24 h-24 rounded-full border-4 border-gray-300 bg-gray-200"></div>
      </div>
      <div className="mt-14 space-y-3">
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
  </div>
);

const GridView: React.FC<GridViewProps> = ({ searchTerm = '' }) => {
  const { user, isAuthenticated } = useAuth();
  const { showError } = useToast();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore] = useState(false); // Only 6 team members, no pagination needed

  // Load team members and regular profiles
  useEffect(() => {
    const loadProfiles = async () => {
      setLoading(true);
      try {
        // Get team members first (AI users)
        const teamMembers: UserProfile[] = [];
        
        // Add team members in correct order
        for (const teamId of TEAM_ORDER) {
          // Try both lowercase and original case
          const aiUser = AI_USERS[teamId] || AI_USERS[teamId.toLowerCase()];
          if (aiUser) {
            // Update image URLs to use local team images
            const teamImage = TEAM_IMAGE_MAP[teamId] || TEAM_IMAGE_MAP[teamId.toLowerCase()];
            if (teamImage) {
              teamMembers.push({
                ...aiUser,
                profile_image_url: teamImage,
              });
            } else {
              teamMembers.push(aiUser);
            }
          }
        }

        // Only show the 6 team members - no other profiles
        const filtered = searchTerm.trim()
          ? teamMembers.filter(p => 
              p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              p.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (p.industry || '').toLowerCase().includes(searchTerm.toLowerCase())
            )
          : teamMembers;

        setProfiles(filtered);
        setHasMore(false); // Only 6 team members, no more to load
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
  }, [isAuthenticated, user?.uid, showError, searchTerm]);

  // Show all profiles (only 6 team members)
  const displayedProfiles = profiles;

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <>
          {profiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
              <Users size={48} className="text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-300 text-lg font-medium mb-2">
                No profiles to display yet
              </p>
              <Link
                to="/gyb-live-network"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Find friends →
              </Link>
            </div>
          ) : (
            <>
              {/* Responsive Grid: 3 columns desktop, 2 tablet, 1 mobile */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedProfiles.map((profile) => (
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
