import React from 'react';
import { FileText, Video, Image as ImageIcon, Headphones } from 'lucide-react';
import ReactPlayer from 'react-player/lazy';

interface MediaPreviewProps {
  type: string;
  url: string;
  title?: string;
}

const MediaPreview: React.FC<MediaPreviewProps> = ({ type, url, title }) => {
  const renderContent = () => {
    switch (type) {
      case 'video':
        return (
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <ReactPlayer
              url={url}
              width="100%"
              height="100%"
              controls
              config={{
                file: {
                  attributes: {
                    controlsList: 'nodownload'
                  }
                }
              }}
            />
          </div>
        );
      
      case 'audio':
        return (
          <div className="bg-gray-100 p-4 rounded-lg">
            <audio src={url} controls className="w-full" />
          </div>
        );
      
      case 'image':
        return (
          <img
            src={url}
            alt={title || 'Media preview'}
            className="max-w-full rounded-lg"
          />
        );
      
      case 'document':
        return (
          <div className="flex items-center space-x-2 bg-gray-100 p-4 rounded-lg">
            <FileText size={24} />
            <span>{title || url.split('/').pop()}</span>
          </div>
        );
      
      default:
        return (
          <div className="bg-gray-100 p-4 rounded-lg text-center">
            <p>Preview not available</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {title && (
        <h3 className="font-semibold text-lg">{title}</h3>
      )}
      {renderContent()}
    </div>
  );
};

export default MediaPreview;