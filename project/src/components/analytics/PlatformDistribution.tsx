import React from 'react';
import PlatformPieChart from './PlatformPieChart';

interface PlatformDistributionProps {
  platformData: Array<{ name: string; value: number; percentage: number; color: string }>;
  COLORS: string[] | Record<string, string>;
  renderCustomPieLabel: (props: any) => React.ReactNode;
  title?: string;
  className?: string;
  showEmptyState?: boolean;
  emptyStateMessage?: string;
}

const PlatformDistribution: React.FC<PlatformDistributionProps> = ({
  platformData,
  COLORS,
  renderCustomPieLabel,
  title = "Platform Distribution",
  className = "",
  showEmptyState = true,
  emptyStateMessage = "No platform data available"
}) => {
  const hasData = platformData && platformData.length > 0 && platformData.some(d => d.value > 0);

  return (
    <div className={`bg-white p-6 rounded-lg shadow ${className}`}>
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      
      {/* Platform Distribution Pie Chart */}
      <PlatformPieChart
        platformData={platformData}
        COLORS={COLORS}
        renderCustomPieLabel={renderCustomPieLabel}
      />
      
      {/* Empty State Message */}
      {showEmptyState && !hasData && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-lg font-medium">{emptyStateMessage}</p>
          <p className="text-sm text-gray-400 mt-2">
            Upload content with different platforms to see distribution data
          </p>
        </div>
      )}
      
      {/* Platform Summary */}
      {hasData && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Platform Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {platformData
              .filter(item => item.value > 0)
              .sort((a, b) => b.value - a.value)
              .slice(0, 6)
              .map((platform, index) => (
                <div key={platform.name} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: platform.color }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {platform.name}
                  </span>
                  <span className="text-xs text-gray-500 ml-auto">
                    {platform.value}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlatformDistribution;
