import React, { useState, useEffect, useRef } from 'react';
import { 
  Facebook, 
  Instagram, 
  Youtube, 
  Link as LinkIcon, 
  CheckCircle, 
  XCircle, 
  Loader,
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Users,
  Globe,
  BarChart3,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { facebookIntegrationService } from '../../services/facebookIntegration.service';
import youtubeOAuthService from '../../services/youtubeOAuth.service';
import youtubeAnalyticsService from '../../services/youtubeAnalytics.service';
import youtubeVideoMetricsService from '../../services/youtubeVideoMetrics.service';
import YouTubeAuthButton from '../analytics/YouTubeAuthButton';

interface AnalyticsData {
  platform: string;
  title?: string;
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  subscribers?: number;
  reach?: number;
  impressions?: number;
  saves?: number;
  outboundClicks?: number;
  duration?: number;
  estimatedMinutesWatched?: number;
  averageViewDuration?: number;
  subscribersGained?: number;
  demographics?: {
    ageGroups: Array<{ ageGroup: string; percentage: number }>;
    genders: Array<{ gender: string; percentage: number }>;
    topCountries: Array<{ country: string; percentage: number }>;
  };
  trafficSource?: Array<{ source: string; views: number }>;
  message?: string;
}

const COLORS = {
  youtube: '#FF0000',
  instagram: '#C13584',
  facebook: '#1877F2',
  pinterest: '#E60023'
};

const GENDER_COLORS = ['#3B82F6', '#EC4899'];
const AGE_COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];

