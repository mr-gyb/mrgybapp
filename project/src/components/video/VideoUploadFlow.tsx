import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Upload } from 'lucide-react';
import { openaiService, VideoAnalysisResult } from '../../services/openaiService';
import ProcessingSteps from './ProcessingSteps';
import ContentSummaryScreen from './ContentSummaryScreen';
import ShortVideoPlayer from './ShortVideoPlayer';

type ScreenState = 'upload' | 'processing' | 'summary' | 'script' | 'short';

const VideoUploadFlow: React.FC = () => {
  const navigate = useNavigate();
  const [screenState, setScreenState] = useState<ScreenState>('upload');
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<VideoAnalysisResult | null>(null);
  const [avatarVisible, setAvatarVisible] = useState(true);
  const [uploadBoxExpanded, setUploadBoxExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const validateVideoFile = (file: File): string | null => {
    // Check file type
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp4|webm|ogg|mov|avi)$/i)) {
      return 'Please upload a valid video file (MP4, WebM, OGG, MOV, or AVI)';
    }

    // Check file size (max 25MB for Whisper API)
    const maxSize = 25 * 1024 * 1024; // 25MB - Whisper API limit
    if (file.size > maxSize) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      return `Video file is too large (${fileSizeMB}MB). Maximum size is 25MB for transcription. Please compress or trim your video.`;
    }

    // Check minimum size (at least 1KB)
    if (file.size < 1024) {
      return 'Video file is too small or corrupted';
    }

    return null;
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const videoFile = files.find(file => file.type.startsWith('video/') || file.name.match(/\.(mp4|webm|ogg|mov|avi)$/i));
    
    if (videoFile) {
      // Validate file first
      const validationError = validateVideoFile(videoFile);
      if (validationError) {
        setProcessingError(validationError);
        return;
      }

      // Set uploaded file - this will trigger useEffect to animate and process
      setUploadedFile(videoFile);
    } else {
      setProcessingError('Please drop a valid video file');
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const videoFile = files.find(file => file.type.startsWith('video/') || file.name.match(/\.(mp4|webm|ogg|mov|avi)$/i));
    
    if (videoFile) {
      // Validate file first
      const validationError = validateVideoFile(videoFile);
      if (validationError) {
        setProcessingError(validationError);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      // Set uploaded file - this will trigger useEffect to animate and process
      setUploadedFile(videoFile);
    } else {
      setProcessingError('Please select a valid video file');
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleVideoUpload = useCallback(async (videoFile: File) => {
    if (isProcessing) return; // Prevent duplicate calls

    // Validate file
    const validationError = validateVideoFile(videoFile);
    if (validationError) {
      setProcessingError(validationError);
      return;
    }
    
    setIsProcessing(true);
    setProcessingError(null);
    setUploadedFile(videoFile);

    try {
      // Check if OpenAI is configured
      if (!openaiService.isConfigured()) {
        throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file and restart the server.');
      }

      // Process video - this will take time
      const result = await openaiService.analyzeVideo(videoFile);
      setAnalysisResult(result);
      
      // Store in sessionStorage for persistence
      sessionStorage.setItem('videoAnalysis', JSON.stringify(result));
      sessionStorage.setItem('uploadedVideoName', videoFile.name);
      sessionStorage.setItem('uploadedVideoSize', videoFile.size.toString());
      sessionStorage.setItem('uploadedVideoType', videoFile.type);
      
      // Store video file reference for short generation
      // Create a blob URL that can be used to reconstruct the file later
      const videoUrl = URL.createObjectURL(videoFile);
      sessionStorage.setItem('uploadedVideoUrl', videoUrl);
      sessionStorage.setItem('uploadedVideoFile', JSON.stringify({
        name: videoFile.name,
        size: videoFile.size,
        type: videoFile.type,
        url: videoUrl,
        lastModified: videoFile.lastModified || Date.now()
      }));
    } catch (error) {
      // Log full error details for debugging
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      const errorDetails = {
        message: errorMessage,
        name: error instanceof Error ? error.name : undefined,
        stack: error instanceof Error ? error.stack : undefined,
        cause: error instanceof Error ? (error as any).cause : undefined,
        status: (error as any)?.status,
        errorData: (error as any)?.errorData
      };
      
      // Only log non-quota errors (quota errors are handled in UI)
      if (!errorMessage.toLowerCase().includes('quota') && !errorMessage.toLowerCase().includes('insufficient_quota')) {
        console.error('❌ Error processing video - full details:', errorDetails);
      } else {
        console.warn('⚠️ Video upload quota error - error displayed in UI');
      }
      
      // Check error type from backend response
      const errorData = (error as any)?.errorData || {};
      const errorType = errorData.errorType || '';
      const isBillingQuota = errorType === 'billing_quota' || errorType === 'quota';
      const isRateLimit = errorType === 'rate_limit' || errorType === 'rate_limit_tpd' || errorType === 'rate_limit_exceeded';
      
      // Fallback to message parsing if errorType not available
      const errorMsgLower = errorMessage.toLowerCase();
      const isQuotaFromMsg = errorMsgLower.includes('quota') || 
                            errorMsgLower.includes('insufficient_quota');
      const isBillingFromMsg = errorMsgLower.includes('billing') || 
                               errorMsgLower.includes('payment') || 
                               errorMsgLower.includes('plan');
      const isRateLimitFromMsg = errorMsgLower.includes('rate limit') || 
                                errorMsgLower.includes('tpd') || 
                                errorMsgLower.includes('tpm') || 
                                errorMsgLower.includes('rpm');
      
      const isNetworkError = errorMsgLower.includes('network error') ||
                            errorMsgLower.includes('fetch failed') ||
                            errorMsgLower.includes('unable to connect');
      
      const isFileError = errorMsgLower.includes('too large') ||
                         errorMsgLower.includes('file is empty') ||
                         errorMsgLower.includes('unsupported');
      
      let displayMessage = errorMessage;
      
      if (isBillingQuota || (isQuotaFromMsg && isBillingFromMsg)) {
        displayMessage = 'Your OpenAI billing quota is depleted. Check your billing at https://platform.openai.com/account/billing';
      } else if (isRateLimit || (isQuotaFromMsg && isRateLimitFromMsg)) {
        displayMessage = 'You\'ve reached your OpenAI usage limits (TPM/RPM/TPD). Please wait for your limits to reset and try again later.';
      } else if (isNetworkError) {
        displayMessage = 'Network error: Unable to connect to the server. Please check your internet connection and ensure the backend server is running.';
      } else if (isFileError) {
        displayMessage = errorMessage; // File errors are already user-friendly
      } else if (errorMessage.includes('timeout')) {
        displayMessage = 'Request timed out. The video file may be too large. Please try a shorter video or compress the file.';
      } else {
        // Generic error - provide helpful context
        displayMessage = `Video processing failed: ${errorMessage}. Please try again or contact support if the issue persists.`;
      }
      
      setProcessingError(displayMessage);
      // Reset to upload screen on error
      setScreenState('upload');
      setUploadedFile(null);
      setAvatarVisible(true);
      setUploadBoxExpanded(false);
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing]);

  const handleProcessingComplete = useCallback(() => {
    // ProcessingSteps animation completed - but actual processing might still be running
    // Don't move to summary yet - wait for analysisResult via useEffect
    console.log('📊 ProcessingSteps animation complete, waiting for analysis result...');
    // The useEffect above will handle moving to summary when analysisResult is ready
  }, []);

  const handleGenerateScript = () => {
    setScreenState('script');
  };

  const handleCreateShort = () => {
    setScreenState('short');
  };

  // Animate avatar out and transition to processing when video is uploaded
  useEffect(() => {
    if (uploadedFile && screenState === 'upload' && !isProcessing) {
      setAvatarVisible(false);
      setUploadBoxExpanded(true);
      setTimeout(() => {
        setScreenState('processing');
      }, 500);
    }
  }, [uploadedFile, screenState, isProcessing]);

  // Ensure video processing happens when we enter processing state
  useEffect(() => {
    if (screenState === 'processing' && uploadedFile && !analysisResult && !isProcessing && !processingError) {
      console.log('🚀 Starting video upload processing...');
      handleVideoUpload(uploadedFile);
    }
  }, [screenState, uploadedFile, analysisResult, isProcessing, processingError, handleVideoUpload]);

  // When processing completes and we have analysis result, move to summary
  useEffect(() => {
    if (screenState === 'processing' && analysisResult && !isProcessing) {
      console.log('✅ Video processing complete, moving to summary screen');
      // Wait a moment for ProcessingSteps to finish animation, then move to summary
      setTimeout(() => {
        setScreenState('summary');
      }, 1000);
    }
  }, [screenState, analysisResult, isProcessing]);

  // Upload Screen
  if (screenState === 'upload') {
    return (
      <div className="min-h-screen bg-white">
        {/* Avatar - animates up and fades out */}
        <div
          className={`py-12 transition-all duration-700 ease-in-out ${
            avatarVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-20 h-0 overflow-hidden'
          }`}
        >
          <div className="container mx-auto px-4">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-opacity-20" style={{ borderColor: '#11335d' }}>
                  <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'white' }}>
                    <img 
                      src="/images/team/mrgyb-ai.png"
                      alt="Mr. GYB AI"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-black text-2xl font-bold">GYB</div>';
                      }}
                    />
                  </div>
                </div>
                <div className="absolute inset-0 rounded-2xl border-2 border-yellow-400 pointer-events-none"></div>
              </div>
            </div>
          </div>
        </div>

            {/* Upload Box - expands vertically */}
            <div className="container mx-auto px-4 pb-12">
              <div className={`max-w-4xl mx-auto transition-all duration-700 ease-in-out ${
                uploadBoxExpanded ? 'max-w-6xl' : 'max-w-4xl'
              }`}>
                {/* Error Message */}
                {processingError && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 text-sm mb-2">{processingError}</p>
                    {processingError.toLowerCase().includes('quota') && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                        <p className="text-yellow-800 font-semibold mb-1">How to fix:</p>
                        <ul className="list-disc list-inside text-yellow-700 space-y-1">
                          <li>Check your OpenAI account billing and plan at <a href="https://platform.openai.com/account/billing" target="_blank" rel="noopener noreferrer" className="underline">platform.openai.com/account/billing</a></li>
                          <li>Ensure you have available credits or a valid payment method</li>
                          <li>Wait for your quota to reset if you've hit rate limits</li>
                        </ul>
                      </div>
                    )}
                    <button
                      onClick={() => {
                        setProcessingError(null);
                        setScreenState('upload');
                        setUploadedFile(null);
                        setAvatarVisible(true);
                        setUploadBoxExpanded(false);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                    >
                      Try again
                    </button>
                  </div>
                )}

                <div
                  className={`relative border-2 border-dashed rounded-2xl text-center transition-all duration-700 ease-in-out ${
                    isDragOver ? 'bg-gray-50' : 'bg-white'
                  } ${uploadBoxExpanded ? 'p-8' : 'p-12'}`}
                  style={{ borderColor: processingError ? '#ef4444' : '#ef4444' }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
              {/* Red Video Icon */}
              <div className="flex justify-center mb-6">
                <Video size={48} className="text-red-500" />
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl font-bold" style={{ color: '#11335d' }}>
                  Drop video files here or click to browse
                </h2>
                
                <button
                  onClick={handleUploadClick}
                  disabled={isProcessing}
                  className="inline-flex items-center px-6 py-3 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50"
                  style={{ backgroundColor: '#11335d' }}
                >
                  <Upload size={20} className="mr-2" />
                  Choose a file
                </button>
              </div>

              {processingError && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">{processingError}</p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Processing Screen
  if (screenState === 'processing') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-full">
          <ProcessingSteps onComplete={handleProcessingComplete} />
          {/* Show processing status */}
          {isProcessing && (
            <div className="mt-8 text-center">
              <p className="text-gray-600">Processing your video... This may take a few minutes.</p>
            </div>
          )}
          {processingError && (
            <div className="mt-8 max-w-2xl mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{processingError}</p>
                <button
                  onClick={() => {
                    setProcessingError(null);
                    setScreenState('upload');
                    setUploadedFile(null);
                    setAnalysisResult(null);
                    setAvatarVisible(true);
                    setUploadBoxExpanded(false);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
                >
                  Try again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Summary Screen
  if (screenState === 'summary' && analysisResult) {
    return (
      <ContentSummaryScreen
        analysisResult={analysisResult}
        onGenerateScript={handleGenerateScript}
        onCreateShort={handleCreateShort}
      />
    );
  }

  // Script Screen (handled by ContentSummaryScreen)
  if (screenState === 'script' && analysisResult) {
    return (
      <ContentSummaryScreen
        analysisResult={analysisResult}
        onGenerateScript={handleGenerateScript}
        onCreateShort={handleCreateShort}
        showScript={true}
      />
    );
  }

  // Short Screen (handled by ShortVideoPlayer)
  if (screenState === 'short' && analysisResult) {
    return (
      <ShortVideoPlayer
        analysisResult={analysisResult}
        onBack={() => setScreenState('summary')}
      />
    );
  }

  // Fallback
  return null;
};

export default VideoUploadFlow;

