import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { ContentDerivative } from '../../types/content';

interface AnalysisResultsProps {
  derivatives: ContentDerivative[];
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ derivatives }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (content: string, type: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(type);
      setTimeout(() => setCopiedId(null), 2000);
      console.log(content);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const headline = derivatives.find(d => d.derivative_type === 'headline')?.content;
  const blog = derivatives.find(d => d.derivative_type === 'blog')?.content;

  return (
    <div className="space-y-6">
      {headline && (
        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Generated Headline</h3>
            <button
              onClick={() => handleCopy(headline, 'headline')}
              className="text-gray-500 hover:text-navy-blue"
            >
              {copiedId === 'headline' ? (
                <Check size={20} className="text-green-500" />
              ) : (
                <Copy size={20} />
              )}
            </button>
          </div>
          <p className="text-lg">{headline}</p>
        </div>
      )}

      {blog && (
        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Generated Blog Post</h3>
            <button
              onClick={() => handleCopy(blog, 'blog')}
              className="text-gray-500 hover:text-navy-blue"
            >
              {copiedId === 'blog' ? (
                <Check size={20} className="text-green-500" />
              ) : (
                <Copy size={20} />
              )}
            </button>
          </div>
          <div className="prose max-w-none">
            {blog.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisResults;