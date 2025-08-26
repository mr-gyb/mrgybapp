import React, { useEffect, useState } from 'react';
import { useUserContent } from '../hooks/useUserContent';
import { useContentPerformance } from '../hooks/useContentPerformance';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

const ContentUpdateDebugger: React.FC = () => {
  const { content: userContent } = useUserContent();
  const { performanceData, isTracking } = useContentPerformance();
  const [contentChanges, setContentChanges] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Monitor all content changes
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'media_content'), (snapshot) => {
      const changes = snapshot.docChanges().map(change => ({
        type: change.type,
        id: change.doc.id,
        timestamp: new Date(),
        data: change.doc.data()
      }));
      
      setContentChanges(prev => [...changes, ...prev].slice(0, 10)); // Keep last 10 changes
      setLastUpdate(new Date());
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-gray-100 p-4 rounded-lg mb-4">
      <h3 className="text-lg font-semibold mb-2">Content Update Debugger</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <h4 className="font-medium">Status</h4>
          <p>Tracking: {isTracking ? '✅ Active' : '❌ Inactive'}</p>
          <p>Content Items: {userContent.length}</p>
          <p>Performance Items: {performanceData.length}</p>
          <p>Last Update: {lastUpdate.toLocaleTimeString()}</p>
        </div>
        
        <div>
          <h4 className="font-medium">Recent Content Changes</h4>
          <div className="space-y-1">
            {contentChanges.slice(0, 5).map((change, index) => (
              <div key={index} className="text-xs">
                <span className={`px-1 rounded ${
                  change.type === 'added' ? 'bg-green-200' :
                  change.type === 'modified' ? 'bg-yellow-200' :
                  'bg-red-200'
                }`}>
                  {change.type}
                </span>
                <span className="ml-1">{change.id.slice(0, 8)}...</span>
                <span className="ml-1 text-gray-500">
                  {change.timestamp.toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-medium">Performance Data</h4>
          <div className="space-y-1">
            {performanceData.slice(0, 3).map((item) => (
              <div key={item.contentId} className="text-xs">
                <span>{item.contentId.slice(0, 8)}...</span>
                <span className="ml-1 font-medium">{item.totalViews} views</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentUpdateDebugger;
