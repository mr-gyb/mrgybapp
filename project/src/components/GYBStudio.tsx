import React, { useEffect, useState } from 'react';
import { ChevronLeft, Plus, BarChart2, DollarSign, TrendingUp, Users, CheckCircle, X as XIcon } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import ContentList from './content/ContentList';
import ContentSuggestions from './content/ContentSuggestions';
import ContentCategorySelector from './content/ContentCategorySelector';
import CategorySpecificUploader from './content/CategorySpecificUploader';
import CreationInspirationsLazyWrapper from './content/CreationInspirationsLazyWrapper';
import youtubeIcon from './images/y.png';
import instagramIcon from './images/Instagram_icon.png.webp';
import facebookIcon from './images/Facebook.png';
import spotifyIcon from './images/Spotify.png';
import pinterestIcon from './images/Pinterest.png';

import { ContentItem, ContentType } from '../types/content';
import { useUserContent } from '../hooks/useUserContent';
import { getDisplayContent } from '../utils/contentUtils';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { fetchYouTubeViewCounts } from '../utils/platformUtils';
import { getFacebookMetrics } from '../api/services/facebook.service';
import ContentTypeDistribution from "./analytics/ContentTypeDistribution";
import PlatformDistribution from "./analytics/PlatformDistribution";
import YouTubeDemographics from "./analytics/YouTubeDemographics";
import { saveUserContent } from '../services/userContent.service';
import { useAuth } from '../contexts/AuthContext';
import { useAnalytics } from '../hooks/useAnalytics';
import { useSpotifyMonetization } from '../hooks/useSpotifyMonetization';
import { useYouTubeMonetization } from '../hooks/useYouTubeMonetization';
import { usePinterestMonetization } from '../hooks/usePinterestMonetization';
import spotifyService from '../api/services/spotify.service';

interface PieLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  outerRadius: number;
  percent: number;
  name: string;
}

