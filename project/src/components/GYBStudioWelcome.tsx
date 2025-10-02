import React from 'react';
import { Link } from 'react-router-dom';
import clipImage from './images/clip.png';

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
           <h1 
             className="text-white mb-4 leading-tight"
             style={{
               fontFamily: 'LASTICA',
               fontSize: '60px',
               fontWeight: 'normal'
             }}
           >
             WELCOME TO
           </h1>
           <h1 
             className="text-white leading-tight"
             style={{
               fontFamily: 'LASTICA',
               fontSize: '60px',
               fontWeight: 'normal'
             }}
           >
             THE GYB STUDIO!
           </h1>
         </div>

        {/* Action Buttons */}
        <div className="flex space-x-6">
          <Link
            to="/gyb-studio/create"
            className="px-6 py-3 bg-transparent border-2 border-black rounded text-white font-semibold text-lg hover:bg-white hover:text-black transition-all duration-200 text-center"
            style={{ width: 'fit-content', minWidth: '120px' }}
          >
            Create
          </Link>
          <Link
            to="/gyb-studio"
            className="px-6 py-3 bg-transparent border-2 border-black rounded text-white font-semibold text-lg hover:bg-white hover:text-black transition-all duration-200 text-center"
            style={{ width: 'fit-content', minWidth: '120px' }}
          >
            Analyze
          </Link>
        </div>
      </div>

      {/* Right Clip Image with Premium Animation System */}
      <div className="absolute right-0 top-0 w-1/2 h-full flex items-center justify-center pr-16 z-10">
        <div className="relative group">
          
          {/* Clip Image with Clapperboard Clapping Animation */}
          <img 
            src={clipImage} 
            alt="GYB Studio Clip"
            className="w-full h-auto object-contain opacity-90 transform transition-all duration-1000 group-hover:scale-125 group-hover:opacity-100 relative z-10"
            style={{
              maxWidth: '400px',
              maxHeight: '400px',
              filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))',
              mixBlendMode: 'multiply',
              transformOrigin: 'bottom center',
              animation: 'clapperboardClapping 3s ease-in-out infinite, clipGlow 2s ease-in-out infinite alternate'
            }}
          />
          
          {/* Enhanced Floating Particles System */}
          <div className="absolute top-2 right-2 w-3 h-3 bg-white/70 rounded-full animate-ping" style={{ animationDelay: '0s', animationDuration: '2s' }}></div>
          <div className="absolute top-6 right-6 w-2 h-2 bg-white/50 rounded-full animate-ping" style={{ animationDelay: '0.5s', animationDuration: '2.5s' }}></div>
          <div className="absolute top-10 right-10 w-1.5 h-1.5 bg-white/60 rounded-full animate-ping" style={{ animationDelay: '1s', animationDuration: '3s' }}></div>
          <div className="absolute top-14 right-14 w-1 h-1 bg-white/40 rounded-full animate-ping" style={{ animationDelay: '1.5s', animationDuration: '2.2s' }}></div>
          <div className="absolute top-18 right-18 w-2.5 h-2.5 bg-white/30 rounded-full animate-ping" style={{ animationDelay: '2s', animationDuration: '3.5s' }}></div>
          
        </div>
      </div>
      
      {/* Premium CSS Animations for Clip */}
      <style>{`
        @keyframes clapperboardClapping {
          0%, 100% { 
            transform: rotate(0deg) translateY(0px); 
          }
          10% { 
            transform: rotate(2deg) translateY(-2px); 
          }
          20% { 
            transform: rotate(5deg) translateY(-5px); 
          }
          30% { 
            transform: rotate(8deg) translateY(-8px); 
          }
          40% { 
            transform: rotate(12deg) translateY(-10px); 
          }
          50% { 
            transform: rotate(15deg) translateY(-12px); 
          }
          60% { 
            transform: rotate(12deg) translateY(-10px); 
          }
          70% { 
            transform: rotate(8deg) translateY(-8px); 
          }
          80% { 
            transform: rotate(5deg) translateY(-5px); 
          }
          90% { 
            transform: rotate(2deg) translateY(-2px); 
          }
        }
        
        @keyframes clipGlow {
          0% { 
            filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1)) 
                   drop-shadow(0 0 15px rgba(255, 255, 255, 0.3))
                   drop-shadow(0 0 25px rgba(255, 255, 255, 0.1));
          }
          50% { 
            filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1)) 
                   drop-shadow(0 0 25px rgba(255, 255, 255, 0.5))
                   drop-shadow(0 0 40px rgba(255, 255, 255, 0.3))
                   drop-shadow(0 0 60px rgba(255, 255, 255, 0.1));
          }
          100% { 
            filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1)) 
                   drop-shadow(0 0 15px rgba(255, 255, 255, 0.3))
                   drop-shadow(0 0 25px rgba(255, 255, 255, 0.1));
          }
        }
        
        
        @keyframes particleFloat {
          0%, 100% { 
            transform: translateY(0px) scale(1); 
            opacity: 0.7;
          }
          50% { 
            transform: translateY(-20px) scale(1.2); 
            opacity: 1;
          }
        }
        
        .group:hover .animate-ping {
          animation: particleFloat 2s ease-in-out infinite;
        }
      `}</style>

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
