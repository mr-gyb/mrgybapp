import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    // Debug: Check what's in sessionStorage
    console.log('🔍 Debugging SummaryPage - Checking sessionStorage...');
    console.log('All sessionStorage keys:', Object.keys(sessionStorage));
    console.log('videoAnalysis key exists:', sessionStorage.getItem('videoAnalysis') !== null);
    console.log('videoAnalysis content:', sessionStorage.getItem('videoAnalysis'));
    
    // Load analysis result from sessionStorage
    const storedAnalysis = sessionStorage.getItem('videoAnalysis');

    if (storedAnalysis) {
      try {
        const analysis = JSON.parse(storedAnalysis);
        setAnalysisResult(analysis);
        console.log('✅ Loaded analysis result:', analysis);
        console.log('Suggested Edits:', analysis.suggestedEdits);
        console.log('Revised Script:', analysis.revisedScript);
        console.log('What Changed:', analysis.whatChanged);
        console.log('Areas of Improvement:', analysis.areasOfImprovement);
        console.log('Tone:', analysis.tone);
        console.log('Engagement:', analysis.engagement);
        
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
      }
    } else {
      console.log('❌ No videoAnalysis found in sessionStorage');
      console.log('Available sessionStorage items:');
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key) {
          console.log(`- ${key}: ${sessionStorage.getItem(key)}`);
        }
      }
      
      // No video analysis data found
      console.log('ℹ️ No video analysis data found in sessionStorage');
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
                        {typeof analysisResult.summary === 'string' 
                          ? analysisResult.summary 
                          : analysisResult.summary?.text || JSON.stringify(analysisResult.summary) || 'No summary available'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Tone */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-black mb-3">🎭 Tone</h3>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                      {analysisResult.tone ? (
                        <div className="space-y-3">
                          <p className="text-lg text-black leading-relaxed">
                            {typeof analysisResult.tone === 'string' 
                              ? analysisResult.tone 
                              : analysisResult.tone?.overall || analysisResult.tone?.description || JSON.stringify(analysisResult.tone)
                            }
                          </p>
                          {analysisResult.toneAnalysis && (
                            <div className="bg-white border border-purple-200 rounded p-4">
                              <p className="text-sm text-purple-800 font-medium mb-2">Analysis:</p>
                              <p className="text-sm text-gray-700">
                                {typeof analysisResult.toneAnalysis === 'string' 
                                  ? analysisResult.toneAnalysis 
                                  : analysisResult.toneAnalysis?.text || JSON.stringify(analysisResult.toneAnalysis)
                                }
                              </p>
                              </div>
                          )}
                          {/* Handle tone examples if they exist */}
                          {analysisResult.tone?.examples && Array.isArray(analysisResult.tone.examples) && analysisResult.tone.examples.length > 0 && (
                            <div className="bg-white border border-purple-200 rounded p-4">
                              <p className="text-sm text-purple-800 font-medium mb-2">Examples:</p>
                              <ul className="space-y-1">
                                {analysisResult.tone.examples.map((example, index) => (
                                  <li key={index} className="flex items-start space-x-2">
                                    <span className="text-purple-600 mt-1">•</span>
                                    <span className="text-sm text-gray-700">
                                      {typeof example === 'string' ? example : example?.text || JSON.stringify(example)}
                                    </span>
                            </li>
                          ))}
                        </ul>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-gray-600 italic mb-2">Tone analysis is being processed...</p>
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Engagement */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-black mb-3">📊 Engagement</h3>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      {analysisResult.engagement ? (
                    <div className="space-y-4">
                          <p className="text-lg text-black leading-relaxed">
                            {typeof analysisResult.engagement === 'string' 
                              ? analysisResult.engagement 
                              : analysisResult.engagement?.overall || analysisResult.engagement?.description || JSON.stringify(analysisResult.engagement)
                            }
                          </p>
                          {/* Handle engagement examples if they exist */}
                          {analysisResult.engagement?.examples && Array.isArray(analysisResult.engagement.examples) && analysisResult.engagement.examples.length > 0 && (
                            <div className="bg-white border border-green-200 rounded p-4">
                              <p className="text-sm text-green-800 font-medium mb-2">Examples:</p>
                              <ul className="space-y-1">
                                {analysisResult.engagement.examples.map((example, index) => (
                                  <li key={index} className="flex items-start space-x-2">
                                    <span className="text-green-600 mt-1">•</span>
                                    <span className="text-sm text-gray-700">
                                      {typeof example === 'string' ? example : example?.text || JSON.stringify(example)}
                              </span>
                                  </li>
                                ))}
                              </ul>
                        </div>
                      )}
                          {analysisResult.engagementScore && (
                            <div className="bg-white border border-green-200 rounded p-4">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-green-800 font-medium">Engagement Score:</p>
                                <span className="text-lg font-bold text-green-600">{analysisResult.engagementScore}/10</span>
                    </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                                  style={{ width: `${(analysisResult.engagementScore / 10) * 100}%` }}
                                ></div>
                  </div>
                            </div>
                          )}
                          {analysisResult.engagementTips && Array.isArray(analysisResult.engagementTips) && analysisResult.engagementTips.length > 0 && (
                            <div className="bg-white border border-green-200 rounded p-4">
                              <p className="text-sm text-green-800 font-medium mb-2">Engagement Tips:</p>
                              <ul className="space-y-1">
                                {analysisResult.engagementTips.map((tip, index) => (
                                  <li key={index} className="flex items-start space-x-2">
                                    <span className="text-green-600 mt-1">•</span>
                                    <span className="text-sm text-gray-700">{tip}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-gray-600 italic mb-2">Engagement analysis is being processed...</p>
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Areas of Improvement */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-black mb-3">🚀 Areas of Improvement</h3>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                      {analysisResult.areasOfImprovement && Array.isArray(analysisResult.areasOfImprovement) && analysisResult.areasOfImprovement.length > 0 ? (
                    <div className="space-y-4">
                          {analysisResult.areasOfImprovement.map((area, index) => {
                            console.log(`Processing area ${index}:`, area, typeof area);
                            // Handle both string and object formats
                            if (typeof area === 'string') {
                              return (
                                <div key={index} className="bg-white border border-orange-200 rounded-lg p-4">
                                  <p className="text-gray-700">{area}</p>
                                </div>
                              );
                            }
                            
                            // Handle object format with level, description, strengths, weaknesses
                            return (
                              <div key={index} className="bg-white border border-orange-200 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-3">
                                  <h4 className="font-semibold text-orange-900">
                                    {area.title || area.level || `Improvement Area ${index + 1}`}
                                  </h4>
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    area.priority === 'high' 
                                      ? 'bg-red-100 text-red-800' 
                                      : area.priority === 'medium'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-green-100 text-green-800'
                                  }`}>
                                    {(area.priority || 'medium').toUpperCase()} PRIORITY
                                  </span>
                                </div>
                                
                                <p className="text-gray-700 mb-3">
                                  {typeof area.description === 'string' ? area.description : area.description?.text || JSON.stringify(area.description) || 'No description available'}
                                </p>
                                
                                {/* Strengths */}
                                {area.strengths && Array.isArray(area.strengths) && area.strengths.length > 0 && (
                                  <div className="bg-green-50 border border-green-200 rounded p-3 mb-3">
                                    <p className="text-sm text-green-800 font-medium mb-2">Strengths:</p>
                                    <ul className="space-y-1">
                                      {area.strengths.map((strength, strengthIndex) => {
                                        console.log(`Strength ${strengthIndex}:`, strength, typeof strength);
                                        return (
                                          <li key={strengthIndex} className="flex items-start space-x-2">
                                            <span className="text-green-600 mt-1">✓</span>
                                            <span className="text-sm text-gray-700">
                                              {typeof strength === 'string' ? strength : strength?.text || JSON.stringify(strength)}
                                            </span>
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  </div>
                                )}
                                
                                {/* Weaknesses */}
                                {area.weaknesses && Array.isArray(area.weaknesses) && area.weaknesses.length > 0 && (
                                  <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
                                    <p className="text-sm text-red-800 font-medium mb-2">Areas to Improve:</p>
                                    <ul className="space-y-1">
                                      {area.weaknesses.map((weakness, weaknessIndex) => (
                                        <li key={weaknessIndex} className="flex items-start space-x-2">
                                          <span className="text-red-600 mt-1">•</span>
                                          <span className="text-sm text-gray-700">
                                            {typeof weakness === 'string' ? weakness : weakness?.text || JSON.stringify(weakness)}
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {/* Suggestions */}
                                {area.suggestions && Array.isArray(area.suggestions) && area.suggestions.length > 0 && (
                                  <div className="bg-orange-50 border border-orange-200 rounded p-3">
                                    <p className="text-sm text-orange-800 font-medium mb-2">Suggestions:</p>
                                    <ul className="space-y-1">
                                      {area.suggestions.map((suggestion, suggestionIndex) => (
                                        <li key={suggestionIndex} className="flex items-start space-x-2">
                                          <span className="text-orange-600 mt-1">•</span>
                                          <span className="text-sm text-gray-700">
                                            {typeof suggestion === 'string' ? suggestion : suggestion?.text || JSON.stringify(suggestion)}
                                          </span>
                            </li>
                          ))}
                        </ul>
                              </div>
                                )}
                              </div>
                            );
                          })}
                          </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-gray-600 italic mb-2">Areas of improvement are being analyzed...</p>
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>







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