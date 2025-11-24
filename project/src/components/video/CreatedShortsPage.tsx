import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Download, Trash2, ChevronLeft, X } from 'lucide-react';

interface CreatedShort {
  id: string;
  title: string;
  url: string;
  createdAt: string;
  thumbnail?: string;
}

const CreatedShortsPage: React.FC = () => {
  const navigate = useNavigate();
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

    // Listen for storage events and custom events
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'createdShorts') {
        loadShorts();
      }
    };

    const handleCustomStorageChange = () => {
      loadShorts();
    };

    window.addEventListener('storage', handleStorageChange);
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

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/gyb-studio')}
            className="mr-4 text-navy-blue hover:text-blue-600 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold text-navy-blue">Created Shorts</h1>
        </div>

        {/* Grid of Shorts */}
        {shorts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-600">No shorts created yet.</p>
            <button
              onClick={() => navigate('/gyb-studio/create')}
              className="mt-4 px-6 py-3 bg-navy-blue text-white rounded-lg hover:bg-opacity-90 transition-colors"
            >
              Create Your First Short
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {shorts.map((short) => (
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
                    />
                  )}

                  {/* Play Overlay */}
                  <div 
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 group-hover:bg-opacity-50 transition-all cursor-pointer"
                    onClick={() => setSelectedShort(short)}
                  >
                    <Play size={48} className="text-white opacity-80 group-hover:opacity-100" />
                  </div>

                  {/* Download Button - Top Right */}
                  <button
                    onClick={() => handleDownload(short)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
                    title="Download video"
                  >
                    <Download size={20} className="text-navy-blue" />
                  </button>

                  {/* Delete Button - Top Left */}
                  <button
                    onClick={() => handleDelete(short.id)}
                    className="absolute top-2 left-2 p-2 bg-red-500 rounded-full shadow-lg hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete short"
                  >
                    <Trash2 size={20} className="text-white" />
                  </button>
                </div>

                {/* Title */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                  <p className="text-white text-sm font-medium truncate">{short.title}</p>
                  <p className="text-white text-xs opacity-75">
                    {new Date(short.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
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
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(selectedShort);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                  >
                    <Download size={16} />
                    Download
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Are you sure you want to delete this short?')) {
                        handleDelete(selectedShort.id);
                        setSelectedShort(null);
                      }
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatedShortsPage;

