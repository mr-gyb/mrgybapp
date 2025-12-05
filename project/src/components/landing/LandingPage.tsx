import React from 'react';
import HeroSection from './HeroSection';
import FeatureBlocks from './FeatureBlocks';
import TestimonialSection from './TestimonialSection';
import SignUpCTA from './SignUpCTA';
import Footer from './Footer';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <FeatureBlocks />
      <TestimonialSection />
      <SignUpCTA />
      <Footer />
    </div>
  );
};

export default LandingPage;

