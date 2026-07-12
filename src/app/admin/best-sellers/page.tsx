"use client";

import { useState, useEffect } from "react";
import { Star, Search } from "lucide-react";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  isBestSeller: boolean;
  category: { name: string } | null;
}

export default function BestSellersPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } catch {
      console.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const toggleBestSeller = async (productId: string, currentStatus: boolean) => {
    setToggling(productId);
    try {
      await fetch(`/api/products/${productId}/bestseller`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBestSeller: !currentStatus }),
      });
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, isBestSeller: !currentStatus } : p
        )
      );
    } catch {
      console.error("Failed to toggle best seller status");
    } finally {
      setToggling(null);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const bestSellerCount = products.filter((p) => p.isBestSeller).length;

  return (
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 border-b border-luxury-brown/5 pb-10">
        <div>
          <p className="text-luxury-gold text-[10px] tracking-[0.5em] uppercase font-bold mb-4">Curation</p>
          <h1 className="text-4xl lg:text-6xl font-serif text-luxury-brown">Best Sellers</h1>
          <p className="text-luxury-brown/40 text-[10px] tracking-[0.3em] uppercase font-bold mt-4">
            {bestSellerCount} products featured
          </p>
        </div>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-brown/30 w-4 h-4" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-luxury-brown/10 text-sm tracking-widest text-luxury-brown placeholder-luxury-brown/20 focus:outline-none focus:border-luxury-gold transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className={`bg-white border transition-all duration-500 overflow-hidden group ${
              product.isBestSeller
                ? "border-luxury-gold/30 shadow-lg shadow-luxury-gold/5"
                : "border-luxury-brown/5 hover:border-luxury-brown/10"
            }`}
          >
            <div className="relative aspect-square bg-luxury-cream overflow-hidden">
              {product.images[0] && (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              )}
              {product.isBestSeller && (
                <div className="absolute top-4 right-4 w-10 h-10 bg-luxury-gold flex items-center justify-center shadow-lg">
                  <Star className="w-5 h-5 text-white fill-white" />
                </div>
              )}
            </div>
            <div className="p-6">
              <p className="text-[9px] text-luxury-brown/30 tracking-[0.3em] uppercase font-bold mb-2">
                {product.category?.name || "Uncategorized"}
              </p>
              <h3 className="text-luxury-brown text-sm font-bold tracking-tight mb-3 group-hover:text-luxury-gold transition-colors">
                {product.name}
              </h3>
              <p className="text-luxury-gold text-lg font-serif mb-6">{formatPrice(product.price)}</p>
              <button
                onClick={() => toggleBestSeller(product.id, product.isBestSeller)}
                disabled={toggling === product.id}
                className={`w-full flex items-center justify-center gap-3 py-3 text-[10px] tracking-[0.2em] font-bold uppercase border transition-all duration-500 ${
                  product.isBestSeller
                    ? "bg-luxury-gold text-white border-luxury-gold hover:bg-luxury-brown hover:border-luxury-brown"
                    : "bg-luxury-cream text-luxury-brown/40 border-luxury-brown/10 hover:border-luxury-gold hover:text-luxury-gold hover:bg-luxury-gold/5"
                }`}
                >
                <Star className={`w-4 h-4 ${product.isBestSeller ? "fill-white" : ""}`} />
                {toggling === product.id
                  ? "Updating..."
                  : product.isBestSeller
                  ? "Remove from Best Sellers"
                  : "Add to Best Sellers"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && !loading && (
        <div className="py-32 text-center">
          <p className="text-luxury-brown/10 text-xs tracking-[0.5em] uppercase font-bold">
            {search ? "No products match your search" : "No products available"}
          </p>
        </div>
      )}
    </div>
  );
}
