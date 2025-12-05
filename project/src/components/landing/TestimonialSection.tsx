import React from 'react';
import { Zap } from 'lucide-react';

const TestimonialSection: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Centered testimonial box with gradient */}
        <div 
          className="rounded-[30px] p-8 sm:p-10 md:p-12 lg:p-16 text-white text-center"
          style={{
            background: 'linear-gradient(to right, #0A2342 0%, #C4A64D 100%)',
          }}
        >
          {/* Lightning Icon */}
          <div className="flex justify-center mb-6">
            <Zap className="w-10 h-10 sm:w-12 sm:h-12 text-white" fill="white" />
          </div>

          {/* Title */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-8 sm:mb-10 text-white">
            ⚡ Speed is everything
          </h2>

          {/* Quote */}
          <blockquote className="text-xl sm:text-2xl lg:text-3xl font-medium mb-6 sm:mb-8 leading-relaxed text-white">
            "Mr.GYB cut my writing time by 90%."
          </blockquote>

          {/* Person Info */}
          <p className="text-base sm:text-lg text-white/90">
            — Sarah Jenkins, Founder @ TechFlow
          </p>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
