import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Facebook } from 'lucide-react';

interface FacebookLoginButtonProps {
  onSuccess?: () => void;
  onError?: (error: any) => void;
  className?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const FacebookLoginButton: React.FC<FacebookLoginButtonProps> = ({
  onSuccess,
  onError,
  className = '',
  children,
  variant = 'default',
  size = 'md'
}) => {
  const { signInWithFacebook } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithFacebook();
      
      if (result.error) {
        console.error('Facebook login error:', result.error);
        onError?.(result.error);
      } else if (result.user) {
        console.log('Facebook login successful:', result.user);
        onSuccess?.();
      }
    } catch (error) {
      console.error('Facebook login failed:', error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    default: 'bg-[#1877F2] hover:bg-[#166FE5] text-white focus:ring-[#1877F2]',
    outline: 'border border-[#1877F2] text-[#1877F2] hover:bg-[#1877F2] hover:text-white focus:ring-[#1877F2]',
    ghost: 'text-[#1877F2] hover:bg-[#1877F2]/10 focus:ring-[#1877F2]'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      <Facebook className={`${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'}`} />
      {isLoading ? 'Connecting...' : children || 'Continue with Facebook'}
    </button>
  );
};

export default FacebookLoginButton;
