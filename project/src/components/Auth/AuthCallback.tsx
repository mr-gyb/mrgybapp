import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../lib/firebase';
import { API_BASE } from "../../api/config";

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log("is it going here?1")
        // Check if we have an action code in the URL (for password reset, email verification, etc.)
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode');
        const actionCode = urlParams.get('oobCode');
        
        if (!mode) return;

        if (mode === 'resetPassword' && actionCode) {
          // Redirect to reset password page with the action code
          navigate(`/reset-password?oobCode=${actionCode}`);
          return;
        }
        
        if (mode === 'verifyEmail' && actionCode) {
          // Handle email verification
          // In a real app, you would verify the email here
          navigate('/login', { state: { message: 'Email verified successfully. Please login.' } });
          return;
        }
        
        /* If no specific action, check if we have a session
        const currentUser = auth.currentUser;
        if (currentUser) {
          navigate('/dashboard');
        } else {
          navigate('/login');
        } */
      } catch (err) {
        console.error('Auth callback error:', err);
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate]);

  useEffect(() => {
    (async () => {
      try {
        console.log("is it going here?2")
        const res = await fetch(`${API_BASE}/api/me`, { credentials: 'include' });
        const me = await res.json();
        if (me.authenticated) {
          const from = sessionStorage.getItem("postLoginFrom") || "/homepage";
          navigate(from, { replace: true });
        } else {
          navigate("/login?error=oauth", { replace: true });
        }
      } catch (e) {
        navigate("/login?error=network", { replace: true });
      }
    })();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-navy-blue"></div>
    </div>
  );
};

export default AuthCallback;