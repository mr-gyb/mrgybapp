import React from 'react';
import { Facebook, Instagram, Twitter, Youtube, Mail } from 'lucide-react';

const TrialSignupConfirmation: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Upper Section - White Background */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md text-center">
          {/* Header/Branding */}
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-2 border-blue-200 overflow-hidden">
                {/* Character illustration - replace with actual image */}
                <img
                  src="/mr-grow-your-business-character.png"
                  alt="Mr. Grow Your Business Character"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                {/* Fallback placeholder */}
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center hidden">
                  <span className="text-white font-bold text-xl">M</span>
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-blue-900"></div>
            </div>
            <span className="text-blue-900 font-semibold text-xl">Mr. Grow Your Business</span>
          </div>

          {/* Welcome Message */}
          <div className="mb-8">
            <p className="text-gray-600 text-lg leading-relaxed">
              Welcome to Mr.GYB AI. We are glad to have you onboard. Please
            </p>
            <p className="text-gray-600 text-lg leading-relaxed">
              review your email for the next steps!
            </p>
          </div>
        </div>
      </div>

      {/* Lower Section - Dark Blue Background */}
      <div className="bg-blue-900 text-white p-8">
        <div className="max-w-md mx-auto text-center">
                     {/* Social Media Icons */}
           <div className="flex justify-center space-x-6 mb-8">
             <a href="https://www.facebook.com/chrismateo2" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-200 transition-colors">
               <Facebook size={24} />
             </a>
             <a href="https://www.instagram.com/mrgrowyourbusiness__/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-200 transition-colors">
               <Instagram size={24} />
             </a>
             <a href="https://x.com/motivational_cm?lang=en" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-200 transition-colors">
               <Twitter size={24} />
             </a>
             <a href="https://www.youtube.com/@Mrgrowyourbusiness/featured" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-200 transition-colors">
               <Youtube size={24} />
             </a>
             <a href="mailto:ceo@cmateo.com" className="text-white hover:text-blue-200 transition-colors">
               <Mail size={24} />
             </a>
           </div>

          {/* Brand Image (Footer) */}
          <div className="mb-8">
            <div className="relative inline-block">
              <div className="w-20 h-20 rounded-full border-2 border-blue-200 overflow-hidden">
                {/* Character illustration - replace with actual image */}
                <img
                  src="/mr-grow-your-business-character.png"
                  alt="Mr. Grow Your Business Character"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                {/* Fallback placeholder */}
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center hidden">
                  <span className="text-white font-bold text-2xl">M</span>
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-blue-900"></div>
            </div>
          </div>

          {/* Legal Links */}
          <div className="flex justify-center items-center space-x-4 text-sm">
            <a href="#" className="text-yellow-300 hover:text-yellow-200 transition-colors">
              Terms and conditions
            </a>
            <span className="text-gray-400">•</span>
            <a href="#" className="text-yellow-300 hover:text-yellow-200 transition-colors">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrialSignupConfirmation; 