import React, { useState, useEffect, useCallback } from 'react'; // Removed useMemo
import { useUserContent } from '../hooks/useUserContent';
import { useAnalytics } from '../hooks/useAnalytics';
import { groupPlatform } from '../hooks/useAnalytics';
// Removed @mui/x-charts imports
// import { BarChart, Bar, XAxis, YAxis, ChartsGrid, Tooltip, Legend, PieChart, Pie, Cell } from '@mui/x-charts';
import { ResponsiveContainer } from 'recharts';
import { ContentItem } from '../types/content';
// Blank line to force re-evaluation
interface HomePageProps {}

const HomePage: React.FC<HomePageProps> = () => {
  const { content: userContent } = useUserContent();
  // Ensure userContent is always an array
  const safeUserContent = Array.isArray(userContent) ? userContent : [];
  const [facebookMetrics, setFacebookMetrics] = useState<{
    total_impressions: number;
    total_reactions: number;
  }>({ total_impressions: 0, total_reactions: 0 });

  // Use shared analytics hook
  const analyticsData = useAnalytics(safeUserContent);

  // Define CustomBarTooltip locally (removed as it's related to @mui/x-charts)
  // const CustomBarTooltip = ({ active, payload, label }: { active: boolean; payload: any[]; label: string }) => {
  //   if (active && payload && payload.length) {
  //     return (
  //       <div className="bg-white p-2 border border-gray-300 rounded shadow-sm text-sm">
  //         <p className="font-bold text-navy-blue">{label}</p>
  //         {payload.map((entry, index) => (
  //           <p key={`item-${index}`} style={{ color: entry.color }}>
  //             {entry.name}: <span className="font-bold">{entry.value}</span>
  //           </p>
  //         ))}
  //       </div>
  //     );
  //   }
  //   return null;
  // };

  // Define renderCustomPieLabel locally (removed as it's related to @mui/x-charts)
  // const renderCustomPieLabel = ({ cx, cy, midAngle, outerRadius, percent, name }: any) => {
  //   const radius = outerRadius + 10; // Adjust label distance from pie
  //   const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
  //   const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
  //
  //   return (
  //     <text
  //       x={x}
  //       y={y}
  //       fill="#000" // Label color
  //       textAnchor={x > cx ? 'start' : 'end'}
  //       dominantBaseline="central"
  //       className="text-xs"
  //     >
  //       {`${name} (${(percent * 100).toFixed(0)}%)`}
  //     </text>
  //   );
  // };

  // Fetch Facebook metrics
  const getFacebookMetrics = useCallback(async () => {
    console.log('Fetching Facebook metrics...');
    // Placeholder for actual implementation
  }, []);

  useEffect(() => {
    getFacebookMetrics();
  }, [getFacebookMetrics]);

  // Placeholder for Facebook metrics display
  const renderFacebookMetrics = () => {
    if (!facebookMetrics.total_impressions && !facebookMetrics.total_reactions) {
      return null; // Or a loading indicator/message
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center mt-4">
        <div className="bg-blue-100 p-4 rounded-lg shadow">
          <h4 className="text-lg font-semibold text-blue-800">Total Impressions</h4>
          <p className="text-2xl font-bold text-blue-900">{facebookMetrics.total_impressions.toLocaleString()}</p>
        </div>
        <div className="bg-blue-100 p-4 rounded-lg shadow">
          <h4 className="text-lg font-semibold text-blue-800">Total Reactions</h4>
          <p className="text-2xl font-bold text-blue-900">{facebookMetrics.total_reactions.toLocaleString()}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-navy-blue mb-6">Analytics Overview</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold text-navy-blue mb-4">Facebook Page Metrics</h2>
        {renderFacebookMetrics()}
      </div>

      {/* Removed @mui/x-charts BarChart section */}
      {/* <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold text-navy-blue mb-4">Content Performance by Platform</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            series={[{ dataKey: 'views', label: 'Views', color: '#8884d8' }]} // Corrected series prop
            xAxis={[{ scaleType: 'band', dataKey: 'name' }]} // Corrected xAxis prop
            dataset={analyticsData.barData} // Corrected data prop to dataset
            margin={{
              top: 20, right: 30, left: 20, bottom: 5,
            }}
          >
            <ChartsGrid strokeDasharray="3 3" />
            <XAxis />
            <YAxis />
            <Tooltip />
            <Legend />
          </BarChart>
        </ResponsiveContainer>
      </div> */}

      {/* Removed @mui/x-charts PieChart section */}
      {/* <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-navy-blue mb-4">Platform Distribution</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart series={[{ data: analyticsData.platformData, arcLabel: (item) => `${item.dataKey} (${item.value})` }]} > // Corrected series prop
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div> */}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-navy-blue mb-4">Content Performance by Platform (Placeholder)</h2>
        <p>Charts will be displayed here once @mui/x-charts integration issues are resolved.</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mt-8">
        <h2 className="text-2xl font-semibold text-navy-blue mb-4">Platform Distribution (Placeholder)</h2>
        <p>Charts will be displayed here once @mui/x-charts integration issues are resolved.</p>
      </div>
    </div>
  );
};

export default HomePage;