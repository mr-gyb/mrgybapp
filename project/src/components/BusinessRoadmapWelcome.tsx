import React from 'react';
import { useNavigate } from 'react-router-dom';
import roadmapImg from './images/roadmap.png';
import './Roadmap.css';

const BusinessRoadmapWelcome: React.FC = () => {
  const navigate = useNavigate();

  const handleLetsGo = () => {
    navigate('/lets-begin');
  };

  return (
    <div className="roadmap-container">
      {/* GYB Logo - Top Left */}

      <div className="content-wrapper">
        <div className="grid-container">
          {/* Text Content - Centered */}
          <div className="text-content-container">
            <div className="text-content-box">
              <h1 className="main-heading">
                START YOUR PATH TO
                <br />
                <span className="business-growth-text">BUSINESS GROWTH!</span>
              </h1>

              <p className="description-text">
                Click below to begin the assessment. Please note that this assessment is not meant to serve as legal business advice but rather to help you get a deeper understanding of your business and how to navigate the different milestones inspired by Chris&apos;s exclusive 4C&apos;s formula.
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