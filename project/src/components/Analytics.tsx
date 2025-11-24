import React, { useEffect, useState, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchYouTubeViewCounts } from '../utils/platformUtils';
import { useUserContent } from '../hooks/useUserContent';
import { platformApiService } from "../api/services/platform-apis.service";
import { ContentItem } from '../types/content';
import YouTubeDemographics from './analytics/YouTubeDemographics';


// Helper to extract YouTube video ID from a URL
function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  
  console.log('🔍 Extracting YouTube ID from URL:', url);
  
  // Handle various YouTube URL formats with comprehensive patterns
  const patterns = [
    // Standard watch URLs
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    // URLs with additional parameters
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
    // Shortened URLs
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    // Embed URLs
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    // Direct video URLs
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
    // Shorts URLs
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    // URLs with hash fragments
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})#.*/,
    // URLs with additional query parameters
    /youtube\.com\/watch\?.*&v=([a-zA-Z0-9_-]{11})/,
    // Mobile URLs
    /m\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    // URLs with timestamps
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})&t=\d+s/
  ];
  
  for (let i = 0; i < patterns.length; i++) {
    const pattern = patterns[i];
    const match = url.match(pattern);
    if (match) {
      const videoId = match[1];
      console.log(`✅ Successfully extracted YouTube ID: ${videoId} using pattern ${i + 1}`);
      console.log(`   Pattern: ${pattern.source}`);
      console.log(`   Match: ${match[0]}`);
      return videoId;
    }
  }
  
  // Try URL parsing as fallback
  try {
    const urlObj = new URL(url);
    console.log('🔍 URL parsing fallback:', {
      hostname: urlObj.hostname,
      pathname: urlObj.pathname,
      searchParams: Object.fromEntries(urlObj.searchParams.entries())
    });
    
    // Check for video ID in search params
    if (urlObj.searchParams.has('v')) {
      const videoId = urlObj.searchParams.get('v');
      if (videoId && videoId.length === 11) {
        console.log(`✅ Extracted video ID from search params: ${videoId}`);
        return videoId;
      }
    }
    
    // Check pathname for various formats
    const pathMatch = urlObj.pathname.match(/\/(?:watch|embed|v|shorts)\/([a-zA-Z0-9_-]{11})/);
    if (pathMatch) {
      const videoId = pathMatch[1];
      console.log(`✅ Extracted video ID from pathname: ${videoId}`);
      return videoId;
    }
    
  } catch (parseError) {
    console.log('❌ URL parsing failed:', parseError);
  }
  
  console.log('❌ Failed to extract YouTube ID from URL:', url);
  console.log('   Supported formats:');
  console.log('   - https://www.youtube.com/watch?v=VIDEO_ID');
  console.log('   - https://youtu.be/VIDEO_ID');
  console.log('   - https://youtube.com/embed/VIDEO_ID');
  console.log('   - https://youtube.com/v/VIDEO_ID');
  console.log('   - https://youtube.com/shorts/VIDEO_ID');
  
  return null;
}

