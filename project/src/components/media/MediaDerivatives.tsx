import React from 'react';
import { FileText, Video, Image as ImageIcon, Headphones, Copy } from 'lucide-react';

interface Derivative {
  id: string;
  derivative_type: string;
  content: string;
  storage_path?: string;
}

interface MediaDerivativesProps {
  derivatives: Derivative[];
}

const MediaDerivatives: React.FC<MediaDerivativesProps> = ({ derivatives }) => {
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const renderDerivative = (derivative: Derivative) => {
    switch (derivative.derivative_type) {
      case 'blog':
        return (
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Blog Post</h3>
              <button
                onClick={() => copyToClipboard(derivative.content)}
                className="text-gray-500 hover:text-navy-blue"
              >
                <Copy size={20} />
              </button>
            </div>
            <div className="prose max-w-none">
              {derivative.content}
            </div>
          </div>
        );

      case 'headline':
        return (
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Headline</h3>
              <button
                onClick={() => copyToClipboard(derivative.content)}
                className="text-gray-500 hover:text-navy-blue"
              >
                <Copy size={20} />
              </button>
            </div>
            <p className="text-xl font-bold">{derivative.content}</p>
          </div>
        );

      case 'seo_tags':
        return (
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">SEO Tags</h3>
              <button
                onClick={() => copyToClipboard(derivative.content)}
                className="text-gray-500 hover:text-navy-blue"
              >
                <Copy size={20} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {derivative.content.split(',').map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-100 px-2 py-1 rounded-full text-sm"
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Generated Content</h2>
      <div className="space-y-4">
        {derivatives.map((derivative) => (
          <div key={derivative.id}>
            {renderDerivative(derivative)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaDerivatives;