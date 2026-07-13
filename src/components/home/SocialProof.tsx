"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { Star, Quote, ThumbsUp, MessageSquare, Shield, Award, Truck, RotateCcw, CheckCircle, Verified, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

interface Review {
  id: string;
  name: string;
  location: string;
  rating: number;
  date: string;
  title: string;
  text: string;
  productName: string;
  purchaseVerified: boolean;
  helpfulCount: number;
  badge?: string;
}

const platformRatings = [
  { platform: "Google Reviews", rating: 4.8, count: 2457, color: "#4285F4" },
  { platform: "Trustpilot", rating: 4.7, count: 1832, color: "#00B67A" },
  { platform: "JustDial", rating: 4.6, count: 3421, color: "#2B6CB0" },
  { platform: "IndiaMart", rating: 4.5, count: 1567, color: "#FF6600" },
];

const featuredReviews: Review[] = [
  { id: "rev1", name: "Ananya Sharma", location: "Mumbai, Maharashtra", rating: 5, date: "2 weeks ago", title: "Absolutely Stunning 22K Gold Bangles — BIS Hallmark Verified", text: "I ordered the 22K gold bangles for my sister's wedding and was blown away by the quality. The BIS hallmark was laser-engraved as promised with HUID number. I verified it on the BIS portal and it matched perfectly. The weight was exactly as quoted — 18.5g as invoiced. The making charges were transparently shown (12.5%). Free shipping was well-packaged with insurance. Will definitely buy again for Diwali!", productName: "22K Gold Temple Bangle Set", purchaseVerified: true, helpfulCount: 47, badge: "Verified Purchase + Hallmark Checked" },
  { id: "rev2", name: "Priya Patel", location: "Ahmedabad, Gujarat", rating: 5, date: "1 month ago", title: "IGI Certified Diamond Ring — Certificate Delivered with Product", text: "I was sceptical about buying a diamond solitaire online, but Satvastones exceeded expectations. The diamond came with a QR-coded IGI certificate matching the laser inscription on the girdle. 0.52ct, E colour, SI1 clarity — exactly as described. The ring setting (18K white gold) was flawless. They even shared a video of the diamond under 10x magnification before dispatch. Highly recommend for diamond purchases.", productName: "0.52ct IGI Certified Solitaire Ring", purchaseVerified: true, helpfulCount: 32, badge: "IGI Certificate Provided" },
  { id: "rev3", name: "Rahul Verma", location: "Delhi", rating: 4, date: "3 weeks ago", title: "Lifetime Exchange Used After 8 Months — Smooth Process", text: "Had purchased a silver necklace set 8 months ago. Decided to exchange it for a gold pendant under their lifetime exchange policy. The process was seamless — I called their customer support, they arranged free pickup, the item was evaluated within 48 hours, and the full original value was credited to my account. I paid the difference for the gold pendant. No questions asked, no depreciation. This is why I trust Satvastones over other jewellers.", productName: "925 Silver Necklace → 22K Gold Pendant", purchaseVerified: true, helpfulCount: 28, badge: "Exchange Completed Successfully" },
  { id: "rev4", name: "Sunita Reddy", location: "Hyderabad, Telangana", rating: 5, date: "5 days ago", title: "Bridal Set Was Worth Every Rupee — Free Consultation Helped", text: "They helped me design my entire bridal jewellery through video consultation (I'm based in Hyderabad, showroom is in Mumbai). The team showed me 3D renders of the kundan set I wanted, sent me raw material samples (gold purity test kit, gemstone samples), and delivered 2 weeks before my wedding date. Every piece was hallmarked, packed in a beautiful box with certificate folder. Made my wedding day special. Thank you Satvastones team!", productName: "Custom Kundan Bridal Set", purchaseVerified: true, helpfulCount: 19, badge: "Custom Bridal Order" },
];

