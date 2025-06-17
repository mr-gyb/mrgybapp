import React, { useState } from 'react';
import { Send, Loader } from 'lucide-react';

interface ContentGeneratorProps {
  onContentGenerated: (content: { title: string; content: string }) => void;
}

const ContentGenerator: React.FC<ContentGeneratorProps> = ({ onContentGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateContent = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('https://hook.us1.make.com/cgjp8jnmg4fm4s2w87t7pjdugg0j74a7', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          timestamp: new Date().toISOString(),
          type: 'content_generation'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data || (!data.content && !data.response && !data.text)) {
        throw new Error('Invalid response format from server');
      }

      onContentGenerated({
        title: data.title || prompt.slice(0, 50) + '...',
        content: data.content || data.response || data.text,
      });
      
      setPrompt('');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(`Failed to generate content: ${errorMessage}`);
      console.error('Content generation error:', {
        error: err,
        prompt,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      generateContent();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
          What would you like to create?
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
            setError(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Enter your content prompt here... (Press Ctrl + Enter to generate)"
          className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-blue focus:border-transparent resize-none"
          rows={4}
        />
        <p className="mt-1 text-sm text-gray-500">
          Press Ctrl + Enter to generate content quickly
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
          <span className="flex-grow">{error}</span>
          <button 
            onClick={() => setError(null)}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      <button
        onClick={generateContent}
        disabled={isLoading || !prompt.trim()}
        className="w-full bg-navy-blue text-white py-3 px-4 rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:bg-opacity-90"
      >
        {isLoading ? (
          <>
            <Loader className="animate-spin mr-2" size={20} />
            Generating...
          </>
        ) : (
          <>
            <Send className="mr-2" size={20} />
            Generate Content
          </>
        )}
      </button>
    </div>
  );
};

export default ContentGenerator;