const AnalysisDashboard: React.FC = () => {
  const { user } = useAuth();
  const [url, setUrl] = useState('');
  const [detectedPlatform, setDetectedPlatform] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFacebookConnected, setIsFacebookConnected] = useState(false);
  const [isConnectingFacebook, setIsConnectingFacebook] = useState(false);
  const [isYouTubeAuthenticated, setIsYouTubeAuthenticated] = useState(false);
  const metricsSectionRef = useRef<HTMLDivElement>(null);
  const audienceSectionRef = useRef<HTMLDivElement>(null);

  // Check Facebook connection status
  useEffect(() => {
    const checkFacebookConnection = async () => {
      try {
        const status = await facebookIntegrationService.getLoginStatus();
        setIsFacebookConnected(status.status === 'connected');
      } catch (err) {
        setIsFacebookConnected(false);
      }
    };
    checkFacebookConnection();
  }, []);

  // Check YouTube authentication status
  useEffect(() => {
    const checkYouTubeAuth = () => {
      setIsYouTubeAuthenticated(youtubeOAuthService.isAuthenticated());
    };
    checkYouTubeAuth();
    
    // Listen for storage changes (when token is set in another tab/window)
    const handleStorageChange = () => {
      checkYouTubeAuth();
    };
    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically in case token is set in same window
    const interval = setInterval(checkYouTubeAuth, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Detect platform from URL
  const detectPlatform = (url: string): string | null => {
    if (!url || typeof url !== 'string') return null;
    const urlLower = url.toLowerCase();
    if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) return 'youtube';
    if (urlLower.includes('instagram.com')) return 'instagram';
    if (urlLower.includes('facebook.com')) return 'facebook';
    if (urlLower.includes('pinterest.com')) return 'pinterest';
    return null;
  };

  // Extract video ID from URL
  const extractVideoId = (url: string): string | null => {
    return youtubeVideoMetricsService.extractVideoId(url);
  };

  // Handle URL input change
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputUrl = e.target.value;
    setUrl(inputUrl);
    const platform = detectPlatform(inputUrl);
    setDetectedPlatform(platform);
    setError(null);
  };

  // Handle Facebook/Instagram OAuth login using backend endpoint
  const handleConnectFacebook = async () => {
    console.log('🔵 Connect button clicked!', { detectedPlatform, isConnectingFacebook });
    
    if (isConnectingFacebook) {
      console.warn('⚠️ Already connecting, ignoring click');
      return;
    }
    
    setIsConnectingFacebook(true);
    setError(null);
    
    try {
      const backendUrl = import.meta.env.VITE_CHAT_API_BASE?.replace('/api', '') || 'http://localhost:8080';
      const platform = detectedPlatform || 'facebook';
      
      console.log('🔵 Getting OAuth URL for platform:', platform);
      console.log('🔵 Backend URL:', backendUrl);
      
      // Get OAuth URL from backend
      const authUrlEndpoint = platform === 'instagram' 
        ? '/api/instagram/auth/url'
        : '/api/facebook/auth/url';
      
      console.log('🔵 Calling endpoint:', `${backendUrl}${authUrlEndpoint}`);
      
      const response = await fetch(`${backendUrl}${authUrlEndpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('🔵 Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Backend error:', errorData);
        throw new Error(errorData.error || `Failed to get OAuth URL: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Backend response:', data);
      
      if (!data.authUrl) {
        console.error('❌ No authUrl in response:', data);
        throw new Error('Backend did not return an OAuth URL');
      }

      console.log('✅ Got OAuth URL, redirecting...', data.authUrl.substring(0, 100) + '...');

      // Store provider info in sessionStorage for callback
      sessionStorage.setItem('oauth_provider', platform);
      if (data.state) {
        sessionStorage.setItem(`${platform}_oauth_state`, data.state);
      }
      
      // Redirect to OAuth URL
      window.location.href = data.authUrl;
      
    } catch (err) {
      console.error('❌ Error in handleConnectFacebook:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect Facebook/Instagram account';
      
      // Show error prominently
      setError(errorMessage);
      setIsConnectingFacebook(false);
      
      // Also show alert for visibility
      if (errorMessage.includes('not configured') || errorMessage.includes('credentials')) {
        alert(`⚠️ Configuration Error:\n\n${errorMessage}\n\nPlease configure FACEBOOK_APP_ID and FACEBOOK_APP_SECRET in your backend .env file.`);
      } else {
        alert(`⚠️ Connection Error:\n\n${errorMessage}`);
      }
    }
  };

  // Analyze content
  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    const platform = detectPlatform(url);
    if (!platform) {
      setError('Unsupported platform. Please use YouTube, Instagram, Facebook, or Pinterest URL');
      return;
    }

    // Check if YouTube needs authentication
    if (platform === 'youtube' && !isYouTubeAuthenticated) {
      setError('Please authenticate with YouTube Analytics API first');
      return;
    }

    // Check if Facebook/Instagram needs connection
    if ((platform === 'facebook' || platform === 'instagram') && !isFacebookConnected) {
      setError('Please connect your Facebook/Instagram account first');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const backendUrl = import.meta.env.VITE_CHAT_API_BASE?.replace('/api', '') || 'http://localhost:8080';
      
      // Get stored tokens for Facebook/Instagram
      const longLivedToken = localStorage.getItem('facebook_long_lived_token');
      const instagramAccountId = localStorage.getItem('instagram_business_account_id');
      const pageId = localStorage.getItem('facebook_page_id');
      
      // Get YouTube OAuth token (async)
      const youtubeAccessToken = await youtubeOAuthService.getAccessToken();
      
      const response = await fetch(`${backendUrl}/api/content/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url, 
          userId: user?.uid,
          accessToken: longLivedToken || youtubeAccessToken || undefined,
          instagramAccountId: instagramAccountId || undefined,
          pageId: pageId || undefined,
          youtubeAccessToken: youtubeAccessToken || undefined
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze content');
      }

      // If YouTube and authenticated, fetch video-specific metrics
      if (platform === 'youtube' && youtubeAccessToken) {
        try {
          // Extract video ID from URL
          const videoId = youtubeVideoMetricsService.extractVideoId(url);
          if (!videoId) {
            throw new Error('Could not extract video ID from URL');
          }

          // Fetch video-specific metrics using the new endpoint
          const videoMetrics = await youtubeVideoMetricsService.getVideoMetrics(videoId);

          // Use real data from YouTube Analytics API (no placeholders)
          setAnalytics({
            platform: 'youtube',
            title: videoMetrics.title,
            views: videoMetrics.views,
            likes: videoMetrics.likes,
            comments: videoMetrics.comments,
            duration: videoMetrics.duration,
            estimatedMinutesWatched: videoMetrics.watchTime,
            averageViewDuration: videoMetrics.averageViewDuration,
            demographics: {
              genders: videoMetrics.demographics.genders || [],
              ageGroups: videoMetrics.demographics.ageGroups || [],
              topCountries: videoMetrics.demographics.topCountries || [],
            },
            trafficSource: videoMetrics.demographics.trafficSource || [],
          });
        } catch (metricsError) {
          console.error('Error fetching video-specific metrics:', metricsError);
          const errorMessage = metricsError instanceof Error ? metricsError.message : 'Failed to fetch metrics';
          
          // Show specific error messages
          if (errorMessage.includes('Video not found')) {
            setError('Video not found. Please check the video ID and try again.');
          } else if (errorMessage.includes('quota')) {
            setError('YouTube Analytics API quota exceeded. Please try again later.');
          } else if (errorMessage.includes('Authentication') || errorMessage.includes('expired')) {
            setError('Authentication expired. Please re-authenticate with YouTube.');
            setIsYouTubeAuthenticated(false);
          } else {
            setError(`Failed to fetch video metrics: ${errorMessage}`);
          }
          
          // Don't set analytics if there's an error - show error message instead
          setAnalytics(null);
        }
      } else {
        // For non-YouTube platforms or YouTube without auth, use basic data
        const data = await response.json();
        setAnalytics(data.analytics);
      }
      
      // Auto-scroll to metrics section
      setTimeout(() => {
        metricsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 500);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze content. Please try again.';
      
      // Handle specific error types
      if (errorMessage.includes('quota') || errorMessage.includes('Quota')) {
        setError('API quota exceeded. Please try again later or check your API limits.');
      } else if (errorMessage.includes('unauthorized') || errorMessage.includes('token') || errorMessage.includes('Authentication')) {
        setError('Authentication expired. Please re-authenticate with YouTube.');
        if (platform === 'youtube') {
          setIsYouTubeAuthenticated(false);
        }
      } else if (errorMessage.includes('scope') || errorMessage.includes('permission')) {
        setError('Required permissions not granted. Please re-authenticate and grant all requested permissions.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Format numbers
  const formatNumber = (num: number | undefined): string => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // Format duration
  const formatDuration = (seconds: number | undefined): string => {
    if (!seconds) return '0:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8">
      {/* Section 1: URL Paste Input */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Content Analysis Dashboard</h2>
        
        {/* Platform Icons */}
        <div className="flex items-center justify-center gap-6 mb-6">
          <div className={`flex flex-col items-center p-4 rounded-lg transition-all ${
            detectedPlatform === 'youtube' ? 'bg-red-50 border-2 border-red-500' : 'bg-gray-50'
          }`}>
            <Youtube size={32} className={detectedPlatform === 'youtube' ? 'text-red-600' : 'text-gray-400'} />
            <span className="text-xs mt-2 text-gray-600">YouTube</span>
          </div>
          <div className={`flex flex-col items-center p-4 rounded-lg transition-all ${
            detectedPlatform === 'instagram' ? 'bg-pink-50 border-2 border-pink-500' : 'bg-gray-50'
          }`}>
            <Instagram size={32} className={detectedPlatform === 'instagram' ? 'text-pink-600' : 'text-gray-400'} />
            <span className="text-xs mt-2 text-gray-600">Instagram</span>
          </div>
          <div className={`flex flex-col items-center p-4 rounded-lg transition-all ${
            detectedPlatform === 'facebook' ? 'bg-blue-50 border-2 border-blue-500' : 'bg-gray-50'
          }`}>
            <Facebook size={32} className={detectedPlatform === 'facebook' ? 'text-blue-600' : 'text-gray-400'} />
            <span className="text-xs mt-2 text-gray-600">Facebook</span>
          </div>
          <div className={`flex flex-col items-center p-4 rounded-lg transition-all ${
            detectedPlatform === 'pinterest' ? 'bg-red-50 border-2 border-red-500' : 'bg-gray-50'
          }`}>
            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">P</span>
            </div>
            <span className="text-xs mt-2 text-gray-600">Pinterest</span>
          </div>
        </div>

        {/* URL Input */}
        <div className="mb-4">
          <label htmlFor="content-url" className="block text-sm font-medium text-gray-700 mb-2">
            Paste Content URL
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                id="content-url"
                type="text"
                value={url}
                onChange={handleUrlChange}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !url.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Analyzing...
                </>
              ) : (
                <>
                  Done
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* YouTube Authentication */}
        {detectedPlatform === 'youtube' && !isYouTubeAuthenticated && (
          <div className="mb-4">
            <YouTubeAuthButton 
              onAuthSuccess={() => {
                setIsYouTubeAuthenticated(true);
                // Auto-scroll to next section after successful authentication
                setTimeout(() => {
                  metricsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 500);
              }}
            />
          </div>
        )}

        {/* Facebook/Instagram Connection */}
        {(detectedPlatform === 'facebook' || detectedPlatform === 'instagram') && !isFacebookConnected && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="text-yellow-600" size={20} />
                <span className="text-sm text-yellow-800">
                  Connect your {detectedPlatform === 'instagram' ? 'Instagram' : 'Facebook'} account to view analytics
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🔵 Button clicked!', { detectedPlatform, isConnectingFacebook });
                  handleConnectFacebook();
                }}
                disabled={isConnectingFacebook}
                type="button"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isConnectingFacebook ? (
                  <>
                    <Loader className="animate-spin" size={16} />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Facebook size={16} />
                    Connect
                  </>
                )}
              </button>
            </div>
          </div>
        )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-4 animate-pulse">
                <div className="flex items-center gap-2">
                  <XCircle className="text-red-600" size={20} />
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-red-800 block">{error}</span>
                    {error.includes('not configured') && (
                      <span className="text-xs text-red-600 mt-1 block">
                        Please add FACEBOOK_APP_ID and FACEBOOK_APP_SECRET to your backend .env file
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="text-red-600 hover:text-red-800"
                    aria-label="Dismiss error"
                  >
                    <XCircle size={16} />
                  </button>
                </div>
              </div>
            )}
      </div>

      {/* Section 2: Metrics Overview */}
      {analytics && (
        <div ref={metricsSectionRef} className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Metrics Overview</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {analytics.views !== undefined && (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="text-blue-600" size={20} />
                  <span className="text-sm text-blue-600">Total Views</span>
                </div>
                <p className="text-2xl font-bold text-blue-800">{formatNumber(analytics.views)}</p>
              </div>
            )}
            
            {analytics.likes !== undefined && (
              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="text-red-600" size={20} />
                  <span className="text-sm text-red-600">Total Likes</span>
                </div>
                <p className="text-2xl font-bold text-red-800">{formatNumber(analytics.likes)}</p>
              </div>
            )}
            
            {analytics.comments !== undefined && (
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="text-green-600" size={20} />
                  <span className="text-sm text-green-600">Total Comments</span>
                </div>
                <p className="text-2xl font-bold text-green-800">{formatNumber(analytics.comments)}</p>
              </div>
            )}
            
            {analytics.shares !== undefined && (
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Share2 className="text-purple-600" size={20} />
                  <span className="text-sm text-purple-600">Total Shares</span>
                </div>
                <p className="text-2xl font-bold text-purple-800">{formatNumber(analytics.shares)}</p>
              </div>
            )}
            
            {analytics.subscribers !== undefined && (
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="text-yellow-600" size={20} />
                  <span className="text-sm text-yellow-600">Subscribers</span>
                </div>
                <p className="text-2xl font-bold text-yellow-800">{formatNumber(analytics.subscribers)}</p>
              </div>
            )}
            
            {analytics.reach !== undefined && (
              <div className="bg-indigo-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="text-indigo-600" size={20} />
                  <span className="text-sm text-indigo-600">Reach</span>
                </div>
                <p className="text-2xl font-bold text-indigo-800">{formatNumber(analytics.reach)}</p>
              </div>
            )}
            
            {analytics.impressions !== undefined && (
              <div className="bg-teal-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="text-teal-600" size={20} />
                  <span className="text-sm text-teal-600">Impressions</span>
                </div>
                <p className="text-2xl font-bold text-teal-800">{formatNumber(analytics.impressions)}</p>
              </div>
            )}
            
            {analytics.duration !== undefined && (
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="text-orange-600" size={20} />
                  <span className="text-sm text-orange-600">Duration</span>
                </div>
                <p className="text-2xl font-bold text-orange-800">{formatDuration(analytics.duration)}</p>
              </div>
            )}
            
            {analytics.estimatedMinutesWatched !== undefined && (
              <div className="bg-cyan-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="text-cyan-600" size={20} />
                  <span className="text-sm text-cyan-600">Watch Time</span>
                </div>
                <p className="text-2xl font-bold text-cyan-800">{formatNumber(analytics.estimatedMinutesWatched)} min</p>
              </div>
            )}
            
            {analytics.averageViewDuration !== undefined && (
              <div className="bg-emerald-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="text-emerald-600" size={20} />
                  <span className="text-sm text-emerald-600">Avg View Duration</span>
                </div>
                <p className="text-2xl font-bold text-emerald-800">{formatDuration(analytics.averageViewDuration)}</p>
              </div>
            )}
          </div>

          {/* Message for platforms requiring connection */}
          {analytics.message && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">{analytics.message}</p>
            </div>
          )}
        </div>
      )}

      {/* Section 3: Audience Insights */}
      {analytics && analytics.demographics && (
        <div ref={audienceSectionRef} className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Audience Insights</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Gender Donut Chart */}
            {analytics.demographics.genders && analytics.demographics.genders.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Gender Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.demographics.genders}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ gender, percentage }) => `${gender}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="percentage"
                    >
                      {analytics.demographics.genders.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Age Groups Bar Chart */}
            {analytics.demographics.ageGroups && analytics.demographics.ageGroups.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Age Groups</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.demographics.ageGroups}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="ageGroup" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="percentage" fill="#3B82F6">
                      {analytics.demographics.ageGroups.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={AGE_COLORS[index % AGE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Top Countries Bar Chart */}
            {analytics.demographics.topCountries && analytics.demographics.topCountries.length > 0 && (
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Top Countries</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.demographics.topCountries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="country" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="percentage" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Traffic Source Bar Chart */}
            {analytics.trafficSource && analytics.trafficSource.length > 0 && (
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Traffic Sources</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.trafficSource}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="source" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="views" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisDashboard;

