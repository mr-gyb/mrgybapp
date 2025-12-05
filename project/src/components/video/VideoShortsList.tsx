import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, RefreshCw, Play, ChevronLeft, Loader2 } from 'lucide-react';
import { VideoAnalysisResult } from '../../services/openaiService';
import { generateVideoShorts, VideoShort } from '../../services/shortVideoGeneration.service';

interface VideoShortsListProps {
  analysisResult: VideoAnalysisResult;
  onBack: () => void;
}

const VideoShortsList: React.FC<VideoShortsListProps> = ({ analysisResult, onBack }) => {
  const navigate = useNavigate();
  const [shorts, setShorts] = useState<VideoShort[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingIndex, setSavingIndex] = useState<number | null>(null);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    loadShorts();
  }, []);

  const loadShorts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Get transcript from analysis result
      const transcript = analysisResult.transcript || analysisResult.rawTranscript;
      
      if (!transcript) {
        throw new Error('No transcript available. Please ensure the video was transcribed.');
      }

      // Generate shorts using the new endpoint
      const result = await generateVideoShorts(transcript);
      
      if (result.success && result.shorts && result.shorts.length > 0) {
        setShorts(result.shorts);
        // Store in sessionStorage for persistence
        sessionStorage.setItem('generatedShorts', JSON.stringify(result.shorts));
      } else {
        throw new Error('No shorts were generated. Please try again.');
      }
    } catch (err) {
      console.error('Error loading shorts:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate video shorts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (short: VideoShort, index: number) => {
    setSavingIndex(index);
    
    try {
      // Get video file URL from sessionStorage
      const videoUrl = sessionStorage.getItem('uploadedVideoUrl');
      const videoName = sessionStorage.getItem('uploadedVideoName') || 'video';
      
      // Create short data
      const shortData = {
        id: `${Date.now()}-${index}`,
        title: short.title,
        hook: short.hook,
        description: short.description,
        start: short.start,
        end: short.end,
        url: videoUrl || '',
        createdAt: new Date().toISOString(),
        analysisResult,
      };

      // Save to localStorage
      const existingShorts = JSON.parse(localStorage.getItem('createdShorts') || '[]');
      existingShorts.push(shortData);
      localStorage.setItem('createdShorts', JSON.stringify(existingShorts));

      // Dispatch event to notify other components
      window.dispatchEvent(new Event('createdShortsUpdated'));

      // Show success message (you could use a toast here)
      alert(`"${short.title}" saved to Created Shorts!`);
    } catch (err) {
      console.error('Error saving short:', err);
      alert('Failed to save short. Please try again.');
    } finally {
      setSavingIndex(null);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    setError(null);
    
    try {
      await loadShorts();
    } catch (err) {
      console.error('Error regenerating shorts:', err);
      setError(err instanceof Error ? err.message : 'Failed to regenerate shorts');
    } finally {
      setRegenerating(false);
    }
  };

  const formatTime = (timeStr: string) => {
    // Format MM:SS to readable format
    const [minutes, seconds] = timeStr.split(':');
    return `${minutes}m ${seconds}s`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Generating Video Shorts</h2>
          <p className="text-gray-600">Analyzing your video transcript to find viral moments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
            <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleRegenerate}
                disabled={regenerating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {regenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </>
                )}
              </button>
              <button
                onClick={onBack}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Summary
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Generated Video Shorts</h1>
              <p className="text-gray-600">We found {shorts.length} viral-worthy moments in your video</p>
            </div>
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {regenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Regenerate
                </>
              )}
            </button>
          </div>
        </div>

        {/* Shorts List */}
        <div className="space-y-4">
          {shorts.map((short, index) => (
            <div
              key={index}
              className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-400 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Time Range */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded">
                      {short.start} - {short.end}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({formatTime(short.end)} - {formatTime(short.start)})
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{short.title}</h3>

                  {/* Hook */}
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-3 rounded">
                    <p className="text-sm font-semibold text-yellow-800 mb-1">Hook:</p>
                    <p className="text-gray-700 italic">"{short.hook}"</p>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 mb-4">{short.description}</p>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleSave(short, index)}
                      disabled={savingIndex === index}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      {savingIndex === index ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save to Created Shorts
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        // Navigate to created shorts page to view all saved shorts
                        navigate('/gyb-studio/created-shorts');
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      View All Shorts
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> Each short is optimized for TikTok, Instagram Reels, and YouTube Shorts. 
            Save the ones you like, then use video editing tools to extract these segments from your original video.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoShortsList;


