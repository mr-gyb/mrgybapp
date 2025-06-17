import React from 'react';
import { ChevronLeft, Star, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Review {
  rating: number;
  comment: string;
  date: string;
}

const Reviews: React.FC = () => {
  const overallRating = 4.7;
  const reviews: Review[] = [
    {
      rating: 5,
      comment: "Excellent project management! Delivered on time and exceeded expectations.",
      date: "2023-04-15"
    },
    {
      rating: 4,
      comment: "Great customer support, always responsive to our needs.",
      date: "2023-04-14"
    },
    {
      rating: 5,
      comment: "Innovative solutions that helped streamline our business processes.",
      date: "2023-04-13"
    }
  ];

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-6 h-6 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-navy-blue min-h-screen text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Link to="/dashboard" className="mr-4">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold">Reviews</h1>
        </div>

        <div className="bg-white text-navy-blue rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-2">Overall Rating</h2>
          <div className="flex items-center">
            <span className="text-6xl font-bold mr-4">{overallRating}</span>
            {renderStars(overallRating)}
          </div>
        </div>

        <div className="space-y-4">
          {reviews.map((review, index) => (
            <div key={index} className="bg-white text-navy-blue rounded-lg p-6">
              <div className="flex justify-between items-center mb-2">
                {renderStars(review.rating)}
                <span className="text-gray-500">{review.date}</span>
              </div>
              <div className="flex items-start">
                <MessageCircle size={20} className="mr-2 mt-1 flex-shrink-0" />
                <p className="text-lg">{review.comment}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reviews;