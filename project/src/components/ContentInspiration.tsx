import React, { useState } from 'react';
import { searchContentInspiration } from '../services/contentInspiration.service';

const ContentInspiration: React.FC = () => {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const topics = ['Marketing', 'Business', 'Technology', 'Writing'];

  const handlePlatformSelect = (platform: string) => {
    setSelectedPlatform(platform);
    // Reset topic selection when platform changes
    setSelectedTopic(null);
    setSearchError(null);
    // You can add navigation or other logic here when a platform is selected
    console.log('Selected platform:', platform);
  };

  const handleTopicSelect = (topic: string) => {
    setSelectedTopic(topic);
    setSearchError(null);
    // You can add logic here when a topic is selected
    console.log('Selected topic:', topic);
    console.log('Selected platform:', selectedPlatform);
  };

  const handleSearch = async () => {
    if (!selectedPlatform || !selectedTopic) {
      setSearchError('Please select both a platform and a topic');
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      console.log('Initiating search with:', { platform: selectedPlatform, topic: selectedTopic });
      const results = await searchContentInspiration(selectedPlatform, selectedTopic);
      console.log('Search results:', results);
      // TODO: Handle search results (display them, navigate to results page, etc.)
      // You can add navigation or state management here to show the results
    } catch (error) {
      console.error('Search failed:', error);
      setSearchError(error instanceof Error ? error.message : 'Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Title - Top Left */}
        <h1 className="text-3xl font-bold mb-8" style={{ color: '#11335d' }}>
          Content Inspiration
        </h1>

        {/* Main Content Card */}
        <div 
          className="bg-white rounded-lg max-w-4xl mx-auto transition-all duration-500 ease-in-out overflow-hidden"
          style={{ 
            border: '1px solid #000000',
            padding: '2rem',
            minHeight: isSearching ? '400px' : 'auto'
          }}
        >
          {isSearching ? (
            /* Thinking Visual - Shows when searching */
            <div className="flex flex-col items-center justify-center py-16">
              {/* Golden Circle with Dashed Border */}
              <div 
                className="relative flex items-center justify-center"
                style={{
                  width: '200px',
                  height: '200px'
                }}
              >
                {/* Dashed Dark Blue Border */}
                <div 
                  className="absolute inset-0 rounded-full"
                  style={{
                    border: '3px dashed #11335d',
                    width: '100%',
                    height: '100%'
                  }}
                ></div>
                
                {/* Golden Circle */}
                <div 
                  className="relative rounded-full flex items-center justify-center"
                  style={{
                    width: '180px',
                    height: '180px',
                    backgroundColor: '#D4AF37'
                  }}
                >
                  {/* Thinking Text */}
                  <span 
                    className="font-semibold"
                    style={{
                      color: '#11335d',
                      fontSize: '1.5rem'
                    }}
                  >
                    Thinking...
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Selection UI - Shows when not searching */
            <>
              {/* Select a Platform Section */}
              <div>
                <h2 className="text-2xl font-bold text-center mb-8" style={{ color: '#11335d' }}>
                  Select a Platform
                </h2>

                {/* Social Media Icons */}
                <div className="flex justify-center items-center gap-8 flex-wrap mb-8">
                  {/* Instagram */}
                  <div 
                    className={`w-20 h-20 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 shadow-lg relative ${
                      selectedPlatform === 'instagram' ? 'scale-110' : 'hover:scale-105'
                    }`}
                    style={{
                      backgroundColor: selectedPlatform === 'instagram' ? '#D4AF37' : 'white'
                    }}
                    onClick={() => handlePlatformSelect('instagram')}
                  >
                    <img 
                      src="/instagram-logo.png" 
                      alt="Instagram" 
                      className="w-12 h-12 object-contain relative z-10"
                    />
                  </div>

                  {/* Facebook */}
                  <div 
                    className={`w-20 h-20 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 shadow-lg relative ${
                      selectedPlatform === 'facebook' ? 'scale-110' : 'hover:scale-105'
                    }`}
                    style={{
                      backgroundColor: selectedPlatform === 'facebook' ? '#D4AF37' : 'white'
                    }}
                    onClick={() => handlePlatformSelect('facebook')}
                  >
                    <img 
                      src="/facebook-logo.png" 
                      alt="Facebook" 
                      className="w-12 h-12 object-contain relative z-10"
                    />
                  </div>

                  {/* YouTube */}
                  <div 
                    className={`w-20 h-20 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 shadow-lg relative ${
                      selectedPlatform === 'youtube' ? 'scale-110' : 'hover:scale-105'
                    }`}
                    style={{
                      backgroundColor: selectedPlatform === 'youtube' ? '#D4AF37' : 'white'
                    }}
                    onClick={() => handlePlatformSelect('youtube')}
                  >
                    <svg className="w-12 h-12 text-red-600 relative z-10" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </div>

                  {/* Pinterest */}
                  <div 
                    className={`w-20 h-20 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 shadow-lg relative ${
                      selectedPlatform === 'pinterest' ? 'scale-110' : 'hover:scale-105'
                    }`}
                    style={{
                      backgroundColor: selectedPlatform === 'pinterest' ? '#D4AF37' : 'white'
                    }}
                    onClick={() => handlePlatformSelect('pinterest')}
                  >
                    <img 
                      src="/pinterest-logo.png" 
                      alt="Pinterest" 
                      className="w-12 h-12 object-contain relative z-10"
                    />
                  </div>
                </div>
              </div>

              {/* Select a Topic Section - Appears when platform is selected */}
              {selectedPlatform && (
                <div 
                  className="transition-all duration-500 ease-in-out"
                  style={{
                    opacity: selectedPlatform ? 1 : 0,
                    maxHeight: selectedPlatform ? '500px' : '0',
                    overflow: 'hidden'
                  }}
                >
                  <div className="border-t border-gray-200 pt-8 mt-8">
                    <h2 className="text-2xl font-bold text-center mb-8" style={{ color: '#11335d' }}>
                      Select a Topic
                    </h2>

                    {/* Topic Options */}
                    <div className="flex justify-center items-center gap-8 flex-wrap mb-8">
                      {topics.map((topic) => (
                        <div
                          key={topic}
                          className={`cursor-pointer transition-all duration-300 px-4 py-2 rounded ${
                            selectedTopic === topic 
                              ? 'font-bold scale-110' 
                              : 'font-normal hover:scale-105'
                          }`}
                          style={{
                            color: selectedTopic === topic ? '#11335d' : '#4a5568',
                            fontSize: '1.125rem',
                            border: selectedTopic === topic ? '2px dashed #D4AF37' : '2px dashed transparent',
                            padding: selectedTopic === topic ? '0.5rem 1rem' : '0.5rem 1rem'
                          }}
                          onClick={() => handleTopicSelect(topic)}
                        >
                          {topic}
                        </div>
                      ))}
                    </div>

                    {/* Search Button - Appears when topic is selected */}
                    {selectedTopic && (
                      <div className="flex justify-center mt-4">
                        <button
                          onClick={handleSearch}
                          disabled={isSearching || !selectedPlatform || !selectedTopic}
                          className="px-8 py-3 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ 
                            backgroundColor: '#11335d',
                            minWidth: '120px'
                          }}
                          onMouseEnter={(e) => {
                            if (!isSearching && selectedPlatform && selectedTopic) {
                              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#0f2a4a';
                            }
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#11335d';
                          }}
                        >
                          Search
                        </button>
                      </div>
                    )}

                    {/* Error Message */}
                    {searchError && (
                      <div className="mt-4 text-center">
                        <p className="text-red-600 text-sm">{searchError}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentInspiration;

