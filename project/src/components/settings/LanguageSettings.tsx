import React, { useState } from 'react';
import SettingsPageTemplate from '../SettingsPageTemplate';
import { Globe } from 'lucide-react';

const LanguageSettings: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'it', name: 'Italiano' },
    { code: 'pt', name: 'Português' },
    { code: 'ru', name: 'Русский' },
    { code: 'zh', name: '中文' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' }
  ];

  return (
    <SettingsPageTemplate title="Language Settings">
      <div className="bg-gray-100 rounded-lg p-6 shadow-md">
        <div className="flex items-center mb-6">
          <Globe size={24} className="text-navy-blue mr-3" />
          <h2 className="text-xl font-bold">App Language</h2>
        </div>

        <div className="space-y-4">
          {languages.map(language => (
            <label
              key={language.code}
              className={`flex items-center p-3 rounded-lg cursor-pointer ${
                selectedLanguage === language.code ? 'bg-navy-blue text-white' : 'bg-white hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="language"
                value={language.code}
                checked={selectedLanguage === language.code}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="sr-only"
              />
              <span>{language.name}</span>
            </label>
          ))}
        </div>
      </div>
    </SettingsPageTemplate>
  );
};

export default LanguageSettings;