import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

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
  const numBarGroups = barData.length;
  const minBarWidth = 450;
  const barSize = containerWidth && numBarGroups > 0
    ? Math.max(Math.floor(containerWidth / numBarGroups) - 16, minBarWidth)
    : minBarWidth;
  const labelFontSize = containerWidth && numBarGroups > 0
    ? Math.max(10, Math.min(16, Math.floor(containerWidth / (numBarGroups * 2))))
    : 14;

  // Limit to top 15 categories for performance
  let displayData = barData;
  if (displayData.length > 15) {
    displayData = [...displayData]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 15);
  }

  return (
    <div ref={chartContainerRef} className="w-full">
      {displayData.length === 0 ? (
        <div className="text-gray-500 text-center py-12">No content data available for chart.</div>
      ) : (
        <ResponsiveContainer width="100%" height={340}>
          <BarChart 
            data={displayData}
            barCategoryGap={0}
            barGap={0}
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
                    y={y + 16}
                    textAnchor="start"
                    fontWeight="bold"
                    fill="#000"
                    fontSize={labelFontSize}
                    transform={`rotate(0, ${x}, ${y})`}
                  >
                    {payload.value}
                  </text>
                );
              }}
            />
            <YAxis 
              tickFormatter={v => String(Math.round(v))}
              allowDecimals={false}
            />
            <Tooltip content={CustomBarTooltip as any} />
            <Legend 
              payload={LEGEND_KEYS.map(key => ({
                value: key,
                type: 'square',
                color: CONTENT_TYPE_COLORS[key] || '#8884d8',
              }))}
              formatter={(value) => <span style={{ fontWeight: 'bold', color: CONTENT_TYPE_COLORS[value] || '#000' }}>{value}</span>}
            />
            {/* Grouped bars for Blogs */}
            {blogTypes.map(type => (
              <Bar
                key={type}
                dataKey={type}
                fill={CONTENT_TYPE_COLORS[type]}
                name={type}
                barSize={barSize}
                isAnimationActive={false}
                label={(props) => {
                  const { x, y, width } = props;
                  let views = 0;
                  
                  }
                  return (
                    <text x={x + width / 2} y={y - 16} textAnchor="middle" fill="#222" fontSize={11} fontWeight={500}>
                      {views > 0 ? `${views.toLocaleString()} views` : ''}
                    </text>
                  );
                }}
              />
            ))}
            {/* Grouped bars for Audio */}
            {audioTypes.map(type => (
              <Bar
                key={type}
                dataKey={type}
                fill={CONTENT_TYPE_COLORS[type]}
                name={type}
                barSize={barSize}
                isAnimationActive={false}
                label={(props) => {
                  const { x, y, width } = props;
                  let views = 0;
                  if (type === 'Spotify') {
                    views = userContent.filter((item: any) => item.type === 'audio' && item.platforms && item.platforms.some((p: any) => p.toLowerCase() === 'spotify')).reduce((sum: number, item: any) => sum + (item.views ?? 1), 0);
                  } else if (type === 'iTunes') {
                    views = userContent.filter((item: any) => item.type === 'audio' && item.platforms && item.platforms.some((p: any) => p.toLowerCase() === 'itunes')).reduce((sum: number, item: any) => sum + (item.views ?? 1), 0);
                  }
                  return (
                    <text x={x + width / 2} y={y - 16} textAnchor="middle" fill="#222" fontSize={11} fontWeight={500}>
                      {views > 0 ? `${views.toLocaleString()} views` : ''}
                    </text>
                  );
                }}
              />
            ))}
            {/* Grouped bars for Social Media */}
            {socialMediaTypes.map(type => (
              <Bar
                key={type}
                dataKey={type}
                fill={CONTENT_TYPE_COLORS[type]}
                name={type}
                barSize={barSize}
                isAnimationActive={false}
                label={(props) => {
                  const { x, y, width } = props;
                  let views = 0;
                  if (type === 'Instagram') {
                    views = userContent.filter((item: any) => item.type === 'photo' && item.platforms && item.platforms.some((p: any) => p.toLowerCase() === 'instagram')).reduce((sum: number, item: any) => sum + (item.views ?? 1), 0);
                  } else if (type === 'Pinterest') {
                    views = userContent.filter((item: any) => item.type === 'photo' && item.platforms && item.platforms.some((p: any) => p.toLowerCase() === 'pinterest')).reduce((sum: number, item: any) => sum + (item.views ?? 1), 0);
                  } else if (type === 'Facebook') {
                    views = userContent.filter((item: any) => item.type === 'photo' && item.platforms && item.platforms.some((p: any) => p.toLowerCase() === 'facebook')).reduce((sum: number, item: any) => sum + (item.views ?? 1), 0);
                  }
                  return (
                    <text x={x + width / 2} y={y - 16} textAnchor="middle" fill="#222" fontSize={11} fontWeight={500}>
                      {views > 0 ? `${views.toLocaleString()} views` : ''}
                    </text>
                  );
                }}
              />
            ))}
            {/* Grouped bars for Other */}
            {otherTypes.map(type => (
              <Bar
                key={type}
                dataKey={type}
                fill={CONTENT_TYPE_COLORS[type]}
                name={type}
                barSize={barSize}
                isAnimationActive={false}
                label={(props) => {
                  const { x, y, width } = props;
                  let views = 0;
                  if (type === 'LinkedIn') {
                    views = userContent.filter((item: any) => item.platforms && item.platforms.some((p: any) => p.toLowerCase() === 'linkedin')).reduce((sum: number, item: any) => sum + (item.views ?? 1), 0);
                  } else if (type === 'Other') {
                    views = userContent.filter((item: any) => item.platforms && item.platforms.some((p: any) => p.toLowerCase() === 'other')).reduce((sum: number, item: any) => sum + (item.views ?? 1), 0);
                  }
                  return (
                    <text x={x + width / 2} y={y - 16} textAnchor="middle" fill="#222" fontSize={11} fontWeight={500}>
                      {views > 0 ? `${views.toLocaleString()} views` : ''}
                    </text>
                  );
                }}
              />
            ))}
            {/* Single bar for YouTube */}
            <Bar
              dataKey="count"
              name="YouTube"
              fill={CONTENT_TYPE_COLORS['YouTube']}
              barSize={barSize}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
      {/* Performance warning for many bars */}
      {barData.length > 15 && (
        <div className="text-xs text-yellow-700 bg-yellow-100 border border-yellow-300 rounded p-2 mt-2">
          Showing only the top 15 categories for performance. Refine your data for more detail.
        </div>
      )}
    </div>
  );
};

export default ContentTypeBarChart; 