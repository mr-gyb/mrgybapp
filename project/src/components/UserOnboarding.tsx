import React, { useState } from 'react';
import { Apple, Mail, Phone, ChevronDown, ArrowLeft, CheckCircle, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { createProfile } from '../services/profile.service';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';


const UserOnboarding: React.FC = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState(location.state?.email || '');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [birthday, setBirthday] = useState('');
  const [password, setPassword] = useState(location.state?.password || '');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userCredential, setUserCredential] = useState(location.state?.userCredential || null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [country, setCountry] = useState('US');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // for previewUrl
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleContinue = () => {
    setError('');
    
    // Step 0: Email/Password validation
    if (step === 0) {
      if (!email || !password) {
        setError('Please enter both email and password');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }
    }
    
    // Step 1: Name + Business + Industry validation
    if (step === 1) {
      if (!firstName || !lastName) {
        setError('Please enter your first and last name');
        return;
      }
      if (!businessName) {
        setError('Please enter your business name');
        return;
      }
      if (!industry) {
        setError('Please select your industry');
        return;
      }
    }
    
    // Step 2: Country validation (optional, but good to have)
    if (step === 2 && !country) {
      setError('Please select your country');
      return;
    }
    
    // Step 3: Profile image (optional step)
    // Step 4: Final step - create account
    if (step === 4) {
      handleFinish();
      return;
    }
    
    setStep(step + 1);
  };

  // for getting the initial to display the profile
  const getInitials = (first: string, last: string) => {
    const f = first?.[0]?.toUpperCase() || '';
    const l = last?.[0]?.toUpperCase() || '';
    return `${f}${l}` || "No Name";
  };

  // for tracking the file change(profile)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleFinish = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Create user account first
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const currentUser = userCredential.user;
      
      console.log('Account created successfully for:', email);

      // Upload profile image if selected
      let profileImageUrl = null;
      if (selectedFile) {
        const storage = getStorage();
        const imageRef = ref(storage, `profile-images/${currentUser.uid}`);
        await uploadBytes(imageRef, selectedFile);
        profileImageUrl = await getDownloadURL(imageRef);
      }
      
      // Create user profile
      await createProfile(currentUser.uid, {
        email,
        name: `${firstName} ${lastName}`,
        businessName: businessName,
        industry: industry,
        username: `@${firstName.toLowerCase()}${lastName.toLowerCase()}`,
        profile_image_url: profileImageUrl || '',
        phoneNumber: phoneNumber || '',
        country: country,
        notificationsEnabled,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      console.log('Profile created successfully');
      navigate('/home');
      
    } catch (err: any) {
      console.error('Sign up error:', err);
      
      // Handle specific Firebase errors
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please try logging in instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please choose a stronger password.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(err.message || 'An error occurred during sign up. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-center space-x-2">
            {[0, 1, 2, 3, 4].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`w-3 h-3 rounded-full ${
                  stepNumber <= step ? 'bg-navy-blue' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-center text-sm text-gray-500 mt-2">
            Step {step + 1} of 5
          </p>
        </div>

        {step > 0 && (
          <button onClick={handleBack} className="mb-4 text-navy-blue">
            <ArrowLeft size={24} />
          </button>
        )}
        {step === 0 && (
          <>
            <h1 className="text-3xl font-bold mb-6 text-center">Welcome to GYB AI❗</h1>
            <h2 className="text-xl font-semibold mb-6 text-center text-gray-700">Create your account</h2>
            
            <div className="space-y-4">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
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
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-blue focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-blue focus:border-transparent"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-blue focus:border-transparent"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
            {/*
            <div className="space-y-4">
               remove the apple button and or button for now

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

            </div>
          </>
          */} 
        
        
        {step === 1 && (
          <>
            <h2 className="text-2xl font-bold mb-4">What's your name?</h2>
            <div className="space-y-4">
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-navy-blue dark:text-black"
              />
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-navy-blue dark:text-black"
              />
              <input
                id="businessName"
                name="businessName"
                data-testid="onboard-businessName"
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Business name"
                className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-navy-blue dark:text-black"
              />
              <select
                id="industry"
                name="industry"
                data-testid="onboard-industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 appearance-none focus:outline-none focus:ring-2 focus:ring-navy-blue dark:text-black"
              >
                <option value="">Select industry</option>
                <option value="Technology">Technology</option>
                <option value="Marketing">Marketing</option>
                <option value="Consulting">Consulting</option>
                <option value="Health & Wellness">Health & Wellness</option>
                <option value="Legal">Legal</option>
                <option value="Design">Design</option>
                <option value="Finance">Finance</option>
                <option value="Education">Education</option>
                <option value="Retail">Retail</option>
                <option value="Manufacturing">Manufacturing</option>
              </select>
            </div>
          </>
        )}
        {step === 2 && (
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
        {/*
        {step === 3 && (
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
          */}
        {step === 3 && (
          <>
            <h2 className="text-2xl font-bold mb-4 dark:text-black">Profile Image</h2>
            <div className="flex items-center justify-between space-x-4">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Profile Preview"
                  className="w-24 h-24 rounded-full object-cover border"
                  />
              ) : (
                <div className='w-24 h-24 rounded-full bg-gray-300 text-blue flex items-center justify-center text-2xl font-bold'>
                  {getInitials(firstName, lastName)}
                </div>
              )}

              <label className="cursor-pointer bg-gold text-white px-4 py-2 rounded hover:bg-yellow-600">
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div className="flex flex-col items-center justify-center space-y-4 dark:text-black animate-fade-in">
              <CheckCircle className="w-16 h-16 text-green-500 animate-bounce" />
              <span className="text-center">Your account has been created successfully and is ready to use! 🎉</span>
            </div>
          </>
        )}

        {error && <p className="text-red-500 mt-2">{error}</p>}
        <button
          onClick={handleContinue}
          disabled={isLoading}
          className="w-full bg-navy-blue text-white rounded-full py-3 px-4 font-semibold mt-6 hover:bg-opacity-90 transition duration-300 disabled:opacity-50"
        >
          {isLoading ? 'Creating Account...' : step === 4 ? 'Create Account' : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default UserOnboarding;