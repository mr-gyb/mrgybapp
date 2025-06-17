import React from 'react';
import { Clock, Edit2, Trash2 } from 'lucide-react';
import { GeneratedContent } from '../lib/supabase';

interface ContentHistoryProps {
  contents: GeneratedContent[];
  onEdit: (content: GeneratedContent) => void;
  onDelete: (contentId: string) => void;
}

const ContentHistory: React.FC<ContentHistoryProps> = ({ contents, onEdit, onDelete }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-navy-blue mb-4">Content History</h2>
      
      {contents.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No content history available</p>
      ) : (
        contents.map((content) => (
          <div
            key={content.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-navy-blue">{content.title}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(content)}
                  className="text-blue-500 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50"
                >
                  <Edit2 size={20} />
                </button>
                <button
                  onClick={() => onDelete(content.id)}
                  className="text-red-500 hover:text-red-600 p-2 rounded-full hover:bg-red-50"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600 line-clamp-3">{content.generated_content}</p>
            </div>
            
            <div className="flex items-center text-sm text-gray-500">
              <Clock size={16} className="mr-2" />
              <span>
                {new Date(content.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ContentHistory;