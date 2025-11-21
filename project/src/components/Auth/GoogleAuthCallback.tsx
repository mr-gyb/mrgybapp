import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const GoogleAuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // API CALL (Verify the JWT in Spring Boot)
        const res = await fetch('http://localhost:8080/api/me', {
          credentials: 'omit', // Backend has credentials: false, so we should omit
        });

        if (res.ok) {
          const data = await res.json()
          navigate('/dashboard');
          
        } else {
          navigate('/login');
        }
      } catch (err) {
        console.error(err);
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-navy-blue rounded-full"></div>
    </div>
  );
};

export default GoogleAuthCallback;
