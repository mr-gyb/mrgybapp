import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Apple, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const { signIn, signInWithGoogle, signInWithApple, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Basic validation
    if (!email.trim()) {
      setError('Please enter your email address.');
      setIsLoading(false);
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn(email, password);
      if (result.error) {
        // Use the error message from AuthContext (which provides user-friendly messages)
        const errorMessage = result.error.message || 'Invalid email or password. Please try again.';
        setError(errorMessage);
      } else {
        navigate('/home');
      }
    } catch (error: any) {
      setError(error?.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = await signInWithApple();
      if (result.error) {
        const errorMessage = result.error.message || 'Apple sign in failed. Please try again.';
        // Replace newlines with line breaks for better display
        setError(errorMessage.replace(/\n/g, '\n'));
      } else {
        navigate('/home');
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'An error occurred during Apple sign in. Please try again.';
      setError(errorMessage.replace(/\n/g, '\n'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = await signInWithGoogle();
      if (result.error) {
        const errorMessage = result.error.message || 'Google sign in failed. Please try again.';
        setError(errorMessage);
      } else {
        navigate('/home');
      }
    } catch (error: any) {
      setError(error?.message || 'An error occurred during Google sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  // Show loading spinner while auth context is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  // Debug: Log the auth context state
  console.log('Login component rendered, authLoading:', authLoading, 'signIn:', !!signIn);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo - Centered on top, exact spacing as Canva */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="mx-auto h-16 w-16 rounded-full border-2 border-[#D9B45F] flex items-center justify-center">
            <span className="text-2xl font-bold text-[#D9B45F]">GYB</span>
          </div>
        </div>

        {/* Login Form Card - Rounded white card with thin border, exact Canva styling */}
        <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-10 border border-[#C9D1E0]" style={{ borderRadius: '16px' }}>
          <h1 className="text-2xl font-bold text-[#0C2440] text-center mb-8">
            Welcome back!
          </h1>

          {/* Social Login Buttons - Exact Canva styling */}
          <div className="space-y-3 mb-6">
            {/* Apple Button - Solid black, fully rounded pill, exact Canva style */}
            <button
              onClick={handleAppleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-black text-white rounded-full font-medium hover:bg-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Apple size={20} className="text-white" />
              Continue with Apple
            </button>

            {/* Google Button - White with gray border, exact Canva style */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* Divider - "OR" styled exactly like Canva screenshot */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-500 font-medium uppercase">OR</span>
            </div>
          </div>

          {/* Email/Password Form - Exact Canva spacing and styling */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field - Soft gray border, rounded corners, icon on left */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#0C2440] mb-2.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
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
                  className="block w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4B77A] focus:border-[#D4B77A] transition-colors text-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field - Lock icon on left, eye icon on right */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#0C2440] mb-2.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4B77A] focus:border-[#D4B77A] transition-colors text-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center hover:opacity-70 transition-opacity"
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

            {/* Remember Me & Forgot Password - Exact Canva alignment and spacing */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-[#D4B77A] focus:ring-[#D4B77A] border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2.5 block text-sm text-[#0C2440] cursor-pointer font-normal">
                  Remember me
                </label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm text-[#D4B77A] hover:text-[#C4A76A] font-medium transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg space-y-2 mt-4">
                <div className="font-medium whitespace-pre-line text-left">{error}</div>
                {error.includes('Invalid email or password') && (
                  <div className="text-xs text-gray-600 mt-2 pt-2 border-t border-red-200">
                    <p className="font-semibold mb-1">Troubleshooting:</p>
                    <ul className="list-disc list-inside space-y-1 text-left">
                      <li>Make sure you're using the correct email and password</li>
                      <li>Check if you have an account - if not, please sign up first</li>
                      <li>Verify that email/password authentication is enabled in Firebase Console</li>
                      <li>Try resetting your password if you've forgotten it</li>
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

            {/* Sign In Button - Exact Canva styling */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-[#0C2440] text-white rounded-xl font-semibold hover:bg-[#0a1d33] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#0C2440] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link - Below main button, exact Canva spacing */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-[#D4B77A] hover:text-[#C4A76A] font-semibold transition-colors"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
