import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Apple, Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Signup: React.FC = () => {
  const { signUp, signInWithGoogle, signInWithApple, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const isMountedRef = useRef(true);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset loading state on unmount or navigation
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      setIsLoading(false);
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };
  }, []);

  // Safety timeout to reset loading if auth hangs
  const resetLoadingWithTimeout = () => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    loadingTimeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }, 30000); // 30 second safety timeout
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Basic validation
    if (!fullName.trim()) {
      setError('Please enter your full name.');
      setIsLoading(false);
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email address.');
      setIsLoading(false);
      return;
    }

    if (!password) {
      setError('Please enter a password.');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await signUp(email, password);
      if (result.error) {
        const errorMessage = result.error.message || 'Failed to create account. Please try again.';
        setError(errorMessage);
      } else {
        // User is created and will be available in AuthContext via onAuthStateChanged
        // Only pass plain serializable data in navigation state
        navigate('/onboarding', { 
          state: { 
            email, 
            fullName
          } 
        });
      }
    } catch (error: any) {
      setError(error?.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    if (!isMountedRef.current) return;
    
    setIsLoading(true);
    setError('');
    resetLoadingWithTimeout();
    
    try {
      const result = await signInWithApple();
      
      if (!isMountedRef.current) {
        setIsLoading(false);
        return;
      }
      
      if (result.error) {
        const errorCode = result.error.code;
        const errorMessage = result.error.message || 'Apple sign in failed. Please try again.';
        
        // Handle popup closed/cancelled gracefully
        if (errorCode === 'auth/popup-closed-by-user' || errorCode === 'auth/cancelled-popup-request') {
          setError('');
        } else {
          setError(errorMessage.replace(/\n/g, '\n'));
        }
        setIsLoading(false);
      } else {
        navigate('/home');
      }
    } catch (error: any) {
      if (!isMountedRef.current) {
        setIsLoading(false);
        return;
      }
      
      const errorCode = error?.code;
      if (errorCode === 'auth/popup-closed-by-user' || errorCode === 'auth/cancelled-popup-request') {
        setError('');
      } else {
        const errorMessage = error?.message || 'An error occurred during Apple sign in. Please try again.';
        setError(errorMessage.replace(/\n/g, '\n'));
      }
      setIsLoading(false);
    } finally {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleLogin = async () => {
    if (!isMountedRef.current) return;
    
    setIsLoading(true);
    setError('');
    resetLoadingWithTimeout();
    
    try {
      const result = await signInWithGoogle();
      
      if (!isMountedRef.current) {
        setIsLoading(false);
        return;
      }
      
      if (result.error) {
        const errorCode = result.error.code;
        const errorMessage = result.error.message || 'Google sign in failed. Please try again.';
        
        // Handle popup closed/cancelled gracefully
        if (errorCode === 'auth/popup-closed-by-user' || errorCode === 'auth/cancelled-popup-request') {
          setError('');
        } else {
          setError(errorMessage);
        }
        setIsLoading(false);
      } else {
        navigate('/home');
      }
    } catch (error: any) {
      if (!isMountedRef.current) {
        setIsLoading(false);
        return;
      }
      
      const errorCode = error?.code;
      if (errorCode === 'auth/popup-closed-by-user' || errorCode === 'auth/cancelled-popup-request') {
        setError('');
      } else {
        setError(error?.message || 'An error occurred during Google sign in. Please try again.');
      }
      setIsLoading(false);
    } finally {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  // Show loading spinner while auth context is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4B77A]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo - Centered on top with proper spacing */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="mx-auto h-16 w-16 rounded-full border-2 border-[#D4B77A] flex items-center justify-center">
            <span className="text-2xl font-bold text-[#D4B77A]">GYB</span>
          </div>
        </div>

        {/* Signup Form Card - Rounded white card with thin navy border */}
        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 border border-[#0C2440]">
          <h1 className="text-2xl font-bold text-[#0C2440] text-center mb-6 sm:mb-8">
            Create Account
          </h1>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Full Name Field - Rounded, gray border, icon on left */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-[#0C2440] mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4B77A] focus:border-[#D4B77A] transition-colors"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Email Field - Rounded, gray border, icon on left */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#0C2440] mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4B77A] focus:border-[#D4B77A] transition-colors"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field - Rounded, gray border, icon on left */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#0C2440] mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4B77A] focus:border-[#D4B77A] transition-colors"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:opacity-70 transition-opacity"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field - Rounded, gray border, icon on left */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#0C2440] mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4B77A] focus:border-[#D4B77A] transition-colors"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:opacity-70 transition-opacity"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg space-y-2 mt-4">
                <div className="font-medium whitespace-pre-line text-left">{error}</div>
                {error.includes('Passwords do not match') && (
                  <div className="text-xs text-gray-600 mt-2 pt-2 border-t border-red-200">
                    <p className="font-semibold mb-1">Please ensure:</p>
                    <ul className="list-disc list-inside space-y-1 text-left">
                      <li>Both password fields match exactly</li>
                      <li>Password is at least 6 characters long</li>
                      <li>No extra spaces in either field</li>
                    </ul>
                  </div>
                )}
                {error.includes('Apple Sign In is not enabled') && (
                  <div className="text-xs text-gray-600 mt-2 pt-2 border-t border-red-200">
                    <p className="font-semibold mb-1">Quick Setup:</p>
                    <ol className="list-decimal list-inside space-y-1 text-left">
                      <li>Go to Firebase Console → Authentication → Sign-in method</li>
                      <li>Click on "Apple" provider</li>
                      <li>Enable it and configure your Apple credentials</li>
                      <li>See APPLE_SIGN_IN_SETUP.md for detailed instructions</li>
                    </ol>
                  </div>
                )}
                {error.includes('Google Sign In is not enabled') && (
                  <div className="text-xs text-gray-600 mt-2 pt-2 border-t border-red-200">
                    <p className="font-semibold mb-1">Quick Setup:</p>
                    <ol className="list-decimal list-inside space-y-1 text-left">
                      <li>Go to Firebase Console → Authentication → Sign-in method</li>
                      <li>Click on "Google" provider</li>
                      <li>Enable it (Firebase will auto-configure OAuth client)</li>
                      <li>See GOOGLE_SIGN_IN_SETUP.md for detailed instructions</li>
                    </ol>
                  </div>
                )}
              </div>
            )}

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#0C2440] text-white rounded-lg font-semibold hover:bg-[#0a1d33] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#0C2440] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm mt-4 sm:mt-5"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Sign In Link - Below main button, exactly as Canva */}
          <div className="mt-5 sm:mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-[#D4B77A] hover:text-[#C4A76A] font-semibold transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>

          {/* Divider - "or" styled exactly like Login page */}
          <div className="relative my-5 sm:my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-500 font-medium">or</span>
            </div>
          </div>

          {/* Social Login Buttons - Moved to bottom */}
          <div className="space-y-3">
            {/* Apple Button - Solid black, rounded, Apple icon + text */}
            <button
              onClick={handleAppleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <Apple size={20} />
              Continue with Apple
            </button>

            {/* Google Button - White with border, Google G icon */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;

