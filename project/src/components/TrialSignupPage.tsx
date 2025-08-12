import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Facebook, Instagram, Twitter, Youtube, Mail } from 'lucide-react';

const TrialSignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: 'Nanditha Aitha',
    email: 'aithanandithareddy@gmail.com'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to step 2
    navigate('/trial-signup-step2');
  };

  const handleContinue = () => {
    // Navigate to step 2
    navigate('/trial-signup-step2');
  };

  return (
    <div className="min-h-screen bg-white">
            {/* Header */}
      <div className="bg-blue-900 p-4 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center border-2 border-blue-200">
              <span className="text-white font-bold text-base">M</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-blue-900"></div>
          </div>
          <span className="text-white font-semibold text-base">Mr. Grow Your Business</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Form Card */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Start Your 14-Day Free Trial Now!
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name Field */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-blue-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  required
                />
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-blue-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  required
                />
              </div>
            </form>
          </div>

          {/* Progress Bar */}
          <div className="bg-blue-900 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              {/* Progress Text */}
              <div className="flex items-center space-x-4">
                <span className="text-sm">Showing 1 of 2</span>
                
                {/* Progress Bar */}
                <div className="flex-1 max-w-32 bg-blue-800 rounded-full h-2">
                  <div className="bg-blue-400 h-2 rounded-full" style={{ width: '50%' }}></div>
                </div>
              </div>

                             {/* Continue Button */}
               <button
                 onClick={handleContinue}
                 className="bg-white text-blue-900 px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 hover:bg-gray-100 transition-colors"
               >
                 <span>CONTINUE</span>
                 <ArrowRight size={16} />
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-blue-900 text-white p-8">
        <div className="max-w-md mx-auto text-center">
                     {/* Social Media Icons */}
           <div className="flex justify-center space-x-6 mb-6">
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

          {/* Brand Image */}
          <div className="mb-6">
            <div className="relative inline-block">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center border-2 border-blue-200">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-blue-900"></div>
            </div>
          </div>

          {/* Legal Links */}
          <div className="flex justify-center space-x-8 text-sm">
            <a href="#" className="text-white hover:text-blue-200 transition-colors">
              Terms and conditions
            </a>
            <a href="#" className="text-white hover:text-blue-200 transition-colors">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrialSignupPage; 