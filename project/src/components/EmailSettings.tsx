import React, { useState } from 'react';
import SettingsPageTemplate from './SettingsPageTemplate';
import { useAuth } from '../contexts/AuthContext';

const EmailSettings: React.FC = () => {
  const { userData, updateUserData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [newEmail, setNewEmail] = useState(userData?.email || '');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [error, setError] = useState('');

  const handleEditClick = () => {
    setIsEditing(true);
    setNewEmail(userData?.email || '');
    setConfirmEmail('');
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEmail !== confirmEmail) {
      setError('Emails do not match');
      return;
    }
    updateUserData({ email: newEmail });
    setIsEditing(false);
    setError('');
  };

  return (
    <SettingsPageTemplate title="Email Settings">
      <div className="bg-gray-100 rounded-lg p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-4">Email Address</h2>
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700">
                New Email
              </label>
              <input
                type="email"
                id="newEmail"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-navy-blue focus:ring focus:ring-navy-blue focus:ring-opacity-50"
                required
              />
            </div>
            <div>
              <label htmlFor="confirmEmail" className="block text-sm font-medium text-gray-700">
                Confirm New Email
              </label>
              <input
                type="email"
                id="confirmEmail"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-navy-blue focus:ring focus:ring-navy-blue focus:ring-opacity-50"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-navy-blue text-white px-4 py-2 rounded-full hover:bg-opacity-90 transition duration-300"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-400 transition duration-300"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div>
            <p className="text-gray-600 mb-4">Your current email address: {userData?.email}</p>
            <button
              onClick={handleEditClick}
              className="bg-navy-blue text-white px-4 py-2 rounded-full hover:bg-opacity-90 transition duration-300"
            >
              Change Email
            </button>
          </div>
        )}
      </div>
    </SettingsPageTemplate>
  );
};

export default EmailSettings;