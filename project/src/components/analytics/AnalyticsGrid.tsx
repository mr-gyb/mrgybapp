import React from 'react';
import ContentTypeDistribution from './ContentTypeDistribution';
import PlatformDistribution from './PlatformDistribution';

interface AnalyticsGridProps {
  // Content Type Distribution props
  barData: any[];
  userContent: any[];
  blogTypes: string[];
  audioTypes: string[];
  socialMediaTypes: string[];
  otherTypes: string[];
  CONTENT_TYPE_COLORS: Record<string, string>;
  LEGEND_KEYS: string[];
  CustomBarTooltip: React.FC<any>;
  
  // Platform Distribution props
  platformData: Array<{ name: string; value: number; percentage: number; color: string }>;
  COLORS: string[] | Record<string, string>;
  renderCustomPieLabel: (props: any) => React.ReactNode;
  
  // Common props
  isLoadingYouTubeData?: boolean;
  youtubeQuotaExceeded?: boolean;
  onResetQuota?: () => void;
  
  // Layout props
  gridCols?: '1' | '2' | '3';
  gap?: '4' | '6' | '8' | '12';
  className?: string;
  
  // Custom titles
  contentTypeTitle?: string;
  platformTitle?: string;
  
  // Show/hide options
  showContentType?: boolean;
  showPlatform?: boolean;
}

const AnalyticsGrid: React.FC<AnalyticsGridProps> = ({
  // Content Type Distribution props
  barData,
  userContent,
  blogTypes,
  audioTypes,
  socialMediaTypes,
  otherTypes,
  CONTENT_TYPE_COLORS,
  LEGEND_KEYS,
  CustomBarTooltip,
  
  // Platform Distribution props
  platformData,
  COLORS,
  renderCustomPieLabel,
  
  // Common props
  isLoadingYouTubeData = false,
  youtubeQuotaExceeded = false,
  onResetQuota,
  
  // Layout props
  gridCols = '2',
  gap = '12',
  className = "",
  
  // Custom titles
  contentTypeTitle = "Content Type Distribution",
  platformTitle = "Platform Distribution",
  
  // Show/hide options
  showContentType = true,
  showPlatform = true
}) => {
  const gridColsClass = {
    '1': 'grid-cols-1',
    '2': 'grid-cols-1 md:grid-cols-2',
    '3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
  };
  
  const gapClass = {
    '4': 'gap-4',
    '6': 'gap-6',
    '8': 'gap-8',
    '12': 'gap-12'
  };

  return (
    <div className={`grid ${gridColsClass[gridCols]} ${gapClass[gap]} mb-8 ${className}`}>
      {/* Content Type Distribution */}
      {showContentType && (
        <ContentTypeDistribution
          barData={barData}
          userContent={userContent}
          blogTypes={blogTypes}
          audioTypes={audioTypes}
          socialMediaTypes={socialMediaTypes}
          otherTypes={otherTypes}
          CONTENT_TYPE_COLORS={CONTENT_TYPE_COLORS}
          LEGEND_KEYS={LEGEND_KEYS}
          CustomBarTooltip={CustomBarTooltip}
          isLoadingYouTubeData={isLoadingYouTubeData}
          youtubeQuotaExceeded={youtubeQuotaExceeded}
          onResetQuota={onResetQuota}
          title={contentTypeTitle}
        />
      )}
      
      {/* Platform Distribution */}
      {showPlatform && (
        <PlatformDistribution
          platformData={platformData}
          COLORS={COLORS}
          renderCustomPieLabel={renderCustomPieLabel}
          title={platformTitle}
        />
      )}
    </div>
  );
};

export default AnalyticsGrid;
