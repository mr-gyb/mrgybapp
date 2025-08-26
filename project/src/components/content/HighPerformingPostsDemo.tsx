import React from 'react';
import HighPerformingPosts from './HighPerformingPosts';

const HighPerformingPostsDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            High-Performing Posts Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            This demo showcases the dynamic display of top 3 high-performing posts from Facebook, Instagram, and Pinterest. 
            The component automatically ranks posts by engagement rate and provides platform-specific filtering.
          </p>
        </div>

        {/* Component Demo */}
        <div className="space-y-8">
          {/* Default Configuration */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Default Configuration</h2>
            <HighPerformingPosts 
              showRefreshButton={true}
              onRefresh={() => console.log('Refresh requested')}
            />
          </div>

          {/* Without Refresh Button */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Without Refresh Button</h2>
            <HighPerformingPosts 
              showRefreshButton={false}
            />
          </div>
        </div>

        {/* Features Overview */}
        <div className="mt-12 bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Features Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800">🎯 Smart Ranking</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Automatically ranks by engagement rate</li>
                <li>• Shows top 3 posts per platform</li>
                <li>• Real-time performance metrics</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800">🔍 Platform Filtering</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Filter by Facebook, Instagram, Pinterest</li>
                <li>• View all platforms together</li>
                <li>• Platform-specific styling</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800">📊 Rich Metrics</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Views, likes, comments, shares</li>
                <li>• Engagement rate calculation</li>
                <li>• Reach and performance data</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800">🎨 Visual Design</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Platform-specific colors</li>
                <li>• Rank badges (#1, #2, #3)</li>
                <li>• Responsive grid layout</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800">⚡ Interactive Features</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Hover effects and animations</li>
                <li>• Direct links to posts</li>
                <li>• Refresh functionality</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800">🔄 Dynamic Content</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Real-time data updates</li>
                <li>• Loading and error states</li>
                <li>• Fallback mechanisms</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="mt-8 bg-gray-900 rounded-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-4">Technical Implementation</h2>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-2">Component Structure</h3>
              <ul className="text-gray-300 space-y-1">
                <li>• React functional component with TypeScript</li>
                <li>• State management with useState hooks</li>
                <li>• Responsive design with Tailwind CSS</li>
                <li>• Platform-specific icon and color mapping</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-green-400 mb-2">Data Handling</h3>
              <ul className="text-gray-300 space-y-1">
                <li>• Mock data with realistic engagement metrics</li>
                <li>• Dynamic filtering by platform</li>
                <li>• Smart ranking algorithm</li>
                <li>• Error handling and loading states</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-purple-400 mb-2">Integration</h3>
              <ul className="text-gray-300 space-y-1">
                <li>• Easy to integrate into existing components</li>
                <li>• Configurable refresh button</li>
                <li>• Customizable onRefresh callback</li>
                <li>• Responsive grid layout system</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HighPerformingPostsDemo;
