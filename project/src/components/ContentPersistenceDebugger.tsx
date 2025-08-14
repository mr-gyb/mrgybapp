import React, { useEffect, useState } from 'react';
import { useUserContent } from '../hooks/useUserContent';
import { useAuth } from '../contexts/AuthContext';
import { contentPersistence } from '../utils/contentPersistence';
import { firebaseIndexHelper } from '../utils/firebaseIndexHelper';

const ContentPersistenceDebugger: React.FC = () => {
  const { user } = useAuth();
  const { content, isLoading, error, syncContent } = useUserContent();
  const [persistenceStats, setPersistenceStats] = useState<any>(null);
  const [allUserIds, setAllUserIds] = useState<string[]>([]);

  useEffect(() => {
    if (user?.uid) {
      const stats = contentPersistence.getContentStats(user.uid);
      setPersistenceStats(stats);
    }
    // Get all stored user IDs for debugging
    setAllUserIds(contentPersistence.getAllUserIds());
  }, [user?.uid, content.length]);

  if (!user?.uid) {
    return (
      <div className="bg-yellow-100 p-4 rounded-lg mb-4">
        <h3 className="text-lg font-semibold mb-2">Content Persistence Debugger</h3>
        <p className="text-sm text-yellow-800">No user authenticated</p>
        <div className="mt-2">
          <p className="text-xs text-gray-600">Stored user IDs: {allUserIds.length > 0 ? allUserIds.join(', ') : 'None'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-100 p-4 rounded-lg mb-4">
      <h3 className="text-lg font-semibold mb-2">Content Persistence Debugger</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <h4 className="font-medium">Current State</h4>
          <p>Loading: {isLoading ? '✅ Yes' : '❌ No'}</p>
          <p>Content Items: {content.length}</p>
          <p>Error: {error || 'None'}</p>
          <p>User ID: {user.uid.slice(0, 8)}...</p>
          <p>Has Stored Content: {contentPersistence.hasContent(user.uid) ? '✅ Yes' : '❌ No'}</p>
        </div>
        
        <div>
          <h4 className="font-medium">Persistence Stats</h4>
          <p>Has LocalStorage: {persistenceStats?.hasContent ? '✅ Yes' : '❌ No'}</p>
          <p>LocalStorage Items: {persistenceStats?.itemCount || 0}</p>
          <p>Last Updated: {persistenceStats?.lastUpdated ? new Date(persistenceStats.lastUpdated).toLocaleString() : 'Never'}</p>
          <p>Total Stored Users: {allUserIds.length}</p>
        </div>

        <div>
          <h4 className="font-medium">Authentication</h4>
          <p>Authenticated: {user?.uid ? '✅ Yes' : '❌ No'}</p>
          <p>User Email: {user?.email || 'N/A'}</p>
          <p>Auth State: {user ? 'Active' : 'Inactive'}</p>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="font-medium mb-2">Content Items:</h4>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {content.length > 0 ? (
            content.map((item, index) => (
              <div key={item.id} className="text-xs bg-white p-2 rounded">
                <span className="font-medium">{index + 1}.</span> {item.title || 'Untitled'} 
                <span className="text-gray-500 ml-2">({item.type})</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-600">No content items</p>
          )}
        </div>
      </div>

      <div className="mt-4 flex space-x-2">
        <button
          onClick={() => {
            if (user?.uid) {
              contentPersistence.clearContent(user.uid);
              setPersistenceStats(contentPersistence.getContentStats(user.uid));
            }
          }}
          className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear LocalStorage
        </button>
        <button
          onClick={() => {
            if (user?.uid) {
              setPersistenceStats(contentPersistence.getContentStats(user.uid));
              setAllUserIds(contentPersistence.getAllUserIds());
            }
          }}
          className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh Stats
        </button>
        <button
          onClick={() => {
            setAllUserIds(contentPersistence.getAllUserIds());
          }}
          className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
        >
          Show All Users
        </button>
        <button
          onClick={() => {
            if (user?.uid) {
              // Trigger content synchronization
              syncContent();
            }
          }}
          className="px-3 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Test Sync
        </button>
      </div>

      {allUserIds.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium mb-2">All Stored Users:</h4>
          <div className="text-xs bg-white p-2 rounded">
            {allUserIds.map((uid, index) => (
              <div key={uid} className="flex justify-between">
                <span>{index + 1}. {uid.slice(0, 8)}...</span>
                <span className={uid === user.uid ? 'text-green-600 font-medium' : 'text-gray-500'}>
                  {uid === user.uid ? 'Current' : 'Other'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Firebase Index Information */}
      <div className="mt-4">
        <h4 className="font-medium mb-2">Firebase Indexes:</h4>
        <div className="text-xs bg-yellow-50 p-2 rounded border border-yellow-200">
          <p className="text-yellow-800 mb-2">
            <strong>Note:</strong> For optimal performance, consider creating these Firebase indexes:
          </p>
          {firebaseIndexHelper.getRequiredIndexes().map((index, i) => (
            <div key={i} className="mb-1 text-yellow-700">
              <span className="font-medium">{index.collection}:</span> {index.fields.join(', ')}
            </div>
          ))}
          <button
            onClick={() => firebaseIndexHelper.openIndexConsole()}
            className="mt-2 px-2 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Open Firebase Console
          </button>
        </div>
      </div>

      {/* Rate Limit Information */}
      <div className="mt-4">
        <h4 className="font-medium mb-2">API Rate Limits:</h4>
        <div className="text-xs bg-red-50 p-2 rounded border border-red-200">
          <p className="text-red-800 mb-2">
            <strong>Note:</strong> If you're seeing OpenAI rate limit errors:
          </p>
          <ul className="text-red-700 space-y-1">
            <li>• Wait a few minutes before retrying</li>
            <li>• Rate limits reset every minute</li>
            <li>• Consider upgrading your OpenAI plan for higher limits</li>
            <li>• Check your usage at <a href="https://platform.openai.com/usage" target="_blank" rel="noopener noreferrer" className="underline">OpenAI Usage</a></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ContentPersistenceDebugger;
