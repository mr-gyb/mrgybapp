import React from 'react';
// (no auth hook used in this simplified header)

// Google Fonts import for Space Mono and Roboto Mono
const fontLinks = [
  <link
    key="space-mono"
    href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&family=Space+Mono:wght@700&display=swap"
    rel="stylesheet"
  />
];

const HomePage: React.FC = () => {
  // Brand colors: use project navy/blue (#3B4371) and gold (#b29958)
  const brandGradient = 'linear-gradient(90deg, #3B4371 0%, #b29958 100%)';

  return (
    <div className="min-h-screen bg-gray-50">
      {fontLinks}

      {/* Top navigation removed as requested */}

      {/* Hero - large rounded panel with wave background and layered phone mockup (matches screenshot) */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative">
            {/* Rounded panel */}
            <div className="relative overflow-hidden rounded-2xl" style={{ background: brandGradient, borderRadius: 24 }}>
              {/* Decorative wave SVG on left */}
              <svg className="absolute left-0 top-0 h-full w-1/2 opacity-40" viewBox="0 0 600 400" preserveAspectRatio="none">
                <path d="M0,200 C150,100 300,300 600,200 L600,400 L0,400 Z" fill="rgba(255,255,255,0.06)" />
              </svg>

              <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 items-center gap-6 py-16 px-6 md:px-12">
                {/* Left column - headline and CTA */}
                <div className="text-white md:pr-8">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight" style={{ fontFamily: 'Space Mono, monospace' }}>
                    A New Way to Grow with AI
                  </h1>
                  <p className="mt-4 text-lg md:text-xl max-w-xl" style={{ fontFamily: 'Roboto Mono, monospace' }}>
                    Culture, Content, Community, and Commerce — all powered by advanced AI to help creators and teams scale.
                  </p>

                  <div className="mt-8">
                    <a className="inline-flex items-center gap-3 bg-white text-[#3B4371] px-5 py-3 rounded-full font-semibold shadow-md" href="/signup">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <rect width="18" height="12" x="3" y="6" rx="3" fill="#3B4371" />
                        <path d="M6 11h12" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Get the App
                    </a>
                  </div>
                </div>

                {/* Right column - layered phone mockup */}
                <div className="flex items-center justify-center md:justify-end">
                  <div className="relative w-[320px] md:w-[420px] lg:w-[520px]">
                    {/* Back large device */}
                    <div className="absolute left-8 top-8 w-[260px] md:w-[340px] lg:w-[420px] h-[420px] md:h-[520px] bg-white rounded-3xl shadow-lg transform rotate-[-4deg]" style={{ borderRadius: 28 }} />

                    {/* Foreground phone */}
                    <div className="relative bg-white rounded-3xl shadow-[0_40px_80px_rgba(0,0,0,0.18)] overflow-hidden" style={{ borderRadius: 28 }}>
                      <div className="h-4 bg-white" />
                      <div className="p-4">
                        <img src="https://images.unsplash.com/photo-1560184897-6f3a9b9f1e3f?auto=format&fit=crop&w=800&q=60" alt="hero-listing" className="w-full h-44 object-cover rounded-xl" />
                        <div className="mt-4">
                          <div className="text-sm font-semibold text-gray-800">Trending Properties</div>
                          <div className="mt-2 grid grid-cols-2 gap-3">
                            <div className="bg-gray-50 rounded-lg p-3">
                              <div className="text-sm font-medium">Chandler-S5</div>
                              <div className="text-xs text-gray-500 mt-1">$179.00</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <div className="text-sm font-medium">Seattle-D1</div>
                              <div className="text-xs text-gray-500 mt-1">$660.05</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* bottom pale strip */}
              <div className="h-6 bg-white/10" />
            </div>
          </div>
        </div>
      </section>

      {/* Feature sections */}
      <section id="culture" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 md:flex md:Items-center md:gap-12">
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold text-[#1f2a44]" style={{ fontFamily: 'Space Mono, monospace' }}>Culture (AI & Communication)</h2>
            <p className="mt-4 text-gray-700">It features an advanced AI chat system that enables users to engage with AI agents.</p>
          </div>
          <div className="md:w-1/2 mt-6 md:mt-0">
            <div className="bg-white rounded-xl p-6 shadow">Interactive AI chat preview (placeholder)</div>
          </div>
        </div>
      </section>

      <section id="content" className="py-20 bg-[#f7f7fb]">
        <div className="max-w-6xl mx-auto px-6 md:flex md:items-center md:gap-12">
          <div className="md:w-1/2 md:order-2">
            <h2 className="text-3xl font-bold text-[#1f2a44]" style={{ fontFamily: 'Space Mono, monospace' }}>Content (Creation & Management)</h2>
            <p className="mt-4 text-gray-700">Comprehensive hub for content creation and analytics. It supports a diverse range of content types, from blog posts and videos to images, audio, and social media content. The platform provides sophisticated analytics tools.</p>
          </div>
          <div className="md:w-1/2 mt-6 md:mt-0 md:order-1">
            <div className="bg-white rounded-xl p-6 shadow">Studio preview (placeholder)</div>
          </div>
        </div>
      </section>

      <section id="community" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 md:flex md:items-center md:gap-12">
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold text-[#1f2a44]" style={{ fontFamily: 'Space Mono, monospace' }}>Community (Networking & Collaboration)</h2>
            <p className="mt-4 text-gray-700">It allows users to build and maintain professional relationships through detailed user profiles and portfolios. The platform includes a professional verification system and industry-specific networking features.</p>
          </div>
          <div className="md:w-1/2 mt-6 md:mt-0">
            <div className="bg-white rounded-xl p-6 shadow">Profiles & networking preview (placeholder)</div>
          </div>
        </div>
      </section>

      <section id="commerce" className="py-20 bg-[#f7faf7]">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-[#1f2a44]" style={{ fontFamily: 'Space Mono, monospace' }}>Commerce (Business & Monetization)</h2>
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
  );
};

export default HomePage;