import React, { useState } from 'react';
import SettingsPageTemplate from '../SettingsPageTemplate';
import { Mic, Volume2 } from 'lucide-react';

const VoiceSettings: React.FC = () => {
  const [selectedVoice, setSelectedVoice] = useState('default');
  const [volume, setVolume] = useState(80);

  const voices = [
    { id: 'default', name: 'Default Voice' },
    { id: 'voice1', name: 'Professional Voice' },
    { id: 'voice2', name: 'Casual Voice' }
  ];

  return (
    <SettingsPageTemplate title="Voice Settings">
      <div className="bg-gray-100 rounded-lg p-6 shadow-md space-y-6">
        <div>
          <div className="flex items-center mb-4">
            <Mic size={24} className="text-navy-blue mr-3" />
            <h2 className="text-xl font-bold">Voice Selection</h2>
          </div>
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="w-full p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-navy-blue focus:border-transparent"
          >
            {voices.map(voice => (
              <option key={voice.id} value={voice.id}>
                {voice.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex items-center mb-4">
            <Volume2 size={24} className="text-navy-blue mr-3" />
            <h2 className="text-xl font-bold">Volume</h2>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="text-right text-gray-600">
            {volume}%
          </div>
        </div>
      </div>
    </SettingsPageTemplate>
  );
};

export default VoiceSettings;