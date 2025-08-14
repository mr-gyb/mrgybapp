import React, { useState } from 'react';
import { Play, Image as ImageIcon, Headphones, FileText, Clock, Check, X, Upload, Plus, Trash, Video, Music, File, Type, Eye, AlertTriangle } from 'lucide-react';
import { ContentItem, ContentType, DEFAULT_CONTENT_ITEMS } from '../../types/content';

interface ContentListProps {
  items: ContentItem[];
  onItemClick: (item: ContentItem) => void;
  showDefaults?: boolean;
  onUploadClick?: () => void;
  onDelete?: (id: string) => void;
  onDeleteAll?: () => void;
  onView?: (item: ContentItem) => void;
}

const CONTENT_TYPE_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Blogs', value: 'written' },
  { label: 'Audio', value: 'audio' },
  { label: 'Video', value: 'video' },
  { label: 'Social Media', value: 'social' },
  { label: 'Other', value: 'other' },
];

const SOCIAL_PLATFORMS = ['instagram', 'facebook', 'pinterest', 'tiktok', 'twitter'];
const NETWORKING_PLATFORMS = ['other'];

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  facebook: <img src="/facebook-icon.svg" alt="Facebook" className="inline w-4 h-4 mr-1 align-text-bottom" />,
  instagram: <span role="img" aria-label="Instagram" className="mr-1">📸</span>,
  pinterest: <span role="img" aria-label="Pinterest" className="mr-1">📌</span>,
  tiktok: <span role="img" aria-label="TikTok" className="mr-1">🎵</span>,
  twitter: <span role="img" aria-label="Twitter" className="mr-1">🐦</span>,
};

