import React from 'react';
import ContentTypeBarChart from './ContentTypeBarChart';

interface ContentTypeDistributionProps {
  barData: any[];
  userContent: any[];
  blogTypes: string[];
  audioTypes: string[];
  socialMediaTypes: string[];
  otherTypes: string[];
  CONTENT_TYPE_COLORS: Record<string, string>;
  LEGEND_KEYS: string[];
  CustomBarTooltip: React.FC<any>;
  isLoadingYouTubeData?: boolean;
  youtubeQuotaExceeded?: boolean;
  onResetQuota?: () => void;
  title?: string;
  className?: string;
}

const ContentTypeDistribution: React.FC<ContentTypeDistributionProps> = ({
  barData,
  userContent,
  blogTypes,
  audioTypes,
  socialMediaTypes,
  otherTypes,
  CONTENT_TYPE_COLORS,
  LEGEND_KEYS,
  CustomBarTooltip,
  isLoadingYouTubeData = false,
  youtubeQuotaExceeded = false,
  onResetQuota,
  title = "Content Type Distribution",
  className = ""
}) => {
  return (
    <div className={`bg-white p-6 rounded-lg shadow ${className}`}>
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      
      {/* YouTube API Loading State */}
      {isLoadingYouTubeData && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center text-blue-800">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-sm">Fetching YouTube view counts from API...</span>
          </div>
        </div>
      )}
      
      {/* YouTube API Quota Exceeded Warning */}
      {youtubeQuotaExceeded && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-between text-yellow-800">
            <div className="flex items-center">
              <div className="text-yellow-600 mr-2">⚠️</div>
              <div className="text-sm">
                <strong>YouTube API Quota Exceeded:</strong> Using calculated view counts from your content. 
                <a 
                  href="https://console.cloud.google.com/apis/credentials" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-yellow-700 underline ml-1 hover:text-yellow-900"
                >
                  Check your quota
                </a>
              </div>
            </div>
            {onResetQuota && (
              <button
                onClick={onResetQuota}
                className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-2 py-1 rounded transition-colors"
                title="Reset quota status and retry"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      )}

      {/* Content Type Bar Chart */}
      <ContentTypeBarChart
        barData={barData}
        userContent={userContent}
        blogTypes={blogTypes}
        audioTypes={audioTypes}
        socialMediaTypes={socialMediaTypes}
        otherTypes={otherTypes}
        CONTENT_TYPE_COLORS={CONTENT_TYPE_COLORS}
        LEGEND_KEYS={LEGEND_KEYS}
        CustomBarTooltip={CustomBarTooltip}
      />
    </div>
  );
};

export default ContentTypeDistribution;
