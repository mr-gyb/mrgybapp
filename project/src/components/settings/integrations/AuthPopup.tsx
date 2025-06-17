import React from 'react';
import { X } from 'lucide-react';

interface AuthPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
}

const AuthPopup: React.FC<AuthPopupProps> = ({ isOpen, onClose, title, url }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>
        <div className="h-[600px]">
          <iframe
            src={url}
            className="w-full h-full"
            title={`${title} Authentication`}
          />
        </div>
      </div>
    </div>
  );
};

export default AuthPopup;