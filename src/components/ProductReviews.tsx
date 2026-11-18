import React, { useState, useEffect } from 'react';
import {
  getReviewsForProduct,
  submitCustomerReview,
  syncReviewsFromCloudflare,
  type CustomerReview
} from '../stores/reviewStore';

interface ProductReviewsProps {
  productId: string;
  productName: string;
  averageRating: number;
  totalReviewCount: number;
}

const INPUT_CLASS =
  'block w-full border border-[#d8d0c4] bg-white px-3.5 py-2.5 text-[12.5px] leading-relaxed text-[#14110f] outline-none transition-colors placeholder:text-[#9a938b] focus:border-[#14110f]';

const LABEL_CLASS =
  'mb-1.5 block text-[9px] font-medium uppercase tracking-[0.16em] text-[#6f675f]';

function Stars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const dim = size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5';
  return (
    <div className="flex items-center gap-[3px] text-[#c5a059]" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`${dim} ${i < rating ? 'fill-current' : 'fill-[#ded5c7]'}`}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
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

  // Form state
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [filterRating, setFilterRating] = useState<number | null>(null);

  useEffect(() => {
    setReviews(getReviewsForProduct(productId));

    // Real-time sync from Cloudflare D1
    syncReviewsFromCloudflare(productId).then((fetched) => {
      if (Array.isArray(fetched)) {
        setReviews(fetched.filter((r) => !r.productId || r.productId === productId));
      }
    });

    const handleNewReview = () => {
      setReviews(getReviewsForProduct(productId));
    };

    window.addEventListener('satvastones:review_added', handleNewReview);
    window.addEventListener('satvastones:reviews_synced', handleNewReview);
    return () => {
      window.removeEventListener('satvastones:review_added', handleNewReview);
      window.removeEventListener('satvastones:reviews_synced', handleNewReview);
    };
  }, [productId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;

    submitCustomerReview({
      productId,
      productName,
      authorName: name.trim(),
      city: city.trim() || 'India',
      rating: selectedRating,
      title: title.trim() || 'Customer review',
      content: content.trim(),
      // Badges are earned through an order match, never by self-declaration.
      verifiedBuyer: false
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

  const reviewCount = Math.max(totalReviewCount, reviews.length);
  const score = averageRating > 0 ? averageRating : 0;
  const scoreLabel = reviewCount > 0 ? score.toFixed(1) : '—';

  return (
    <section
      className="mt-16 border-t border-[#e5ded3] pt-12 sm:mt-24 sm:pt-16"
      aria-labelledby="product-reviews-title"
    >
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        {/* Summary rail */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 lg:self-start">
          <p className="eyebrow text-[#8d3f3d]">Patron reviews</p>
          <h2
            id="product-reviews-title"
            className="font-display mt-2 text-[2rem] leading-[1.02] sm:text-[2.6rem]"
          >
            Worn daily.
            <br />
            Reviewed honestly.
          </h2>
          <p className="mt-3 max-w-xs text-[12.5px] leading-relaxed text-[#5f5851]">
            Real feedback on showers, sweat, sizing and finish — from patrons who wear the piece
            through an Indian summer.
          </p>

          <div className="mt-7 border-y border-[#e5ded3] py-5">
            <div className="flex items-end gap-4">
              <span className="font-display text-[3.2rem] leading-[0.8] text-[#14110f]">
                {scoreLabel}
              </span>
              <div className="pb-0.5">
                <Stars rating={Math.round(score)} size="md" />
                <p className="mt-1.5 text-[9px] uppercase tracking-[0.16em] text-[#8a8279]">
                  {reviewCount > 0 ? `${reviewCount} patron reviews` : 'Awaiting first review'}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsWriting((prev) => !prev)}
            className="mt-6 inline-flex w-full cursor-pointer items-center justify-center gap-2 bg-[#14110f] px-6 py-3.5 text-[10px] uppercase tracking-[0.16em] text-[#f6f1e8] transition-colors hover:bg-[#8d3f3d] sm:w-auto"
          >
            {isWriting ? 'Close the form' : 'Write a review'}
            <span aria-hidden="true">{isWriting ? '×' : '→'}</span>
          </button>

          <p className="mt-3 flex items-start gap-2 text-[10px] leading-relaxed text-[#8a8279]">
            <span className="mt-0.5 text-[#c5a059]" aria-hidden="true">
              ✦
            </span>
            <span>Reviews publish immediately. Only confirmed purchases carry a verified badge.</span>
          </p>
        </div>

        {/* Form + list */}
        <div className="lg:col-span-8">
          {/* Write a review */}
          {isWriting && (
            <div className="mb-10 border border-[#e0d7c9] bg-[#f4efe7]">
              {isSubmitted ? (
                <div className="px-6 py-14 text-center sm:px-10">
                  <span
                    className="mx-auto flex h-11 w-11 items-center justify-center border border-[#cfe3d6] bg-[#f0f7f2] text-[#2f7d5a]"
                    aria-hidden="true"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.6}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </span>
                  <h3 className="font-display mt-4 text-[1.8rem] leading-tight">
                    Thank you — it's live.
                  </h3>
                  <p className="mx-auto mt-2 max-w-sm text-[12px] leading-relaxed text-[#5f5851]">
                    Your review for {productName} is published and visible to every shopper on
                    this page.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-5 sm:p-8">
                  <div className="border-b border-[#e0d7c9] pb-4">
                    <p className="text-[9px] uppercase tracking-[0.18em] text-[#c5a059]">
                      Your experience
                    </p>
                    <h3 className="font-display mt-1.5 text-[1.6rem] leading-tight">
                      Review {productName}
                    </h3>
                    <p className="mt-1 text-[11.5px] leading-relaxed text-[#6f675f]">
                      Say how it holds up to water, sweat, sizing and daily wear.
                    </p>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="review-name" className={LABEL_CLASS}>
                        Full name *
                      </label>
                      <input
                        id="review-name"
                        type="text"
                        required
                        autoComplete="name"
                        placeholder="e.g. Priya Sharma"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={INPUT_CLASS}
                      />
                    </div>
                    <div>
                      <label htmlFor="review-city" className={LABEL_CLASS}>
                        City <span className="normal-case tracking-normal">(optional)</span>
                      </label>
                      <input
                        id="review-city"
                        type="text"
                        autoComplete="address-level2"
                        placeholder="e.g. Mumbai, Maharashtra"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className={INPUT_CLASS}
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <span className={LABEL_CLASS}>Your rating *</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const active = (hoverRating || selectedRating) >= star;
                        return (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setSelectedRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="cursor-pointer p-1 transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[#14110f]"
                            aria-label={`${star} star${star > 1 ? 's' : ''}`}
                            aria-pressed={selectedRating === star}
                          >
                            <svg
                              className={`h-6 w-6 ${active ? 'fill-[#c5a059]' : 'fill-[#ded5c7]'}`}
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </button>
                        );
                      })}
                      <span className="ml-1.5 text-[11px] font-medium text-[#14110f]">
                        {selectedRating} of 5
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label htmlFor="review-title" className={LABEL_CLASS}>
                      Review headline *
                    </label>
                    <input
                      id="review-title"
                      type="text"
                      required
                      placeholder="e.g. Three months of daily showers, zero green marks"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className={INPUT_CLASS}
                    />
                  </div>

                  <div className="mt-4">
                    <label htmlFor="review-content" className={LABEL_CLASS}>
                      Detailed feedback *
                    </label>
                    <textarea
                      id="review-content"
                      required
                      rows={4}
                      placeholder="How does the finish feel? How has it held up to water and sweat? Anything on sizing or delivery worth knowing?"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className={`${INPUT_CLASS} resize-y`}
                    />
                  </div>

                  <div className="mt-5 flex flex-col gap-3 border-t border-[#e0d7c9] pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="flex items-center gap-1.5 text-[10px] leading-relaxed text-[#8a8279]">
                      <span className="text-[#2f7d5a]" aria-hidden="true">
                        ✓
                      </span>
                      Published immediately · verified badge only after order match
                    </p>
                    <button
                      type="submit"
                      className="cursor-pointer bg-[#14110f] px-6 py-3 text-[10px] uppercase tracking-[0.16em] text-[#f6f1e8] transition-colors hover:bg-[#8d3f3d]"
                    >
                      Publish review <span aria-hidden="true">→</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-[#e5ded3] pb-3">
            <span className="text-[9px] uppercase tracking-[0.18em] text-[#8a8279]">Filter</span>
            <button
              type="button"
              onClick={() => setFilterRating(null)}
              className={`cursor-pointer border-b pb-0.5 text-[10px] uppercase tracking-[0.14em] transition-colors ${
                filterRating === null
                  ? 'border-[#14110f] text-[#14110f]'
                  : 'border-transparent text-[#8a8279] hover:text-[#14110f]'
              }`}
            >
              All ({reviews.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterRating(5)}
              className={`flex cursor-pointer items-center gap-1.5 border-b pb-0.5 text-[10px] uppercase tracking-[0.14em] transition-colors ${
                filterRating === 5
                  ? 'border-[#14110f] text-[#14110f]'
                  : 'border-transparent text-[#8a8279] hover:text-[#14110f]'
              }`}
            >
              5 stars <span className="text-[#c5a059]">★</span>
            </button>
          </div>

          {/* Review list */}
          {displayedReviews.length === 0 ? (
            <div className="mt-8 border border-[#e5ded3] bg-[#f4efe7] px-6 py-12 text-center">
              <p className="font-display text-[1.4rem] leading-tight">No reviews in this filter.</p>
              <button
                type="button"
                onClick={() => setIsWriting(true)}
                className="link-line mt-3 cursor-pointer text-[10px] uppercase tracking-[0.14em] text-[#14110f]"
              >
                Be the first to review this piece
              </button>
            </div>
          ) : (
            <div className="mt-2 divide-y divide-[#e5ded3] border-b border-[#e5ded3]">
              {displayedReviews.map((rev) => (
                <article key={rev.id} className="py-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#e5ded3] bg-[#f4efe7] font-display text-[13px] leading-none text-[#8d3f3d]"
                        aria-hidden="true"
                      >
                        {rev.authorName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-[12.5px] font-medium text-[#14110f]">
                            {rev.authorName}
                          </h3>
                          {rev.verifiedBuyer && (
                            <span className="inline-flex items-center gap-1 border border-[#cfe3d6] bg-[#f0f7f2] px-1.5 py-0.5 text-[8px] uppercase tracking-[0.12em] text-[#2f7d5a]">
                              ✓ Verified buyer
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-[10px] uppercase tracking-[0.1em] text-[#8a8279]">
                          {rev.city} · {rev.date}
                        </p>
                      </div>
                    </div>

                    <Stars rating={rev.rating} />
                  </div>

                  <div className="mt-3.5">
                    <h4 className="text-[12.5px] font-medium leading-snug text-[#14110f]">
                      {rev.title}
                    </h4>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-[#4a443f]">
                      {rev.content}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
