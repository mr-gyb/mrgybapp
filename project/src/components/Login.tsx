import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Apple, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const { signIn, signInWithGoogle, signInWithApple, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!email.trim() || !password) {
      setError('Please enter your email and password');
      setIsLoading(false);
      return;
    }

    try {
      const res = await signIn(email, password);
      if ((res as any)?.error) {
        setError((res as any).error?.message || 'Invalid credentials');
      } else {
        navigate('/home');
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    if (!isMountedRef.current) return;
    
    setIsLoading(true);
    setError(null);
    resetLoadingWithTimeout();
    
    try {
      const result = await signInWithApple();
      
      if (!isMountedRef.current) {
        setIsLoading(false);
        return;
      }
      
      if ((result as any)?.error) {
        const errorCode = (result as any).error?.code;
        const errorMessage = (result as any).error?.message || 'Apple sign in failed. Please try again.';
        
        // Handle popup closed/cancelled gracefully
        if (errorCode === 'auth/popup-closed-by-user' || errorCode === 'auth/cancelled-popup-request') {
          setError(null);
        } else {
          setError(errorMessage);
        }
        setIsLoading(false);
      } else {
        navigate('/home');
      }
    } catch (err: any) {
      if (!isMountedRef.current) {
        setIsLoading(false);
        return;
      }
      
      const errorCode = err?.code;
      if (errorCode === 'auth/popup-closed-by-user' || errorCode === 'auth/cancelled-popup-request') {
        setError(null);
      } else {
        setError(err?.message || 'An error occurred during Apple sign in.');
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
    setError(null);
    resetLoadingWithTimeout();
    
    try {
      const result = await signInWithGoogle();
      
      if (!isMountedRef.current) {
        setIsLoading(false);
        return;
      }
      
      if ((result as any)?.error) {
        const errorCode = (result as any).error?.code;
        const errorMessage = (result as any).error?.message || 'Google sign in failed. Please try again.';
        
        // Handle popup closed/cancelled gracefully
        if (errorCode === 'auth/popup-closed-by-user' || errorCode === 'auth/cancelled-popup-request') {
          // User cancelled - don't show error, just reset state
          setError(null);
        } else {
          setError(errorMessage);
        }
        setIsLoading(false);
      } else {
        navigate('/home');
      }
    } catch (err: any) {
      if (!isMountedRef.current) {
        setIsLoading(false);
        return;
      }
      
      const errorCode = err?.code;
      // Handle popup closed/cancelled gracefully
      if (errorCode === 'auth/popup-closed-by-user' || errorCode === 'auth/cancelled-popup-request') {
        setError(null);
      } else {
        setError(err?.message || 'An error occurred during Google sign in.');
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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8 sm:mb-10">
          <div className="mx-auto h-16 w-16 rounded-full border-2 border-[#D9B45F] flex items-center justify-center">
            <span className="text-2xl font-bold text-[#D9B45F]">GYB</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-10 border border-[#C9D1E0]" style={{ borderRadius: '16px' }}>
          <h1 className="text-2xl font-bold text-[#0C2440] text-center mb-8">Welcome back!</h1>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#0C2440] mb-2.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input id="email" type="email" className="block w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4B77A] focus:border-[#D4B77A] transition-colors text-sm" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#0C2440] mb-2.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input id="password" type={showPassword ? 'text' : 'password'} className="block w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4B77A] focus:border-[#D4B77A] transition-colors text-sm" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" className="absolute inset-y-0 right-0 pr-3.5 flex items-center hover:opacity-70 transition-opacity" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-[#D4B77A] focus:ring-[#D4B77A] border-gray-300 rounded cursor-pointer" />
                <label htmlFor="remember-me" className="ml-2.5 block text-sm text-[#0C2440] cursor-pointer font-normal">Remember me</label>
              </div>
              <Link to="/forgot-password" className="text-sm text-[#D4B77A] hover:text-[#C4A76A] font-medium transition-colors">Forgot Password?</Link>
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg space-y-2 mt-4">
                <div className="font-medium whitespace-pre-line text-left">{error}</div>
              </div>
            )}

            <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-[#0C2440] text-white rounded-xl font-semibold hover:bg-[#0a1d33] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#0C2440] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6">
              Login
            </button>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">Don't have an account? <Link to="/signup" className="text-[#D4B77A] hover:text-[#C4A76A] font-semibold transition-colors">Sign Up</Link></p>
            </div>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-500 font-medium uppercase">OR</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleAppleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-black text-white rounded-full font-medium hover:bg-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Apple size={20} className="text-white" />
              Continue with Apple
            </button>

            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
