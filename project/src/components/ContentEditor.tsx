import React, { useState, useEffect } from 'react';
import { Save, X, AlertCircle } from 'lucide-react';
import { GeneratedContent } from '../lib/supabase';
import { updateContent } from '../services/contentService';

interface ContentEditorProps {
  content: GeneratedContent;
  onClose: () => void;
  onSave: (updatedContent: GeneratedContent) => void;
}

const ContentEditor: React.FC<ContentEditorProps> = ({ content, onClose, onSave }) => {
  const [title, setTitle] = useState(content.title);
  const [editedContent, setEditedContent] = useState(content.generated_content);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle(content.title);
    setEditedContent(content.generated_content);
  }, [content]);

  const handleSave = async () => {
    if (!title.trim() || !editedContent.trim()) {
      setError('Title and content cannot be empty');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const updatedContent = await updateContent(content.id, {
        title,
        generated_content: editedContent,
      });
      onSave(updatedContent);
      onClose();
    } catch (err) {
      setError('Failed to save changes. Please try again.');
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-navy-blue">Edit Content</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              id="edit-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-blue focus:border-transparent"
              disabled={isSaving}
            />
          </div>

          <div>
            <label htmlFor="edit-content" className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              id="edit-content"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-blue focus:border-transparent"
              rows={8}
              disabled={isSaving}
            />
          </div>

          {error && (
            <div className="text-red-500 flex items-center">
              <AlertCircle size={16} className="mr-2" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`bg-navy-blue text-white px-4 py-2 rounded-lg flex items-center ${
                isSaving ? 'opacity-75 cursor-not-allowed' : 'hover:bg-opacity-90'
              }`}
            >
              <Save size={20} className="mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentEditor;