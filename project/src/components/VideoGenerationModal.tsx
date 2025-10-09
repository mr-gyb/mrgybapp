import React, { useState, useEffect } from 'react';
import { X, ThumbsUp, ThumbsDown, Download, RefreshCw } from 'lucide-react';
import { videoConversionService, VideoConversionResult, ShortVideoSegment } from '../services/videoConversionService';

interface VideoGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisResult: any;
  onSaveToShorts: (videoData: any) => void;
}

const VideoGenerationModal: React.FC<VideoGenerationModalProps> = ({
  isOpen,
  onClose,
  analysisResult,
  onSaveToShorts
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [logoPosition, setLogoPosition] = useState<'top' | 'center'>('center');
  const [showCircle, setShowCircle] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [regenerationCount, setRegenerationCount] = useState(0);
  const [conversionResult, setConversionResult] = useState<VideoConversionResult | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<ShortVideoSegment | null>(null);
  const [showSegments, setShowSegments] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setGeneratedVideo(null);
      setShowFeedback(false);
      setLogoPosition('center');
      setShowCircle(false);
      setFeedback('');
      setRegenerationCount(0);
      setConversionResult(null);
      setSelectedSegment(null);
      setShowSegments(false);
    }
  }, [isOpen]);

  // Handle logo animation
  useEffect(() => {
    if (isGenerating) {
      // Start logo animation sequence
      const timer1 = setTimeout(() => {
        setLogoPosition('top');
      }, 1000);

      const timer2 = setTimeout(() => {
        setShowCircle(true);
      }, 1500);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [isGenerating]);

  const handleCreateVideo = async () => {
    setIsGenerating(true);
    
    try {
      // Check if video conversion service is configured
      if (!videoConversionService.isConfigured()) {
        console.warn('Video conversion service not configured');
        // Fallback to mock generation
        setTimeout(() => {
          const mockVideoUrl = 'https://firebasestorage.googleapis.com/v0/b/mr-gyb-ai-app-108.firebasestorage.app/o/profile-images%2FMr.GYB_AI.png?alt=media&token=40ed698e-e2d0-45ff-b33a-508683c51a58';
          setGeneratedVideo(mockVideoUrl);
          setIsGenerating(false);
          setShowFeedback(true);
        }, 3000);
        return;
      }

      // Create a mock video file for conversion (in real implementation, this would be the actual video file)
      const mockVideoFile = new File(['mock video content'], 'video.mp4', { type: 'video/mp4' });
      
      // Convert long video to shorts using OpenAI
      const result = await videoConversionService.convertLongVideoToShorts(
        mockVideoFile,
        analysisResult,
        {
          maxDuration: 60,
          minDuration: 15,
          targetCount: 5,
          style: 'educational',
          tone: 'professional'
        }
      );

      setConversionResult(result);
      setSelectedSegment(result.bestSegment);
      setGeneratedVideo('https://firebasestorage.googleapis.com/v0/b/mr-gyb-ai-app-108.firebasestorage.app/o/profile-images%2FMr.GYB_AI.png?alt=media&token=40ed698e-e2d0-45ff-b33a-508683c51a58');
      setIsGenerating(false);
      setShowFeedback(true);
      setShowSegments(true);
      
      console.log('✅ Video conversion completed:', result);
      
    } catch (error) {
      console.error('❌ Error converting video:', error);
      setIsGenerating(false);
      
      // Fallback to mock generation on error
      setTimeout(() => {
        const mockVideoUrl = 'https://firebasestorage.googleapis.com/v0/b/mr-gyb-ai-app-108.firebasestorage.app/o/profile-images%2FMr.GYB_AI.png?alt=media&token=40ed698e-e2d0-45ff-b33a-508683c51a58';
        setGeneratedVideo(mockVideoUrl);
        setShowFeedback(true);
      }, 1000);
    }
  };

  const handleThumbsUp = () => {
    if (generatedVideo && selectedSegment) {
      const videoData = {
        id: selectedSegment.id,
        title: selectedSegment.title,
        url: generatedVideo,
        createdAt: new Date().toISOString(),
        analysisResult: analysisResult,
        segment: selectedSegment,
        conversionResult: conversionResult
      };
      onSaveToShorts(videoData);
      onClose();
    }
  };

  const handleThumbsDown = () => {
    setShowFeedback(true);
  };

  const handleFeedbackSubmit = () => {
    if (feedback.trim()) {
      setRegenerationCount(prev => prev + 1);
      setShowFeedback(false);
      setFeedback('');
      handleCreateVideo();
    }
  };

  const handleRegenerate = () => {
    setRegenerationCount(prev => prev + 1);
    setShowFeedback(false);
    setFeedback('');
    handleCreateVideo();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-navy-blue">Create Short Video</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Video Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-black">Video Preview</h3>
            
            {/* Logo Animation Container */}
            <div className="relative bg-gray-100 rounded-lg p-4 h-64 flex items-center justify-center">
              {/* Animated Logo */}
              <div 
                className={`transition-all duration-1000 ease-in-out ${
                  logoPosition === 'top' ? 'absolute top-4 left-4' : 'relative'
                }`}
              >
                <img 
                  src="https://firebasestorage.googleapis.com/v0/b/mr-gyb-ai-app-108.firebasestorage.app/o/profile-images%2FMr.GYB_AI.png?alt=media&token=40ed698e-e2d0-45ff-b33a-508683c51a58"
                  alt="GYB Logo"
                  className="w-16 h-16 object-contain"
                />
              </div>

              {/* Circle Animation */}
              {showCircle && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-32 h-32 border-4 border-blue-500 rounded-full animate-pulse"></div>
                </div>
              )}

              {/* Video Player Placeholder */}
              {generatedVideo && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black rounded-lg w-full h-full flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <div className="w-0 h-0 border-l-8 border-l-white border-y-4 border-y-transparent ml-1"></div>
                      </div>
                      <p className="text-sm">Generated Video</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {isGenerating && !generatedVideo && (
                <div className="text-center">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
                  <p className="text-sm text-gray-600">Generating your short video...</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {!isGenerating && !generatedVideo && (
              <button
                onClick={handleCreateVideo}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              >
                Generate Short Video
              </button>
            )}

            {/* Feedback Buttons */}
            {showFeedback && generatedVideo && (
              <div className="space-y-4">
                <div className="flex gap-4">
                  <button
                    onClick={handleThumbsUp}
                    className="flex-1 bg-green-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <ThumbsUp size={20} />
                    Save to Created Shorts
                  </button>
                  <button
                    onClick={handleThumbsDown}
                    className="flex-1 bg-red-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <ThumbsDown size={20} />
                    Regenerate
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Video Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-black">Video Details</h3>
            
            {analysisResult && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Based on Analysis:</h4>
                  <p className="text-sm text-gray-700">{analysisResult.summary}</p>
                </div>

                {analysisResult.keyPoints && analysisResult.keyPoints.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">Key Points:</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {analysisResult.keyPoints.slice(0, 3).map((point: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Generated Short Segments */}
            {showSegments && conversionResult && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-3">Generated Short Video Segments</h4>
                <div className="space-y-3">
                  {conversionResult.shortSegments.map((segment, index) => (
                    <div 
                      key={segment.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedSegment?.id === segment.id 
                          ? 'bg-blue-100 border-blue-300' 
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedSegment(segment)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{segment.title}</h5>
                          <p className="text-sm text-gray-600 mt-1">{segment.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>Duration: {segment.duration}s</span>
                            <span>Score: {segment.engagementScore}/10</span>
                            <span>{segment.startTime}s - {segment.endTime}s</span>
                          </div>
                        </div>
                        {selectedSegment?.id === segment.id && (
                          <div className="text-blue-600">✓</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-sm text-green-800">
                  <strong>Conversion Summary:</strong> {conversionResult.conversionSummary}
                </div>
              </div>
            )}

            {/* Selected Segment Details */}
            {selectedSegment && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3">Selected Segment: {selectedSegment.title}</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Description:</strong> {selectedSegment.description}</p>
                  <p><strong>Reasoning:</strong> {selectedSegment.reasoning}</p>
                  <p><strong>Engagement Score:</strong> {selectedSegment.engagementScore}/10</p>
                  <div className="mt-3">
                    <strong>Script Preview:</strong>
                    <div className="bg-white border border-blue-200 rounded p-2 mt-1 text-xs">
                      {selectedSegment.script.substring(0, 200)}...
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Feedback Form */}
            {showFeedback && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-semibold text-orange-900 mb-2">What's the issue?</h4>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Describe what you'd like to change about the video..."
                  className="w-full p-3 border border-orange-200 rounded-lg resize-none h-24 text-sm"
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleFeedbackSubmit}
                    disabled={!feedback.trim()}
                    className="bg-orange-500 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Regenerate with Feedback
                  </button>
                  <button
                    onClick={handleRegenerate}
                    className="bg-gray-500 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-gray-600 transition-colors"
                  >
                    Regenerate Anyway
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoGenerationModal;
