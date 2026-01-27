import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Roadmap.css';

const BusinessRoadmapWelcome: React.FC = () => {
  const navigate = useNavigate();
  const blocks = Array.from({ length: 8 }, (_, index) => index);

  const handleLetsGo = () => {
    navigate('/lets-begin');
  };

  return (
    <div className="roadmap-container">
      <div className="roadmap-content">
        <h1 className="roadmap-title">START YOUR PATH TO BUSINESS GROWTH!</h1>

        <div className="carousel">
          <div className="carousel-track">
            {blocks.concat(blocks).map((block, index) => (
              <div key={`${block}-${index}`} className="carousel-card" />
            ))}
          </div>
        </div>

        <button onClick={handleLetsGo} className="quiz-button">
          BEGIN QUIZ!
        </button>
      </div>
    </div>
  );
};

export default BusinessRoadmapWelcome;