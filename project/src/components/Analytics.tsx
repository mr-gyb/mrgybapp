import React, { useEffect, useState, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchYouTubeViewCounts } from '../utils/platformUtils';
import { useUserContent } from '../hooks/useUserContent';
import { platformApiService } from "../api/services/platform-apis.service";


// Helper to extract YouTube video ID from a URL
function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  const regExp = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([\w-]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

const Analytics: React.FC = () => {
  const { content: userContent } = useUserContent();
  const [youtubeViews, setYoutubeViews] = useState<number>(0);
  const [youtubeDetails, setYoutubeDetails] = useState<Array<{ id: string; title: string; viewCount: number }>>([]);
  const [loading, setLoading] = useState(false);
  const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
  
  // Ensure userContent is always an array
  const safeUserContent = Array.isArray(userContent) ? userContent : [];
  
  useEffect(() => {
    console.log('Loaded YOUTUBE_API_KEY:', YOUTUBE_API_KEY);
  }, []);

  // Extract YouTube video IDs and titles from user content
  const getYouTubeVideoInfo = useCallback(() => {
    return safeUserContent
      .filter((item: any) => item.type === 'video' && item.platforms?.some((p: string) => p.toLowerCase() === 'youtube') && item.originalUrl)
      .map((item: any) => ({
        id: extractYouTubeVideoId(item.originalUrl!),
        title: item.title || item.originalUrl || 'Untitled',
      }))
      .filter((info: { id: string | null; title: string }) => !!info.id);
  }, [safeUserContent]);

  // Fetch YouTube view counts and sum them, store details
  const fetchAndSetYouTubeViews = useCallback(async () => {
    setLoading(true);
    try {
      const videoInfo = getYouTubeVideoInfo();
      const videoIds = videoInfo.map(info => info.id!);
      if (videoIds.length === 0) {
        setYoutubeViews(0);
        setYoutubeDetails([]);
        setLoading(false);
        return;
      }
      const details = [];
      for (const info of videoInfo) {
        // Fill in required fields with dummy values if not available
        const contentItem = {
          id: info.id!,
          title: info.title,
          description: '',
          type: 'video',
          status: 'active',
          createdAt: new Date().toISOString(),
          originalUrl: `https://youtu.be/${info.id}`,
          platforms: ['youtube'],
        };
        const result = await platformApiService.fetchYouTubeViews(contentItem);
        console.log('YouTube API result:', result);
        details.push({
          id: info.id!,
          title: info.title,
          viewCount: result.success && result.data ? result.data.views : 0,
        });
      }
      setYoutubeDetails(details);
      const totalViews = details.reduce((sum, d) => sum + d.viewCount, 0);
      setYoutubeViews(totalViews);
    } catch (err) {
      setYoutubeViews(0);
      setYoutubeDetails([]);
    } finally {
      setLoading(false);
    }
  }, [getYouTubeVideoInfo]);

  // Poll every 60 seconds
  useEffect(() => {
    fetchAndSetYouTubeViews();
    const interval = setInterval(fetchAndSetYouTubeViews, 60000);
    return () => clearInterval(interval);
  }, [fetchAndSetYouTubeViews]);

  useEffect(() => {
    const videoInfo = getYouTubeVideoInfo();
    console.log('Extracted YouTube video info:', videoInfo);
  }, [userContent]);

  useEffect(() => {
    console.log('YouTube Details:', youtubeDetails);
    console.log('YouTube Total Views:', youtubeViews);
  }, [youtubeDetails, youtubeViews]);

  // Analytics data, replacing 'Videos' views with real YouTube views
  const data = [
    {
      name: 'YouTube',
      count: safeUserContent.filter(item => item.type === 'video' && item.platforms?.some(p => p.toLowerCase() === 'youtube')).length,
      views: safeUserContent
        .filter(item => item.type === 'video' && item.platforms?.some(p => p.toLowerCase() === 'youtube'))
        .reduce((sum, item) => sum + (item.views ?? 1), 0),
    },
    // Add other bars as needed, using real counts if possible
  ];

  const metrics = [
    { name: 'Followers Growth', value: '+15%' },
    { name: 'Clickthrough Rate', value: '3.2%' },
    { name: 'CPC (Cost Per Click)', value: '$0.45' },
    { name: 'CPM (Cost Per Mille)', value: '$5.20' },
    { name: 'AOV (Average Order Value)', value: '$75' },
    { name: 'LTV (Lifetime Value)', value: '$250' },
  ];

  const platformData = [
    { name: 'Instagram', value: 45 },
    { name: 'YouTube', value: 30 },
    { name: 'Blog', value: 15 },
    { name: 'Twitter', value: 10 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Custom Tooltip for BarChart
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const barData = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded shadow text-sm border border-gray-200">
          <div className="font-semibold mb-1">{label}</div>
          <div>Content Count: {barData.count ?? '-'}</div>
          <div>View Count: {barData.views ?? '-'}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white min-h-screen text-navy-blue">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Link to="/gyb-studio" className="mr-4 text-navy-blue">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold text-navy-blue">Analytics</h1>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-2xl font-bold mb-4">Content Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomBarTooltip />} />
              <Legend />
              <Bar
                dataKey="count"
                name="YouTube"
                fill={COLORS[0]}
                barSize={170}
                isAnimationActive={false}
                label={({ x, y, width, index }) => {
                  const views = data[index]?.views ?? 0;
                  return (
                    <text x={x + width / 2} y={y - 10} textAnchor="middle" fill="#222" fontSize={12}>
                      {views.toLocaleString()} views
                    </text>
                  );
                }}
              />
              <Bar dataKey="views" fill="#0f2a4a" name="Total Views" />
              <Bar dataKey="engagement" fill="#d4af37" name="Engagement" />
            </BarChart>
          </ResponsiveContainer>
          {loading && <div className="text-sm text-gray-500 mt-2">Updating YouTube views...</div>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Top Performing Platform</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Key Metrics</h3>
            <ul className="space-y-2">
              {metrics.map((metric, index) => (
                <li key={index} className="flex justify-between items-center">
                  <span>{metric.name}</span>
                  <span className="font-semibold text-navy-blue">{metric.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Top Converting Content</h3>
          <ul className="space-y-2">
            <li className="flex justify-between items-center">
              <span>Email Marketing Campaign</span>
              <span className="text-green-500 font-semibold">25% conversion</span>
            </li>
            <li className="flex justify-between items-center">
              <span>Product Demo Video</span>
              <span className="text-green-500 font-semibold">18% conversion</span>
            </li>
            <li className="flex justify-between items-center">
              <span>Customer Success Story</span>
              <span className="text-green-500 font-semibold">15% conversion</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Analytics;