import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, BarChart2 } from 'lucide-react';

const CreatePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            {/* GYB Avatar/Logo */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-opacity-20" style={{ borderColor: '#11335d' }}>
                  <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'white' }}>
                    <img 
                      src="/images/team/mrgyb-ai.png"
                      alt="Mr. GYB AI"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-black text-2xl font-bold" style="background-color: white;">GYB</div>';
                      }}
                    />
                  </div>
                </div>
                {/* Golden Border Overlay */}
                <div className="absolute inset-0 rounded-2xl border-2 border-yellow-400 pointer-events-none"></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => navigate('/gyb-studio/create')}
                className="px-8 py-4 text-white font-semibold rounded-lg hover:bg-opacity-90 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                style={{ backgroundColor: '#11335d' }}
              >
                <Play size={20} />
                Create
              </button>
              <button
                onClick={() => navigate('/gyb-studio')}
                className="px-8 py-4 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <BarChart2 size={20} />
                Analyze
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;

