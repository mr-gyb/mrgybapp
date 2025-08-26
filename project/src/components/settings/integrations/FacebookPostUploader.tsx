import React, { useState, useEffect } from 'react';
import { useFacebookIntegration } from '../../../hooks/useFacebookIntegration';
import { FacebookPostData, FacebookPostResult } from '../../../api/services/facebook-integration.service';
import { Facebook, Image, Link, Calendar, Send, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface FacebookPostUploaderProps {
  isConnected: boolean;
}

const FacebookPostUploader: React.FC<FacebookPostUploaderProps> = ({ isConnected }) => {
  const { uploadPost, error, clearError } = useFacebookIntegration();
  const [postData, setPostData] = useState<FacebookPostData>({
    message: '',
    link: '',
    imageUrl: '',
    scheduledTime: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<FacebookPostResult | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleInputChange = (field: keyof FacebookPostData, value: string) => {
    setPostData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear any previous results when user starts typing
    setUploadResult(null);
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!postData.message.trim()) {
      // Use a local error state for validation errors
      return;
    }

    try {
      setIsUploading(true);
      clearError();
      setUploadResult(null);

      const result = await uploadPost(postData);
      
      if (result.success) {
        setUploadResult(result);
        // Clear form on success
        setPostData({
          message: '',
          link: '',
          imageUrl: '',
          scheduledTime: ''
        });
      }
    } catch (error) {
      console.error('Error uploading post:', error);
      // Error is already set by the hook
    } finally {
      setIsUploading(false);
    }
  };

  const handleSchedulePost = async () => {
    if (!postData.scheduledTime) {
      setError('Please select a scheduled time');
      return;
    }

    // For now, we'll just show a message about scheduling
    // In a real implementation, you'd store the scheduled post and process it later
    setUploadResult({
      success: true,
      postId: 'scheduled_' + Date.now(),
      url: '#',
    });
    
    // Clear form
    setPostData({
      message: '',
      link: '',
      imageUrl: '',
      scheduledTime: ''
    });
  };

  if (!isConnected) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <Facebook className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Connect Facebook to Upload Posts
        </h3>
        <p className="text-gray-600">
          You need to connect your Facebook account first to upload posts directly.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Facebook className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">
            Create Facebook Post
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Post Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Post Message *
            </label>
            <textarea
              id="message"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="What's on your mind?"
              value={postData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              required
            />
          </div>

          {/* Advanced Options Toggle */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Options
            </button>
          </div>

          {/* Advanced Options */}
          {showAdvanced && (
            <div className="space-y-4 border-t border-gray-200 pt-4">
              {/* Link */}
              <div>
                <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-2">
                  <Link className="inline h-4 w-4 mr-1" />
                  Link URL
                </label>
                <input
                  type="url"
                  id="link"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com"
                  value={postData.link}
                  onChange={(e) => handleInputChange('link', e.target.value)}
                />
              </div>

              {/* Image URL */}
              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  <Image className="inline h-4 w-4 mr-1" />
                  Image URL
                </label>
                <input
                  type="url"
                  id="imageUrl"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/image.jpg"
                  value={postData.imageUrl}
                  onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                />
              </div>

              {/* Scheduled Time */}
              <div>
                <label htmlFor="scheduledTime" className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Schedule Post (Optional)
                </label>
                <input
                  type="datetime-local"
                  id="scheduledTime"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={postData.scheduledTime}
                  onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          {/* Success Display */}
          {uploadResult && uploadResult.success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Post uploaded successfully!
                  </p>
                  {uploadResult.url && (
                    <a
                      href={uploadResult.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-green-600 hover:text-green-800 underline"
                    >
                      View on Facebook
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={isUploading || !postData.message.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Post Now</span>
                </>
              )}
            </button>

            {postData.scheduledTime && (
              <button
                type="button"
                onClick={handleSchedulePost}
                disabled={isUploading}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2"
              >
                <Calendar className="h-4 w-4" />
                <span>Schedule</span>
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Tips Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Posting Tips:</h4>
        <ul className="text-xs text-blue-600 space-y-1">
          <li>• Keep your message engaging and relevant to your audience</li>
          <li>• Use images to increase engagement</li>
          <li>• Include relevant links to drive traffic</li>
          <li>• Post at optimal times for your audience</li>
          <li>• Use hashtags to increase discoverability</li>
        </ul>
      </div>
    </div>
  );
};

export default FacebookPostUploader;
