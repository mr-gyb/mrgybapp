import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';

interface ContentTypeBarChartProps {
  barData: any[];
  userContent: any[];
  blogTypes: string[];
  audioTypes: string[];
  socialMediaTypes: string[];
  otherTypes: string[];
  CONTENT_TYPE_COLORS: Record<string, string>;
  LEGEND_KEYS: string[];
  CustomBarTooltip: React.FC<any>;
}

const ContentTypeBarChart: React.FC<ContentTypeBarChartProps> = ({
  barData,
  userContent,
  blogTypes,
  audioTypes,
  socialMediaTypes,
  otherTypes,
  CONTENT_TYPE_COLORS,
  LEGEND_KEYS,
  CustomBarTooltip
}) => {
  // Responsive bar size and label font size
  const [containerWidth, setContainerWidth] = React.useState<number>(0);
  const chartContainerRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    function handleResize() {
      if (chartContainerRef.current) {
        setContainerWidth(chartContainerRef.current.offsetWidth);
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine if we're on mobile
  const isMobile = containerWidth < 768;
  const isTablet = containerWidth >= 768 && containerWidth < 1024;
  
  // Responsive chart height
  const chartHeight = isMobile ? 400 : isTablet ? 350 : 340;
  
  // Responsive bar sizing
  const numBarGroups = barData.length;
  const minBarWidth = isMobile ? 40 : isTablet ? 50 : 65;
  const maxBarWidth = isMobile ? 90 : isTablet ? 110 : 125;
  
  const barSize = containerWidth && numBarGroups > 0
    ? Math.min(
        Math.max(Math.floor(containerWidth / numBarGroups) - (isMobile ? 8 : 16), minBarWidth),
        maxBarWidth
      )
    : minBarWidth;

  // Responsive label font size
  const labelFontSize = isMobile ? 10 : isTablet ? 12 : 14;
  const legendFontSize = isMobile ? 10 : isTablet ? 11 : 12;

  // Limit to fewer categories on mobile for better readability
  let displayData = barData;
  const maxCategories = isMobile ? 6 : isTablet ? 10 : 15;
  
  if (displayData.length > maxCategories) {
    displayData = [...displayData]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, maxCategories);
  }

  return (
    <div ref={chartContainerRef} className="w-full">
      {displayData.length === 0 ? (
        <div className="text-gray-500 text-center py-12">No content data available for chart.</div>
      ) : (
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart 
            data={displayData}
            barCategoryGap={isMobile ? 4 : 8}
            barGap={isMobile ? 2 : 4}
            margin={{
              top: isMobile ? 20 : 30,
              right: isMobile ? 15 : 25,
              left: isMobile ? 15 : 25,
              bottom: isMobile ? 100 : 100
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name"
              interval={0}
              tick={(props) => {
                const { x, y, payload } = props;
                return (
                  <text
                    x={x}
                    y={y + (isMobile ? 35 : 20)}
                    textAnchor="middle"
                    fontWeight="bold"
                    fill="#000"
                    fontSize={labelFontSize}
                    transform={`rotate(${isMobile ? 45 : 0}, ${x}, ${y})`}
                  >
                    {payload.value}
                  </text>
                );
              }}
              height={isMobile ? 120 : 80}
            />
            <YAxis 
              tickFormatter={v => String(Math.round(v))}
              allowDecimals={false}
              width={isMobile ? 40 : 60}
              tick={{ fontSize: isMobile ? 10 : 12 }}
            />
            <Tooltip content={CustomBarTooltip as any} />
            <Legend 
              payload={(LEGEND_KEYS || []).map(key => ({
                value: key,
                type: 'square',
                color: CONTENT_TYPE_COLORS[key] || '#8884d8',
              }))}
              formatter={(value) => (
                <span 
                  style={{ 
                    fontWeight: 'bold', 
                    color: CONTENT_TYPE_COLORS[value] || '#000',
                    fontSize: legendFontSize
                  }}
                >
                  {value}
                </span>
              )}
              wrapperStyle={{
                fontSize: legendFontSize,
                paddingTop: isMobile ? 10 : 20
              }}
            />
            {/* Single bar for all platforms */}
            <Bar
              dataKey="count"
              barSize={barSize}
              isAnimationActive={false}
              label={(props) => {
                const { x, y, width, payload } = props;
                const views = payload?.views || 0;
                const shouldShowLabel = !isMobile || views > 0; // Only show labels on mobile if there are views
                
                if (!shouldShowLabel) {
                  return <text />; // Return empty text element instead of null
                }
                
                return (
                  <text 
                    x={x + width / 2} 
                    y={y - (isMobile ? 8 : 16)} 
                    textAnchor="middle" 
                    fill="#222" 
                    fontSize={isMobile ? 9 : 11} 
                    fontWeight={500}
                  >
                    {views > 0 ? `${views.toLocaleString()} views` : ''}
                  </text>
                );
              }}
            >
              {displayData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || CONTENT_TYPE_COLORS[entry.name] || '#8884d8'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
      {/* Performance warning for many bars */}
      {barData.length > maxCategories && (
        <div className="text-xs text-yellow-700 bg-yellow-100 border border-yellow-300 rounded p-2 mt-2">
          Showing only the top {maxCategories} categories for better readability. Refine your data for more detail.
        </div>
      )}
    </div>
  );
};

export default ContentTypeBarChart; 