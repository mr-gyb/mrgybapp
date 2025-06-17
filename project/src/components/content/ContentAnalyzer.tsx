import React, { useState } from 'react';
import { Upload, Link as LinkIcon, Loader } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { analyzeContent, getContentAnalysis } from '../../services/content.service';

interface ContentAnalyzerProps {
  onAnalysisComplete: (derivatives: any) => void;
}

const ContentAnalyzer: React.FC<ContentAnalyzerProps> = ({ onAnalysisComplete }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  console.log("showing page");
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const analysisId = await analyzeContent(user.id, file, getContentType(file));
      const analysis = await getContentAnalysis(analysisId);
      onAnalysisComplete(analysis.content_derivatives);
    } catch (err) {
      setError('Failed to analyze content. Please try again.');
      console.error('Content analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getContentType = (file: File): 'text' | 'image' | 'video' | 'audio' | 'document' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type === 'text/plain') return 'text';
    return 'document';
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <input
          type="file"
          onChange={handleFileUpload}
          className="hidden"
          id="file-upload"
          accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.mp4,.mov,.mp3,.wav"
          disabled={isAnalyzing}
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center"
        >
          <Upload size={48} className="text-gray-400 mb-4" />
          <p className="text-lg mb-2">
            {isAnalyzing ? 'Analyzing content...' : 'Upload content for analysis'}
          </p>
          <p className="text-sm text-gray-500">
            Supported formats: Text, PDF, DOC, Images, Video, Audio
          </p>
        </label>
      </div>

      {isAnalyzing && (
        <div className="flex items-center justify-center">
          <Loader className="animate-spin mr-2" size={20} />
          <span>Analyzing content...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default ContentAnalyzer;