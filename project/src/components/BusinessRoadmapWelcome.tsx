import React from 'react';
import { useNavigate } from 'react-router-dom';
import roadmapImg from './images/roadmap.png';
import gybLogo from './images/gyblogo.png';
import './Roadmap.css';

const BusinessRoadmapWelcome: React.FC = () => {
  const navigate = useNavigate();

  const handleLetsGo = () => {
    navigate('/lets-begin');
  };

  return (
    <div className="roadmap-container">
      {/* GYB Logo - Top Left */}
      <div className="gyb-logo">
        <img 
          src={gybLogo} 
          alt="GYB Logo"
        />
      </div>

      <div className="content-wrapper">
        <div className="grid-container">
          {/* Left: Roadmap Image - Positioned at bottom */}
          <div className="roadmap-image-container">
            <img 
              src={roadmapImg} 
              alt="Business roadmap"
              className="roadmap-image"
            />
          </div>

          {/* Right: Text Content */}
          <div className="text-content-container">
            <div className="text-content-box">
              <h1 className="main-heading">
                START YOUR PATH TO
                <br />
                <span className="business-growth-text">BUSINESS GROWTH!</span>
              </h1>

              <p className="description-text">
                Take the quiz below to get started.
              </p>

              <button 
                onClick={handleLetsGo}
                className="quiz-button"
              >
                BEGIN QUIZ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessRoadmapWelcome;