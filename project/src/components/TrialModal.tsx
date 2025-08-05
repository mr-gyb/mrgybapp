import React, { useState } from 'react';
import { X, ArrowRight } from 'lucide-react';

interface TrialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TrialModal: React.FC<TrialModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: ''
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
    // Handle form submission here
    console.log('Form submitted:', formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        {/* Form Content */}
        <div className="p-8">
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
                placeholder="Full Name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                placeholder="Email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </form>
        </div>

        {/* Footer with Progress Bar */}
        <div className="bg-blue-900 text-white p-4 rounded-b-lg">
          <div className="flex items-center justify-between">
            {/* Progress Text */}
            <div className="flex items-center space-x-4">
              <span className="text-sm">Showing 1 of 2</span>
              
              {/* Progress Bar */}
              <div className="flex-1 max-w-32 bg-blue-800 rounded-full h-2">
                <div className="bg-blue-400 h-2 rounded-full" style={{ width: '33%' }}></div>
              </div>
            </div>

            {/* Continue Button */}
            <button
              onClick={handleSubmit}
              className="bg-white text-blue-900 px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 hover:bg-gray-100 transition-colors"
            >
              <span>CONTINUE</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrialModal; 