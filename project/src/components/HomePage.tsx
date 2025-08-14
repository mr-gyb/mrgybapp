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
  const [facebookMetrics, setFacebookMetrics] = useState<{
    total_impressions: number;
    total_reactions: number;
  } | null>(null);

  // Use shared analytics hook
  const analyticsData = useAnalytics(userContent);
  
  // Fetch Facebook metrics
  useEffect(() => {
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
    <div className="min-h-screen bg-gray-50">
      {/* Font Links */}
      {fontLinks}

      {/* Hero Section */}
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
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                View Full Analytics Dashboard
              </a>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default HomePage; 