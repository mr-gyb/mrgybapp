import React from 'react';

const WhatToExpect: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        background: '#223a70',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        padding: '60px 0 0 0',
        position: 'relative',
      }}
    >
      {/* Left: Heading */}
      <div style={{ flex: 1, paddingLeft: 100 }}>
        <h1
          style={{
            fontFamily: 'Space Mono, monospace',
            fontSize: 58,
            color: '#f5e7d3',
            fontWeight: 700,
            lineHeight: 1.1,
            margin: 0,
          }}
        >
          What to<br />Expect
        </h1>
      </div>
      {/* Right: Sections */}
      <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', gap: 64, paddingRight: 100 }}>
        <div>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 35, color: '#e6d94e', fontWeight: 700, marginBottom: 8 }}>
            01 Real-Time Analytics & Content Insights
          </div>
          <div style={{ fontFamily: 'Roboto Mono, monospace', fontSize: 20, color: '#fff', fontWeight: 400, lineHeight: 1.5 }}>
            Track views, engagement, and performance trends across all your uploaded content.
          </div>
        </div>
        <div>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 35, color: '#e6d94e', fontWeight: 700, marginBottom: 8 }}>
            02 Smart, Intuitive Dashboard
          </div>
          <div style={{ fontFamily: 'Roboto Mono, monospace', fontSize: 20, color: '#fff', fontWeight: 400, lineHeight: 1.5 }}>
            Organize your content by type, monitor monetization progress, and access content inspiration tailored to your brand.
          </div>
        </div>
        <div>
          <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 35, color: '#e6d94e', fontWeight: 700, marginBottom: 8 }}>
            03 Scalable Tools for Any Size Team
          </div>
          <div style={{ fontFamily: 'Roboto Mono, monospace', fontSize: 20, color: '#fff', fontWeight: 400, lineHeight: 1.5 }}>
            Whether you're a solo creator or part of a larger team, our tiered plans grow with your business needs.
          </div>
        </div>
      </div>
      {/* Fixed arrow button in bottom right */}
      <button
        style={{
          position: 'fixed',
          bottom: 80,
          right: 80,
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: 'transparent',
          border: '2px solid #fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 40,
          fontFamily: 'Space Mono, monospace',
          color: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          cursor: 'pointer',
          zIndex: 1000
        }}
        aria-label="Next"
      >
        &rarr;
      </button>
    </div>
  );
};

export default WhatToExpect; 