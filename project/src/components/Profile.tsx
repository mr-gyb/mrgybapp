import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getProfile, updateProfile } from '../lib/firebase/profile';
import { UserProfile } from '../types/user';
import { doc } from 'firebase/firestore';
import {
  MapPin,
  Calendar,
  Link as LinkIcon,
  Mail,
  Star,
  Edit2,
  Save,
  Image,
  MessageCircle,
  X,
  Plus,
  Camera,
  Bot,
} from 'lucide-react';
import { Link } from 'react-router-dom';


const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        setIsLoading(true);
        const profile = await getProfile(user.uid);
        if (profile) {
          setProfileData(profile);
        }
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setSelectedFile(null);
    setPreviewUrl(null);
    setSelectedCoverFile(null);
    setCoverPreviewUrl(null);
    setError(null);
    setSuccess(null);
  };
  
  const handleFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
    isCover: boolean = false
  ) => {
    
    console.log("handlefileselect!!");
    const file = event.target.files?.[0];
    if (file) {
      console.log("There is a file", file);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        if (isCover) {
          setSelectedCoverFile(file);
          setCoverPreviewUrl(reader.result as string);
        } else {
          setSelectedFile(file);
          setPreviewUrl(reader.result as string);
        }
      };
    }
  };

  const handleSave = async () => {
    if (!user || !profileData) return;

    setError(null);
    setSuccess(null);
    
    try {
      const updatedProfile = await updateProfile(
        user.uid,
        profileData,
        selectedFile,
        selectedCoverFile
      );

      if (updatedProfile) {
        setProfileData(updatedProfile);
        setIsEditing(false);
        setSuccess('Profile updated successfully');
        setSelectedFile(null);
        setPreviewUrl(null);
        setSelectedCoverFile(null);
        setCoverPreviewUrl(null);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    }

    window.dispatchEvent(new Event('profileUpdated'));
  };

  const handleInputChange = (
    field: keyof UserProfile,
    value: string | number
  ) => {
    if (profileData) {
      setProfileData((prev) => ({
        ...prev!,
        [field]: value,
      }));
    }
  };

  const renderContent = () => {
    if (!profileData?.content) return null;

    switch (activeTab) {
      case 'posts':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profileData.content.posts?.map((post) => (
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
            {isEditing && (
              <button className="bg-gray-100 rounded-lg p-4 flex items-center justify-center">
                <Plus size={24} className="mr-2" />
                Add New Post
              </button>
            )}
          </div>
        );

      case 'media':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {profileData.content.media?.map((item) => (
              <div key={item.id} className="relative aspect-square">
                {item.type === 'video' ? (
                  <div className="relative h-full">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                      <Bot size={24} className="text-white" />
                    </div>
                  </div>
                ) : (
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                )}
              </div>
            ))}
            {isEditing && (
              <button className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                <Plus size={24} />
              </button>
            )}
          </div>
        );

      case 'highlights':
        return (
          <div className="relative">
            <div className="absolute left-4 md:left-1/2 h-full w-0.5 bg-navy-blue transform -translate-x-1/2"></div>
            
            <div className="space-y-8">
              {profileData.content.highlights
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

  if (!profileData) return null;

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <Link to="/dashboard" className="text-navy-blue">
            <X size={24} />
          </Link>
          <button
            onClick={isEditing ? handleSave : handleEditToggle}
            className="bg-navy-blue text-white px-4 py-2 rounded-full flex items-center"
          >
            {isEditing ? (
              <>
                <Save size={20} className="mr-2" />
                Save Changes
              </>
            ) : (
              <>
                <Edit2 size={20} className="mr-2" />
                Edit Profile
              </>
            )}
          </button>
        </div>

        {/* Cover Image */}
        <div className="relative">
          <div
            className="h-48 bg-cover bg-center rounded-lg relative"
            style={{
              backgroundImage: `url(${
                coverPreviewUrl || profileData.cover_image_url
              })`,
            }}
          >
            {isEditing && (
              <button
                onClick={() => coverFileInputRef.current?.click()}
                className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white"
              >
                <Image size={24} className="mr-2" />
                Change Cover Image
              </button>
            )}
          </div>
          <input
            ref={coverFileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileSelect(e, true)}
            className="hidden"
          />

          {/* Profile Image */}
          <div className="absolute -bottom-16 left-8">
            <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white relative group">
              {isEditing && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Image size={24} />
                </button>
              )}
              <img
                src={previewUrl || profileData.profile_image_url}
                alt={profileData.name}
                className="w-full h-full object-cover"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileSelect(e)}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="mt-20 px-4">
          <div className="space-y-4">
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="text-2xl font-bold w-full bg-transparent border-b border-navy-blue focus:outline-none text-navy-blue"
                  placeholder="Your Name"
                />
                <input
                  type="text"
                  value={profileData.username}
                  onChange={(e) =>
                    handleInputChange('username', e.target.value)
                  }
                  className="text-gray-600 w-full bg-transparent border-b border-gray-300 focus:outline-none"
                  placeholder="@username"
                />
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-navy-blue">
                  {profileData.name || 'Unnamed User'}
                </h1>
                <p className="text-gray-600">
                  {profileData.username || '@username'}
                </p>
              </>
            )}

            {isEditing ? (
              <textarea
                value={profileData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className="w-full bg-transparent border rounded p-2 focus:outline-none focus:ring-2 focus:ring-navy-blue text-navy-blue"
                rows={3}
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="mt-4 text-navy-blue">{profileData.bio || 'No bio available'}</p>
            )}

            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center text-gray-600">
                <MapPin size={16} className="mr-1" />
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) =>
                      handleInputChange('location', e.target.value)
                    }
                    className="border-b border-gray-300 focus:outline-none focus:border-navy-blue bg-transparent"
                    placeholder="Location"
                  />
                ) : (
                  profileData.location || 'Location not set'
                )}
              </div>
              <div className="flex items-center text-gray-600">
                <LinkIcon size={16} className="mr-1" />
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.website}
                    onChange={(e) =>
                      handleInputChange('website', e.target.value)
                    }
                    className="border-b border-gray-300 focus:outline-none focus:border-navy-blue bg-transparent"
                    placeholder="Website"
                  />
                ) : (
                  <a
                    href={profileData.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {profileData.website || 'No website'}
                  </a>
                )}
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar size={16} className="mr-1" />
                Joined {new Date(profileData.created_at).toLocaleDateString()}
              </div>
            </div>

            <div className="flex mt-4 space-x-4">
              <span>
                <strong>{profileData.following}</strong> Following
              </span>
              <span>
                <strong>{profileData.followers}</strong> Followers
              </span>
            </div>

            {error && (
              <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                {success}
              </div>
            )}
          </div>

          {/* Content Tabs */}
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

          {/* Content Area */}
          <div className="mt-8">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default Profile;