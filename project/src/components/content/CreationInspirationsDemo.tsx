import React, { useState } from 'react';
import CreationInspirations from './CreationInspirations';
import { Sparkles, Settings, RefreshCw } from 'lucide-react';

const CreationInspirationsDemo: React.FC = () => {
  const [useNewSystem, setUseNewSystem] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Sparkles className="text-blue-600" size={32} />
            <h1 className="text-4xl font-bold text-gray-900">Creation Inspirations Demo</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience the new AI-powered content inspiration system that analyzes your content hub 
            and provides personalized suggestions from diverse platforms.
          </p>
        </div>

        {/* System Toggle */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">System Configuration</h2>
              <p className="text-sm text-gray-600">
                Toggle between the new AI-powered system and the legacy trending content system
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <Settings size={20} />
                <span>Settings</span>
              </button>
              
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">System:</span>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setUseNewSystem(true)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      useNewSystem 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    New AI System
                  </button>
                  <button
                    onClick={() => setUseNewSystem(false)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      !useNewSystem 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Legacy System
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">New AI System Features</h3>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Content Hub data analysis</li>
                    <li>• OpenAI API integration</li>
                    <li>• URL validation & cleaning</li>
                    <li>• Platform diversity enforcement</li>
                    <li>• Fallback suggestions</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Legacy System Features</h3>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Social media trending content</li>
                    <li>• Basic AI suggestions</li>
                    <li>• Platform-based filtering</li>
                    <li>• Manual refresh</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">Current Status</h3>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${useNewSystem ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                      <span>{useNewSystem ? 'New AI System Active' : 'Legacy System Active'}</span>
                    </div>
                    <div>• Content analysis: {useNewSystem ? 'Enabled' : 'Disabled'}</div>
                    <div>• URL validation: {useNewSystem ? 'Enabled' : 'Disabled'}</div>
                    <div>• Platform diversity: {useNewSystem ? 'Enforced' : 'Basic'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Feature Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Sparkles className="text-blue-600" size={20} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">AI-Powered Analysis</h3>
            </div>
            <p className="text-sm text-gray-600">
              Analyzes your content hub data to understand your content types, platforms, and engagement patterns.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <RefreshCw className="text-green-600" size={20} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Smart Validation</h3>
            </div>
            <p className="text-sm text-gray-600">
              Validates URLs for accessibility, removes tracking parameters, and ensures content is globally accessible.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-lg font-bold">🎯</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Platform Diversity</h3>
            </div>
            <p className="text-sm text-gray-600">
              Ensures suggestions come from different platforms (YouTube, Instagram, Spotify, etc.) for variety.
            </p>
          </div>
        </div>

        {/* Main Component */}
        <CreationInspirations 
          limit={3}
          showRefreshButton={true}
          useNewSystem={useNewSystem}
          onSuggestionsGenerated={(suggestions) => {
            console.log('Suggestions generated:', suggestions);
          }}
        />

        {/* Footer Info */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>
            This demo showcases the new Creation Inspirations feature. 
            {useNewSystem ? (
              <span className="text-blue-600 font-medium">
                {' '}Currently using the new AI-powered system with Content Hub analysis and URL validation.
              </span>
            ) : (
              <span className="text-blue-600 font-medium">
                {' '}Currently using the legacy trending content system.
              </span>
            )}
          </p>
          <p className="mt-2">
            Toggle between systems above to see the difference in functionality and user experience.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreationInspirationsDemo;
