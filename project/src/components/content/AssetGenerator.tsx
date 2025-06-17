import React, { useState } from 'react';
import { Wand2, AlertCircle, Check, X } from 'lucide-react';
import { GenerationType, AssetGenerationRequest } from '../../types/content';

interface AssetGeneratorProps {
  contentId: string;
  type: GenerationType;
  onGenerate: (request: AssetGenerationRequest) => Promise<void>;
  onClose: () => void;
}

const AssetGenerator: React.FC<AssetGeneratorProps> = ({
  contentId,
  type,
  onGenerate,
  onClose
}) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      await onGenerate({
        contentId,
        type,
        prompt: prompt.trim()
      });
      onClose();
    } catch (err) {
      setError('Failed to generate asset. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Generate {type.charAt(0).toUpperCase() + type.slice(1)}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-blue focus:border-transparent"
            rows={4}
            placeholder="Describe what you want to generate..."
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 flex items-center">
            <AlertCircle size={20} className="mr-2" />
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-navy-blue text-white px-6 py-2 rounded-full hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <Wand2 size={20} className="mr-2" />
                Generate
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetGenerator;