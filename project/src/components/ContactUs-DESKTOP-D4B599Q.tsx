import React from 'react';

const ContactUs: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(90deg, #283a70 0%, #b29958 100%)',
        padding: 0,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'row', width: '90%', maxWidth: 1400, justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Left: Heading and Button */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <h1
            style={{
              fontFamily: 'Space Mono, monospace',
              fontSize: 58,
              color: '#f5e7d3',
              fontWeight: 700,
              marginBottom: 48,
              lineHeight: 1.1,
            }}
          >
            Ready to<br />Connect?
          </h1>
          <button
            style={{
              fontFamily: 'Roboto Mono, monospace',
              fontSize: 18,
              color: '#fff',
              background: '#111',
              border: 'none',
              borderRadius: 40,
              padding: '20px 56px',
              fontWeight: 400,
              letterSpacing: 2,
              marginBottom: 24,
              cursor: 'pointer',
              boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            }}
          >
            RESERVE YOUR SPOT
          </button>
        </div>
        {/* Right: Contact Details */}
        <div style={{ flex: 1, color: '#f5e7d3', fontFamily: 'Roboto Mono, monospace', fontSize: 18, fontWeight: 400, display: 'flex', flexDirection: 'column', gap: 64 }}>
          <div>
            <div style={{ fontSize: 32, fontFamily: 'Space Mono, monospace', marginBottom: 8 }}>Mailing Address</div>
            <div>123 Anywhere St., Any City, State,<br />Country 12345</div>
          </div>
          <div>
            <div style={{ fontSize: 32, fontFamily: 'Space Mono, monospace', marginBottom: 8 }}>Email Address</div>
            <div>hello@reallygreatsite.com</div>
          </div>
          <div>
            <div style={{ fontSize: 32, fontFamily: 'Space Mono, monospace', marginBottom: 8 }}>Phone Number</div>
            <div>(123) 456 7890</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs; 