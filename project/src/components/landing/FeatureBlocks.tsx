import React from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  bgColor: string;
  textColor: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, bgColor, textColor }) => {
  return (
    <div 
      className="rounded-2xl p-8 sm:p-10 shadow-md hover:shadow-lg transition-all duration-300"
      style={{ 
        backgroundColor: bgColor,
        color: textColor,
        borderRadius: '16px',
        minHeight: '280px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      <div>
        <h3 className="text-2xl sm:text-3xl font-bold mb-4" style={{ color: textColor }}>
          {title}
        </h3>
        <p className="text-base sm:text-lg leading-relaxed" style={{ color: textColor, opacity: 0.95 }}>
          {description}
        </p>
      </div>
    </div>
  );
};

const FeatureBlocks: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {/* Card 1 - Culture Profile - Gold background */}
          <FeatureCard
            title="Culture Profile"
            description="Define your unique voice. Our AI learns your values and tone to ensure every piece of content feels authentically yours."
            bgColor="#D9B45F"
            textColor="#0A2342"
          />
          
          {/* Card 2 - Content Studio - Navy background, white text */}
          <FeatureCard
            title="Content Studio"
            description="Generate viral-ready scripts, hooks, and threads in seconds. Based on proven frameworks used by top creators."
            bgColor="#0A2342"
            textColor="#FFFFFF"
          />
          
          {/* Card 3 - Community - Gold background */}
          <FeatureCard
            title="Community"
            description="Track engagement trends and connect with other founders. See what's working in your niche right now."
            bgColor="#D9B45F"
            textColor="#0A2342"
          />
        </div>
      </div>
    </section>
  );
};

export default FeatureBlocks;
