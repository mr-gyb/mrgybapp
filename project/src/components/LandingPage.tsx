import React from 'react';
import '../index.css';
import { Mic, Video, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// (no auth hook used in this simplified header)

// Google Fonts import for Space Mono and Roboto Mono
const fontLinks = [
  <link
    key="space-mono"
    href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&family=Space+Mono:wght@700&display=swap"
    rel="stylesheet"
  />
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  // Brand colors: use project navy/blue (#3B4371) and gold (#b29958)
  // const brandGradient = 'linear-gradient(90deg, #3B4371 0%, #b29958 100%)';

  return (
    <div>
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img src="/gyb-logo.png" alt="GYB Logo" className="h-14" />
        </div>
        <div className="space-x-4">
          <button
            className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
            onClick={() => navigate('/login')}
          >
            Login
          </button>
          <button
            className="px-4 py-2 rounded-full bg-[#3B4371] text-white font-medium hover:bg-[#4B5563]"
            onClick={() => navigate('/trial-signup')}
          >
            Sign Up
          </button>
        </div>
      </header>
      <div className="min-h-screen bg-gray-50">
        {fontLinks}

        {/* Top navigation removed as requested */}

        {/* Hero - large rounded panel with wave background and layered phone mockup (matches screenshot) */}
        <section className="pb-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="relative">
              {/* Rounded panel */}
              <div className="relative overflow-hidden rounded-2xl animate-gradient" style={{ borderRadius: 24 }}>
                <svg className="absolute left-0 top-0 h-full w-1/2 opacity-40" viewBox="0 0 600 400" preserveAspectRatio="none">
                  <path d="M0,200 C150,100 300,300 600,200 L600,400 L0,400 Z" fill="rgba(255,255,255,0.06)" />
                </svg>

                <div className="relative z-10 grid grid-cols-1 items-center py-56 px-12 md:px-16">
                  <div className="text-white md:pr-8">
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold leading-tight" style={{ fontFamily: 'Space Mono, monospace' }}>
                      A New Way to Grow with AI
                    </h1>
                    <p className="mt-4 text-xs md:text-sm max-w-xl" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                      Culture, Content, Community, and Commerce — all powered by advanced AI to help creators and teams scale.
                    </p>

                    {/* <div className="mt-8">
                      <a className="inline-flex items-center gap-3 bg-white text-[#3B4371] px-5 py-3 rounded-full font-semibold shadow-md" href="/signup">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <rect width="18" height="12" x="3" y="6" rx="3" fill="#3B4371" />
                          <path d="M6 11h12" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Get the App
                      </a>
                    </div> */}
                  </div>
                  {/* Right column for the GYB logo */}
                  {/* <div className="flex items-center justify-center md:justify-end absolute right-16 top-1/2 transform -translate-y-1/2">
                    <img src="/gyb-logo.png" alt="GYB Logo" className="h-48 opacity-75" />
                  </div> */}
                </div>
                {/* bottom pale strip */}
                <div className="h-6 bg-white/10" />
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
                      <span className="text-white font-semibold text-xs">Culture</span>
                    </div>
                    <div className="w-6 h-6 rounded-full overflow-hidden">
                      <img src="https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y" alt="Kevin Lee Profile Pic" className="w-full h-full object-cover" />
                    </div>
                  </div>

                  {/* Chat header */}
                  <div className="bg-[#3B4371] p-1 flex items-center justify-between text-white">
                    <div className="flex items-center space-x-0.5">
                      {/* <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <span className="text-[#3B4371] text-xs font-bold">-</span>
                      </div> */}
                      <span className="text-xs">New Chat</span>
                    </div>
                    <div className="flex items-center space-x-0.5">
                      <button className="flex items-center space-x-0.5 px-1 py-0.5 rounded-full bg-white text-[#3B4371] text-xs">
                        {/* <img src="https://i.ibb.co/MhR4S14/Edit.png" alt="Edit Icon" className="w-4 h-4" /> */}
                        <span>Rachel</span>
                        {/* <img src="https://i.ibb.co/q1zC1wR/Down.png" alt="Dropdown Icon" className="w-3 h-3" /> */}
                      </button>
                      <button className="flex items-center space-x-0.5 px-1 py-0.5 rounded-full bg-[#E3C472] text-white text-xs">
                        {/* <img src="https://i.ibb.co/9v83f4s/Add.png" alt="Add Icon" className="w-4 h-4" /> */}
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
                      {/* <img src="https://i.ibb.co/y4L65B4/Profile-Pic.png" alt="AI Profile Pic" className="w-8 h-8 rounded-full" /> */}
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

        <section id="content" className="py-20 bg-[#f7f7fb]">
          <div className="max-w-6xl mx-auto px-6 md:flex md:items-center md:gap-12">
            <div className="md:w-1/2 md:order-2">
              <h2 className="text-xl font-bold text-[#1f2a44]" style={{ fontFamily: 'Space Mono, monospace' }}>Content (Creation & Management)</h2>
              <p className="mt-4 text-gray-700">Comprehensive hub for content creation and analytics. It supports a diverse range of content types, from blog posts and videos to images, audio, and social media content. The platform provides sophisticated analytics tools.</p>
            </div>
            <div className="md:w-1/2 mt-6 md:mt-0 md:order-1">
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
                      <span className="text-white font-semibold text-xs">Content</span>
                    </div>
                    <div className="w-6 h-6 rounded-full overflow-hidden">
                      <img src="https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y" alt="Kevin Lee Profile Pic" className="w-full h-full object-cover" />
                    </div>
                  </div>

                  {/* Chat header */}
                  <div className="bg-[#3B4371] p-1 flex items-center justify-between text-white">
                    <div className="flex items-center space-x-0.5">
                      {/* <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <span className="text-[#3B4371] text-xs font-bold">-</span>
                      </div> */}
                      <span className="text-xs">New Chat</span>
                    </div>
                    <div className="flex items-center space-x-0.5">
                      <button className="flex items-center space-x-0.5 px-1 py-0.5 rounded-full bg-white text-[#3B4371] text-xs">
                        {/* <img src="https://i.ibb.co/MhR4S14/Edit.png" alt="Edit Icon" className="w-4 h-4" /> */}
                        <span>Rachel</span>
                        {/* <img src="https://i.ibb.co/q1zC1wR/Down.png" alt="Dropdown Icon" className="w-3 h-3" /> */}
                      </button>
                      <button className="flex items-center space-x-0.5 px-1 py-0.5 rounded-full bg-[#E3C472] text-white text-xs">
                        {/* <img src="https://i.ibb.co/9v83f4s/Add.png" alt="Add Icon" className="w-4 h-4" /> */}
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
                      {/* <img src="https://i.ibb.co/y4L65B4/Profile-Pic.png" alt="AI Profile Pic" className="w-8 h-8 rounded-full" /> */}
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

        <section id="community" className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6 md:flex md:items-center md:gap-12">
            <div className="md:w-1/2">
              <h2 className="text-xl font-bold text-[#1f2a44]" style={{ fontFamily: 'Space Mono, monospace' }}>Community (Networking & Collaboration)</h2>
              <p className="mt-4 text-gray-700">It allows users to build and maintain professional relationships through detailed user profiles and portfolios. The platform includes a professional verification system and industry-specific networking features.</p>
            </div>
            <div className="md:w-1/2 mt-6 md:mt-0">
              <div className="bg-white rounded-xl p-6 shadow">Profiles & networking preview (placeholder)</div>
            </div>
          </div>
        </section>

        <section id="commerce" className="py-20 bg-[#f7faf7]">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-xl font-bold text-[#1f2a44]" style={{ fontFamily: 'Space Mono, monospace' }}>Commerce (Business & Monetization)</h2>
            <p className="mt-4 text-gray-700 max-w-3xl">The platform implements a tiered subscription model designed to accommodate businesses of various sizes and needs. The Basic tier ($29/month) provides essential features, while the Pro tier ($79/month) offers advanced capabilities, and the Enterprise tier ($199/month) delivers comprehensive solutions for large organizations.</p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border rounded-xl p-6 bg-white shadow">
                <div className="text-lg font-semibold">Basic</div>
                <div className="mt-2 text-2xl font-bold text-[#3B4371]">$29 <span className="text-sm font-medium">/month</span></div>
                <ul className="mt-4 text-sm text-gray-600 space-y-2">
                  <li>Essential features</li>
                  <li>Content tools</li>
                </ul>
              </div>

              <div className="border rounded-xl p-6 bg-white shadow-lg">
                <div className="text-lg font-semibold">Pro</div>
                <div className="mt-2 text-2xl font-bold text-[#3B4371]">$79 <span className="text-sm font-medium">/month</span></div>
                <ul className="mt-4 text-sm text-gray-600 space-y-2">
                  <li>Advanced analytics</li>
                  <li>Team collaboration</li>
                </ul>
              </div>

              <div className="border rounded-xl p-6 bg-white shadow">
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