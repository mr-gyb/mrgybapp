import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Play, Clock, Users } from 'lucide-react';
import { VideoAnalysisResult } from '../services/openaiService';
// Try different import approaches
import summaryImage from './images/summary_page.jpg';

const SummaryPage: React.FC = () => {
  const navigate = useNavigate();
  const [analysisResult, setAnalysisResult] = useState<VideoAnalysisResult | null>(null);
  const [videoInfo, setVideoInfo] = useState<{
    name: string;
    size: string;
    type: string;
    processingTime?: string;
  } | null>(null);
  
  // Debug the image import
  console.log('Summary image path:', summaryImage);

  useEffect(() => {
    // Load analysis result from sessionStorage
    const storedAnalysis = sessionStorage.getItem('videoAnalysis');
    const videoName = sessionStorage.getItem('uploadedVideoName');
    const videoSize = sessionStorage.getItem('uploadedVideoSize');
    const videoType = sessionStorage.getItem('uploadedVideoType');
    const processingTimestamp = sessionStorage.getItem('processingTimestamp');

    if (storedAnalysis) {
      try {
        const analysis = JSON.parse(storedAnalysis);
        setAnalysisResult(analysis);
        console.log('Loaded analysis result:', analysis);
      } catch (error) {
        console.error('Error parsing analysis result:', error);
      }
    }

    if (videoName && videoSize && videoType) {
      const processingTime = processingTimestamp ? 
        new Date(processingTimestamp).toLocaleString() : 
        'Just now';
        
      // Decode URL-encoded video name
      const decodedName = decodeURIComponent(videoName.replace(/\+/g, ' '));
        
      setVideoInfo({
        name: decodedName,
        size: (parseInt(videoSize) / (1024 * 1024)).toFixed(2) + ' MB',
        type: videoType,
        processingTime
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate('/gyb-studio')}
            className="mr-4 text-navy-blue hover:text-blue-600 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold text-navy-blue">Video Analysis Summary</h1>
        </div>

        {/* Main Content Layout */}
        <div className="max-w-6xl mx-auto">
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            
            {/* Left Column - Video Thumbnail */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-black">uploaded video/thumbnail</h2>
              <div className="bg-gray-100 rounded-lg p-2">
                <img 
                  src={summaryImage}
                  alt="Video Thumbnail"
                  className="w-full h-auto object-contain rounded-lg"
                  onError={(e) => {
                    console.log('Image failed to load:', summaryImage);
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = '<div class="w-full h-64 bg-gray-300 rounded-lg flex items-center justify-center text-gray-600">Image not found</div>';
                  }}
                />
              </div>
            </div>

            {/* Right Column - Summary and Buttons */}
            <div className="space-y-6">
              {/* AI-Generated Summary */}
              {analysisResult ? (
                <div className="space-y-6">
                  {/* Video Info */}
                  {videoInfo && (
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <h3 className="font-semibold text-gray-800 mb-4 text-lg">Video Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-gray-600 text-sm font-medium">Name:</span>
                          <p className="font-medium text-gray-900 break-words">{videoInfo.name}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-gray-600 text-sm font-medium">Size:</span>
                          <p className="font-medium text-gray-900">{videoInfo.size}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-gray-600 text-sm font-medium">Duration:</span>
                          <p className="font-medium text-gray-900">
                            {analysisResult ? 
                              `${Math.floor(analysisResult.duration / 60)}:${(analysisResult.duration % 60).toString().padStart(2, '0')}` : 
                              'Calculating...'
                            }
                          </p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-gray-600 text-sm font-medium">Type:</span>
                          <p className="font-medium text-gray-900">{videoInfo.type}</p>
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <span className="text-gray-600 text-sm font-medium">Processed:</span>
                          <p className="font-medium text-gray-900">{videoInfo.processingTime}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Technical Information */}
                  {analysisResult.technicalInfo && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <h3 className="text-lg font-bold text-black mb-3">📊 Technical Information</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 font-medium">File Size:</span>
                          <p className="text-black">{analysisResult.technicalInfo.fileSize}</p>
                        </div>
                        <div>
                          <span className="text-gray-600 font-medium">Duration:</span>
                          <p className="text-black">{analysisResult.technicalInfo.duration}</p>
                        </div>
                        <div>
                          <span className="text-gray-600 font-medium">Quality:</span>
                          <p className="text-black">{analysisResult.technicalInfo.quality}</p>
                        </div>
                        <div>
                          <span className="text-gray-600 font-medium">Production:</span>
                          <p className="text-black">{analysisResult.technicalInfo.productionValues}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Main Theme */}
                  {analysisResult.mainTheme && (
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-black mb-3">🎯 Main Theme</h3>
                      <p className="text-lg text-black leading-relaxed bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                        {analysisResult.mainTheme}
                      </p>
                    </div>
                  )}

                  {/* AI Summary */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-black mb-3">📝 AI Analysis Summary</h3>
                    <p className="text-lg text-black leading-relaxed">{analysisResult.summary}</p>
                  </div>

                  {/* Key Lessons */}
                  {analysisResult.keyLessons && analysisResult.keyLessons.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-black mb-3">📚 Key Lessons</h3>
                      <div className="space-y-4">
                        {analysisResult.keyLessons.map((lesson, index) => (
                          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-blue-900">{lesson.heading}</h4>
                              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {lesson.timestamp}
                              </span>
                            </div>
                            <p className="text-gray-700">{lesson.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stories and Examples */}
                  {analysisResult.stories && analysisResult.stories.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-black mb-3">📖 Stories & Examples</h3>
                      <div className="space-y-4">
                        {analysisResult.stories.map((story, index) => (
                          <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <h4 className="font-semibold text-yellow-900 mb-2">{story.title}</h4>
                            <p className="text-gray-700 mb-2">{story.description}</p>
                            <p className="text-sm text-gray-600 italic">💡 {story.significance}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Practical Frameworks */}
                  {analysisResult.frameworks && analysisResult.frameworks.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-black mb-3">🛠️ Practical Frameworks</h3>
                      <div className="space-y-4">
                        {analysisResult.frameworks.map((framework, index) => (
                          <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h4 className="font-semibold text-green-900 mb-2">{framework.name}</h4>
                            <p className="text-gray-700 mb-3">{framework.description}</p>
                            <div className="space-y-2">
                              <h5 className="font-medium text-green-800">Steps:</h5>
                              <ol className="list-decimal list-inside space-y-1">
                                {framework.steps.map((step, stepIndex) => (
                                  <li key={stepIndex} className="text-gray-700">{step}</li>
                                ))}
                              </ol>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Call to Action */}
                  {analysisResult.callToAction && (
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-black mb-3">🎯 Call to Action</h3>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <p className="text-lg text-purple-900 font-medium">{analysisResult.callToAction}</p>
                      </div>
                    </div>
                  )}

                  {/* Key Points */}
                  {analysisResult.keyPoints && analysisResult.keyPoints.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-black mb-3">💡 Key Insights</h3>
                      <ul className="space-y-2">
                        {analysisResult.keyPoints.map((point, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-blue-600 mt-1">•</span>
                            <span className="text-black">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Suggested Shorts */}
                  {analysisResult.suggestedShorts && analysisResult.suggestedShorts.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-black mb-3">Suggested Short Videos</h3>
                      <div className="space-y-4">
                        {analysisResult.suggestedShorts.map((short, index) => (
                          <div key={index} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-blue-900">{short.title}</h4>
                              <div className="flex items-center space-x-2 text-sm text-blue-600">
                                <Clock size={16} />
                                <span>{short.startTime}s - {short.endTime}s</span>
                              </div>
                            </div>
                            <p className="text-gray-700 mb-2">{short.description}</p>
                            <p className="text-sm text-gray-600 italic">"{short.reasoning}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Fallback Summary Text */
                <div className="space-y-3">
                  <p className="text-lg text-black">Boost your product and service's credibility by adding testimonials from your clients.</p>
                  <p className="text-lg text-black">Boost your product and service's credibility by adding testimonials from your clients.</p>
                  <p className="text-lg text-black">Boost your product and service's credibility by adding testimonials from your clients.</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/gyb-studio')}
                  className="px-6 py-3 text-black font-semibold rounded-lg transition-colors flex items-center justify-center"
                  style={{ backgroundColor: '#e0c472' }}
                >
                  <Play size={20} className="mr-2" />
                  Generate Scripts
                </button>
                <button
                  onClick={() => navigate('/gyb-studio/create')}
                  className="px-6 py-3 text-white font-semibold rounded-lg transition-colors flex items-center justify-center"
                  style={{ 
                    background: 'linear-gradient(90deg, #11335d, #6b5b95)'
                  }}
                >
                  <Users size={20} className="mr-2" />
                  Create Short Videos
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryPage;