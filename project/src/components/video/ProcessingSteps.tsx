import React, { useState, useEffect } from 'react';

interface ProcessingStepsProps {
  onComplete: () => void;
}

const steps = [
  { id: 1, text: 'Extracting audio', emoji: '🎵' },
  { id: 2, text: 'Transcribing text', emoji: '🎤' },
  { id: 3, text: 'Analyzing content', emoji: '🧠' }
];

const ProcessingSteps: React.FC<ProcessingStepsProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [visibleSteps, setVisibleSteps] = useState<number[]>([]);

  useEffect(() => {
    // Show first step immediately
    if (visibleSteps.length === 0) {
      setVisibleSteps([0]);
      setCurrentStep(1);
    }
  }, []);

  useEffect(() => {
    // Show steps sequentially
    if (currentStep < steps.length) {
      const timer = setTimeout(() => {
        setVisibleSteps(prev => [...prev, currentStep]);
        setCurrentStep(prev => prev + 1);
      }, 2000); // 2 seconds per step

      return () => clearTimeout(timer);
    } else if (currentStep === steps.length && visibleSteps.length === steps.length) {
      // All steps animation complete - notify parent
      // Note: Actual processing might still be running, parent will handle transition
      const timer = setTimeout(() => {
        onComplete();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [currentStep, visibleSteps.length, onComplete]);

  return (
    <div className="border-2 border-dashed rounded-2xl p-8 max-w-2xl mx-auto" style={{ borderColor: '#D4AF37' }}>
      <h3 className="text-2xl font-bold text-black text-center mb-8">
        Processing Video
      </h3>

      <div className="space-y-6">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-center space-x-4 transition-all duration-700 ease-out ${
              visibleSteps.includes(index)
                ? 'opacity-100 transform translate-x-0'
                : 'opacity-0 transform translate-x-6'
            }`}
            style={{
              transitionDelay: `${index * 200}ms`
            }}
          >
            {/* Step Circle */}
            <div className="relative">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-700"
                style={{
                  border: `3px solid #11335d`,
                  backgroundColor: visibleSteps.includes(index) ? 'white' : '#11335d',
                  boxShadow: visibleSteps.includes(index)
                    ? '0 4px 12px rgba(17, 51, 93, 0.15)'
                    : '0 2px 8px rgba(17, 51, 93, 0.3)'
                }}
              >
                <span
                  className="text-lg font-bold transition-all duration-700"
                  style={{
                    color: visibleSteps.includes(index) ? '#11335d' : 'white'
                  }}
                >
                  {step.id}
                </span>
              </div>
              {/* Golden ring */}
              {visibleSteps.includes(index) && (
                <div
                  className="absolute inset-0 rounded-full border-2 pointer-events-none animate-pulse"
                  style={{ borderColor: '#D4AF37' }}
                ></div>
              )}
            </div>

            {/* Step Text */}
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{step.emoji}</span>
              <span className="text-lg text-black">{step.text}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProcessingSteps;

