import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { VideoAnalysisResult } from '../services/openaiService';
import VideoGenerationModal from './VideoGenerationModal';
import CreatedShortsSection from './CreatedShortsSection';
// Use Firebase Storage URL for Mr. GYB AI image
const summaryImage = 'https://firebasestorage.googleapis.com/v0/b/mr-gyb-ai-app-108.firebasestorage.app/o/profile-images%2FMr.GYB_AI.png?alt=media&token=40ed698e-e2d0-45ff-b33a-508683c51a58';

interface CreatedShort {
  id: string;
  title: string;
  url: string;
  createdAt: string;
  analysisResult?: any;
}

const SummaryPage: React.FC = () => {
  const navigate = useNavigate();
  const [analysisResult, setAnalysisResult] = useState<VideoAnalysisResult | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [createdShorts, setCreatedShorts] = useState<CreatedShort[]>([]);
  
  // Debug the image import
  console.log('Summary image path:', summaryImage);

  // Function to load analysis data
  const loadAnalysisData = useCallback(() => {
    // Debug: Check what's in sessionStorage
    console.log('🔍 Debugging SummaryPage - Checking sessionStorage...');
    console.log('All sessionStorage keys:', Object.keys(sessionStorage));
    console.log('videoAnalysis key exists:', sessionStorage.getItem('videoAnalysis') !== null);
    
    // Load analysis result from sessionStorage
    const storedAnalysis = sessionStorage.getItem('videoAnalysis');
    const analysisTimestamp = sessionStorage.getItem('analysisTimestamp');
    
    console.log('📅 Analysis timestamp:', analysisTimestamp);

    if (storedAnalysis) {
      try {
        const analysis = JSON.parse(storedAnalysis);
        setAnalysisResult(analysis);
        console.log('✅ Loaded analysis result:', analysis);
        console.log('📅 Analysis timestamp:', analysisTimestamp);
        console.log('📝 Summary:', analysis.summary?.substring(0, 100) + '...');
        
        // Check if this is a long video that should auto-convert to shorts
        const isLongVideo = sessionStorage.getItem('isLongVideo') === 'true';
        const shouldAutoConvert = sessionStorage.getItem('shouldAutoConvert') === 'true';
        const autoConvertShorts = sessionStorage.getItem('autoConvertShorts') === 'true';
        
        console.log('Video analysis flags:', { isLongVideo, shouldAutoConvert, autoConvertShorts });
        
        // If it's a long video with suggested shorts, show conversion notification
        if (isLongVideo && analysis.suggestedShorts && analysis.suggestedShorts.length > 0) {
          console.log('🎬 Long video detected with', analysis.suggestedShorts.length, 'suggested short segments');
        }
      } catch (error) {
        console.error('❌ Error parsing analysis result:', error);
        setAnalysisResult(null);
      }
    } else {
      console.log('❌ No videoAnalysis found in sessionStorage');
      setAnalysisResult(null);
    }

    // Load created shorts from localStorage
    const storedShorts = localStorage.getItem('createdShorts');
    if (storedShorts) {
      try {
        setCreatedShorts(JSON.parse(storedShorts));
      } catch (error) {
        console.error('Error parsing created shorts:', error);
      }
    }
  }, []);

  // Load analysis data on mount and when component becomes visible
  useEffect(() => {
    loadAnalysisData();
    
    // Reload when page becomes visible (user navigates back to this page)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Page became visible, checking for new analysis data...');
        loadAnalysisData();
      }
    };
    
    // Reload when window gains focus (user switches back to this tab)
    const handleFocus = () => {
      console.log('🎯 Window gained focus, checking for new analysis data...');
      loadAnalysisData();
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadAnalysisData]);

  // Listen for storage events and check periodically for updates
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'videoAnalysis' || e.key === 'analysisTimestamp') {
        console.log('🔄 Detected new video analysis data via storage event, reloading...');
        loadAnalysisData();
      }
    };

    // Listen for storage events (works when data is updated from another tab/window)
    window.addEventListener('storage', handleStorageChange);

    // Also check periodically for updates (in case storage event doesn't fire in same tab)
    const checkInterval = setInterval(() => {
      const currentTimestamp = sessionStorage.getItem('analysisTimestamp');
      const lastTimestamp = sessionStorage.getItem('lastLoadedTimestamp');
      
      if (currentTimestamp && currentTimestamp !== lastTimestamp) {
        console.log('🔄 Detected new analysis timestamp, reloading...');
        sessionStorage.setItem('lastLoadedTimestamp', currentTimestamp);
        loadAnalysisData();
      }
    }, 1000); // Check every second

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(checkInterval);
    };
  }, [loadAnalysisData]);

  const handleSaveToShorts = (videoData: CreatedShort) => {
    const updatedShorts = [...createdShorts, videoData];
    setCreatedShorts(updatedShorts);
    localStorage.setItem('createdShorts', JSON.stringify(updatedShorts));
  };

  const handleDeleteShort = (id: string) => {
    const updatedShorts = createdShorts.filter(short => short.id !== id);
    setCreatedShorts(updatedShorts);
    localStorage.setItem('createdShorts', JSON.stringify(updatedShorts));
  };

  const handleDownloadShort = (short: CreatedShort) => {
    // Create a download link
    const link = document.createElement('a');
    link.href = short.url;
    link.download = `${short.title}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
               
               {/* Action Buttons */}
               <div className="flex flex-col sm:flex-row gap-4">
                 <button
                   onClick={() => navigate('/gyb-studio/create')}
                   className="px-6 py-3 text-black font-semibold rounded-lg transition-colors flex items-center justify-center"
                   style={{ backgroundColor: '#e0c472' }}
                 >
                   Generate Scripts
                 </button>
                 <button
                   onClick={() => navigate('/gyb-studio/create')}
                   className="px-6 py-3 text-white font-semibold rounded-lg transition-colors flex items-center justify-center"
                   style={{ 
                     background: 'linear-gradient(90deg, #11335d, #6b5b95)'
                   }}
                 >
                   Create Short Videos
                 </button>
               </div>
             </div>

            {/* Right Column - Summary and Buttons */}
            <div className="space-y-6">

              {/* AI-Generated Summary */}
              {analysisResult ? (
                <div className="space-y-6">
                  {/* Video Analysis Header */}
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-black mb-2">Video Analysis Results</h2>
                    <p className="text-gray-600">AI-powered analysis of your uploaded video</p>
                  </div>

                  {/* Summary */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-black mb-3">📝 Summary</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <p className="text-lg text-black leading-relaxed">
                        {analysisResult.summary || 'No summary available'}
                      </p>
                    </div>
                  </div>

                  {/* Key Points */}
                  {analysisResult.keyPoints && analysisResult.keyPoints.length > 0 && (
                  <div className="mb-6">
                      <h3 className="text-xl font-bold text-black mb-3">🔑 Key Points</h3>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                        <ul className="space-y-3">
                          {analysisResult.keyPoints.map((point, index) => (
                            <li key={index} className="flex items-start space-x-3">
                              <span className="text-purple-600 mt-1 font-bold">{index + 1}.</span>
                              <span className="text-lg text-black leading-relaxed">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Main Theme */}
                  {analysisResult.mainTheme && (
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-black mb-3">🎯 Main Theme</h3>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <p className="text-lg text-black leading-relaxed">{analysisResult.mainTheme}</p>
                      </div>
                    </div>
                  )}

                  {/* Technical Info */}
                  {analysisResult.technicalInfo && (
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-black mb-3">⚙️ Technical Information</h3>
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                        <div className="grid grid-cols-2 gap-4">
                          {analysisResult.technicalInfo.fileSize && (
                            <div>
                              <p className="text-sm text-gray-600">File Size</p>
                              <p className="font-medium text-black">{analysisResult.technicalInfo.fileSize}</p>
                            </div>
                          )}
                          {analysisResult.technicalInfo.duration && (
                            <div>
                              <p className="text-sm text-gray-600">Duration</p>
                              <p className="font-medium text-black">{analysisResult.technicalInfo.duration}</p>
                            </div>
                          )}
                          {analysisResult.technicalInfo.quality && (
                            <div>
                              <p className="text-sm text-gray-600">Quality</p>
                              <p className="font-medium text-black">{analysisResult.technicalInfo.quality}</p>
                            </div>
                          )}
                          {analysisResult.technicalInfo.productionValues && (
                            <div>
                              <p className="text-sm text-gray-600">Production Values</p>
                              <p className="font-medium text-black">{analysisResult.technicalInfo.productionValues}</p>
                            </div>
                          )}
                        </div>
                          </div>
                        </div>
                      )}

                  {/* Actionable Suggestions */}
                  {analysisResult.actionableSuggestions && analysisResult.actionableSuggestions.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-black mb-3">💡 Actionable Suggestions</h3>
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                        <div className="space-y-4">
                          {analysisResult.actionableSuggestions.map((suggestion, index) => (
                            <div key={index} className="bg-white border border-orange-200 rounded-lg p-4">
                              <h4 className="font-semibold text-orange-900 mb-2">{suggestion.title}</h4>
                              <p className="text-gray-700 mb-2">{suggestion.description}</p>
                              {suggestion.impact && (
                                <p className="text-sm text-orange-700">
                                  <span className="font-medium">Impact: </span>{suggestion.impact}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Suggested Edits */}
                  {analysisResult.suggestedEdits && analysisResult.suggestedEdits.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-black mb-3">✏️ Suggested Edits</h3>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <div className="space-y-4">
                          {analysisResult.suggestedEdits.map((edit, index) => (
                            <div key={index} className="bg-white border border-yellow-200 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold text-yellow-900">{edit.title}</h4>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  edit.priority === 'high' 
                                    ? 'bg-red-100 text-red-800' 
                                    : edit.priority === 'medium'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {edit.priority?.toUpperCase() || 'MEDIUM'} PRIORITY
                                </span>
                              </div>
                              <p className="text-gray-700 mb-2">{edit.description}</p>
                              {edit.reasoning && (
                                <p className="text-sm text-yellow-700">
                                  <span className="font-medium">Reasoning: </span>{edit.reasoning}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                    </div>
                  </div>
                  )}

                  {/* Suggested Shorts */}
                  {analysisResult.suggestedShorts && analysisResult.suggestedShorts.length > 0 && (
                  <div className="mb-6">
                      <h3 className="text-xl font-bold text-black mb-3">🎬 Suggested Short Video Segments</h3>
                      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                    <div className="space-y-4">
                          {analysisResult.suggestedShorts.map((short, index) => (
                            <div key={index} className="bg-white border border-indigo-200 rounded-lg p-4">
                              <h4 className="font-semibold text-indigo-900 mb-2">{short.title}</h4>
                              <p className="text-gray-700 mb-2">{short.description}</p>
                              <div className="flex items-center space-x-4 text-sm text-indigo-700">
                                <span>⏱️ {Math.floor(short.startTime)}s - {Math.floor(short.endTime)}s</span>
                                <span>Duration: {Math.floor(short.endTime - short.startTime)}s</span>
                              </div>
                              {short.reasoning && (
                                <p className="text-sm text-indigo-600 mt-2">
                                  <span className="font-medium">Why this segment: </span>{short.reasoning}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}




                  {/* Key Lessons */}
                  {analysisResult.keyLessons && analysisResult.keyLessons.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-black mb-3">📚 Key Lessons</h3>
                      <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
                        <div className="space-y-4">
                          {analysisResult.keyLessons.map((lesson, index) => (
                            <div key={index} className="bg-white border border-teal-200 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold text-teal-900">{lesson.heading}</h4>
                                {lesson.timestamp && (
                                  <span className="text-sm text-teal-600">⏱️ {lesson.timestamp}</span>
                                )}
                              </div>
                              <p className="text-gray-700">{lesson.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Key Moments */}
                  {analysisResult.keyMoments && analysisResult.keyMoments.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-black mb-3">⭐ Key Moments</h3>
                      <div className="bg-pink-50 border border-pink-200 rounded-lg p-6">
                        <div className="space-y-3">
                          {analysisResult.keyMoments.map((moment, index) => (
                            <div key={index} className="bg-white border border-pink-200 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold text-pink-900">{moment.title}</h4>
                                {moment.timestamp && (
                                  <span className="text-sm text-pink-600">⏱️ {moment.timestamp}</span>
                                )}
                              </div>
                              <p className="text-gray-700">{moment.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Best Segment */}
                  {analysisResult.bestSegment && (
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-black mb-3">🏆 Best Segment</h3>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                        <div className="bg-white border border-amber-200 rounded-lg p-4">
                          <h4 className="font-semibold text-amber-900 mb-2">{analysisResult.bestSegment.title}</h4>
                          <p className="text-gray-700 mb-2">{analysisResult.bestSegment.description}</p>
                          {analysisResult.bestSegment.timestamp && (
                            <p className="text-sm text-amber-700 mb-2">⏱️ {analysisResult.bestSegment.timestamp}</p>
                          )}
                          {analysisResult.bestSegment.reasoning && (
                            <p className="text-sm text-amber-600">
                              <span className="font-medium">Why this is the best: </span>{analysisResult.bestSegment.reasoning}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Revised Script */}
                  {analysisResult.revisedScript && (
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-black mb-3">📝 Revised Script</h3>
                      <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-6">
                        <div className="space-y-4">
                          {analysisResult.revisedScript.originalScript && (
                            <div className="bg-white border border-cyan-200 rounded-lg p-4">
                              <h4 className="font-semibold text-cyan-900 mb-2">Original Script</h4>
                              <p className="text-gray-700 whitespace-pre-wrap">{analysisResult.revisedScript.originalScript}</p>
                  </div>
                          )}
                          {analysisResult.revisedScript.revisedScript && (
                            <div className="bg-white border border-cyan-200 rounded-lg p-4">
                              <h4 className="font-semibold text-cyan-900 mb-2">Revised Script</h4>
                              <p className="text-gray-700 whitespace-pre-wrap">{analysisResult.revisedScript.revisedScript}</p>
                            </div>
                          )}
                          {analysisResult.revisedScript.changes && analysisResult.revisedScript.changes.length > 0 && (
                            <div className="bg-white border border-cyan-200 rounded-lg p-4">
                              <h4 className="font-semibold text-cyan-900 mb-2">Key Changes</h4>
                              <ul className="space-y-2">
                                {analysisResult.revisedScript.changes.map((change, index) => (
                                  <li key={index} className="flex items-start space-x-2">
                                    <span className="text-cyan-600 mt-1">✓</span>
                                    <span className="text-gray-700">{change}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                          </div>
                        </div>
                      )}

                  {/* What Changed */}
                  {analysisResult.whatChanged && analysisResult.whatChanged.length > 0 && (
                  <div className="mb-6">
                      <h3 className="text-xl font-bold text-black mb-3">🔄 What Changed</h3>
                      <div className="bg-violet-50 border border-violet-200 rounded-lg p-6">
                    <div className="space-y-4">
                          {analysisResult.whatChanged.map((change, index) => (
                            <div key={index} className="bg-white border border-violet-200 rounded-lg p-4">
                              <h4 className="font-semibold text-violet-900 mb-3">{change.section}</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-violet-800 font-medium mb-1">Original:</p>
                                  <p className="text-sm text-gray-700 bg-red-50 p-2 rounded">{change.original}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-violet-800 font-medium mb-1">Revised:</p>
                                  <p className="text-sm text-gray-700 bg-green-50 p-2 rounded">{change.revised}</p>
                                </div>
                              </div>
                              {change.reason && (
                                <p className="text-sm text-violet-600 mt-3">
                                  <span className="font-medium">Reason: </span>{change.reason}
                                </p>
                              )}
                                  </div>
                          ))}
                          </div>
                          </div>
                        </div>
                      )}

                  {/* Call to Action */}
                  {analysisResult.callToAction && (
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-black mb-3">📢 Call to Action</h3>
                      <div className="bg-rose-50 border border-rose-200 rounded-lg p-6">
                        <p className="text-lg text-black leading-relaxed">{analysisResult.callToAction}</p>
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                /* Fallback Summary Text */
                <div className="space-y-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-yellow-800 mb-3">⚠️ No Video Analysis Available</h3>
                    <p className="text-yellow-700 mb-4">
                      It looks like no video analysis data was found. This could happen if:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-yellow-700">
                      <li>No video was uploaded and analyzed</li>
                      <li>The analysis process failed</li>
                      <li>You navigated here directly without uploading a video</li>
                    </ul>
                    <div className="mt-4">
                      <button
                        onClick={() => navigate('/gyb-studio/create')}
                        className="px-6 py-3 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700 transition-colors"
                      >
                        Upload a Video to Analyze
                      </button>
                    </div>
                  </div>
                  
                  {/* Sample content for demonstration */}
                  <div className="space-y-6">
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-black mb-3">📝 Sample Video Summary</h3>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <p className="text-lg text-black leading-relaxed">
                          This is a sample video summary. When you upload a video, our AI will analyze it and provide detailed insights including tone analysis, engagement metrics, and areas for improvement.
                        </p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-black mb-3">🎭 Sample Tone Analysis</h3>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                        <p className="text-lg text-black leading-relaxed">
                          The tone of your video appears to be professional yet approachable, maintaining audience engagement throughout the content.
                        </p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-black mb-3">📊 Sample Engagement Analysis</h3>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <p className="text-lg text-black leading-relaxed">
                          Your video shows good engagement potential with clear structure and compelling content that keeps viewers interested.
                        </p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-black mb-3">🚀 Sample Areas of Improvement</h3>
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                        <div className="space-y-4">
                          <div className="bg-white border border-orange-200 rounded-lg p-4">
                            <h4 className="font-semibold text-orange-900 mb-2">Content Structure</h4>
                            <p className="text-gray-700 mb-3">Consider adding more visual elements to enhance viewer retention.</p>
                          </div>
                          <div className="bg-white border border-orange-200 rounded-lg p-4">
                            <h4 className="font-semibold text-orange-900 mb-2">Audio Quality</h4>
                            <p className="text-gray-700 mb-3">Improve audio clarity for better audience experience.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Created Shorts Section */}
        {createdShorts.length > 0 && (
          <div className="mt-12">
            <CreatedShortsSection
              shorts={createdShorts}
              onDeleteShort={handleDeleteShort}
              onDownloadShort={handleDownloadShort}
            />
          </div>
        )}
      </div>

      {/* Video Generation Modal */}
      {showVideoModal && analysisResult && (
        <VideoGenerationModal
          isOpen={showVideoModal}
          onClose={() => setShowVideoModal(false)}
          analysisResult={analysisResult}
          onSaveToShorts={handleSaveToShorts}
        />
      )}
    </div>
  );
};

export default SummaryPage;