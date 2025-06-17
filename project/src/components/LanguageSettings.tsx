import React, { useState } from 'react';
import SettingsPageTemplate from './SettingsPageTemplate';
import { useAuth } from '../contexts/AuthContext';

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
  { code: 'ko', name: '한국어' },
];

const LanguageSettings: React.FC = () => {
  const { userData, updateUserData } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState(userData?.language || 'en');
  const [isSaved, setIsSaved] = useState(false);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLanguage(e.target.value);
    setIsSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserData({ language: selectedLanguage });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <SettingsPageTemplate title="Language Settings">
      <div className="bg-gray-100 rounded-lg p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-4">App Language</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700">
              Select Language
            </label>
            <select
              id="language"
              value={selectedLanguage}
              onChange={handleLanguageChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-navy-blue focus:ring focus:ring-navy-blue focus:ring-opacity-50"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="bg-navy-blue text-white px-4 py-2 rounded-full hover:bg-opacity-90 transition duration-300"
          >
            {isSaved ? 'Language Saved!' : 'Save Language'}
          </button>
        </form>
      </div>
    </SettingsPageTemplate>
  );
};

export default LanguageSettings;