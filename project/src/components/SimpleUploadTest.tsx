import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { uploadMedia, testFirestoreConnection } from '../api/services/media.service';
import FirebaseDebug from './components/FirebaseDebug';
import { collection, addDoc, getDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const SimpleUploadTest: React.FC = () => {
  const { user } = useAuth();
  console.log('User authenticated:', user?.uid);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTestConnection = async () => {
    if (!user) {
      setError('Please log in first');
      return;
    }

    setIsUploading(true);
    setError(null);
    
    try {
      const testResult = await testFirestoreConnection(user.uid);
      setResult(testResult);
      console.log('Connection test result:', testResult);
    } catch (err: any) {
      setError(err.message);
      console.error('Connection test failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) {
      setError('Please select a file and ensure you are logged in');
      return;
    }

    setIsUploading(true);
    setError(null);
    
    try {
      console.log('Starting upload test with file:', file.name);
      const uploadResult = await uploadMedia(file, user.uid, ['instagram'], ['post']);
      setResult(uploadResult);
      console.log('Upload test result:', uploadResult);

      const contentRef = await addDoc(collection(db, 'new_content'), uploadResult);
    } catch (err: any) {
      setError(err.message);
      console.error('Upload test failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-white shadow-sm">
      <h2 className="text-xl font-bold mb-4">Firestore Upload Test</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">1. Test Firestore Connection</h3>
          <button
            onClick={handleTestConnection}
            disabled={isUploading || !user}
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
          >
            {isUploading ? 'Testing...' : 'Test Connection'}
          </button>
        </div>

        <div>
          <h3 className="font-semibold mb-2">2. Test File Upload</h3>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isUploading || !user}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            <strong>Success!</strong>
            <pre className="mt-2 text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        {!user && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
            Please log in to test the upload functionality
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleUploadTest;

<FirebaseDebug /> 