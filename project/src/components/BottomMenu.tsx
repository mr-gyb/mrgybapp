import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Grid3X3, MessageCircle, Users, Video } from 'lucide-react';

const BottomMenu: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isHomeRoute = location.pathname === '/home';
  const isCultureRoute =
    location.pathname === '/new-chat' ||
    location.pathname === '/chat-history' ||
    location.pathname.startsWith('/chat/');
  const isContentRoute =
    location.pathname.startsWith('/gyb-studio') ||
    location.pathname === '/analytics' ||
    location.pathname === '/upload' ||
    location.pathname === '/gyb-media';
  const isCommunityRoute =
    location.pathname === '/community' ||
    location.pathname === '/gyb-live-network' ||
    location.pathname === '/dream-team' ||
    location.pathname === '/profile' ||
    location.pathname.startsWith('/user-profile/');

  const items = [
    { label: 'Home', icon: Grid3X3, to: '/home', active: isHomeRoute },
    { label: 'Culture', icon: MessageCircle, to: '/new-chat', active: isCultureRoute },
    { label: 'Content', icon: Video, to: '/gyb-studio', active: isContentRoute },
    { label: 'Community', icon: Users, to: '/gyb-live-network', active: isCommunityRoute }
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 z-20 w-[min(720px,calc(100%-2rem))] -translate-x-1/2 rounded-full bg-[#E3C472] border border-[#d1b25d] shadow-[0_20px_40px_rgba(0,0,0,0.25)] px-6 py-3">
      <div className="grid grid-cols-4 gap-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => navigate(item.to)}
              className={`flex flex-col items-center gap-1 text-[11px] md:text-xs ${
                item.active ? 'text-[#0f2440] font-semibold' : 'text-[#475569]'
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomMenu;