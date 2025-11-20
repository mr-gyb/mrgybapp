import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useYouTubeDemographics } from '../../hooks/useYouTubeDemographics';
import { useUserContent } from '../../hooks/useUserContent';
import { RefreshCw, AlertCircle, Users } from 'lucide-react';
import YouTubeAuthButton from './YouTubeAuthButton';
import youtubeOAuthService from '../../services/youtubeOAuth.service';

// Helper to extract YouTube video ID from URL
function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  try {
    const urlObj = new URL(url);
    if (urlObj.searchParams.has('v')) {
      const videoId = urlObj.searchParams.get('v');
      if (videoId && videoId.length === 11) return videoId;
    }
  } catch {
    // Ignore URL parsing errors
  }
  
  return null;
}

// Format age group labels
const formatAgeGroup = (ageGroup: string): string => {
  const ageMap: Record<string, string> = {
    'AGE_13_17': '13-17',
    'AGE_18_24': '18-24',
    'AGE_25_34': '25-34',
    'AGE_35_44': '35-44',
    'AGE_45_54': '45-54',
    'AGE_55_64': '55-64',
    'AGE_65_': '65+',
  };
  return ageMap[ageGroup] || ageGroup.replace('AGE_', '').replace('_', '-');
};

// Format gender labels
const formatGender = (gender: string): string => {
  const genderMap: Record<string, string> = {
    'FEMALE': 'Female',
    'MALE': 'Male',
    'GENDER_OTHER': 'Other',
  };
  return genderMap[gender] || gender;
};

// Color schemes
const AGE_COLORS = ['#0f2a4a', '#1a4a6b', '#256a8c', '#308aad', '#3baace', '#46caef', '#51eaff'];
const GENDER_COLORS = ['#d4af37', '#0f2a4a', '#8b7355'];

interface YouTubeDemographicsProps {
  videoId?: string;
  channelId?: string;
  title?: string;
  className?: string;
}

