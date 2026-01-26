import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Grid3X3, Users, Plus, Video } from 'lucide-react';
import CultureIcon from './icons/CultureIcon';
import { useTheme } from '../contexts/ThemeContext';

const BottomMenu: React.FC = () => {
  // Bottom navigation removed — returning null to hide pill-style feature bar.
  return null;
};

export default BottomMenu;