import React from 'react';

interface VoiceTroubleshootingProps {
  isVisible: boolean;
  onClose: () => void;
}

export const VoiceTroubleshooting: React.FC<VoiceTroubleshootingProps> = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Voice Recognition Troubleshooting</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4 text-sm text-gray-700">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Common Issues & Solutions:</h4>
            
            <div className="space-y-3">
              <div>
                <strong>🔇 "No speech detected"</strong>
                <ul className="ml-4 mt-1 space-y-1">
                  <li>• Speak louder and closer to your microphone</li>
                  <li>• Check if your microphone is muted</li>
                  <li>• Ensure no other apps are using your microphone</li>
                  <li>• Try speaking immediately after clicking the mic button</li>
                </ul>
              </div>
              
              <div>
                <strong>🚫 "Microphone not accessible"</strong>
                <ul className="ml-4 mt-1 space-y-1">
                  <li>• Allow microphone access in your browser settings</li>
                  <li>• Check your system microphone permissions</li>
                  <li>• Try refreshing the page and allowing access again</li>
                </ul>
              </div>
              
              <div>
                <strong>🌐 "Network error"</strong>
                <ul className="ml-4 mt-1 space-y-1">
                  <li>• Check your internet connection</li>
                  <li>• Speech recognition requires internet access</li>
                  <li>• Try again when your connection is stable</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-md">
            <strong>💡 Tips for better recognition:</strong>
            <ul className="ml-4 mt-1 space-y-1">
              <li>• Speak clearly and at normal pace</li>
              <li>• Reduce background noise</li>
              <li>• Use a good quality microphone if possible</li>
              <li>• Try different browsers (Chrome works best)</li>
            </ul>
          </div>
          
          <div className="bg-yellow-50 p-3 rounded-md">
            <strong>⚠️ Browser Compatibility:</strong>
            <p className="mt-1">
              Voice recognition works best in Chrome, Edge, and Safari. 
              Firefox has limited support.
            </p>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
