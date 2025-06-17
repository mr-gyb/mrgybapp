import React, { useState } from 'react';
import { Link as LinkIcon, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { processMediaLink } from '../../services/media.service';

interface LinkInputProps {
  onSubmit: (mediaId: string) => void;
}

const LinkInput: React.FC<LinkInputProps> = ({ onSubmit }) => {
  const [url, setUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !url.trim()) return;

    setIsProcessing(true);
    setError(null);

    try {
      const result = await processMediaLink(url.trim(), user.id);
      onSubmit(result.id);
      setUrl('');
    } catch (err) {
      setError('Failed to process link. Please try again.');
      console.error('Link processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Share Link</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="relative">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste URL here"
              className="w-full px-4 py-2 pl-10 border rounded-full focus:outline-none focus:ring-2 focus:ring-navy-blue"
              disabled={isProcessing}
            />
            <LinkIcon className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
          {error && (
            <div className="mt-2 text-red-500 flex items-center">
              <AlertCircle size={16} className="mr-1" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={isProcessing || !url.trim()}
          className="w-full bg-navy-blue text-white px-4 py-2 rounded-full disabled:opacity-50 hover:bg-opacity-90 transition-colors flex items-center justify-center"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            'Process Link'
          )}
        </button>
      </form>
    </div>
  );
};

export default LinkInput;