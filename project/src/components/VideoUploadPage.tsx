import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Upload } from 'lucide-react';
import { openaiService, VideoAnalysisResult } from '../services/openaiService';
import { testOpenAIVideoConnection, testOpenAICompletion } from '../utils/testOpenAI';

const VideoUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const videoFiles = files.filter(file => file.type.startsWith('video/'));
    
    if (videoFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...videoFiles]);
      await processVideoWithOpenAI(videoFiles[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const videoFiles = files.filter(file => file.type.startsWith('video/'));
    
    if (videoFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...videoFiles]);
      await processVideoWithOpenAI(videoFiles[0]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const processVideoWithOpenAI = async (videoFile: File) => {
    setIsProcessing(true);
    setProcessingError(null);

    try {
      // Check if OpenAI is configured
      if (!openaiService.isConfigured()) {
        console.warn('OpenAI Video API not configured');
        setProcessingError('OpenAI Video API key not configured. Please add VITE_OPENAI_VIDEO_API_KEY to your .env file.');
        return;
      }

      console.log('Starting video analysis with OpenAI...');
      console.log('Video file:', videoFile.name, 'Size:', (videoFile.size / (1024 * 1024)).toFixed(2), 'MB');
      
      // Test OpenAI API connection first
      console.log('Testing OpenAI Video API connection...');
      console.log('Video API Key exists:', !!import.meta.env.VITE_OPENAI_VIDEO_API_KEY);
      console.log('Video API Key starts with:', import.meta.env.VITE_OPENAI_VIDEO_API_KEY?.substring(0, 10) + '...');
      
      const connectionTest = await testOpenAIVideoConnection();
      if (!connectionTest) {
        console.error('OpenAI API connection test failed');
        setProcessingError('OpenAI API connection failed. The AI service is temporarily unavailable. You can still upload your video, but analysis features will be limited.');
        // Don't return - allow upload to continue with limited functionality
      } else {
        console.log('OpenAI API connection successful, proceeding with analysis...');
      }
      
      // Analyze video with OpenAI
      const analysisResult = await openaiService.analyzeVideo(videoFile);
      
      console.log('Video analysis completed:', analysisResult);
      
      // Store analysis result in sessionStorage for the summary page
      sessionStorage.setItem('videoAnalysis', JSON.stringify(analysisResult));
      sessionStorage.setItem('uploadedVideoName', videoFile.name);
      sessionStorage.setItem('uploadedVideoSize', videoFile.size.toString());
      sessionStorage.setItem('uploadedVideoType', videoFile.type);
      sessionStorage.setItem('processingTimestamp', new Date().toISOString());

      // Navigate to create1 page for processing animation
      navigate('/create1');
    } catch (error) {
      console.error('Error processing video:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      
      // Check if it's an API key issue
      if (errorMessage.includes('API key is invalid') || errorMessage.includes('401')) {
        setProcessingError('OpenAI API key is invalid or expired. Please check your API configuration in the .env file.');
      } else {
        setProcessingError(`Video analysis failed: ${errorMessage}`);
      }
    } finally {
      setIsProcessing(false);
    }
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
                <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-opacity-20 animated-border" style={{ borderColor: '#11335d' }}>
                  <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: '#11335d' }}>
                    <img 
                      src="https://firebasestorage.googleapis.com/v0/b/mr-gyb-ai-app-108.firebasestorage.app/o/profile-images%2FMr.GYB_AI.png?alt=media&token=40ed698e-e2d0-45ff-b33a-508683c51a58"
                      alt="Mr. GYB AI"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-white text-2xl font-bold" style="background-color: #11335d;">GYB</div>';
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
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 animated-border-upload ${
              isDragOver ? 'bg-gray-50' : 'bg-white'
            }`}
            style={{
              borderColor: isDragOver ? '#11335d' : '#11335d'
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Video Camera Icon - Premium Animation System */}
            <div className="flex justify-center mb-6">
              <div className="relative group">
                {/* Multiple Animated Rings with Different Speeds */}
                <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-60" style={{ animationDuration: '2s' }}></div>
                <div className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping opacity-40" style={{ animationDuration: '3s', animationDelay: '0.5s' }}></div>
                <div className="absolute inset-0 rounded-full border-2 border-red-300 animate-ping opacity-30" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
                
                {/* Rotating Background Circle */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500/20 to-red-400/20 animate-spin" style={{ animationDuration: '8s' }}></div>
                
                {/* Video Icon with Up/Down Movement Animation */}
                <Video 
                  size={48} 
                  className="text-red-500 relative z-10 transform transition-all duration-700 group-hover:scale-125 group-hover:rotate-12 group-hover:text-red-600 group-hover:drop-shadow-lg" 
                  style={{
                    animation: 'upDownMove 2s ease-in-out infinite, videoGlow 2s ease-in-out infinite alternate'
                  }}
                />
                
                {/* Glowing Effect on Hover */}
                <div className="absolute inset-0 rounded-full bg-red-500/20 scale-0 group-hover:scale-150 transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
              </div>
            </div>
            
            {/* Advanced CSS Animations */}
            <style>{`
              @keyframes upDownMove {
                0%, 100% { 
                  transform: translateY(0px); 
                }
                25% { 
                  transform: translateY(-12px); 
                }
                50% { 
                  transform: translateY(-20px); 
                }
                75% { 
                  transform: translateY(-12px); 
                }
              }
              
              @keyframes videoGlow {
                0% { 
                  filter: drop-shadow(0 0 5px rgba(239, 68, 68, 0.3));
                }
                100% { 
                  filter: drop-shadow(0 0 15px rgba(239, 68, 68, 0.6)) drop-shadow(0 0 25px rgba(239, 68, 68, 0.4));
                }
              }
              
              @keyframes pulseRing {
                0% { 
                  transform: scale(0.8);
                  opacity: 1;
                }
                100% { 
                  transform: scale(2.4);
                  opacity: 0;
                }
              }
              
              .group:hover .animate-ping {
                animation: pulseRing 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
              }
            `}</style>

            {/* Upload Content */}
            <div className="space-y-4">
              {isProcessing ? (
                <>
                  <div className="flex items-center justify-center space-x-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#11335d' }}></div>
                    <h2 className="text-3xl font-bold" style={{ color: '#11335d' }}>
                      Processing video with OpenAI...
                    </h2>
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg text-gray-600">
                      Our AI is processing your video using the complete workflow
                    </p>
                    <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                      <span>🎵 Extracting audio...</span>
                      <span>🎤 Transcribing with Whisper...</span>
                      <span>🧠 Analyzing with GPT-4...</span>
                    </div>
                    <div className="text-xs text-gray-400 text-center">
                      Step 1: Extract Audio → Step 2: Whisper Transcription → Step 3: GPT-4 Analysis
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-bold" style={{ color: '#11335d' }}>
                    Drop video files here or click to browse
                  </h2>
                  <p className="text-lg text-gray-600">
                    Drag and drop your files here or click to browse
                  </p>
                  
                  {/* Upload Button */}
                  <button
                    onClick={handleUploadClick}
                    disabled={isProcessing}
                    className="inline-flex items-center px-6 py-3 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                      backgroundColor: '#11335d',
                      ':hover': { backgroundColor: '#0f2a4a' }
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#0f2a4a';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#11335d';
                    }}
                  >
                    <Upload size={20} className="mr-2" />
                    Choose Video Files
                  </button>
                </>
              )}
              
              {/* Error Message */}
              {processingError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">{processingError}</p>
                  <button
                    onClick={() => setProcessingError(null)}
                    className="mt-2 text-red-600 hover:text-red-800 underline"
                  >
                    Dismiss
                  </button>
                </div>
              )}
              
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
                      <Video size={20} style={{ color: '#11335d' }} />
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
      
      {/* Animated Border CSS */}
      <style>{`
        .animated-border {
          position: relative;
          background: linear-gradient(45deg, #11335d, #e3c472, #11335d, #e3c472);
          background-size: 400% 400%;
          animation: borderGlow 3s ease-in-out infinite;
          padding: 3px;
          border-radius: 1rem;
        }
        
        .animated-border::before {
          content: '';
          position: absolute;
          top: 3px;
          left: 3px;
          right: 3px;
          bottom: 3px;
          background: #11335d;
          border-radius: 1rem;
          z-index: 1;
        }
        
        .animated-border > * {
          position: relative;
          z-index: 2;
        }
        
        .animated-border-upload {
          position: relative;
          background: linear-gradient(45deg, #11335d, #e3c472, #11335d, #e3c472);
          background-size: 400% 400%;
          animation: borderGlow 3s ease-in-out infinite;
          padding: 3px;
          border-radius: 1rem;
        }
        
        .animated-border-upload::before {
          content: '';
          position: absolute;
          top: 3px;
          left: 3px;
          right: 3px;
          bottom: 3px;
          background: white;
          border-radius: 1rem;
          z-index: 1;
        }
        
        .animated-border-upload > * {
          position: relative;
          z-index: 2;
        }
        
        @keyframes borderGlow {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
};

export default VideoUploadPage;
