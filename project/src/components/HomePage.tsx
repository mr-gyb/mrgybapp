import React, { useMemo } from 'react';
import { Bell, Activity, Video, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const { userData } = useAuth();
  const { chats } = useChat();
  const navigate = useNavigate();
  const firstName = userData?.name?.split(' ')[0] || 'there';
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 21) return 'Good evening';
    return 'Good night';
  }, []);

  const unreadCount = useMemo(() => {
    if (!chats || chats.length === 0) return 0;

    const raw = window.localStorage.getItem('mrgyb_culture_lastViewed');
    const lastViewed: Record<string, string> = raw ? JSON.parse(raw) : {};

    const nowUnread = chats.filter((chat) => {
      if (!chat.updatedAt) return false;
      const last = lastViewed[chat.id];
      if (!last) return true;
      return new Date(chat.updatedAt) > new Date(last);
    });

    return nowUnread.length;
  }, [chats]);

  const handleCultureInsightsClick = () => {
    try {
      const map: Record<string, string> = {};
      const nowIso = new Date().toISOString();
      chats.forEach((chat) => {
        if (chat.id) {
          map[chat.id] = nowIso;
        }
      });
      window.localStorage.setItem('mrgyb_culture_lastViewed', JSON.stringify(map));
    } catch {
      // ignore storage errors
    }
    navigate('/chat-history');
  };

  return (
    <div className="min-h-screen bg-white text-[#020617] px-4 py-6 md:px-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Greeting */}
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-[#11335d]">
            {greeting}, {firstName}
          </h1>
          <p className="mt-1 text-sm text-gray-400">Here&apos;s your daily briefing.</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Community notifications */}
          <div className="relative overflow-hidden rounded-2xl bg-[#11335d] border border-[#11335d] shadow-[0_18px_40px_rgba(0,0,0,0.25)] px-5 py-4 text-white">
            <div className="flex items-center justify-between text-xs font-semibold text-[#E3C472] tracking-wide">
              <div className="flex items-center gap-2">
                <Bell size={16} />
                <span>COMMUNITY UPDATES</span>
              </div>
            </div>
            <div className="mt-4 text-xl md:text-2xl font-semibold">2 new notifications</div>
            <div className="mt-1 text-xs text-gray-400">
              1 new friend request · 1 new post from your network
            </div>
          </div>

          {/* Latest post engagement */}
          <div className="relative overflow-hidden rounded-2xl bg-[#11335d] border border-[#11335d] shadow-[0_18px_40px_rgba(0,0,0,0.25)] px-5 py-4 text-white">
            <div className="flex items-center justify-between text-xs font-semibold text-[#E3C472] tracking-wide">
              <div className="flex items-center gap-2">
                <Activity size={16} />
                <span>LATEST POST ENGAGEMENT</span>
              </div>
            </div>
            <div className="mt-4 text-xl md:text-2xl font-semibold">1.3k views</div>
            <div className="mt-1 text-xs text-gray-400">
              87 likes · 14 comments on your most recent post
            </div>
          </div>
        </div>

        {/* Modules header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold tracking-[0.2em] text-gray-400">
            YOUR MODULES
          </h2>
        </div>

        {/* Culture Profile module card */}
        <div className="rounded-2xl bg-[#11335d] border border-[#11335d] shadow-[0_24px_60px_rgba(0,0,0,0.25)] px-5 py-4 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#E3C472] flex items-center justify-center">
                <img
                  src="/culture-icon.jpg"
                  alt="Culture"
                  className="w-7 h-7 object-contain"
                />
              </div>
              <div>
                <h3 className="text-base md:text-lg font-semibold">Culture Profile</h3>
                <p className="mt-1 text-xs md:text-sm text-gray-100">
                  Refine your brand voice and internal values.
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleCultureInsightsClick}
                className="self-start rounded-md bg-[#E3C472] px-3 py-1 text-[11px] font-semibold text-black shadow-sm"
              >
                {unreadCount} New Insight{unreadCount > 1 ? 's' : ''}
              </button>
            )}
          </div>
        </div>

        {/* Content Studio module card */}
        <div className="rounded-2xl bg-[#11335d] border border-[#11335d] shadow-[0_24px_60px_rgba(0,0,0,0.25)] px-5 py-4 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#E3C472] flex items-center justify-center text-[#11335d]">
                <Video size={18} />
              </div>
              <div>
                <h3 className="text-base md:text-lg font-semibold">Content Studio</h3>
                <p className="mt-1 text-xs md:text-sm text-gray-100">
                  Script generation and performance analytics.
                </p>
                <div className="mt-3 flex flex-col md:flex-row gap-3">
                  <button
                    className="flex-1 rounded-md bg-[#E3C472] px-4 py-2 text-xs md:text-sm font-semibold text-black shadow-sm flex items-center justify-center gap-2"
                    onClick={() => navigate('/gyb-studio-welcome')}
                  >
                    <span className="text-lg leading-none">+</span>
                    <span>New Script</span>
                  </button>
                  <button
                    className="flex-1 rounded-md bg-[#11335d] border border-[#1f2937] px-4 py-2 text-xs md:text-sm font-semibold text-gray-200 hover:bg-[#0f2440]"
                    onClick={() => navigate('/analytics')}
                  >
                    Analytics
                  </button>
                </div>
              </div>
            </div>

            <div className="self-start rounded-full bg-[#E3C472] px-2.5 py-1 text-[10px] font-medium text-[#11335d] border border-[#E3C472]">
              +3 drafts
            </div>
          </div>
        </div>

        {/* Community module card */}
        <div className="rounded-2xl bg-[#11335d] border border-[#11335d] shadow-[0_24px_60px_rgba(0,0,0,0.25)] px-5 py-4 mb-4 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#E3C472] flex items-center justify-center text-[#11335d]">
                <Users size={18} />
              </div>
              <div className="flex-1">
                <h3 className="text-base md:text-lg font-semibold">Community</h3>
                <p className="mt-1 text-xs md:text-sm text-gray-100">
                  Connect with other founders and creators.
                </p>

                <div className="mt-3 rounded-lg bg-[#0f172a] border border-[#1f2937] px-3 py-2">
                  <p className="text-[10px] font-semibold text-[#E3C472] uppercase tracking-[0.18em]">
                    Trending discussion
                  </p>
                  <p className="mt-1 text-xs md:text-sm text-gray-200 truncate">
                    &quot;How are you utilizing AI for customer support...&quot;
                  </p>
                </div>
              </div>
            </div>

            <button
              className="self-start flex items-center gap-1 text-[10px] font-medium text-[#E3C472]"
              onClick={() => navigate('/gyb-live-network')}
            >
              <span className="w-2 h-2 rounded-full bg-[#E3C472]" />
              <span>14 Online</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;