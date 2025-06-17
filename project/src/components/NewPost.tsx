import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import ContentUploader from './content/ContentUploader';
import AnalysisResults from './content/AnalysisResults';

const NewPost: React.FC = () => {
  const [showUploader, setShowUploader] = useState(true);
  const [analysisResults, setAnalysisResults] = useState<any[]>([]);

  const handleAnalysisComplete = (derivatives: any[]) => {
    setAnalysisResults(derivatives);
    setShowUploader(false);
  };

  return (
    <div className="bg-white min-h-screen text-navy-blue">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link to="/gyb-studio" className="mr-4 text-navy-blue">
              <ChevronLeft size={24} />
            </Link>
            <h1 className="text-3xl font-bold text-navy-blue">Content Analysis</h1>
          </div>
        </div>

        {showUploader ? (
          <ContentUploader
            onAnalysisComplete={handleAnalysisComplete}
            onClose={() => setShowUploader(false)}
          />
        ) : (
          <div className="space-y-6">
            <AnalysisResults derivatives={analysisResults} />
            <button
              onClick={() => setShowUploader(true)}
              className="bg-navy-blue text-white px-6 py-2 rounded-full hover:bg-opacity-90"
            >
              Analyze More Content
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewPost;