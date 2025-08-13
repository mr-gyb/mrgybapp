import React from 'react';
import { useLocation, BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useTheme } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import BottomMenu from './components/BottomMenu';
import Login from './components/Auth/Login';
import SignIn from './components/Auth/SignIn';
import NewChat from './components/NewChat';
import Chat from './components/Chat';
import ChatHistory from './components/ChatHistory';
import Commerce from './components/Commerce';
import Dashboard from './components/Dashboard';
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
import FacebookAPITester from './components/FacebookAPITester';
import FacebookPostsDisplay from './components/FacebookPostsDisplay';
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
import HomePage from './components/HomePage';
import AboutPage from './components/AboutPage';
import ContactUs from './components/ContactUs';
import WhatToExpect from './components/WhatToExpect';
import TrialSignupPage from './components/TrialSignupPage';
import TrialSignupStep2 from './components/TrialSignupStep2';
import TrialSignupConfirmation from './components/TrialSignupConfirmation';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './components/NotFound';

import GoogleAuthCallback from './components/Auth/GoogleAuthCallback';


// Import template components
import BusinessPlan from './components/templates/BusinessPlan';
import InvestorDeck from './components/templates/InvestorDeck';
import MarketAnalysis from './components/templates/MarketAnalysis';
import MarketingSales from './components/templates/MarketingSales';
import FulfilmentPlan from './components/templates/FulfilmentPlan';
import MediaPlan from './components/templates/MediaPlan';

const getPageTitle = (pathname: string) => {
  switch (pathname) {
    case '/':
      return 'Home';
    case '/homepage':
      return 'Home';
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
    case '/facebook-posts':
      return 'Facebook Posts';
    default:
      return '';
  }
};

const App: React.FC = () => {
  const { isDarkMode } = useTheme();

  return (
    <Router>
      <InnerApp isDarkMode={isDarkMode} />
    </Router>
  );
};
  

