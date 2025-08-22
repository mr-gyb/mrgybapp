import React, { useState } from 'react';
import { Link as LinkIcon, ExternalLink, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { useLinkImageFetcher } from '../../hooks/useLinkImageFetcher';
import linkImageFetcherService from '../../services/linkImageFetcher.service';

const LinkImageFetcherDemo: React.FC = () => {
  const [testUrl, setTestUrl] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  
  const {
    linkImages,
    isLoading,
    errors,
    fetchImageForLink,
    hasImage,
    getImage,
    isImageLoading,
    clearAllImages
  } = useLinkImageFetcher();

  // Sample URLs for demonstration
  const sampleUrls = [
    'https://www.nytimes.com/2024/01/15/technology/ai-chatbots-news.html',
    'https://www.techcrunch.com/2024/01/15/startup-funding-ai/',
    'https://www.medium.com/@username/ai-content-creation-guide',
    'https://www.github.com/username/ai-project',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  ];

  const handleTestUrl = async () => {
    if (!testUrl.trim()) return;
    
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const result = await linkImageFetcherService.fetchImageFromLink(testUrl);
      setTestResult(result);
      
      if (result.success) {
        // Also fetch using the hook for demonstration
        await fetchImageForLink(testUrl);
      }
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSampleUrlClick = async (url: string) => {
    setTestUrl(url);
    await fetchImageForLink(url);
  };

  const handleRefreshAll = async () => {
    clearAllImages();
    await Promise.all(sampleUrls.map(url => fetchImageForLink(url)));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🔗 Link Image Fetcher Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            This demo showcases the automatic fetching and display of images associated with links in the content hub.
            When you add a link in the uploading section, the system automatically fetches and displays the associated image.
          </p>
        </div>

        {/* Test URL Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Test URL Image Fetching</h2>
          <div className="flex gap-4 mb-4">
            <input
              type="url"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="Enter a URL to test image fetching..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-blue focus:border-transparent"
            />
            <button
              onClick={handleTestUrl}
              disabled={isTesting || !testUrl.trim()}
              className="px-6 py-2 bg-navy-blue text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isTesting ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <ImageIcon size={16} />
                  Test URL
                </>
              )}
            </button>
          </div>

          {/* Test Result */}
          {testResult && (
            <div className={`p-4 rounded-lg ${
              testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <h3 className="font-semibold mb-2">
                {testResult.success ? '✅ Success' : '❌ Failed'}
              </h3>
              {testResult.success && testResult.data ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <img
                      src={testResult.data.imageUrl}
                      alt="Fetched image"
                      className="w-24 h-24 object-cover rounded-lg border"
                    />
                    <div className="flex-1">
                      <p><strong>Image URL:</strong> {testResult.data.imageUrl}</p>
                      <p><strong>Method:</strong> {testResult.data.method}</p>
                      {testResult.data.title && <p><strong>Title:</strong> {testResult.data.title}</p>}
                      {testResult.data.description && <p><strong>Description:</strong> {testResult.data.description}</p>}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-red-700">{testResult.error}</p>
              )}
            </div>
          )}
        </div>

        {/* Sample URLs Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Sample URLs</h2>
            <button
              onClick={handleRefreshAll}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Refresh All
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sampleUrls.map((url, index) => {
              const hasImageData = hasImage(url);
              const imageData = getImage(url);
              const loading = isImageLoading(url);
              const error = errors[url];
              
              return (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600 truncate">{url}</p>
                    </div>
                    <button
                      onClick={() => handleSampleUrlClick(url)}
                      className="ml-2 p-1 text-gray-400 hover:text-navy-blue transition-colors"
                      title="Fetch image for this URL"
                    >
                      <ExternalLink size={16} />
                    </button>
                  </div>

                  {/* Image Display */}
                  <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden mb-3">
                    {loading ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <RefreshCw size={24} className="animate-spin text-navy-blue mx-auto mb-2" />
                          <p className="text-xs text-gray-500">Loading...</p>
                        </div>
                      </div>
                    ) : hasImageData && imageData ? (
                      <>
                        <img
                          src={imageData.imageUrl}
                          alt="Fetched image"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        <div className="absolute bottom-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                          {imageData.method}
                        </div>
                      </>
                    ) : error ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center text-red-500">
                          <p className="text-xs">Error: {error}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center text-gray-400">
                          <LinkIcon size={24} className="mx-auto mb-2" />
                          <p className="text-xs">No image yet</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status */}
                  <div className="text-xs text-gray-500">
                    {loading && '🔄 Loading...'}
                    {hasImageData && '✅ Image loaded'}
                    {error && '❌ Error occurred'}
                    {!loading && !hasImageData && !error && '⏳ Ready to fetch'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-3">🔄 Automatic Image Fetching</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• When content with URLs is displayed, images are automatically fetched</li>
                <li>• Uses Open Graph, Twitter Cards, and Schema.org metadata</li>
                <li>• Falls back to first image found in HTML if no metadata</li>
                <li>• Handles CORS issues with proxy services</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-3">🎯 Content Hub Integration</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Images appear automatically in the content hub</li>
                <li>• Loading states show while fetching</li>
                <li>• Error handling with fallback icons</li>
                <li>• Visual indicators for link content</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-blue-50 rounded-lg p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <ImageIcon size={24} className="text-blue-600" />
              </div>
              <h3 className="font-semibold text-blue-900 mb-2">Rich Visual Content</h3>
              <p className="text-blue-700 text-sm">Links automatically display associated images for better visual appeal</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <RefreshCw size={24} className="text-blue-600" />
              </div>
              <h3 className="font-semibold text-blue-900 mb-2">Automatic Processing</h3>
              <p className="text-blue-700 text-sm">No manual work required - images are fetched automatically</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <LinkIcon size={24} className="text-blue-600" />
              </div>
              <h3 className="font-semibold text-blue-900 mb-2">Enhanced User Experience</h3>
              <p className="text-blue-700 text-sm">Users can see link previews without leaving the platform</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkImageFetcherDemo;
