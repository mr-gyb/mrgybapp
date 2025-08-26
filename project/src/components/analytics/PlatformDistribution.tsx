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
      

    </div>
  );
};

export default PlatformDistribution;
