import React from 'react';
import '../index.css';
import { useNavigate } from 'react-router-dom';
import LoginButton from './LoginButton';
import SignupButton from './SignupButton';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative">
      {/* Header (from original introduction section) */}
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
        {/* Introduction / hero section (kept from temp file) */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div
              className="relative overflow-hidden rounded-3xl hero-gradient-background"
              style={{ boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)' }}
            >
              <div className="relative z-10 grid grid-cols-1 items-center py-32 px-12 md:px-16 text-center">
                <div className="text-white md:pr-8 mx-auto">
                  <p
                    className="text-3xl md:text-4xl lg:text-5xl font-extrabold"
                    style={{ marginBottom: '1cm' }}
                  >
                    A New Way to
                  </p>
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold">
                    Grow With AI
                  </h1>
                  <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto">
                    Stop guessing what to post. <span className="font-bold">Mr.GYB</span> analyzes your audience,
                    defines your culture, and generates high-performing scripts in seconds.
                  </p>

                  <div className="mt-8 flex justify-center">
                    <button
                      className="px-6 py-3 rounded-full bg-[#E3C472] text-[#3B4371] font-semibold hover:bg-[#d4b566]"
                      style={{ marginRight: '1cm' }}
                      onClick={() => navigate('/trial-signup')}
                    >
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

        {/* Feature cards section */}
        <section className="py-24 bg-white">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Culture Profile */}
            <div className="bg-[#E3C472] rounded-3xl border border-[#11335d] px-8 py-10 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold text-[#11335d] mb-4">Culture Profile</h3>
                <p className="text-[#11335d] text-sm md:text-base leading-relaxed">
                  Define your unique voice. Our AI learns your values and tone to ensure every piece of content feels
                  authentically yours.
                </p>
              </div>
            </div>

            {/* Content Studio */}
            <div className="bg-[#11335d] rounded-3xl border border-[#11335d] px-8 py-10 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">Content Studio</h3>
                <p className="text-white text-sm md:text-base leading-relaxed">
                  Generate viral-ready scripts, hooks, and threads in seconds. Based on proven frameworks used by top
                  creators.
                </p>
              </div>
            </div>

            {/* Community */}
            <div className="bg-[#E3C472] rounded-3xl border border-[#11335d] px-8 py-10 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold text-[#11335d] mb-4">Community</h3>
                <p className="text-[#11335d] text-sm md:text-base leading-relaxed">
                  Track engagement trends and connect with other founders. See what&apos;s working in your niche right
                  now.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonial section (page 2) */}
        <section className="py-24 bg-white">
          <div className="max-w-5xl mx-auto px-6 text-center">
            {/* Top label */}
            <div className="flex flex-col items-center mb-10">
              <div className="text-3xl mb-3">⚡</div>
              <p className="text-2xl md:text-3xl font-medium text-gray-900">Speed is everything</p>
            </div>

            {/* Large rounded gradient card */}
            <div className="rounded-[40px] overflow-hidden shadow-xl">
              <div className="bg-gradient-to-r from-[#11335d] via-[#4a5563] to-[#E3C472] text-white py-16 px-6 md:px-24">
                <p className="text-2xl md:text-4xl font-semibold mb-10">
                  &quot;Mr.GYB cut my writing time by 90%.&quot;
                </p>

                <div className="flex items-center justify-center gap-4 md:gap-6">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white flex items-center justify-center text-lg md:text-xl font-semibold text-gray-900 border border-gray-200">
                    TF
                  </div>
                  <p className="text-base md:text-lg text-white">
                    Sarah Jenkins, Founder @ TechFlow
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call-to-action section (page 3) */}
        <section className="py-24 bg-white">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#11335d] mb-6">
              Ready to upgrade your workflow?
            </h2>
            <p className="text-lg md:text-2xl text-[#11335d] mb-12 leading-relaxed">
              Join 10,000+ creators using AI to scale their personal brands. Sign up for free today.
            </p>
            <div className="flex justify-center">
              <button
                className="px-16 py-4 rounded-full bg-[#11335d] text-white text-lg md:text-xl font-semibold shadow-md hover:bg-[#0b2440] transition-colors"
                onClick={() => navigate('/trial-signup')}
              >
                Sign Up
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gradient-to-r from-[#11335d] via-[#4a5563] to-[#E3C472] text-white py-8 px-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <button className="text-sm md:text-base hover:underline">
              Terms &amp; Conditions
            </button>

            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-md">
                <img
                  src="/gyb-logo.png"
                  alt="GYB Logo"
                  className="w-12 h-12 object-contain"
                />
              </div>
              <p className="text-sm md:text-base">A New Way to Grow With AI</p>
              <p className="text-xs md:text-sm opacity-80">
                © 2025 Mr.GYB AI. All rights reserved.
              </p>
            </div>

            <button className="text-sm md:text-base hover:underline">
              Privacy Policy
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;