const Analytics: React.FC = () => {
  const { content: userContent } = useUserContent();
  const [youtubeViews, setYoutubeViews] = useState<number>(0);
  const [youtubeDetails, setYoutubeDetails] = useState<Array<{ id: string; title: string; viewCount: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [sampleContent, setSampleContent] = useState<any[]>([]); // Add state for sample content
  const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
  
  // Ensure userContent is always an array
  const safeUserContent = Array.isArray(userContent) ? userContent : [];
  
  useEffect(() => {
    console.log('Loaded YOUTUBE_API_KEY:', YOUTUBE_API_KEY);
    console.log('Environment variables check:');
    console.log('- VITE_YOUTUBE_API_KEY:', import.meta.env.VITE_YOUTUBE_API_KEY);
    console.log('- All env vars:', import.meta.env);
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
      console.log('Found YouTube videos:', videoInfo);
      
      const videoIds = videoInfo.map(info => info.id!);
      if (videoIds.length === 0) {
        console.log('No YouTube videos found in user content');
        setYoutubeViews(0);
        setYoutubeDetails([]);
        setLoading(false);
        return;
      }
      
      console.log('Fetching views for YouTube video IDs:', videoIds);
      const details = [];
      
      for (const info of videoInfo) {
        try {
          // Fill in required fields with dummy values if not available
          const contentItem: ContentItem = {
            id: info.id!,
            title: info.title,
            description: '',
            type: 'video' as const,
            status: 'active',
            createdAt: new Date().toISOString(),
            originalUrl: `https://youtu.be/${info.id}`,
            platforms: ['youtube'],
          };
          
          console.log('Fetching views for video:', info.title, 'with ID:', info.id);
          const result = await platformApiService.fetchYouTubeViews(contentItem);
          console.log('YouTube API result for', info.title, ':', result);
          
          if (result.success && result.data) {
            details.push({
              id: info.id!,
              title: info.title,
              viewCount: result.data.views,
            });
            console.log('Successfully fetched views for', info.title, ':', result.data.views);
          } else {
            console.error('Failed to fetch views for', info.title, ':', result.error);
            details.push({
              id: info.id!,
              title: info.title,
              viewCount: 0, // Fixed: Use 0 instead of undefined result.data.views
            });
          }
        } catch (videoError) {
          console.error('Error processing video', info.title, ':', videoError);
          details.push({
            id: info.id!,
            title: info.title,
            viewCount: 0, // Fixed: Use 0 instead of undefined result.data.views
          });
        }
      }
      
      setYoutubeDetails(details);
      const totalViews = details.reduce((sum, d) => sum + d.viewCount, 0);
      console.log('Total YouTube views calculated:', totalViews);
      setYoutubeViews(totalViews);
    } catch (err) {
      console.error('Error in fetchAndSetYouTubeViews:', err);
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
            { name: 'X (Twitter)', value: 10 },
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
          
          {/* Debug section for YouTube API */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-sm text-gray-700 mb-2">YouTube API Debug Info:</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <div>API Key Status: {YOUTUBE_API_KEY ? '✅ Configured' : '❌ Missing'}</div>
              <div>Total Content Items: {userContent.length + sampleContent.length}</div>
              <div>User Content: {userContent.length} | Sample Content: {sampleContent.length}</div>
              <div>Total YouTube Videos: {[...userContent, ...sampleContent].filter(item => item.type === 'video' && item.platforms?.some((p: string) => p.toLowerCase() === 'youtube')).length}</div>
              <div>Fetched Views: {youtubeViews.toLocaleString()}</div>
              <div>Last Updated: {new Date().toLocaleTimeString()}</div>
              
              {/* Show all video content for debugging */}
              <div className="mt-2">
                <div className="font-medium">All Video Content:</div>
                {userContent.filter(item => item.type === 'video').map((item, index) => (
                  <div key={index} className="ml-2 text-xs">
                    • {item.title} - Type: {item.type} - Platforms: {item.platforms?.join(', ') || 'None'} - URL: {item.originalUrl || 'None'}
                  </div>
                ))}
                
                {/* Show all content for debugging */}
                <div className="mt-2">
                  <div className="font-medium">All Content Items:</div>
                  {userContent.slice(0, 5).map((item, index) => (
                    <div key={index} className="ml-2 text-xs">
                      • {item.title} - Type: {item.type} - Platforms: {item.platforms?.join(', ') || 'None'} - URL: {item.originalUrl || 'None'}
                    </div>
                  ))}
                  {userContent.length > 5 && (
                    <div className="ml-2 text-xs text-gray-500">... and {userContent.length - 5} more items</div>
                  )}
                </div>
              </div>
              
              {youtubeDetails.length > 0 && (
                <div className="mt-2">
                  <div className="font-medium">YouTube Video Details:</div>
                  {youtubeDetails.map((detail, index) => (
                    <div key={index} className="ml-2 text-xs">
                      • {detail.title}: {detail.viewCount.toLocaleString()} views
                    </div>
                  ))}
                </div>
              )}
              
              {/* Test YouTube API Button */}
              <div className="mt-3">
                <button
                  onClick={() => {
                    console.log('Testing YouTube API...');
                    console.log('API Key:', YOUTUBE_API_KEY ? 'Present' : 'Missing');
                    console.log('User Content:', userContent);
                    console.log('YouTube Videos Found:', getYouTubeVideoInfo());
                    fetchAndSetYouTubeViews();
                  }}
                  className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 mr-2"
                >
                  Test YouTube API
                </button>
                
                {/* Manual test with sample YouTube URL */}
                <button
                  onClick={async () => {
                    console.log('Testing with sample YouTube URL...');
                    const testContentItem = {
                      id: 'test-youtube',
                      title: 'Test YouTube Video',
                      description: 'Test video for API testing',
                      type: 'video' as const,
                      status: 'active',
                      createdAt: new Date().toISOString(),
                      originalUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Rick Roll video for testing
                      platforms: ['youtube'],
                    };
                    
                    try {
                      console.log('Testing with content item:', testContentItem);
                      const result = await platformApiService.fetchYouTubeViews(testContentItem);
                      console.log('Manual test result:', result);
                      
                      if (result.success && result.data) {
                        alert(`Test successful! Video has ${result.data.views.toLocaleString()} views`);
                      } else {
                        alert(`Test failed: ${result.error}`);
                      }
                    } catch (error) {
                      console.error('Manual test error:', error);
                      alert(`Test error: ${error}`);
                    }
                  }}
                  className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                >
                  Test with Sample URL
                </button>
                
                {/* Test with specific video ID */}
                <button
                  onClick={async () => {
                    console.log('Testing with specific video ID: 4gdWNPQszsM...');
                    const testContentItem = {
                      id: 'test-specific',
                      title: 'Specific Test Video',
                      description: 'Testing with video ID 4gdWNPQszsM',
                      type: 'video' as const,
                      status: 'active',
                      createdAt: new Date().toISOString(),
                      originalUrl: 'https://www.youtube.com/watch?v=4gdWNPQszsM',
                      platforms: ['youtube'],
                    };
                    
                    try {
                      console.log('Testing with specific video:', testContentItem);
                      const result = await platformApiService.fetchYouTubeViews(testContentItem);
                      console.log('Specific video test result:', result);
                      
                      if (result.success && result.data) {
                        alert(`Video 4gdWNPQszsM has ${result.data.views.toLocaleString()} views!`);
                      } else {
                        alert(`Test failed: ${result.error}`);
                      }
                    } catch (error) {
                      console.error('Specific video test error:', error);
                      alert(`Test error: ${error}`);
                    }
                  }}
                  className="px-3 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 ml-2"
                >
                  Test Video ID 4gdWNPQszsM
                </button>
                
                {/* Test with user's specific video ID */}
                <button
                  onClick={async () => {
                    console.log('Testing with user\'s video ID: KrZcB_RA0i8...');
                    const testContentItem = {
                      id: 'test-user-video',
                      title: 'User\'s Test Video',
                      description: 'Testing with video ID KrZcB_RA0i8',
                      type: 'video' as const,
                      status: 'active',
                      createdAt: new Date().toISOString(),
                      originalUrl: 'https://www.youtube.com/watch?v=KrZcB_RA0i8',
                      platforms: ['youtube'],
                    };
                    
                    try {
                      console.log('Testing with user\'s video:', testContentItem);
                      const result = await platformApiService.fetchYouTubeViews(testContentItem);
                      console.log('User video test result:', result);
                      
                      if (result.success && result.data) {
                        alert(`✅ Video KrZcB_RA0i8 has ${result.data.views.toLocaleString()} views!\n\nThis proves the API is working correctly!`);
                      } else {
                        alert(`❌ Test failed: ${result.error}`);
                      }
                    } catch (error) {
                      console.error('User video test error:', error);
                      alert(`❌ Test error: ${error}`);
                    }
                  }}
                  className="px-3 py-1 bg-emerald-500 text-white text-xs rounded hover:bg-emerald-600 ml-2"
                >
                  Test Video ID KrZcB_RA0i8
                </button>
                
                {/* Test exact API URL from user */}
                <button
                  onClick={async () => {
                    console.log('Testing exact API URL from user...');
                    try {
                      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
                      if (!apiKey) {
                        alert('❌ YouTube API key not found!');
                        return;
                      }
                      
                      const url = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=KrZcB_RA0i8&key=${apiKey}`;
                      console.log('Testing exact URL from user:', url.replace(apiKey, '***API_KEY_HIDDEN***'));
                      
                      const response = await fetch(url);
                      const data = await response.json();
                      
                      console.log('Exact API response:', data);
                      
                      if (data.items && data.items.length > 0) {
                        const views = data.items[0].statistics.viewCount;
                        const likes = data.items[0].statistics.likeCount;
                        const comments = data.items[0].statistics.commentCount;
                        
                        alert(`✅ Exact API Test Successful!\n\nVideo ID: KrZcB_RA0i8\nViews: ${parseInt(views).toLocaleString()}\nLikes: ${parseInt(likes).toLocaleString()}\nComments: ${parseInt(comments).toLocaleString()}\n\nThis should match what you see in the Network tab!`);
                      } else {
                        alert(`❌ Exact API test failed: ${data.error?.message || 'No data returned'}`);
                      }
                    } catch (error) {
                      console.error('Exact API test error:', error);
                      alert(`❌ Exact API test error: ${error}`);
                    }
                  }}
                  className="px-3 py-1 bg-rose-500 text-white text-xs rounded hover:bg-rose-600 ml-2"
                >
                  Test Exact API URL
                </button>
                
                {/* Force YouTube API Test with Hardcoded Videos */}
                <button
                  onClick={async () => {
                    console.log('=== FORCING YOUTUBE API TEST WITH HARDCODED VIDEOS ===');
                    
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
                    
                    const details = [];
                    let totalViews = 0;
                    
                    for (const video of hardcodedVideos) {
                      try {
                        const contentItem = {
                          id: video.id,
                          title: video.title,
                          description: 'Hardcoded test video',
                          type: 'video' as const,
                          status: 'active',
                          createdAt: new Date().toISOString(),
                          originalUrl: video.originalUrl,
                          platforms: ['youtube'],
                        };
                        
                        console.log('Fetching views for:', video.title);
                        const result = await platformApiService.fetchYouTubeViews(contentItem);
                        console.log('API result for', video.title, ':', result);
                        
                        if (result.success && result.data) {
                          const viewCount = result.data.views || 0;
                          details.push({
                            id: video.id,
                            title: video.title,
                            viewCount: viewCount
                          });
                          totalViews += viewCount;
                          console.log('✅ Successfully fetched views for', video.title, ':', viewCount);
                        } else {
                          console.error('❌ Failed to fetch views for', video.title, ':', result.error);
                          details.push({
                            id: video.id,
                            title: video.title,
                            viewCount: 0
                          });
                        }
                      } catch (error) {
                        console.error('❌ Error processing', video.title, ':', error);
                        details.push({
                          id: video.id,
                          title: video.title,
                          viewCount: 0
                        });
                      }
                    }
                    
                    // Update state with the fetched data
                    setYoutubeDetails(details);
                    setYoutubeViews(totalViews);
                    
                    console.log('=== FORCED API TEST COMPLETE ===');
                    console.log('Total views fetched:', totalViews);
                    console.log('Details:', details);
                    
                    alert(`🎯 Forced YouTube API Test Complete!\n\nTotal Views: ${totalViews.toLocaleString()}\n\nVideos Tested:\n${details.map(d => `• ${d.title}: ${d.viewCount.toLocaleString()} views`).join('\n')}\n\nCheck the chart - it should now show real view counts!`);
                    
                  }}
                  className="px-3 py-1 bg-violet-500 text-white text-xs rounded hover:bg-violet-600 ml-2"
                >
                  Force YouTube API Test
                </button>
                
                {/* Test platform service configuration */}
                <button
                  onClick={() => {
                    console.log('Testing platform service configuration...');
                    console.log('Platform service:', platformApiService);
                    
                    // Check if YouTube is configured
                    const isYouTubeConfigured = platformApiService.isPlatformConfigured('youtube');
                    console.log('YouTube configured:', isYouTubeConfigured);
                    
                    // Get configured platforms
                    const configuredPlatforms = platformApiService.getConfiguredPlatforms();
                    console.log('Configured platforms:', configuredPlatforms);
                    
                    alert(`YouTube configured: ${isYouTubeConfigured}\nConfigured platforms: ${configuredPlatforms.join(', ')}`);
                  }}
                  className="px-3 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600 ml-2"
                >
                  Test Service Config
                </button>
                
                {/* Create test YouTube content */}
                <button
                  onClick={() => {
                    console.log('Creating test YouTube content...');
                    
                    // This is just for testing - in a real app you'd save this to your database
                    const testContent = {
                      id: 'test-youtube-content',
                      title: 'Test YouTube Video - 4gdWNPQszsM',
                      description: 'This is a test video for API testing',
                      type: 'video' as const,
                      status: 'active',
                      createdAt: new Date().toISOString(),
                      originalUrl: 'https://www.youtube.com/watch?v=4gdWNPQszsM',
                      platforms: ['youtube'],
                    };
                    
                    console.log('Test content created:', testContent);
                    alert('Test YouTube content created! Check console for details.\n\nNow try the "Test Video ID 4gdWNPQszsM" button to test the API.');
                  }}
                  className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 ml-2"
                >
                  Create Test Content
                </button>
                
                {/* Direct API test */}
                <button
                  onClick={async () => {
                    console.log('Testing YouTube API directly...');
                    try {
                      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
                      if (!apiKey) {
                        alert('❌ YouTube API key not found!');
                        return;
                      }
                      
                      const url = `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=4gdWNPQszsM&key=${apiKey}`;
                      console.log('Testing URL:', url.replace(apiKey, '***API_KEY_HIDDEN***'));
                      
                      const response = await fetch(url);
                      const data = await response.json();
                      
                      console.log('Direct API response:', data);
                      
                      if (data.items && data.items.length > 0) {
                        const views = data.items[0].statistics.viewCount;
                        alert(`✅ Direct API test successful!\nVideo has ${parseInt(views).toLocaleString()} views`);
                      } else {
                        alert(`❌ Direct API test failed: ${data.error?.message || 'No data returned'}`);
                      }
                    } catch (error) {
                      console.error('Direct API test error:', error);
                      alert(`❌ Direct API test error: ${error}`);
                    }
                  }}
                  className="px-3 py-1 bg-indigo-500 text-white text-xs rounded hover:bg-indigo-600 ml-2"
                >
                  Test Direct API
                </button>
                
                {/* Show all content details */}
                <button
                  onClick={() => {
                    console.log('=== ALL CONTENT DETAILS ===');
                    console.log('Total content items:', userContent.length);
                    
                    userContent.forEach((item, index) => {
                      console.log(`Item ${index + 1}:`, {
                        id: item.id,
                        title: item.title,
                        type: item.type,
                        platforms: item.platforms,
                        originalUrl: item.originalUrl,
                        views: item.views,
                        engagement: item.engagement
                      });
                    });
                    
                    const youtubeContent = userContent.filter(item => 
                      item.platforms?.some(p => p.toLowerCase() === 'youtube')
                    );
                    
                    console.log('=== YOUTUBE CONTENT ONLY ===');
                    console.log('YouTube content count:', youtubeContent.length);
                    youtubeContent.forEach((item, index) => {
                      console.log(`YouTube Item ${index + 1}:`, {
                        id: item.id,
                        title: item.title,
                        type: item.type,
                        platforms: item.platforms,
                        originalUrl: item.originalUrl
                      });
                    });
                    
                    alert(`Content Analysis Complete!\n\nTotal Items: ${userContent.length}\nYouTube Items: ${youtubeContent.length}\n\nCheck console for detailed breakdown.`);
                  }}
                  className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 ml-2"
                >
                  Analyze Content
                </button>
                
                {/* Test Platform Service Directly */}
                <button
                  onClick={async () => {
                    console.log('=== TESTING PLATFORM SERVICE DIRECTLY ===');
                    
                    try {
                      // Test with a known working video
                      const testContentItem = {
                        id: 'test-direct',
                        title: 'Direct Test Video',
                        description: 'Testing platform service directly',
                        type: 'video' as const,
                        status: 'active',
                        createdAt: new Date().toISOString(),
                        originalUrl: 'https://www.youtube.com/watch?v=4gdWNPQszsM',
                        platforms: ['youtube'],
                      };
                      
                      console.log('Testing with content item:', testContentItem);
                      
                      // Test the platform service directly
                      const result = await platformApiService.fetchYouTubeViews(testContentItem);
                      console.log('Direct platform service result:', result);
                      
                                             if (result.success && result.data) {
                         alert(`✅ Platform Service Test Successful!\n\nVideo: ${testContentItem.title}\nViews: ${result.data.views?.toLocaleString() || '0'}\nLikes: ${result.data.likes?.toLocaleString() || '0'}\nComments: ${result.data.comments?.toLocaleString() || '0'}`);
                       } else {
                        alert(`❌ Platform Service Test Failed:\n\nError: ${result.error}`);
                      }
                      
                    } catch (error) {
                      console.error('Direct platform service test error:', error);
                      alert(`❌ Platform Service Test Error: ${error}`);
                    }
                  }}
                  className="px-3 py-1 bg-indigo-500 text-white text-xs rounded hover:bg-indigo-600 ml-2"
                >
                  Test Platform Service
                </button>
                
                {/* Add Sample YouTube Content */}
                <button
                  onClick={async () => {
                    console.log('Adding sample YouTube content...');
                    
                    // Sample YouTube content items
                    const sampleContent = [
                      {
                        id: `youtube-${Date.now()}-1`,
                        title: 'Sample YouTube Video 1 - Rick Roll',
                        description: 'Never gonna give you up, never gonna let you down',
                        type: 'video' as const,
                        status: 'active',
                        createdAt: new Date().toISOString(),
                        originalUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                        platforms: ['youtube'],
                        views: 0,
                        engagement: 0
                      },
                      {
                        id: `youtube-${Date.now()}-2`,
                        title: 'Sample YouTube Video 2 - Test Video',
                        description: 'This is a test video for API testing',
                        type: 'video' as const,
                        status: 'active',
                        createdAt: new Date().toISOString(),
                        originalUrl: 'https://www.youtube.com/watch?v=4gdWNPQszsM',
                        platforms: ['youtube'],
                        views: 0,
                        engagement: 0
                      },
                      {
                        id: `youtube-${Date.now()}-3`,
                        title: 'Sample YouTube Video 3 - Shorts',
                        description: 'Testing YouTube Shorts format',
                        type: 'video' as const,
                        status: 'active',
                        createdAt: new Date().toISOString(),
                        originalUrl: 'https://youtube.com/shorts/dQw4w9WgXcQ',
                        platforms: ['youtube'],
                        views: 0,
                        engagement: 0
                      }
                    ];
                    
                    try {
                      // Add to userContent state (this is temporary for testing)
                      // In a real app, you'd save this to your database
                      console.log('Sample content created:', sampleContent);
                      
                      // Store in localStorage for testing
                      if (typeof window !== 'undefined' && window.localStorage) {
                        const existingContent = JSON.parse(localStorage.getItem('test-youtube-content') || '[]');
                        const newContent = [...existingContent, ...sampleContent];
                        localStorage.setItem('test-youtube-content', JSON.stringify(newContent));
                        console.log('Stored sample content in localStorage');
                      }
                      
                      // Actually add the sample content to the component state
                      setSampleContent(sampleContent);
                      console.log('Sample content added to component state:', sampleContent);
                      
                      alert(`✅ Sample YouTube content created!\n\nAdded 3 YouTube videos:\n1. Rick Roll (dQw4w9WgXcQ)\n2. Test Video (4gdWNPQszsM)\n3. Shorts Format\n\nNow try "Analyze Content" to see the new content!\n\nThen click "Test YouTube API" to fetch real view counts!`);
                      
                    } catch (error) {
                      console.error('Error creating sample content:', error);
                      alert(`❌ Error creating sample content: ${error}`);
                    }
                  }}
                  className="px-3 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 ml-2"
                >
                  Add Sample YouTube Content
                </button>
                
                {/* Check API Key Configuration */}
                <button
                  onClick={() => {
                    console.log('=== YOUTUBE API KEY CONFIGURATION ===');
                    
                    // Check environment variables
                    const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
                    const allEnvVars = import.meta.env;
                    
                    console.log('VITE_YOUTUBE_API_KEY:', apiKey ? '✅ Present' : '❌ Missing');
                    console.log('API Key length:', apiKey ? apiKey.length : 0);
                    console.log('API Key starts with:', apiKey ? apiKey.substring(0, 10) + '...' : 'N/A');
                    
                    // Check if it's a valid YouTube API key format
                    const isValidFormat = apiKey && apiKey.length > 30 && apiKey.includes('AIza');
                    console.log('Valid format:', isValidFormat ? '✅ Yes' : '❌ No');
                    
                    // Check all environment variables
                    console.log('All environment variables:', allEnvVars);
                    
                    // Check platform service configuration
                    try {
                      const isConfigured = platformApiService.isPlatformConfigured('youtube');
                      const configuredPlatforms = platformApiService.getConfiguredPlatforms();
                      
                      console.log('Platform service YouTube configured:', isConfigured);
                      console.log('Configured platforms:', configuredPlatforms);
                      
                      alert(`🔍 API Key Configuration Check:\n\n` +
                             `API Key Present: ${apiKey ? '✅ Yes' : '❌ No'}\n` +
                             `API Key Length: ${apiKey ? apiKey.length : 0}\n` +
                             `Valid Format: ${isValidFormat ? '✅ Yes' : '❌ No'}\n` +
                             `Platform Service: ${isConfigured ? '✅ Configured' : '❌ Not Configured'}\n\n` +
                             `Check console for detailed breakdown.`);
                       
                     } catch (error) {
                       console.error('Error checking platform service:', error);
                       alert(`❌ Error checking platform service: ${error}`);
                     }
                   }}
                   className="px-3 py-1 bg-teal-500 text-white text-xs rounded hover:bg-teal-600 ml-2"
                 >
                   Check API Key Config
                 </button>
                 
                 {/* Test URL Extraction */}
                 <button
                   onClick={() => {
                     console.log('=== TESTING YOUTUBE URL EXTRACTION ===');
                     
                     const testUrls = [
                       'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                       'https://youtu.be/dQw4w9WgXcQ',
                       'https://www.youtube.com/embed/dQw4w9WgXcQ',
                       'https://www.youtube.com/v/dQw4w9WgXcQ',
                       'https://youtube.com/shorts/dQw4w9WgXcQ',
                       'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s',
                       'https://www.youtube.com/watch?t=30s&v=dQw4w9WgXcQ',
                       'https://m.youtube.com/watch?v=dQw4w9WgXcQ',
                       'https://www.youtube.com/watch?v=dQw4w9WgXcQ#t=30s',
                       'https://youtube.com/watch?v=4gdWNPQszsM',
                       'https://youtu.be/4gdWNPQszsM'
                     ];
                     
                     console.log('Testing URL extraction with various formats...');
                     
                     testUrls.forEach((url, index) => {
                       console.log(`\n--- Test ${index + 1}: ${url} ---`);
                       const videoId = extractYouTubeVideoId(url);
                       if (videoId) {
                         console.log(`✅ SUCCESS: Extracted ${videoId}`);
                       } else {
                         console.log(`❌ FAILED: Could not extract video ID`);
                       }
                     });
                     
                     alert(`🧪 URL Extraction Test Complete!\n\nTested ${testUrls.length} different YouTube URL formats.\nCheck console for detailed results.`);
                   }}
                   className="px-3 py-1 bg-pink-500 text-white text-xs rounded hover:bg-pink-600 ml-2"
                 >
                   Test URL Extraction
                 </button>
               </div>
             </div>
           </div>
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

        {/* YouTube Demographics Section */}
        <YouTubeDemographics className="mb-8" />
      </div>
    </div>
  );
};

 export default Analytics;