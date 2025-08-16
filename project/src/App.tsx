import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { useTheme } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import BottomMenu from './components/BottomMenu';

// Lazy load components for code splitting
const Login = lazy(() => import('./components/Auth/Login'));
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
    case '/home':
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
    </Router>
  );
};

export default App;