import React, { Suspense, lazy } from 'react';

// Lazy load the CreationInspirations component
const CreationInspirationsLazy = lazy(() => import('./CreationInspirationsLazy'));

interface CreationInspirationsLazyWrapperProps {
  limit?: number;
  showRefreshButton?: boolean;
  onSuggestionsGenerated?: (suggestions: { title: string; explanation: string; url: string; image: string }[]) => void;
}

const CreationInspirationsLazyWrapper: React.FC<CreationInspirationsLazyWrapperProps> = (props) => {
  return (
    <Suspense fallback={
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Creation Inspirations</h2>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Creation Inspirations...</p>
        </div>
      </div>
    }>
      <CreationInspirationsLazy {...props} />
    </Suspense>
  );
};

export default CreationInspirationsLazyWrapper;