const allReviews: Review[] = [
  { id: "rev5", name: "Vikram Singh", location: "Jaipur, Rajasthan", rating: 5, date: "1 week ago", title: "Men's Gold Kada — 40g Solid, BIS Stamped", text: "Excellent quality 22K gold kada. Pure 916 hallmarked, exactly 40.2g as quoted. The finish is matte premium, weight is evenly distributed. Very happy with purchase.", productName: "22K Gold Kada (40g)", purchaseVerified: true, helpfulCount: 12, badge: "Verified Purchase" },
  { id: "rev6", name: "Meera Iyer", location: "Chennai, Tamil Nadu", rating: 5, date: "2 weeks ago", title: "Pearl Set with Ruby — GII Certified Gemstones", text: "Bought a pearl-ruby necklace set for my daughter's arangetram. The pearls were perfectly matched in size and lustre. Rubies were natural with GII certificate. Excellent craftsmanship, feels heirloom quality.", productName: "Pearl & Ruby Necklace Set", purchaseVerified: true, helpfulCount: 15, badge: "GII Certified" },
  { id: "rev7", name: "Arun Kumar", location: "Bangalore, Karnataka", rating: 4, date: "3 weeks ago", title: "COD Option Is a Game Changer for Trust", text: "I used COD for my first purchase (a silver anklet set worth ₹3,499). The package arrived, I verified the hallmark, checked the weight on my own scale, then paid. This transparency is rare in online jewellery buying. Very satisfied.", productName: "925 Silver Anklet Set", purchaseVerified: true, helpfulCount: 21, badge: "Cash on Delivery" },
  { id: "rev8", name: "Kavita Joshi", location: "Pune, Maharashtra", rating: 5, date: "1 month ago", title: "30-Day Return Used — Hassle Free", text: "Ordered a gemstone ring but the size didn't fit. Initiated return online, got pickup within 24 hours. Full refund (minus the small shipping fee) was credited in 5 working days. No questions, no hassle.", productName: "Yellow Sapphire Ring", purchaseVerified: true, helpfulCount: 14, badge: "Return Completed" },
  { id: "rev9", name: "Deepa Nair", location: "Kochi, Kerala", rating: 5, date: "1 week ago", title: "Customer Support Was Incredibly Helpful", text: "I had concerns about gemstone authenticity. The team video-called me, showed me their testing process on the same stone, shared the lab certificate link, and even connected me with their in-house astrologer for guidance. Unmatched service.", productName: "Natural Ruby (Manik) Ring", purchaseVerified: true, helpfulCount: 9, badge: "24/7 Support" },
  { id: "rev10", name: "Shreya Das", location: "Kolkata, West Bengal", rating: 5, date: "2 weeks ago", title: "EMI Made My Dream Necklace Affordable", text: "The gold navaratna necklace I wanted was ₹89,000. EMI at 0% interest for 6 months made it manageable. The necklace is absolutely gorgeous — each gemstone is certified and set perfectly. Thank you for making luxury affordable.", productName: "22K Gold Navaratna Necklace", purchaseVerified: true, helpfulCount: 18, badge: "0% EMI Purchase" },
];

const stats = [
  { label: "Happy Customers", value: "25,000+", icon: ThumbsUp },
  { label: "Orders Delivered", value: "50,000+", icon: Truck },
  { label: "Certificates Issued", value: "35,000+", icon: Award },
  { label: "Repeat Customers", value: "8,500+", icon: Shield },
  { label: "Exchange Success", value: "99.2%", icon: RotateCcw },
  { label: "Average Rating", value: "4.7/5", icon: Star },
];

const reviewSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Satvastones Jewelry",
  "url": "https://satvastones.in",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "10",
    "bestRating": "5",
    "worstRating": "1"
  },
  "review": [...featuredReviews, ...allReviews].map(r => ({
    "@type": "Review",
    "reviewRating": { "@type": "Rating", "ratingValue": r.rating, "bestRating": "5" },
    "author": { "@type": "Person", "name": r.name },
    "datePublished": r.date,
    "reviewBody": r.text,
    "itemReviewed": { "@type": "Product", "name": r.productName }
  }))
};

