import React, { useState } from 'react';
import { Image, Link, Send, AlertCircle } from 'lucide-react';
import { FacebookAccount, FacebookPost } from '../../../types/facebook';
import { facebookIntegrationService } from '../../../services/facebookIntegration.service';

interface FacebookPostCreatorProps {
  connectedAccount: FacebookAccount;
}

const FacebookPostCreator: React.FC<FacebookPostCreatorProps> = ({ connectedAccount }) => {
  const [postData, setPostData] = useState<FacebookPost>({
    message: '',
    privacy: 'EVERYONE'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!postData.message.trim()) {
      setError('Please enter a message for your post');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const postToUpload: FacebookPost = {
        ...postData,
        image: selectedImage || undefined
      };

      const postId = await facebookIntegrationService.uploadPost(postToUpload);
      
      setSuccess(`Post uploaded successfully! Post ID: ${postId}`);
      setPostData({ message: '', privacy: 'EVERYONE' });
      setSelectedImage(null);
      
      // Reset form
      const form = e.target as HTMLFormElement;
      form.reset();
      
    } catch (err) {
      console.error('Error uploading post:', err);
      setError('Failed to upload post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const privacyOptions = [
    { value: 'EVERYONE', label: 'Public', description: 'Anyone can see this post' },
    { value: 'ALL_FRIENDS', label: 'Friends', description: 'Only your friends can see this post' },
    { value: 'FRIENDS_OF_FRIENDS', label: 'Friends of Friends', description: 'Friends and their friends can see this post' },
    { value: 'SELF', label: 'Only Me', description: 'Only you can see this post' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Image className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">Create Facebook Post</h3>
        </div>
        <p className="text-gray-600">
          You're posting as <span className="font-medium">{connectedAccount.name}</span>
        </p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="h-5 w-5 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
            <span className="text-green-800">{success}</span>
          </div>
        </div>
      )}

      {/* Post Creation Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Message Input */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              What's on your mind?
            </label>
            <textarea
              id="message"
              value={postData.message}
              onChange={(e) => setPostData({ ...postData, message: e.target.value })}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Share your thoughts, news, or updates..."
              maxLength={5000}
            />
            <div className="mt-1 text-sm text-gray-500">
              {postData.message.length}/5000 characters
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
              Add Photo/Video (Optional)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                id="image"
                accept="image/*,video/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <label
                htmlFor="image"
                className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <Image className="h-4 w-4 mr-2" />
                Choose File
              </label>
              {selectedImage && (
                <span className="text-sm text-gray-600">
                  Selected: {selectedImage.name}
                </span>
              )}
            </div>
          </div>

          {/* Link Input */}
          <div>
            <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-2">
              Add Link (Optional)
            </label>
            <div className="flex items-center space-x-2">
              <Link className="h-4 w-4 text-gray-400" />
              <input
                type="url"
                id="link"
                value={postData.link || ''}
                onChange={(e) => setPostData({ ...postData, link: e.target.value })}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com"
              />
            </div>
          </div>

          {/* Privacy Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Privacy Settings
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {privacyOptions.map((option) => (
                <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="privacy"
                    value={option.value}
                    checked={postData.privacy === option.value}
                    onChange={(e) => setPostData({ ...postData, privacy: e.target.value as any })}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading || !postData.message.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>{isLoading ? 'Uploading...' : 'Post to Facebook'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Tips for Better Engagement</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use engaging visuals to capture attention</li>
          <li>• Ask questions to encourage comments</li>
          <li>• Post at times when your audience is most active</li>
          <li>• Keep your message clear and concise</li>
        </ul>
      </div>
    </div>
  );
};

export default FacebookPostCreator;
