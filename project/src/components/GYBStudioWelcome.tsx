import React from 'react';
import { Link } from 'react-router-dom';

const GYBStudioWelcome: React.FC = () => {
  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{
        background: `linear-gradient(180deg, #11335d 0%, #e3c472 100%)`
      }}
    >
      {/* Left Content Section */}
      <div className="absolute left-0 top-0 w-1/2 h-full flex flex-col justify-center pl-16 pr-8 z-10">
        {/* Welcome Text */}
        <div className="mb-12">
          <h1 className="text-6xl font-bold text-white mb-4 leading-tight">
            WELCOME TO
          </h1>
          <h1 className="text-6xl font-bold text-white leading-tight">
            THE GYB STUDIO!
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-6">
          <Link
            to="/gyb-studio/create"
            className="px-8 py-4 bg-black border-2 border-black rounded-lg text-white font-semibold text-lg hover:bg-white hover:text-black transition-all duration-200 flex-1 text-center"
          >
            Create
          </Link>
          <Link
            to="/gyb-studio"
            className="px-8 py-4 bg-black border-2 border-black rounded-lg text-white font-semibold text-lg hover:bg-white hover:text-black transition-all duration-200 flex-1 text-center"
          >
            Analyze
          </Link>
        </div>
      </div>

      {/* Right Clapperboard Icon */}
      <div className="absolute right-0 top-0 w-1/2 h-full flex items-center justify-center pr-16 z-10">
        <div className="relative">
          {/* Minimalist White Clapperboard with Black Stripes */}
          <div className="w-96 h-96 relative">
            {/* Main Board (White Rectangle with Black Stripes) */}
            <div className="absolute bottom-16 left-16 w-80 h-64 bg-white rounded-lg">
              {/* Black Stripes on the main board */}
              <div className="absolute top-0 left-0 w-full h-full">
                <div className="h-1/6 bg-black mb-1"></div>
                <div className="h-1/6 bg-black mb-1"></div>
                <div className="h-1/6 bg-black mb-1"></div>
                <div className="h-1/6 bg-black mb-1"></div>
                <div className="h-1/6 bg-black mb-1"></div>
                <div className="h-1/6 bg-black"></div>
              </div>
            </div>
            
            {/* Clapstick (White with Black Stripes, Angled) */}
            <div className="absolute top-16 right-16 w-80 h-32 transform rotate-15 origin-bottom-left">
              <div className="w-full h-full bg-white rounded-lg relative">
                {/* Black Stripes on the clapstick */}
                <div className="absolute top-0 left-0 w-full h-full">
                  <div className="h-1/6 bg-black mb-1"></div>
                  <div className="h-1/6 bg-black mb-1"></div>
                  <div className="h-1/6 bg-black mb-1"></div>
                  <div className="h-1/6 bg-black mb-1"></div>
                  <div className="h-1/6 bg-black mb-1"></div>
                  <div className="h-1/6 bg-black"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Pattern Overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, #ffffff 1px, transparent 1px),
                           radial-gradient(circle at 75% 75%, #ffffff 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>
    </div>
  );
};

export default GYBStudioWelcome;
