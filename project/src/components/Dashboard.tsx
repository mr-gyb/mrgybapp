import React, { useState, useEffect, useCallback } from 'react';
import { Star, Briefcase, Users, MessageCircle, Gift, DollarSign, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useUserContent } from '../hooks/useUserContent';
import { useContentPerformance } from '../hooks/useContentPerformance';
import { doc, updateDoc, collection, onSnapshot, getDoc, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import platformApiService from '../api/services/platform-apis.service';
import { detectPlatform, getPlatformDisplayName } from '../utils/platformUtils';
import { ContentItem } from '../types/content';
import PlatformPieChart from './analytics/PlatformPieChart';
import CultureCard from './CultureCard';
import ProCard from './ProCard';
import EnterpriseCard from './EnterpriseCard';
import TrialSection from './TrialSection';

const Commerce: React.FC = () => {
  const { content: userContent, updateContent, refreshContent } = useUserContent();
  const { 
    performanceData, 
    isLoading: performanceLoading, 
    error: performanceError,
    isTracking,
    startTracking,
    stopTracking,
    updateAllContentPerformance,
    getPerformanceAnalytics,
    isPlatformConfigured,
    getConfiguredPlatforms
  } = useContentPerformance();
  
  const [paymentType, setPaymentType] = useState<'monthly' | 'annually'>('annually');
  const [contentStats, setContentStats] = useState({ byType: {}, byPlatform: {} });
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [barChartData, setBarChartData] = useState<any[]>([]);
  const [pieChartData, setPieChartData] = useState<any[]>([]);
  const [viewingContent, setViewingContent] = useState<ContentItem | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isUpdatingViews, setIsUpdatingViews] = useState(false);
  
  const rating = 4.7;
  const fullStars = Math.floor(rating);
  const totalRevenue = 250000; // Example total revenue

  // Add COLORS for PieChart
  const COLORS = {
    YouTube: "#FF0000",
    Facebook: "#1877F3",
    Pinterest: "#E60023",
    Instagram: "#C13584",
    Spotify: "#1DB954",
    Other: "#FFD700",
    // Add more as needed
  };
  // Map color to content type
  const legendItems = [
    { color: '#0088FE', label: 'Instagram' },
    { color: '#00C49F', label: 'YouTube Videos' },
    { color: '#FFBB28', label: 'Blog Posts' },
    { color: '#FF8042', label: 'Twitter' },
    { color: '#FF6699', label: 'Audio Content' },
    { color: '#A0522D', label: 'Other' },
  ];

  const earningsData = [
    { day: 'Mon', dailyEarnings: 120, weeklyTrend: 130 },
    { day: 'Tue', dailyEarnings: 150, weeklyTrend: 155 },
    { day: 'Wed', dailyEarnings: 180, weeklyTrend: 170 },
    { day: 'Thu', dailyEarnings: 200, weeklyTrend: 180 },
    { day: 'Fri', dailyEarnings: 170, weeklyTrend: 190 },
    { day: 'Sat', dailyEarnings: 220, weeklyTrend: 210 },
    { day: 'Sun', dailyEarnings: 250, weeklyTrend: 220 },
  ];

  // Real-time content listener
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'media_content'), (snapshot) => {
      const contentList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data
        } as ContentItem;
      });
      
      // Update charts with new content data
      updateChartData(contentList);
      
      // Trigger performance update for new content
      handleContentChange(contentList);
    });
    
    return () => unsubscribe();
  }, []);

  // Handle content changes and update view counts
  const handleContentChange = useCallback(async (contentList: ContentItem[]) => {
    setIsUpdatingViews(true);
    try {
      // Update performance data for all content
      await updateAllContentPerformance();
      
      // Refresh content to get updated view counts
      await refreshContent();
      
      // Update chart data
      updateChartData(contentList);
    } catch (error) {
      console.error('Error updating view counts:', error);
      setError('Failed to update view counts');
    } finally {
      setIsUpdatingViews(false);
    }
  }, [updateAllContentPerformance, refreshContent]);

  // Update chart data based on content
  const updateChartData = useCallback((contentList: ContentItem[]) => {
    // Aggregate by type for bar chart
    const byType: Record<string, number> = {};
    for (const item of contentList) {
      if (item.type) {
        byType[item.type] = (byType[item.type] || 0) + (item.views || 0);
      }
    }
    setBarChartData(Object.entries(byType).map(([type, views]) => ({ type, views })));

    // Pie chart: aggregate by platforms
    const byPlatform: Record<string, number> = {};
    for (const item of contentList) {
      if (item.platforms && item.platforms.length > 0) {
        item.platforms.forEach(platform => {
          byPlatform[platform] = (byPlatform[platform] || 0) + (item.views || 0);
        });
      }
    }
    setPieChartData(Object.entries(byPlatform).map(([name, value]) => ({ name, value })));
  }, []);

  // Suppose userContent is an array of all uploaded content items
  const platformCounts: Record<string, number> = {};
  (userContent as Array<{ platforms?: string[] }>).forEach((item) => {
    if (item.platforms && Array.isArray(item.platforms)) {
      item.platforms.forEach((platform: string) => {
        platformCounts[platform] = (platformCounts[platform] || 0) + 1;
      });
    }
  });

  // Normalize platform counts
  const normalizedPlatformCounts = {};
  Object.entries(platformCounts).forEach(([name, count]) => {
    if (name === 'Newsletter' || name === 'Blog') {
      normalizedPlatformCounts['Social Media'] = (normalizedPlatformCounts['Social Media'] || 0) + count;
    } else {
      normalizedPlatformCounts[name] = count;
    }
  });

  const total = Object.values(normalizedPlatformCounts).reduce((sum, count) => sum + count, 0);

  const platformData = Object.entries(normalizedPlatformCounts).map(([name, count]) => ({
    name,
    value: count,
    percentage: total > 0 ? count / total : 0,
    color: COLORS[name] || '#8884d8'
  }));
  console.log('platformData', platformData);
  console.log('platformData length:', platformData?.length);
  console.log('platformData values:', platformData?.map(d => ({ name: d.name, value: d.value, percentage: d.percentage })));

  const platformDataMock = [
    { name: 'Instagram', value: 2 },
    { name: 'YouTube Videos', value: 1 },
    { name: 'Blog Posts', value: 2 }
  ];

  const dashboardButtons = [
    { to: "/work-history", icon: Briefcase, label: "Work History", color: "bg-blue-500" },
    { to: "/invites", icon: Users, label: "Invites", color: "bg-purple-500" },
    { to: "/reviews", icon: MessageCircle, label: "Reviews", color: "bg-green-500" },
    { to: "/rewards", icon: Gift, label: "Rewards", color: "bg-yellow-500" },
    { to: "/payments", icon: DollarSign, label: "Payments", color: "bg-pink-500" },
    { to: "/earnings", icon: TrendingUp, label: "Earnings", color: "bg-indigo-500" },
  ];

  // Helper to get contrasting text color for a given background
  function getContrastColor(bgColor: string) {
    // Simple luminance check for white/black text
    if (!bgColor) return '#222';
    const color = bgColor.charAt(0) === '#' ? bgColor.substring(1) : bgColor;
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? '#222' : '#fff';
  }

  // Custom label for Pie slices: show platform name and percent above each slice, plain text only
  const renderPieLabel = ({
    cx, cy, midAngle, outerRadius, percent, payload
  }: any) => {
    if (percent === 0) return null;
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 18;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * radius * Math.sin(-midAngle * RADIAN);
    return (
      <text
        x={x}
        y={y}
        fill="#4285F4"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="16"
        fontWeight="500"
      >
        {`${payload.name} ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Custom tooltip: plain percent text above slice, no box, no border, no shadow
  const renderPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { percent, color } = payload[0];
      return (
        <span style={{
          position: 'relative',
          top: '-24px',
          left: 0,
          background: 'none',
          border: 'none',
          boxShadow: 'none',
          padding: 0,
          color: getContrastColor(color),
          fontWeight: 700,
          fontSize: 13
        }}>{(percent * 100).toFixed(0)}%</span>
      );
    }
    return null;
  };

  async function updateStats() {
    // Since ContentItem doesn't have views property, we'll use a mock approach
    const updatedContent = userContent.map(item => ({
      ...item,
      views: Math.floor(Math.random() * 1000) // Mock views for demo
    }));
    setContentStats(aggregateViews(updatedContent));
    setChartData(aggregateViewsByType(updatedContent));
  }

  // On upload or on interval
  useEffect(() => {
    updateStats();
    const interval = setInterval(updateStats, 60 * 60 * 1000); // every hour
    return () => clearInterval(interval);
  }, [userContent]);

  // Aggregate data for charts
  React.useEffect(() => {
    // Aggregate by type for bar chart (using count instead of views)
    const byType: Record<string, number> = {};
    for (const item of userContent) {
      if (item.type) {
        byType[item.type] = (byType[item.type] || 0) + 1;
      }
    }
    setBarChartData(Object.entries(byType).map(([type, count]) => ({ type, views: count })));

    // Pie chart: aggregate by platforms (using count instead of views)
    const byPlatform: Record<string, number> = {};
    for (const item of userContent) {
      if (item.platforms && item.platforms.length > 0) {
        item.platforms.forEach(platform => {
          byPlatform[platform] = (byPlatform[platform] || 0) + 1;
        });
      }
    }
    setPieChartData(Object.entries(byPlatform).map(([name, value]) => ({ name, value })));
  }, [userContent]);

  async function fetchYouTubeViews(url: string): Promise<number> {
    try {
      const result = await platformApiService.fetchPlatformViews(
        { id: '', title: '', description: '', type: 'video', status: 'pending', createdAt: '', originalUrl: url },
        'youtube'
      );
      return result.success && result.data ? result.data.views : 0;
    } catch (error) {
      console.error('Error fetching YouTube views:', error);
      return 0;
    }
  }

  function aggregateViews(contentList: ContentItem[]): { byType: Record<string, number>; byPlatform: Record<string, number> } {
    const byType: Record<string, number> = {};
    const byPlatform: Record<string, number> = {};
    for (const item of contentList) {
      // Aggregate by type
      byType[item.type] = (byType[item.type] || 0) + (item.views || 0);
      // Aggregate by platform
      if (item.platforms) {
        item.platforms.forEach(platform => {
          byPlatform[platform] = (byPlatform[platform] || 0) + (item.views || 0);
        });
      }
    }
    return { byType, byPlatform };
  }

  function getPlatformFromUrl(url: string): string {
    const detectedPlatform = detectPlatform(url);
    return detectedPlatform ? getPlatformDisplayName(detectedPlatform) : 'Other';
  }

  async function updateContentViews(contentId: string, views: number): Promise<void> {
    const ref = doc(db, 'media_content', contentId);
    await updateDoc(ref, { views });
  }

  function aggregateViewsByType(contentList: ContentItem[]): Array<{ type: string; views: number }> {
    const byType: Record<string, number> = {};
    for (const item of contentList) {
      byType[item.type] = (byType[item.type] || 0) + (item.views || 0);
    }
    return Object.entries(byType).map(([type, views]) => ({ type, views }));
  }

  function aggregateViewsByPlatform(contentList: ContentItem[]): Array<{ name: string; value: number }> {
    const byPlatform: Record<string, number> = {};
    for (const item of contentList) {
      if (item.platforms) {
        item.platforms.forEach(platform => {
          byPlatform[platform] = (byPlatform[platform] || 0) + (item.views || 0);
        });
      }
    }
    return Object.entries(byPlatform).map(([platform, views]) => ({ name: platform, value: views }));
  }

  async function handleNewContentUpload(content: { id: string; link: string }): Promise<void> {
    const platform = getPlatformFromUrl(content.link);
    let views = 0;
    try {
      if (platform === 'YouTube') {
        views = await fetchYouTubeViews(content.link);
      }
      // Add Instagram/Twitter logic here
    } catch (err) {
      views = 0;
      // Optionally show error to user
    }
    // Save to Firestore
    await updateContentViews(content.id, views);
    // Optionally update local state/chart
  }

  const handleViewContent = async (item: ContentItem) => {
    // Fetch the latest content data from Firestore
    const docRef = doc(db, 'media_content', item.id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const contentData = docSnap.data();
      setViewingContent({
        ...item,
        ...contentData, // This will include the latest originalUrl, etc.
      });
      setShowViewModal(true);
    } else {
      // fallback: show local data or an error
      setViewingContent(item);
      setShowViewModal(true);
    }
  };

  const hasData = platformData && platformData.length > 0 && platformData.some(d => (d.value as number) > 0);

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">GYB Platform Plans</h1>
        <p className="text-lg text-gray-600">Free for 14 days</p>
      </div>

      {/* Payment Toggle */}
      <div className="flex justify-center mb-8">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button 
            onClick={() => setPaymentType('annually')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              paymentType === 'annually' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600'
            }`}
          >
            Pay annually
          </button>
          <button 
            onClick={() => setPaymentType('monthly')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              paymentType === 'monthly' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600'
            }`}
          >
            Pay monthly
          </button>
        </div>
      </div>

      {/* Cards - Side by Side */}
      <div className="flex justify-between px-4 gap-4 w-full max-w-none">
        <CultureCard paymentType={paymentType} />
        <ProCard paymentType={paymentType} />
        <EnterpriseCard paymentType={paymentType} />
      </div>

      {/* Trial Section */}
      <div className="mt-8 px-4">
        <TrialSection />
      </div>
    </div>
  );
};

export default Commerce;