import React from 'react';
import { useNavigate } from 'react-router-dom';

const TrialSection: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStartedClick = () => {
    navigate('/trial-signup');
  };

  return (
    <>
      <div className="bg-black rounded-lg shadow-lg border border-gray-800 p-8 w-full">
        {/* Main Content */}
        <div className="text-center">
          {/* Main Headline */}
          <h2 className="text-4xl font-bold text-white mb-4">
            Start your free website trial today
          </h2>
          
          {/* Sub-text */}
          <p className="text-lg text-white mb-8">
            No credit card required. Cancel anytime.
          </p>
          
          {/* CTA Button */}
          <button 
            onClick={handleGetStartedClick}
            className="bg-white text-black font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-lg"
          >
            GET STARTED
          </button>
        </div>
      </div>
    </>
  );
};

export default TrialSection; 