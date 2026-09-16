"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProductDetailProduct } from "./ProductDetail";

export default function ProductGallery({ product }: { product: ProductDetailProduct }) {
  const [activeImage, setActiveImage] = useState(0);
  const images = product.images || [];

  return (
    <div className="w-full lg:w-1/2 flex flex-col-reverse lg:flex-row gap-4 lg:sticky lg:top-28 self-start">
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-visible no-scrollbar w-full lg:w-24 shrink-0">
          {images.map((img: string, i: number) => (
            <button
              key={i}
              onClick={() => setActiveImage(i)}
              className={`relative w-20 lg:w-full aspect-[4/5] border transition-all overflow-hidden ${
                i === activeImage
                  ? "border-[var(--ink)]"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image src={img} alt={`${product.name} ${i}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Main Image */}
      <div className="relative w-full aspect-[4/5] bg-[#e7e1d7] overflow-hidden">
        {images[activeImage] ? (
          <Image
            src={images[activeImage]}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#e7e1d7] via-[#f6f3ec] to-[#e9ddd1]">
            <span className="font-serif text-5xl tracking-[0.2em] text-[var(--olive)]/25">Satva</span>
          </div>
        )}
      </div>
    </div>
  );
}
