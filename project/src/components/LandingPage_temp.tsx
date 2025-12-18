{/*
import React from 'react';
import '../index.css';
import { Mic, Video, Plus } from 'lucide-react';
import LoginButton from './LoginButton';
import SignupButton from './SignupButton';
// (no auth hook used in this simplified header)

// Removed Google Fonts import for Space Mono and Roboto Mono
// const fontLinks = [
//   <link
//     key="space-mono"
//     href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&family=Space+Mono:wght@700&display=swap"
//     rel="stylesheet"
//   />
// ];

const LandingPage: React.FC = () => {
  // Brand colors: use project navy/blue (#3B4371) and gold (#b29958)
  // const brandGradient = 'linear-gradient(90deg, #3B4371 0%, #b29958 100%)';

  return (
    <div className="relative">
      {/* Header */}
      <header className="absolute top-0 left-0 w-full z-10 flex items-center justify-between px-6">
        <div className="flex items-center space-x-2">
          <img src="/gyb-transparent.png" alt="GYB Logo" className="h-14" />
        </div>
        <div className="space-x-4">
          <LoginButton />
          <SignupButton />
        </div>
      </header>
      <div className="min-h-screen bg-white">
        {/* Removed fontLinks */}

        {/* Top navigation removed as requested */}

        {/* Hero - large rounded panel with gradient background */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="relative overflow-hidden rounded-3xl hero-gradient-background" style={{ boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)' }}>
              <div className="relative z-10 grid grid-cols-1 items-center py-32 px-12 md:px-16 text-center">
                <div className="text-white md:pr-8 mx-auto">
                  <p className="text-3xl md:text-4xl lg:text-5xl font-extrabold" style={{ marginBottom: '1cm' }}>
                    A New Way to
                  </p>
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold">
                    Grow With AI
                  </h1>
                  <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto">
                    Stop guessing what to post. <span className="font-bold">Mr.GYB</span> analyzes your audience, defines
                    your culture, and generates high-performing scripts in seconds.
                  </p>

                  <div className="mt-8 flex justify-center">
                    <button className="px-6 py-3 rounded-full bg-[#E3C472] text-[#3B4371] font-semibold hover:bg-[#d4b566]" style={{ marginRight: '1cm' }}>
                      Sign up Today
                    </button>
                    <button className="px-6 py-3 rounded-full bg-white text-[#3B4371] font-semibold hover:bg-gray-100">
                      Watch a Demo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature sections */}
        <section id="culture" className="py-20" style={{ backgroundColor: '#E3C472' }}>
          <div className="max-w-6xl mx-auto px-6 md:flex md:Items-center md:gap-12">
            <div className="md:w-1/2">
              <h2 className="text-xl font-bold text-[#1f2a44]" style={{ fontFamily: 'Space Mono, monospace' }}>Culture (AI & Communication)</h2>
              <p className="mt-4 text-gray-700">The Culture package equips you with everything needed to build a strong and cohesive brand identity, including branding, colors, and logos. It helps you discover your brand’s voice and create a memorable presence.</p>
            </div>
            <div className="md:w-1/2 mt-6 md:mt-0">
              <div className="relative w-[220px] h-[440px] mx-auto bg-white rounded-3xl overflow-hidden" style={{ borderRadius: 28, boxShadow: '0 15px 30px rgba(0, 0, 0, 0.4)' }}>
                {/* Phone notch/speaker placeholder */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-2 bg-gray-800 rounded-b-xl z-10" />

                {/* Phone content */}
                <div className="flex flex-col h-full bg-gray-100">
                  {/* Top bar */}
                  <div className="bg-navy-blue p-3 flex items-center justify-between">
                    <div className="flex items-center space-x-0.5">
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                        <img src="/gyb-logo.png" alt="GYB Logo" className="w-full h-full rounded-full object-cover" />
                      </div>
                      <span className="text-white font-semibold text-xs">Community</span>
                    </div>
                    <div className="w-6 h-6 rounded-full overflow-hidden">
                      <img src="https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y" alt="Kevin Lee Profile Pic" className="w-full h-full object-cover" />
                    </div>
                  </div>

                  {/* Chat header */}
                  <div className="bg-[#3B4371] p-1 flex items-center justify-between text-white">
                    <div className="flex items-center space-x-0.5">
                      <span className="text-xs">New Chat</span>
                    </div>
                    <div className="flex items-center space-x-0.5">
                      <button className="flex items-center space-x-0.5 px-1 py-0.5 rounded-full bg-white text-[#3B4371] text-xs">
                        <span>Rachel</span>
                      </button>
                      <button className="flex items-center space-x-0.5 px-1 py-0.5 rounded-full bg-[#E3C472] text-white text-xs">
                        <span>New Chat</span>
                      </button>
                    </div>
                  </div>

                  {/* Chat messages */}
                  <div className="flex-grow p-1 space-y-1 overflow-y-auto">
                    {/* User message */}
                    <div className="flex justify-end">
                      <div className="bg-[#E3C472] text-white p-1 rounded-lg max-w-[70%] text-xs">
                        what is your specialist?
                      </div>
                    </div>

                    {/* AI response */}
                    <div className="flex justify-start items-start space-x-0.5">
                      <div className="bg-[#3B4371] text-white p-1 rounded-lg max-w-[70%] text-xs">
                        My name is Rachel, and I'm a specialist in various areas of marketing, including:
                        <ol className="list-decimal list-inside mt-0.5 space-y-0.5">
                          <li>
                            <span className="font-bold">🎯 Marketing Strategy:</span> Developing go-to-market strategies, advising on
                            campaign planning, and defining marketing objectives.
                          </li>
                          <li>
                            <span className="font-bold">🌟 Brand Management:</span> Helping to
                            define brand voice, ensuring
                            consistency, and advising on
                            rebranding efforts.
                          </li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  {/* Chat input */}
                  <div className="bg-white p-2 flex items-center space-x-1">
                    <button className="p-0.5 rounded-full bg-gray-200">
                      <Plus size={12} color="#4B5563" />
                    </button>
                    <input type="text" placeholder="Message" className="flex-grow p-0.5 rounded-full bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3B4371] text-xs" />
                    <button className="p-0.5 rounded-full bg-gray-200">
                      <Mic size={12} color="#4B5563" />
                    </button>
                    <button className="p-0.5 rounded-full bg-gray-200">
                      <Video size={12} color="#4B5563" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="content" className="py-20 bg-[#11335d]">
          <div className="max-w-6xl mx-auto px-6 md:flex md:items-center md:gap-12">
            <div className="md:w-1/2 md:order-2">
              <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Space Mono, monospace' }}>Content (Creation & Management)</h2>
              <p className="mt-4 text-white">Comprehensive hub for content creation and analytics. It supports a diverse range of content types, from blog posts and videos to images, audio, and social media content. The platform provides sophisticated analytics tools.</p>
            </div>
            <div className="md:w-1/2 mt-6 md:mt-0 md:order-1">
              <div className="relative w-[220px] h-[400px] mx-auto bg-white rounded-3xl overflow-hidden" style={{ borderRadius: 28, boxShadow: '0 15px 30px rgba(0, 0, 0, 0.4)' }}>
                {/* Phone notch/speaker placeholder */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-2 bg-gray-800 rounded-b-xl z-10" />

                {/* Phone content */}
                <div className="flex flex-col h-full bg-white overflow-hidden">
                  <img src="/content-mobile.png" alt="Content Mobile Preview" className="w-full h-full object-contain" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="community" className="py-20" style={{ backgroundColor: '#E3C472' }}>
          <div className="max-w-6xl mx-auto px-6 md:flex md:items-center md:gap-12">
            <div className="md:w-1/2">
              <h2 className="text-xl font-bold text-[#1f2a44]" style={{ fontFamily: 'Space Mono, monospace' }}>Community (Networking & Collaboration)</h2>
              <p className="mt-4 text-gray-700">It allows users to build and maintain professional relationships through detailed user profiles and portfolios. The platform includes a professional verification system and industry-specific networking features.</p>
            </div>
            <div className="md:w-1/2 mt-6 md:mt-0">
              <div className="relative w-[220px] h-[389px] mx-auto bg-white rounded-3xl overflow-hidden" style={{ borderRadius: 28, boxShadow: '0 15px 30px rgba(0, 0, 0, 0.4)' }}>
                {/* Phone notch/speaker placeholder */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-2 bg-gray-800 rounded-b-xl z-10" />

                {/* Phone content */}
                <div className="flex flex-col h-full bg-gray-100 overflow-hidden">
                  <img src="/community-mobile.png" alt="Community Mobile Preview" className="w-full h-full object-contain" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="commerce" className="py-20 bg-[#11335d]">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Space Mono, monospace' }}>Commerce (Business & Monetization)</h2>
            <p className="mt-4 text-white max-w-3xl">The platform implements a tiered subscription model designed to accommodate businesses of various sizes and needs. The Basic tier ($29/month) provides essential features, while the Pro tier ($79/month) offers advanced capabilities, and the Enterprise tier ($199/month) delivers comprehensive solutions for large organizations.</p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border rounded-xl p-6 bg-[#E3C472] shadow-md">
                <div className="text-lg font-semibold">Basic</div>
                <div className="mt-2 text-2xl font-bold text-[#3B4371]">$29 <span className="text-sm font-medium">/month</span></div>
                <ul className="mt-4 text-sm text-gray-600 space-y-2">
                  <li>Essential features</li>
                  <li>Content tools</li>
                </ul>
              </div>

              <div className="border rounded-xl p-6 bg-[#E3C472] shadow-md">
                <div className="text-lg font-semibold">Pro</div>
                <div className="mt-2 text-2xl font-bold text-[#3B4371]">$79 <span className="text-sm font-medium">/month</span></div>
                <ul className="mt-4 text-sm text-gray-600 space-y-2">
                  <li>Advanced analytics</li>
                  <li>Team collaboration</li>
                </ul>
              </div>

              <div className="border rounded-xl p-6 bg-[#E3C472] shadow-md">
                <div className="text-lg font-semibold">Enterprise</div>
                <div className="mt-2 text-2xl font-bold text-[#3B4371]">$199 <span className="text-sm font-medium">/month</span></div>
                <ul className="mt-4 text-sm text-gray-600 space-y-2">
                  <li>Custom integrations</li>
                  <li>Dedicated support</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LandingPage;
*/}
