import React, { useRef, useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import YouTubeDemographics from './analytics/YouTubeDemographics';

const ChrisAIBusinessCoach: React.FC = () => {
  const platformSectionRef = useRef<HTMLDivElement>(null);
  const nextSectionRef = useRef<HTMLDivElement>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [videoLink, setVideoLink] = useState<string>('');
  const [videoMetrics, setVideoMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [facebookConnected, setFacebookConnected] = useState<boolean>(false);
  const [facebookUser, setFacebookUser] = useState<{ id: string; name: string; email?: string; photo?: string } | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showDeepDive, setShowDeepDive] = useState<boolean>(false);
  const [videoId, setVideoId] = useState<string | null>(null);

  const handleGetStarted = () => {
    // Smooth scroll to platform selection section
    platformSectionRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  // Check for Facebook connection callback
  useEffect(() => {
    const connected = searchParams.get('facebook_connected');
    const userId = searchParams.get('user_id');
    const userName = searchParams.get('user_name');
    
    if (connected === 'true' && userId) {
      setFacebookConnected(true);
      setFacebookUser({
        id: userId,
        name: userName || 'Facebook User',
        email: searchParams.get('user_email') || undefined,
        photo: searchParams.get('user_photo') || undefined
      });
      
      // Clear URL parameters
      setSearchParams({});
      
      // Show success message
      alert('Successfully connected to Facebook!');
    }
    
    // Check existing connection status
    checkFacebookStatus();
  }, [searchParams, setSearchParams]);

  const checkFacebookStatus = async () => {
    try {
      // Check if Facebook token exists in localStorage (from our OAuth flow)
      const facebookToken = localStorage.getItem('facebook_long_lived_token') || localStorage.getItem('facebook_access_token');
      
      if (facebookToken) {
        // We have a token, so user is connected
        setFacebookConnected(true);
        // Try to get user info from Facebook Graph API
        try {
          const userResponse = await fetch(`https://graph.facebook.com/v18.0/me?access_token=${facebookToken}&fields=id,name,email`);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setFacebookUser(userData);
          } else if (userResponse.status === 401) {
            // Token expired or invalid, clear it
            localStorage.removeItem('facebook_long_lived_token');
            localStorage.removeItem('facebook_access_token');
            setFacebookConnected(false);
            setFacebookUser(null);
          }
        } catch (userError) {
          // Silently handle - token might be invalid
          console.warn('Could not fetch Facebook user info:', userError);
        }
      } else {
        // No token found, user is not connected
        setFacebookConnected(false);
        setFacebookUser(null);
      }
    } catch (error: any) {
      // Silently handle errors - this is expected if tokens don't exist
      console.warn('Error checking Facebook status:', error);
    }
  };

  const handleConnectFacebook = async () => {
    // Redirect to backend Facebook authentication endpoint
    // Use the backend OAuth URL endpoint
    const backendUrl = import.meta.env.VITE_CHAT_API_BASE?.replace('/api', '') || 'http://localhost:8080';
    try {
      const response = await fetch(`${backendUrl}/api/facebook/auth/url`);
      if (response.ok) {
        const data = await response.json();
        if (data.authUrl) {
          // Store provider info for callback
          sessionStorage.setItem('oauth_provider', 'facebook');
          window.location.href = data.authUrl;
          return;
        }
      }
    } catch (error) {
      console.error('Error getting Facebook OAuth URL:', error);
    }
    // Fallback: show error message
    alert('Failed to initiate Facebook login. Please check your backend configuration.');
  };

  const handleDisconnectFacebook = async () => {
    try {
      // Clear Facebook tokens from localStorage
      localStorage.removeItem('facebook_access_token');
      localStorage.removeItem('facebook_long_lived_token');
      localStorage.removeItem('facebook_user_id');
      localStorage.removeItem('facebook_page_id');
      localStorage.removeItem('instagram_business_account_id');
      
      // Try backend logout if endpoint exists
      const backendUrl = import.meta.env.VITE_CHAT_API_BASE?.replace('/api', '') || 'http://localhost:8080';
      try {
        const response = await fetch(`${backendUrl}/api/facebook/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        if (response.ok) {
          // Backend logout successful
        }
      } catch (logoutError) {
        // Backend endpoint doesn't exist - that's okay, we cleared localStorage
        console.warn('Backend logout endpoint not available:', logoutError);
      }
      
      // Always clear local state regardless of backend response
      setFacebookConnected(false);
      setFacebookUser(null);
      alert('Disconnected from Facebook');
    } catch (error) {
      console.error('Error disconnecting Facebook:', error);
      alert('Error disconnecting from Facebook');
    }
  };

  const handlePlatformSelect = (platform: string) => {
    setSelectedPlatform(platform);
    // Reset video data when switching platforms
    if (platform !== 'youtube') {
      setVideoLink('');
      setVideoMetrics(null);
    }
  };

  const handleVideoSubmit = async () => {
    if (!videoLink.trim()) return;
    
    setIsLoading(true);
    try {
      // Extract video ID from YouTube URL
      const extractedVideoId = extractVideoId(videoLink);
      if (!extractedVideoId) {
        alert('Please enter a valid YouTube video URL');
        setIsLoading(false);
        return;
      }
      
      // Store video ID for demographics
      setVideoId(extractedVideoId);

      // Call YouTube Data API v3
      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY || 'YOUR_YOUTUBE_API_KEY'; // Replace with your actual API key
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${extractedVideoId}&key=${apiKey}`
      );
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
          const video = data.items[0];
          const snippet = video.snippet;
          const statistics = video.statistics;
          const contentDetails = video.contentDetails;
          
          // Format duration from ISO 8601 to readable format
          const duration = formatDuration(contentDetails.duration);
          
          setVideoMetrics({
            title: snippet.title,
            views: formatNumber(statistics.viewCount),
            likes: formatNumber(statistics.likeCount),
            comments: formatNumber(statistics.commentCount),
            duration: duration,
            thumbnail: snippet.thumbnails.maxres?.url || snippet.thumbnails.high?.url || snippet.thumbnails.default?.url,
            channelTitle: snippet.channelTitle,
            publishedAt: snippet.publishedAt,
            description: snippet.description,
            // Add raw numbers for Post Metrics Section
            totalViews: parseInt(statistics.viewCount),
            totalLikes: parseInt(statistics.likeCount),
            totalComments: parseInt(statistics.commentCount),
            channelSubscribers: 0 // This would need a separate API call
          });
          
          // Scroll to next section after getting metrics
          setTimeout(() => {
            nextSectionRef.current?.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            });
          }, 500);
        } else {
          alert('Video not found. Please check the URL.');
        }
      } else {
        throw new Error('Failed to fetch video data');
      }
    } catch (error) {
      console.error('Error fetching video metrics:', error);
      alert('Error fetching video data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to extract video ID from YouTube URL (supports shorts, youtu.be, embed, mobile, etc.)
  const extractVideoId = (rawUrl: string): string | null => {
    try {
      // sanitize leading/trailing junk (e.g., pasted with @)
      const cleaned = rawUrl.trim().replace(/^@+/, '').replace(/[<>\s\u200B]+/g, '');
      const normalizedUrl = /^https?:\/\//i.test(cleaned) ? cleaned : `https://${cleaned}`;
      const u = new URL(normalizedUrl);

      // youtu.be/<id>
      if (u.hostname.includes('youtu.be')) {
        const id = u.pathname.split('/')[1];
        if (id && id.length === 11) return id;
      }

      // youtube.com/watch?v=<id>
      const vParam = u.searchParams.get('v');
      if (vParam && vParam.length === 11) return vParam;

      // /embed/<id>, /v/<id>, /shorts/<id>, /live/<id>
      const pathMatch = u.pathname.match(/\/(embed|v|shorts|live)\/([a-zA-Z0-9_-]{11})/);
      if (pathMatch) return pathMatch[2];
    } catch {
      // fall through to regex
    }

    // Fallback regex for any remaining formats
    const regex = /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:.*v=|v\/|embed\/|shorts\/|live\/))([a-zA-Z0-9_-]{11})/;
    const m = rawUrl.replace(/^@+/, '').match(regex);
    return m ? m[1] : null;
  };

  // Helper function to format numbers (e.g., 1000 -> 1K, 1000000 -> 1M)
  const formatNumber = (num: string): string => {
    const number = parseInt(num);
    if (number >= 1000000) {
      return (number / 1000000).toFixed(1) + 'M';
    } else if (number >= 1000) {
      return (number / 1000).toFixed(1) + 'K';
    }
    return number.toString();
  };

  // Helper function to format duration from ISO 8601 format
  const formatDuration = (duration: string): string => {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return '0:00';
    
    const hours = (match[1] || '').replace('H', '');
    const minutes = (match[2] || '').replace('M', '');
    const seconds = (match[3] || '').replace('S', '');
    
    if (hours) {
      return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.padStart(2, '0')}`;
    }
  };

  const renderPhoneContent = () => {
    if (selectedPlatform === 'instagram') {
      return (
        <div className="w-full h-full bg-white rounded-lg flex flex-col items-center justify-center p-5">
          <div className="w-full max-w-xs mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <img src="/instagram-logo.png" alt="Instagram" className="w-5 h-5 object-contain" />
                <h3 className="text-base font-semibold" style={{ color: '#11335d' }}>Instagram Integration</h3>
              </div>
              <button aria-label="Close" className="text-gray-400 hover:text-gray-600">×</button>
            </div>

            {/* Account card */}
            <div className="rounded-xl border border-gray-200 bg-white p-3 mb-4">
              <div className="flex items-start space-x-3">
                <img src="/instagram-logo.png" alt="Instagram" className="w-4 h-4 mt-0.5 object-contain" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Instagram Account</p>
                  <p className="text-xs text-gray-500">Not connected to Instagram</p>
                </div>
              </div>
            </div>

            {/* Connect button */}
            <button
              className="w-full text-white font-semibold py-2 rounded-lg"
              style={{
                background: 'linear-gradient(90deg, #C13584, #FF7A59)'
              }}
              onClick={() => { /* placeholder for connect flow */ }}
            >
              Connect Instagram
            </button>
          </div>
        </div>
      );
    }
    if (selectedPlatform === 'youtube') {
      return (
        <div className="w-full h-full bg-white rounded-lg flex flex-col items-center justify-center p-5">
          <div className="text-center w-full">
            {/* YouTube Title Image */}
            <div className="flex items-center justify-center mb-3">
              <img src="/youtube-title.png" alt="YouTube" className="w-32 h-auto object-contain" />
            </div>
            <p className="text-base mb-4" style={{ color: '#11335d' }}>
              Paste the video link below
            </p>
            <div className="w-full mb-4">
              <input
                type="url"
                value={videoLink}
                onChange={(e) => setVideoLink(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
                style={{
                  border: '3px dashed #e0c472',
                  color: '#0f172a'
                }}
              />
            </div>
            <button
              onClick={handleVideoSubmit}
              disabled={!videoLink.trim() || isLoading}
              className="text-white font-semibold py-2 px-6 rounded-lg text-sm transition-colors duration-200"
              style={{ 
                backgroundColor: '#11335d',
                border: 'none',
                cursor: (!videoLink.trim() || isLoading) ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!isLoading && videoLink.trim()) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#0f2a4a';
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#11335d';
              }}
            >
              {isLoading ? 'Analyzing...' : 'Done'}
            </button>
          </div>
        </div>
      );
    }
    
    if (selectedPlatform === 'pinterest') {
      return (
        <div className="w-full h-full bg-white rounded-lg flex flex-col items-center justify-center p-5">
          <div className="text-center w-full">
            {/* Pinterest Logo */}
            <div className="flex items-center justify-center mb-3">
              <div className="w-16 h-16 flex items-center justify-center">
                <img src="/pinterest-logo.png" alt="Pinterest" className="w-12 h-12 object-contain" />
              </div>
            </div>
            <p className="text-base mb-4" style={{ color: '#11335d' }}>
              Paste the link below.
            </p>
            <div className="w-full mb-4">
              <input
                type="url"
                value={videoLink}
                onChange={(e) => setVideoLink(e.target.value)}
                placeholder="https://www.pinterest.com/pin/..."
                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
                style={{
                  border: '3px dashed #e0c472',
                  color: '#0f172a'
                }}
              />
            </div>
            <button
              onClick={() => { /* Placeholder for Pinterest handling */ }}
              disabled={!videoLink.trim()}
              className="text-white font-semibold py-2 px-6 rounded-lg text-sm transition-colors duration-200"
              style={{ 
                backgroundColor: '#11335d',
                border: 'none',
                cursor: !videoLink.trim() ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (videoLink.trim()) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#0f2a4a';
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#11335d';
              }}
            >
              Done
            </button>
          </div>
        </div>
      );
    }
    
    if (selectedPlatform === 'facebook') {
      return (
        <div className="w-full h-full bg-white rounded-lg flex flex-col items-center justify-center p-5">
          <div className="w-full max-w-xs mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <img src="/facebook-logo.png" alt="Facebook" className="w-5 h-5 object-contain" />
                <h3 className="text-base font-semibold" style={{ color: '#11335d' }}>Facebook Integration</h3>
              </div>
            </div>

            {/* Account card */}
            {facebookConnected && facebookUser ? (
              <div className="rounded-xl border border-gray-200 bg-white p-3 mb-4">
                <div className="flex items-start space-x-3">
                  {facebookUser.photo ? (
                    <img src={facebookUser.photo} alt={facebookUser.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <img src="/facebook-logo.png" alt="Facebook" className="w-10 h-10 object-contain" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{facebookUser.name}</p>
                    <p className="text-xs text-gray-500">Connected to Facebook</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-white p-3 mb-4">
                <div className="flex items-start space-x-3">
                  <img src="/facebook-logo.png" alt="Facebook" className="w-4 h-4 mt-0.5 object-contain" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Facebook Account</p>
                    <p className="text-xs text-gray-500">Not connected to Facebook</p>
                  </div>
                </div>
              </div>
            )}

            {/* Connect/Disconnect button */}
            {facebookConnected ? (
              <button
                className="w-full text-white font-semibold py-2 rounded-lg transition-colors duration-200"
                style={{ backgroundColor: '#dc2626' }}
                onClick={handleDisconnectFacebook}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#b91c1c';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#dc2626';
                }}
              >
                Disconnect Facebook
              </button>
            ) : (
              <button
                className="w-full text-white font-semibold py-2 rounded-lg transition-colors duration-200"
                style={{ backgroundColor: '#1877F2' }}
                onClick={handleConnectFacebook}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#166FE5';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1877F2';
                }}
              >
                Connect Facebook
              </button>
            )}
          </div>
        </div>
      );
    }
    
    if (selectedPlatform) {
      return (
        <div className="w-full h-full bg-white rounded-lg flex flex-col items-center justify-center p-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)} Integration
            </h3>
            <p className="text-gray-600 mb-6">
              Connect your {selectedPlatform} account to get started with AI-powered content creation.
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
              Connect {selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)}
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="w-full h-full bg-white rounded-lg flex items-center justify-center relative overflow-hidden">
        <img
          src="/cropped_ai_image.png"
          alt="Chris, your AI Business Coach"
          className="w-full h-full object-contain rounded-lg"
        />
      </div>
    );
  };

  return (
    <div className="bg-white">
      {/* Top Navigation */}
      <div className="container mx-auto px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          {/* Back to GYB Studio */}
          <Link to="/gyb-studio" className="flex items-center text-navy-blue">
            <span className="mr-2">{/* Chevron Left */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="#11335d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <span className="font-semibold" style={{ color: '#11335d' }}>GYB Studio</span>
          </Link>

          {/* Actions */}
          <div className="flex items-center space-x-6">
            <Link
              to="/gyb-studio/create"
              className="flex items-center rounded-full text-white text-sm font-semibold shadow-sm"
              style={{ backgroundColor: '#11335d', padding: '10px 16px' }}
            >
              <span className="mr-2">{/* Plus icon */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5v14M5 12h14" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </span>
              Upload Content
            </Link>
            <Link
              to="/gyb-studio"
              className="rounded-full text-sm font-semibold shadow-sm"
              style={{ backgroundColor: '#e0c472', color: '#11335d', padding: '10px 20px' }}
            >
              Past Content
            </Link>
          </div>
        </div>
      </div>
      {/* CSS Animations for Post Metrics */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes glowBorder {
          0%, 100% {
            box-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
          }
          50% {
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
          }
        }
      `}</style>
      {/* Initial Chris Section */}
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-12">
        {/* Chris Illustration - background removed */}
        <div className="relative mb-8">
          <div className="w-80 h-96 flex items-center justify-center relative overflow-hidden">
            <img 
              src="/cropped_ai_image.png" 
              alt="Chris AI Business Coach" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Text */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4" style={{ color: '#11335d' }}>
            Hi, I'm Chris! Your AI Business coach.
          </h2>
        </div>

        {/* Button */}
        <div className="text-center">
          <button
            onClick={handleGetStarted}
            className="text-white font-semibold py-4 px-8 rounded-xl text-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
            style={{ backgroundColor: '#11335d' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#0f2a4a'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#11335d'; }}
          >
            Let's Get Started
          </button>
        </div>
      </div>

      {/* Platform Selection Section */}
      <div ref={platformSectionRef} className="min-h-screen bg-white flex items-center justify-center p-8 relative">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start justify-between w-full gap-12">
          
          {/* Left Section: Text and Social Media Icons */}
          <div className="flex flex-col items-start text-left lg:w-1/2">
            {/* Main Text */}
            <h1 className="text-4xl font-bold mb-12 leading-tight max-w-lg" style={{ color: '#11335d' }}>
              To begin, select one of the platforms below and follow the instructions that appear on the phone.
            </h1>

            {/* Social Media Icons Row */}
            <div className="flex space-x-8 mb-8 relative">
              {/* Instagram */}
              <div 
                className={`w-20 h-20 rounded-xl flex items-center justify-center cursor-pointer hover:scale-105 transition-transform bg-transparent shadow-lg relative`}
                onClick={() => handlePlatformSelect('instagram')}
              >
                <img 
                  src="/instagram-logo.png" 
                  alt="Instagram" 
                  className="w-12 h-12 object-contain"
                />
                {selectedPlatform === 'instagram' && (
                  <div className="absolute inset-0 rounded-full border-4" style={{ borderColor: '#e0c472' }}></div>
                )}
              </div>

              {/* Facebook */}
              <div 
                className={`w-20 h-20 rounded-xl flex items-center justify-center cursor-pointer hover:scale-105 transition-transform bg-transparent shadow-lg relative`}
                onClick={() => handlePlatformSelect('facebook')}
              >
                <img 
                  src="/facebook-logo.png" 
                  alt="Facebook" 
                  className="w-12 h-12 object-contain"
                />
                {selectedPlatform === 'facebook' && (
                  <div className="absolute inset-0 rounded-full border-4" style={{ borderColor: '#e0c472' }}></div>
                )}
              </div>

              {/* YouTube */}
              <div 
                className={`w-20 h-20 rounded-xl flex items-center justify-center cursor-pointer hover:scale-105 transition-transform bg-transparent shadow-lg relative`}
                onClick={() => handlePlatformSelect('youtube')}
              >
                <svg className="w-12 h-12 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                {selectedPlatform === 'youtube' && (
                  <div className="absolute inset-0 rounded-full border-4" style={{ borderColor: '#e0c472' }}></div>
                )}
              </div>

              {/* Pinterest */}
              <div 
                className={`w-20 h-20 rounded-xl flex items-center justify-center cursor-pointer hover:scale-105 transition-transform bg-transparent shadow-lg relative`}
                onClick={() => handlePlatformSelect('pinterest')}
              >
                <img 
                  src="/pinterest-logo.png" 
                  alt="Pinterest" 
                  className="w-12 h-12 object-contain"
                />
                {selectedPlatform === 'pinterest' && (
                  <div className="absolute inset-0 rounded-full border-4" style={{ borderColor: '#e0c472' }}></div>
                )}
              </div>
            </div>
          </div>

          {/* Right Section: Phone Mockup with Chris Image */}
          <div className="flex justify-center lg:justify-end lg:w-1/2">
            {/* Phone Mockup */}
            <div className="relative w-80 h-[600px] rounded-[3rem] shadow-2xl overflow-hidden"
                 style={{
                   backgroundImage: `url('/mobile layout.png')`,
                   backgroundSize: 'cover',
                   backgroundPosition: 'center',
                   backgroundRepeat: 'no-repeat'
                 }}>
             
              {/* Inner screen area */}
              <div className="absolute inset-0 m-3 bg-white rounded-[2.5rem] flex items-center justify-center p-6">
                {/* Content Container with smooth transitions */}
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="w-full h-full transition-all duration-500 ease-in-out">
                    {renderPhoneContent()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Metrics Section */}
      {videoMetrics && (
        <div ref={nextSectionRef} className="min-h-screen bg-white flex items-center justify-center p-8">
          <div className="max-w-6xl mx-auto">
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
                    <div className="text-sm font-medium">Total Views</div>
                    <div className="text-2xl font-bold">
                      {videoMetrics.totalViews.toLocaleString()}
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
                    <div className="text-sm font-medium">Total Likes</div>
                    <div className="text-2xl font-bold">
                      {videoMetrics.totalLikes.toLocaleString()}
                    </div>
                  </div>
                </div>
                
                {/* Central AI Character */}
                <div className="flex flex-col items-center">
                  <div className="relative mb-4">
                     <img 
                       src="/cropped_ai_image.png"
                       alt="Chris AI Business Coach"
                       className="object-contain rounded-lg"
                       style={{
                         width: '350px',
                         height: '350px'
                       }}
                     />
                  </div>
                  
                  {/* YouTube Icon */}
                  <div className="flex items-center justify-center">
                    <svg className="w-12 h-12 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
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
                    <div className="text-sm font-medium">Total Comments</div>
                    <div className="text-2xl font-bold">
                      {videoMetrics.totalComments.toLocaleString()}
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
                    <div className="text-sm font-medium">Duration</div>
                    <div className="text-2xl font-bold">
                      {videoMetrics.duration}
                    </div>
                  </div>
                </div>
              </div>
              
            </div>

            {/* Deep Dive Button */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => {
                  setShowDeepDive(true);
                  // Scroll to demographics section
                  setTimeout(() => {
                    nextSectionRef.current?.scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'start'
                    });
                  }, 100);
                }}
                className="text-white font-semibold py-2 px-6 rounded-lg shadow hover:shadow-md transition-all duration-200"
                style={{ backgroundColor: '#11335d' }}
              >
                Deep Dive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deep Dive Demographics Section */}
      {showDeepDive && videoId && videoMetrics && (
        <div ref={nextSectionRef} className="min-h-screen bg-white flex items-center justify-center p-8">
          <div className="max-w-6xl mx-auto w-full">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-3xl font-bold" style={{ color: '#11335d' }}>
                Deep Dive Analytics
              </h2>
              <button
                onClick={() => setShowDeepDive(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                aria-label="Close deep dive"
              >
                ×
              </button>
            </div>
            
            {/* Video Info Card */}
            <div className="bg-white p-6 rounded-lg shadow mb-6 border-2" style={{ borderColor: '#e0c472' }}>
              <div className="flex items-start gap-4">
                {videoMetrics.thumbnail && (
                  <img 
                    src={videoMetrics.thumbnail} 
                    alt={videoMetrics.title}
                    className="w-48 h-36 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2" style={{ color: '#11335d' }}>
                    {videoMetrics.title}
                  </h3>
                  <p className="text-gray-600 mb-2">{videoMetrics.channelTitle}</p>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>👁️ {videoMetrics.views} views</span>
                    <span>👍 {videoMetrics.likes} likes</span>
                    <span>💬 {videoMetrics.comments} comments</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Demographics Component */}
            <YouTubeDemographics 
              videoId={videoId}
              title="Subscriber Demographics"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChrisAIBusinessCoach;