import React from 'react';
import { ContentItem } from '../../types/content';
import AssetPreview from './AssetPreview';
import PlatformSelector from './PlatformSelector';
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';

interface ContentWorkflowProps {
  content: ContentItem;
  onUpdateContent: (updatedContent: ContentItem) => void;
}

const ContentWorkflow: React.FC<ContentWorkflowProps> = ({ content, onUpdateContent }) => {
  const handleAssetApprove = (assetId: string) => {
    onUpdateContent({
      ...content,
      generatedAssets: content.generatedAssets.map(asset =>
        asset.id === assetId ? { ...asset, status: 'approved' } : asset
      )
    });
  };

  const handleAssetReject = (assetId: string) => {
    onUpdateContent({
      ...content,
      generatedAssets: content.generatedAssets.map(asset =>
        asset.id === assetId ? { ...asset, status: 'rejected' } : asset
      )
    });
  };

  const handlePlatformToggle = (platformId: string) => {
    onUpdateContent({
      ...content,
      platforms: content.platforms.includes(platformId)
        ? content.platforms.filter(p => p !== platformId)
        : [...content.platforms, platformId]
    });
  };

  // Group assets by type for organized review
  const assetsByType = content.generatedAssets.reduce((acc, asset) => {
    if (!acc[asset.type]) {
      acc[asset.type] = [];
    }
    acc[asset.type].push(asset);
    return acc;
  }, {} as Record<string, typeof content.generatedAssets>);

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold mb-4">AI-Generated Content</h2>
        <div className="space-y-6">
          {Object.entries(assetsByType).map(([type, assets]) => (
            <div key={type} className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 capitalize">
                {type} Variations
              </h3>
              <div className="grid grid-cols-1 gap-6">
                {assets.map((asset) => (
                  <div key={asset.id} className="bg-white p-4 rounded-lg shadow-sm">
                    <AssetPreview
                      asset={asset}
                      onApprove={() => handleAssetApprove(asset.id)}
                      onReject={() => handleAssetReject(asset.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Distribution Platforms</h2>
        <p className="text-gray-600 mb-4">
          Select platforms to publish the approved content:
        </p>
        <PlatformSelector
          selectedPlatforms={content.platforms}
          onPlatformToggle={handlePlatformToggle}
        />
      </section>

      <section className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Publishing Summary</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-4 border-b">
            <span className="font-semibold">Approved Assets:</span>
            <span className="text-green-600">
              {content.generatedAssets.filter(a => a.status === 'approved').length} / {content.generatedAssets.length}
            </span>
          </div>
          <div className="flex justify-between items-center pb-4 border-b">
            <span className="font-semibold">Selected Platforms:</span>
            <span className="text-navy-blue">
              {content.platforms.length}
            </span>
          </div>
          <div className="flex justify-end pt-4">
            <button
              className={`px-6 py-2 rounded-full ${
                content.generatedAssets.some(a => a.status === 'approved') && content.platforms.length > 0
                  ? 'bg-navy-blue text-white hover:bg-opacity-90'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!content.generatedAssets.some(a => a.status === 'approved') || content.platforms.length === 0}
            >
              Publish Approved Content
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContentWorkflow;