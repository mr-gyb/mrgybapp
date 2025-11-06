import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/useToast';
import { createPost } from '../../services/posts';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../lib/firebase';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
}

const MAX_CONTENT_LENGTH = 500;

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onPostCreated
}) => {
  const { user, userData } = useAuth();
  const { showSuccess, showError } = useToast();
  const [text, setText] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<'anyone' | 'friends'>('anyone');
  const [isPosting, setIsPosting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setText('');
      setImageUrlInput('');
      setImageFile(null);
      setImagePreview(null);
      setVisibility('anyone');
      setError('');
    }
  }, [isOpen]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  // Handle image URL input
  const handleImageUrlChange = (url: string) => {
    setImageUrlInput(url);
    setImageFile(null); // Clear file if URL is set
    setError('');
    
    // Set preview if URL is valid
    if (url.trim()) {
      if (isValidImageUrl(url)) {
        setImagePreview(url);
      } else {
        // Don't set preview for invalid URLs, but don't show error yet (user might still be typing)
        setImagePreview(null);
      }
    } else {
      setImagePreview(null);
    }
  };

  // Validate image URL
  const isValidImageUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      showError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      showError('Image size must be less than 5MB');
      return;
    }

    setImageFile(file);
    setImageUrlInput(''); // Clear URL if file is selected
    setError('');
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.onerror = () => {
      setError('Failed to load image preview');
      setImageFile(null);
      setImagePreview(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImageUrlInput('');
    setImagePreview(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    if (!user?.uid) {
      throw new Error('User not authenticated');
    }

    setIsUploading(true);
    try {
      // Create unique filename
      const timestamp = Date.now();
      const filename = `${user.uid}_${timestamp}_${file.name}`;
      const storageRef = ref(storage, `community-posts/${filename}`);

      // Upload file
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } finally {
      setIsUploading(false);
    }
  };

  const handlePost = async () => {
    if (!user) {
      showError('You must be logged in to post.');
      return;
    }

    const trimmedText = text.trim();
    const trimmedImageUrl = imageUrlInput.trim();

    // Validate: must have either text or image
    if (!trimmedText && !trimmedImageUrl && !imageFile) {
      setError('Post cannot be empty. Please add text or an image.');
      showError('Post cannot be empty. Please add text or an image.');
      return;
    }

    // Validate text length
    if (trimmedText.length > MAX_CONTENT_LENGTH) {
      setError(`Post text cannot exceed ${MAX_CONTENT_LENGTH} characters.`);
      showError(`Post text cannot exceed ${MAX_CONTENT_LENGTH} characters.`);
      return;
    }

    // Validate image URL if provided
    if (trimmedImageUrl && !isValidImageUrl(trimmedImageUrl)) {
      setError('Please provide a valid image URL (http:// or https://)');
      showError('Please provide a valid image URL (http:// or https://)');
      return;
    }

    setIsPosting(true);
    setError('');
    try {
      let finalImageUrl: string | undefined;

      // Upload file if present, otherwise use URL
      if (imageFile) {
        console.log('📤 Uploading image file...');
        finalImageUrl = await uploadImage(imageFile);
        console.log('✅ Image uploaded:', finalImageUrl);
      } else if (trimmedImageUrl) {
        console.log('📤 Using image URL:', trimmedImageUrl);
        finalImageUrl = trimmedImageUrl;
      }

      // Get consistent author name from Firebase auth user
      const authorName = user.displayName?.trim() || user.email?.trim() || 'Unknown';
      const authorPhotoURL = user.photoURL || userData?.profile_image_url || '';

      console.log('📝 Creating post with author:', {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        finalAuthorName: authorName
      });

      // Create post
      const postId = await createPost(
        {
          text: trimmedText,
          imageURL: finalImageUrl,
          visibility
        },
        {
          uid: user.uid,
          displayName: authorName,
          photoURL: authorPhotoURL
        }
      );

      console.log('✅ Post created with ID:', postId);
      console.log('📰 Feed should update automatically via Firestore listener');
      
      showSuccess('Post created successfully!');
      
      // Call onPostCreated callback to trigger any refresh if needed
      onPostCreated?.();
      
      // Close modal after a short delay to ensure post is saved
      setTimeout(() => {
        onClose();
      }, 300);
    } catch (error: unknown) {
      console.error('Error creating post:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create post.';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsPosting(false);
    }
  };

  const canPost = (text.trim().length > 0 || imageUrlInput.trim().length > 0 || imageFile !== null) && !isPosting && !isUploading;
  const remainingChars = MAX_CONTENT_LENGTH - text.length;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white dark:bg-gray-800 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
          style={{ borderRadius: '12px', padding: '0' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700" style={{ padding: '20px' }}>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Create Post
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              aria-label="Close modal"
            >
              <X size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto" style={{ padding: '20px' }}>
            {/* Error Message */}
            {error && (
              <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Text Editor */}
            <textarea
              ref={textareaRef}
              className="w-full p-3 border border-gray-200 dark:border-gray-600 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white mb-3"
              placeholder="What do you want to talk about?"
              rows={6}
              value={text}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= MAX_CONTENT_LENGTH) {
                  setText(value);
                  setError('');
                }
              }}
              disabled={isPosting || isUploading}
              style={{ fontSize: '15px', borderRadius: '10px' }}
            />

            {/* Character Count */}
            <div className="flex justify-end mb-4">
              <span
                className={`text-xs ${
                  remainingChars < 50
                    ? 'text-red-500'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {remainingChars} characters remaining
              </span>
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="relative mb-4 rounded-md overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-h-64 object-cover"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-2 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full transition-colors"
                  aria-label="Remove image"
                >
                  <X size={16} className="text-white" />
                </button>
              </div>
            )}

            {/* Image Upload Section */}
            <div className="mb-4 space-y-3">
              {/* Image URL Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Image URL (optional)
                </label>
                <input
                  type="url"
                  value={imageUrlInput}
                  onChange={(e) => handleImageUrlChange(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  disabled={isPosting || isUploading || !!imageFile}
                  className="w-full p-2.5 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontSize: '14px', borderRadius: '10px' }}
                />
                {imageUrlInput && imageFile && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    File upload takes priority over URL
                  </p>
                )}
              </div>

              {/* Or Divider */}
              {(imageUrlInput || imageFile) && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">OR</span>
                  <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
                </div>
              )}

              {/* File Upload Button */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={isPosting || isUploading}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isPosting || isUploading}
                  className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontSize: '14px', borderRadius: '10px' }}
                >
                  <ImageIcon size={18} className="text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {imageFile ? 'Change Image File' : 'Upload Image File'}
                  </span>
                </button>
              </div>
            </div>

            {/* Visibility Dropdown */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Visibility
              </label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as 'anyone' | 'friends')}
                disabled={isPosting || isUploading}
                className="w-full p-2.5 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                style={{ fontSize: '14px', borderRadius: '10px' }}
              >
                <option value="anyone">Post to Anyone</option>
                <option value="friends">Post to Friends</option>
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 dark:border-gray-700" style={{ padding: '20px' }}>
            <button
              onClick={onClose}
              disabled={isPosting || isUploading}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handlePost}
              disabled={!canPost}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isPosting || isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isUploading ? 'Uploading...' : 'Posting...'}</span>
                </>
              ) : (
                'Post'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreatePostModal;