const renderCustomPieLabel = ({
  cx, cy, midAngle, outerRadius, percent, name
}: PieLabelProps) => {
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

function getYouTubeEmbedUrl(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (match) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  return null;
}

const GYBStudio: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { 
    content: userContent, 
    isLoading, 
    addContent, 
    refreshContent,
    removeContent,
    removeAllContent,
    contentStats
  } = useUserContent();

  // Spotify monetization hook
  const {
    playlists,
    monetizationMetrics,
    aggregatedMetrics,
    isLoading: isSpotifyLoading,
    error: spotifyError,
    loadTrackedPlaylists,
    addPlaylist,
    refreshFollowerData
  } = useSpotifyMonetization();

  // YouTube monetization hook
  const {
    youtubeData,
    isLoading: isYouTubeLoading,
    error: youTubeError,
    lastUpdated: youTubeLastUpdated,
    refreshData: refreshYouTubeDataFromHook
  } = useYouTubeMonetization(userContent);

  // Pinterest monetization hook
  const {
    pinterestData,
    isLoading: isPinterestLoading,
    error: pinterestError,
    lastUpdated: pinterestLastUpdated,
    refreshData: refreshPinterestData
  } = usePinterestMonetization(userContent);

  // State for content creation flow
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState('');
  const [viewingContent, setViewingContent] = useState<ContentItem | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isLoadingView, setIsLoadingView] = useState(false);
  // YouTube view count state
  const [youtubeVideoViews, setYouTubeVideoViews] = useState<number>(0);
  const [youtubeChannelId, setYouTubeChannelId] = useState<string>('');
  const [youtubeChannelViews, setYouTubeChannelViews] = useState<number | null>(null);
  // Short video conversion notifications
  
  // Platform metrics state
  const [platformMetrics, setPlatformMetrics] = useState({
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    channelSubscribers: 0,
    totalVideos: 0,
    totalDuration: 0,
    avgSubscribers: 0
  });
  const [youtubeChannelInput, setYouTubeChannelInput] = useState<string>('');
  const [isLoadingYouTubeData, setIsLoadingYouTubeData] = useState(false);
  const [youtubeQuotaExceeded, setYoutubeQuotaExceeded] = useState(false);
  const [youtubeDebugInfo, setYoutubeDebugInfo] = useState<string>('');
  
  // Load Spotify data when component mounts
  useEffect(() => {
    if (spotifyService.isAuthenticated()) {
      loadTrackedPlaylists();
    }
  }, [loadTrackedPlaylists]);

  // Calculate YouTube views from user content
  const calculateYouTubeViews = () => {
    const youtubeContent = userContent.filter(item => 
      item.platforms && 
      item.platforms.some(p => p.toLowerCase().includes('youtube'))
    );
    
    console.log('YouTube content found:', youtubeContent.map(item => ({
      id: item.id,
      title: item.title,
      platforms: item.platforms,
      views: item.views,
      engagement: item.engagement
    })));
    
    // Sum up views from all YouTube content
    const totalViews = youtubeContent.reduce((sum, item) => {
      // Use engagement data as a proxy for views if views is 0
      const viewCount = item.views || item.engagement || 0;
      console.log(`YouTube item "${item.title}": views=${item.views}, engagement=${item.engagement}, using=${viewCount}`);
      return sum + viewCount;
    }, 0);
    
    console.log('Total calculated YouTube views:', totalViews);
    return totalViews;
  };

  // Helper function to format duration
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  };

  // Fetch platform metrics for the dashboard
  const fetchPlatformMetrics = async () => {
    if (currentPlatform === 'all') {
      // Reset to default values for all platforms
      setPlatformMetrics({
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        channelSubscribers: 0,
        totalVideos: 0,
        totalDuration: 0,
        avgSubscribers: 0
      });
      return;
    }
    
    setIsLoadingYouTubeData(true);
    try {
      // If we have a most recent content and it's YouTube, fetch real metrics
      if (mostRecentContent && currentPlatform === 'youtube' && mostRecentContent.originalUrl) {
        console.log('Fetching real YouTube metrics for video:', mostRecentContent.originalUrl);
        
        // Extract video ID from URL
        const videoId = mostRecentContent.originalUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
        
        if (videoId) {
          const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
          if (apiKey) {
            try {
              const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails,snippet&id=${videoId}&key=${apiKey}`);
              
              if (response.ok) {
                const data = await response.json();
                
                if (data.items && data.items.length > 0) {
                  const video = data.items[0];
                  const stats = video.statistics;
                  const snippet = video.snippet;
                  
                  // Fetch channel statistics for subscriber count
                  let subscriberCount = 0;
                  if (snippet?.channelId) {
                    try {
                      const channelResponse = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${snippet.channelId}&key=${apiKey}`);
                      if (channelResponse.ok) {
                        const channelData = await channelResponse.json();
                        if (channelData.items && channelData.items.length > 0) {
                          subscriberCount = parseInt(channelData.items[0].statistics?.subscriberCount || '0');
                        }
                      }
                    } catch (channelError) {
                      console.warn('Could not fetch channel statistics:', channelError);
                    }
                  }
                  
                  const realMetrics = {
                    totalViews: parseInt(stats.viewCount || '0'),
                    totalLikes: parseInt(stats.likeCount || '0'),
                    totalComments: parseInt(stats.commentCount || '0'),
                    channelSubscribers: subscriberCount,
                    totalVideos: 1,
                    totalDuration: 0, // Duration parsing would need additional logic
                    avgSubscribers: subscriberCount
                  };
                  
                  setPlatformMetrics(realMetrics);
                  
                  console.log('Real YouTube metrics fetched:', realMetrics);
                  return;
                }
              } else {
                console.warn('YouTube API request failed:', response.status, response.statusText);
              }
            } catch (apiError) {
              console.warn('YouTube API error:', apiError);
            }
          } else {
            console.warn('YouTube API key not found');
          }
        }
      }
      
      // Fallback: Filter content by current platform
      const platformContent = userContent.filter(item => {
        if (!item.platforms) return false;
        return item.platforms.some(p => p.toLowerCase().includes(currentPlatform));
      });
      
      console.log(`${currentPlatform} content found:`, platformContent.length);
      
      // If no content found, use sample data for demonstration
      if (platformContent.length === 0) {
        console.log(`No ${currentPlatform} content found, using sample data`);
        const sampleData = {
          youtube: {
            totalViews: 382,
            totalLikes: 9,
            totalComments: 1,
            totalVideos: 1,
            totalDuration: 157, // 2:37 in seconds
            avgSubscribers: 140000
          },
          instagram: {
            totalViews: 1250,
            totalLikes: 45,
            totalComments: 8,
            totalVideos: 3,
            totalDuration: 180,
            avgSubscribers: 25000
          },
          facebook: {
            totalViews: 890,
            totalLikes: 23,
            totalComments: 5,
            totalVideos: 2,
            totalDuration: 120,
            avgSubscribers: 15000
          },
          tiktok: {
            totalViews: 5000,
            totalLikes: 200,
            totalComments: 50,
            totalVideos: 5,
            totalDuration: 300,
            avgSubscribers: 50000
          }
        };
        
        const data = sampleData[currentPlatform as keyof typeof sampleData] || {
          totalViews: 100,
          totalLikes: 5,
          totalComments: 2,
          totalVideos: 1,
          totalDuration: 60,
          avgSubscribers: 10000
        };
        
        setPlatformMetrics({
          totalViews: data.totalViews,
          totalLikes: data.totalLikes,
          totalComments: data.totalComments,
          channelSubscribers: data.avgSubscribers,
          totalVideos: data.totalVideos,
          totalDuration: data.totalDuration,
          avgSubscribers: data.avgSubscribers
        });
        
        console.log(`${currentPlatform} sample metrics set:`, data);
        return;
      }
      
      // Calculate metrics based on platform
      const totalViews = platformContent.reduce((sum, item) => {
        return sum + (item.views || item.engagement || 0);
      }, 0);
      
      const totalLikes = platformContent.reduce((sum, item) => {
        return sum + (item.metrics?.likes || item.likes || 0);
      }, 0);
      
      const totalComments = platformContent.reduce((sum, item) => {
        return sum + (item.metrics?.comments || item.comments || 0);
      }, 0);
      
      const totalVideos = platformContent.filter(item => item.type === 'video').length;
      
      const totalDuration = platformContent.reduce((sum, item) => {
        return sum + (item.metrics?.duration || item.duration || 0);
      }, 0);
      
      // Calculate average subscribers based on platform
      let avgSubscribers = 0;
      if (currentPlatform === 'youtube') {
        avgSubscribers = youtubeChannelViews || Math.floor(totalViews / 100);
      } else if (currentPlatform === 'instagram') {
        avgSubscribers = Math.floor(totalViews / 50); // Instagram typically has higher engagement
      } else if (currentPlatform === 'facebook') {
        avgSubscribers = Math.floor(totalViews / 30);
      } else if (currentPlatform === 'tiktok') {
        avgSubscribers = Math.floor(totalViews / 200); // TikTok has very high engagement
      } else {
        avgSubscribers = Math.floor(totalViews / 100);
      }
      
      const channelSubscribers = avgSubscribers;
      
      setPlatformMetrics({
        totalViews,
        totalLikes,
        totalComments,
        channelSubscribers,
        totalVideos,
        totalDuration,
        avgSubscribers
      });
      
      console.log(`${currentPlatform} metrics updated:`, {
        totalViews,
        totalLikes,
        totalComments,
        channelSubscribers,
        totalVideos,
        totalDuration,
        avgSubscribers
      });
      
    } catch (error) {
      console.error(`Error fetching ${currentPlatform} metrics:`, error);
    } finally {
      setIsLoadingYouTubeData(false);
    }
  };

  // Manual refresh function for YouTube data
  const refreshYouTubeData = async () => {
    console.log('🔄 Manually refreshing YouTube data...');
    setYoutubeDebugInfo('Refreshing YouTube data...');
    setYoutubeQuotaExceeded(false);
    
    // Find all YouTube video IDs from userContent
    const youtubeIds: string[] = userContent
      .filter(item =>
        item.platforms?.some(p => p.toLowerCase().includes('youtube')) &&
        typeof item.originalUrl === 'string' && !!item.originalUrl
      )
      .map(item => {
        // Try to extract YouTube video ID from URL
        const match = (item.originalUrl as string).match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        return match ? match[1] : null;
      })
      .filter((id): id is string => !!id);
    
    console.log('📹 Found YouTube video IDs:', youtubeIds);
    setYoutubeDebugInfo(`Found ${youtubeIds.length} YouTube videos: ${youtubeIds.join(', ')}`);
    
    if (youtubeIds.length === 0) {
      setYoutubeDebugInfo('No YouTube videos found in your content');
      setYouTubeVideoViews(0);
      return;
    }
    
    try {
      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
      
      if (!apiKey) {
        setYoutubeDebugInfo('❌ YouTube API key not found. Check your .env file.');
        const calculatedViews = calculateYouTubeViews();
        setYouTubeVideoViews(calculatedViews);
        return;
      }
      
      setIsLoadingYouTubeData(true);
      setYoutubeDebugInfo(`🔑 API key found. Fetching view counts for ${youtubeIds.length} videos...`);
      
      // Use the existing fetchYouTubeViewCounts function
      const viewCounts = await fetchYouTubeViewCounts(youtubeIds, apiKey);
      console.log('✅ YouTube API response:', viewCounts);
      
      const totalViews = Object.values(viewCounts).reduce((sum, v) => sum + v, 0);
      console.log('📊 Total YouTube views from API:', totalViews);
      
      setYouTubeVideoViews(totalViews);
      setYoutubeDebugInfo(`✅ Success! Total views: ${totalViews.toLocaleString()}`);
      setIsLoadingYouTubeData(false);
      
    } catch (error) {
      console.error('❌ Error fetching YouTube view counts:', error);
      
      if (error instanceof Error && error.message.includes('quota exceeded')) {
        setYoutubeDebugInfo('⚠️ Quota exceeded. Using calculated views as fallback.');
        setYoutubeQuotaExceeded(true);
        const calculatedViews = calculateYouTubeViews();
        setYouTubeVideoViews(calculatedViews);
      } else {
        setYoutubeDebugInfo(`❌ API Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        // Fallback to calculated views
        const calculatedViews = calculateYouTubeViews();
        setYouTubeVideoViews(calculatedViews);
      }
      
      setIsLoadingYouTubeData(false);
    }
  };

  // Force YouTube API test with hardcoded videos
  const forceYouTubeAPITest = async () => {
    console.log('🎯 FORCING YOUTUBE API TEST WITH HARDCODED VIDEOS');
    setYoutubeDebugInfo('🎯 Forcing YouTube API test...');
    setYoutubeQuotaExceeded(false);
    
    // Hardcoded test videos to force API calls
    const hardcodedVideos = [
      {
        id: 'KrZcB_RA0i8',
        title: 'User\'s Video (KrZcB_RA0i8)',
        originalUrl: 'https://www.youtube.com/watch?v=KrZcB_RA0i8'
      },
      {
        id: '4gdWNPQszsM',
        title: 'Test Video (4gdWNPQszsM)',
        originalUrl: 'https://www.youtube.com/watch?v=4gdWNPQszsM'
      },
      {
        id: 'dQw4w9WgXcQ',
        title: 'Rick Roll (dQw4w9WgXcQ)',
        originalUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      }
    ];
    
    console.log('Testing with hardcoded videos:', hardcodedVideos);
    setYoutubeDebugInfo(`Testing ${hardcodedVideos.length} hardcoded videos...`);
    
    try {
      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
      
      if (!apiKey) {
        setYoutubeDebugInfo('❌ YouTube API key not found. Check your .env file.');
        return;
      }
      
      setIsLoadingYouTubeData(true);
      setYoutubeDebugInfo('🔑 API key found. Testing with hardcoded videos...');
      
      // Test each video individually
      let totalViews = 0;
      const results = [];
      
      for (const video of hardcodedVideos) {
        try {
          const url = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${video.id}&key=${apiKey}`;
          console.log('Testing video:', video.title, 'with URL:', url.replace(apiKey, '***API_KEY_HIDDEN***'));
          
          const response = await fetch(url);
          const data = await response.json();
          
          if (data.items && data.items.length > 0) {
            const viewCount = parseInt(data.items[0].statistics.viewCount || '0');
            const likeCount = parseInt(data.items[0].statistics.likeCount || '0');
            const commentCount = parseInt(data.items[0].statistics.commentCount || '0');
            
            totalViews += viewCount;
            results.push({
              title: video.title,
              views: viewCount,
              likes: likeCount,
              comments: commentCount
            });
            
            console.log(`✅ ${video.title}: ${viewCount.toLocaleString()} views, ${likeCount} likes, ${commentCount} comments`);
          } else {
            console.log(`❌ ${video.title}: No data returned`);
            results.push({
              title: video.title,
              views: 0,
              likes: 0,
              comments: 0
            });
          }
        } catch (videoError) {
          console.error(`❌ Error testing ${video.title}:`, videoError);
          results.push({
            title: video.title,
            views: 0,
            likes: 0,
            comments: 0
          });
        }
      }
      
      console.log('=== FORCED API TEST COMPLETE ===');
      console.log('Total views fetched:', totalViews);
      console.log('Results:', results);
      
      setYouTubeVideoViews(totalViews);
      setYoutubeDebugInfo(`🎯 Forced API Test Complete!\n\nTotal Views: ${totalViews.toLocaleString()}\n\nVideos Tested:\n${results.map(r => `• ${r.title}: ${r.views.toLocaleString()} views`).join('\n')}`);
      setIsLoadingYouTubeData(false);
      
    } catch (error) {
      console.error('❌ Error in forced API test:', error);
      setYoutubeDebugInfo(`❌ Forced API test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsLoadingYouTubeData(false);
    }
  };

  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [facebookMetrics, setFacebookMetrics] = useState<{
    total_impressions: number;
    total_reactions: number;
  } | null>(null);

  // Get the most recent content and determine platform automatically
  const getMostRecentContent = () => {
    if (!userContent || userContent.length === 0) return null;
    
    // Sort by upload date (assuming there's a date field) or by ID (newest first)
    const sortedContent = [...userContent].sort((a, b) => {
      // If there's a date field, use it; otherwise use ID as fallback
      if (a.uploadDate && b.uploadDate) {
        return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      }
      // Fallback to ID comparison (assuming newer IDs are higher)
      return b.id.localeCompare(a.id);
    });
    
    return sortedContent[0];
  };

  const mostRecentContent = getMostRecentContent();
  const currentPlatform = mostRecentContent?.platforms?.[0]?.toLowerCase() || 'all';

  // Handle platform changes based on most recent content
  useEffect(() => {
    if (currentPlatform !== 'all') {
      console.log(`Platform automatically set to: ${currentPlatform} based on most recent content`);
      // Fetch platform metrics for the current platform
      fetchPlatformMetrics();
    }
  }, [currentPlatform, userContent]);

  // Recalculate YouTube views when userContent changes
  useEffect(() => {
    const calculatedViews = calculateYouTubeViews();
    setYouTubeVideoViews(calculatedViews);
    console.log('YouTube views updated:', calculatedViews);
  }, [userContent]);

  // Filter monetization data based on selected platform
  const getFilteredMonetizationData = () => {
    const baseMetrics = [
    ];

    // Platform-specific metrics
    const platformMetrics = {
      spotify: [
        { 
          name: 'Followers', 
          value: isSpotifyLoading ? 'Loading...' : aggregatedMetrics.totalFollowers.toLocaleString(), 
          platform: 'spotify' 
        },
        { 
          name: 'Track Count', 
          value: isSpotifyLoading ? 'Loading...' : aggregatedMetrics.totalTracks.toLocaleString(), 
          platform: 'spotify' 
        },
      ],
      instagram: [
        { name: 'Sponsored Posts', value: '$120', platform: 'instagram' },
        { name: 'Story Views', value: '8.7K', platform: 'instagram' },
        { name: 'Engagement Rate', value: '4.8%', platform: 'instagram' },
        { name: 'Brand Deals', value: '3', platform: 'instagram' },
        { name: 'Affiliate Sales', value: '$89', platform: 'instagram' },
        { name: 'Influencer Score', value: '7.2/10', platform: 'instagram' },
      ],
      facebook: [
        { name: 'Page Revenue', value: '$95', platform: 'facebook' },
        { name: 'Ad Performance', value: 'B+', platform: 'facebook' },
        { name: 'Community Growth', value: '+12%', platform: 'facebook' },
        { name: 'Post Reach', value: '15.2K', platform: 'facebook' },
        { name: 'Group Monetization', value: '$67', platform: 'facebook' },
        { name: 'Business Leads', value: '23', platform: 'facebook' },
      ],
      pinterest: [
        { 
          name: 'Total Saves', 
          value: isPinterestLoading ? 'Loading...' : (pinterestData?.totalSaves || 0).toLocaleString(), 
          platform: 'pinterest' 
        },
        { 
          name: 'Total Pins', 
          value: isPinterestLoading ? 'Loading...' : (pinterestData?.totalPins || 0).toLocaleString(), 
          platform: 'pinterest' 
        },
        { 
          name: 'Avg Saves/Pin', 
          value: isPinterestLoading ? 'Loading...' : Math.round((pinterestData?.averageSavesPerPin || 0)).toLocaleString(), 
          platform: 'pinterest' 
        },
        { 
          name: 'Engagement Rate', 
          value: isPinterestLoading ? 'Loading...' : `${(pinterestData?.engagementRate || 0).toFixed(1)}%`, 
          platform: 'pinterest' 
        },
        { 
          name: 'Est. Revenue', 
          value: isPinterestLoading ? 'Loading...' : `$${Math.round(pinterestData?.estimatedMonthlyRevenue || 0).toLocaleString()}`, 
          platform: 'pinterest' 
        },
        { 
          name: 'Monetization Score', 
          value: isPinterestLoading ? 'Loading...' : `${pinterestData?.monetizationScore || 0}/10`, 
          platform: 'pinterest' 
        },
      ],
      youtube: [
        { 
          name: 'Total Views', 
          value: youtubeData?.totalViews?.toLocaleString() || '0', 
          platform: 'youtube' 
        },
        { 
          name: 'Total Likes', 
          value: youtubeData?.totalLikes?.toLocaleString() || '0', 
          platform: 'youtube' 
        },
        { 
          name: 'Total Comments', 
          value: youtubeData?.totalComments?.toLocaleString() || '0', 
          platform: 'youtube' 
        },
        { 
          name: 'Total Duration', 
          value: youtubeData?.totalDuration ? formatDurationForDisplay(youtubeData.totalDuration) : '0:00', 
          platform: 'youtube' 
        },
        { 
          name: 'Avg Subscribers', 
          value: youtubeData?.averageSubscriberCount?.toLocaleString() || '0', 
          platform: 'youtube' 
        },
      ],
      others: [
        { name: 'Cross-Platform', value: '$78', platform: 'others' },
        { name: 'Email Revenue', value: '$45', platform: 'others' },
        { name: 'Webinar Sales', value: '$234', platform: 'others' },
        { name: 'Consulting', value: '$500', platform: 'others' },
        { name: 'Digital Products', value: '$123', platform: 'others' },
        { name: 'Partnerships', value: '$189', platform: 'others' },
      ],
    };

    if (currentPlatform === 'all') {
      return baseMetrics;
    }

    return platformMetrics[currentPlatform as keyof typeof platformMetrics] || baseMetrics;
  };

  // Force close all modals function
  const closeAllModals = () => {
    setShowCategorySelector(false);
    setShowUploader(false);
    setShowViewModal(false);
    setShowSuccessMessage(false);
    setShowDeleteSuccess(false);
  };

  // Format ISO 8601 duration for display
  const formatDurationForDisplay = (duration: string): string => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '0:00';
    
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  };

  // Custom delete handler with success notification
  const handleContentDelete = async (contentId: string) => {
    try {
      await removeContent(contentId);
      setDeleteSuccessMessage('Content deleted successfully!');
      setShowDeleteSuccess(true);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setShowDeleteSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error deleting content:', error);
      // Could add error notification here
    }
  };

  // Custom delete all handler with success notification
  const handleDeleteAllContent = async () => {
    try {
      await removeAllContent();
      setDeleteSuccessMessage('All content deleted successfully!');
      setShowDeleteSuccess(true);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setShowDeleteSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error deleting all content:', error);
      // Could add error notification here
    }
  };

  // Debug: Log modal states
  useEffect(() => {
    console.log('Modal states:', {
      showCategorySelector,
      showUploader,
      showViewModal,
      showSuccessMessage
    });
  }, [showCategorySelector, showUploader, showViewModal, showSuccessMessage]);

  // Debug: Log content loading state
  useEffect(() => {
    console.log('Content loading state:', {
      isLoading,
      contentCount: userContent.length,
      realContentCount: userContent.filter(item => !item.id.startsWith('default-')).length,
      hasRealContent: userContent.some(item => !item.id.startsWith('default-'))
    });
  }, [isLoading, userContent]);

  // Handle escape key to close modals
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showCategorySelector) {
          handleCategorySelectorClose();
        } else if (showUploader) {
          handleUploaderClose();
        } else if (showViewModal) {
          setShowViewModal(false);
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showCategorySelector, showUploader, showViewModal]);

  // Auto-close any stuck modals on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (showCategorySelector || showUploader || showViewModal) {
        console.log('Auto-closing stuck modals');
        closeAllModals();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Ensure only one modal is open at a time
  useEffect(() => {
    const openModals = [showCategorySelector, showUploader, showViewModal].filter(Boolean);
    if (openModals.length > 1) {
      console.log('Multiple modals detected, closing all except the last one');
      closeAllModals();
    }
  }, [showCategorySelector, showUploader, showViewModal]);

  // Handle uploaded content from navigation state
  useEffect(() => {
    const uploadedContent = location.state?.uploadedContent;
    if (uploadedContent) {
      handleNewUpload(uploadedContent);
      // Clear the navigation state
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);


  const handleNewUpload = (uploadResult: { id: string; url: string; type: string; category?: any; platforms?: string[]; title?: string }) => {
    // Create a new ContentItem from the upload result
    const defaultPlatforms = uploadResult.category && uploadResult.category.platforms && uploadResult.category.platforms.length > 0
      ? uploadResult.category.platforms
      : uploadResult.type === 'image' || uploadResult.type === 'photo'
        ? ['instagram', 'pinterest', 'facebook']
        : uploadResult.type === 'video'
          ? ['youtube', 'instagram', 'tiktok']
          : uploadResult.type === 'audio'
            ? ['spotify', 'apple-podcasts', 'youtube']
            : ['social'];
    
    // Generate random engagement data for demonstration
    const engagement = Math.floor(Math.random() * 2000) + 500; // Random engagement between 500-2500
    
    const newContent: ContentItem = {
      id: uploadResult.id,
      title: uploadResult.title || `Uploaded ${uploadResult.type}`,
      description: `Your uploaded ${uploadResult.type} content`,
      type: mapUploadTypeToContentType(uploadResult.type),
      status: 'pending',
      createdAt: new Date().toISOString(),
      originalUrl: uploadResult.url,
      thumbnail: uploadResult.url,
      engagement: engagement,
      views: 0, // Set initial view count to zero
      generatedAssets: [
        {
          id: `${uploadResult.id}-asset-1`,
          type: 'analysis',
          status: 'pending',
          content: `Analysis for uploaded ${uploadResult.type} content`
        }
      ],
      platforms: uploadResult.platforms && uploadResult.platforms.length > 0 ? uploadResult.platforms : defaultPlatforms
    };

    // Add to the content list
    addContent(newContent);
  };

  const mapUploadTypeToContentType = (uploadType: string): ContentItem['type'] => {
    switch (uploadType.toLowerCase()) {
      case 'video':
        return 'video';
      case 'image':
        return 'photo';
      case 'audio':
        return 'audio';
      default:
        return 'written';
    }
  };

  const getDefaultPlatformsForType = (uploadType: string): string[] => {
    switch (uploadType.toLowerCase()) {
      case 'video':
        return ['youtube', 'instagram', 'tiktok'];
      case 'image':
        return ['instagram', 'pinterest', 'facebook'];
      case 'audio':
        return ['spotify', 'apple-podcasts', 'youtube'];
      default:
        return ['social'];
    }
  };

  const hasRealContent = userContent.some(item => !item.id.startsWith('default-'));



  // Use shared analytics hook
  const analyticsData = useAnalytics(userContent, youtubeVideoViews);
  
  // Calculate additional metrics for GYBStudio
  const totalContent = userContent.length;
  const realContent = userContent.filter((item: ContentItem) => !item.id.startsWith('default-'));
  const totalEngagement = userContent.reduce((sum: number, item: ContentItem) => sum + (item.engagement || 0), 0);
  const averageEngagement = totalContent > 0 ? totalEngagement / totalContent : 0;



  // Debug: Log all user content to see structure
  console.log('All User Content Debug:', userContent.map(item => ({
    id: item.id,
    title: item.title,
    type: item.type,
    platforms: item.platforms,
    originalUrl: item.originalUrl
  })));

  // Debug: Log all unique platforms found
  const allPlatforms = new Set<string>();
  userContent.forEach(item => {
    if (item.platforms) {
      item.platforms.forEach(p => allPlatforms.add(p.toLowerCase()));
    }
  });
  console.log('All unique platforms found:', Array.from(allPlatforms));

  let barData = analyticsData.barData;
  if (barData.length > 15) {
    barData = [...barData]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 15);
  }

  // Debug: Show what will be displayed in the chart
  console.log('Final barData for chart:', barData);
  console.log('Chart will display these platforms:', barData.map(item => item.name));

  const platformData = analyticsData.platformData;

  console.log('GYBStudio - Final platformData:', platformData);



  const metrics = [
            { name: 'Total Content', value: totalContent.toString() },
        { name: 'Real Content', value: realContent.length.toString() },
        { name: 'Content Types', value: Object.keys(analyticsData.CONTENT_TYPE_COLORS).length.toString() },
        { name: 'Platforms Used', value: Object.keys(analyticsData.PLATFORM_GROUP_COLORS).length.toString() },
        { name: 'Avg Engagement', value: averageEngagement.toFixed(1) },
        { name: 'Total Engagement', value: totalEngagement.toString() },
  ];

  const handleContentClick = (item: ContentItem) => {
    // Handle content item click - could open editor or show details    console.log('Content clicked:', item);
    
    // If it's an AI suggestion, show it in the view modal
    if (item.isAISuggestion) {
      setViewingContent(item);
      setShowViewModal(true);
      return;
    }
    
    // For regular content, you could navigate to a content editor or show a modal
    // For now, just show in view modal
    setViewingContent(item);
    setShowViewModal(true);
  };

  const handleViewContent = async (item: ContentItem) => {
    // Close any other modals first
    setShowCategorySelector(false);
    setShowUploader(false);
    setShowSuccessMessage(false);
    
    setViewingContent(item);
    setIsLoadingView(true);
    setShowViewModal(true);
    
    // Simulate loading time for content analysis
    setTimeout(() => {
      setIsLoadingView(false);
    }, 1000);
  };

  const handleCreateContentClick = () => {
    // Close any other modals first
    setShowViewModal(false);
    setShowUploader(false);
    setShowSuccessMessage(false);
    setShowCategorySelector(true);
  };

  const handleCategorySelect = (category: any) => {
    setSelectedCategory(category);
    setShowCategorySelector(false);
    setShowUploader(true);
  };

  const handleCategorySelectorClose = () => {
    setShowCategorySelector(false);
  };

  const handleUploaderClose = () => {
    setShowUploader(false);
    setSelectedCategory(null);
  };

  const handleUploadComplete = async (result: { id: string; url: string; type: string; category: any; platforms?: string[]; title?: string }) => {
    // Create a new ContentItem from the upload result
    const defaultPlatforms = result.category && result.category.platforms && result.category.platforms.length > 0
      ? result.category.platforms
      : result.type === 'image' || result.type === 'photo'
        ? ['instagram', 'pinterest', 'facebook']
        : result.type === 'video'
          ? ['youtube', 'instagram', 'tiktok']
          : result.type === 'audio'
            ? ['spotify', 'apple-podcasts', 'youtube']
            : ['social'];
    
    // Generate random engagement data for demonstration
    const engagement = Math.floor(Math.random() * 2000) + 500; // Random engagement between 500-2500
    
    const newContent: ContentItem = {
      id: result.id,
      title: result.title || `Uploaded ${result.category.name}`,
      description: `Your uploaded ${result.category.name.toLowerCase()} content`,
      type: result.category.type,
      status: 'pending',
      createdAt: new Date().toISOString(),
      originalUrl: result.url,
      thumbnail: result.url,
      engagement: engagement,
      views: 0, // Set initial view count to zero
      generatedAssets: [
        {
          id: `${result.id}-asset-1`,
          type: 'analysis',
          status: 'pending',
          content: `Analysis for uploaded ${result.category.name.toLowerCase()} content`
        }
      ],
      platforms: result.platforms && result.platforms.length > 0 ? result.platforms : defaultPlatforms,
      
    };

    // Add to the content list
    addContent(newContent);
    
    // Save to database
    try {
      if (user?.uid) {
        await saveUserContent(user.uid, newContent);
        console.log('Content saved to database successfully');
      } else {
        console.error('User not authenticated, cannot save content');
      }
    } catch (error) {
      console.error('Error saving content to database:', error);
    }
    
    // Refresh content from database to ensure it's properly loaded
    setTimeout(() => {
      refreshContent();
    }, 1000);
    
    // Show success message
    const contentTitle = result.title || result.category.name;
    setSuccessMessage(`"${contentTitle}" has been successfully added to your library!`);
    setShowSuccessMessage(true);
    
    // Auto-hide success message after 5 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
      setSuccessMessage('');
    }, 5000);
    
    // Close the uploader
    handleUploaderClose();
  };

  const handleUploadClick = () => {
    navigate('/upload');
  };

  // Handle AI suggestions and convert them to ContentItem objects
  const handleSuggestionsGenerated = (suggestions: any[]) => {
    const suggestionContentItems = suggestions.map((suggestion, index) => ({
      id: `ai-suggestion-${Date.now()}-${index}`,
      title: suggestion.title,
      description: suggestion.explanation,
      type: 'written' as ContentType, // Default to written for suggestions
      status: 'suggestion',
      createdAt: new Date().toISOString(),
      originalUrl: suggestion.url,
      thumbnail: suggestion.image,
      platforms: ['ai-suggestion'],
      isAISuggestion: true,
      suggestionData: suggestion
    }));
    
    setAiSuggestions(suggestionContentItems);
  };

  const isPieChartEmpty = platformData.every(item => item.value === 0);

  const PLATFORM_COLORS: Record<string, string> = {
    YouTube: '#FF0000',
    Instagram: '#C13584',
    Spotify: '#1DB954',
    Pinterest: '#E60023', 
    Blog: '#F4B400',
    Other: '#9E9E9E',
    Facebook: '#1877F3'
    // Add more as needed
  };

  const CustomBarTooltip = ({ active, payload, label }: { active: boolean; payload: any[]; label: string }) => {
    if (active && payload && payload.length) {
      const barData = payload[0].payload;

      // For Audio
      if (label === 'Audio') {
        return (
          <div className="bg-white p-3 rounded shadow text-sm border border-gray-200">
            <div className="font-semibold mb-1">{label}</div>
            <div>Spotify content: {barData.Spotify ?? 0}</div>
            <div>View count: {barData.views ?? 0}</div>
          </div>
        );
      }
      // For Social Media - Enhanced with Facebook metrics
      if (label === 'Social Media') {
        return (
          <div className="bg-white p-3 rounded shadow text-sm border border-gray-200">
            <div className="font-semibold mb-1">{label}</div>
            <div>Facebook content: {barData.Facebook ?? 0}</div>
            <div>Post Impressions: {facebookMetrics?.total_impressions?.toLocaleString() ?? 'Loading...'}</div>
            <div>Total Reactions: {facebookMetrics?.total_reactions?.toLocaleString() ?? 'Loading...'}</div>
            <div>Instagram content: {barData.Instagram ?? 0}</div>
            <div>Pinterest content: {barData.Pinterest ?? 0}</div>
            <div>View count: {barData.views ?? 0}</div>
          </div>
        );
      }
      // For Other
      if (label === 'Other') {
        return (
          <div className="bg-white p-3 rounded shadow text-sm border border-gray-200">
            <div className="font-semibold mb-1">{label}</div>
            <div>Other content: {barData.Other ?? 0}</div>
            <div>View count: {barData.views ?? 0}</div>
          </div>
        );
      }
      // For YouTube
      if (label === 'YouTube') {
        return (
          <div className="bg-white p-3 rounded shadow text-sm border border-gray-200">
            <div className="font-semibold mb-1">{label}</div>
            <div>YouTube content: {barData.count ?? 0}</div>
            <div>View count: {barData.views ?? 0}</div>
          </div>
        );
      }
      // Default fallback
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

  useEffect(() => {
    // Find all YouTube video IDs from userContent
    const youtubeIds: string[] = userContent
      .filter(item =>
        item.platforms?.some(p => p.toLowerCase().includes('youtube')) &&
        typeof item.originalUrl === 'string' && !!item.originalUrl
      )
      .map(item => {
        // Try to extract YouTube video ID from URL
        const match = (item.originalUrl as string).match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        return match ? match[1] : null;
      })
      .filter((id): id is string => !!id);
    
    console.log('Found YouTube video IDs:', youtubeIds);
    
    // Fetch YouTube view counts from API
    const fetchYouTubeViews = async () => {
      const maxRetries = 3;
      let retryCount = 0;
      
      setIsLoadingYouTubeData(true);
      
      const attemptFetch = async (): Promise<void> => {
        try {
          const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
          
          if (!apiKey) {
            console.warn('YouTube API key not found. Using fallback view calculation.');
            const calculatedViews = calculateYouTubeViews();
            setYouTubeVideoViews(calculatedViews);
            setIsLoadingYouTubeData(false);
            return;
          }
          
          if (youtubeIds.length > 0) {
            console.log(`Fetching YouTube view counts (attempt ${retryCount + 1}/${maxRetries}) for videos:`, youtubeIds);
            
            // Use the existing fetchYouTubeViewCounts function
            const viewCounts = await fetchYouTubeViewCounts(youtubeIds, apiKey);
            console.log('YouTube API response:', viewCounts);
            
            const totalViews = Object.values(viewCounts).reduce((sum, v) => sum + v, 0);
            console.log('Total YouTube views from API:', totalViews);
            
            setYouTubeVideoViews(totalViews);
          } else {
            console.log('No YouTube videos found, setting views to 0');
            setYouTubeVideoViews(0);
          }
          
          setIsLoadingYouTubeData(false);
        } catch (error) {
          console.error(`YouTube API attempt ${retryCount + 1} failed:`, error);
          
          // Check if it's a quota exceeded error
          if (error instanceof Error && error.message.includes('quota exceeded')) {
            console.log('YouTube API quota exceeded, will use fallback calculation');
            setYoutubeQuotaExceeded(true);
            const calculatedViews = calculateYouTubeViews();
            setYouTubeVideoViews(calculatedViews);
            setIsLoadingYouTubeData(false);
            return;
          }
          
          if (retryCount < maxRetries - 1) {
            retryCount++;
            const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 2s, 4s, 8s
            console.log(`Retrying in ${delay}ms...`);
            
            setTimeout(() => {
              attemptFetch();
            }, delay);
          } else {
            console.error('All YouTube API attempts failed. Using fallback calculation.');
            // Final fallback to calculated views
            const calculatedViews = calculateYouTubeViews();
            setYouTubeVideoViews(calculatedViews);
            setIsLoadingYouTubeData(false);
          }
        }
      };
      
      await attemptFetch();
    };
    
    fetchYouTubeViews();

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
  }, [userContent]);

  return (
    <div className="bg-white min-h-screen text-navy-blue">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link to="/dashboard" className="mr-4 text-navy-blue">
              <ChevronLeft size={24} />
            </Link>
            <h1 className="text-3xl font-bold text-navy-blue">GYB Studio</h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* Debug button to close all modals */}
            {(showCategorySelector || showUploader || showViewModal) && (
              <button
                onClick={closeAllModals}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                title="Close all modals"
              >
                Close Modals
              </button>
            )}
            <button
              onClick={handleCreateContentClick}
            className="bg-navy-blue text-white px-4 py-2 rounded-full flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Upload Content
          </button>
          </div>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center">
            <CheckCircle className="mr-2" size={20} />
            {successMessage}
            <button
              onClick={() => setShowSuccessMessage(false)}
              className="ml-4 text-white hover:text-green-100"
            >
              <XIcon size={20} />
            </button>
          </div>
        )}

        {/* Delete Success Message */}
        {showDeleteSuccess && (
          <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center">
            <CheckCircle className="mr-2" size={20} />
            {deleteSuccessMessage}
            <button
              onClick={() => setShowDeleteSuccess(false)}
              className="ml-4 text-white hover:text-red-100"
            >
              <XIcon size={20} />
            </button>
          </div>
        )}

        {/* Short Video Conversion Notification */}

        {/* Content Suggestions for New Users */}
        <ContentSuggestions 
          userContent={userContent}
          onUploadClick={handleUploadClick}
        />

        {/* Unified Content Overview */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-2xl font-bold mb-4">Content Hub Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {metrics.map((metric) => (
              <div key={metric.name} className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm text-gray-600 mb-1">{metric.name}</h3>
                <p className="text-2xl font-bold">{metric.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-8">
          {/* Content Type Distribution */}
          <div>
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
              isLoadingYouTubeData={isLoadingYouTubeData}
              youtubeQuotaExceeded={youtubeQuotaExceeded}
              onResetQuota={() => {
                setYoutubeQuotaExceeded(false);
                // Trigger a refresh of YouTube data
                const event = new Event('focus');
                window.dispatchEvent(event);
              }}
            />

          </div>

          {/* Platform Distribution */}
          <div>
            <PlatformDistribution
              platformData={analyticsData.platformData}
              COLORS={analyticsData.COLORS}
              renderCustomPieLabel={renderCustomPieLabel}
            />
          </div>
        </div>

        {/* YouTube Demographics Section */}
        <YouTubeDemographics className="mb-8" />

        {/* Post Metrics Section */}
        <div className="p-6 rounded-lg shadow mb-8" style={{ backgroundColor: '#e0c472' }}>
          <h2 className="text-2xl font-bold text-center mb-8 text-black">Post Metrics</h2>
          
          
          
          {/* Central AI Character and Platform Icons */}
          <div className="flex justify-center items-center mb-8">
            {/* Left Metrics Cards */}
            <div className="flex flex-col space-y-4 mr-8">
              <div 
                className="text-white p-4 rounded-lg border-2 border-white shadow-lg transform transition-all duration-1000 ease-out"
                style={{
                  backgroundColor: '#11335d',
                  animation: 'slideUp 0.8s ease-out, glowBorder 2s ease-in-out infinite',
                  width: '200px',
                  height: '120px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <div className="text-sm font-medium">
                  {currentPlatform === 'instagram' ? 'Followers' : 
                   currentPlatform === 'facebook' ? 'Followers' : 
                   currentPlatform === 'spotify' ? 'Followers' : 
                   currentPlatform === 'pinterest' ? 'Followers' : 'Total Views'}
                </div>
                <div className="text-2xl font-bold">
                  {currentPlatform === 'instagram' 
                    ? '25.4K'
                    : currentPlatform === 'facebook'
                    ? '18.7K'
                    : currentPlatform === 'spotify'
                    ? '12.3K'
                    : currentPlatform === 'pinterest'
                    ? '9.8K'
                    : currentPlatform === 'youtube' && !isLoadingYouTubeData 
                    ? platformMetrics.totalViews.toLocaleString()
                    : currentPlatform !== 'all' && !isLoadingYouTubeData 
                    ? platformMetrics.totalViews.toLocaleString()
                    : '100k'
                  }
                </div>
              </div>
              <div 
                className="text-white p-4 rounded-lg border-2 border-white shadow-lg transform transition-all duration-1000 ease-out"
                style={{
                  backgroundColor: '#11335d',
                  animation: 'slideUp 0.8s ease-out 0.2s both, glowBorder 2s ease-in-out infinite 0.5s',
                  width: '200px',
                  height: '120px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <div className="text-sm font-medium">
                  {currentPlatform === 'instagram' ? 'CTR' : 
                   currentPlatform === 'facebook' ? 'CTR' : 
                   currentPlatform === 'spotify' ? 'Track Count' : 
                   currentPlatform === 'pinterest' ? 'CTR' : 'Total Likes'}
                </div>
                <div className="text-2xl font-bold">
                  {currentPlatform === 'instagram' 
                    ? '4.8%'
                    : currentPlatform === 'facebook'
                    ? '3.2%'
                    : currentPlatform === 'spotify'
                    ? '247'
                    : currentPlatform === 'pinterest'
                    ? '2.7%'
                    : currentPlatform === 'youtube' && !isLoadingYouTubeData 
                    ? platformMetrics.totalLikes.toLocaleString()
                    : currentPlatform !== 'all' && !isLoadingYouTubeData 
                    ? platformMetrics.totalLikes.toLocaleString()
                    : '100k'
                  }
                </div>
              </div>
            </div>
            
            {/* Central AI Character */}
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                 <img 
                   src="/cropped_ai_image.png"
                   alt="Mr. GYB AI"
                   className="object-contain rounded-lg"
                   style={{
                     width: '350px',
                     height: '350px',
                     border: '3px solid #1e40af'
                    /* boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',*/
                   }}
                 />
                {/* Inner yellow border effect */}
                <div 
                  className="absolute inset-0 rounded-lg pointer-events-none"
                  style={{
                    border: '2px solid #fbbf24',
                    borderRadius: '0.5rem'
                  }}
                />
              </div>
              
              {/* Platform Icon */}
              <div className="flex items-center justify-center">
                {currentPlatform === 'youtube' && (
                  <img 
                    src={youtubeIcon}
                    alt="YouTube"
                    className="w-12 h-12 object-contain"
                    style={{
                      filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
                    }}
                  />
                )}
                {currentPlatform === 'instagram' && (
                  <img 
                    src={instagramIcon}
                    alt="Instagram"
                    className="w-12 h-12 object-contain"
                    style={{
                      filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
                    }}
                  />
                )}
                {currentPlatform === 'facebook' && (
                  <img 
                    src={facebookIcon}
                    alt="Facebook"
                    className="w-12 h-12 object-contain"
                    style={{
                      filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
                    }}
                  />
                )}
                {currentPlatform === 'spotify' && (
                  <img 
                    src={spotifyIcon}
                    alt="Spotify"
                    className="w-12 h-12 object-contain"
                    style={{
                      filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
                    }}
                  />
                )}
                {currentPlatform === 'pinterest' && (
                  <img 
                    src={pinterestIcon}
                    alt="Pinterest"
                    className="w-12 h-12 object-contain"
                    style={{
                      filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
                    }}
                  />
                )}
                {currentPlatform === 'all' && (
                  <div className="w-12 h-12 bg-gray-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xl">🌐</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Right Metrics Cards */}
            <div className="flex flex-col space-y-4 ml-8">
              <div 
                className="text-white p-4 rounded-lg border-2 border-white shadow-lg transform transition-all duration-1000 ease-out"
                style={{
                  backgroundColor: '#11335d',
                  animation: 'slideUp 0.8s ease-out 0.4s both, glowBorder 2s ease-in-out infinite 1s',
                  width: '200px',
                  height: '120px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <div className="text-sm font-medium">
                  {currentPlatform === 'instagram' ? 'CPC' : 
                   currentPlatform === 'facebook' ? 'CPC' : 
                   currentPlatform === 'spotify' ? 'Playlists' : 
                   currentPlatform === 'pinterest' ? 'CPC' : 'Total Comments'}
                </div>
                <div className="text-2xl font-bold">
                  {currentPlatform === 'instagram' 
                    ? '$2.45'
                    : currentPlatform === 'facebook'
                    ? '$1.89'
                    : currentPlatform === 'spotify'
                    ? '15'
                    : currentPlatform === 'pinterest'
                    ? '$1.25'
                    : currentPlatform === 'youtube' && !isLoadingYouTubeData 
                    ? platformMetrics.totalComments.toLocaleString()
                    : currentPlatform !== 'all' && !isLoadingYouTubeData 
                    ? platformMetrics.totalComments.toLocaleString()
                    : '100k'
                  }
                </div>
              </div>
              <div 
                className="text-white p-4 rounded-lg border-2 border-white shadow-lg transform transition-all duration-1000 ease-out"
                style={{
                  backgroundColor: '#11335d',
                  animation: 'slideUp 0.8s ease-out 0.6s both, glowBorder 2s ease-in-out infinite 1.5s',
                  width: '200px',
                  height: '120px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <div className="text-sm font-medium">
                  {currentPlatform === 'instagram' ? 'Engagement Rate' : 
                   currentPlatform === 'facebook' ? 'Engagement Rate' : 
                   currentPlatform === 'spotify' ? 'Monthly Listeners' : 
                   currentPlatform === 'pinterest' ? 'Engagement Rate' : 'Channel Subscribers'}
                </div>
                <div className="text-2xl font-bold">
                  {currentPlatform === 'instagram' 
                    ? '6.2%'
                    : currentPlatform === 'facebook'
                    ? '5.1%'
                    : currentPlatform === 'spotify'
                    ? '8.9K'
                    : currentPlatform === 'pinterest'
                    ? '4.3%'
                    : currentPlatform === 'youtube' && !isLoadingYouTubeData 
                    ? platformMetrics.channelSubscribers.toLocaleString()
                    : currentPlatform !== 'all' && !isLoadingYouTubeData 
                    ? platformMetrics.channelSubscribers.toLocaleString()
                    : '100k'
                  }
                </div>
              </div>
            </div>
          </div>
          
          
          {/* CSS Animations */}
          <style>{`
            @keyframes slideUp {
              0% {
                transform: translateY(50px);
                opacity: 0;
              }
              100% {
                transform: translateY(0);
                opacity: 1;
              }
            }
            
            @keyframes glowBorder {
              0%, 100% {
                box-shadow: 0 0 5px rgba(59, 130, 246, 0.5), 0 0 10px rgba(59, 130, 246, 0.3), 0 0 15px rgba(59, 130, 246, 0.1);
              }
              50% {
                box-shadow: 0 0 10px rgba(59, 130, 246, 0.8), 0 0 20px rgba(59, 130, 246, 0.6), 0 0 30px rgba(59, 130, 246, 0.4);
              }
            }
          `}</style>
          
          
            
          
                        {/* Spotify Playlist Management */}
              {spotifyService.isAuthenticated() && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Spotify Playlists</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={refreshFollowerData}
                        disabled={isSpotifyLoading}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors disabled:opacity-50"
                      >
                        {isSpotifyLoading ? '🔄 Refreshing...' : '🔄 Refresh Data'}
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            const testUrl = 'https://open.spotify.com/playlist/0xBR12jNDKZUOxYnH5ejnS?si=9ZZOJZoiSByJq3pm371-mg';
                            const result = await spotifyService.testSpecificPlaylist(testUrl);
                            if (result.success) {
                              console.log('🎵 Test playlist data:', result.data);
                              alert(`Test successful!\nName: ${result.data.name}\nFollowers: ${result.data.followers}\nTracks: ${result.data.tracks}`);
                            } else {
                              alert(`Test failed: ${result.error}`);
                            }
                          } catch (error) {
                            alert(`Test error: ${error}`);
                          }
                        }}
                        className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                      >
                        🧪 Test Playlist
                      </button>
                    </div>
                  </div>
                  
                  {/* Add Playlist Input */}
                  <div className="mb-4 p-3 bg-white rounded border border-gray-200">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Paste Spotify playlist URL here..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const input = e.target as HTMLInputElement;
                            if (input.value.trim()) {
                              addPlaylist(input.value.trim());
                              input.value = '';
                            }
                          }
                        }}
                      />
                      <button
                        onClick={(e) => {
                          const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                          if (input.value.trim()) {
                            addPlaylist(input.value.trim());
                            input.value = '';
                          }
                        }}
                        className="px-4 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                      >
                        Add Playlist
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Example: https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
                    </p>
                  </div>
              
              {spotifyError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
                  {spotifyError}
                </div>
              )}
              
              {playlists.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {playlists.map((playlist) => (
                    <div key={playlist.id} className="bg-white p-4 rounded-lg border border-gray-200">
                      <h4 className="font-medium text-gray-800 mb-2">{playlist.name}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Followers:</span>
                          <span className="font-medium">{playlist.followers.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tracks:</span>
                          <span className="font-medium">{playlist.tracks}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Updated:</span>
                          <span className="font-medium text-xs">
                            {new Date(playlist.lastUpdated).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <a
                        href={playlist.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-block text-green-600 hover:text-green-800 text-sm"
                      >
                        View on Spotify →
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <p className="mb-2">No playlists tracked yet</p>
                  <p className="text-sm">Connect your Spotify account and add playlists to start tracking followers and track counts</p>
                </div>
              )}
            </div>
          )}
          
        </div>

        {/* Creation Inspirations */}
        <div 
          onClick={() => navigate('/content-inspiration')}
          className="cursor-pointer"
        >
          <CreationInspirationsLazyWrapper 
            limit={3} 
            showRefreshButton={true}
            onSuggestionsGenerated={handleSuggestionsGenerated}
          />
        </div>

        {/* Content History */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Content Hub</h2>
            <div className="flex items-center space-x-2">
              {userContent.length > 0 && (
                <span className="text-sm text-gray-500">
                  {userContent.length} content item{userContent.length !== 1 ? 's' : ''} in your hub
                </span>
              )}
              <button
                onClick={refreshContent}
                className="text-sm text-blue-600 hover:text-blue-800"
                title="Refresh content"
              >
                Refresh
              </button>
            </div>
          </div>
          {/* Show message if user has no real content uploaded */}
          {userContent.filter(item => !item.id.startsWith('default-')).length === 0 && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded text-center text-lg font-medium">
              Upload content to begin tracking performance.
            </div>
          )}
          <ContentList 
            items={userContent}
            onItemClick={handleContentClick}
            showDefaults={true}
            onUploadClick={handleUploadClick}
            onDelete={handleContentDelete}
            onView={handleViewContent}
            onDeleteAll={handleDeleteAllContent}
          />
        </div>
      </div>

      {/* Content Category Selector Modal */}
      {showCategorySelector && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
          onClick={handleCategorySelectorClose}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <ContentCategorySelector
              onClose={handleCategorySelectorClose}
              onCategorySelect={handleCategorySelect}
            />
          </div>
        </div>
      )}

      {/* Category Specific Uploader Modal */}
      {showUploader && selectedCategory && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
          onClick={handleUploaderClose}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <CategorySpecificUploader
              category={selectedCategory}
              onClose={handleUploaderClose}
              onUpload={handleUploadComplete}
            />
          </div>
        </div>
      )}

      {/* Content Viewer Modal */}
      {showViewModal && viewingContent && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setShowViewModal(false)}
        >
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full relative max-h-[90vh] overflow-y-auto">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowViewModal(false)}
            >
              <XIcon size={24} />
            </button>
            
            {/* AI Suggestion Badge */}
            {viewingContent.isAISuggestion && (
              <div className="mb-4">
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                  AI Suggestion
                </span>
              </div>
            )}
            
            <h2 className="text-xl font-bold mb-4">{viewingContent.title}</h2>
            
            {isLoadingView ? (
              <div className="text-center py-8">Loading...</div>
            ) : viewingContent.isAISuggestion && viewingContent.thumbnail ? (
              // AI Suggestion with image
              <div className="space-y-4">
                <img 
                  src={viewingContent.thumbnail} 
                  alt={viewingContent.title} 
                  className="w-full max-h-96 object-cover rounded-lg"
                />
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Why this suggestion is relevant:</h3>
                  <p className="text-gray-700">{viewingContent.description}</p>
                </div>
                {viewingContent.originalUrl && (
                  <div className="flex justify-center">
                    <a 
                      href={viewingContent.originalUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      onClick={(e) => {
                        try {
                          new URL(viewingContent.originalUrl || '');
                        } catch {
                          e.preventDefault();
                          alert('This is a demonstration link. In a real application, this would open a relevant example.');
                        }
                      }}
                    >
                      View Example →
                    </a>
                  </div>
                )}
              </div>
            ) : viewingContent.type === 'photo' || viewingContent.type === 'image' ? (
              <img src={viewingContent.originalUrl} alt={viewingContent.title} className="max-w-full max-h-96 mx-auto" />
            ) : viewingContent.type === 'video' ? (
              getYouTubeEmbedUrl(viewingContent.originalUrl || '') ? (
                <iframe
                  src={getYouTubeEmbedUrl(viewingContent.originalUrl || '') as string}
                  title={viewingContent.title}
                  className="w-full h-96"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video src={viewingContent.originalUrl} controls className="max-w-full max-h-96 mx-auto" />
              )
            ) : viewingContent.type === 'audio' ? (
              <audio src={viewingContent.originalUrl} controls className="w-full" />
            ) : viewingContent.type === 'written' || viewingContent.type === 'document' ? (
              <iframe src={viewingContent.originalUrl} title={viewingContent.title} className="w-full h-96" />
            ) : viewingContent.originalUrl ? (
              <a href={viewingContent.originalUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                Open Link
              </a>
            ) : (
              <div>No preview available.</div>
              
            )}
            
            {!viewingContent.isAISuggestion && (
              <p className="mt-4 text-gray-700">{viewingContent.description}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GYBStudio;