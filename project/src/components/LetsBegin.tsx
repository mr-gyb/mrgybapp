import React from 'react';
import { useNavigate } from 'react-router-dom';

const LetsBegin: React.FC = () => {
  const navigate = useNavigate();

  const handleNext = () => {
    navigate('/assessment');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#11335d',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      {/* Title */}
      <h1 style={{
        fontSize: '3.5rem',
        color: 'white',
        fontFamily: 'serif',
        marginBottom: '2rem',
        textAlign: 'center',
        fontWeight: 'normal'
      }}>
        Let's Begin!
      </h1>

      {/* Description */}
      <p style={{
        fontSize: '1.25rem',
        color: 'white',
        fontFamily: 'serif',
        textAlign: 'center',
        marginBottom: '3rem',
        maxWidth: '600px',
        lineHeight: '1.6'
      }}>
        we will either create an in page intake assessment or create one in ghl and embed it inside the app.
      </p>

      {/* Next Button */}
      <button
        onClick={handleNext}
        style={{
          backgroundColor: '#e3c472',
          color: '#11335d',
          border: '1px solid #11335d',
          padding: '1rem 2.5rem',
          borderRadius: '0.5rem',
          fontSize: '1.125rem',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          cursor: 'pointer',
          transition: 'background-color 0.2s, transform 0.1s',
          fontFamily: 'sans-serif'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#d4b85a';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#e3c472';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        NEXT
      </button>
    </div>
  );
};

export default LetsBegin;
