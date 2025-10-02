import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-navy-blue">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Cannnot find the page
          </h2>
          <p className="text-gray-500 mb-8">
            requested page might be moved or never existed 
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => navigate(-1)}
            className="w-full flex items-center justify-center px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Go back to the previous page
          </button>
          
          <Link
            to="/dashboard"
            className="w-full flex items-center justify-center px-6 py-3 bg-navy-blue text-white rounded-lg hover:bg-navy-blue/90 transition-colors"
          >
            <Home size={20} className="mr-2" />
            Go to Dashboard.
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
