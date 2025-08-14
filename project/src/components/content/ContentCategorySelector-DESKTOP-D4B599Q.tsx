import React, { useState } from 'react';
import { X, Video, Image, Headphones, FileText, Link, Upload, ArrowRight } from 'lucide-react';
import { ContentType } from '../../types/content';

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

  const contentCategories: ContentCategory[] = [
    {
      id: 'blog',
      name: 'Blogs',
      description: 'Upload blog posts, articles, and written content',
      icon: <FileText size={32} className="text-blue-500" />,
      type: 'written',
      platforms: ['Blog'],
      fileTypes: ['PDF', 'DOC', 'DOCX', 'TXT', 'RTF'],
      examples: ['Blog posts', 'Articles', 'Reports', 'Whitepapers', 'Scripts']
    },
    {
      id: 'audio',
      name: 'Audio',
      description: 'Upload audio files for podcast content and transcriptions',
      icon: <Headphones size={32} className="text-purple-500" />,
      type: 'audio',
      platforms: ['Spotify'],
      fileTypes: ['MP3', 'WAV', 'M4A', 'AAC', 'OGG'],
      examples: ['Podcast episodes', 'Voice notes', 'Music', 'Interviews']
    },
    {
      id: 'video',
      name: 'Video',
      description: 'Upload video files or share video links for analysis and optimization',
      icon: <Video size={32} className="text-red-500" />,
      type: 'video',
      platforms: ['YouTube', 'Video'],
      fileTypes: ['MP4', 'MOV', 'AVI', 'WebM', 'YouTube Links'],
      examples: ['Product demos', 'Tutorial videos', 'Vlogs', 'Short-form content']
    },
    {
      id: 'social-media',
      name: 'Social Media',
      description: 'Upload images and videos for social media platforms',
      icon: <Image size={32} className="text-green-500" />,
      type: 'photo',
      platforms: ['Pinterest', 'Instagram', 'Facebook'],
      fileTypes: ['JPG', 'PNG', 'GIF', 'WebP', 'SVG', 'MP4', 'MOV'],
      examples: ['Instagram posts', 'Pinterest pins', 'Facebook images']
    },
    {
      id: 'others',
      name: 'Others',
      description: 'Upload content for other platforms and miscellaneous content types',
      icon: <Link size={32} className="text-orange-500" />,
      type: 'written',
      platforms: ['Other'],
      fileTypes: ['PDF', 'DOC', 'DOCX', 'TXT', 'RTF'],
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
                Continue to Upload
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentCategorySelector; 