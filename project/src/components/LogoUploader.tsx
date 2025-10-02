import React, { useState } from 'react';
import { useGYBLogo } from '../hooks/useGYBLogo';

const LogoUploader: React.FC = () => {
  const { uploadLogo, loading, error, isUploaded } = useGYBLogo();
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    setUploading(true);
    try {
      await uploadLogo();
      alert('Logo uploaded successfully to Firebase Storage!');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload logo. Check console for details.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border z-50">
      <h3 className="text-lg font-bold mb-2">GYB Logo Upload</h3>
      <div className="space-y-2">
        <div className="text-sm">
          <strong>Status:</strong> {isUploaded ? '✅ Uploaded' : '❌ Not uploaded'}
        </div>
        {error && (
          <div className="text-sm text-red-600">
            <strong>Error:</strong> {error}
          </div>
        )}
        <button
          onClick={handleUpload}
          disabled={loading || uploading}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading || uploading ? 'Uploading...' : 'Upload Logo to Firebase'}
        </button>
        <div className="text-xs text-gray-500">
          This will convert the SVG logo to PNG and upload it to Firebase Storage.
        </div>
      </div>
    </div>
  );
};

export default LogoUploader;