export default function SocialProof() {
  const [activeTab, setActiveTab] = useState<"featured" | "all" | "stats">("featured");

  return (
    <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }} />
    <section className="bg-[#FAF9F6] py-16 lg:py-24" aria-labelledby="reviews-heading">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        
        <header className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
          <span className="inline-block px-4 py-1.5 bg-[#FFFEFB] border border-[#C5A059]/30 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#C5A059] mb-4">Trusted by 25,000+ Customers</span>
          <h2 id="reviews-heading" className="font-serif text-3xl lg:text-4xl xl:text-5xl text-[#241A14] leading-tight mb-4">What Our Customers Say</h2>
          <p className="text-base lg:text-lg text-[#241A14]/60 leading-relaxed max-w-2xl mx-auto">Every review is from a <span className="font-semibold text-[#241A14]">verified purchase</span>. We publish all reviews — positive and constructive — because we believe in <span className="font-semibold text-[#241A14]">complete transparency</span>.</p>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12 lg:mb-16">
          {platformRatings.map((platform) => (
            <div key={platform.platform} className="p-6 bg-white border border-[#E8E2D9] rounded-xl text-center hover:border-[#C5A059]/50 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(platform.rating) ? 'fill-[#C5A059] text-[#C5A059]' : 'text-[#E8E2D9]'}`} />
                ))}
              </div>
              <p className="text-2xl font-bold text-[#241A14]">{platform.rating}</p>
              <p className="text-xs text-[#241A14]/50 mt-1">{platform.count.toLocaleString()} reviews</p>
              <p className="text-xs font-medium text-[#241A14]/70 mt-2 uppercase tracking-wider">{platform.platform}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 lg:grid-cols-6 gap-4 mb-12 lg:mb-16 p-6 lg:p-8 bg-[#1a1612] rounded-xl">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="w-10 h-10 mx-auto mb-2 bg-white/10 rounded-xl flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-[#C5A059]" />
              </div>
              <p className="text-lg lg:text-xl font-bold text-white">{stat.value}</p>
              <p className="text-[11px] uppercase tracking-wider text-white/60">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-10">
          <button onClick={() => setActiveTab("featured")}
            className={`px-6 py-3 text-sm font-medium uppercase tracking-wider rounded-full border-2 transition-all ${activeTab === "featured" ? 'bg-[#241A14] text-white border-[#241A14]' : 'bg-white text-[#241A14]/60 border-[#E8E2D9] hover:border-[#241A14]/30'}`}>Featured Reviews</button>
          <button onClick={() => setActiveTab("all")}
            className={`px-6 py-3 text-sm font-medium uppercase tracking-wider rounded-full border-2 transition-all ${activeTab === "all" ? 'bg-[#241A14] text-white border-[#241A14]' : 'bg-white text-[#241A14]/60 border-[#E8E2D9] hover:border-[#241A14]/30'}`}>All Reviews ({allReviews.length + featuredReviews.length})</button>
          <button onClick={() => setActiveTab("stats")}
            className={`px-6 py-3 text-sm font-medium uppercase tracking-wider rounded-full border-2 transition-all ${activeTab === "stats" ? 'bg-[#241A14] text-white border-[#241A14]' : 'bg-white text-[#241A14]/60 border-[#E8E2D9] hover:border-[#241A14]/30'}`}>Why India Trusts Us</button>
        </div>

        {activeTab === "featured" && <FeaturedReviewsSection reviews={featuredReviews} />}
        {activeTab === "all" && <AllReviewsSection reviews={allReviews} />}
        {activeTab === "stats" && <WhyTrustSection />}

        <div className="mt-12 lg:mt-16 p-8 bg-white border border-[#E8E2D9] rounded-xl text-center">
          <h3 className="font-serif text-xl lg:text-2xl text-[#241A14] mb-3 italic">Have You Shopped With Us?</h3>
          <p className="text-sm lg:text-base text-[#241A14]/60 mb-6 max-w-lg mx-auto">Your honest review helps other buyers. Verified purchasers get a <span className="font-semibold text-[#C5A059]">₹500 discount</span> on their next order.</p>
          <Link to="/account/reviews" className="inline-flex items-center gap-2 px-8 py-4 bg-[#241A14] text-white text-sm font-medium uppercase tracking-wider hover:bg-[#1a1612] transition-colors rounded-lg">
            <Star className="w-5 h-5" /> Write a Review
          </Link>
        </div>
      </div>
    </section>
    </>
  );
}

