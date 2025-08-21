import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import ContentTypeDistribution from './ContentTypeDistribution';
import PlatformDistribution from './PlatformDistribution';
import AnalyticsGrid from './AnalyticsGrid';

const AnalyticsDemo: React.FC = () => {
  const [selectedLayout, setSelectedLayout] = useState<'individual' | 'grid' | 'custom'>('individual');
  const [showContentType, setShowContentType] = useState(true);
  const [showPlatform, setShowPlatform] = useState(true);
  const [gridCols, setGridCols] = useState<'1' | '2' | '3'>('2');
  const [gap, setGap] = useState<'4' | '6' | '8' | '12'>('12');

  // Mock data for demonstration
  const mockBarData = [
    { name: 'YouTube', count: 15, views: 1250, color: '#FF0000' },
    { name: 'Instagram', count: 8, views: 890, color: '#C13584' },
    { name: 'Spotify', count: 12, views: 2100, color: '#1DB954' },
    { name: 'Pinterest', count: 6, views: 450, color: '#E60023' },
    { name: 'Facebook', count: 10, views: 1200, color: '#1877F3' }
  ];

  const mockPlatformData = [
    { name: 'Social Media', value: 24, percentage: 40, color: '#C13584' },
    { name: 'Audio', value: 12, percentage: 20, color: '#1DB954' },
    { name: 'Video', value: 15, percentage: 25, color: '#FF0000' },
    { name: 'Other', value: 9, percentage: 15, color: '#9E9E9E' }
  ];

  const mockUserContent = [
    { id: '1', title: 'Sample Content 1', type: 'video', platforms: ['YouTube'] },
    { id: '2', title: 'Sample Content 2', type: 'photo', platforms: ['Instagram'] },
    { id: '3', title: 'Sample Content 3', type: 'audio', platforms: ['Spotify'] }
  ];

  const mockBlogTypes = ['Medium', 'WordPress', 'Substack'];
  const mockAudioTypes = ['Spotify'];
  const mockSocialMediaTypes = ['Instagram', 'Pinterest', 'Facebook'];
  const mockOtherTypes = ['Other'];

  const mockContentTypeColors = {
    'YouTube': '#FF0000',
    'Instagram': '#C13584',
    'Spotify': '#1DB954',
    'Pinterest': '#E60023',
    'Facebook': '#1877F3',
    'Other': '#9E9E9E'
  };

  const mockLegendKeys = ['YouTube', 'Instagram', 'Spotify', 'Pinterest', 'Facebook', 'Other'];

  const mockColors = ['#FF0000', '#C13584', '#1DB954', '#E60023', '#1877F3', '#9E9E9E'];

  const CustomBarTooltip = ({ active, payload, label }: { active: boolean; payload: any[]; label: string }) => {
    if (active && payload && payload.length) {
      const barData = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded shadow text-sm border border-gray-200">
          <div className="font-semibold mb-1">{label}</div>
          <div>Content Count: {barData.count}</div>
          <div>View Count: {barData.views}</div>
        </div>
      );
    }
    return null;
  };

  const renderCustomPieLabel = ({ cx, cy, midAngle, outerRadius, percent, name }: any) => {
    if (percent === 0) return null;
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 10;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="#333" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12} fontWeight={400}>
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Analytics Components Demo</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Showcasing the new individual Content Type Distribution and Platform Distribution components
          </p>
        </div>

        {/* Layout Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Layout Controls</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Layout Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Layout Type</label>
              <select
                value={selectedLayout}
                onChange={(e) => setSelectedLayout(e.target.value as 'individual' | 'grid' | 'custom')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="individual">Individual Components</option>
                <option value="grid">Analytics Grid</option>
                <option value="custom">Custom Layout</option>
              </select>
            </div>

            {/* Grid Columns */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Grid Columns</label>
              <select
                value={gridCols}
                onChange={(e) => setGridCols(e.target.value as '1' | '2' | '3')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1">1 Column</option>
                <option value="2">2 Columns</option>
                <option value="3">3 Columns</option>
              </select>
            </div>

            {/* Gap */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gap Size</label>
              <select
                value={gap}
                onChange={(e) => setGap(e.target.value as '4' | '6' | '8' | '12')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="4">Small (4)</option>
                <option value="6">Medium (6)</option>
                <option value="8">Large (8)</option>
                <option value="12">Extra Large (12)</option>
              </select>
            </div>
          </div>

          {/* Component Toggles */}
          <div className="mt-6 flex space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showContentType}
                onChange={(e) => setShowContentType(e.target.checked)}
                className="mr-2"
              />
              Show Content Type Distribution
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showPlatform}
                onChange={(e) => setShowPlatform(e.target.checked)}
                className="mr-2"
              />
              Show Platform Distribution
            </label>
          </div>
        </div>

        {/* Demo Content */}
        {selectedLayout === 'individual' && (
          <div className="space-y-8">
            {showContentType && (
              <ContentTypeDistribution
                barData={mockBarData}
                userContent={mockUserContent}
                blogTypes={mockBlogTypes}
                audioTypes={mockAudioTypes}
                socialMediaTypes={mockSocialMediaTypes}
                otherTypes={mockOtherTypes}
                CONTENT_TYPE_COLORS={mockContentTypeColors}
                LEGEND_KEYS={mockLegendKeys}
                CustomBarTooltip={CustomBarTooltip}
                title="Content Type Distribution (Individual Component)"
              />
            )}
            
            {showPlatform && (
              <PlatformDistribution
                platformData={mockPlatformData}
                COLORS={mockColors}
                renderCustomPieLabel={renderCustomPieLabel}
                title="Platform Distribution (Individual Component)"
              />
            )}
          </div>
        )}

        {selectedLayout === 'grid' && (
          <AnalyticsGrid
            barData={mockBarData}
            userContent={mockUserContent}
            blogTypes={mockBlogTypes}
            audioTypes={mockAudioTypes}
            socialMediaTypes={mockSocialMediaTypes}
            otherTypes={mockOtherTypes}
            CONTENT_TYPE_COLORS={mockContentTypeColors}
            LEGEND_KEYS={mockLegendKeys}
            CustomBarTooltip={CustomBarTooltip}
            platformData={mockPlatformData}
            COLORS={mockColors}
            renderCustomPieLabel={renderCustomPieLabel}
            gridCols={gridCols}
            gap={gap}
            showContentType={showContentType}
            showPlatform={showPlatform}
            title="Analytics Grid Component"
          />
        )}

        {selectedLayout === 'custom' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {showContentType && (
              <div className="lg:col-span-2">
                <ContentTypeDistribution
                  barData={mockBarData}
                  userContent={mockUserContent}
                  blogTypes={mockBlogTypes}
                  audioTypes={mockAudioTypes}
                  socialMediaTypes={mockSocialMediaTypes}
                  otherTypes={mockOtherTypes}
                  CONTENT_TYPE_COLORS={mockContentTypeColors}
                  LEGEND_KEYS={mockLegendKeys}
                  CustomBarTooltip={CustomBarTooltip}
                  title="Content Type Distribution (Wide)"
                />
              </div>
            )}
            
            {showPlatform && (
              <div>
                <PlatformDistribution
                  platformData={mockPlatformData}
                  COLORS={mockColors}
                  renderCustomPieLabel={renderCustomPieLabel}
                  title="Platform Distribution (Sidebar)"
                />
              </div>
            )}
          </div>
        )}

        {/* Component Information */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h2 className="text-xl font-bold mb-4">Component Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">ContentTypeDistribution</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Self-contained component with header and styling</li>
                <li>• Built-in YouTube API loading states</li>
                <li>• Quota exceeded warning with reset functionality</li>
                <li>• Customizable title and className</li>
                <li>• Integrates ContentTypeBarChart internally</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">PlatformDistribution</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Self-contained component with header and styling</li>
                <li>• Built-in empty state handling</li>
                <li>• Platform summary grid below chart</li>
                <li>• Customizable title and className</li>
                <li>• Integrates PlatformPieChart internally</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">AnalyticsGrid</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Combines both components in a responsive grid</li>
              <li>• Configurable grid columns (1, 2, or 3)</li>
              <li>• Adjustable gap sizes</li>
              <li>• Option to show/hide individual components</li>
              <li>• Customizable titles for each component</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDemo;
