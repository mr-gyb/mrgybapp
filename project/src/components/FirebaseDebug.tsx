import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';

const FirebaseDebug: React.FC = () => {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runDebugTest = async () => {
    setIsLoading(true);
    const info: any = {};

    try {
      // 1. Check Firebase configuration
      console.log('🔍 Checking Firebase configuration...');
      info.firebaseConfig = {
        projectId: db.app.options.projectId,
        appId: db.app.options.appId,
        authDomain: db.app.options.authDomain,
        storageBucket: db.app.options.storageBucket,
        messagingSenderId: db.app.options.messagingSenderId
      };

      // 2. Check authentication state
      console.log('🔍 Checking authentication state...');
      info.authState = {
        isAuthenticated: !!user,
        userId: user?.uid,
        email: user?.email,
        displayName: user?.displayName,
        emailVerified: user?.emailVerified
      };

      // 3. Check Firestore connection
      console.log('🔍 Testing Firestore connection...');
      try {
        const testData = {
          test: true,
          timestamp: new Date().toISOString(),
          userId: user?.uid || 'no-user'
        };
        
        const testRef = await addDoc(collection(db, 'debug_test'), testData);
        info.firestoreTest = {
          success: true,
          documentId: testRef.id,
          path: testRef.path
        };
        
        // Clean up test document
        console.log('🧹 Cleaning up test document...');
        // Note: You might want to implement delete functionality
        
      } catch (firestoreError: any) {
        info.firestoreTest = {
          success: false,
          error: firestoreError.message,
          code: firestoreError.code
        };
      }

      // 4. Check new_content collection access
      console.log('🔍 Testing new_content collection access...');
      try {
        const testContentData = {
          userId: user?.uid || 'test-user',
          title: 'Debug Test Content',
          description: 'This is a debug test',
          contentType: 'test',
          status: 'test',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        const contentRef = await addDoc(collection(db, 'new_content'), testContentData);
        info.newContentTest = {
          success: true,
          documentId: contentRef.id,
          path: contentRef.path
        };
        
      } catch (contentError: any) {
        info.newContentTest = {
          success: false,
          error: contentError.message,
          code: contentError.code
        };
      }

      // 5. Check existing documents in new_content
      console.log('🔍 Checking existing documents in new_content...');
      try {
        const snapshot = await getDocs(collection(db, 'new_content'));
        info.existingDocuments = {
          count: snapshot.size,
          docs: snapshot.docs.map(doc => ({
            id: doc.id,
            data: doc.data()
          }))
        };
      } catch (listError: any) {
        info.existingDocuments = {
          error: listError.message,
          code: listError.code
        };
      }

      setDebugInfo(info);
      console.log('✅ Debug test completed:', info);

    } catch (error: any) {
      console.error('❌ Debug test failed:', error);
      setDebugInfo({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-white shadow-sm">
      <h2 className="text-xl font-bold mb-4">Firebase Debug Information</h2>
      
      <button
        onClick={runDebugTest}
        disabled={isLoading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-300 mb-4"
      >
        {isLoading ? 'Running Debug Test...' : 'Run Debug Test'}
      </button>

      {debugInfo && (
        <div className="space-y-4">
          {debugInfo.error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <strong>Error:</strong> {debugInfo.error}
            </div>
          ) : (
            <>
              <div className="bg-blue-50 border border-blue-200 p-4 rounded">
                <h3 className="font-semibold mb-2">Firebase Configuration</h3>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(debugInfo.firebaseConfig, null, 2)}
                </pre>
              </div>

              <div className="bg-green-50 border border-green-200 p-4 rounded">
                <h3 className="font-semibold mb-2">Authentication State</h3>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(debugInfo.authState, null, 2)}
                </pre>
              </div>

              <div className={`border p-4 rounded ${debugInfo.firestoreTest?.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <h3 className="font-semibold mb-2">Firestore Connection Test</h3>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(debugInfo.firestoreTest, null, 2)}
                </pre>
              </div>

              <div className={`border p-4 rounded ${debugInfo.newContentTest?.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <h3 className="font-semibold mb-2">New Content Collection Test</h3>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(debugInfo.newContentTest, null, 2)}
                </pre>
              </div>

              <div className="bg-gray-50 border border-gray-200 p-4 rounded">
                <h3 className="font-semibold mb-2">Existing Documents in new_content</h3>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(debugInfo.existingDocuments, null, 2)}
                </pre>
              </div>
            </>
          )}
        </div>
      )}

      {!user && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          Please log in to run the debug test
        </div>
      )}
    </div>
  );
};

export default FirebaseDebug; 