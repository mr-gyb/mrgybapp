<<<<<<< HEAD
import React from 'react';
import { useLocation, BrowserRouter as Router, Route, Routes } from 'react-router-dom';
=======
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
>>>>>>> main
import { useTheme } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import BottomMenu from './components/BottomMenu';
<<<<<<< HEAD
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

=======
>>>>>>> main

// Lazy load components for code splitting
const Login = lazy(() => import('./components/Login'));
const SignIn = lazy(() => import('./components/SignIn'));
const NewChat = lazy(() => import('./components/NewChat'));
const Chat = lazy(() => import('./components/Chat'));
const ChatHistory = lazy(() => import('./components/ChatHistory'));
const Commerce = lazy(() => import('./components/Commerce'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const DreamTeam = lazy(() => import('./components/DreamTeam'));
const GYBLiveNetwork = lazy(() => import('./components/GYBLiveNetwork'));
const UserProfile = lazy(() => import('./components/UserProfile'));
const Profile = lazy(() => import('./components/Profile'));
const Settings = lazy(() => import('./components/Settings'));
const UserOnboarding = lazy(() => import('./components/UserOnboarding'));
const GYBTeamChat = lazy(() => import('./components/GYBTeamChat'));
const Analytics = lazy(() => import('./components/Analytics'));
const Upload = lazy(() => import('./components/Upload'));
const GYBMedia = lazy(() => import('./components/NewPost'));
const GYBStudio = lazy(() => import('./components/GYBStudio'));
const FacebookAPITester = lazy(() => import('./components/FacebookAPITester'));
const FacebookPostsDisplay = lazy(() => import('./components/FacebookPostsDisplay'));
const WorkHistory = lazy(() => import('./components/WorkHistory'));
const Invites = lazy(() => import('./components/Invites'));
const Reviews = lazy(() => import('./components/Reviews'));
const Rewards = lazy(() => import('./components/Rewards'));
const Payments = lazy(() => import('./components/Payments'));
const Earnings = lazy(() => import('./components/Earnings'));
const SpotifyCallback = lazy(() => import('./components/SpotifyCallback'));
const SpotifyPlaylistTest = lazy(() => import('./components/SpotifyPlaylistTest'));

const RoadMap = lazy(() => import('./components/RoadMap'));
const Portfolio = lazy(() => import('./components/Portfolio'));
const Resume = lazy(() => import('./components/Resume'));
const BookmarksPage = lazy(() => import('./components/bookmarks/BookmarksPage'));
const EmailSettings = lazy(() => import('./components/settings/EmailSettings'));
const SubscriptionSettings = lazy(() => import('./components/settings/SubscriptionSettings'));
const PersonalizationSettings = lazy(() => import('./components/settings/PersonalizationSettings'));
const DataControls = lazy(() => import('./components/settings/DataControls'));
const ArchivedChats = lazy(() => import('./components/settings/ArchivedChats'));
const LanguageSettings = lazy(() => import('./components/settings/LanguageSettings'));
const SpellingSettings = lazy(() => import('./components/settings/SpellingSettings'));
const UpdatesSettings = lazy(() => import('./components/settings/UpdatesSettings'));
const VoiceSettings = lazy(() => import('./components/settings/VoiceSettings'));
const MainLanguageSettings = lazy(() => import('./components/settings/MainLanguageSettings'));
const Integrations = lazy(() => import('./components/settings/integrations/Integrations'));
const FacebookIntegration = lazy(() => import('./components/settings/integrations/FacebookIntegration'));
const FacebookCallback = lazy(() => import('./components/FacebookCallback'));
const IntegrationCallback = lazy(() => import('./components/settings/integrations/IntegrationCallback'));
const HelpCenter = lazy(() => import('./components/settings/HelpCenter'));
const TermsOfUse = lazy(() => import('./components/settings/TermsOfUse'));
const PrivacyPolicy = lazy(() => import('./components/settings/PrivacyPolicy'));
const AIVideoAvatar = lazy(() => import('./components/AIVideoAvatar'));
const CreateGroup = lazy(() => import('./components/group/CreateGroup'));
const GroupProfile = lazy(() => import('./components/group/GroupProfile'));
const HomePage = lazy(() => import('./components/HomePage'));
const AboutPage = lazy(() => import('./components/AboutPage'));
const ContactUs = lazy(() => import('./components/ContactUs'));
const WhatToExpect = lazy(() => import('./components/WhatToExpect'));
const TrialSignupPage = lazy(() => import('./components/TrialSignupPage'));
const TrialSignupStep2 = lazy(() => import('./components/TrialSignupStep2'));
const TrialSignupConfirmation = lazy(() => import('./components/TrialSignupConfirmation'));

// Lazy load template components
const BusinessPlan = lazy(() => import('./components/templates/BusinessPlan'));
const InvestorDeck = lazy(() => import('./components/templates/InvestorDeck'));
const MarketAnalysis = lazy(() => import('./components/templates/MarketAnalysis'));
const MarketingSales = lazy(() => import('./components/templates/MarketingSales'));
const FulfilmentPlan = lazy(() => import('./components/templates/FulfilmentPlan'));
const MediaPlan = lazy(() => import('./components/templates/MediaPlan'));

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
  </div>
);

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
    case '/facebook-callback':
      return 'Facebook Authentication';
    default:
      return '';
  }
};

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Public Route component (for routes that should redirect to home if already authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (isAuthenticated) {
    // Redirect to home if already authenticated
    return <Navigate to="/home" replace />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  const { isDarkMode } = useTheme();

  return (
    <Router>
<<<<<<< HEAD
      <InnerApp isDarkMode={isDarkMode} />
=======
      <div className={`flex flex-col min-h-screen ${isDarkMode ? 'dark bg-navy-blue text-white' : 'bg-white text-navy-blue'}`}>
        <Header getPageTitle={getPageTitle} />
        <main className="flex-grow mt-16 mb-16">
          <Routes>
            {/* Public Routes - Redirect to home if already authenticated */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={
              <PublicRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <Login />
                </Suspense>
              </PublicRoute>
            } />
            <Route path="/signin" element={
              <PublicRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <SignIn />
                </Suspense>
              </PublicRoute>
            } />

            <Route path="/onboarding" element={
              <Suspense fallback={<LoadingSpinner />}>
                <UserOnboarding />
              </Suspense>
            } />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/what-to-expect" element={<WhatToExpect />} />
            <Route path="/trial-signup" element={
              <Suspense fallback={<LoadingSpinner />}>
                <TrialSignupPage />
              </Suspense>
            } />
            <Route path="/trial-signup-step2" element={
              <Suspense fallback={<LoadingSpinner />}>
                <TrialSignupStep2 />
              </Suspense>
            } />
            <Route path="/trial-signup-confirmation" element={
              <Suspense fallback={<LoadingSpinner />}>
                <TrialSignupConfirmation />
              </Suspense>
            } />

            {/* Protected App Routes - Require authentication */}
            <Route path="/home" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <HomePage />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <Dashboard />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/commerce" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <Commerce />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/new-chat" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <NewChat />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/chat/:chatId" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <Chat />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/chat-history" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <ChatHistory />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/dream-team" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <DreamTeam />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/gyb-live-network" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <GYBLiveNetwork />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/user-profile/:userId" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <UserProfile />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <Profile />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <Settings />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/gyb-team-chat" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <GYBTeamChat />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <Analytics />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/upload" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <Upload />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/new-post" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <GYBMedia />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/gyb-studio" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <GYBStudio />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/facebook-api-tester" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <FacebookAPITester />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/facebook-posts" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <FacebookPostsDisplay />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/work-history" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <WorkHistory />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/invites" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <Invites />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/reviews" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <Reviews />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/rewards" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <Rewards />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/payments" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <Payments />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/earnings" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <Earnings />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/road-map" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <RoadMap />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/portfolio" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <Portfolio />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/resume" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <Resume />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/bookmarks" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <BookmarksPage />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/ai-video-avatar" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <AIVideoAvatar />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/group/create" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <CreateGroup />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/group/:groupId" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <GroupProfile />
                </Suspense>
              </ProtectedRoute>
            } />

            {/* Protected Template Routes */}
            <Route path="/templates/business-plan" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <BusinessPlan />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/templates/investor-deck" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <InvestorDeck />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/templates/market-analysis" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <MarketAnalysis />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/templates/marketing-sales" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <MarketingSales />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/templates/fulfilment-plan" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <FulfilmentPlan />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/templates/media-plan" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <MediaPlan />
                </Suspense>
              </ProtectedRoute>
            } />

            {/* Protected Settings Routes */}
            <Route path="/settings/email" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <EmailSettings />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/settings/subscription" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <SubscriptionSettings />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/settings/personalization" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <PersonalizationSettings />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/settings/data-controls" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <DataControls />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/settings/archived-chats" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <ArchivedChats />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/settings/language" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <LanguageSettings />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/settings/spelling" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <SpellingSettings />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/settings/updates" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <UpdatesSettings />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/settings/voice" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <VoiceSettings />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/settings/main-language" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <MainLanguageSettings />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/settings/integrations" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <Integrations />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/settings/integrations/facebook" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <FacebookIntegration />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/settings/integrations/callback" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <IntegrationCallback />
                </Suspense>
              </ProtectedRoute>
            } />
                    <Route path="/callback" element={
          <Suspense fallback={<LoadingSpinner />}>
            <SpotifyCallback />
          </Suspense>
        } />
        <Route path="/facebook-callback" element={
          <Suspense fallback={<LoadingSpinner />}>
            <FacebookCallback />
          </Suspense>
        } />
        <Route path="/spotify-test" element={
          <Suspense fallback={<LoadingSpinner />}>
            <SpotifyPlaylistTest />
          </Suspense>
        } />
            <Route path="/settings/help" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <HelpCenter />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/settings/terms" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <TermsOfUse />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/settings/privacy" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <PrivacyPolicy />
                </Suspense>
              </ProtectedRoute>
            } />

            {/* Catch-all route - redirect to login for any unmatched routes */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
        <BottomMenu />
      </div>
>>>>>>> main
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