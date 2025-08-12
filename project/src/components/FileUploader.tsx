import React, { useRef, useState } from 'react';
import { storage } from '../lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const CONTENT_TYPES = [
  {
    key: 'video',
    label: 'Video Content',
    description: 'Upload video files or share video links for analysis and optimization',
    accept: 'video/*',
    icon: '🎬',
  },
  {
    key: 'image',
    label: 'Image Content',
    description: 'Upload images to create visual content and generate captions',
    accept: 'image/*',
    icon: '🖼️',
  },
  {
    key: 'audio',
    label: 'Audio Content',
    description: 'Upload audio files for podcast content and transcriptions',
    accept: 'audio/*',
    icon: '🎧',
  },
  {
    key: 'document',
    label: 'Document Content',
    description: 'Upload documents for blog posts, articles, and written content',
    accept: '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt',
    icon: '📄',
  },
  {
    key: 'link',
    label: 'Link Content',
    description: 'Share external links for content analysis and optimization',
    accept: '',
    icon: '🔗',
  },
];

const FileUploader: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadURL, setDownloadURL] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [linkValue, setLinkValue] = useState('');

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setDownloadURL(null);
    setError(null);
    setProgress(0);
    setLinkValue('');
    setSelectedFile(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setDownloadURL(null);
      setError(null);
      setProgress(0);
    }
  };

  const handleUpload = () => {
    if (!selectedFile || !selectedType) return;
    setUploading(true);
    setProgress(0);
    setDownloadURL(null);
    setError(null);
    const storageRef = ref(storage, `uploads/${selectedType}/${Date.now()}_${selectedFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, selectedFile);
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(percent);
      },
      (err) => {
        setError(err.message);
        setUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          setDownloadURL(url);
          setUploading(false);
        });
      }
    );
  };

  const handleLinkUpload = () => {
    if (!linkValue.trim()) {
      setError('Please enter a valid link.');
      return;
    }
    setDownloadURL(linkValue.trim());
    setError(null);
  };

  const selectedContent = CONTENT_TYPES.find((c) => c.key === selectedType);

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Choose Content Type</h2>
      {!selectedType ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {CONTENT_TYPES.map((type) => (
            <div
              key={type.key}
              className="border rounded-lg p-4 cursor-pointer hover:shadow transition flex flex-col"
              onClick={() => handleTypeSelect(type.key)}
            >
              <div className="text-3xl mb-2">{type.icon}</div>
              <div className="font-semibold mb-1">{type.label}</div>
              <div className="text-gray-500 text-sm flex-1">{type.description}</div>
              <button className="mt-3 text-blue-600 underline self-end">Select →</button>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <button className="mb-4 text-blue-600 underline" onClick={() => setSelectedType(null)}>
            ← Back to Content Types
          </button>
          <div className="mb-4 p-4 border rounded-lg">
            <div className="text-2xl mb-2">{selectedContent?.icon}</div>
            <div className="font-semibold mb-1">{selectedContent?.label}</div>
            <div className="text-gray-500 text-sm mb-2">{selectedContent?.description}</div>
            {selectedType !== 'link' ? (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={selectedContent?.accept}
                  onChange={handleFileChange}
                  className="mb-4"
                  disabled={uploading}
                />
                {selectedFile && !uploading && (
                  <button
                    onClick={handleUpload}
                    className="bg-blue-600 text-white px-4 py-2 rounded mb-2"
                  >
                    Upload
                  </button>
                )}
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <input
                  type="url"
                  placeholder="Paste your link here"
                  value={linkValue}
                  onChange={(e) => setLinkValue(e.target.value)}
                  className="border rounded px-2 py-1"
                  disabled={uploading}
                />
                <button
                  onClick={handleLinkUpload}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                  disabled={uploading}
                >
                  Save Link
                </button>
              </div>
            )}
            {uploading && (
              <div className="mb-2">
                <div className="h-2 bg-gray-200 rounded">
                  <div
                    className="h-2 bg-blue-500 rounded"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm mt-1">Uploading: {progress.toFixed(0)}%</p>
              </div>
            )}
            {downloadURL && (
              <div className="mt-2">
                <p className="text-green-600">Upload complete!</p>
                <a
                  href={downloadURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  View {selectedType === 'link' ? 'Link' : 'File'}
                </a>
              </div>
            )}
            {error && <p className="text-red-600 mt-2">Error: {error}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader; 