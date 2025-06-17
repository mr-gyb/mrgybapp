import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface VerificationStepProps {
  onVerificationComplete: () => void;
  contactMethod: 'phone' | 'email';
  contactValue: string;
}

const VerificationStep: React.FC<VerificationStepProps> = ({
  onVerificationComplete,
  contactMethod,
  contactValue,
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleVerify = async () => {
    setIsLoading(true);
    setError('');

    try {
      // In a real application, you would verify the code with your backend
      if (verificationCode === '123456') {
        await onVerificationComplete();
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during verification');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Verify your account</h2>
      <p>
        We've sent a verification code to your {contactMethod === 'phone' ? 'phone number' : 'email address'}{' '}
        <strong>{contactValue}</strong>. Please enter it below:
      </p>
      <input
        type="text"
        value={verificationCode}
        onChange={(e) => setVerificationCode(e.target.value)}
        placeholder="Verification code"
        className="w-full bg-white border border-gray-300 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-navy-blue"
        disabled={isLoading}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        onClick={handleVerify}
        disabled={isLoading}
        className="w-full bg-navy-blue text-white rounded-full py-3 px-4 font-semibold hover:bg-opacity-90 transition duration-300 text-center disabled:opacity-50"
      >
        {isLoading ? 'Verifying...' : 'Verify'}
      </button>
    </div>
  );
};

export default VerificationStep;