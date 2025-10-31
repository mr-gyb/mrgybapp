import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';

interface NetworkStatusProps {
  className?: string;
}

const NetworkStatus: React.FC<NetworkStatusProps> = ({ className = '' }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineWarning, setShowOfflineWarning] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineWarning(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineWarning(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className={`fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 ${className}`}>
        <WifiOff size={20} />
        <span className="text-sm font-medium">No Internet Connection</span>
        <button
          onClick={() => setShowOfflineWarning(false)}
          className="ml-2 text-white hover:text-gray-200"
          aria-label="Dismiss warning"
        >
          ×
        </button>
      </div>
    );
  }

  return null;
};

export default NetworkStatus;
