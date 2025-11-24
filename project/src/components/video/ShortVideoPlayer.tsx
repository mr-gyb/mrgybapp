import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, Play, Download } from 'lucide-react';
import { VideoAnalysisResult } from '../../services/openaiService';
import { generateShortVideo } from '../../services/shortVideoGeneration.service';

interface ShortVideoPlayerProps {
  analysisResult: VideoAnalysisResult;
  onBack: () => void;
}

const ShortVideoPlayer: React.FC<ShortVideoPlayerProps> = ({ analysisResult, onBack }) => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(true);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get video file from sessionStorage if available
    const getVideoFile = async (): Promise<File | undefined> => {
      const videoFileData = sessionStorage.getItem('uploadedVideoFile');
      if (!videoFileData) return undefined;

      try {
        const fileData = JSON.parse(videoFileData);
        // Try to reconstruct file from URL if available
        if (fileData.url) {
          try {
            const response = await fetch(fileData.url);
            if (!response.ok) throw new Error('Failed to fetch video');
            const blob = await response.blob();
            return new File([blob], fileData.name || 'video.mp4', { 
              type: fileData.type || blob.type || 'video/mp4' 
            });
          } catch (fetchError) {
            console.warn('Could not fetch video from URL, will use fallback:', fetchError);
            return undefined;
          }
        }
      } catch (error) {
        console.warn('Could not parse video file data:', error);
      }
      return undefined;
    };

    // Generate short video
    const generateShort = async () => {
      try {
        const videoFile = await getVideoFile();
        const url = await generateShortVideo(analysisResult, videoFile);
        setVideoUrl(url);
        setIsGenerating(false);
      } catch (err) {
        console.error('Error generating short:', err);
        setError(err instanceof Error ? err.message : 'Failed to generate short video');
        setIsGenerating(false);
      }
    };

    generateShort();
  }, [analysisResult]);

  const handleThumbsUp = () => {
    // Save to Created Shorts
    const shortData = {
      id: Date.now().toString(),
      title: `Short from ${sessionStorage.getItem('uploadedVideoName') || 'video'}`,
      url: videoUrl!,
      createdAt: new Date().toISOString(),
      analysisResult
    };

    const existingShorts = JSON.parse(localStorage.getItem('createdShorts') || '[]');
    existingShorts.push(shortData);
    localStorage.setItem('createdShorts', JSON.stringify(existingShorts));

    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('createdShortsUpdated'));

    // Navigate to Created Shorts page
    navigate('/gyb-studio/created-shorts');
  };

  const handleThumbsDown = async () => {
    // Regenerate video
    setIsGenerating(true);
    setError(null);
    setVideoUrl(null);

    try {
      // Get video file from sessionStorage
      let videoFile: File | undefined = undefined;
      const videoFileData = sessionStorage.getItem('uploadedVideoFile');
      if (videoFileData) {
        try {
          const fileData = JSON.parse(videoFileData);
          if (fileData.url) {
            const response = await fetch(fileData.url);
            if (response.ok) {
              const blob = await response.blob();
              videoFile = new File([blob], fileData.name || 'video.mp4', { 
                type: fileData.type || blob.type || 'video/mp4' 
              });
            }
          }
        } catch (error) {
          console.warn('Could not reconstruct video file, using fallback:', error);
        }
      }
      
      const url = await generateShortVideo(analysisResult, videoFile);
      setVideoUrl(url);
      setIsGenerating(false);
    } catch (err) {
      console.error('Error regenerating short:', err);
      setError(err instanceof Error ? err.message : 'Failed to regenerate');
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (videoUrl) {
      const link = document.createElement('a');
      link.href = videoUrl;
      link.download = `short-${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Processing State: Avatar at Top with Spinning Circle */}
            {isGenerating && (
              <div className="w-full flex flex-col items-center justify-center py-20">
                {/* Avatar at Top */}
                <div className="mb-8 transition-all duration-700">
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

                {/* Spinning Circle */}
                <div className="relative w-20 h-20 mb-6">
                  <div className="absolute inset-0 border-4 border-navy-blue border-t-transparent rounded-full animate-spin" style={{ borderColor: '#11335d' }}></div>
                  <div className="absolute inset-0 border-4 border-yellow-400 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                </div>

                {/* Text */}
                <p className="text-xl text-gray-700 font-medium">Sit tight while I work my magic...</p>
              </div>
            )}

            {/* Video Player - Right (when not generating) */}
            {!isGenerating && (
              <div className="w-full lg:col-span-3">
                {error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <p className="text-red-800 mb-4">{error}</p>
                    <div className="flex gap-4">
                      <button
                        onClick={onBack}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Go Back
                      </button>
                      <button
                      onClick={async () => {
                        setIsGenerating(true);
                        setError(null);
                        setVideoUrl(null);
                        try {
                          let videoFile: File | undefined = undefined;
                          const videoFileData = sessionStorage.getItem('uploadedVideoFile');
                          if (videoFileData) {
                            try {
                              const fileData = JSON.parse(videoFileData);
                              if (fileData.url) {
                                const response = await fetch(fileData.url);
                                if (response.ok) {
                                  const blob = await response.blob();
                                  videoFile = new File([blob], fileData.name || 'video.mp4', { 
                                    type: fileData.type || blob.type || 'video/mp4' 
                                  });
                                }
                              }
                            } catch (error) {
                              console.warn('Could not reconstruct video file, using fallback:', error);
                            }
                          }
                          const url = await generateShortVideo(analysisResult, videoFile);
                          setVideoUrl(url);
                          setIsGenerating(false);
                        } catch (err) {
                          setError(err instanceof Error ? err.message : 'Failed to regenerate');
                          setIsGenerating(false);
                        }
                      }}
                        className="px-4 py-2 bg-navy-blue text-white rounded-lg hover:bg-opacity-90 transition-colors"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                ) : videoUrl ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Avatar - Left */}
                    <div className="flex justify-start">
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

                    {/* Video Player - Right */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Video Player */}
                      <div className="relative bg-gray-900 rounded-2xl overflow-hidden" style={{ aspectRatio: '9/16', maxWidth: '400px' }}>
                        <video
                          src={videoUrl}
                          controls
                          className="w-full h-full object-contain"
                        />
                        <button
                          onClick={handleDownload}
                          className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                          title="Download video"
                        >
                          <Download size={20} className="text-navy-blue" />
                        </button>
                      </div>

                      {/* Feedback Buttons */}
                      <div className="flex gap-4 justify-center">
                        <button
                          onClick={handleThumbsUp}
                          className="p-4 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors shadow-lg"
                          title="Save to Created Shorts"
                        >
                          <ThumbsUp size={24} />
                        </button>
                        <button
                          onClick={handleThumbsDown}
                          className="p-4 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors shadow-lg"
                          title="Generate new version"
                        >
                          <ThumbsDown size={24} />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShortVideoPlayer;

