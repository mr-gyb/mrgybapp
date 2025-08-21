import React, { useEffect, useState } from 'react';
import { ChevronLeft, Plus, BarChart2, DollarSign, TrendingUp, Users, CheckCircle, X as XIcon } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import ContentList from './content/ContentList';
import ContentSuggestions from './content/ContentSuggestions';
import ContentCategorySelector from './content/ContentCategorySelector';
import CategorySpecificUploader from './content/CategorySpecificUploader';
import CreationInspirationsLazyWrapper from './content/CreationInspirationsLazyWrapper';
import { ContentItem, ContentType } from '../types/content';
import { useUserContent } from '../hooks/useUserContent';
import { getDisplayContent } from '../utils/contentUtils';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { fetchYouTubeViewCounts } from '../utils/platformUtils';
import { getFacebookMetrics } from '../api/services/facebook.service';
import ContentTypeDistribution from "./analytics/ContentTypeDistribution";
import PlatformDistribution from "./analytics/PlatformDistribution";

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
  const { 
    content: userContent, 
    isLoading, 
    addContent, 
    refreshContent,
    removeContent,
    removeAllContent,
    contentStats
  } = useUserContent();

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
  const [youtubeVideoViews, setYouTubeVideoViews] = useState<number>(0);
  const [youtubeChannelId, setYouTubeChannelId] = useState<string>('');
  const [youtubeChannelViews, setYouTubeChannelViews] = useState<number | null>(null);
  const [youtubeChannelInput, setYouTubeChannelInput] = useState<string>('');
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [facebookMetrics, setFacebookMetrics] = useState<{
    total_impressions: number;
    total_reactions: number;
  } | null>(null);

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

  // Grouping logic for content types
  const groupContentType = (item: ContentItem): 'Blogs' | 'Audio' | 'Video' | 'Social Media' | 'Other' => {
    if (item.type === 'written') return 'Blogs';
    if (item.type === 'audio') return 'Audio';
    if (item.type === 'video') return 'Video';
    if (item.type === 'photo') {
      if (item.platforms && item.platforms.some((p: string) => ['Instagram', 'Pinterest', 'Facebook'].includes(p))) {
        return 'Social Media';
      }
    }
    if (item.platforms && item.platforms.some((p: string) => ['LinkedIn', 'Other'].includes(p))) {
      return 'Other';
    }
    return 'Other';
  };

  // Grouping logic for platforms
  const groupPlatform = (platform: string): 'Blogs' | 'Audio' | 'Video' | 'Social Media' | 'YouTube' | 'Other' => {
    // Debug: log what platforms are being processed
    console.log('Processing platform:', platform);

    const platformLower = platform.toLowerCase();
    
    if ([ 'instagram', 'pinterest', 'facebook', 'social' ].includes(platformLower)) return 'Social Media';
    if ([ 'linkedin', 'other' ].includes(platformLower)) return 'Other';
    if (platformLower === 'blog' || platformLower === 'blogger' || platformLower === 'substack' || platformLower === 'medium') return 'Blogs';
    if (platformLower === 'spotify' || platformLower === 'itunes') return 'Audio';
    if (platformLower === 'youtube') return 'YouTube';
    if (platformLower === 'apple-podcasts') return 'Audio';
    if (platformLower === 'tiktok') return 'Social Media';
    return 'Other';
  };

  // Calculate unified content analytics
  const calculateContentAnalytics = () => {
    const totalContent = userContent.length;
    const realContent = userContent.filter((item: ContentItem) => !item.id.startsWith('default-'));

    // Content type distribution (based on platforms, not content type)
    const contentTypeDistribution: Record<string, number> = {};
    userContent.forEach((item: ContentItem) => {
      // Use platform-based grouping instead of content type
      if (item.platforms && item.platforms.length > 0) {
        // Group by the first platform (or use a more sophisticated grouping)
        const firstPlatform = item.platforms[0];
        const group = groupPlatform(firstPlatform);
        contentTypeDistribution[group] = (contentTypeDistribution[group] || 0) + 1;
      } else {
        // Fallback to content type if no platforms
        let group: string;
        if (item.type === 'written') {
          group = 'Blogs';
        } else if (item.type === 'audio') {
          group = 'Audio';
        } else if (item.type === 'video') {
          group = 'YouTube';
        } else if (item.type === 'photo') {
          group = 'Social Media';
        } else {
          group = 'Other';
        }
        contentTypeDistribution[group] = (contentTypeDistribution[group] || 0) + 1;
      }
    });

    // Platform distribution (grouped)
    const platformCounts: Record<string, number> = {};
    userContent.forEach((item: ContentItem) => {
      console.log('GYBStudio - Processing content item:', item.title, 'Platforms:', item.platforms);
      // Handle platforms array
      (item.platforms || []).forEach((platform: string) => {
        const group = groupPlatform(platform);
        console.log('GYBStudio - Platform:', platform, 'Grouped as:', group);
        platformCounts[group] = (platformCounts[group] || 0) + 1;
      });
      
      
    });

    console.log('GYBStudio - Final platformCounts:', platformCounts);

    // Calculate engagement metrics
    const totalEngagement = userContent.reduce((sum: number, item: ContentItem) => sum + (item.engagement || 0), 0);
    const averageEngagement = totalContent > 0 ? totalEngagement / totalContent : 0;

    return {
      totalContent,
      realContent: realContent.length,
      contentTypeDistribution,
      platformCounts,
      totalEngagement,
      averageEngagement
    };
  };

  const analytics = calculateContentAnalytics();

  // Color map for platform groups
  const PLATFORM_GROUP_COLORS: Record<string, string> = {
    'Audio': '#1DB954',
    'Video': '#FF0000',
    'Social Media': '#C13584',
    'YouTube': '#FF0000',
    'Other': '#9E9E9E'
  };

  // Color map for content type groups (updated for legend)
  const CONTENT_TYPE_COLORS: Record<string, string> = {
    'YouTube': '#FF0000',
    'Instagram': '#C13584',
    'Spotify': '#1DB954',
    'Pinterest': '#E60023', 
    'Other': '#9E9E9E',
    'Facebook': '#1877F3',
  };

  // Only show these keys in the legend
  const LEGEND_KEYS = [
    'YouTube', 'Instagram', 'Spotify', 'Pinterest', 'Other', 'Facebook'
  ];

  // 1. Prepare individual platform data
  const blogTypes = ['Medium', 'WordPress', 'Substack'];
  const audioTypes = ['Spotify', 'iTunes'];
  const socialMediaTypes = ['Instagram', 'Pinterest', 'Facebook'];
  const otherTypes = ['LinkedIn', 'Other'];
  
  // Create individual platform data instead of grouped data
  const individualPlatformData: any[] = [];
  
  // Spotify
  const spotifyCount = userContent.filter(item => item.type === 'audio' && item.platforms && item.platforms.some(p => p.toLowerCase() === 'spotify')).length;
  if (spotifyCount > 0) {
    individualPlatformData.push({
      name: 'Spotify',
      count: spotifyCount,
      color: '#1DB954',
      views: userContent
        .filter(item => item.type === 'audio' && item.platforms && item.platforms.some(p => p.toLowerCase() === 'spotify'))
        .reduce((sum, item) => sum + (item.views ?? 1), 0),
    });
  }
  
  // iTunes
  const itunesCount = userContent.filter(item => item.type === 'audio' && item.platforms && item.platforms.some(p => p.toLowerCase() === 'itunes')).length;
  if (itunesCount > 0) {
    individualPlatformData.push({
      name: 'iTunes',
      count: itunesCount,
      color: '#FF69B4',
      views: userContent
        .filter(item => item.type === 'audio' && item.platforms && item.platforms.some(p => p.toLowerCase() === 'itunes'))
        .reduce((sum, item) => sum + (item.views ?? 1), 0),
    });
  }
  
  // YouTube
  const youtubeCount = userContent.filter(item => item.type === 'video' && item.platforms && item.platforms.some(p => p.toLowerCase() === 'youtube')).length;
  if (youtubeCount > 0) {
    individualPlatformData.push({
      name: 'YouTube',
      count: youtubeCount,
      color: '#FF0000',
      views: userContent
        .filter(item => item.type === 'video' && item.platforms && item.platforms.some(p => p.toLowerCase() === 'youtube'))
        .reduce((sum, item) => sum + (item.views ?? 1), 0),
    });
  }
  
  // Instagram
  const instagramCount = userContent.filter(item => item.type === 'photo' && item.platforms && item.platforms.some(p => p.toLowerCase() === 'instagram')).length;
  if (instagramCount > 0) {
    individualPlatformData.push({
      name: 'Instagram',
      count: instagramCount,
      color: '#C13584',
      views: userContent
        .filter(item => item.type === 'photo' && item.platforms && item.platforms.some(p => p.toLowerCase() === 'instagram'))
        .reduce((sum, item) => sum + (item.views ?? 1), 0),
    });
  }
  
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

  const platformData = Object.entries(analytics.platformCounts)
    .filter(([platform, count]) => count > 0) // Only show platforms with actual content
    .map(([platform, count]) => ({
      name: platform,
      value: count,
      percentage: analytics.totalContent > 0 ? (count / analytics.totalContent) * 100 : 0,
      color: PLATFORM_GROUP_COLORS[platform] || '#8884d8'
    }));

  console.log('GYBStudio - Final platformData:', platformData);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C80'];

  const metrics = [
    { name: 'Total Content', value: analytics.totalContent.toString() },
    { name: 'Real Content', value: analytics.realContent.toString() },
    { name: 'Content Types', value: Object.keys(analytics.contentTypeDistribution).length.toString() },
    { name: 'Platforms Used', value: Object.keys(analytics.platformCounts).length.toString() },
    { name: 'Avg Engagement', value: analytics.averageEngagement.toFixed(1) },
    { name: 'Total Engagement', value: analytics.totalEngagement.toString() },
  ];



  const handleContentClick = (item: ContentItem) => {
    // Handle content item click - could open editor or show details
    console.log('Content clicked:', item);
    
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
    setIsLoadingView(true);
    // Fetch the latest content data from Firestore
    try {
      const docRef = doc(db, 'media_content', item.id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const contentData = docSnap.data();
        setViewingContent({ ...item, ...contentData });
      } else {
        setViewingContent(item);
      }
      setShowViewModal(true);
    } catch (error) {
      setViewingContent(item);
      setShowViewModal(true);
    } finally {
      setIsLoadingView(false);
    }
  };

  const handleCreateContentClick = () => {
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

  const handleUploadComplete = (result: { id: string; url: string; type: string; category: any; platforms?: string[]; title?: string }) => {
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
    Instagram: '#E1306C',
    LinkedIn: '#0077B5',
    Spotify: '#1DB954',
    Blog: '#F4B400',
    
    'All Platforms': '#6C63FF',
    Twitter: '#1DA1F2',
    Facebook: '#1877F3',
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
            <div>iTunes content: {barData.iTunes ?? 0}</div>
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
            <div>LinkedIn content: {barData.LinkedIn ?? 0}</div>
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
        item.type === 'video' &&
        item.platforms?.some(p => p.toLowerCase() === 'youtube') &&
        typeof item.originalUrl === 'string' && !!item.originalUrl
      )
      .map(item => {
        // Try to extract YouTube video ID from URL
        const match = (item.originalUrl as string).match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        return match ? match[1] : null;
      })
      .filter((id): id is string => !!id);
    const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
    if (youtubeIds.length > 0) {
      fetchYouTubeViewCounts(youtubeIds, apiKey)
        .then((result: Record<string, number>) => {
          const totalViews = Object.values(result).reduce((sum, v) => sum + v, 0);
          setYouTubeVideoViews(totalViews);
        })
        .catch(() => setYouTubeVideoViews(0));
    } else {
      setYouTubeVideoViews(0);
    }

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

  // Add YouTube video views to groupedContentData if available
  const groupedContentDataWithYouTube = groupedContentData.map(row => {
    if (row.name === 'YouTube') {
      return { ...row, views: youtubeVideoViews };
    }
    return row;
  });

  // --- Responsive Bar Size Calculation ---
  // Limit to top 15 categories for performance if needed
  let barData = groupedContentDataWithYouTube;
  if (barData.length > 15) {
    barData = [...barData]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 15);
  }
  const numBarGroups = barData.length;
  // Minimum width per bar for readability
  const minBarWidth = 450;
  // Get container width using a ref and state
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
  // Calculate barSize so all bars fit, but never thinner than minBarWidth
  const barSize = containerWidth && numBarGroups > 0
    ? Math.max(Math.floor(containerWidth / numBarGroups) - 16, minBarWidth)
    : minBarWidth;
  // Dynamically adjust label font size
  const labelFontSize = containerWidth && numBarGroups > 0
    ? Math.max(10, Math.min(16, Math.floor(containerWidth / (numBarGroups * 2))))
    : 14;

  // Force close all modals function
  const closeAllModals = () => {
    setShowCategorySelector(false);
    setShowUploader(false);
    setShowViewModal(false);
    setShowSuccessMessage(false);
    setShowDeleteSuccess(false);
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
          <button
              onClick={handleCreateContentClick}
            className="bg-navy-blue text-white px-4 py-2 rounded-full flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Create Content
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
            <h2 className="text-2xl font-bold mb-4">Content Type Distribution</h2>
            <ContentTypeDistribution
              barData={barData}
              userContent={userContent}
              blogTypes={blogTypes}
              audioTypes={audioTypes}
              socialMediaTypes={socialMediaTypes}
              otherTypes={otherTypes}
              CONTENT_TYPE_COLORS={CONTENT_TYPE_COLORS}
              LEGEND_KEYS={LEGEND_KEYS}
              CustomBarTooltip={CustomBarTooltip}
            />
          </div>

          {/* Platform Distribution */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Platform Distribution</h2>
            <PlatformDistribution
              platformData={platformData}
              COLORS={COLORS}
              renderCustomPieLabel={renderCustomPieLabel}
            />
          </div>
        </div>



        {/* Monetization Section */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-2xl font-bold mb-4">Monetization</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Followers Growth', value: '+15%' },
              { name: 'Clickthrough Rate', value: '3.2%' },
              { name: 'CPC (Cost Per Click)', value: '$0.45' },
              { name: 'CPM (Cost Per Mille)', value: '$5.20' },
              { name: 'AOV (Average Order Value)', value: '$75' },
              { name: 'LTV (Lifetime Value)', value: '$250' },
            ].map((metric) => (
              <div key={metric.name} className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm text-gray-600 mb-1">{metric.name}</h3>
                <p className="text-2xl font-bold">{metric.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Creation Inspirations */}
        <CreationInspirationsLazyWrapper 
          limit={3} 
          showRefreshButton={true}
          onSuggestionsGenerated={handleSuggestionsGenerated}
        />

        {/* Content History */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Content Hub</h2>
            {userContent.length > 0 && (
              <span className="text-sm text-gray-500">
                {userContent.length} content item{userContent.length !== 1 ? 's' : ''} in your hub
              </span>
            )}
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
            onDeleteAll={handleDeleteAllContent}
            onView={handleViewContent}
          />
        </div>
      </div>

      {/* Content Category Selector Modal */}
      {showCategorySelector && (
        <ContentCategorySelector
          onClose={handleCategorySelectorClose}
          onCategorySelect={handleCategorySelect}
        />
      )}

      {/* Category Specific Uploader Modal */}
      {showUploader && selectedCategory && (
        <CategorySpecificUploader
          category={selectedCategory}
          onClose={handleUploaderClose}
          onUpload={handleUploadComplete}
        />
      )}

      {/* Content Viewer Modal */}
      {showViewModal && viewingContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full relative max-h-[90vh] overflow-y-auto">
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
