import React from 'react';
import { Map } from 'lucide-react';

const MapView: React.FC = () => {
  const isMapEnabled = import.meta.env.VITE_COMMUNITY_MAP_ENABLED === 'true';

  if (!isMapEnabled) {
    return null;
  }

  return (
    <div className="map-view-container">
      <div className="flex flex-col items-center justify-center h-96 bg-gray-100 dark:bg-gray-700 rounded-lg p-8">
        <Map size={64} className="text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Map View Coming Soon
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
          We're working on bringing you a map view of community posts. Check back soon!
        </p>
      </div>
    </div>
  );
};

export default MapView;

