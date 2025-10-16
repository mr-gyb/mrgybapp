import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useTheme } from './contexts/ThemeContext';
import Header from './components/Header';
import BottomMenu from './components/BottomMenu';

// Lazy load components for code splitting
const CommunityTab = lazy(() => import('./components/content/CommunityTab'));
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
const GYBStudioWelcome = lazy(() => import('./components/GYBStudioWelcome'));
const VideoUploadPage = lazy(() => import('./components/VideoUploadPage'));
const SummaryPage = lazy(() => import('./components/SummaryPage'));
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
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));
const Login = lazy(() => import('./components/Login'));
const BusinessRoadmapWelcome = lazy(() => import('./components/BusinessRoadmapWelcome'));
const LetsBegin = lazy(() => import('./components/LetsBegin'));
const Assessment = lazy(() => import('./components/Assessment'));
const TestImage = lazy(() => import('./components/TestImage'));

// Loading spinner component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
  </div>
);


// Get page title based on current route
const getPageTitle = (pathname: string): string => {
  const titleMap: { [key: string]: string } = {
    '/': 'Home',
    '/home': 'Home',
    '/analytics': 'Analytics',
    '/roadmap': 'RoadMap',
    '/settings': 'Settings',
    '/new-chat': 'Culture',
    '/chat-history': 'Culture',
    '/new-post': 'Content',
    '/upload': 'Content',
    '/gyb-media': 'Content',
    '/gyb-studio': 'Content',
    '/gyb-studio-welcome': 'Content',
    '/gyb-live-network': 'Community',
    '/dream-team': 'Community',
    '/gyb-team-chat': 'Community',
    '/profile': 'Community',
    '/community': 'Community',
    '/dashboard': 'Commerce',
    '/commerce': 'Commerce',
    '/work-history': 'Commerce',
    '/invites': 'Commerce',
    '/reviews': 'Commerce',
    '/rewards': 'Commerce',
    '/payments': 'Commerce',
    '/earnings': 'Commerce'
  };
  
  // Check if pathname matches chat route pattern (/chat/:chatId)
  if (pathname.startsWith('/chat/')) {
    return 'Culture';
  }
  
  // Check if pathname matches gyb-studio create route pattern
  if (pathname.startsWith('/gyb-studio/')) {
    return 'Content';
  }
  
  // Check if pathname matches user-profile route pattern
  if (pathname.startsWith('/user-profile/')) {
    return 'Community';
  }
  
  return titleMap[pathname] || 'GYB Studio';
};

const App: React.FC = () => {
  const { isDarkMode } = useTheme();

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className={`flex flex-col min-h-screen ${isDarkMode ? 'dark bg-navy-blue text-white' : 'bg-white text-navy-blue'}`}>
        <Header getPageTitle={getPageTitle} />
        <main className="flex-grow mt-16 mb-16">
          <Routes>
            {/* Public Routes - Redirect to home if already authenticated */}
            <Route path="/" element={<Navigate to="/home" replace />} />

            <Route path="/login" element={
              <Suspense fallback={<LoadingSpinner />}>
                <Login />
              </Suspense>
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
            <Route path="/business-roadmap-welcome" element={<BusinessRoadmapWelcome />} />
            <Route path="/lets-begin" element={
              <Suspense fallback={<LoadingSpinner />}>
                <LetsBegin />
              </Suspense>
            } />
            <Route path="/assessment" element={
              <Suspense fallback={<LoadingSpinner />}>
                <Assessment />
              </Suspense>
            } />
            <Route path="/test-image" element={
              <Suspense fallback={<LoadingSpinner />}>
                <TestImage />
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
            <Route path="/community" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <CommunityTab />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/user-profile" element={
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
            <Route path="/gyb-media" element={
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
            <Route path="/gyb-studio-welcome" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <GYBStudioWelcome />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/gyb-studio/create" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <VideoUploadPage />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/summary" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <SummaryPage />
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
            <Route path="/facebook-posts-display" element={
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
            <Route path="/roadmap" element={
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
            <Route path="/email-settings" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <EmailSettings />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/subscription-settings" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <SubscriptionSettings />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/personalization-settings" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <PersonalizationSettings />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/data-controls" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <DataControls />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/archived-chats" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <ArchivedChats />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/language-settings" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <LanguageSettings />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/spelling-settings" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <SpellingSettings />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/updates-settings" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <UpdatesSettings />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/voice-settings" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <VoiceSettings />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/main-language-settings" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <MainLanguageSettings />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/integrations" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <Integrations />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/help-center" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <HelpCenter />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/terms-of-use" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <TermsOfUse />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/privacy-policy" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <PrivacyPolicy />
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
            <Route path="/create-group" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <CreateGroup />
                </Suspense>
              </ProtectedRoute>
            } />
            <Route path="/group-profile" element={
              <ProtectedRoute>
                <Suspense fallback={<LoadingSpinner />}>
                  <GroupProfile />
                </Suspense>
              </ProtectedRoute>
            } />

            {/* Catch-all route - redirect to home for any unmatched routes */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </main>
        <BottomMenu />
      </div>
    </Router>
  );
};

export default App;