import React, { useState, useRef } from 'react';
import { Video, Upload } from 'lucide-react';

const VideoUploadPage: React.FC = () => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const videoFiles = files.filter(file => file.type.startsWith('video/'));
    
    if (videoFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...videoFiles]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const videoFiles = files.filter(file => file.type.startsWith('video/'));
    
    if (videoFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...videoFiles]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Character Section - Centered */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            {/* Character Frame */}
            <div className="relative">
              <div className="relative">
                {/* Character Image */}
                <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-blue-600 border-opacity-20">
                  <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                    <img 
                      src="https://firebasestorage.googleapis.com/v0/b/mr-gyb-ai-app-108.firebasestorage.app/o/profile-images%2FMr.GYB_AI.png?alt=media&token=40ed698e-e2d0-45ff-b33a-508683c51a58"
                      alt="Mr. GYB AI"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = '<div class="w-full h-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">GYB</div>';
                      }}
                    />
                  </div>
                </div>
                
                {/* Golden Border Overlay */}
                <div className="absolute inset-0 rounded-2xl border-2 border-yellow-400 pointer-events-none"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Upload Section */}
      <div className="container mx-auto px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Upload Container */}
          <div 
            className={`relative border-2 border-dashed border-blue-600 rounded-2xl p-12 text-center transition-all duration-200 ${
              isDragOver ? 'border-blue-500 bg-blue-50' : 'border-blue-600 bg-white'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Video Camera Icon - Centered */}
            <div className="flex justify-center mb-6">
              <Video size={48} className="text-red-500" />
            </div>

            {/* Upload Content */}
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-blue-900">
                Drop video files here or click to browse
              </h2>
              <p className="text-lg text-gray-600">
                Drag and drop your files here or click to browse
              </p>
              
              {/* Upload Button */}
              <button
                onClick={handleUploadClick}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Upload size={20} className="mr-2" />
                Choose Video Files
              </button>
              
              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Uploaded Videos</h3>
              <div className="space-y-3">
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <Video size={20} className="text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-800">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              
              {/* Process Button */}
              <div className="mt-6 text-center">
                <button className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200">
                  Process Videos
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoUploadPage;
