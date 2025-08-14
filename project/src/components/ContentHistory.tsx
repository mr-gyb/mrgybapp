import React, { useState } from 'react';
import { Clock, Edit2, Trash2 } from 'lucide-react';
import { GeneratedContent } from './contentService';

interface ContentHistoryProps {
  contents: GeneratedContent[];
  onEdit: (content: GeneratedContent) => void;
  onDelete: (contentId: string) => void;
}

const CONTENT_TYPE_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Blogs', value: 'written' },
  { label: 'Audio', value: 'audio' },
  { label: 'Video', value: 'video' }
];

const assignTypeToContent = (content: GeneratedContent): GeneratedContent => {
  if (content.type) return content;
  const text = (content.title + ' ' + content.generated_content).toLowerCase();
  if (text.includes('video')) return { ...content, type: 'video' };
  if (text.includes('audio') || text.includes('podcast')) return { ...content, type: 'audio' };
  if (text.includes('blog') || text.includes('article')) return { ...content, type: 'written' };
  // Removed 'social' and 'other' assignments as they are not valid ContentType values
  return { ...content, type: 'written' };
};

const ContentHistory: React.FC<ContentHistoryProps> = ({ contents, onEdit, onDelete }) => {
  // Migrate: assign type to all content
  const migratedContents = contents.map(assignTypeToContent);
  const [selectedType, setSelectedType] = useState('all');

  const filteredContents = migratedContents.filter(content => {
    if (selectedType === 'all') return true;
    // Remove 'other' case since it's not a valid ContentType
    return content.type === selectedType;
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-navy-blue mb-4">Content History</h2>
      <div className="mb-4 flex items-center">
        <label htmlFor="content-type-filter" className="mr-2 font-medium text-navy-blue">Filter by type:</label>
        <select
          id="content-type-filter"
          className="border border-gray-300 rounded px-3 py-1"
          value={selectedType}
          onChange={e => setSelectedType(e.target.value)}
        >
          {CONTENT_TYPE_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
      {filteredContents.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No content history available</p>
      ) : (
        filteredContents.map((content) => (
          <div
            key={content.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold text-navy-blue">{content.title}</h3>
                
              </div>
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