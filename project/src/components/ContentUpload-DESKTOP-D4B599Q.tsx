import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import ContentUploader from './ContentUploader';
import { Link } from 'react-router-dom';

const ContentUpload: React.FC = () => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (result: { id: string; url: string; type: string }) => {
    try {
      console.log('Uploaded content:', result);
      
      // Create a more detailed upload result for GYBStudio
      const uploadData = {
        id: result.id,
        url: result.url,
        type: result.type,
        uploadedAt: new Date().toISOString(),
        status: 'uploaded'
      };
      
      // Navigate to GYBStudio with the uploaded content data
      navigate('/gyb-studio', { 
        state: { 
          uploadedContent: uploadData,
          message: 'Content uploaded successfully and is being processed.'
        } 
      });
    } catch (err) {
      console.error('Error handling upload:', err);
      setError('An error occurred while processing your content.');
    }
  };

  return (
    <div className="bg-white min-h-screen text-navy-blue">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Link to="/gyb-studio" className="mr-4 text-navy-blue">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold text-navy-blue">Upload Content</h1>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="max-w-3xl mx-auto">
          <ContentUploader onUpload={handleUpload} />
        </div>
      </div>
    </div>
  );
};

export default ContentUpload;