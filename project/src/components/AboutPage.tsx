import React from 'react';
import { useNavigate } from 'react-router-dom';

const fontLinks = [
  <link
    key="space-mono"
    href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&family=Space+Mono:wght@700&display=swap"
    rel="stylesheet"
  />
];

const aboutText = `MR.GYB AI is an all-in-one content management and analytics platform designed to help creators, marketers, and businesses streamline their content workflow. Whether you're uploading blog posts, social media content, videos, or audio, our AI-powered tools make it easy to manage, analyze, and grow your digital presence — all from one smart dashboard.\nFrom ideation to impact, MR.GYB AI helps you track performance, optimize your strategy, and unlock insights that fuel better decisions.`;

const AboutPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <>
      {fontLinks}
      <div className="w-full flex flex-row items-center gap-8 mb-8" style={{paddingTop: 32, paddingLeft: 32}}>
        <button
          style={{
            fontFamily: 'Space Mono, monospace',
            fontSize: 22,
            fontWeight: 700,
            color: '#111',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '0 16px',
          }}
        >
          
        </button>
        <button
          style={{
            fontFamily: 'Space Mono, monospace',
            fontSize: 22,
            fontWeight: 700,
            color: '#111',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '0 16px',
          }}
        >
          
        </button>
      </div>
      <div className="min-h-screen w-full flex flex-col items-center justify-start px-4 md:px-16 py-10 bg-white">
        <div className="w-full max-w-7xl flex flex-col md:flex-row items-start justify-between">
          {/* Left: Heading and Images + About Text */}
          <div className="flex-1 flex flex-col items-start">
            <h1
              style={{
                fontFamily: 'Space Mono, monospace',
                fontSize: '58px',
                fontWeight: 700,
                marginBottom: '2.5rem',
                color: '#111',
                lineHeight: 1.1,
                textAlign: 'left',
              }}
            >
              About<br />MR.GYB AI
            </h1>
            <div className="flex flex-row items-center gap-12">
              <div
                className="relative"
                style={{ width: 600, height: 320 }}
              >
                <img
                  src="/group-circle.png"
                  alt="Team working together"
                  className="w-[180px] h-[180px] object-cover rounded-[32px] absolute left-0 top-0 shadow-lg"
                  style={{ borderRadius: '32px', zIndex: 2 }}
                />
                <img
                  src="/girl-boy-phone.jpg"
                  alt="People collaborating"
                  className="w-[260px] h-[260px] object-cover rounded-[32px] absolute left-[220px] top-[100px] shadow-lg"
                  style={{ borderRadius: '32px', zIndex: 1 }}
                />
              </div>
              <div
                style={{
                  fontFamily: 'Roboto Mono, monospace',
                  fontSize: '22px',
                  color: '#111',
                  fontWeight: 400,
                  lineHeight: 1.5,
                  whiteSpace: 'pre-line',
                  maxWidth: 600,
                  textAlign: 'left',
                  marginTop: 0,
                }}
              >
                MR.GYB AI is an all-in-one content management and analytics platform designed to help creators, marketers, and businesses streamline their content workflow. Whether you're uploading blog posts, social media content, videos, or audio, our AI-powered tools make it easy to manage, analyze, and grow your digital presence — all from one smart dashboard.

                <br /><br />

                From ideation to impact, MR.GYB AI helps you track performance, optimize your strategy, and unlock insights that fuel better decisions.
              </div>
            </div>
          </div>
          {/* Remove the right about text column */}
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
          background: '#fff',
          border: '2px solid #111',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 40,
          fontFamily: 'Space Mono, monospace',
          color: '#111',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          cursor: 'pointer',
          zIndex: 1000
        }}
        aria-label="Next"
        onClick={() => navigate('/what-to-expect')}
      >
        &rarr;
      </button>
    </>
  );
};

export default AboutPage; 