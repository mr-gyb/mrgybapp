import React, { useState } from 'react';
import { ChevronLeft, Upload, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const CreateGroup: React.FC = () => {
  const navigate = useNavigate();
  const [groupData, setGroupData] = useState({
    name: '',
    description: '',
    privacy: 'public',
    image: ''
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle group creation
    navigate('/gyb-live-network');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Link to="/gyb-live-network" className="mr-4">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold">Create New Group</h1>
        </div>

        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
            {/* Group Image */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group Image
              </label>
              <div className="relative">
                {imagePreview ? (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Group preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setImagePreview(null)}
                      className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label
                        htmlFor="group-image"
                        className="cursor-pointer bg-navy-blue text-white px-4 py-2 rounded-full hover:bg-opacity-90"
                      >
                        Upload Image
                      </label>
                      <input
                        id="group-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Group Name */}
            <div className="mb-6">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Group Name
              </label>
              <input
                type="text"
                id="name"
                value={groupData.name}
                onChange={(e) => setGroupData({ ...groupData, name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-navy-blue"
                required
              />
            </div>

            {/* Group Description */}
            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={groupData.description}
                onChange={(e) => setGroupData({ ...groupData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-navy-blue"
                required
              />
            </div>

            {/* Privacy Settings */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Privacy
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="public"
                    checked={groupData.privacy === 'public'}
                    onChange={(e) => setGroupData({ ...groupData, privacy: e.target.value })}
                    className="mr-2"
                  />
                  Public - Anyone can see and join
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="private"
                    checked={groupData.privacy === 'private'}
                    onChange={(e) => setGroupData({ ...groupData, privacy: e.target.value })}
                    className="mr-2"
                  />
                  Private - Members must be approved
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-navy-blue text-white px-6 py-2 rounded-full hover:bg-opacity-90"
              >
                Create Group
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateGroup;