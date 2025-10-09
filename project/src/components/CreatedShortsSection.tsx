import React, { useState } from 'react';
import { Download, Play, Trash2, Calendar, Clock } from 'lucide-react';

interface CreatedShort {
  id: string;
  title: string;
  url: string;
  createdAt: string;
  analysisResult?: any;
}

interface CreatedShortsSectionProps {
  shorts: CreatedShort[];
  onDeleteShort: (id: string) => void;
  onDownloadShort: (short: CreatedShort) => void;
}

const CreatedShortsSection: React.FC<CreatedShortsSectionProps> = ({
  shorts,
  onDeleteShort,
  onDownloadShort
}) => {
  const [selectedShort, setSelectedShort] = useState<CreatedShort | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownload = (short: CreatedShort) => {
    onDownloadShort(short);
  };

  const handlePlay = (short: CreatedShort) => {
    setSelectedShort(short);
  };

  if (shorts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-gray-400 mb-4">
          <Play size={48} className="mx-auto" />
        </div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Created Shorts Yet</h3>
        <p className="text-gray-500">
          Create your first short video to see it appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Download All */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-navy-blue">Created Shorts</h2>
          <p className="text-gray-600">Your generated short videos</p>
        </div>
        {shorts.length > 0 && (
          <button
            onClick={() => {
              // Download all shorts as a zip (mock implementation)
              console.log('Downloading all shorts...');
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Download size={16} />
            Download All
          </button>
        )}
      </div>

      {/* Shorts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shorts.map((short) => (
          <div key={short.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            {/* Video Thumbnail */}
            <div className="relative aspect-video bg-gray-100">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black bg-opacity-50 rounded-full p-4">
                  <Play size={32} className="text-white" />
                </div>
              </div>
              <div className="absolute top-2 right-2">
                <span className="bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                  Short Video
                </span>
              </div>
            </div>

            {/* Video Info */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                {short.title}
              </h3>
              
              <div className="flex items-center text-sm text-gray-500 mb-3">
                <Calendar size={14} className="mr-1" />
                <span>{formatDate(short.createdAt)}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handlePlay(short)}
                  className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                >
                  <Play size={14} />
                  Play
                </button>
                <button
                  onClick={() => handleDownload(short)}
                  className="bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                >
                  <Download size={14} />
                </button>
                <button
                  onClick={() => onDeleteShort(short.id)}
                  className="bg-red-600 text-white py-2 px-3 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Video Player Modal */}
      {selectedShort && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{selectedShort.title}</h3>
              <button
                onClick={() => setSelectedShort(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
              <div className="text-white text-center">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <div className="w-0 h-0 border-l-8 border-l-white border-y-4 border-y-transparent ml-1"></div>
                </div>
                <p className="text-sm">Video Player</p>
                <p className="text-xs text-gray-400 mt-2">
                  Created: {formatDate(selectedShort.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex gap-4 mt-4">
              <button
                onClick={() => handleDownload(selectedShort)}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Download size={16} />
                Download Video
              </button>
              <button
                onClick={() => setSelectedShort(null)}
                className="bg-gray-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatedShortsSection;
