import React from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';

const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen bg-white flex items-center justify-center px-4 sm:px-6 lg:px-8" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif', paddingTop: '80px', paddingBottom: '80px' }}>
      {/* Header - Logo left, buttons top-right */}
      <header className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 sm:px-8 lg:px-12 py-6 z-20">
        {/* Logo - Left */}
        <div className="flex items-center">
          <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full border-2 border-[#C4A64D] flex items-center justify-center">
            <span className="text-xl sm:text-2xl font-bold text-[#C4A64D]">GYB</span>
          </div>
        </div>
        
        {/* Login & Sign Up Buttons - Top Right */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            to="/login"
            className="px-4 sm:px-6 py-2 sm:py-2.5 bg-[#D9B45F] text-[#0A2342] rounded-full font-medium text-sm sm:text-base hover:bg-[#C4A64D] transition-all duration-200"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="px-4 sm:px-6 py-2 sm:py-2.5 bg-[#0A2342] text-white rounded-full font-medium text-sm sm:text-base hover:bg-[#0C2A4F] transition-all duration-200"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* Hero Box - Centered gradient box with rounded corners */}
      <div className="w-full max-w-5xl mx-auto mt-20 sm:mt-24">
        <div 
          className="rounded-[30px] p-8 sm:p-12 md:p-16 lg:p-20 text-white"
          style={{
            background: 'linear-gradient(to right, #0A2342 0%, #C4A64D 100%)',
          }}
        >
          {/* Hero Content */}
          <div className="max-w-3xl mx-auto text-center">
            {/* Title */}
            <h2 className="text-xl sm:text-2xl md:text-3xl font-normal mb-4 sm:mb-6 text-white/90">
              A New Way to
            </h2>
            
            {/* Big Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 leading-tight text-white">
              Grow With AI
            </h1>
            
            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl mb-8 sm:mb-10 md:mb-12 text-white/95 max-w-2xl mx-auto leading-relaxed">
              Stop guessing what to post. Mr.GYB analyzes your audience, defines your culture, and generates high-performing scripts in seconds.
            </p>

            {/* CTA Buttons - Side by side, centered */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              {/* Sign up Today - Gold background */}
              <Link
                to="/signup"
                className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-3.5 bg-[#D9B45F] text-[#0A2342] rounded-full font-semibold text-base sm:text-lg hover:bg-[#C4A64D] transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Sign up Today
              </Link>
              
              {/* Watch a Demo - White background, gray outline */}
              <button className="w-full sm:w-auto px-8 sm:px-10 py-3 sm:py-3.5 bg-white border-2 border-gray-300 text-gray-700 rounded-full font-semibold text-base sm:text-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
                <Play size={20} className="text-gray-700" />
                Watch a Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
