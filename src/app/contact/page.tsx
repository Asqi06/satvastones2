import { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone, MapPin, Clock, MessageSquare, Truck, RotateCcw } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us | SatvaStones Customer Support",
  description:
    "Get in touch with SatvaStones. Email support@satvastones.in or call +91 90167 03180 for order queries, damage claims, shipping status, and product help. Support available 9 AM to 8 PM IST, Monday to Saturday.",
  keywords: [
    "SatvaStones contact",
    "SatvaStones customer support",
    "jewellery support India",
    "SatvaStones email",
    "SatvaStones phone number",
  ],
  alternates: { canonical: "https://satvastones.in/contact" },
};

const contactPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "@id": "https://satvastones.in/contact#contactpage",
  name: "Contact SatvaStones",
  url: "https://satvastones.in/contact",
  description:
    "Customer support contact details for SatvaStones, including email, phone, registered address, and support hours.",
  mainEntity: {
    "@type": "Organization",
    "@id": "https://satvastones.in/#organization",
    name: "Satvastones",
    url: "https://satvastones.in",
    email: "support@satvastones.in",
    telephone: "+91-9016703180",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Vapi, Gujarat",
      addressLocality: "Vapi",
      addressRegion: "Gujarat",
      postalCode: "396191",
      addressCountry: "IN",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-9016703180",
      email: "support@satvastones.in",
      contactType: "customer service",
      areaServed: "IN",
      availableLanguage: ["English", "Hindi"],
    },
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://satvastones.in/",
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Contact",
      item: "https://satvastones.in/contact",
    },
  ],
};

export default function ContactPage() {
  return (
    <div className="bg-[var(--paper)] text-[var(--ink)] min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="editorial-container max-w-4xl py-10 lg:py-14">
        <div className="mb-24 animate-luxury-fade">
          <p className="eyebrow text-[var(--olive)] mb-6">
            Concierge
          </p>
          <h1 className="text-5xl lg:text-8xl font-serif font-normal tracking-[-0.03em] text-[var(--ink)] mb-12">
            Contact Us
          </h1>
          <div className="h-px w-24 bg-[var(--olive)]"></div>
        </div>

        <div className="space-y-20 text-[var(--muted)] font-light leading-relaxed tracking-wide animate-luxury-fade luxury-delay-200">
          <section className="space-y-8">
            <p>
              Our curation team is available to assist with order status, shipping
              questions, damage claims, sizing guidance, and product care for your
              anti-tarnish and waterproof jewellery. We aim to respond to every email
              within one business day.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-[var(--line)] pt-12">
              <div className="space-y-4">
                <h2 className="eyebrow text-[var(--olive)] flex items-center gap-3">
                  <Mail className="w-4 h-4" /> Email
                </h2>
                <p className="text-[var(--ink)]">
                  <a
                    href="mailto:support@satvastones.in"
                    className="text-link text-[var(--olive)]"
                  >
                    support@satvastones.in
                  </a>
                </p>
                <p className="text-sm">
                  Best for order queries, damage claims, and bulk enquiries. Please
                  include your Order Identifier.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="eyebrow text-[var(--olive)] flex items-center gap-3">
                  <Phone className="w-4 h-4" /> Call &amp; WhatsApp
                </h2>
                <p className="text-[var(--ink)]">
                  <a
                    href="tel:+919016703180"
                    className="text-link text-[var(--olive)]"
                  >
                    +91 90167 03180
                  </a>
                </p>
                <p className="text-sm">
                  Available on both voice and WhatsApp for quick order and delivery
                  updates.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="eyebrow text-[var(--olive)] flex items-center gap-3">
                  <MapPin className="w-4 h-4" /> Registered Address
                </h2>
                <p className="text-[var(--ink)]">
                  SatvaStones
                  <br />
                  Vapi, Gujarat 396191
                  <br />
                  India
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="eyebrow text-[var(--olive)] flex items-center gap-3">
                  <Clock className="w-4 h-4" /> Support Hours
                </h2>
                <p className="text-[var(--ink)]">
                  Monday to Saturday
                  <br />
                  9:00 AM to 8:00 PM IST
                </p>
                <p className="text-sm">
                  Emails received on Sundays and public holidays are answered on the
                  next working day.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-8">
            <h2 className="text-[var(--ink)] text-xl font-serif font-normal tracking-[-0.03em] uppercase border-b border-[var(--line)] pb-4">
              Before You Write
            </h2>
            <p>
              Many questions are answered directly in our policy pages. Reviewing them
              first is usually the fastest route to a resolution.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link
                href="/shipping"
                className="flex items-center gap-4 p-6 bg-[var(--white)] border border-[var(--line)] hover:border-[var(--olive)] transition-colors group"
              >
                <Truck className="w-5 h-5 text-[var(--olive)] shrink-0" strokeWidth={1.5} />
                <span className="text-[var(--ink)] group-hover:text-[var(--olive)] transition-colors text-sm tracking-wide">
                  Shipping timelines &amp; tracking
                </span>
              </Link>
              <Link
                href="/returns"
                className="flex items-center gap-4 p-6 bg-[var(--white)] border border-[var(--line)] hover:border-[var(--olive)] transition-colors group"
              >
                <RotateCcw className="w-5 h-5 text-[var(--olive)] shrink-0" strokeWidth={1.5} />
                <span className="text-[var(--ink)] group-hover:text-[var(--olive)] transition-colors text-sm tracking-wide">
                  Returns, damage claims &amp; cancellations
                </span>
              </Link>
            </div>
          </section>

          <section className="space-y-8">
            <h2 className="text-[var(--ink)] text-xl font-serif font-normal tracking-[-0.03em] uppercase border-b border-[var(--line)] pb-4">
              Damage Claims
            </h2>
            <p>
              If your artifact arrives damaged or defective, email us within 48 hours of
              delivery with clear photographs of the item and its packaging, along with
              your Order Identifier. Please retain all original packaging materials, as
              they may be required for the courier claims investigation. Verified claims
              receive a free replacement at no additional cost.
            </p>
          </section>

          <section className="space-y-8">
            <h2 className="text-[var(--ink)] text-xl font-serif font-normal tracking-[-0.03em] uppercase border-b border-[var(--line)] pb-4">
              Grievance Redressal
            </h2>
            <p>
              In accordance with the Consumer Protection (E-Commerce) Rules, 2020,
              unresolved concerns may be escalated to our Grievance Officer at{" "}
              <a
                href="mailto:support@satvastones.in"
                className="text-link text-[var(--olive)]"
              >
                support@satvastones.in
              </a>{" "}
              with the subject line &quot;GRIEVANCE - [Your Order Number]&quot;. We
              acknowledge every grievance within 48 hours and work to resolve it within
              5 to 7 business days.
            </p>
            <div className="flex items-center gap-4 pt-4">
              <MessageSquare className="w-5 h-5 text-[var(--olive)] shrink-0" strokeWidth={1.5} />
              <p className="text-sm">
                For the fastest response, always quote your Order Identifier in the
                subject line.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
