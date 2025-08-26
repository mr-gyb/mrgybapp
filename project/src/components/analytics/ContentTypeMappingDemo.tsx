import React, { useState } from 'react';
import { useContentTypeAnalytics } from '../../hooks/useContentTypeAnalytics';
import ContentTypeDistribution from './ContentTypeDistribution';
import PlatformDistribution from './PlatformDistribution';
import contentTypeMappingService from '../../services/contentTypeMapping.service';

const ContentTypeMappingDemo: React.FC = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const { analyticsData, isLoading, error, getAllPlatforms, getPlatformsByCategory } = useContentTypeAnalytics();

  const handlePlatformSelect = (platform: string) => {
    setSelectedPlatform(platform);
  };

  const getMappingInfo = (platform: string) => {
    if (!platform) return null;
    return contentTypeMappingService.getContentTypeMapping(platform);
  };

  const selectedMapping = getMappingInfo(selectedPlatform);
  const allPlatforms = getAllPlatforms();
  const socialMediaPlatforms = getPlatformsByCategory('social-media');
  const videoPlatforms = getPlatformsByCategory('video');
  const audioPlatforms = getPlatformsByCategory('audio');
  const blogPlatforms = getPlatformsByCategory('blog');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-blue mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading content type analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-red-800 mb-2">Error Loading Analytics</h2>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Content Type Distribution Mapping Demo</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            This demo showcases how platform selection automatically maps to content types and platform categories.
            When users select platforms like Facebook, Instagram, or Pinterest, the system automatically sets the content type
            and categorizes it as "Social Media" in the platform distribution.
          </p>
        </div>

        {/* Platform Selection Demo */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Platform Selection Demo</h2>
          <p className="text-gray-600 mb-4">
            Select a platform to see how it automatically maps to content type and platform category:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Social Media Platforms */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Social Media</h3>
              <div className="space-y-2">
                {socialMediaPlatforms.map(platform => (
                  <button
                    key={platform}
                    onClick={() => handlePlatformSelect(platform)}
                    className={`w-full px-3 py-2 text-sm rounded-md border transition-colors ${
                      selectedPlatform === platform
                        ? 'bg-navy-blue text-white border-navy-blue'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </div>

            {/* Video Platforms */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Video</h3>
              <div className="space-y-2">
                {videoPlatforms.map(platform => (
                  <button
                    key={platform}
                    onClick={() => handlePlatformSelect(platform)}
                    className={`w-full px-3 py-2 text-sm rounded-md border transition-colors ${
                      selectedPlatform === platform
                        ? 'bg-navy-blue text-white border-navy-blue'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </div>

            {/* Audio Platforms */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Audio</h3>
              <div className="space-y-2">
                {audioPlatforms.map(platform => (
                  <button
                    key={platform}
                    onClick={() => handlePlatformSelect(platform)}
                    className={`w-full px-3 py-2 text-sm rounded-md border transition-colors ${
                      selectedPlatform === platform
                        ? 'bg-navy-blue text-white border-navy-blue'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </div>

            {/* Blog Platforms */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Blog</h3>
              <div className="space-y-2">
                {blogPlatforms.map(platform => (
                  <button
                    key={platform}
                    onClick={() => handlePlatformSelect(platform)}
                    className={`w-full px-3 py-2 text-sm rounded-md border transition-colors ${
                      selectedPlatform === platform
                        ? 'bg-navy-blue text-white border-navy-blue'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {platform}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mapping Display */}
          {selectedMapping && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Content Type Mapping</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-blue-700">Platform:</span>
                  <span className="ml-2 text-blue-800">{selectedPlatform}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-700">Content Type:</span>
                  <span className="ml-2 text-blue-800">{selectedMapping.contentType}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-700">Platform Category:</span>
                  <span className="ml-2 text-blue-800">{selectedMapping.platformCategory}</span>
                </div>
              </div>
              <p className="text-blue-600 text-xs mt-2">
                This mapping is automatically applied when users select platforms during content upload.
              </p>
            </div>
          )}
        </div>

        {/* Analytics Display */}
        {analyticsData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Content Type Distribution */}
            <ContentTypeDistribution
              barData={analyticsData.barData}
              userContent={[]} // This will be handled by the hook
              blogTypes={analyticsData.blogTypes}
              audioTypes={analyticsData.audioTypes}
              socialMediaTypes={analyticsData.socialMediaTypes}
              otherTypes={analyticsData.otherTypes}
              CONTENT_TYPE_COLORS={analyticsData.contentTypeColors}
              LEGEND_KEYS={analyticsData.legendKeys}
              CustomBarTooltip={({ active, payload, label }: any) => {
                if (active && payload && payload.length) {
                  const barData = payload[0].payload;
                  return (
                    <div className="bg-white p-3 rounded shadow text-sm border border-gray-200">
                      <div className="font-semibold mb-1">{label}</div>
                      <div>Content Count: {barData.count}</div>
                      <div>View Count: {barData.views}</div>
                    </div>
                  );
                }
                return null;
              }}
              title="Content Type Distribution (Auto-Mapped)"
            />
            
            {/* Platform Distribution */}
            <PlatformDistribution
              platformData={analyticsData.platformData}
              COLORS={analyticsData.platformColors}
              renderCustomPieLabel={({ cx, cy, midAngle, outerRadius, percent, name }: any) => {
                if (percent === 0) return null;
                const RADIAN = Math.PI / 180;
                const radius = outerRadius + 10;
                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                const y = cy + radius * Math.sin(-midAngle * RADIAN);
                return (
                  <text 
                    x={x} 
                    y={y} 
                    fill="#333" 
                    textAnchor={x > cx ? 'start' : 'end'} 
                    dominantBaseline="central" 
                    fontSize={12} 
                    fontWeight={400}
                  >
                    {`${name} ${(percent * 100).toFixed(0)}%`}
                  </text>
                );
              }}
              title="Platform Distribution (Auto-Categorized)"
            />
          </div>
        )}

        {/* How It Works */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h2 className="text-2xl font-bold mb-4">How Content Type Distribution Mapping Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-navy-blue">1. Platform Selection</h3>
              <p className="text-gray-600 text-sm mb-3">
                Users select exactly one platform when uploading content (e.g., Facebook, Instagram, Pinterest)
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Facebook → Content Type: Facebook</li>
                <li>• Instagram → Content Type: Instagram</li>
                <li>• Pinterest → Content Type: Pinterest</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2 text-navy-blue">2. Automatic Categorization</h3>
              <p className="text-gray-600 text-sm mb-3">
                All social media platforms are automatically categorized as "Social Media" in platform distribution
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Facebook → Platform Category: social-media</li>
                <li>• Instagram → Platform Category: social-media</li>
                <li>• Pinterest → Platform Category: social-media</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-green-800">Benefits</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• <strong>Automatic Classification:</strong> No manual content type selection needed</li>
              <li>• <strong>Consistent Analytics:</strong> All social media content grouped together</li>
              <li>• <strong>Accurate Reporting:</strong> Platform distribution shows real category breakdown</li>
              <li>• <strong>User Experience:</strong> Simplified platform selection process</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentTypeMappingDemo;
