import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping Policy | SatvaStones — Free Shipping Over ₹399",
  description: "SatvaStones offers free shipping on prepaid orders above ₹399 across India. Learn about our domestic and international shipping timelines, tracking, and COD availability for Korean aesthetic jewelry and accessories.",
  keywords: ["SatvaStones shipping", "free shipping India jewelry", "COD jewelry delivery", "jewelry delivery timeline India", "aesthetic jewelry shipping policy"],
  alternates: { canonical: "https://satvastones.in/shipping" },
};

export default function ShippingPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": "https://satvastones.in/shipping#faq",
    mainEntity: [
      {
        "@type": "Question",
        name: "Is shipping free on SatvaStones jewellery?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Prepaid orders above ₹399 ship free across India. Orders below ₹399 carry a nominal zone-based fee. COD is available with a small convenience fee.",
        },
      },
      {
        "@type": "Question",
        name: "How long does jewellery delivery take?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Dispatch in 24-48 hours. Metro cities 2-4 business days, Tier 2/3 cities 3-6 days, remote and North-East 5-8 days from dispatch.",
        },
      },
      {
        "@type": "Question",
        name: "How do I track my jewellery order?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You receive tracking by email on dispatch with end-to-end visibility. If tracking stalls over 7 days, email support@satvastones.in.",
        },
      },
    ],
  };

  return (
    <div className="bg-[var(--paper)] text-[var(--ink)] min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="editorial-container max-w-4xl py-10 lg:py-14">
        <div className="mb-10 lg:mb-14">
          <p className="eyebrow text-[var(--muted)] mb-6">Logistics</p>
          <h1 className="font-serif font-normal tracking-[-0.03em] text-[var(--ink)] text-5xl lg:text-7xl mb-8">Transit <em className="text-[var(--olive)]">Protocol</em></h1>
          <div className="h-px w-24 bg-[var(--olive)]"></div>
        </div>

        <div className="space-y-12 text-[var(--muted)] font-light leading-relaxed tracking-wide">
          <section className="space-y-8">
            <h2 className="font-serif font-normal tracking-[-0.03em] text-[var(--ink)] text-2xl lg:text-3xl border-b border-[var(--line)] pb-4">Global Curation</h2>
            <p>
              Every SatvaStones artifact is meticulously inspected and packaged at our Mumbai headquarters. We partner with elite global couriers including India Post, Delhivery, and professional logistics networks to ensure the integrity of your acquisition during transit. Each piece of Korean aesthetic jewelry, anti-tarnish earring set, and gold-plated necklace is individually cushioned and sealed in premium packaging designed to withstand the rigours of transportation.
            </p>
            <p>
              Our packaging materials are selected not only for protection but also for presentation — every SatvaStones order arrives in a signature artefact box suitable for gifting, accompanied by a care card that explains how to maintain the anti-tarnish and waterproof properties of your jewelry.
            </p>
          </section>

          <section className="space-y-8">
            <h2 className="font-serif font-normal tracking-[-0.03em] text-[var(--ink)] text-2xl lg:text-3xl border-b border-[var(--line)] pb-4">Domestic Shipping — Free Over ₹399</h2>
            <p>
              For customers across Bharat (India), we offer free shipping on all prepaid orders above ₹399. Orders below this threshold are charged a nominal shipping fee based on your pincode zone. We also offer Cash on Delivery (COD) for orders across most regions in India, with a small COD convenience fee applied based on your location.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-[var(--line)] pt-12">
              <div className="space-y-4">
                <h3 className="eyebrow text-[var(--olive)]">Metro Cities</h3>
                <p className="text-[var(--muted)]">2 to 4 business days from dispatch for Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Kolkata, Pune, and Ahmedabad.</p>
              </div>
              <div className="space-y-4">
                <h3 className="eyebrow text-[var(--olive)]">Tier 2 & 3 Cities</h3>
                <p className="text-[var(--muted)]">3 to 6 business days from dispatch for most regions across Gujarat, Maharashtra, Rajasthan, Uttar Pradesh, and other states.</p>
              </div>
              <div className="space-y-4">
                <h3 className="eyebrow text-[var(--olive)]">Remote & North-East</h3>
                <p className="text-[var(--muted)]">5 to 8 business days from dispatch for remote areas, hill stations, and North-Eastern states including Assam, Meghalaya, and Nagaland.</p>
              </div>
              <div className="space-y-4">
                <h3 className="eyebrow text-[var(--olive)]">COD Availability</h3>
                <p className="text-[var(--muted)]">Cash on Delivery is available across most pincodes in India. A nominal COD fee of ₹35-₹85 may apply depending on your location.</p>
              </div>
            </div>
          </section>

          <section className="space-y-8">
            <h2 className="font-serif font-normal tracking-[-0.03em] text-[var(--ink)] text-2xl lg:text-3xl border-b border-[var(--line)] pb-4">International Shipping</h2>
            <p>
              SatvaStones currently ships to select international destinations. International orders are dispatched within 3-5 business days and delivered within 7 to 12 business days depending on customs clearance procedures in the destination country. International shipping rates are calculated at checkout based on weight and destination.
            </p>
            <p>
              Please note that international customers are responsible for any customs duties, import taxes, or brokerage fees levied by their country's customs authority. SatvaStones is not responsible for delays caused by customs inspections or clearance processes.
            </p>
          </section>

          <section className="space-y-8">
            <h2 className="font-serif font-normal tracking-[-0.03em] text-[var(--ink)] text-2xl lg:text-3xl border-b border-[var(--line)] pb-4">Curation Period</h2>
            <p>
              Orders are typically dispatched within 48 hours of payment verification (prepaid orders) or order confirmation (COD orders). During high-volume periods such as festive seasons, flash sales including our ₹99 Sale, or bespoke collection launches, please allow up to 4 business days for artisanal packaging and dispatch.
            </p>
            <p>
              Customized items such as name necklaces or pieces with personalized engraving require additional curation time of up to 5 business days before dispatch, as each piece is handcrafted to your specifications.
            </p>
          </section>

          <section className="space-y-8">
            <h2 className="font-serif font-normal tracking-[-0.03em] text-[var(--ink)] text-2xl lg:text-3xl border-b border-[var(--line)] pb-4">Archival Tracking</h2>
            <p>
              Upon dispatch, you will receive a confirmation email containing a digital identifier (tracking number) and a direct link to monitor the real-time location of your artifacts. Our tracking system provides end-to-end visibility so you always know where your Korean aesthetic jewelry, anti-tarnish rings, or designer bracelets are during transit.
            </p>
            <p>
              All shipments are fully insured against unforeseen transit events including loss, theft, or physical damage during handling. If your tracking status has not updated for more than 7 days, please contact our support team at support@satvastones.in and we will initiate an investigation with the courier partner immediately.
            </p>
          </section>

          <section className="space-y-8">
            <h2 className="font-serif font-normal tracking-[-0.03em] text-[var(--ink)] text-2xl lg:text-3xl border-b border-[var(--line)] pb-4">Returns & Refunds</h2>
            <p>
              All sales are final. We do not accept returns, refunds, or cancellations once an order has been placed. If your item arrives damaged or defective, contact support@satvastones.in within 48 hours of delivery with clear photographs of the damage and your Order Identifier for a free replacement. For full details, please refer to our Returns & Damage Policy page.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
