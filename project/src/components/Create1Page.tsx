import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Create1Page: React.FC = () => {
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    // Simulate AI processing for a few seconds
    const timer = setTimeout(() => {
      setIsAnalyzing(false);
      // Navigate to summary page after processing
      navigate('/summary');
    }, 3000); // 3 seconds of analysis

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      {/* AI Assistant Character Image with Double Border */}
      <div className="mb-12">
        <div className="relative">
          <img 
            src="https://firebasestorage.googleapis.com/v0/b/mr-gyb-ai-app-108.firebasestorage.app/o/profile-images%2FMr.GYB_AI.png?alt=media&token=40ed698e-e2d0-45ff-b33a-508683c51a58"
            alt="Mr. GYB AI"
            className="object-contain rounded-lg"
            style={{
              width: '400px',
              height: '400px',
              outline: 'none',
              border: 'none',
              boxShadow: 'none'
            }}
          />
        </div>
      </div>

      {/* Circular Progress Spinner with Double Borders */}
      <div className="relative">
        {/* Outer circle - #11335d */}
        <div 
          className="w-48 h-48 rounded-full animate-spin"
          style={{ 
            border: '8px solid #11335d',
            backgroundColor: 'white'
          }}
        ></div>
        
        {/* Inner circle - #e0c472 */}
        <div 
          className="absolute top-4 left-4 w-40 h-40 rounded-full animate-spin"
          style={{ 
            border: '6px solid #e0c472',
            backgroundColor: 'white',
            animationDirection: 'reverse'
          }}
        ></div>
        
        {/* Center content with Analyzing text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="bg-white rounded-full w-28 h-28 flex items-center justify-center"
            style={{ backgroundColor: 'white' }}
          >
            <span className="text-black font-medium text-lg" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              Analyzing...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Create1Page;
