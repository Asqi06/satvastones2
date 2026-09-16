"use client";

import Link from "next/link";
import { Instagram, Facebook } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="editorial-container pt-14 pb-6 border-t border-[var(--line)]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-x-10 gap-y-10 items-start pb-12">
        {/* Brand Column */}
        <div className="flex flex-col items-start sm:col-span-2 lg:col-span-1">
          <Link
            href="/"
            className="brand font-serif text-[48px] lg:text-[56px] leading-none tracking-[-0.03em] whitespace-nowrap text-[var(--ink)] select-none"
            aria-label="SatvaStones home"
          >
            satvastones<sup className="font-sans text-[10px] font-normal ml-1 align-super tracking-normal">®</sup>
          </Link>
          <p className="text-[11px] text-[var(--muted)] leading-[1.8] mt-4 max-w-[280px]">
            A little gold. A little every day.<br />
            Thoughtfully crafted anti-tarnish &amp; waterproof jewellery, for a life well-worn.
          </p>
          <div className="flex items-center gap-3 mt-5">
            <a
              href="https://instagram.com/satvastones"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow us on Instagram"
              className="w-8 h-8 rounded-full border border-[var(--line)] flex items-center justify-center text-[var(--ink)] hover:text-[var(--olive)] hover:border-[var(--olive)] transition-colors"
            >
              <Instagram className="w-3.5 h-3.5" />
            </a>
            <a
              href="https://facebook.com/satvastones"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow us on Facebook"
              className="w-8 h-8 rounded-full border border-[var(--line)] flex items-center justify-center text-[var(--ink)] hover:text-[var(--olive)] hover:border-[var(--olive)] transition-colors"
            >
              <Facebook className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Column 1: Find Your Thing (Categories) */}
        <div>
          <h3 className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[var(--ink)] mb-5">
            FIND YOUR THING
          </h3>
          <ul className="space-y-3 text-[11px] text-[var(--muted)]">
            <li>
              <Link href="/shop" className="hover:text-[var(--ink)] transition-colors block">
                All jewellery
              </Link>
            </li>
            <li>
              <Link href="/shop/earrings" className="hover:text-[var(--ink)] transition-colors block">
                Earrings
              </Link>
            </li>
            <li>
              <Link href="/shop/necklaces" className="hover:text-[var(--ink)] transition-colors block">
                Necklaces &amp; Chains
              </Link>
            </li>
            <li>
              <Link href="/shop/rings" className="hover:text-[var(--ink)] transition-colors block">
                Rings &amp; little things
              </Link>
            </li>
            <li>
              <Link href="/shop/bracelets" className="hover:text-[var(--ink)] transition-colors block">
                Bracelets &amp; Cuffs
              </Link>
            </li>
            <li>
              <Link href="/shop?sort=best-selling" className="hover:text-[var(--ink)] transition-colors block">
                Hot Deals &amp; Bestsellers
              </Link>
            </li>
            <li>
              <Link href="/shop?sort=newest" className="hover:text-[var(--ink)] transition-colors block">
                New arrivals
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 2: A Little Help */}
        <div>
          <h3 className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[var(--ink)] mb-5">
            A LITTLE HELP
          </h3>
          <ul className="space-y-3 text-[11px] text-[var(--muted)]">
            <li>
              <Link href="/#care" className="hover:text-[var(--ink)] transition-colors block">
                Jewellery care guide
              </Link>
            </li>
            <li>
              <Link href="/shipping" className="hover:text-[var(--ink)] transition-colors block">
                Shipping &amp; packaging
              </Link>
            </li>
            <li>
              <Link href="/returns" className="hover:text-[var(--ink)] transition-colors block">
                Returns &amp; exchanges
              </Link>
            </li>
            <li>
              <Link href="/wishlist" className="hover:text-[var(--ink)] transition-colors block">
                Your saved pieces
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-[var(--ink)] transition-colors block">
                The SatvaStones story
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-[var(--ink)] transition-colors block">
                Contact customer care
              </Link>
            </li>
            <li>
              <Link href="/blog" className="hover:text-[var(--ink)] transition-colors block">
                Style journal
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: From India With Love */}
        <div className="sm:col-span-2 lg:col-span-1">
          <h3 className="text-[10px] font-semibold tracking-[0.14em] uppercase text-[var(--ink)] mb-5">
            FROM INDIA, WITH LOVE
          </h3>
          <p className="text-[11px] text-[var(--muted)] mb-2.5">
            Small details. Everyday joy.
          </p>
          <p className="text-[11px] text-[var(--muted)] mb-2.5">
            Prices in Indian Rupees (₹).
          </p>
          <p className="text-[11px] text-[var(--muted)] mb-3">
            Anti-tarnish jewellery. Real personality.
          </p>
          <div className="text-[11px] text-[var(--muted)] pt-3 border-t border-[var(--line)]">
            <p className="font-medium text-[var(--ink)] mb-1">SatvaStones Studio</p>
            <p>Vapi, Gujarat 396191</p>
            <a href="mailto:support@satvastones.in" className="hover:text-[var(--ink)] transition-colors block mt-1">
              support@satvastones.in
            </a>
            <a href="tel:+919016703180" className="hover:text-[var(--ink)] transition-colors block">
              +91 90167 03180
            </a>
          </div>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="pt-6 border-t border-[var(--line)] grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-x-6 gap-y-2 text-center text-[9px] text-[var(--muted)]">
        <span className="md:text-left">
          © {currentYear} SatvaStones Studio. A concept storefront, made with intention.
        </span>
        <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] font-semibold text-[#5e6256]">
          <span>UPI</span>
          <span>·</span>
          <span>VISA</span>
          <span>·</span>
          <span>Mastercard</span>
          <span>·</span>
          <span>RuPay</span>
          <span>·</span>
          <span>COD</span>
        </div>
        <span className="md:text-right">India / INR ₹</span>
      </div>
    </footer>
  );
}
