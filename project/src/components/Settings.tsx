import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  Plus, 
  User, 
  Shield, 
  Archive, 
  Globe, 
  CheckCircle, 
  RefreshCw, 
  Mic, 
  HelpCircle, 
  FileText, 
  Lock, 
  Briefcase, 
  FileText as Resume, 
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Settings: React.FC = () => {
  const settingsSections = [
    {
      title: 'Account',
      items: [
        { icon: Mail, label: 'Email', path: '/settings/email' },
        { icon: Plus, label: 'Subscription', path: '/settings/subscription' },
        { icon: User, label: 'Personalization', path: '/settings/personalization' },
        { icon: Shield, label: 'Data Controls', path: '/settings/data-controls' },
        { icon: Archive, label: 'Archived Chats', path: '/settings/archived-chats' }
      ]
    },
    {
      title: 'App',
      items: [
        { icon: Globe, label: 'App Language', path: '/settings/language' },
        { icon: CheckCircle, label: 'Correct Spelling Automatically', path: '/settings/spelling' },
        { icon: RefreshCw, label: 'Check for Updates...', path: '/settings/updates' }
      ]
    },
    {
      title: 'Speech',
      items: [
        { icon: Mic, label: 'Voice', path: '/settings/voice' },
        { icon: Globe, label: 'Main Language', path: '/settings/main-language' }
      ]
    },
    {
      title: 'Integrations',
      items: [
        { icon: Layers, label: 'Manage Integrations', path: '/settings/integrations' }
      ]
    },
    {
      title: 'About',
      items: [
        { icon: HelpCircle, label: 'Help Center', path: '/settings/help' },
        { icon: FileText, label: 'Terms of Use', path: '/settings/terms' },
        { icon: Lock, label: 'Privacy Policy', path: '/settings/privacy' }
      ]
    }
  ];

  return (
    <div className="bg-white min-h-screen text-navy-blue">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Link to="/dashboard" className="mr-4 text-navy-blue">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold text-navy-blue">Settings</h1>
        </div>

        <div className="space-y-8">
          {/* Portfolio and Resume Icons */}
          <div className="flex justify-center space-x-12 mb-8">
            <Link to="/portfolio" className="flex flex-col items-center">
              <Briefcase size={48} className="text-navy-blue mb-2" />
              <span className="text-sm font-semibold">Portfolio</span>
            </Link>
            <Link to="/resume" className="flex flex-col items-center">
              <Resume size={48} className="text-navy-blue mb-2" />
              <span className="text-sm font-semibold">Resume</span>
            </Link>
          </div>

          {/* Settings Sections */}
          {settingsSections.map((section, index) => (
            <div key={index} className="bg-gray-100 rounded-lg p-4">
              <h2 className="text-xl font-bold mb-4">{section.title}</h2>
              <div className="space-y-4">
                {section.items.map((item, itemIndex) => (
                  <Link
                    key={itemIndex}
                    to={item.path}
                    className="flex justify-between items-center hover:bg-gray-200 p-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <item.icon className="mr-2" size={20} />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight size={20} className="text-gray-400" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;