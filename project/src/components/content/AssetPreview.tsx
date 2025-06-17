import React, { useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Check, X } from 'lucide-react';
import ReactPlayer from 'react-player/lazy';
import { GeneratedAsset } from '../../types/content';

interface AssetPreviewProps {
  asset: GeneratedAsset;
  onApprove: () => void;
  onReject: () => void;
}

const AssetPreview: React.FC<AssetPreviewProps> = ({ asset, onApprove, onReject }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const renderPreview = () => {
    switch (asset.type) {
      case 'video':
        return (
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <ReactPlayer
              url={asset.url}
              width="100%"
              height="100%"
              playing={isPlaying}
              muted={isMuted}
              onReady={() => setIsLoading(false)}
              onError={() => setIsLoading(false)}
              controls={false}
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="text-white hover:text-gray-200"
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-white hover:text-gray-200"
                >
                  {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </button>
              </div>
            </div>
          </div>
        );
      case 'photo':
      case 'thumbnail':
      case 'headline':
        return (
          <img
            src={asset.url}
            alt={`Generated ${asset.type}`}
            className="w-full rounded-lg"
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          />
        );
      case 'audio':
        return (
          <div className="bg-gray-100 p-4 rounded-lg">
            <audio
              src={asset.url}
              controls
              className="w-full"
              onLoadedData={() => setIsLoading(false)}
              onError={() => setIsLoading(false)}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {isLoading && (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy-blue"></div>
        </div>
      )}
      <div className={isLoading ? 'hidden' : ''}>
        {renderPreview()}
      </div>
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm">
          {asset.status === 'pending' ? (
            <span className="text-yellow-600">Pending Review</span>
          ) : asset.status === 'approved' ? (
            <span className="text-green-600">Approved</span>
          ) : (
            <span className="text-red-600">Rejected</span>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onReject}
            className={`p-2 rounded-full ${
              asset.status === 'rejected'
                ? 'bg-red-100 text-red-600'
                : 'hover:bg-red-100 text-gray-500 hover:text-red-600'
            }`}
            title="Reject"
          >
            <X size={20} />
          </button>
          <button
            onClick={onApprove}
            className={`p-2 rounded-full ${
              asset.status === 'approved'
                ? 'bg-green-100 text-green-600'
                : 'hover:bg-green-100 text-gray-500 hover:text-green-600'
            }`}
            title="Approve"
          >
            <Check size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetPreview;