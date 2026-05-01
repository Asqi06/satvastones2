"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ChevronLeft } from "lucide-react";

const SLIDES = [
  {
    image: "/emerald_bracelet_hero_1774677499386.png",
    title: "Timeless Artifacts",
    subtitle: "New Collection",
    description: "Discover handcrafted gems designed for the modern woman.",
    link: "/products",
  },
  {
    image: "/korean_earrings_premium_1774634324348.png",
    title: "Seoul Minimalism",
    subtitle: "Signature Selection",
    description: "Bridging architectural lines and contemporary elegance.",
    link: "/products?style=KOREAN",
  },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 8000);
    return () => clearInterval(timer);
  }, [current]);

  const handleNext = () => {
    setIsFading(true);
    setTimeout(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
      setIsFading(false);
    }, 600);
  };

  const handlePrev = () => {
    setIsFading(true);
    setTimeout(() => {
      setCurrent((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
      setIsFading(false);
    }, 600);
  };

  return (
    <section className="relative h-[80vh] lg:h-[90vh] w-full bg-[var(--luxury-cream)] overflow-hidden">
      {/* Background Image & Overlay */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${isFading ? "opacity-0" : "opacity-100"}`}>
        <Image
          src={SLIDES[current].image}
          alt={SLIDES[current].title}
          fill
          className="object-cover object-center lg:object-right-top transition-transform duration-[8000ms] scale-[1.05] motion-safe:scale-100"
          priority
        />
        {/* Soft elegant gradient from left to ensure text legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--luxury-cream)] via-[var(--luxury-cream)]/70 to-transparent lg:w-[60%] w-full bg-[var(--luxury-cream)]/30 lg:bg-transparent"></div>
      </div>
      
      {/* Main Content Area */}
      <div className="container-premium relative h-full flex flex-col justify-center">
        <div className="max-w-2xl xl:max-w-3xl animate-fade-in mt-16 md:mt-24">
          <div className="mb-4 lg:mb-8 flex items-center gap-4">
             <div className="w-8 lg:w-16 h-px bg-[var(--luxury-gold)]"></div>
             <span className="label-sm text-[var(--luxury-gold)]">{SLIDES[current].subtitle}</span>
          </div>
          
          <h2 className="heading-hero text-[var(--luxury-brown)] mb-6 lg:mb-8 text-shadow-sm">
            {SLIDES[current].title}
          </h2>
          
          <p className="label-md text-[var(--luxury-brown)]/80 max-w-sm lg:max-w-md leading-relaxed mb-10 lg:mb-16 hidden md:block">
            {SLIDES[current].description}
          </p>

          <div className="flex flex-wrap gap-4 lg:gap-6">
            <Link 
              href={SLIDES[current].link} 
              className="px-8 py-4 lg:px-12 lg:py-5 bg-[var(--luxury-gold)] text-white label-sm hover:bg-[var(--luxury-brown)] transition-all ease-in-out duration-300 border border-transparent shadow-md hover:shadow-lg"
            >
              Examine Piece
            </Link>
            <Link 
              href="/products" 
              className="px-8 py-4 lg:px-12 lg:py-5 bg-transparent border border-[var(--luxury-brown)] text-[var(--luxury-brown)] label-sm hover:bg-[var(--luxury-brown)] hover:text-white transition-all ease-in-out duration-300"
            >
              Shop Curations
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Controls - Always positioned at the bottom relative to viewport */}
      <div className="absolute bottom-8 lg:bottom-12 right-6 lg:right-12 flex items-center justify-end z-[10] gap-8">
        
        {/* Progress Display */}
        <div className="flex items-center gap-4">
          <span className="label-md font-bold text-[var(--luxury-gold)]">0{current + 1}</span>
          <div className="w-16 h-[2px] bg-[var(--luxury-brown)]/10 relative overflow-hidden">
             <div 
              className="absolute inset-0 bg-[var(--luxury-gold)] origin-left" 
              style={{ 
                transform: `scaleX(${isFading ? 0 : 1})`,
                transition: isFading ? 'none' : 'transform 8s linear'
              }}
            />
          </div>
          <span className="label-md text-[var(--luxury-brown)]/30">0{SLIDES.length}</span>
        </div>

        {/* Buttons */}
        <div className="flex bg-white/20 backdrop-blur-md rounded-full border border-[var(--luxury-brown)]/10 p-1">
          <button 
            onClick={handlePrev} 
            className="w-12 h-12 flex items-center justify-center text-[var(--luxury-brown)] hover:bg-[var(--luxury-brown)] hover:text-white rounded-full transition-colors"
          >
            <ChevronLeft className="w-4 h-4 ml-[-2px]" />
          </button>
          <div className="w-px h-6 bg-[var(--luxury-brown)]/10 my-auto"></div>
          <button 
            onClick={handleNext} 
            className="w-12 h-12 flex items-center justify-center text-[var(--luxury-brown)] hover:bg-[var(--luxury-brown)] hover:text-white rounded-full transition-colors"
          >
            <ChevronRight className="w-4 h-4 mr-[-2px]" />
          </button>
        </div>

      </div>
    </section>
  );
}
