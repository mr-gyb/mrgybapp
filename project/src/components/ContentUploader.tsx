import React, { useState, useRef } from 'react';
import { Upload, Link, FileText, AlertCircle } from 'lucide-react';
import { uploadMedia, processMediaLink } from '../api/services/media.service';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { getDownloadURL } from 'firebase/storage';
import { uploadBytes } from 'firebase/storage';
import useUserContent from '../hooks/useUserContent';

interface ContentUploaderProps {
  onUpload: (result: { id: string; url: string; type: string }) => void;
}

const ContentUploader: React.FC<ContentUploaderProps> = ({ onUpload }) => {
  const { user } = useAuth();
  const [contentUrl, setContentUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const userContent = useUserContent();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    setFileName(file.name);
    setError(null);

    try {
      const storageRef = await uploadBytes(user.storageRef, file);
      const publicUrl = await getDownloadURL(storageRef);

      const contentData = {
        userId: user.uid,
        title: file.name,
        fileUrl: publicUrl,
        storagePath: storageRef.fullPath,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        type: file.type,
        platform: 'Instagram',
        views: 0,
        engagement: 0,
        url: publicUrl
      };

      console.log('Writing to Firestore:', contentData);
      await addDoc(collection(db, 'new_content'), contentData);

      const result = {
        id: storageRef.fullPath,
        url: publicUrl,
        type: file.type
      };

      console.log('📊 Content data being saved:', JSON.stringify(result, null, 2));
      onUpload(result);
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('An error occurred while uploading the file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentUrl.trim() || !user) return;

    setIsUploading(true);
    setError(null);

    try {
      const result = await processMediaLink(contentUrl.trim(), user.id);
      console.log('📊 Content data being saved:', JSON.stringify(result, null, 2));
      onUpload(result);
      setContentUrl('');
    } catch (error) {
      console.error('Error processing URL:', error);
      setError('An error occurred while processing the URL. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setFileName(file.name);
    setError(null);
  };

  const handleFileSubmit = async () => {
    if (!selectedFile || !user) return;
    setIsUploading(true);
    setError(null);
    try {
      const result = await uploadMedia(selectedFile, user.id);
      console.log('📊 Content data being saved:', JSON.stringify(result, null, 2));
      onUpload(result);
      setSelectedFile(null);
      setFileName('');
    } catch (error) {
      setError('An error occurred while uploading the file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const defaultPlatformData = [
    { name: 'Instagram', value: 45 },
    { name: 'TikTok', value: 35 },
    { name: 'YouTube', value: 15 },
    
  ];

  const userContent = [
    { platforms: ['Instagram', 'YouTube'] },
    { platforms: ['TikTok'] },
    // ...more items
  ];

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-4">Upload File</h3>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-navy-blue hover:bg-blue-700 text-white px-4 py-2 rounded-full flex items-center transition duration-300"
              disabled={isUploading}
            >
              <Upload size={20} className="mr-2" />
              Choose File
            </button>
            {fileName && <span className="text-gray-600">{fileName}</span>}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept="video/*,audio/*,image/*,.pdf,.doc,.docx,.txt"
            />
            {selectedFile && (
              <button
                onClick={handleFileSubmit}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full flex items-center transition duration-300"
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Submit'}
              </button>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Share YouTube Link</h3>
          <form onSubmit={handleUrlSubmit} className="flex items-center space-x-4">
            <input
              type="url"
              value={contentUrl}
              onChange={(e) => setContentUrl(e.target.value)}
              placeholder="Paste YouTube URL here"
              className="flex-grow px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-navy-blue"
            />
            <button
              type="submit"
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full flex items-center transition duration-300"
              disabled={isUploading || !contentUrl.trim()}
            >
              <Link size={20} className="mr-2" />
              {isUploading ? 'Processing...' : 'Share'}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center">
            <AlertCircle size={20} className="mr-2" />
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Supported Content Types</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Video files (MP4, MOV, AVI, etc.)</li>
          <li>Audio files (MP3, WAV, etc.)</li>
          <li>Image files (JPG, PNG, GIF, etc.)</li>
          <li>Documents (PDF, DOC, DOCX, TXT)</li>
          <li>YouTube links</li>
        </ul>
      </div>
    </div>
  );
};

export default ContentUploader;