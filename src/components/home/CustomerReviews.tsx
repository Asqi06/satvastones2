"use client";

import { Star } from "lucide-react";

interface Review {
  _id: string;
  name: string;
  location?: string;
  rating: number;
  comment: string;
  avatar?: string;
}

export default function CustomerReviews({ reviews }: { reviews: Review[] }) {
  if (!reviews || reviews.length === 0) return null;

  return (
    <section className="py-6 sm:py-8 lg:py-14" style={{ background: '#f79da6' }}>
      <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-8">
        <p className="text-center text-[9px] sm:text-[10px] lg:text-xs font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[#d4535f] mb-1 sm:mb-2">
          Absolute Satisfaction
        </p>
        <h2 className="font-heading text-lg sm:text-xl lg:text-3xl font-bold text-center text-gray-900 mb-4 sm:mb-6 lg:mb-10 italic">
          Customer Reviews
        </h2>
        
        <div className="flex gap-2.5 sm:gap-3 lg:gap-5 overflow-x-auto no-scrollbar pb-2">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="flex-shrink-0 w-[70%] sm:w-[45%] lg:w-80 bg-white rounded-lg lg:rounded-xl p-3 sm:p-4 lg:p-5 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                {review.avatar && (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#f2707f] flex items-center justify-center text-white text-xs sm:text-sm font-bold shrink-0">
                    {review.avatar}
                  </div>
                )}
                <div>
                  <p className="text-xs sm:text-sm font-bold text-gray-900">{review.name}</p>
                  {review.location && (
                    <p className="text-[9px] sm:text-[10px] text-gray-400">{review.location}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-0.5 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 ${
                      i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"
                    }`}
                  />
                ))}
              </div>
              <p className="text-[11px] sm:text-xs lg:text-sm text-gray-600 leading-relaxed mb-2 lg:mb-3 line-clamp-3">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
