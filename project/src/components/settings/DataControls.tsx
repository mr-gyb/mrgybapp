import React from 'react';
import SettingsPageTemplate from '../SettingsPageTemplate';

const DataControls: React.FC = () => {
  return (
    <SettingsPageTemplate title="Data Controls">
      <div className="space-y-6">
        <div className="bg-gray-100 rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-bold mb-4">Data Privacy</h2>
          <p className="text-gray-600 mb-4">
            Manage how your data is collected, used, and shared.
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Data Collection</span>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  name="dataCollection"
                  id="dataCollection"
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label
                  htmlFor="dataCollection"
                  className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                ></label>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Share Analytics</span>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  name="shareAnalytics"
                  id="shareAnalytics"
                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label
                  htmlFor="shareAnalytics"
                  className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"
                ></label>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-100 rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-bold mb-4">Data Export</h2>
          <p className="text-gray-600 mb-4">
            Download or delete your data.
          </p>
          <div className="space-y-4">
            <button className="bg-navy-blue text-white px-4 py-2 rounded-full">
              Export Data
            </button>
            <button className="bg-red-500 text-white px-4 py-2 rounded-full">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </SettingsPageTemplate>
  );
};

export default DataControls;