const ContentList: React.FC<ContentListProps> = ({ 
  items, 
  onItemClick, 
  showDefaults = true,
  onUploadClick,
  onDelete,
  onDeleteAll,
  onView
}) => {
  const [selectedType, setSelectedType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const filteredItems = items.filter(item => {
    if (selectedType === 'all') return true;
    if (selectedType === 'social') {
      return item.platforms && item.platforms.some(p => SOCIAL_PLATFORMS.includes(p.toLowerCase()));
    }
    if (selectedType === 'other') {
      return item.platforms && item.platforms.some(p => NETWORKING_PLATFORMS.includes(p.toLowerCase()));
    }
    if (selectedType === 'written') {
      return item.type === 'written' && item.platforms && item.platforms.some(p => p.toLowerCase() === 'blog');
    }
    return item.type === selectedType;
  });

  const getTypeIcon = (type: ContentType) => {
    switch (type) {
      case 'video':
        return <Video size={24} className="text-blue-600" />;
      case 'photo':
        return <ImageIcon size={24} className="text-green-600" />;
      case 'audio':
        return <Music size={24} className="text-purple-600" />;
      case 'written':
        return <FileText size={24} className="text-orange-600" />;
      case 'document':
        return <File size={24} className="text-red-600" />;
      case 'text':
        return <Type size={24} className="text-gray-600" />;
      default:
        return <FileText size={24} className="text-gray-600" />;
    }
  };

  const getTypeLabel = (type: ContentType, platforms?: string[]) => {
    if (platforms && platforms.some(p => SOCIAL_PLATFORMS.includes(p.toLowerCase()))) {
      return 'Social Media';
    }
    // Check for YouTube specifically
    if (type === 'video' && platforms && platforms.some(p => p.toLowerCase() === 'youtube')) {
      return 'YouTube';
    }
    switch (type) {
      case 'video':
        return 'Video';
      case 'photo':
        return 'Image';
      case 'audio':
        return 'Audio';
      case 'written':
        return 'Written';
      case 'document':
        return 'Document';
      case 'text':
        return 'Text';
      default:
        return 'Content';
    }
  };

  const getTypeColor = (type: ContentType) => {
    switch (type) {
      case 'video':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'photo':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'audio':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'written':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'document':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'text':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string, isAISuggestion?: boolean) => {
    if (isAISuggestion) {
      return 'bg-purple-100 text-purple-600';
    }
    if (status === 'pending') return 'bg-blue-100 text-blue-600';
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-600';
      case 'rejected':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusLabel = (status: string, isAISuggestion?: boolean) => {
    if (isAISuggestion) {
      return 'Suggestion';
    }
    if (status === 'pending') return 'Uploaded';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const isUserContent = (item: ContentItem) => {
    return !item.id.startsWith('default-');
  };

  const handleDeleteClick = (e: React.MouseEvent, contentId: string) => {
    e.stopPropagation();
    setDeleteConfirmId(contentId);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId || !onDelete) return;
    
    setIsDeleting(true);
    try {
      await onDelete(deleteConfirmId);
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Error deleting content:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmId(null);
  };

  const handleDeleteAllClick = () => {
    setShowDeleteAllConfirm(true);
  };

  const handleConfirmDeleteAll = async () => {
    if (!onDeleteAll) return;
    
    setIsDeletingAll(true);
    try {
      await onDeleteAll();
      setShowDeleteAllConfirm(false);
    } catch (error) {
      console.error('Error deleting all content:', error);
    } finally {
      setIsDeletingAll(false);
    }
  };

  const handleCancelDeleteAll = () => {
    setShowDeleteAllConfirm(false);
  };

  const displayItems = items.length > 0 ? items : (showDefaults ? DEFAULT_CONTENT_ITEMS : []);

  if (displayItems.length === 0) {
    return (
      <div className="text-center py-12">
        <Upload size={64} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold mb-2 text-gray-700">No Content Yet</h3>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          Start your content creation journey by uploading your first piece of content. 
          We'll help you analyze and optimize it for maximum engagement.
        </p>
        {onUploadClick && (
          <button
            onClick={onUploadClick}
            className="bg-navy-blue text-white px-6 py-3 rounded-full flex items-center mx-auto hover:bg-opacity-90 transition duration-200"
          >
            <Plus size={20} className="mr-2" />
            Upload Your First Content
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <label htmlFor="content-type-filter" className="mr-2 font-medium text-navy-blue">Filter by type:</label>
          <select
            id="content-type-filter"
            className="border border-gray-300 rounded px-3 py-1"
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
          >
            {CONTENT_TYPE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        
        {/* Delete All Button */}
        {onDeleteAll && items.filter(item => !item.id.startsWith('default-')).length > 0 && (
          <button
            onClick={handleDeleteAllClick}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center text-sm"
            title="Delete all uploaded content"
          >
            <Trash size={16} className="mr-2" />
            Delete All Content
          </button>
        )}
        
      </div>
      {items.length === 0 && showDefaults && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Upload size={20} className="text-blue-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Welcome to GYB Studio!
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                These are sample content items to show you what's possible. Upload your own content to get started with real analysis and optimization.
              </p>
              {onUploadClick && (
                <button
                  onClick={onUploadClick}
                  className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-full text-sm hover:bg-blue-700 transition duration-200"
                >
                  Upload Your Content
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200 ${
              items.length === 0 && showDefaults ? 'opacity-75' : ''
            }`}
            onClick={() => onItemClick(item)}
          >
            <div className="relative h-48">
              {item.type === 'video' ? (
                <>
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <Play size={48} className="text-white opacity-75" />
                  </div>
                </>
              ) : item.type === 'photo' ? (
                <img
                  src={item.originalUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : item.isAISuggestion && item.thumbnail ? (
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  {getTypeIcon(item.type)}
                </div>
              )}
              
              {/* Content Type Badge */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(item.type)}`}>{getTypeLabel(item.type, item.platforms)}</span>
                {item.platforms && item.platforms.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.platforms.map(platform => {
                      const key = platform.toLowerCase();
                      // For blog content, show the selected blog platform instead of "Blog"
                      const displayPlatform = platform;
                      const displayKey = displayPlatform.toLowerCase();
                      return (
                        <span key={platform} className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-2xs font-medium border border-gray-300 flex items-center">
                          {PLATFORM_ICONS[displayKey] || null}
                          {displayPlatform.charAt(0).toUpperCase() + displayPlatform.slice(1)}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* User Content Indicator */}
              {isUserContent(item) && (
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Your Content
                </div>
              )}

              {/* Sample Content Indicator */}
              {!isUserContent(item) && items.length === 0 && showDefaults && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  Sample
                </div>
              )}

              {/* AI Suggestion Indicator */}
              {item.isAISuggestion && (
                <div className="absolute top-2 right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                  AI Suggestion
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getTypeIcon(item.type)}
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                </div>
              </div>
              <p className="text-gray-600 mb-4 line-clamp-2">{item.description}</p>
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(item.status, item.isAISuggestion)}`}>
                  {getStatusLabel(item.status, item.isAISuggestion)}
                </span>
                <div className="flex items-center text-sm text-gray-500 gap-2">
                  <Clock size={16} className="mr-1" />
                  {new Date(item.createdAt).toLocaleDateString()}
                  <div className="flex items-center space-x-1 ml-2">
                    {onView && (
                      <button
                        className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition-colors"
                        onClick={e => { e.stopPropagation(); onView(item); }}
                        title="View Content"
                      >
                        <Eye size={18} />
                      </button>
                    )}
                    {onDelete && isUserContent(item) && (
                      <button
                        className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
                        onClick={e => handleDeleteClick(e, item.id)}
                        title="Delete"
                      >
                        <Trash size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="text-red-500 mr-3" size={24} />
              <h3 className="text-lg font-semibold text-gray-900">Delete Content</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this content? This action cannot be undone and will permanently remove the content from your hub.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete Permanently'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Confirmation Modal */}
      {showDeleteAllConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="text-red-500 mr-3" size={24} />
              <h3 className="text-lg font-semibold text-gray-900">Delete All Content</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 mb-3">
                <strong>Warning:</strong> This action will permanently delete ALL your uploaded content from the content hub.
              </p>
              <p className="text-gray-600 mb-3">
                This includes:
              </p>
              <ul className="text-gray-600 list-disc list-inside space-y-1">
                <li>All uploaded videos, images, and documents</li>
                <li>All performance data and analytics</li>
                <li>All generated assets and analysis</li>
                <li>All platform-specific data</li>
              </ul>
              <p className="text-red-600 font-medium mt-3">
                This action cannot be undone and will permanently remove all your content!
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDeleteAll}
                disabled={isDeletingAll}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteAll}
                disabled={isDeletingAll}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
              >
                {isDeletingAll ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting All...
                  </>
                ) : (
                  <>
                    <Trash size={16} className="mr-2" />
                    Delete All Content
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentList;

