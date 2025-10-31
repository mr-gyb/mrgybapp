import React, { useState, useEffect } from 'react';
import { CheckCircle, Users, X } from 'lucide-react';

interface NetworkNotificationProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const NetworkNotification: React.FC<NetworkNotificationProps> = ({
  message,
  isVisible,
  onClose,
  duration = 4000
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-20 right-4 z-50 transform transition-all duration-300 ease-in-out ${
        isAnimating
          ? 'translate-x-0 opacity-100 scale-100'
          : 'translate-x-full opacity-0 scale-95'
      }`}
    >
      <div className="bg-white border border-green-200 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <Users className="w-4 h-4 text-green-600" />
              <p className="text-sm font-medium text-gray-900">Network Update</p>
            </div>
            <p className="text-sm text-gray-600">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-3 bg-green-50 rounded-md p-2">
          <p className="text-xs text-green-700">
            You can now start chatting with this person in Team Chats!
          </p>
        </div>
      </div>
    </div>
  );
};

export default NetworkNotification;
