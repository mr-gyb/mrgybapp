import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';
import { Platform } from '../../types/content';

interface PlatformSelectorProps {
  selectedPlatforms: string[];
  onPlatformToggle: (platformId: string) => void;
}

const platforms: Platform[] = [
  { id: 'facebook', name: 'Facebook', icon: 'facebook' },
  { id: 'twitter', name: 'Twitter', icon: 'twitter' },
  { id: 'instagram', name: 'Instagram', icon: 'instagram' },
  { id: 'linkedin', name: 'LinkedIn', icon: 'linkedin' },
  { id: 'youtube', name: 'YouTube', icon: 'youtube' }
];

const PlatformSelector: React.FC<PlatformSelectorProps> = ({
  selectedPlatforms,
  onPlatformToggle
}) => {
  const getIcon = (platform: Platform) => {
    switch (platform.icon) {
      case 'facebook':
        return <Facebook size={20} />;
      case 'twitter':
        return <Twitter size={20} />;
      case 'instagram':
        return <Instagram size={20} />;
      case 'linkedin':
        return <Linkedin size={20} />;
      case 'youtube':
        return <Youtube size={20} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {platforms.map((platform) => (
        <button
          key={platform.id}
          onClick={() => onPlatformToggle(platform.id)}
          className={`flex items-center p-2 rounded ${
            selectedPlatforms.includes(platform.id)
              ? 'bg-navy-blue text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {getIcon(platform)}
          <span className="ml-2">{platform.name}</span>
        </button>
      ))}
    </div>
  );
};

export default PlatformSelector;