import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Header from './components/Header';
import BottomMenu from './components/BottomMenu';
import MainLayout from './components/MainLayout';

// Lazy load components for code splitting
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoadingSpinner = lazy(() => import('./components/LoadingSpinner'));

const getPageTitle = (path: string) => {
  switch (path) {
    case '/':
      return 'Home';
    case '/about':
      return 'About';
    case '/contact':
      return 'Contact';
    case '/services':
      return 'Services';
    case '/portfolio':
      return 'Portfolio';
    case '/blog':
      return 'Blog';
    default:
      return 'Page Not Found';
  }
};

const App: React.FC = () => {
  return (
    <Router>
      <MainLayout getPageTitle={getPageTitle}>
        <Routes>
          {/* Public Routes - Redirect to home if already authenticated */}
          <Route path="/" element={
            <Suspense fallback={<LoadingSpinner />}>
              <LandingPage />
            </Suspense>
          } />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <BottomMenu />
      </MainLayout>
    </Router>
  );
};

const AboutPage = () => {
  return (
    <div>
      <h1>About Us</h1>
      <p>This is the about page content.</p>
    </div>
  );
};

const ContactPage = () => {
  return (
    <div>
      <h1>Contact Us</h1>
      <p>This is the contact page content.</p>
    </div>
  );
};

const ServicesPage = () => {
  return (
    <div>
      <h1>Our Services</h1>
      <p>This is the services page content.</p>
    </div>
  );
};

const PortfolioPage = () => {
  return (
    <div>
      <h1>Our Portfolio</h1>
      <p>This is the portfolio page content.</p>
    </div>
  );
};

const BlogPage = () => {
  return (
    <div>
      <h1>Our Blog</h1>
      <p>This is the blog page content.</p>
    </div>
  );
};

export default App;

