import React, { useState } from 'react';
import { Apple, Mail, Phone, ChevronDown, ArrowLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { createProfile } from '../services/profile.service';

const UserOnboarding: React.FC = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState(location.state?.email || '');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [password, setPassword] = useState(location.state?.password || '');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [country, setCountry] = useState('US');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = () => {
    setError('');
    if (step === 0 && !phoneNumber && !email) {
      setError('Please enter a valid phone number or email');
      return;
    }
    if (step === 1 && (!firstName || !lastName)) {
      setError('Please enter your first and last name');
      return;
    }
    if (step === 2 && !birthday) {
      setError('Please enter your birthday');
      return;
    }
    if (step === 3 && !password) {
      setError('Please enter a password');
      return;
    }
    if (step === 4) {
      handleFinish();
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleFinish = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (userCredential.user) {
        // Create profile for the new user
        await createProfile(userCredential.user.uid, {
          email,
          name: `${firstName} ${lastName}`,
          username: `@${firstName.toLowerCase()}${lastName.toLowerCase()}`,
          phoneNumber,
          birthday,
          notificationsEnabled,
          country
        });

        navigate('/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during sign up');
      console.error('Sign up error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {step > 0 && (
          <button onClick={handleBack} className="mb-4 text-navy-blue">
            <ArrowLeft size={24} />
          </button>
        )}
        {step === 0 && (
          <>
            <h1 className="text-3xl font-bold mb-6 text-center">Welcome to GYB AI</h1>
            <div className="space-y-4">
              <button className="w-full bg-black text-white rounded-full py-3 px-4 font-semibold flex items-center justify-center">
                <Apple size={24} className="mr-2" />
                Continue with Apple
              </button>
              <div className="flex items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="px-4 text-gray-500">or</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Phone number"
                className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-navy-blue dark:text-black"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-navy-blue dark:text-black"
              />
            </div>
          </>
        )}
        {step === 1 && (
          <>
            <h2 className="text-2xl font-bold mb-4">What's your name?</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-navy-blue dark:text-black"
              />
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-navy-blue dark:text-black"
              />
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <h2 className="text-2xl font-bold mb-4">When's your birthday?</h2>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-navy-blue dark:text-black"
            />
          </>
        )}
        {step === 3 && (
          <>
            <h2 className="text-2xl font-bold mb-4">Create a password</h2>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-navy-blue dark:text-black"
            />
          </>
        )}
        {step === 4 && (
          <>
            <h2 className="text-2xl font-bold mb-4 dark:text-black">Enable notifications</h2>
            <div className="flex items-center justify-between dark:text-black">
              <span>Receive notifications</span>
              <label className="relative inline-block w-14 h-7">
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  className="opacity-0 w-0 h-0"
                />
                <span className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors duration-300 ${notificationsEnabled ? 'bg-navy-blue' : 'bg-gray-300'}`}>
                  <span className={`absolute h-5 w-5 left-1 bottom-1 bg-white rounded-full transition-transform duration-300 ${notificationsEnabled ? 'transform translate-x-7' : ''}`}></span>
                </span>
              </label>
            </div>
          </>
        )}
        {step === 5 && (
          <>
            <h2 className="text-2xl font-bold mb-4">Select your country</h2>
            <div className="relative">
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 appearance-none focus:outline-none focus:ring-2 focus:ring-navy-blue dark:text-black"
              >
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="UK">United Kingdom</option>
                <option value="AU">Australia</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="JP">Japan</option>
                <option value="IN">India</option>
                <option value="BR">Brazil</option>
              </select>
              <ChevronDown size={24} className="absolute right-3 top-3 pointer-events-none" />
            </div>
          </>
        )}
        {error && <p className="text-red-500 mt-2">{error}</p>}
        <button
          onClick={handleContinue}
          disabled={isLoading}
          className="w-full bg-navy-blue text-white rounded-full py-3 px-4 font-semibold mt-6 hover:bg-opacity-90 transition duration-300 disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default UserOnboarding;