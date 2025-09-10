import React from 'react';

const TestImage: React.FC = () => {
  const imageUrl = "https://firebasestorage.googleapis.com/v0/b/mr-gyb-ai-app-108.firebasestorage.app/o/profile-images%2FMr.GYB_AI.png?alt=media&token=40ed698e-e2d0-45ff-b33a-508683c51a58";
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Test Mr.GYB AI Image</h2>
      <div className="flex items-center space-x-4">
        <img
          src={imageUrl}
          alt="Mr.GYB AI Test"
          className="w-16 h-16 rounded-full object-cover"
          onError={(e) => {
            console.error('Image failed to load:', e.currentTarget.src);
            e.currentTarget.style.display = 'none';
          }}
          onLoad={() => {
            console.log('Image loaded successfully!');
          }}
        />
        <div>
          <p className="text-sm text-gray-600">URL: {imageUrl}</p>
          <p className="text-sm text-gray-600">Status: Check console for load/error messages</p>
        </div>
      </div>
    </div>
  );
};

export default TestImage;
