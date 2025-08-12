import React, { useState } from 'react';
import { testFirestoreConnection } from '../api/services/media.service';
import { useAuth } from '../contexts/AuthContext';

const TestFirestore: React.FC = () => {
  const { user } = useAuth();
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  const handleTest = async () => {
    if (!user) {
      alert('Please log in first');
      return;
    }

    setIsTesting(true);
    try {
      const result = await testFirestoreConnection(user.uid);
      setTestResult(result);
      console.log('Test result:', result);
    } catch (error: any) {
      console.error('Test failed:', error);
      setTestResult({ success: false, error: error.message });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">Firestore Connection Test</h3>
      
      <button
        onClick={handleTest}
        disabled={isTesting || !user}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300"
      >
        {isTesting ? 'Testing...' : 'Test Firestore Connection'}
      </button>

      {testResult && (
        <div className="mt-4 p-4 border rounded">
          <h4 className="font-semibold mb-2">Test Result:</h4>
          <pre className="bg-white p-2 rounded text-sm overflow-auto">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}

      {!user && (
        <p className="text-red-500 mt-2">Please log in to test Firestore connection</p>
      )}
    </div>
  );
};

export default TestFirestore; 