import React from 'react';
import { Link } from 'react-router-dom';

const SignUpCTA: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0A2342] mb-6 sm:mb-8">
          Ready to upgrade your workflow?
        </h2>
        
        <p className="text-lg sm:text-xl text-gray-700 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed">
          Join 10,000+ creators using AI to scale their personal brands.
        </p>
        
        <p className="text-base sm:text-lg text-gray-600 mb-8 sm:mb-12 max-w-2xl mx-auto">
          Sign up for free today.
        </p>

        <Link
          to="/signup"
          className="inline-block px-8 sm:px-12 py-4 sm:py-5 bg-[#0A2342] text-white rounded-full font-semibold text-base sm:text-lg hover:bg-[#0C2A4F] transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Sign Up
        </Link>
      </div>
    </section>
  );
};

export default SignUpCTA;
