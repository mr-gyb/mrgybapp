import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { error: authError } = await signIn(email, password);
    if (authError) {
      setError(authError.message || 'Failed to log in');
    } else {
      navigate('/home');
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-xs">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <img src="/gyb-logo.png" alt="GYB Logo" className="h-24 object-contain" />
        </div>

        {/* Login card */}
        <div className="bg-white border border-[#11335d] rounded-2xl px-5 py-4 shadow-sm">
          <h1 className="text-lg md:text-xl font-extrabold text-center text-[#11335d] mb-3">
            Welcome back!
          </h1>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email field */}
            <div className="space-y-1">
              <label
                className="text-sm font-semibold text-[#11335d]"
                htmlFor="email"
              >
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-4 flex items-center text-[#11335d]">
                  ✉️
                </span>
                <input
                  id="email"
                  type="email"
                  placeholder="Email Address"
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#11335d] focus:outline-none focus:ring-2 focus:ring-[#11335d] text-xs md:text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1">
              <label
                className="text-sm font-semibold text-[#11335d]"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-4 flex items-center text-[#11335d]">
                  🔒
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  className="w-full pl-10 pr-10 py-2 rounded-xl border border-[#11335d] focus:outline-none focus:ring-2 focus:ring-[#11335d] text-xs md:text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-4 flex items-center text-[#11335d]"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}

            {/* Remember me / Forgot password */}
            <div className="flex items-center justify-between text-[11px] md:text-xs text-[#11335d] mt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 border-[#11335d] rounded"
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                className="hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            {/* Primary login button (after remember me) */}
            <button
              type="submit"
              className="w-full mt-2 py-2 rounded-full bg-[#11335d] text-white font-semibold hover:bg-[#0b2440] transition-colors text-xs md:text-sm"
            >
              Login
            </button>

            {/* OR separator */}
            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-gray-300" />
              <span className="text-xs text-gray-500">OR</span>
              <div className="flex-1 h-px bg-gray-300" />
            </div>

            {/* Social buttons */}
            <div className="space-y-3">
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 py-2 rounded-full bg-black text-white text-xs md:text-sm font-medium"
              >
                <span className="text-lg"></span>
                <span>Continue with Apple</span>
              </button>
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 py-2 rounded-full border border-[#11335d] text-xs md:text-sm font-medium text-[#11335d] bg-white"
              >
                <span className="text-lg">G</span>
                <span>Continue with Google</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
