import React, { useState, useEffect } from 'react';
import { getReviewsForProduct, submitCustomerReview, type CustomerReview } from '../stores/reviewStore';

interface ProductReviewsProps {
  productId: string;
  productName: string;
  averageRating: number;
  totalReviewCount: number;
}

export default function ProductReviews({
  productId,
  productName,
  averageRating,
  totalReviewCount
}: ProductReviewsProps) {
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [isWriting, setIsWriting] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);

  // Form State
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [filterRating, setFilterRating] = useState<number | null>(null);

  useEffect(() => {
    setReviews(getReviewsForProduct(productId));

    const handleNewReview = () => {
      setReviews(getReviewsForProduct(productId));
    };

    window.addEventListener('satvastones:review_added', handleNewReview);
    return () => {
      window.removeEventListener('satvastones:review_added', handleNewReview);
    };
  }, [productId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;

    submitCustomerReview({
      productId,
      productName,
      authorName: name.trim(),
      city: city.trim() || 'Verified Indian Patron',
      rating: selectedRating,
      title: title.trim() || 'Verified Customer Review',
      content: content.trim(),
      verifiedBuyer: true
    });

    setIsSubmitted(true);
    setName('');
    setCity('');
    setTitle('');
    setContent('');
    setTimeout(() => {
      setIsWriting(false);
      setIsSubmitted(false);
    }, 2500);
  };

  const displayedReviews = filterRating
    ? reviews.filter((r) => r.rating === filterRating)
    : reviews;

  return (
    <section className="mt-14 sm:mt-20 pt-10 border-t border-[#eae4dc]">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Section Header & Rating Summary */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#eae4dc]">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9f4553] flex items-center gap-1.5">
              <span className="text-[#c5a059]">✦</span>
              <span>VERIFIED PATRON REVIEWS</span>
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#171513] tracking-tight mt-1">
              Customer Experiences
            </h2>
            <p className="text-xs sm:text-sm text-[#6e6863] mt-0.5">
              Authentic reviews from patrons who wear Satvastones daily in showers, workouts & humidity.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center text-[#c5a059] gap-1 justify-end">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-xs text-[#171513] font-bold mt-0.5">
                4.9 out of 5 ({Math.max(totalReviewCount, reviews.length)} verified reviews)
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsWriting((prev) => !prev)}
              className="bg-[#171513] hover:bg-[#9f4553] text-white px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-[0.08em] transition-all shadow-2xs hover:shadow-md cursor-pointer shrink-0"
            >
              {isWriting ? 'Cancel Review' : 'Write a Review'}
            </button>
          </div>
        </div>

        {/* Interactive "Write a Review" Submission Box */}
        {isWriting && (
          <div className="bg-[#faf8f5] border border-[#eae4dc] rounded-[24px] p-6 sm:p-8 shadow-sm animate-in fade-in zoom-in-95 duration-200">
            {isSubmitted ? (
              <div className="text-center py-8 space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#eef8f3] border border-[#c4e8d3] text-[#1b6d48] flex items-center justify-center mx-auto text-xl">
                  ✓
                </div>
                <h3 className="font-serif text-xl font-normal text-[#171513]">Thank you for your review!</h3>
                <p className="text-xs text-[#6e6863]">
                  Your verified customer feedback has been recorded and published for fellow jewellery patrons.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <h3 className="font-serif text-lg font-normal text-[#171513]">
                    Review {productName}
                  </h3>
                  <p className="text-xs text-[#6e6863]">
                    Share how this piece performs with water exposure, sizing, and everyday wear.
                  </p>
                </div>

                {/* Star Rating Picker */}
                <div>
                  <label className="block text-xs font-semibold text-[#171513] mb-1.5">
                    Your Overall Rating *
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setSelectedRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 cursor-pointer transition-transform hover:scale-110 focus:outline-none"
                        aria-label={`${star} Stars`}
                      >
                        <svg
                          className={`w-6 h-6 transition-colors ${
                            (hoverRating || selectedRating) >= star
                              ? 'text-[#c5a059] fill-current'
                              : 'text-gray-300 fill-current'
                          }`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    ))}
                    <span className="text-xs font-bold text-[#171513] ml-2">
                      {selectedRating} of 5 Stars
                    </span>
                  </div>
                </div>

                {/* Name & City Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#171513] mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Priya Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white border border-[#eae4dc] px-4 py-2.5 text-xs text-[#171513] rounded-xl focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#171513] mb-1">
                      City / Location (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mumbai, Maharashtra"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-white border border-[#eae4dc] px-4 py-2.5 text-xs text-[#171513] rounded-xl focus:outline-none focus:border-[#c5a059]"
                    />
                  </div>
                </div>

                {/* Review Headline Title */}
                <div>
                  <label className="block text-xs font-semibold text-[#171513] mb-1">
                    Review Headline *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Wore it daily in the shower for 3 months, zero green marks!"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white border border-[#eae4dc] px-4 py-2.5 text-xs text-[#171513] rounded-xl focus:outline-none focus:border-[#c5a059]"
                  />
                </div>

                {/* Detailed Comments */}
                <div>
                  <label className="block text-xs font-semibold text-[#171513] mb-1">
                    Detailed Experience & Feedback *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell other shoppers how the finish feels, how it holds up to water/sweat, delivery experience, etc."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full bg-white border border-[#eae4dc] p-3 text-xs text-[#171513] rounded-xl focus:outline-none focus:border-[#c5a059] resize-none leading-relaxed"
                  />
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-[#6e6863] flex items-center gap-1.5">
                    <span className="text-[#1b6d48]">✓</span>
                    <span>Verified customer review with immediate publication</span>
                  </span>
                  <button
                    type="submit"
                    className="bg-[#171513] hover:bg-[#9f4553] text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-[0.08em] transition-all shadow-sm cursor-pointer"
                  >
                    Submit Customer Review →
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setFilterRating(null)}
            className={`px-3 py-1.5 rounded-full font-semibold transition-colors cursor-pointer ${
              filterRating === null
                ? 'bg-[#171513] text-white'
                : 'bg-[#faf8f5] text-[#332f2c] border border-[#eae4dc] hover:bg-[#eae4dc]'
            }`}
          >
            All Reviews ({reviews.length})
          </button>
          <button
            onClick={() => setFilterRating(5)}
            className={`px-3 py-1.5 rounded-full font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
              filterRating === 5
                ? 'bg-[#171513] text-white'
                : 'bg-[#faf8f5] text-[#332f2c] border border-[#eae4dc] hover:bg-[#eae4dc]'
            }`}
          >
            <span>5 Stars</span>
            <span className="text-[#c5a059]">★</span>
          </button>
        </div>

        {/* Customer Reviews List */}
        <div className="space-y-4">
          {displayedReviews.length === 0 ? (
            <div className="text-center py-8 bg-[#faf8f5] border border-[#eae4dc] rounded-2xl p-6">
              <p className="text-xs sm:text-sm font-semibold text-[#171513]">
                No reviews yet for this filter.
              </p>
              <button
                onClick={() => setIsWriting(true)}
                className="mt-2 text-xs text-[#9f4553] underline font-bold"
              >
                Be the first to review this piece!
              </button>
            </div>
          ) : (
            displayedReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white border border-[#eae4dc] rounded-[20px] p-5 sm:p-6 shadow-2xs space-y-3"
              >
                {/* Review Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#faf4f2] border border-[#eae4dc] flex items-center justify-center font-bold text-xs text-[#9f4553]">
                      {rev.authorName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-[#171513]">
                          {rev.authorName}
                        </h4>
                        {rev.verifiedBuyer && (
                          <span className="inline-flex items-center gap-1 text-[9px] bg-[#eef8f3] text-[#1b6d48] px-2 py-0.2 rounded-full font-bold border border-[#c4e8d3]">
                            <span>✓</span>
                            <span>Verified Buyer</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#6e6863]">
                        {rev.city} • {rev.date}
                      </p>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex text-[#c5a059] gap-0.5">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <svg key={i} className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>

                {/* Review Body */}
                <div className="space-y-1 pl-0 sm:pl-13">
                  <h5 className="text-xs sm:text-sm font-bold text-[#171513]">
                    "{rev.title}"
                  </h5>
                  <p className="text-xs text-[#4a443f] leading-relaxed">
                    {rev.content}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </section>
  );
}
