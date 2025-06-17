import React, { useEffect, useState } from 'react';
import { Loader } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface MediaProcessingProps {
  mediaId: string;
  onComplete: () => void;
}

const MediaProcessing: React.FC<MediaProcessingProps> = ({ mediaId, onComplete }) => {
  const [progress, setProgress] = useState<string[]>([]);

  useEffect(() => {
    const subscription = supabase
      .channel(`media-${mediaId}`)
      .on('postgres_changes', { 
        event: 'INSERT',
        schema: 'public',
        table: 'media_derivatives',
        filter: `media_id=eq.${mediaId}`
      }, (payload) => {
        setProgress(prev => [...prev, payload.new.derivative_type]);
        
        // Check if all processing is complete
        if (payload.new.derivative_type === 'seo_tags') {
          onComplete();
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [mediaId, onComplete]);

  const steps = [
    'Analyzing content...',
    'Generating transcription...',
    'Creating blog post...',
    'Optimizing for SEO...',
    'Generating media assets...'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
        <h2 className="text-xl font-bold mb-4">Processing Content</h2>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center ${
                progress.length > index ? 'text-green-500' : 'text-gray-400'
              }`}
            >
              {progress.length > index ? (
                <div className="w-5 h-5 mr-3">✓</div>
              ) : progress.length === index ? (
                <Loader className="w-5 h-5 mr-3 animate-spin" />
              ) : (
                <div className="w-5 h-5 mr-3" />
              )}
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MediaProcessing;