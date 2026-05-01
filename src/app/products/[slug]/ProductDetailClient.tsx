"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Truck, ShieldCheck, Heart, Minus, Plus, ChevronRight, Share2 } from "lucide-react";
import { useCartStore } from "@/hooks/useCart";
import { useWishlistStore } from "@/hooks/useWishlist";
import FeaturedProducts from "@/components/home/FeaturedProducts";

interface ProductDetailClientProps {
  product: any;
  relatedProducts: any[];
  avgRating: number;
}

export default function ProductDetailClient({ product, relatedProducts, avgRating }: ProductDetailClientProps) {
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("details");
  
  const addItemToCart = useCartStore((s) => s.addItem);
  const { addItem: addItemToWishlist, removeItem: removeFromWishlist, isWishlisted } = useWishlistStore();

  const handleAddToCart = () => {
    addItemToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || "",
      stock: product.stock,
      quantity,
    });
  };

  const toggleWishlist = () => {
    if (isWishlisted(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addItemToWishlist({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0] || "",
      });
    }
  };

  return (
    <div className="bg-[var(--luxury-cream)] min-h-screen pt-[120px] lg:pt-[140px] pb-24">
      {/* Breadcrumbs */}
      <div className="container-premium mb-12">
        <div className="flex items-center gap-3 label-sm text-[var(--luxury-brown)]/50">
          <Link href="/" className="hover:text-[var(--luxury-brown)] transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/products" className="hover:text-[var(--luxury-brown)] transition-colors">Curations</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[var(--luxury-brown)] font-bold truncate">{product.name}</span>
        </div>
      </div>

      <div className="container-premium">
        {/* Main Product Layout */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 mb-32 items-start">
          
          {/* Left Column: Image Gallery (Sticky on Desktop) */}
          <div className="w-full lg:w-1/2 flex flex-col-reverse lg:flex-row gap-6 sticky top-[140px]">
            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-visible no-scrollbar w-full lg:w-24 shrink-0">
                {product.images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`relative w-24 lg:w-full aspect-[4/5] border transition-all ${
                      i === activeImage ? "border-[var(--luxury-brown)]" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                     <Image src={img} alt={`${product.name} ${i}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
            
            {/* Main Image */}
            <div className="relative w-full aspect-[4/5] bg-white border border-[var(--luxury-border)] animate-fade-in origin-top">
              {product.images?.[activeImage] ? (
                <Image
                  src={product.images[activeImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--luxury-border)] font-serif text-8xl">SV</div>
              )}
            </div>
          </div>

          {/* Right Column: Product Info */}
          <div className="w-full lg:w-1/2 max-w-xl mx-auto lg:mx-0 py-4">
            <div className="mb-10">
              <div className="flex justify-between items-start gap-6">
                <div>
                   <span className="label-sm text-[var(--luxury-gold)] mb-4 block">Handcrafted Artifact</span>
                   <h1 className="heading-section text-[var(--luxury-brown)] mb-6 leading-tight">
                     {product.name}
                   </h1>
                </div>
                {/* Share Button Placeholder */}
                <button className="p-3 border border-[var(--luxury-border)] rounded-full text-[var(--luxury-brown)] hover:bg-[var(--luxury-brown)] hover:text-white transition-colors shrink-0">
                   <Share2 className="w-4 h-4" />
                </button>
              </div>

              {/* Price */}
              <div className="flex items-center gap-6 mb-8 py-6 border-y border-[var(--luxury-border)]">
                <span className="text-3xl lg:text-4xl font-serif text-[var(--luxury-brown)]">
                  ₹{product.price.toLocaleString()}
                </span>
                {product.comparePrice && (
                  <span className="text-xl text-[var(--luxury-brown)]/40 line-through">
                    ₹{product.comparePrice.toLocaleString()}
                  </span>
                )}
                <span className="ml-auto label-sm text-[var(--luxury-brown)]/50 text-right w-32 border-l border-[var(--luxury-border)] pl-6">
                  INCLUSIVE OF ALL TAXES
                </span>
              </div>

              {/* Description Preview */}
              <p className="text-[var(--luxury-brown)]/80 leading-relaxed mb-10 text-[0.95rem]">
                {product.description}
              </p>

              {/* Stock Status */}
               {product.stock > 0 ? (
                 <p className="label-md text-emerald-700/80 mb-6 flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-emerald-700"></span> In Stock ({product.stock} pieces remaining)
                 </p>
               ) : (
                 <p className="label-md text-red-800/80 mb-6 flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-red-800"></span> Archived (Out of Stock)
                 </p>
               )}

              {/* Quantity & Actions */}
              <div className="space-y-6">
                 <div className="flex gap-4 items-center">
                    <div className="flex items-center border border-[var(--luxury-brown)] h-[56px] bg-white max-w-[140px]">
                      <button
                        onClick={() => quantity > 1 && setQuantity(q => q - 1)}
                        className="w-12 h-full flex justify-center items-center text-[var(--luxury-brown)]/50 hover:text-[var(--luxury-brown)]"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-bold text-[var(--luxury-brown)]">{quantity}</span>
                      <button
                        onClick={() => quantity < product.stock && setQuantity(q => q + 1)}
                        className="w-12 h-full flex justify-center items-center text-[var(--luxury-brown)]/50 hover:text-[var(--luxury-brown)]"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                        onClick={toggleWishlist}
                        className={`h-[56px] px-8 border transition-colors flex items-center gap-3 label-sm ${
                          isWishlisted(product.id) ? "bg-[var(--luxury-gold)] border-[var(--luxury-gold)] text-white" : "border-[var(--luxury-brown)] text-[var(--luxury-brown)] hover:bg-[var(--luxury-brown)] hover:text-white"
                        }`}
                      >
                        <Heart className="w-4 h-4" fill={isWishlisted(product.id) ? "currentColor" : "none"} />
                         <span className="hidden sm:block">{isWishlisted(product.id) ? "SAVED" : "WISHLIST"}</span>
                      </button>
                 </div>

                 <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="w-full h-[64px] bg-[var(--luxury-brown)] text-white label-sm hover:bg-[var(--luxury-gold)] transition-colors disabled:bg-[var(--luxury-brown)]/20 shadow-md hover:shadow-xl"
                  >
                    ADD TO CART
                  </button>
              </div>

              {/* Guarantees */}
              <div className="mt-12 py-8 border-t border-[var(--luxury-border)] grid grid-cols-2 gap-y-6">
                 <div className="flex items-center gap-4 text-[var(--luxury-brown)]">
                   <Truck className="w-5 h-5 text-[var(--luxury-gold)]" strokeWidth={1.5} />
                   <span className="label-sm">Free Global <br/>Shipping</span>
                 </div>
                 <div className="flex items-center gap-4 text-[var(--luxury-brown)]">
                   <ShieldCheck className="w-5 h-5 text-[var(--luxury-gold)]" strokeWidth={1.5} />
                   <span className="label-sm">Lifetime <br/>Warranty</span>
                 </div>
              </div>
            </div>

            {/* Product Tabs (Accordion) */}
            <div className="mt-12 border-t border-[var(--luxury-border)]">
              {[
                { id: "details", title: "Curation Details", content: `Material: ${product.material || "18K Gold Plated"}\nStyle Pattern: ${product.style}\nDesigned precisely for contemporary wardrobes blending timeless aesthetics.\n\nThis handcrafted piece from SatvaStones is designed for everyday elegance. Each artifact is carefully inspected for quality before shipping. Our jewellery is tarnish-free and waterproof, making it perfect for daily wear.` },
                { id: "shipping", title: "Transit & Returns", content: "Dispatch within 24 hours. All sales are final — no returns, refunds, or cancellations. If your item arrives damaged, contact curation@satvastones.com within 48 hours with photos for a free replacement." },
                { id: "care", title: "Care Instructions", content: "Store in a cool, dry place away from direct sunlight. Avoid contact with perfumes, lotions, and chemicals. Clean gently with a soft, lint-free cloth. While our pieces are tarnish-free and waterproof, proper care ensures lasting beauty." },
              ].map(tab => (
                 <div key={tab.id} className="border-b border-[var(--luxury-border)]">
                    <button 
                      onClick={() => setActiveTab(activeTab === tab.id ? "" : tab.id)}
                      className="w-full py-6 flex justify-between items-center text-left"
                    >
                      <h4 className="label-md font-bold text-[var(--luxury-brown)]">{tab.title}</h4>
                      <Plus className={`w-4 h-4 text-[var(--luxury-brown)] transition-transform duration-300 ${activeTab === tab.id ? "rotate-45" : ""}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${activeTab === tab.id ? "max-h-48 pb-6 opacity-100" : "max-h-0 opacity-0"}`}>
                      <p className="text-[var(--luxury-brown)]/70 text-[0.9rem] leading-relaxed whitespace-pre-line">{tab.content}</p>
                    </div>
                 </div>
              ))}
            </div>
            
          </div>
        </div>
      </div>

      {/* Related Artifacts */}
      {relatedProducts?.length > 0 && (
        <div className="border-t border-[var(--luxury-border)] pt-8">
           <FeaturedProducts products={relatedProducts} />
        </div>
      )}
    </div>
  );
}
