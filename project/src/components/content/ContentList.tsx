import React from 'react';
import { Play, Image as ImageIcon, Headphones, FileText, Clock, Check, X } from 'lucide-react';
import { ContentItem, ContentType } from '../../types/content';

interface ContentListProps {
  items: ContentItem[];
  onItemClick: (item: ContentItem) => void;
}

const ContentList: React.FC<ContentListProps> = ({ items, onItemClick }) => {
  const getTypeIcon = (type: ContentType) => {
    switch (type) {
      case 'video':
        return <Play size={24} />;
      case 'photo':
        return <ImageIcon size={24} />;
      case 'audio':
        return <Headphones size={24} />;
      case 'written':
        return <FileText size={24} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-600';
      case 'rejected':
        return 'bg-red-100 text-red-600';
      case 'pending':
        return 'bg-yellow-100 text-yellow-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200"
          onClick={() => onItemClick(item)}
        >
          <div className="relative h-48">
            {item.type === 'video' ? (
              <>
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <Play size={48} className="text-white opacity-75" />
                </div>
              </>
            ) : item.type === 'photo' ? (
              <img
                src={item.originalUrl}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                {getTypeIcon(item.type)}
              </div>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
            <p className="text-gray-600 mb-4 line-clamp-2">{item.description}</p>
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(item.status)}`}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </span>
              <div className="flex items-center text-sm text-gray-500">
                <Clock size={16} className="mr-1" />
                {new Date(item.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContentList;