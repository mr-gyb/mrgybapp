import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import SettingsPageTemplate from '../SettingsPageTemplate';
import { Mail, AlertCircle } from 'lucide-react';

const EmailSettings: React.FC = () => {
  const { user, userData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [newEmail, setNewEmail] = useState(user?.email || userData?.email || '');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newEmail !== confirmEmail) {
      setError('Emails do not match');
      return;
    }

    try {
      // Update email logic here
      setSuccess('Email updated successfully');
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update email');
    }
  };

  const currentEmail = user?.email || userData?.email || 'No email set';

  return (
    <SettingsPageTemplate title="Email Settings">
      <div className="bg-gray-100 rounded-lg p-6 shadow-md">
        <div className="flex items-center mb-6">
          <Mail size={24} className="text-navy-blue mr-3" />
          <h2 className="text-xl font-bold">Email Address</h2>
        </div>

        {!isEditing ? (
          <div className="space-y-4">
            <p className="text-gray-600">Current email: <span className="font-semibold">{currentEmail}</span></p>
            <button
              onClick={() => setIsEditing(true)}
              className="bg-navy-blue text-white px-4 py-2 rounded-full hover:bg-opacity-90 transition duration-300"
            >
              Change Email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 mb-1">
                New Email
              </label>
              <input
                type="email"
                id="newEmail"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-navy-blue focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Email
              </label>
              <input
                type="email"
                id="confirmEmail"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-navy-blue focus:border-transparent"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center">
                <AlertCircle size={20} className="mr-2" />
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 text-green-600 p-3 rounded-lg">
                {success}
              </div>
            )}

            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-navy-blue text-white px-4 py-2 rounded-full hover:bg-opacity-90 transition duration-300"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setNewEmail(currentEmail);
                  setConfirmEmail('');
                  setError(null);
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-400 transition duration-300"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </SettingsPageTemplate>
  );
};

export default EmailSettings;