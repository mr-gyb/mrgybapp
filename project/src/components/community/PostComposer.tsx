import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/useToast';
import { createPost } from '../../services/posts';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../lib/firebase';
import { ImageIcon, Loader2 } from 'lucide-react';

interface PostComposerProps {
  onPostCreated?: () => void;
}

const PostComposer: React.FC<PostComposerProps> = ({ onPostCreated }) => {
  const { user, userData } = useAuth();
  const { showSuccess, showError } = useToast();
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const MAX_LENGTH = 500;

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showError('Image size must be less than 5MB');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.onerror = () => {
      showError('Failed to load image preview');
      setImageFile(null);
      setImagePreview(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
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
      const timestamp = Date.now();
      const filename = `${user.uid}_${timestamp}_${file.name}`;
      const storageRef = ref(storage, `community-posts/${filename}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } finally {
      setIsUploading(false);
    }
  };

  const handlePost = async () => {
    if (!user || !userData) {
      showError('You must be logged in to post.');
      return;
    }

    const trimmedText = text.trim();

    if (!trimmedText && !imageFile) {
      showError('Post cannot be empty. Please add text or an image.');
      return;
    }

    if (trimmedText.length > MAX_LENGTH) {
      showError(`Post text cannot exceed ${MAX_LENGTH} characters.`);
      return;
    }

    setIsPosting(true);
    try {
      let mediaUrl: string | undefined;

      if (imageFile) {
        mediaUrl = await uploadImage(imageFile);
      }

      const authorName = user.displayName?.trim() || user.email?.trim() || 'Unknown';
      const authorPhotoURL = user.photoURL || userData.profile_image_url || '';

      await createPost(
        {
          text: trimmedText,
          imageURL: mediaUrl,
          visibility: 'anyone'
        },
        {
          uid: user.uid,
          displayName: authorName,
          photoURL: authorPhotoURL
        }
      );

      showSuccess('Post created successfully!');
      setText('');
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onPostCreated?.();
    } catch (error: unknown) {
      console.error('Error creating post:', error);
      showError(error instanceof Error ? error.message : 'Failed to create post.');
    } finally {
      setIsPosting(false);
    }
  };

  const canPost = (text.trim().length > 0 || imageFile !== null) && !isPosting && !isUploading;
  if (!user) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
          {userData?.profile_image_url ? (
            <img 
              src={userData.profile_image_url} 
              alt={userData.name || 'User'} 
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white font-semibold text-sm">
              {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          )}
        </div>

        {/* Composer Content */}
        <div className="flex-1 flex flex-col">
          <textarea
            ref={textareaRef}
            className="w-full p-3 border-0 resize-none focus:ring-0 focus:outline-none dark:bg-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            placeholder="What's happening?"
            rows={3}
            value={text}
            onChange={(e) => {
              const value = e.target.value;
              if (value.length <= MAX_LENGTH) {
                setText(value);
              }
            }}
            disabled={isPosting || isUploading}
            style={{ fontSize: '15px', minHeight: '60px' }}
          />

          {/* Image Preview */}
          {imagePreview && (
            <div className="relative mb-3 rounded-lg overflow-hidden">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full max-h-64 object-cover"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1.5 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full transition-colors"
                aria-label="Remove image"
              >
                <span className="text-white text-xs">×</span>
              </button>
            </div>
          )}

          {/* Actions Row */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-4">
              {/* Image Upload */}
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
                className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Upload image"
              >
                <ImageIcon size={20} />
              </button>
            </div>

            {/* Post Button - Right aligned */}
            <button
              onClick={handlePost}
              disabled={!canPost}
              className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isPosting || isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Posting...</span>
                </>
              ) : (
                'Post'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostComposer;
