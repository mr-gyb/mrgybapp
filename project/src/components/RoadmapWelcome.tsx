import React from 'react';
import { useNavigate } from 'react-router-dom';

const RoadmapWelcome: React.FC = () => {
  const navigate = useNavigate();

  const handleLetsGo = () => {
    navigate('/lets-begin');
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(180deg, #11335d 0%, #e3c472 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      boxSizing: 'border-box'
    }}>
      <div style={{
        display: 'flex',
        width: '100%',
        maxWidth: '1200px',
        gap: '4rem',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        {/* Left Column - Content */}
        <div style={{
          flex: '1',
          minWidth: '300px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '2rem 0'
        }}>
          <h1 style={{ 
            fontSize: 'clamp(2rem, 5vw, 4rem)', 
            color: 'white', 
            marginBottom: '1.5rem',
            fontFamily: 'serif',
            lineHeight: '1.2',
            fontWeight: 'bold'
          }}>
            Welcome to Your Business Roadmap!
          </h1>
          
          <p style={{ 
            fontSize: 'clamp(1rem, 2.5vw, 1.5rem)', 
            color: 'white', 
            marginBottom: '2.5rem',
            fontFamily: 'sans-serif',
            lineHeight: '1.5'
          }}>
            Take the quiz below to get started.
          </p>
          
          <button 
            onClick={handleLetsGo}
            style={{
              backgroundColor: 'white',
              color: 'black',
              border: '2px solid #11335d',
              padding: '1rem 2.5rem',
              borderRadius: '0.5rem',
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontFamily: 'sans-serif'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.borderColor = '#11335d';
            }}
          >
            Let's Go
          </button>
        </div>

        {/* Right Column - Image Placeholder */}
        <div style={{
          flex: '1',
          minWidth: '300px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 0'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '500px',
            height: '400px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '2px dashed rgba(255, 255, 255, 0.3)',
            borderRadius: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)'
          }}>
            <p style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '1.25rem',
              fontFamily: 'sans-serif',
              textAlign: 'center'
            }}>
              Image Placeholder
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapWelcome;