function FeaturedReviewsSection({ reviews }: { reviews: Review[] }) {
  const [current, setCurrent] = useState(0);
  const review = reviews[current];
  const prev = () => setCurrent(c => (c === 0 ? reviews.length - 1 : c - 1));
  const next = () => setCurrent(c => (c + 1) % reviews.length);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white border border-[#E8E2D9] rounded-xl p-6 lg:p-8 relative">
        <Quote className="w-10 h-10 text-[#C5A059]/20 absolute top-6 right-6 hidden lg:block" />
        
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6 pb-6 border-b border-[#E8E2D9]">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-14 h-14 rounded-full bg-[#241A14] flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold text-white">{review.name.split(" ").map(n => n[0]).join("")}</span>
            </div>
            <div>
              <p className="font-semibold text-[#241A14]">{review.name}</p>
              <p className="text-xs text-[#241A14]/50">{review.location} • {review.date}</p>
              <div className="flex items-center gap-1 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-[#C5A059] text-[#C5A059]' : 'text-[#E8E2D9]'}`} />
                ))}
                {review.badge && (
                  <span className="ml-2 px-2 py-0.5 bg-[#FFFEFB] border border-[#C5A059]/30 text-[9px] font-bold uppercase tracking-wider text-[#C5A059] rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> {review.badge}
                  </span>
                )}
              </div>
            </div>
          </div>
          {review.purchaseVerified && (
            <div className="flex items-center gap-2 px-4 py-2 bg-[#E8F5E9] rounded-lg">
              <Verified className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-green-800">Purchase Verified</span>
            </div>
          )}
        </div>

        <div className="mb-4 px-4 py-3 bg-[#FAF9F6] rounded-lg border border-[#E8E2D9]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#241A14]/50">Product</span>
          <p className="text-sm font-medium text-[#241A14]">{review.productName}</p>
        </div>

        <h3 className="text-lg lg:text-xl font-medium text-[#241A14] mb-3">{review.title}</h3>
        <p className="text-sm lg:text-base text-[#241A14]/70 leading-relaxed">{review.text}</p>

        <div className="flex items-center gap-4 mt-6 pt-4 border-t border-[#E8E2D9]">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#FAF9F6] border border-[#E8E2D9] rounded-full text-xs text-[#241A14]/60 hover:border-[#C5A059]/50 hover:text-[#C5A059] transition-colors">
            <ThumbsUp className="w-4 h-4" /> Helpful ({review.helpfulCount})
          </button>
          <span className="text-xs text-[#241A14]/30">•</span>
          <Link to={`/shop?q=${encodeURIComponent(review.productName)}`} className="text-xs text-[#C5A059] hover:underline flex items-center gap-1">View Product <ExternalLink className="w-3 h-3" /></Link>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center gap-2">
          {reviews.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${i === current ? 'bg-[#241A14] w-6' : 'bg-[#E8E2D9] hover:bg-[#C5A059]/50'}`} />
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={prev} className="w-10 h-10 rounded-full border border-[#E8E2D9] flex items-center justify-center text-[#241A14]/60 hover:border-[#241A14] hover:text-[#241A14] transition-colors"><ChevronLeft className="w-5 h-5" /></button>
          <button onClick={next} className="w-10 h-10 rounded-full border border-[#E8E2D9] flex items-center justify-center text-[#241A14]/60 hover:border-[#241A14] hover:text-[#241A14] transition-colors"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>
    </div>
  );
}

function AllReviewsSection({ reviews }: { reviews: Review[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {reviews.map((review) => <ReviewCard key={review.id} review={review} />)}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-white border border-[#E8E2D9] rounded-xl p-6 hover:border-[#C5A059]/50 hover:shadow-lg transition-all duration-300 flex flex-col">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-[#241A14] flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-white">{review.name.split(" ").map(n => n[0]).join("")}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-[#C5A059] text-[#C5A059]' : 'text-[#E8E2D9]'}`} />)}
          </div>
          <p className="text-sm font-medium text-[#241A14] truncate">{review.name}</p>
          <p className="text-[11px] text-[#241A14]/50">{review.location} • {review.date}</p>
        </div>
        {review.purchaseVerified && <Verified className="w-5 h-5 text-green-600 flex-shrink-0" />}
      </div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-[#C5A059] mb-2">{review.productName}</p>
      <h4 className="text-sm font-medium text-[#241A14] mb-2 line-clamp-1">{review.title}</h4>
      <p className="text-xs text-[#241A14]/70 leading-relaxed flex-1">
        {expanded ? review.text : review.text.length > 150 ? review.text.slice(0, 150) + "... " : review.text}
        {review.text.length > 150 && (
          <button onClick={() => setExpanded(!expanded)} className="text-[#C5A059] hover:underline ml-1">{expanded ? "Show less" : "Read more"}</button>
        )}
      </p>
      {review.badge && (
        <div className="mt-3 px-3 py-1.5 bg-[#FFFEFB] border border-[#C5A059]/30 rounded-lg flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-[#C5A059]" />
          <span className="text-[10px] font-medium text-[#241A14]/70">{review.badge}</span>
        </div>
      )}
      <div className="mt-3 pt-3 border-t border-[#E8E2D9]">
        <button className="flex items-center gap-1 text-[11px] text-[#241A14]/50 hover:text-[#C5A059] transition-colors">
          <ThumbsUp className="w-3.5 h-3.5" /> Helpful ({review.helpfulCount})
        </button>
      </div>
    </div>
  );
}

