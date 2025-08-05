import React, { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Link, AlertCircle, FileText, Video, Image, Headphones } from 'lucide-react';
import { uploadMedia, processMediaLink, ContentType as MediaContentType } from '../../api/services/media.service';
import { useAuth } from '../../contexts/AuthContext';
import { ContentType } from '../../types/content';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../lib/firebase';
import TitleSuggestionModal from './TitleSuggestionModal';

interface ContentCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  type: ContentType;
  platforms: string[];
  fileTypes: string[];
  examples: string[];
}

interface CategorySpecificUploaderProps {
  category: ContentCategory;
  onClose: () => void;
  onUpload: (result: { id: string; url: string; type: string; category: ContentCategory; platforms: string[]; formats: string[]; linkType?: string; title?: string }) => void;
}

const CategorySpecificUploader: React.FC<CategorySpecificUploaderProps> = ({
  category,
  onClose,
  onUpload
}) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contentUrl, setContentUrl] = useState('');
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [pendingUploadData, setPendingUploadData] = useState<any>(null);
  const [selectedLinkType, setSelectedLinkType] = useState<string>('blog');
  // Add state for selected blog platform
  const [selectedBlogPlatform, setSelectedBlogPlatform] = useState<string | null>(null);
  // Add state for the URL title
  const [urlTitle, setUrlTitle] = useState('');

  if (!user) {
    console.error('❌ User not authenticated');
    return;
  }
  console.log('✅ User authenticated:', user.uid);

  // Get accepted file types based on category
  const getAcceptedFileTypes = (): Record<string, string[]> => {
    switch (category.id) {
      case 'video':
        return {
          'video/*': ['.mp4', '.mov', '.avi', '.webm', '.mkv']
        };
      case 'image':
        return {
          'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
        };
      case 'audio':
        return {
          'audio/*': ['.mp3', '.wav', '.m4a', '.aac', '.ogg']
        };
      case 'document':
        return {
          'application/pdf': ['.pdf'],
          'application/msword': ['.doc'],
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
          'text/plain': ['.txt'],
          'application/rtf': ['.rtf']
        };
      default:
        return {
          'video/*': ['.mp4', '.mov'],
          'image/*': ['.jpg', '.jpeg', '.png'],
          'audio/*': ['.mp3', '.wav'],
          'application/pdf': ['.pdf'],
          'text/plain': ['.txt']
        };
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setSelectedFile(acceptedFiles[0]);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: getAcceptedFileTypes(),
    multiple: false
  });

  const LINK_TYPES = [
    { label: 'Blogs', value: 'blog' },
    { label: 'Audio', value: 'audio' },
    { label: 'Video', value: 'video' },
    { label: 'Social Media', value: 'social-media' },
    { label: 'Other (Networking)', value: 'other' }
  ];

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentUrl.trim() || !user || !urlTitle.trim()) return;

    setIsUploading(true);
    setError(null);

    try {
      const result = await processMediaLink(contentUrl.trim(), user.uid);
      onUpload({
        ...result,
        category,
        platforms: selectedPlatforms,
        formats: selectedFormats,
        linkType: selectedLinkType, // Pass the selected link type
        title: urlTitle, // Pass the entered title
      });
      setContentUrl('');
      setUrlTitle('');
    } catch (error) {
      console.error('Error processing URL:', error);
      setError('An error occurred while processing the URL. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpload = async () => {
    console.log('Upload button clicked', user, selectedFile);
    if (!user || !selectedFile) {
      setError('Missing user or file');
      return;
    }
    
    // Store upload data and show title modal
    setPendingUploadData({
      file: selectedFile,
      category,
      platforms: selectedPlatforms,
      formats: selectedFormats
    });
    setShowTitleModal(true);
  };

  const handleTitleConfirm = async (title: string) => {
    if (!user || !pendingUploadData) return;
    
    setIsUploading(true);
    setError(null);
    
    try {
      console.log('Selected platforms:', pendingUploadData.platforms);
      const fixedUploadPath = 'uploads/xgXwCwXswHVX9z8iDxVcfTRz40p2';
      const fileName = `${Date.now()}_${pendingUploadData.file.name}`;
      const storageRef = ref(storage, `${fixedUploadPath}/${fileName}`);
      await uploadBytes(storageRef, pendingUploadData.file);
      const publicUrl = await getDownloadURL(storageRef);
      
      const uploadResult = {
        id: fileName,
        url: publicUrl,
        type: pendingUploadData.file.type,
        category: pendingUploadData.category,
        platforms: pendingUploadData.platforms,
        formats: pendingUploadData.formats,
        title: title, // Include the selected title
        blogPlatform: category.id === 'blog' ? selectedBlogPlatform : undefined // Add blogPlatform for blogs
      };

      console.log('Upload result:', uploadResult);
      onUpload(uploadResult);

      // Save to database with title
      const contentData = {
        ...uploadResult,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(doc(collection(db, 'new_content'), uploadResult.id), contentData);

      setSelectedFile(null);
      setPendingUploadData(null);
    } catch (err) {
      setError('Failed to upload file. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const getCategoryIcon = () => {
    switch (category.id) {
      case 'video':
        return <Video size={48} className="text-red-500" />;
      case 'image':
        return <Image size={48} className="text-green-500" />;
      case 'audio':
        return <Headphones size={48} className="text-purple-500" />;
      case 'document':
        return <FileText size={48} className="text-blue-500" />;
      case 'link':
        return <Link size={48} className="text-orange-500" />;
      default:
        return <Upload size={48} className="text-gray-400" />;
    }
  };

  const getUploadPlaceholder = () => {
    switch (category.id) {
      case 'video':
        return 'Drop video files here or click to browse';
      case 'image':
        return 'Drop image files here or click to browse';
      case 'audio':
        return 'Drop audio files here or click to browse';
      case 'document':
        return 'Drop document files here or click to browse';
      case 'link':
        return 'Paste a URL to analyze';
      default:
        return 'Drop files here or click to browse';
    }
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const toggleFormat = (format: string) => {
    setSelectedFormats((prev) =>
      prev.includes(format)
        ? prev.filter((f) => f !== format)
        : [...prev, format]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full m-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            {category.icon}
            <h2 className="text-2xl font-bold ml-3 text-navy-blue">
              Upload {category.name}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Upload Method Toggle */}
        {category.id !== 'link' && (
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setUploadMethod('file')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                uploadMethod === 'file'
                  ? 'bg-white text-navy-blue shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Upload File
            </button>
            <button
              onClick={() => setUploadMethod('url')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                uploadMethod === 'url'
                  ? 'bg-white text-navy-blue shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Share Link
            </button>
          </div>
        )}

        {/* File Upload Section */}
        {uploadMethod === 'file' && category.id !== 'link' && (
          <>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 mb-6 text-center transition-colors cursor-pointer ${
                isDragActive ? 'border-navy-blue bg-navy-blue/5' : 'border-gray-300 hover:border-navy-blue'
              }`}
            >
              <input {...getInputProps()} />
              {getCategoryIcon()}
              <p className="text-lg mb-2 mt-4">
                {isDragActive ? 'Drop files here' : getUploadPlaceholder()}
              </p>
              <p className="text-gray-500 mb-4">or</p>
              <button className="bg-navy-blue text-white px-6 py-2 rounded-full hover:bg-opacity-90 transition-colors">
                Browse Files
              </button>
              <p className="mt-4 text-sm text-gray-500">
                Supported formats: {category.fileTypes.join(', ')}
              </p>
            </div>
            {selectedFile && (
              <div className="mb-4 flex flex-col items-center">
                <p className="mb-2">Selected file: <span className="font-semibold">{selectedFile.name}</span></p>
                <button
                  onClick={handleUpload}
                  className="bg-navy-blue text-white px-6 py-2 rounded-full"
                  disabled={isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            )}
          </>
        )}

        {/* URL Input Section */}
        {(uploadMethod === 'url' || category.id === 'link') && (
          <div className="mb-6">
            <form onSubmit={handleUrlSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {category.id === 'link' ? 'Enter URL to analyze' : 'Share content link'}
                </label>
                <input
                  type="url"
                  value={contentUrl}
                  onChange={(e) => setContentUrl(e.target.value)}
                  placeholder={
                    category.id === 'link'
                      ? 'https://example.com/article'
                      : category.id === 'video'
                        ? 'https://youtube.com/watch?v=... (YouTube links only)'
                        : 'https://youtube.com/watch?v=...'
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-blue focus:border-transparent"
                  required
                />
              </div>
              {/* Title input for shareable link uploads */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Title
                </label>
                <input
                  type="text"
                  value={urlTitle}
                  onChange={e => setUrlTitle(e.target.value)}
                  placeholder="Enter content title"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-blue focus:border-transparent"
                  required
                />
              </div>
              {/* Link Type Selector - only show if not video */}
              {category.id !== 'video' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Link Type</label>
                  <div className="flex flex-wrap gap-2">
                    {LINK_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        className={`px-3 py-1 rounded-full border text-xs font-medium transition-colors ${
                          selectedLinkType === type.value
                            ? 'bg-navy-blue text-white border-navy-blue'
                            : 'bg-white text-navy-blue border-gray-200 hover:bg-gray-100'
                        }`}
                        onClick={() => setSelectedLinkType(type.value)}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-navy-blue text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors flex items-center justify-center"
                disabled={isUploading || !contentUrl.trim() || !urlTitle.trim()}
              >
                <Link size={20} className="mr-2" />
                {isUploading ? 'Processing...' : 'Analyze Content'}
              </button>
            </form>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4 flex items-center">
            <AlertCircle size={20} className="mr-2" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading State */}
        {isUploading && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-navy-blue"></div>
            <span className="ml-2">Uploading...</span>
          </div>
        )}

        {/* Category Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-2 text-navy-blue">About {category.name}</h4>
          <p className="text-gray-600 text-sm mb-3">{category.description}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {category.id === 'blog' ? (
              <>
                <button
                  type="button"
                  className={`px-3 py-1 rounded-full border text-xs font-medium transition-colors ${selectedBlogPlatform === 'Blogger' ? 'bg-navy-blue text-white border-navy-blue' : 'bg-blue-100 text-blue-800 border-blue-200'}`}
                  onClick={() => setSelectedBlogPlatform(selectedBlogPlatform === 'Blogger' ? null : 'Blogger')}
                >
                  Blogger
                </button>
                <button
                  type="button"
                  className={`px-3 py-1 rounded-full border text-xs font-medium transition-colors ${selectedBlogPlatform === 'Substack' ? 'bg-navy-blue text-white border-navy-blue' : 'bg-green-100 text-green-800 border-green-200'}`}
                  onClick={() => setSelectedBlogPlatform(selectedBlogPlatform === 'Substack' ? null : 'Substack')}
                >
                  Substack
                </button>
                <button
                  type="button"
                  className={`px-3 py-1 rounded-full border text-xs font-medium transition-colors ${selectedBlogPlatform === 'Medium' ? 'bg-navy-blue text-white border-navy-blue' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}`}
                  onClick={() => setSelectedBlogPlatform(selectedBlogPlatform === 'Medium' ? null : 'Medium')}
                >
                  Medium
                </button>
              </>
            ) : category.id === 'audio' ? (
              <>
                <button
                  type="button"
                  className={`px-3 py-1 rounded-full border text-xs font-medium transition-colors ${selectedPlatforms.includes('Spotify') ? 'bg-navy-blue text-white border-navy-blue' : 'bg-green-100 text-green-800 border-green-200'}`}
                  onClick={() => togglePlatform('Spotify')}
                >
                  Spotify
                </button>
                <button
                  type="button"
                  className={`px-3 py-1 rounded-full border text-xs font-medium transition-colors ${selectedPlatforms.includes('iTunes') ? 'bg-navy-blue text-white border-navy-blue' : 'bg-pink-100 text-pink-800 border-pink-200'}`}
                  onClick={() => togglePlatform('iTunes')}
                >
                  iTunes
                </button>
              </>
            ) : category.id === 'video' ? (
              // Only show YouTube and Video as platform chips for video uploads
              category.platforms
                .filter((platform) => ['YouTube', 'Video'].includes(platform))
                .map((platform) => (
                  <button
                    key={platform}
                    type="button"
                    className={`px-3 py-1 rounded-full border text-xs font-medium transition-colors ${
                      selectedPlatforms.includes(platform)
                        ? 'bg-navy-blue text-white border-navy-blue'
                        : 'bg-white text-navy-blue border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => togglePlatform(platform)}
                  >
                    {platform}
                  </button>
                ))
            ) : (
              category.platforms.map((platform) => (
                <button
                  key={platform}
                  type="button"
                  className={`px-3 py-1 rounded-full border text-xs font-medium transition-colors ${
                    selectedPlatforms.includes(platform)
                      ? 'bg-navy-blue text-white border-navy-blue'
                      : 'bg-white text-navy-blue border-gray-200 hover:bg-gray-100'
                  }`}
                  onClick={() => togglePlatform(platform)}
                >
                  {platform}
                </button>
              ))
            )}
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {category.fileTypes.map((format) => (
              <button
                key={format}
                type="button"
                className={`px-3 py-1 rounded-full border text-xs font-medium transition-colors ${
                  selectedFormats.includes(format)
                    ? 'bg-navy-blue text-white border-navy-blue'
                    : 'bg-white text-navy-blue border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => toggleFormat(format)}
              >
                {format.replace('.', '').toUpperCase()}
              </button>
            ))}
          </div>
          <div>
            <h5 className="font-semibold mb-1 text-navy-blue">Content Examples</h5>
            <ul className="list-disc list-inside text-gray-600 text-sm">
              {category.examples.map((ex, i) => (
                <li key={i}>{ex}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Title Suggestion Modal */}
      <TitleSuggestionModal
        isOpen={showTitleModal}
        onClose={() => {
          setShowTitleModal(false);
          setPendingUploadData(null);
        }}
        onConfirm={handleTitleConfirm}
        contentType={category.type}
        fileName={pendingUploadData?.file?.name}
        category={category.name}
      />
    </div>
  );
};

export default CategorySpecificUploader;