const InnerApp: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const location = useLocation();


  // To hide the bottom menu when it is in signin and signup Page
  const hideBottomMenuRoutes = ['/login', '/signin', '/', '/onboarding'];
  const hideHeaderMenuRoutes = ['/login', '/signin', '/', '/onboarding']

  return (
    <div className={`flex flex-col min-h-screen ${isDarkMode ? 'dark bg-navy-blue text-white' : 'bg-white text-navy-blue'}`}>
      {!hideHeaderMenuRoutes.includes(location.pathname) && <Header getPageTitle={getPageTitle} />}
      <main className="flex-grow mt-16 mb-16">
        <Routes>
          {/* Public Routes - No need to have account*/}
          <Route path="/" element={
            <ProtectedRoute requireAuth={false}>
              <Login />
            </ProtectedRoute>
          } />
          <Route path="/login" element={
            <ProtectedRoute requireAuth={false}>
              <Login />
            </ProtectedRoute>
          } />
          <Route path="/signin" element={
            <ProtectedRoute requireAuth={false}>
              <SignIn />
            </ProtectedRoute>
          } />
          <Route path="/forgot-password" element={
            <ProtectedRoute requireAuth={false}>
              <ForgotPassword />
            </ProtectedRoute>
          } />
          <Route path="/reset-password" element={
            <ProtectedRoute requireAuth={false}>
              <ResetPassword />
            </ProtectedRoute>
          } />
          
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/onboarding" element={
            <ProtectedRoute requireAuth={false}>
              <UserOnboarding />
            </ProtectedRoute>
          } />
          <Route path="/google-callback" element={<GoogleAuthCallback />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/what-to-expect" element={<WhatToExpect />} />
          <Route path="/trial-signup" element={
            <ProtectedRoute requireAuth={false}>
              <TrialSignupPage />
            </ProtectedRoute>
          } />
          <Route path="/trial-signup-step2" element={
            <ProtectedRoute requireAuth={false}>
              <TrialSignupStep2 />
            </ProtectedRoute>
          } />
          <Route path="/trial-signup-confirmation" element={
            <ProtectedRoute requireAuth={false}>
              <TrialSignupConfirmation />
            </ProtectedRoute>
          } />

          {/* Protected App Routes - Need authentication to access public routers */}
          <Route path="/homepage" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Commerce />
            </ProtectedRoute>
          } />
          <Route path="/new-chat" element={
            <ProtectedRoute>
              <NewChat />
            </ProtectedRoute>
          } />
          <Route path="/chat/:chatId" element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } />
          <Route path="/chat-history" element={
            <ProtectedRoute>
              <ChatHistory />
            </ProtectedRoute>
          } />
          <Route path="/dream-team" element={
            <ProtectedRoute>
              <DreamTeam />
            </ProtectedRoute>
          } />
          <Route path="/gyb-live-network" element={
            <ProtectedRoute>
              <GYBLiveNetwork />
            </ProtectedRoute>
          } />
          <Route path="/user-profile/:userId" element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/gyb-team-chat" element={
            <ProtectedRoute>
              <GYBTeamChat />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          } />
          <Route path="/upload" element={
            <ProtectedRoute>
              <Upload />
            </ProtectedRoute>
          } />
          <Route path="/new-post" element={
            <ProtectedRoute>
              <GYBMedia />
            </ProtectedRoute>
          } />
          <Route path="/gyb-studio" element={
            <ProtectedRoute>
              <GYBStudio />
            </ProtectedRoute>
          } />
          <Route path="/work-history" element={
            <ProtectedRoute>
              <WorkHistory />
            </ProtectedRoute>
          } />
          <Route path="/invites" element={
            <ProtectedRoute>
              <Invites />
            </ProtectedRoute>
          } />
          <Route path="/reviews" element={
            <ProtectedRoute>
              <Reviews />
            </ProtectedRoute>
          } />
          <Route path="/rewards" element={
            <ProtectedRoute>
              <Rewards />
            </ProtectedRoute>
          } />
          <Route path="/payments" element={
            <ProtectedRoute>
              <Payments />
            </ProtectedRoute>
          } />
          <Route path="/earnings" element={
            <ProtectedRoute>
              <Earnings />
            </ProtectedRoute>
          } />
          <Route path="/road-map" element={
            <ProtectedRoute>
              <RoadMap />
            </ProtectedRoute>
          } />
          <Route path="/portfolio" element={
            <ProtectedRoute>
              <Portfolio />
            </ProtectedRoute>
          } />
          <Route path="/resume" element={
            <ProtectedRoute>
              <Resume />
            </ProtectedRoute>
          } />
          <Route path="/bookmarks" element={
            <ProtectedRoute>
              <BookmarksPage />
            </ProtectedRoute>
          } />
          <Route path="/ai-video-avatar" element={
            <ProtectedRoute>
              <AIVideoAvatar />
            </ProtectedRoute>
          } />
          <Route path="/group/create" element={
            <ProtectedRoute>
              <CreateGroup />
            </ProtectedRoute>
          } />
          <Route path="/group/:groupId" element={
            <ProtectedRoute>
              <GroupProfile />
            </ProtectedRoute>
          } />

          {/* Protected Template Routes - need to have authentication */}
          <Route path="/templates/business-plan" element={
            <ProtectedRoute>
              <BusinessPlan />
            </ProtectedRoute>
          } />
          <Route path="/templates/investor-deck" element={
            <ProtectedRoute>
              <InvestorDeck />
            </ProtectedRoute>
          } />
          <Route path="/templates/market-analysis" element={
            <ProtectedRoute>
              <MarketAnalysis />
            </ProtectedRoute>
          } />
          <Route path="/templates/marketing-sales" element={
            <ProtectedRoute>
              <MarketingSales />
            </ProtectedRoute>
          } />
          <Route path="/templates/fulfilment-plan" element={
            <ProtectedRoute>
              <FulfilmentPlan />
            </ProtectedRoute>
          } />
          <Route path="/templates/media-plan" element={
            <ProtectedRoute>
              <MediaPlan />
            </ProtectedRoute>
          } />

          {/* Protected Settings Routes - need to have authentication*/}
          <Route path="/settings/email" element={
            <ProtectedRoute>
              <EmailSettings />
            </ProtectedRoute>
          } />
          <Route path="/settings/subscription" element={
            <ProtectedRoute>
              <SubscriptionSettings />
            </ProtectedRoute>
          } />
          <Route path="/settings/personalization" element={
            <ProtectedRoute>
              <PersonalizationSettings />
            </ProtectedRoute>
          } />
          <Route path="/settings/data-controls" element={
            <ProtectedRoute>
              <DataControls />
            </ProtectedRoute>
          } />
          <Route path="/settings/archived-chats" element={
            <ProtectedRoute>
              <ArchivedChats />
            </ProtectedRoute>
          } />
          <Route path="/settings/language" element={
            <ProtectedRoute>
              <LanguageSettings />
            </ProtectedRoute>
          } />
          <Route path="/settings/spelling" element={
            <ProtectedRoute>
              <SpellingSettings />
            </ProtectedRoute>
          } />
          <Route path="/settings/updates" element={
            <ProtectedRoute>
              <UpdatesSettings />
            </ProtectedRoute>
          } />
          <Route path="/settings/voice" element={
            <ProtectedRoute>
              <VoiceSettings />
            </ProtectedRoute>
          } />
          <Route path="/settings/main-language" element={
            <ProtectedRoute>
              <MainLanguageSettings />
            </ProtectedRoute>
          } />
          <Route path="/settings/integrations" element={
            <ProtectedRoute>
              <Integrations />
            </ProtectedRoute>
          } />
          <Route path="/settings/help" element={
            <ProtectedRoute>
              <HelpCenter />
            </ProtectedRoute>
          } />
          <Route path="/settings/terms" element={
            <ProtectedRoute>
              <TermsOfUse />
            </ProtectedRoute>
          } />
          <Route path="/settings/privacy" element={
            <ProtectedRoute>
              <PrivacyPolicy />
            </ProtectedRoute>
          } />
          
          {/* Error handling - path not found  */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!hideBottomMenuRoutes.includes(location.pathname) && <BottomMenu />}
    </div>
  );
};

export default App;