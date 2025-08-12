import React, { useState, useEffect } from 'react';
import { X, Check, Edit3 } from 'lucide-react';
import { generateTitleSuggestions, getBestTitleSuggestion } from '../../utils/contentUtils';
import { ContentType } from '../../types/content';

interface TitleSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (title: string) => void;
  contentType: ContentType;
  fileName?: string;
  category?: string;
}

const TitleSuggestionModal: React.FC<TitleSuggestionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  contentType,
  fileName,
  category
}) => {
  const [selectedTitle, setSelectedTitle] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      const titleSuggestions = generateTitleSuggestions(contentType, fileName, category);
      setSuggestions(titleSuggestions);
      setSelectedTitle(titleSuggestions[0] || 'My Content');
      setCustomTitle('');
      setShowCustomInput(false);
    }
  }, [isOpen, contentType, fileName, category]);

  const handleConfirm = () => {
    const finalTitle = showCustomInput ? customTitle.trim() : selectedTitle;
    if (finalTitle) {
      onConfirm(finalTitle);
      onClose();
    }
  };

  const handleCustomTitle = () => {
    setShowCustomInput(true);
    setCustomTitle(selectedTitle);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-navy-blue">Choose a Title</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Give your content a meaningful title to help you organize and find it later.
          </p>

          {!showCustomInput ? (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suggested Titles
              </label>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedTitle(suggestion)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedTitle === suggestion
                      ? 'border-navy-blue bg-navy-blue/5 text-navy-blue'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {suggestion}
                </button>
              ))}
              
              <button
                onClick={handleCustomTitle}
                className="w-full p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center text-gray-600"
              >
                <Edit3 size={16} className="mr-2" />
                Write Custom Title
              </button>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Title
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Enter your custom title..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-blue focus:border-transparent"
                autoFocus
              />
              <button
                onClick={() => setShowCustomInput(false)}
                className="mt-2 text-sm text-gray-500 hover:text-gray-700"
              >
                ← Back to suggestions
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedTitle && !customTitle.trim()}
            className="px-4 py-2 bg-navy-blue text-white rounded-lg hover:bg-opacity-90 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check size={16} className="mr-2" />
            Confirm Title
          </button>
        </div>
      </div>
    </div>
  );
};

export default TitleSuggestionModal; 