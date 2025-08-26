import React, { useEffect, useState } from 'react';
import { TrendingUp, Eye, RefreshCw } from 'lucide-react';
import { useUserContent } from '../hooks/useUserContent';
import { useContentPerformance } from '../hooks/useContentPerformance';

interface ViewCountDisplayProps {
  className?: string;
}

const ViewCountDisplay: React.FC<ViewCountDisplayProps> = ({ className = '' }) => {
  const { content: userContent } = useUserContent();
  const { 
    performanceData, 
    isLoading, 
    updateAllContentPerformance,
    isTracking,
    startTracking,
    stopTracking 
  } = useContentPerformance();
  
  const [totalViews, setTotalViews] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  // Calculate total views from performance data
  useEffect(() => {
    const total = performanceData.reduce((sum, item) => sum + item.totalViews, 0);
    setTotalViews(total);
  }, [performanceData]);

  // Auto-start tracking when component mounts
  useEffect(() => {
    if (!isTracking) {
      startTracking(5); // Update every 5 minutes
    }
  }, [isTracking, startTracking]);

  // Refresh performance data periodically
  useEffect(() => {
    if (isTracking) {
      const interval = setInterval(() => {
        updateAllContentPerformance();
      }, 60000); // Refresh every minute

      return () => clearInterval(interval);
    }
  }, [isTracking, updateAllContentPerformance]);

  const handleManualUpdate = async () => {
    setIsUpdating(true);
    try {
      await updateAllContentPerformance();
    } catch (error) {
      console.error('Error updating view counts:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Eye className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900">Total Views</h3>
        </div>
        <button
          onClick={handleManualUpdate}
          disabled={isUpdating}
          className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="text-center">
        <div className="text-3xl font-bold text-gray-900 mb-2">
          {formatNumber(totalViews)}
        </div>
        <div className="flex items-center justify-center space-x-1 text-sm text-gray-600">
          <TrendingUp className="w-4 h-4 text-green-500" />
          <span>Live tracking active</span>
        </div>
      </div>
    </div>
  );
};

export default ViewCountDisplay;
