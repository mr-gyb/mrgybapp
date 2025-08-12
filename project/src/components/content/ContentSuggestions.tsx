import React from 'react';
import { Lightbulb, Upload, Video, Image, Headphones, FileText, ArrowRight } from 'lucide-react';
import { getContentSuggestions } from '../../utils/contentUtils';
import { ContentItem } from '../../types/content';
import { useContentAggregation } from '../../hooks/useContentAggregation';

interface ContentSuggestionsProps {
  userContent: ContentItem[];
  onUploadClick?: () => void;
}

const ContentSuggestions: React.FC<ContentSuggestionsProps> = ({ 
  userContent, 
  onUploadClick 
}) => {
  const suggestions = getContentSuggestions(userContent);
  const hasRealContent = userContent.some(item => !item.id.startsWith('default-'));

  const getSuggestionIcon = (suggestion: string) => {
    if (suggestion.includes('video')) return <Video size={20} />;
    if (suggestion.includes('image')) return <Image size={20} />;
    if (suggestion.includes('audio')) return <Headphones size={20} />;
    if (suggestion.includes('written')) return <FileText size={20} />;
    return <Upload size={20} />;
  };

  const { aggregation, metadata, isLoading, error } = useContentAggregation();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  // Hide suggestions for new users - return null to remove the section entirely
  return null;

  // Original code (commented out):
  // if (hasRealContent) {
  //   return null; // Don't show suggestions if user has real content
  // }

  // return (
  //   <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
  //     <div className="flex items-start">
  //       <div className="flex-shrink-0">
  //         <Lightbulb size={24} className="text-blue-600" />
  //       </div>
  //       <div className="ml-4 flex-1">
  //         <h3 className="text-lg font-semibold text-blue-800 mb-2">
  //           Get Started with Content Creation
  //         </h3>
  //         <p className="text-blue-700 mb-4">
  //           Here are some ideas to help you begin your content creation journey:
  //         </p>
  //         
  //         <div className="space-y-3">
  //           {suggestions.map((suggestion, index) => (
  //             <div key={index} className="flex items-center text-blue-700">
  //               <div className="flex-shrink-0 mr-3">
  //                 {getSuggestionIcon(suggestion)}
  //               </div>
  //               <span className="text-sm">{suggestion}</span>
  //             </div>
  //           ))}
  //         </div>

  //         {onUploadClick && (
  //           <button
  //             onClick={onUploadClick}
  //             className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-full text-sm hover:bg-blue-700 transition duration-200 flex items-center"
  //           >
  //             Start Creating Content
  //             <ArrowRight size={16} className="ml-2" />
  //           </button>
  //         )}
  //       </div>
  //     </div>
  //   </div>
  // );
};

export default ContentSuggestions; 
