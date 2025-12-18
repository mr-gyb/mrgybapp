import React, { useState } from 'react';
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
      if (res.error) {
        setError(res.error.message || 'Invalid credentials');
      } else {
        navigate('/home');
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

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

          <div className="space-y-3 mb-6">
            <button 
              onClick={() => signInWithApple().then(r => !r?.error && navigate('/home'))} 
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-black text-white rounded-full font-medium"
            >
              <Apple size={20} /> Continue with Apple
            </button>
            <button 
              onClick={() => signInWithGoogle().then(r => !r?.error && navigate('/home'))} 
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border border-gray-300 text-gray-700 rounded-full font-medium"
            >
              Continue with Google
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"/></div>
            <div className="relative flex justify-center text-sm"><span className="px-3 bg-white text-gray-500 font-medium uppercase">OR</span></div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#0C2440] mb-2.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-gray-400"/></div>
                <input id="email" type="email" className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#11335d]" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#0C2440] mb-2.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-gray-400"/></div>
                <input id="password" type={showPassword ? 'text' : 'password'} className="w-full pl-10 pr-10 py-2 rounded-xl border border-[#11335d]" value={password} onChange={e => setPassword(e.target.value)} />
                <button type="button" className="absolute inset-y-0 right-3.5 flex items-center" onClick={() => setShowPassword(s => !s)}>{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
              </div>
            </div>

            {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg mt-2">{error}</div>}

            <button type="submit" disabled={isLoading} className="w-full mt-4 py-2 rounded-full bg-[#11335d] text-white font-semibold">Login</button>

<<<<<<< Updated upstream
            <div className="mt-6 text-center"><p className="text-sm text-gray-600">Don't have an account? <Link to="/signup" className="text-[#D4B77A] font-semibold">Sign Up</Link></p></div>
=======
            {/* Sign In Button - Exact Canva styling */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-[#0C2440] text-white rounded-xl font-semibold hover:bg-[#0a1d33] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#0C2440] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              Login
            </button>

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
>>>>>>> Stashed changes
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
