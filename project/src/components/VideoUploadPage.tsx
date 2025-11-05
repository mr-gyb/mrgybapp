import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Upload } from 'lucide-react';
import { openaiService } from '../services/openaiService';
import { testOpenAIVideoConnection } from '../utils/testOpenAI';

const VideoUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [hasUploadedVideo, setHasUploadedVideo] = useState(false);
  const [showUploadSection, setShowUploadSection] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showProcessingSteps, setShowProcessingSteps] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = [
    { number: 1, text: 'Extracting audio', emoji: '🎵' },
    { number: 2, text: 'Transcribing Text', emoji: '🎤' },
    { number: 3, text: 'Analyzing Content', emoji: '🧠' }
  ];

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
      setHasUploadedVideo(true);
      setShowProcessingSteps(true);
      startStepAnimation();
      await processVideoWithOpenAI(videoFiles[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const videoFiles = files.filter(file => file.type.startsWith('video/'));
    
    if (videoFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...videoFiles]);
      setHasUploadedVideo(true);
      setShowProcessingSteps(true);
      startStepAnimation();
      await processVideoWithOpenAI(videoFiles[0]);
    }
  };

  const handleUploadClick = () => {
    // If upload section is not shown yet, show it
    if (!showUploadSection) {
      setShowUploadSection(true);
    } else {
      // If upload section is already shown, trigger file selection
      fileInputRef.current?.click();
    }
  };

  const startStepAnimation = () => {
    setCurrentStep(0);
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(stepInterval);
          // Navigate to summary page after all steps
          setTimeout(() => {
            navigate('/summary');
          }, 1000);
          return prev;
        }
      });
    }, 2000); // 2 seconds per step
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
      
      // Check if video is long enough for automatic short video conversion
      const isLongVideo = analysisResult.duration > 120; // 2 minutes or longer
      const shouldAutoConvert = isLongVideo && analysisResult.suggestedShorts && analysisResult.suggestedShorts.length > 0;
      
      // Store analysis result in sessionStorage for the summary page
      console.log('💾 Storing analysis result in sessionStorage:', analysisResult);
      sessionStorage.setItem('videoAnalysis', JSON.stringify(analysisResult));
      sessionStorage.setItem('uploadedVideoName', videoFile.name);
      sessionStorage.setItem('uploadedVideoSize', videoFile.size.toString());
      sessionStorage.setItem('uploadedVideoType', videoFile.type);
      sessionStorage.setItem('processingTimestamp', new Date().toISOString());
      sessionStorage.setItem('isLongVideo', isLongVideo.toString());
      sessionStorage.setItem('shouldAutoConvert', shouldAutoConvert.toString());
      
      // Debug: Verify storage
      console.log('✅ Analysis stored. Verifying...');
      console.log('videoAnalysis in sessionStorage:', sessionStorage.getItem('videoAnalysis') ? 'YES' : 'NO');
      console.log('Analysis summary:', analysisResult.summary);

      // If it's a long video with suggested shorts, automatically trigger conversion
      if (shouldAutoConvert) {
        console.log('🎬 Long video detected! Auto-triggering short video conversion...');
        sessionStorage.setItem('autoConvertShorts', 'true');
        sessionStorage.setItem('conversionTriggered', 'true');
      }

      // Navigate to summary page to show analysis results
      console.log('🧭 Navigating to summary page...');
      navigate('/summary');
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
    setUploadedFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index);
      if (newFiles.length === 0) {
        setHasUploadedVideo(false);
        setShowProcessingSteps(false);
        setCurrentStep(0);
      }
      return newFiles;
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Character Section - Centered */}
      <div className={`py-12 transition-all duration-500 ease-in-out ${showUploadSection ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center">
            {/* Character Frame with Double Border */}
            <div className="relative mb-8">
              {/* Outer Blue Border */}
              <div 
                className="rounded-2xl p-2"
                style={{
                  backgroundColor: '#11335d',
                  width: '400px',
                  height: '400px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {/* Inner Yellow Border */}
                <div 
                  className="rounded-xl p-2"
                  style={{
                    backgroundColor: '#D4AF37',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {/* Character Image */}
                  <div 
                    className="rounded-lg overflow-hidden"
                    style={{
                      width: '350px',
                      height: '350px'
                    }}
                  >
                    <img 
                      src="/cropped_ai_image.png"
                      alt="Chris - Your AI Business Coach"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Introduction Text */}
            <div className="text-center mb-8">
              <h1 
                className="text-4xl font-bold mb-4"
                style={{ color: '#11335d' }}
              >
                Hi, I'm Chris! Your AI Business Coach
              </h1>
            </div>

            {/* Call to Action Button */}
            <div className="text-center">
              <button
                onClick={handleUploadClick}
                className="px-8 py-4 text-white font-semibold rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
                style={{ 
                  backgroundColor: '#11335d',
                  fontSize: '18px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#0f2a4a';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#11335d';
                }}
              >
                Let's Get Started
              </button>
              
            </div>
          </div>
        </div>
      </div>

      {/* Processing Steps Section */}
      {showProcessingSteps && (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div 
              className="relative border-2 border-dashed rounded-2xl p-8 max-w-2xl mx-auto"
              style={{
                borderColor: '#D4AF37',
                borderWidth: '3px'
              }}
            >
              {/* Title */}
              <h3 className="text-2xl font-bold text-black text-center mb-8">
                Processing Video
              </h3>

              {/* Processing Steps */}
              <div className="space-y-6">
                {steps.map((step, index) => (
                  <div 
                    key={step.number}
                    className={`flex items-center space-x-4 transition-all duration-1500 ease-out ${
                      index <= currentStep 
                        ? 'opacity-100 transform translate-x-0' 
                        : 'opacity-0 transform translate-x-6'
                    }`}
                    style={{
                      transitionDelay: `${index * 600}ms`
                    }}
                  >
                    {/* Step Circle */}
                    <div className="relative">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-1500 ease-out"
                        style={{
                          border: `3px solid #11335d`,
                          backgroundColor: index <= currentStep ? 'white' : '#11335d',
                          boxShadow: index <= currentStep 
                            ? '0 4px 12px rgba(17, 51, 93, 0.15)' 
                            : '0 2px 8px rgba(17, 51, 93, 0.3)'
                        }}
                      >
                        <span 
                          className="text-lg font-bold transition-all duration-1500 ease-out"
                          style={{
                            color: index <= currentStep ? '#11335d' : 'white',
                            textShadow: index <= currentStep ? 'none' : '0 1px 2px rgba(0,0,0,0.3)'
                          }}
                        >
                          {step.number}
                        </span>
                      </div>
                      {/* Inner golden ring */}
                      <div 
                        className="absolute inset-0 rounded-full border-2 pointer-events-none transition-all duration-1500 ease-out"
                        style={{
                          borderColor: '#D4AF37',
                          opacity: index <= currentStep ? 1 : 0,
                          transform: index <= currentStep ? 'scale(1)' : 'scale(0.8)'
                        }}
                      ></div>
                      {/* Blue glow effect during transition */}
                      <div 
                        className="absolute inset-0 rounded-full pointer-events-none transition-all duration-1500 ease-out"
                        style={{
                          backgroundColor: index <= currentStep ? 'transparent' : 'rgba(17, 51, 93, 0.1)',
                          opacity: index <= currentStep ? 0 : 1,
                          transform: index <= currentStep ? 'scale(1)' : 'scale(1.1)'
                        }}
                      ></div>
                    </div>

                    {/* Step Text */}
                    <div className="flex items-center space-x-3">
                      <span 
                        className="text-2xl transition-all duration-1500 ease-out"
                        style={{
                          opacity: index <= currentStep ? 1 : 0.3,
                          transform: index <= currentStep ? 'scale(1)' : 'scale(0.9)'
                        }}
                      >
                        {step.emoji}
                      </span>
                      <span 
                        className="text-lg transition-all duration-1500 ease-out"
                        style={{
                          color: index <= currentStep ? '#000' : '#11335d',
                          fontWeight: index <= currentStep ? 'normal' : 'normal',
                          opacity: index <= currentStep ? 1 : 0.7,
                          textShadow: index <= currentStep ? 'none' : '0 1px 2px rgba(17, 51, 93, 0.2)'
                        }}
                      >
                        {step.text}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress Indicator */}
              <div className="mt-6 text-center">
                <div className="text-sm text-gray-600">
                  Step {currentStep + 1} of {steps.length}
                </div>
              </div>

              {/* Animated Video Clip Icon - Shows when processing is complete */}
              {currentStep >= steps.length - 1 && (
                <div className="mt-8 text-center">
                  <h4 className="text-lg font-semibold text-black mb-4">Processing Complete!</h4>
                  
                  {/* Video Clip Icon - Premium Animation System */}
                  <div className="flex justify-center mb-4">
                    <div className="relative group">
                      {/* Multiple Animated Rings with Different Speeds */}
                      <div className="absolute inset-0 rounded-full border-2 border-blue-500 animate-ping opacity-60" style={{ animationDuration: '2s' }}></div>
                      <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping opacity-40" style={{ animationDuration: '3s', animationDelay: '0.5s' }}></div>
                      <div className="absolute inset-0 rounded-full border-2 border-blue-300 animate-ping opacity-30" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
                      
                      {/* Rotating Background Circle */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-blue-400/20 animate-spin" style={{ animationDuration: '8s' }}></div>
                      
                      {/* Video Clip Icon with Up/Down Movement Animation */}
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center relative z-10 transform transition-all duration-700 group-hover:scale-125 group-hover:rotate-12 group-hover:drop-shadow-lg" 
                           style={{
                             animation: 'upDownMove 2s ease-in-out infinite, videoGlow 2s ease-in-out infinite alternate',
                             border: '3px solid #11335d'
                           }}>
                        <svg 
                          width="32" 
                          height="32" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          className="text-blue-500"
                          style={{
                            filter: 'drop-shadow(0 0 5px rgba(59, 130, 246, 0.3))'
                          }}
                        >
                          <path 
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      
                      {/* Glowing Effect on Hover */}
                      <div className="absolute inset-0 rounded-full bg-blue-500/20 scale-0 group-hover:scale-150 transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600">Your video is ready for analysis!</p>
                </div>
              )}
              
              {/* CSS Animations for Video Clip Icon */}
              <style>{`
                @keyframes upDownMove {
                  0%, 100% { 
                    transform: translateY(0px); 
                  }
                  25% { 
                    transform: translateY(-8px); 
                  }
                  50% { 
                    transform: translateY(-15px); 
                  }
                  75% { 
                    transform: translateY(-8px); 
                  }
                }
                
                @keyframes videoGlow {
                  0% { 
                    filter: drop-shadow(0 0 5px rgba(59, 130, 246, 0.3));
                  }
                  100% { 
                    filter: drop-shadow(0 0 15px rgba(59, 130, 246, 0.6)) drop-shadow(0 0 25px rgba(59, 130, 246, 0.4));
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
            </div>
          </div>
        </div>
      )}

      {/* Animated Video Icon Section - Shows after processing */}
      {hasUploadedVideo && !showProcessingSteps && (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-black mb-8">Video Processing Complete!</h3>
              
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
                    size={64} 
                    className="text-red-500 relative z-10 transform transition-all duration-700 group-hover:scale-125 group-hover:rotate-12 group-hover:text-red-600 group-hover:drop-shadow-lg" 
                    style={{
                      animation: 'upDownMove 2s ease-in-out infinite, videoGlow 2s ease-in-out infinite alternate'
                    }}
                  />
                  
                  {/* Glowing Effect on Hover */}
                  <div className="absolute inset-0 rounded-full bg-red-500/20 scale-0 group-hover:scale-150 transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
                </div>
              </div>
              
              <p className="text-lg text-gray-600 mb-6">Your video has been successfully analyzed and is ready for review!</p>
              
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
            </div>
          </div>
        </div>
      )}

      {/* Video Upload Section - Hidden by default, shown after button click */}
      {showUploadSection && (
        <div className="container mx-auto px-4 pb-12">
          <div className={`max-w-4xl mx-auto transition-all duration-500 ease-in-out ${hasUploadedVideo ? 'max-w-6xl' : 'max-w-4xl'}`}>
            {/* Upload Container - Matching the design */}
              <div 
              className={`relative border-2 border-dashed rounded-2xl text-center transition-all duration-500 ease-in-out ${
                isDragOver ? 'bg-gray-50' : 'bg-white'
              } ${hasUploadedVideo ? 'p-8' : 'p-12'}`}
              style={{
                borderColor: '#D4AF37', // Golden dashed border
                borderWidth: '3px'
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
            {/* Video Camera Icon - Custom color as requested */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#204777' }}>
                <Video size={32} className="text-white" />
              </div>
            </div>

            {/* Upload Content */}
            <div className="space-y-4">
              {!isProcessing && (
                <>
                  <h2 className="text-3xl font-bold" style={{ color: '#11335d' }}>
                    Drop video files here or click to browse
                  </h2>
                  <p className="text-lg text-gray-600">
                    Drag and drop your files here or click to browse
                  </p>
                  
                  {/* Upload Button - Dark blue as shown in design */}
                  <button
                    onClick={handleUploadClick}
                    disabled={isProcessing}
                    className="inline-flex items-center px-6 py-3 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                      backgroundColor: '#11335d'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#0f2a4a';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#11335d';
                    }}
                  >
                    <Upload size={20} className="mr-2" />
                    Choose a file
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
            <div className={`mt-8 transition-all duration-500 ease-in-out ${hasUploadedVideo ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}`}>
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
              

              {/* Expanded Content Section */}
              {hasUploadedVideo && !showProcessingSteps && (
                <div className="mt-8 space-y-6">
                  {/* Video Details */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Video Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">File Name</p>
                        <p className="font-medium text-gray-800">{uploadedFiles[0]?.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">File Size</p>
                        <p className="font-medium text-gray-800">{(uploadedFiles[0]?.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">File Type</p>
                        <p className="font-medium text-gray-800">{uploadedFiles[0]?.type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Upload Time</p>
                        <p className="font-medium text-gray-800">{new Date().toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
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
      )}
      
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
        
        @keyframes fadeInFromBlue {
          0% {
            opacity: 0;
            transform: translateX(20px) scale(0.9);
            background-color: rgba(17, 51, 93, 0.8);
            color: rgba(17, 51, 93, 0.6);
          }
          30% {
            opacity: 0.6;
            transform: translateX(10px) scale(0.95);
            background-color: rgba(17, 51, 93, 0.4);
            color: rgba(17, 51, 93, 0.8);
          }
          60% {
            opacity: 0.8;
            transform: translateX(5px) scale(0.98);
            background-color: rgba(17, 51, 93, 0.2);
            color: rgba(17, 51, 93, 0.9);
          }
          100% {
            opacity: 1;
            transform: translateX(0) scale(1);
            background-color: white;
            color: #11335d;
          }
        }
        
        .step-fade-in {
          animation: fadeInFromBlue 1.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default VideoUploadPage;
