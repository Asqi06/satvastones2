"use client";

import Link from "next/link";
import { Instagram, Facebook } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t-4 border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]">
      <div className="editorial-container pt-12 pb-6">
        {/* Colophon head */}
        <div className="flex flex-wrap items-end justify-between gap-4 pb-8 border-b border-[#4A4130]">
          <p className="text-[11px] font-extrabold tracking-[0.22em] uppercase text-[var(--accent,#F2A007)]">
            The Everyday Gold Gazette
          </p>
          <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#A99B78]">
            Printed daily in Vapi, Gujarat · Read everywhere
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-x-10 gap-y-10 items-start py-10">
          {/* Brand Column */}
          <div className="flex flex-col items-start sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="font-serif font-black text-[52px] lg:text-[60px] leading-[0.9] tracking-[-0.02em] text-[var(--paper)] select-none lowercase"
              aria-label="SatvaStones home"
            >
              satvastones<sup className="font-sans text-[10px] font-extrabold ml-1 align-super tracking-normal">®</sup>
            </Link>
            <p className="text-[12px] font-semibold text-[#CBBFA0] leading-[1.8] mt-4 max-w-[300px]">
              Gold-coloured jewellery for the days that aren&apos;t special.
              Anti-tarnish, waterproof, and gift-ready — made in small batches,
              worn on repeat.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a
                href="https://instagram.com/satvastones"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Instagram"
                className="w-9 h-9 border-2 border-[var(--paper)] flex items-center justify-center text-[var(--paper)] hover:bg-[var(--accent,#F2A007)] hover:text-[var(--ink)] hover:border-[var(--accent,#F2A007)] hover:-translate-y-0.5 transition-all"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com/satvastones"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Facebook"
                className="w-9 h-9 border-2 border-[var(--paper)] flex items-center justify-center text-[var(--paper)] hover:bg-[var(--accent,#F2A007)] hover:text-[var(--ink)] hover:border-[var(--accent,#F2A007)] hover:-translate-y-0.5 transition-all"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 1: Departments (Categories) */}
          <nav aria-label="Shop departments">
            <h3 className="text-[11px] font-extrabold tracking-[0.2em] uppercase text-[var(--accent,#F2A007)] mb-5">
              Departments
            </h3>
            <ul className="space-y-3 text-[12px] font-semibold text-[#CBBFA0]">
              <li>
                <Link href="/shop" className="hover:text-[var(--paper)] transition-colors block">
                  ★ All jewellery
                </Link>
              </li>
              <li>
                <Link href="/shop/earrings" className="hover:text-[var(--paper)] transition-colors block">
                  Earrings
                </Link>
              </li>
              <li>
                <Link href="/shop/necklaces" className="hover:text-[var(--paper)] transition-colors block">
                  Necklaces &amp; Chains
                </Link>
              </li>
              <li>
                <Link href="/shop/rings" className="hover:text-[var(--paper)] transition-colors block">
                  Rings &amp; little things
                </Link>
              </li>
              <li>
                <Link href="/shop/bracelets" className="hover:text-[var(--paper)] transition-colors block">
                  Bracelets &amp; Cuffs
                </Link>
              </li>
              <li>
                <Link href="/shop?sort=best-selling" className="hover:text-[var(--paper)] transition-colors block">
                  Bestsellers
                </Link>
              </li>
              <li>
                <Link href="/shop?sort=newest" className="hover:text-[var(--paper)] transition-colors block">
                  New arrivals
                </Link>
              </li>
            </ul>
          </nav>

          {/* Column 2: Reader services */}
          <nav aria-label="Reader services">
            <h3 className="text-[11px] font-extrabold tracking-[0.2em] uppercase text-[var(--accent,#F2A007)] mb-5">
              Reader services
            </h3>
            <ul className="space-y-3 text-[12px] font-semibold text-[#CBBFA0]">
              <li>
                <Link href="/#care" className="hover:text-[var(--paper)] transition-colors block">
                  Jewellery care guide
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-[var(--paper)] transition-colors block">
                  Shipping &amp; packaging
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-[var(--paper)] transition-colors block">
                  Returns &amp; exchanges
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-[var(--paper)] transition-colors block">
                  Your saved pieces
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[var(--paper)] transition-colors block">
                  The SatvaStones story
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[var(--paper)] transition-colors block">
                  Contact customer care
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-[var(--paper)] transition-colors block">
                  Style journal
                </Link>
              </li>
            </ul>
          </nav>

          {/* Column 3: Bureau */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-[11px] font-extrabold tracking-[0.2em] uppercase text-[var(--accent,#F2A007)] mb-5">
              The Vapi bureau
            </h3>
            <p className="text-[12px] font-semibold text-[#CBBFA0] mb-2">
              Small details. Everyday joy.
            </p>
            <p className="text-[12px] font-semibold text-[#CBBFA0] mb-2">
              Prices in Indian Rupees (₹).
            </p>
            <div className="text-[12px] font-semibold text-[#CBBFA0] pt-3 border-t border-[#4A4130] mt-3">
              <p className="font-extrabold text-[var(--paper)] mb-1">SatvaStones Studio</p>
              <p>Vapi, Gujarat 396191</p>
              <a href="mailto:support@satvastones.in" className="hover:text-[var(--accent,#F2A007)] transition-colors block mt-1">
                support@satvastones.in
              </a>
              <a href="tel:+919016703180" className="hover:text-[var(--accent,#F2A007)] transition-colors block">
                +91 90167 03180
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-[#4A4130] grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-x-6 gap-y-2 text-center text-[10px] font-bold tracking-[0.08em] uppercase text-[#A99B78]">
          <span className="md:text-left">
            © {currentYear} SatvaStones Studio · Set in Fraunces &amp; Archivo
          </span>
          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] font-extrabold text-[var(--paper)]">
            <span>UPI</span>
            <span className="text-[var(--accent,#F2A007)]">✳</span>
            <span>VISA</span>
            <span className="text-[var(--accent,#F2A007)]">✳</span>
            <span>Mastercard</span>
            <span className="text-[var(--accent,#F2A007)]">✳</span>
            <span>RuPay</span>
            <span className="text-[var(--accent,#F2A007)]">✳</span>
            <span>COD</span>
          </div>
          <span className="md:text-right">India / INR ₹</span>
        </div>
      </div>
    </footer>
  );
}