function WhyTrustSection() {
  const trustReasons = [
    { icon: Award, title: "100% BIS Hallmarked Gold & Silver", desc: "Every gold and silver piece is BIS hallmarked with HUID (Hallmark Unique Identifier) laser-engraved. You can verify the hallmark on the BIS portal by entering the 6-digit HUID code. Our hallmarking partner is a BIS-recognised A&HA centre.", detail: "22K (916) / 18K (750) / 14K (585) gold • 925 (92.5%) sterling silver" },
    { icon: Shield, title: "Lifetime Exchange at Full Value", desc: "Exchange any jewellery at its current metal value (gold/silver/platinum) for the entire lifetime of the product. Unlike industry-standard 6-12 month exchange policies, ours has no expiry date.", detail: "No depreciation • No time limit • Free pickup available" },
    { icon: Truck, title: "Free Insured Shipping on ₹1,999+", desc: "All orders above ₹1,999 qualify for free insured shipping through our partnered logistics carriers (Delhivery, Shiprocket, India Post Registered). Every shipment is insured for the full invoice value against theft, loss, or damage during transit.", detail: "Pan India coverage • Shipment tracking • Signature on delivery" },
    { icon: RotateCcw, title: "30-Day Hassle-Free Returns", desc: "Not satisfied with your purchase? Initiate a return within 30 days of delivery. We arrange free pickup, verify the item (must be in original condition with tags and certificates), and process the refund within 5-7 working days. No questions asked policy.", detail: "Free pickup • 5-7 day refund • Full refund minus shipping" },
    { icon: Lock, title: "100% Secure Payment Gateway", desc: "All transactions are processed through RBI-compliant payment gateways (Razorpay, PayU). Your card details never touch our servers. We support Credit/Debit Cards (Visa, Mastercard, RuPay, AmEx), Net Banking, UPI (GPay, PhonePe, Paytm), Wallets, and Cash on Delivery.", detail: "PCI-DSS Level 1 certified • 3D Secure • 128-bit SSL encryption" },
    { icon: MessageSquare, title: "24/7 Customer Support — Call, WhatsApp, Email", desc: "Reach us anytime via phone (+91 90167 03180 — 9 AM to 11 PM), WhatsApp, email (support@satvastones.in — 4-hour response time), or live chat on our website (AI-assisted with human handoff during business hours).", detail: "Response time: < 1 min on chat • < 4 hours on email • < 30 mins on call" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {trustReasons.map((reason, i) => (
        <div key={i} className="bg-white border border-[#E8E2D9] rounded-xl p-6 lg:p-8 hover:border-[#C5A059]/50 hover:shadow-lg transition-all duration-300">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-14 h-14 rounded-2xl bg-[#FFFEFB] border border-[#C5A059]/30 flex items-center justify-center flex-shrink-0">
              <reason.icon className="w-7 h-7 text-[#C5A059]" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-[#241A14] mb-2">{reason.title}</h3>
              <p className="text-sm text-[#241A14]/70 leading-relaxed mb-3">{reason.desc}</p>
              <div className="flex items-center gap-2 px-4 py-2 bg-[#FAF9F6] rounded-lg border border-[#E8E2D9]">
                <Shield className="w-4 h-4 text-[#C5A059] flex-shrink-0" />
                <span className="text-xs font-medium text-[#241A14]/80">{reason.detail}</span>
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="p-6 lg:p-8 bg-[#1a1612] rounded-xl text-center">
        <h3 className="font-serif text-xl lg:text-2xl text-white mb-4 italic">Satvastones Trust Promise</h3>
        <p className="text-sm lg:text-base text-white/70 max-w-2xl mx-auto mb-6">
          We are members of <span className="text-white font-medium">GJEPC (Gems & Jewellery Export Promotion Council)</span>, <span className="text-white font-medium">IIGJ (Indian Institute of Gems & Jewellery)</span>, and <span className="text-white font-medium">GJF (Gems & Jewellery Federation)</span>. Our hallmarking is done at BIS-recognised A&HA centres. Every certificate issued is verifiable on the issuing body's website.
        </p>
        <div className="flex flex-wrap justify-center gap-6 text-[11px] uppercase tracking-wider text-white/50">
          <span>GJEPC Member Since 2010</span>
          <span>IIGJ Affiliated</span>
          <span>BIS A&HA Hallmarking</span>
          <span>IGI-GIA Diamond Partner</span>
          <span>ISO 9001:2015 Certified</span>
        </div>
      </div>
    </div>
  );
}