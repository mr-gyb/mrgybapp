import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer>
      {/* Gradient Bar */}
      <div 
        className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 text-white"
        style={{
          background: 'linear-gradient(to right, #0A2342 0%, #C4A64D 100%)',
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
            {/* Left: Terms & Conditions */}
            <div className="order-2 sm:order-1">
              <Link
                to="/terms"
                className="text-sm sm:text-base hover:opacity-80 transition-opacity duration-200"
              >
                Terms & Conditions
              </Link>
            </div>

            {/* Center: GYB logo + text + copyright */}
            <div className="order-1 sm:order-2 flex flex-col items-center gap-3 sm:gap-4">
              <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-xl sm:text-2xl font-bold text-white">GYB</span>
              </div>
              <p className="text-sm sm:text-base font-semibold text-center">
                A New Way to Grow With AI
              </p>
              <p className="text-xs sm:text-sm text-white/80 text-center">
                © {currentYear} Mr.GYB AI
              </p>
            </div>

            {/* Right: Privacy Policy */}
            <div className="order-3">
              <Link
                to="/privacy"
                className="text-sm sm:text-base hover:opacity-80 transition-opacity duration-200"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
