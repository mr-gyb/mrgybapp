import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import ContentTypeDistribution from './analytics/ContentTypeDistribution';
import PlatformDistribution from './analytics/PlatformDistribution';
import { useUserContent } from '../hooks/useUserContent';
import { ContentItem } from '../types/content';
import { getFacebookMetrics } from '../api/services/facebook.service';
import { useAnalytics } from '../hooks/useAnalytics';

// Google Fonts import for Space Mono and Roboto Mono
const fontLinks = [
  <link
    key="space-mono"
    href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&family=Space+Mono:wght@700&display=swap"
    rel="stylesheet"
  />
];

const HomePage: React.FC = () => {
    const { content: userContent } = useUserContent();
  
  // Use shared analytics hook
  const analyticsData = useAnalytics(userContent);
  
  const [facebookMetrics, setFacebookMetrics] = useState<{
    total_impressions: number;
    total_reactions: number;
  } | null>(null);

  // Fetch Facebook metrics
  useEffect(() => {
       
       // Pinterest
       const pinterestCount = userContent.filter(item => item.type === 'photo' && item.platforms && item.platforms.some(p => p.toLowerCase() === 'pinterest')).length;
       if (pinterestCount > 0) {
         individualPlatformData.push({
           name: 'Pinterest',
           count: pinterestCount,
           color: '#E60023',
           views: userContent
             .filter(item => item.type === 'photo' && item.platforms && item.platforms.some(p => p.toLowerCase() === 'pinterest'))
             .reduce((sum, item) => sum + (item.views ?? 1), 0),
         });
       }
       
       // Facebook
       const facebookCount = userContent.filter(item => item.type === 'photo' && item.platforms && item.platforms.some(p => p.toLowerCase() === 'facebook')).length;
       if (facebookCount > 0) {
         individualPlatformData.push({
           name: 'Facebook',
           count: facebookCount,
           color: '#1877F3',
           views: userContent
             .filter(item => item.type === 'photo' && item.platforms && item.platforms.some(p => p.toLowerCase() === 'facebook'))
             .reduce((sum, item) => sum + (item.views ?? 1), 0),
         });
       }
       
       // Blog
       const blogCount = userContent.filter(item => item.platforms && item.platforms.some(p => p.toLowerCase() === 'blog')).length;
       if (blogCount > 0) {
         individualPlatformData.push({
           name: 'Blog',
           count: blogCount,
           color: '#F4B400',
           views: userContent
             .filter(item => item.platforms && item.platforms.some(p => p.toLowerCase() === 'blog'))
             .reduce((sum, item) => sum + (item.views ?? 1), 0),
         });
       }
       
       // LinkedIn
       const linkedinCount = userContent.filter(item => item.platforms && item.platforms.some(p => p.toLowerCase() === 'linkedin')).length;
       if (linkedinCount > 0) {
         individualPlatformData.push({
           name: 'LinkedIn',
           count: linkedinCount,
           color: '#0077B5',
           views: userContent
             .filter(item => item.platforms && item.platforms.some(p => p.toLowerCase() === 'linkedin'))
             .reduce((sum, item) => sum + (item.views ?? 1), 0),
         });
       }
       
       // Other
       const otherCount = userContent.filter(item => item.platforms && item.platforms.some(p => p.toLowerCase() === 'other')).length;
       if (otherCount > 0) {
         individualPlatformData.push({
           name: 'Other',
           count: otherCount,
           color: '#9E9E9E',
           views: userContent
             .filter(item => item.platforms && item.platforms.some(p => p.toLowerCase() === 'other'))
             .reduce((sum, item) => sum + (item.views ?? 1), 0),
         });
       }
      
      const groupedContentData = individualPlatformData;

      // Platform distribution (exactly like GYBStudio)
      const platformCounts: Record<string, number> = {};
      userContent.forEach((item: ContentItem) => {
        console.log('HomePage - Processing content item:', item.title, 'Platforms:', item.platforms);
        // Handle platforms array
        (item.platforms || []).forEach((platform: string) => {
          const group = groupPlatform(platform);
          console.log('HomePage - Platform:', platform, 'Grouped as:', group);
          platformCounts[group] = (platformCounts[group] || 0) + 1;
        });
        

      });

      console.log('HomePage - Final platformCounts:', platformCounts);

      // Color map for platform groups (exactly like GYBStudio)
      const PLATFORM_GROUP_COLORS: Record<string, string> = {
        'Audio': '#1DB954',
        'Video': '#FF0000',
        'Social Media': '#C13584',
        'YouTube': '#FF0000',
        'Other': '#9E9E9E'
      };

      // Calculate total platform count for percentage calculation
      const totalPlatformCount = Object.values(platformCounts).reduce((sum, count) => sum + count, 0);
      
      const platformData = Object.entries(platformCounts)
        .filter(([platform, count]) => count > 0) // Only show platforms with actual content
        .map(([platform, count]) => ({
          name: platform,
          value: count,
          percentage: totalPlatformCount > 0 ? (count / totalPlatformCount) * 100 : 0,
          color: PLATFORM_GROUP_COLORS[platform] || '#8884d8'
        }));

      console.log('HomePage - Final platformData:', platformData);

              setAnalyticsData({
          barData: groupedContentData,
          platformData,
          blogTypes,
          audioTypes,
          socialMediaTypes,
          otherTypes,
          CONTENT_TYPE_COLORS,
          LEGEND_KEYS,
          COLORS: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C80']
        });
    };

    calculateAnalytics();
    
    // Fetch Facebook metrics
    const fetchFacebookData = async () => {
      try {
        const metrics = await getFacebookMetrics();
        console.log('Facebook metrics fetched:', metrics);
        setFacebookMetrics(metrics);
      } catch (error) {
        console.error('Error fetching Facebook metrics:', error);
        // Set mock data on error
        setFacebookMetrics({
          total_impressions: 0,
          total_reactions: 0
        });
      }
    };
    
    fetchFacebookData();
  }, []);



  const CustomBarTooltip = ({ active, payload, label }: { active: boolean; payload: any[]; label: string }) => {
    if (active && payload && payload.length) {
      const barData = payload[0].payload;
      
      // Check if this is Facebook data
      if (label === 'Social Media' && barData.Facebook !== undefined) {
        return (
          <div className="bg-white p-3 rounded shadow text-sm border border-gray-200">
            <div className="font-semibold mb-1">{label}</div>
            <div>Facebook Content: {barData.Facebook ?? 0}</div>
            <div>Post Impressions: {facebookMetrics?.total_impressions?.toLocaleString() ?? 'Loading...'}</div>
            <div>Total Reactions: {facebookMetrics?.total_reactions?.toLocaleString() ?? 'Loading...'}</div>
            <div>Instagram Content: {barData.Instagram ?? 0}</div>
            <div>Pinterest Content: {barData.Pinterest ?? 0}</div>
            <div>View Count: {barData.views ?? 0}</div>
          </div>
        );
      }
      
      // Default tooltip for other categories
      return (
        <div className="bg-white p-3 rounded shadow text-sm border border-gray-200">
          <div className="font-semibold mb-1">{label}</div>
          <div>Content Count: {barData.count ?? 0}</div>
          <div>View Count: {barData.views ?? 0}</div>
        </div>
      );
    }
    return null;
  };

  const renderCustomPieLabel = ({
    cx, cy, midAngle, outerRadius, percent, name
  }: {
    cx: number;
    cy: number;
    midAngle: number;
    outerRadius: number;
    percent: number;
    name: string;
  }) => {
    if (percent === 0) return null;
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 10;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#333"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight={400}
      >
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  return (
    <>
      {fontLinks}
      <div
        className="min-h-screen w-full flex items-center justify-center"
        style={{
          background: 'linear-gradient(90deg, #3B4371 0%, #b29958 100%)',
          fontFamily: 'Space Mono, monospace',
        }}
      >
        <div className="flex flex-col md:flex-row w-full max-w-7xl h-full items-center justify-center px-0 md:px-20 py-12">
          {/* Left: Title */}
          <div className="flex-1 flex items-center justify-start w-full h-full md:pl-16 lg:pl-24 xl:pl-32">
            <h1
              style={{
                fontFamily: 'Space Mono, monospace',
                fontSize: '59.5px',
                color: '#F5E6D6',
                fontWeight: 700,
                letterSpacing: '0.01em',
                lineHeight: 1.1,
                textAlign: 'left',
              }}
            >
              Mr. GYB AI
            </h1>
          </div>
          {/* Right: Subtitle and Button */}
          <div className="flex-1 flex flex-col items-start justify-center w-full h-full md:pr-16 lg:pr-24 xl:pr-32 mt-12 md:mt-0">
            <div
              style={{
                fontFamily: 'Roboto Mono, monospace',
                fontSize: '20px',
                color: '#F5E6D6',
                fontWeight: 400,
                textAlign: 'left',
                marginBottom: '2.5rem',
                lineHeight: 1.5,
                maxWidth: 420,
              }}
            >
              The Ultimate AI Hub for Content Creation, Tracking, and Monetization
            </div>
            <a
              href="https://app.gohighlevel.com/v2/preview/x9DVlz6KWMlmQxTtGbbh"
              target="_blank"
              rel="noopener noreferrer"
              className="self-center"
              style={{
                marginTop: '0.5rem',
                padding: '18px 40px',
                background: '#fff',
                color: '#3B4371',
                borderRadius: '9999px',
                fontSize: '16px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                boxShadow: '0 2px 8px rgba(59,67,113,0.08)',
                transition: 'background 0.2s',
                fontFamily: 'Roboto Mono, monospace',
              }}
            >
              GET STARTED FOR FREE
            </a>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      {userContent.length > 0 && (
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Space Mono, monospace' }}>
                Your Content Analytics
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Track your content performance across different platforms and content types
              </p>
            </div>

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-8">
              {/* Content Type Distribution */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <ContentTypeDistribution
                  barData={analyticsData.barData}
                  userContent={userContent}
                  blogTypes={analyticsData.blogTypes}
                  audioTypes={analyticsData.audioTypes}
                  socialMediaTypes={analyticsData.socialMediaTypes}
                  otherTypes={analyticsData.otherTypes}
                  CONTENT_TYPE_COLORS={analyticsData.CONTENT_TYPE_COLORS}
                  LEGEND_KEYS={analyticsData.LEGEND_KEYS}
                  CustomBarTooltip={CustomBarTooltip}
                  title="Content Type Distribution"
                  className="p-0 bg-transparent shadow-none"
                />
              </div>

              {/* Platform Distribution */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <PlatformDistribution
                  platformData={analyticsData.platformData}
                  COLORS={analyticsData.COLORS}
                  renderCustomPieLabel={renderCustomPieLabel}
                  title="Platform Distribution"
                  className="p-0 bg-transparent shadow-none"
                />
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center">
              <a
                href="/gyb-studio"
                className="inline-block bg-gray-900 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                style={{ fontFamily: 'Roboto Mono, monospace' }}
              >
                View Full Analytics →
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HomePage; 