import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useTheme } from './contexts/ThemeContext';
import Header from './components/Header';
import BottomMenu from './components/BottomMenu';
import Login from './components/Auth/Login';
import SignIn from './components/Auth/SignIn';
import NewChat from './components/NewChat';
import Chat from './components/Chat';
import ChatHistory from './components/ChatHistory';
import Commerce from './components/Dashboard';
import DreamTeam from './components/DreamTeam';
import GYBLiveNetwork from './components/GYBLiveNetwork';
import UserProfile from './components/UserProfile';
import Profile from './components/Profile';
import Settings from './components/Settings';
import UserOnboarding from './components/UserOnboarding';
import GYBTeamChat from './components/GYBTeamChat';
import Analytics from './components/Analytics';
import Upload from './components/Upload';
import GYBMedia from './components/NewPost';
import GYBStudio from './components/GYBStudio';
import WorkHistory from './components/WorkHistory';
import Invites from './components/Invites';
import Reviews from './components/Reviews';
import Rewards from './components/Rewards';
import Payments from './components/Payments';
import Earnings from './components/Earnings';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import AuthCallback from './components/Auth/AuthCallback';
import RoadMap from './components/RoadMap';
import Portfolio from './components/Portfolio';
import Resume from './components/Resume';
import BookmarksPage from './components/bookmarks/BookmarksPage';
import EmailSettings from './components/settings/EmailSettings';
import SubscriptionSettings from './components/settings/SubscriptionSettings';
import PersonalizationSettings from './components/settings/PersonalizationSettings';
import DataControls from './components/settings/DataControls';
import ArchivedChats from './components/settings/ArchivedChats';
import LanguageSettings from './components/settings/LanguageSettings';
import SpellingSettings from './components/settings/SpellingSettings';
import UpdatesSettings from './components/settings/UpdatesSettings';
import VoiceSettings from './components/settings/VoiceSettings';
import MainLanguageSettings from './components/settings/MainLanguageSettings';
import Integrations from './components/settings/integrations/Integrations';
import HelpCenter from './components/settings/HelpCenter';
import TermsOfUse from './components/settings/TermsOfUse';
import PrivacyPolicy from './components/settings/PrivacyPolicy';
import AIVideoAvatar from './components/AIVideoAvatar';
import CreateGroup from './components/group/CreateGroup';
import GroupProfile from './components/group/GroupProfile';

// Import template components
import BusinessPlan from './components/templates/BusinessPlan';
import InvestorDeck from './components/templates/InvestorDeck';
import MarketAnalysis from './components/templates/MarketAnalysis';
import MarketingSales from './components/templates/MarketingSales';
import FulfilmentPlan from './components/templates/FulfilmentPlan';
import MediaPlan from './components/templates/MediaPlan';

const getPageTitle = (pathname: string) => {
  switch (pathname) {
    case '/dashboard':
      return 'Commerce';
    case '/new-chat':
      return 'Culture';
    case '/chat-history':
      return 'Chat History';
    case '/dream-team':
      return 'Dream Team';
    case '/gyb-live-network':
      return 'Community';
    case '/settings':
      return 'Settings';
    case '/new-post':
      return 'Content';
    case '/road-map':
      return 'Roadmap';
    case '/gyb-studio':
      return 'Content';
    default:
      return '';
  }
};

const App: React.FC = () => {
  const { isDarkMode } = useTheme();

  return (
    <Router>
      <div className={`flex flex-col min-h-screen ${isDarkMode ? 'dark bg-navy-blue text-white' : 'bg-white text-navy-blue'}`}>
        <Header getPageTitle={getPageTitle} />
        <main className="flex-grow mt-16 mb-16">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Commerce />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/onboarding" element={<UserOnboarding />} />

            {/* App Routes */}
            <Route path="/dashboard" element={<Commerce />} />
            <Route path="/new-chat" element={<NewChat />} />
            <Route path="/chat/:chatId" element={<Chat />} />
            <Route path="/chat-history" element={<ChatHistory />} />
            <Route path="/dream-team" element={<DreamTeam />} />
            <Route path="/gyb-live-network" element={<GYBLiveNetwork />} />
            <Route path="/user-profile/:userId" element={<UserProfile />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/gyb-team-chat" element={<GYBTeamChat />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/new-post" element={<GYBMedia />} />
            <Route path="/gyb-studio" element={<GYBStudio />} />
            <Route path="/work-history" element={<WorkHistory />} />
            <Route path="/invites" element={<Invites />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/earnings" element={<Earnings />} />
            <Route path="/road-map" element={<RoadMap />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/resume" element={<Resume />} />
            <Route path="/bookmarks" element={<BookmarksPage />} />
            <Route path="/ai-video-avatar" element={<AIVideoAvatar />} />
            <Route path="/group/create" element={<CreateGroup />} />
            <Route path="/group/:groupId" element={<GroupProfile />} />

            {/* Template Routes */}
            <Route path="/templates/business-plan" element={<BusinessPlan />} />
            <Route path="/templates/investor-deck" element={<InvestorDeck />} />
            <Route path="/templates/market-analysis" element={<MarketAnalysis />} />
            <Route path="/templates/marketing-sales" element={<MarketingSales />} />
            <Route path="/templates/fulfilment-plan" element={<FulfilmentPlan />} />
            <Route path="/templates/media-plan" element={<MediaPlan />} />

            {/* Settings Routes */}
            <Route path="/settings/email" element={<EmailSettings />} />
            <Route path="/settings/subscription" element={<SubscriptionSettings />} />
            <Route path="/settings/personalization" element={<PersonalizationSettings />} />
            <Route path="/settings/data-controls" element={<DataControls />} />
            <Route path="/settings/archived-chats" element={<ArchivedChats />} />
            <Route path="/settings/language" element={<LanguageSettings />} />
            <Route path="/settings/spelling" element={<SpellingSettings />} />
            <Route path="/settings/updates" element={<UpdatesSettings />} />
            <Route path="/settings/voice" element={<VoiceSettings />} />
            <Route path="/settings/main-language" element={<MainLanguageSettings />} />
            <Route path="/settings/integrations" element={<Integrations />} />
            <Route path="/settings/help" element={<HelpCenter />} />
            <Route path="/settings/terms" element={<TermsOfUse />} />
            <Route path="/settings/privacy" element={<PrivacyPolicy />} />
          </Routes>
        </main>
        <BottomMenu />
      </div>
    </Router>
  );
};

export default App;