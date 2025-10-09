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
    // Load analysis result from sessionStorage
    const storedAnalysis = sessionStorage.getItem('videoAnalysis');

    if (storedAnalysis) {
      try {
        const analysis = JSON.parse(storedAnalysis);
        setAnalysisResult(analysis);
        console.log('Loaded analysis result:', analysis);
        console.log('Suggested Edits:', analysis.suggestedEdits);
        console.log('Revised Script:', analysis.revisedScript);
        console.log('What Changed:', analysis.whatChanged);
      } catch (error) {
        console.error('Error parsing analysis result:', error);
      }
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
                   onClick={() => navigate('/gyb-studio')}
                   className="px-6 py-3 text-black font-semibold rounded-lg transition-colors flex items-center justify-center"
                   style={{ backgroundColor: '#e0c472' }}
                 >
                   Generate Scripts
                 </button>
                 <button
                   onClick={() => setShowVideoModal(true)}
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



                  {/* Brief Summary */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-black mb-3">📝 Video Summary</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      <p className="text-lg text-black leading-relaxed">{analysisResult.summary}</p>
                    </div>
                  </div>




                  {/* Key Points */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-black mb-3">📋 Key Points</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                      {analysisResult.keyPoints && analysisResult.keyPoints.length > 0 ? (
                        <ul className="space-y-3">
                          {analysisResult.keyPoints.map((point, index) => (
                            <li key={index} className="flex items-start space-x-3">
                              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                                {index + 1}
                              </div>
                              <span className="text-gray-700">{point}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-600 italic">Key points will be generated during AI analysis...</p>
                      )}
                    </div>
                  </div>

                  {/* Suggested Edits */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-black mb-3">✏️ Suggested Edits</h3>
                    <div className="space-y-4">
                      {analysisResult.suggestedEdits && analysisResult.suggestedEdits.length > 0 ? (
                        analysisResult.suggestedEdits.map((edit, index) => (
                          <div key={index} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="font-semibold text-orange-900">{edit.title}</h4>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                edit.priority === 'high' 
                                  ? 'bg-red-100 text-red-800' 
                                  : edit.priority === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {edit.priority.toUpperCase()} PRIORITY
                              </span>
                            </div>
                            <p className="text-gray-700 mb-3">{edit.description}</p>
                            <div className="bg-white border border-orange-200 rounded p-3">
                              <p className="text-sm text-orange-800 font-medium">Reasoning:</p>
                              <p className="text-sm text-gray-700">{edit.reasoning}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <p className="text-gray-600 italic">Suggested edits will be generated during AI analysis...</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Revised Script */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-black mb-3">📝 Here Is The Revised Script For Your Video!</h3>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      {analysisResult.revisedScript ? (
                        <div className="space-y-6">
                          <div>
                            <h4 className="font-semibold text-green-900 mb-3">Revised Script:</h4>
                            <div className="bg-white border border-green-200 rounded-lg p-4">
                              <p className="text-gray-700 whitespace-pre-wrap">{analysisResult.revisedScript.revisedScript}</p>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-green-900 mb-3">Key Changes Made:</h4>
                            <ul className="space-y-2">
                              {analysisResult.revisedScript.changes.map((change, index) => (
                                <li key={index} className="flex items-start space-x-2">
                                  <span className="text-green-600 mt-1">•</span>
                                  <span className="text-gray-700">{change}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-600 italic">Revised script will be generated during AI analysis...</p>
                      )}
                    </div>
                  </div>

                  {/* What's Changed */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-black mb-3">🔄 What's Changed</h3>
                    <div className="space-y-4">
                      {analysisResult.whatChanged && analysisResult.whatChanged.length > 0 ? (
                        analysisResult.whatChanged.map((change, index) => (
                          <div key={index} className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                            <h4 className="font-semibold text-indigo-900 mb-3">{change.section}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-red-50 border border-red-200 rounded p-3">
                                <p className="text-sm text-red-800 font-medium mb-2">Original:</p>
                                <p className="text-sm text-gray-700">{change.original}</p>
                              </div>
                              <div className="bg-green-50 border border-green-200 rounded p-3">
                                <p className="text-sm text-green-800 font-medium mb-2">Revised:</p>
                                <p className="text-sm text-gray-700">{change.revised}</p>
                              </div>
                            </div>
                            <div className="mt-3 bg-white border border-indigo-200 rounded p-3">
                              <p className="text-sm text-indigo-800 font-medium">Reason for Change:</p>
                              <p className="text-sm text-gray-700">{change.reason}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <p className="text-gray-600 italic">Change details will be generated during AI analysis...</p>
                        </div>
                      )}
                    </div>
                  </div>






                </div>
              ) : (
                /* Fallback Summary Text */
                <div className="space-y-3">
                  <p className="text-lg text-black">Boost your product and service's credibility by adding testimonials from your clients.</p>
                  <p className="text-lg text-black">Boost your product and service's credibility by adding testimonials from your clients.</p>
                  <p className="text-lg text-black">Boost your product and service's credibility by adding testimonials from your clients.</p>
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