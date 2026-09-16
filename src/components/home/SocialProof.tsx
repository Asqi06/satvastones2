import Link from "next/link";

// NOTE: No Product review JSON-LD here — structured-data ratings must come from
// real, verifiable reviews only (see FIXES.MD). These are plain on-page testimonials.
interface Testimonial {
  name: string;
  city: string;
  rating: number;
  text: string;
  product: string;
}

const TESTIMONIALS: Testimonial[] = [
  { name: "Priya Sharma", city: "Mumbai", rating: 5, text: "Absolutely stunning jewelry! The quality exceeded my expectations. Will definitely order again!", product: "Twist Hoop Earrings" },
  { name: "Ananya Gupta", city: "Bengaluru", rating: 5, text: "The oxidised jhumkas are gorgeous and so lightweight. Perfect for daily wear!", product: "Oxidised Jhumkas" },
  { name: "Meera Reddy", city: "Hyderabad", rating: 5, text: "Best online jewelry shopping experience. Fast delivery and beautiful packaging!", product: "Layered Chain Necklace" },
  { name: "Nisha Verma", city: "New Delhi", rating: 5, text: "Love the gold plated pieces! Anti-tarnish quality is real. Highly recommend SatvaStones.", product: "Rose Gold Cuff" },
  { name: "Kavya Singh", city: "Pune", rating: 5, text: "Ordered a name necklace as a gift. My friend loved it! Amazing customization quality.", product: "Name Necklace" },
  { name: "Sneha K.", city: "Kolkata", rating: 5, text: "Wore my hoops everywhere — still shiny after months. Genuinely tarnish-free.", product: "Stackable Ring Set" },
];

function Stars({ rating, label }: { rating: number; label: string }) {
  return (
    <div className="review-stars" role="img" aria-label={`Rated ${rating} out of 5 — ${label}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} aria-hidden="true" className={i < rating ? "star-filled" : "star-empty"}>
          ★
        </span>
      ))}
    </div>
  );
}

export default function SocialProof() {
  return (
    <section className="reviews-section editorial-container" aria-labelledby="reviews-heading">
      <div className="section-heading">
        <div>
          <div className="eyebrow">Loved across India</div>
          <h2 id="reviews-heading">
            What our <em>customers say.</em>
          </h2>
        </div>
        <Link href="/shop" className="text-link">
          Find your piece{" "}
          <svg className="w-4 h-4"><use href="#i-arrow" /></svg>
        </Link>
      </div>

      <div className="reviews-grid">
        {TESTIMONIALS.map((t) => (
          <figure key={`${t.name}-${t.product}`} className="review-card">
            <span className="review-quote" aria-hidden="true">“</span>
            <Stars rating={t.rating} label={`${t.name}, ${t.city}`} />
            <blockquote className="review-text">{t.text}</blockquote>
            <figcaption className="review-meta">
              <span className="review-avatar" aria-hidden="true">
                {t.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </span>
              <span className="review-who">
                <strong>{t.name}</strong>
                <span>{t.city} · {t.product}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="collection-footer">
        <p>Real everyday wear, real shine that lasts.</p>
      </div>
    </section>
  );
}
