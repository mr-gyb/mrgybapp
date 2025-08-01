import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, AlertCircle, LogIn, UserPlus, Apple } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useLocation } from 'react-router-dom';


const SignIn: React.FC = () => {
  // for getting the location state
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // modify to have the current mode state so that it can be used in signup mode.
  const [mode, setMode] = useState<'signup' | 'login'>(location.state?.mode || 'login');
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const result = await signIn(email, password);
        if (result.error) {
          throw result.error; 
        }
        navigate('/dashboard');
      } else {
        
        await createUserWithEmailAndPassword(auth, email, password);
        navigate('/onboarding', { state: { email, password } });
      }
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Try logging in instead.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email format.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else if (err.code === 'auth/invalid-credential') {
        setError('No Email Existed or Wrong Password');
      } else {
        setError('Something went wrong. Please try again.');
      }
      console.error('Authentication error:', err);
    }finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="flex justify-center mb-8">
          <img src="/gyb-logo.svg" alt="GYB Logo" className="h-12" />
        </div>

        <div className="bg-white shadow-md rounded-lg p-8">
          <div className="flex justify-center space-x-4 mb-8">
            <button
              onClick={() => setMode('login')}
              className={`flex items-center px-6 py-2 rounded-full ${
                mode === 'login'
                  ? 'bg-navy-blue text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <LogIn size={20} className="mr-2" />
              Login
            </button>
            <button 
              onClick={() => setMode('signup')}
              className={`flex items-center px-6 py-2 rounded-full ${
                mode === 'signup'
                  ? 'bg-navy-blue text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <UserPlus size={20} className="mr-2" />
              Sign Up
            </button>
          </div>

          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            {mode === 'login' ? 'Welcome back!' : 'Create your account'}
          </h2>

          <button className="w-full bg-black text-white rounded-full py-3 px-4 font-semibold flex items-center justify-center mb-4">
            <Apple size={24} className="mr-2" />
            Continue with Apple
          </button>

          {/* signup mode only instruction*/}
          {mode === 'signup' && (
            <div className="mb-4 text-sm text-gray-600 bg-gray-100 rounded-md p-3">
              <ul className="list-disc pl-5">
                <li>Email format is required.</li>
                <li>Password should be at least 6 characters.</li>
              </ul>
            </div>
          )}

          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="px-4 text-gray-500">or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-navy-blue focus:border-navy-blue sm:text-sm dark:text-black"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-navy-blue focus:border-navy-blue sm:text-sm dark:text-black"
                  placeholder={mode === 'login' ? 'Enter your password' : 'Create a password'}
                />
              </div>
            </div>

            {mode === 'login' && (
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-sm font-medium text-navy-blue hover:text-navy-blue/80"
                >
                  Forgot your password?
                </button>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-navy-blue hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-blue disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Please wait...
                </span>
              ) : (
                <span className="flex items-center">
                  {mode === 'login' ? <LogIn className="mr-2" size={20} /> : <UserPlus className="mr-2" size={20} />}
                  {mode === 'login' ? 'Sign in' : 'Create account'}
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignIn;