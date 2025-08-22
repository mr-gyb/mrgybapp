import React, { useState } from 'react';
import { X, Video, Image, Headphones, FileText, Link, Upload, ArrowRight } from 'lucide-react';
import { ContentType } from '../../types/content';
import FacebookIntegrationManager from '../integrations/FacebookIntegrationManager';
import InstagramIntegrationManager from '../integrations/InstagramIntegrationManager';
import FacebookLoginModal from './FacebookLoginModal';

interface ContentCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  type: ContentType;
  platforms: string[];
  examples: string[];
}

interface ContentCategorySelectorProps {
  onClose: () => void;
  onCategorySelect: (category: ContentCategory) => void;
}

const ContentCategorySelector: React.FC<ContentCategorySelectorProps> = ({ 
  onClose, 
  onCategorySelect 
}) => {
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ContentCategory | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showFacebookIntegration, setShowFacebookIntegration] = useState(false);
  const [showInstagramIntegration, setShowInstagramIntegration] = useState(false);
  const [showFacebookLogin, setShowFacebookLogin] = useState(false);

  const contentCategories: ContentCategory[] = [
    {
      id: 'audio',
      name: 'Audio',
      description: 'Upload audio files for podcast content and transcriptions',
      icon: <Headphones size={32} className="text-purple-500" />,
      type: 'audio',
      platforms: ['Spotify'],
      examples: ['Podcast episodes', 'Voice notes', 'Music', 'Interviews']
    },
    {
      id: 'video',
      name: 'Video',
      description: 'Upload video files or share video links for analysis and optimization',
      icon: <Video size={32} className="text-red-500" />,
      type: 'video',
      platforms: ['YouTube', 'Video'],
      examples: ['Product demos', 'Tutorial videos', 'Vlogs', 'Short-form content']
    },
    {
      id: 'social-media',
      name: 'Social Media',
      description: 'Upload images and videos for social media platforms',
      icon: <Image size={32} className="text-green-500" />,
      type: 'photo',
      platforms: ['Pinterest', 'Instagram', 'Facebook'],
      examples: ['Instagram posts', 'Pinterest pins', 'Facebook images']
    },
    {
      id: 'others',
      name: 'Others',
      description: 'Upload content for other platforms and miscellaneous content types',
      icon: <Link size={32} className="text-orange-500" />,
      type: 'written',
      platforms: ['Other'],
      examples: ['Other content', 'Miscellaneous content', 'Custom platforms']
    }
  ];

  const handleCategorySelect = (category: ContentCategory) => {
    setSelectedCategory(category);
  };

  const handleContinue = () => {
    if (selectedCategory) {
      onCategorySelect(selectedCategory);
    }
  };

  const handleBack = () => {
    setSelectedCategory(null);
  };

  return (
    <div className="bg-white rounded-lg p-6 max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-navy-blue">
          {selectedCategory ? `Create ${selectedCategory.name}` : 'Choose Content Type'}
        </h2>
        <button 
          onClick={onClose} 
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X size={24} />
        </button>
      </div>

        {!selectedCategory ? (
          // Category Selection View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contentCategories.map((category) => (
              <div
                key={category.id}
                onClick={() => handleCategorySelect(category)}
                className="border-2 border-gray-200 rounded-lg p-6 cursor-pointer hover:border-navy-blue hover:shadow-lg transition-all duration-200 group"
              >
                <div className="flex items-center mb-4">
                  <div className="mr-3">
                    {category.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-navy-blue group-hover:text-opacity-80">
                    {category.name}
                  </h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  {category.description}
                </p>
                <div className="flex items-center text-navy-blue group-hover:text-opacity-80">
                  <span className="text-sm font-medium">Select</span>
                  <ArrowRight size={16} className="ml-2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Category Details View
          <div className="space-y-6">
            <div className="flex items-center mb-6">
              <button
                onClick={handleBack}
                className="mr-4 text-navy-blue hover:text-opacity-80 transition-colors"
              >
                <ArrowRight size={20} className="rotate-180" />
              </button>
              <div className="flex items-center">
                {selectedCategory.icon}
                <h3 className="text-xl font-semibold ml-3">{selectedCategory.name}</h3>
              </div>
            </div>

            {/* Social Media Icons - Show only for Social Media category */}
            {selectedCategory.id === 'social-media' && (
              <div className="flex justify-center items-center space-x-6 py-4 mb-4">
                <button
                  onClick={() => setShowFacebookLogin(true)}
                  className="flex flex-col items-center space-y-2 group cursor-pointer hover:scale-105 transition-transform"
                >
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-700 transition-colors">
                    <span className="text-white font-bold text-lg">f</span>
                  </div>
                  <span className="text-sm text-gray-600 font-medium group-hover:text-blue-600 transition-colors">Facebook</span>
                </button>
                <button
                  onClick={() => setShowInstagramIntegration(true)}
                  className="flex flex-col items-center space-y-2 group cursor-pointer hover:scale-105 transition-transform"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center group-hover:from-purple-600 group-hover:to-pink-600 transition-colors">
                    <span className="text-white font-bold text-lg">📷</span>
                  </div>
                  <span className="text-sm text-gray-600 font-medium group-hover:text-purple-600 transition-colors">Instagram</span>
                </button>
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">P</span>
                  </div>
                  <span className="text-sm text-gray-600 font-medium">Pinterest</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-4">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleContinue}
                className="px-6 py-2 bg-navy-blue text-white rounded-full hover:bg-opacity-90 transition-colors flex items-center"
              >
                <Upload size={20} className="mr-2" />
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Facebook Login Modal */}
        {showFacebookLogin && (
          <FacebookLoginModal
            onClose={() => setShowFacebookLogin(false)}
            onBack={() => setShowFacebookLogin(false)}
            onSuccess={(account) => {
              console.log('Facebook account connected:', account);
              // After successful connection, show the integration manager
              setShowFacebookLogin(false);
              setShowFacebookIntegration(true);
            }}
          />
        )}

        {/* Facebook Integration Modal */}
        {showFacebookIntegration && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <FacebookIntegrationManager
              onClose={() => setShowFacebookIntegration(false)}
              onPostUploaded={(result) => {
                console.log('Facebook post uploaded:', result);
                // You can handle the upload result here
                setShowFacebookIntegration(false);
              }}
            />
          </div>
        )}

        {/* Instagram Integration Modal */}
        {showInstagramIntegration && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <InstagramIntegrationManager
              onClose={() => setShowInstagramIntegration(false)}
              onPostUploaded={(result) => {
                console.log('Instagram post uploaded:', result);
                // You can handle the upload result here
                setShowInstagramIntegration(false);
              }}
            />
          </div>
        )}
      </div>
    );
  };

export default ContentCategorySelector; 