const YouTubeDemographics: React.FC<YouTubeDemographicsProps> = ({
  videoId,
  channelId,
  title = 'YouTube Subscriber Demographics',
  className = ''
}) => {
  const { content: userContent } = useUserContent();
  const { demographics, isLoading, error, fetchDemographics, fetchVideoDemographics, lastUpdated } = useYouTubeDemographics();
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(videoId || null);
  const [autoFetch, setAutoFetch] = useState(false);

  // Auto-detect video ID from user content if not provided
  useEffect(() => {
    if (!selectedVideoId && !channelId && userContent.length > 0) {
      const youtubeContent = userContent.find(
        (item: any) => item.type === 'video' && 
        item.platforms?.some((p: string) => p.toLowerCase() === 'youtube') && 
        item.originalUrl
      );
      
      if (youtubeContent?.originalUrl) {
        const extractedId = extractYouTubeVideoId(youtubeContent.originalUrl);
        if (extractedId) {
          setSelectedVideoId(extractedId);
          setAutoFetch(true);
        }
      }
    }
  }, [userContent, selectedVideoId, channelId]);

  // Fetch demographics when video ID or channel ID is available
  useEffect(() => {
    if (videoId) {
      // If videoId is provided as prop, use it directly
      fetchVideoDemographics(videoId);
    } else if (autoFetch && selectedVideoId) {
      fetchVideoDemographics(selectedVideoId);
      setAutoFetch(false);
    } else if (channelId) {
      fetchDemographics(channelId);
    } else if (selectedVideoId) {
      fetchVideoDemographics(selectedVideoId);
    }
  }, [videoId, selectedVideoId, channelId, autoFetch, fetchVideoDemographics, fetchDemographics]);

  const handleRefresh = () => {
    if (videoId) {
      fetchVideoDemographics(videoId);
    } else if (selectedVideoId) {
      fetchVideoDemographics(selectedVideoId);
    } else if (channelId) {
      fetchDemographics(channelId);
    } else {
      fetchDemographics();
    }
  };

  // Prepare data for charts
  const ageData = demographics?.ageGroups.map((item, index) => ({
    name: formatAgeGroup(item.ageGroup),
    value: parseFloat(item.viewerPercentage.toFixed(2)),
    ageGroup: item.ageGroup,
    color: AGE_COLORS[index % AGE_COLORS.length]
  })) || [];

  const genderData = demographics?.genders.map((item, index) => ({
    name: formatGender(item.gender),
    value: parseFloat(item.viewerPercentage.toFixed(2)),
    gender: item.gender,
    color: GENDER_COLORS[index % GENDER_COLORS.length]
  })) || [];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-navy-blue">
            {payload[0].value}% of viewers
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show labels for very small slices

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Check if error is due to missing authentication
  const isAuthError = error && error.includes('OAuth access token not configured');
  const [isAuthenticated, setIsAuthenticated] = useState(youtubeOAuthService.isAuthenticated());

  useEffect(() => {
    // Re-check auth status when component mounts or error changes
    setIsAuthenticated(youtubeOAuthService.isAuthenticated());
  }, [error]);

  if (isAuthError && !isAuthenticated) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-navy-blue flex items-center gap-2">
            <Users className="w-6 h-6" />
            {title}
          </h2>
        </div>
        
        <YouTubeAuthButton 
          onAuthSuccess={() => {
            setIsAuthenticated(true);
            // Retry fetching demographics after authentication
            if (videoId) {
              fetchVideoDemographics(videoId);
            } else if (selectedVideoId) {
              fetchVideoDemographics(selectedVideoId);
            } else if (channelId) {
              fetchDemographics(channelId);
            }
          }}
        />
      </div>
    );
  }

  if (error && !isLoading) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-navy-blue flex items-center gap-2">
            <Users className="w-6 h-6" />
            {title}
          </h2>
          <button
            onClick={handleRefresh}
            className="p-2 text-navy-blue hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-yellow-800">Unable to fetch demographics</p>
            <p className="text-xs text-yellow-700 mt-1">{error}</p>
            <p className="text-xs text-yellow-600 mt-2">
              Make sure you have:
              <ul className="list-disc list-inside mt-1 ml-2">
                <li>YouTube Analytics API enabled</li>
                <li>OAuth access token with yt-analytics.readonly scope</li>
                <li>Access to the channel/video</li>
              </ul>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!demographics && !isLoading) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-navy-blue flex items-center gap-2">
            <Users className="w-6 h-6" />
            {title}
          </h2>
          <button
            onClick={handleRefresh}
            className="p-2 text-navy-blue hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
        
        <div className="text-center py-8 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No demographics data available</p>
          <p className="text-sm mt-2">Click refresh to fetch data</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white p-6 rounded-lg shadow ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-navy-blue flex items-center gap-2">
          <Users className="w-6 h-6" />
          {title}
        </h2>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-gray-500">
              Updated: {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2 text-navy-blue hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh data"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 text-navy-blue animate-spin" />
          <span className="ml-3 text-gray-600">Loading demographics...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Age Group Distribution - Pie Chart */}
          <div>
            <h3 className="text-lg font-semibold text-navy-blue mb-4">Age Distribution</h3>
            {ageData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={ageData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {ageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => value}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-gray-500">No age data available</div>
            )}
          </div>

          {/* Gender Distribution - Pie Chart */}
          <div>
            <h3 className="text-lg font-semibold text-navy-blue mb-4">Gender Distribution</h3>
            {genderData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => value}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-gray-500">No gender data available</div>
            )}
          </div>

          {/* Age Group Distribution - Bar Chart */}
          <div>
            <h3 className="text-lg font-semibold text-navy-blue mb-4">Age Group Breakdown</h3>
            {ageData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={ageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#0f2a4a" radius={[8, 8, 0, 0]}>
                    {ageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-gray-500">No age data available</div>
            )}
          </div>

          {/* Gender Distribution - Bar Chart */}
          <div>
            <h3 className="text-lg font-semibold text-navy-blue mb-4">Gender Breakdown</h3>
            {genderData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={genderData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#d4af37" radius={[8, 8, 0, 0]}>
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-gray-500">No gender data available</div>
            )}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      {demographics && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-navy-blue">
                {ageData.length}
              </p>
              <p className="text-sm text-gray-600">Age Groups</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-navy-blue">
                {genderData.length}
              </p>
              <p className="text-sm text-gray-600">Gender Categories</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-navy-blue">
                {ageData.reduce((sum, item) => sum + item.value, 0).toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600">Total Coverage</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-navy-blue">
                {ageData.length > 0 ? ageData[0].name : '-'}
              </p>
              <p className="text-sm text-gray-600">Largest Age Group</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default YouTubeDemographics;

