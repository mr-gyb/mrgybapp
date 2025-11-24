import React, { useState, useEffect, useRef } from 'react';
import { Play, Download, Trash2, X } from 'lucide-react';

interface CreatedShort {
  id: string;
  title: string;
  url: string;
  createdAt: string;
  thumbnail?: string;
}

interface CreatedShortsSectionProps {
  onNavigateToFullPage?: () => void;
}

const CreatedShortsSection: React.FC<CreatedShortsSectionProps> = ({ onNavigateToFullPage }) => {
  const [shorts, setShorts] = useState<CreatedShort[]>([]);
  const [selectedShort, setSelectedShort] = useState<CreatedShort | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Load shorts from localStorage
    const loadShorts = () => {
      const storedShorts = localStorage.getItem('createdShorts');
      if (storedShorts) {
        try {
          setShorts(JSON.parse(storedShorts));
        } catch (error) {
          console.error('Error parsing created shorts:', error);
        }
      }
    };

    // Load initially
    loadShorts();

    // Listen for storage events (when shorts are added from other tabs/components)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'createdShorts') {
        loadShorts();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom event (for same-tab updates)
    const handleCustomStorageChange = () => {
      loadShorts();
    };

    window.addEventListener('createdShortsUpdated', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('createdShortsUpdated', handleCustomStorageChange);
    };
  }, []);

  const handleDownload = async (short: CreatedShort) => {
    try {
      // If it's a blob URL, fetch it first to ensure it's still valid
      if (short.url.startsWith('blob:')) {
        const response = await fetch(short.url);
        if (!response.ok) {
          throw new Error('Video file no longer available');
        }
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `${short.title.replace(/[^a-z0-9]/gi, '_')}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        // Clean up the blob URL after a delay
        setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
      } else {
        // For external URLs, download directly
        const link = document.createElement('a');
        link.href = short.url;
        link.download = `${short.title.replace(/[^a-z0-9]/gi, '_')}.mp4`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error downloading video:', error);
      alert('Failed to download video. The file may no longer be available.');
    }
  };

  const handleDelete = (id: string) => {
    const updatedShorts = shorts.filter(short => short.id !== id);
    setShorts(updatedShorts);
    localStorage.setItem('createdShorts', JSON.stringify(updatedShorts));
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('createdShortsUpdated'));
  };

  if (shorts.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-navy-blue">Created Shorts</h2>
          {onNavigateToFullPage && (
            <button
              onClick={onNavigateToFullPage}
              className="text-sm text-navy-blue hover:text-blue-800"
            >
              View All →
            </button>
          )}
        </div>
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No shorts created yet.</p>
          <p className="text-sm text-gray-500">Upload a video and create your first short!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-navy-blue">Created Shorts</h2>
        {onNavigateToFullPage && (
          <button
            onClick={onNavigateToFullPage}
            className="text-sm text-navy-blue hover:text-blue-800"
          >
            View All →
          </button>
        )}
      </div>

      {/* Grid of Shorts - Show 4 per row on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {shorts.slice(0, 8).map((short) => (
          <div
            key={short.id}
            className="relative bg-gray-900 rounded-2xl overflow-hidden group"
            style={{ aspectRatio: '9/16' }}
          >
            {/* Video Thumbnail/Player */}
            <div className="w-full h-full relative">
              {short.thumbnail ? (
                <img
                  src={short.thumbnail}
                  alt={short.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  src={short.url}
                  className="w-full h-full object-cover"
                  muted
                  preload="metadata"
                  onLoadedMetadata={(e) => {
                    // Generate thumbnail from video
                    const video = e.target as HTMLVideoElement;
                    video.currentTime = 1; // Seek to 1 second for thumbnail
                  }}
                />
              )}

              {/* Play Overlay */}
              <div 
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 group-hover:bg-opacity-50 transition-all cursor-pointer"
                onClick={() => setSelectedShort(short)}
              >
                <Play size={32} className="text-white opacity-80 group-hover:opacity-100" />
              </div>

              {/* Download Button - Top Right */}
              <button
                onClick={() => handleDownload(short)}
                className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100 z-10"
                title="Download video"
              >
                <Download size={16} className="text-navy-blue" />
              </button>

              {/* Delete Button - Top Left */}
              <button
                onClick={() => handleDelete(short.id)}
                className="absolute top-2 left-2 p-2 bg-red-500 rounded-full shadow-lg hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 z-10"
                title="Delete short"
              >
                <Trash2 size={16} className="text-white" />
              </button>
            </div>

            {/* Title */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
              <p className="text-white text-xs font-medium truncate">{short.title}</p>
              <p className="text-white text-xs opacity-75">
                {new Date(short.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {shorts.length > 8 && (
        <div className="mt-4 text-center">
          <button
            onClick={onNavigateToFullPage}
            className="text-navy-blue hover:text-blue-800 text-sm font-medium"
          >
            View {shorts.length - 8} more shorts →
          </button>
        </div>
      )}

      {/* Video Player Modal */}
      {selectedShort && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setSelectedShort(null);
            setIsPlaying(false);
            if (videoRef.current) {
              videoRef.current.pause();
              videoRef.current.currentTime = 0;
            }
          }}
        >
          <div 
            className="relative bg-black rounded-lg overflow-hidden max-w-4xl w-full"
            style={{ aspectRatio: '9/16', maxHeight: '90vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => {
                setSelectedShort(null);
                setIsPlaying(false);
                if (videoRef.current) {
                  videoRef.current.pause();
                  videoRef.current.currentTime = 0;
                }
              }}
              className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 transition-colors"
            >
              <X size={24} className="text-white" />
            </button>

            {/* Video Player */}
            <video
              ref={videoRef}
              src={selectedShort.url}
              controls
              autoPlay
              className="w-full h-full object-contain"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            />

            {/* Video Info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
              <h3 className="text-white font-semibold text-lg mb-1">{selectedShort.title}</h3>
              <p className="text-white text-sm opacity-75">
                Created: {new Date(selectedShort.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatedShortsSection;

