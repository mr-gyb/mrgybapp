import React, { useState, useRef } from 'react';
import { ChevronLeft, Upload as UploadIcon, Link, FileText } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';

const Upload: React.FC = () => {
  const [contentUrl, setContentUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setFileName(file.name);
      try {
        // Simulating file upload
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('File uploaded:', file);
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('An error occurred while uploading the file. Please try again.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentUrl.trim()) return;

    setIsUploading(true);
    try {
      // Simulating URL processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('URL processed:', contentUrl);
      setContentUrl('');
    } catch (error) {
      console.error('Error processing URL:', error);
      alert('An error occurred while processing the URL. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen text-navy-blue">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <RouterLink to="/dashboard" className="mr-4 text-navy-blue">
            <ChevronLeft size={24} />
          </RouterLink>
          <h1 className="text-3xl font-bold text-navy-blue">Upload Content</h1>
        </div>
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-4">Upload File</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-navy-blue hover:bg-blue-700 text-white px-4 py-2 rounded-full flex items-center transition duration-300"
                  disabled={isUploading}
                >
                  <UploadIcon size={20} className="mr-2" />
                  {isUploading ? 'Uploading...' : 'Choose File'}
                </button>
                {fileName && <span className="text-gray-600">{fileName}</span>}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept="video/*,audio/*,image/*,.pdf,.doc,.docx,.txt"
              />
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4">Share YouTube Link</h3>
              <form onSubmit={handleUrlSubmit} className="flex items-center space-x-4">
                <input
                  type="url"
                  value={contentUrl}
                  onChange={(e) => setContentUrl(e.target.value)}
                  placeholder="Paste YouTube URL here"
                  className="flex-grow px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-navy-blue"
                />
                <button
                  type="submit"
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full flex items-center transition duration-300"
                  disabled={isUploading || !contentUrl.trim()}
                >
                  <Link size={20} className="mr-2" />
                  {isUploading ? 'Processing...' : 'Share'}
                </button>
              </form>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-4">Supported Content Types</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Video files (MP4, MOV, AVI, etc.)</li>
              <li>Audio files (MP3, WAV, etc.)</li>
              <li>Image files (JPG, PNG, GIF, etc.)</li>
              <li>Documents (PDF, DOC, DOCX, TXT)</li>
              <li>YouTube links</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;