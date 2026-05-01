"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-12">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8 pb-10">
        <h1 className="text-4xl font-serif text-luxury-brown">Inventory Management</h1>
        
        <div className="flex flex-1 max-w-4xl items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-luxury-brown/30 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full pl-12 pr-4 py-3 bg-white border border-luxury-brown/10 text-sm focus:outline-none focus:border-luxury-gold transition-all"
            />
          </div>
          <select className="px-4 py-3 bg-white border border-luxury-brown/10 text-xs tracking-widest uppercase font-bold outline-none focus:border-luxury-gold">
            <option>All Status</option>
            <option>In Stock</option>
            <option>Low Stock</option>
            <option>Out of Stock</option>
          </select>
          <select className="px-4 py-3 bg-white border border-luxury-brown/10 text-xs tracking-widest uppercase font-bold outline-none focus:border-luxury-gold">
            <option>All Categories</option>
            <option>Bracelets</option>
            <option>Watches</option>
            <option>Rings</option>
            <option>Necklaces</option>
          </select>
          <Link
            href="/admin/products/new"
            className="bg-luxury-gold text-white px-8 py-3 text-[11px] font-bold tracking-widest uppercase hover:bg-luxury-brown transition-all shadow-md shrink-0"
          >
            Add New Product
          </Link>
        </div>
      </div>

      <div className="bg-white border border-luxury-brown/5 overflow-hidden shadow-sm rounded-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-luxury-brown/10 bg-luxury-cream/10">
                <th className="px-6 py-5 text-left"><input type="checkbox" className="accent-luxury-gold" /></th>
                <th className="text-left text-[11px] text-luxury-brown/60 uppercase tracking-widest px-6 py-5 font-bold">Thumbnail</th>
                <th className="text-left text-[11px] text-luxury-brown/60 uppercase tracking-widest px-6 py-5 font-bold">Product Name</th>
                <th className="text-left text-[11px] text-luxury-brown/60 uppercase tracking-widest px-6 py-5 font-bold">SKU</th>
                <th className="text-left text-[11px] text-luxury-brown/60 uppercase tracking-widest px-6 py-5 font-bold">Category</th>
                <th className="text-left text-[11px] text-luxury-brown/60 uppercase tracking-widest px-6 py-5 font-bold">Stock</th>
                <th className="text-left text-[11px] text-luxury-brown/60 uppercase tracking-widest px-6 py-5 font-bold">Price</th>
                <th className="text-left text-[11px] text-luxury-brown/60 uppercase tracking-widest px-6 py-5 font-bold">Status</th>
                <th className="text-right text-[11px] text-luxury-brown/60 uppercase tracking-widest px-6 py-5 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-brown/5 text-sm">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-luxury-cream/20 transition-colors">
                  <td className="px-6 py-5"><input type="checkbox" className="accent-luxury-gold" /></td>
                  <td className="px-6 py-5">
                    <div className="w-12 h-12 bg-luxury-cream relative rounded-sm overflow-hidden border border-luxury-brown/5">
                      {product.images[0] && <Image src={product.images[0]} alt="" fill className="object-cover" />}
                    </div>
                  </td>
                  <td className="px-6 py-5 font-medium text-luxury-brown">{product.name}</td>
                  <td className="px-6 py-5 text-luxury-brown/50 text-[11px] font-mono tracking-tighter uppercase">{product.slug.toUpperCase().substring(0, 8)}</td>
                  <td className="px-6 py-5 text-luxury-brown/70">{product.category?.name}</td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 text-[10px] font-bold rounded-full ${
                      product.stock === 0 ? "bg-red-100 text-red-700" :
                      product.stock < 5 ? "bg-amber-100 text-amber-700" :
                      "bg-green-100 text-green-700"
                    }`}>
                      {product.stock} {product.stock === 0 ? "Out of Stock" : product.stock < 5 ? "Low Stock" : "In Stock"}
                    </span>
                  </td>
                  <td className="px-6 py-5 font-bold">₹{product.price.toLocaleString()}</td>
                  <td className="px-6 py-5">
                    <span className="text-luxury-brown/60 tracking-wider">Active</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-3 text-luxury-brown/40">
                      <Link href={`/admin/products/new?id=${product.id}`} className="hover:text-luxury-gold transition-colors">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button className="hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && !loading && (
            <div className="py-20 text-center text-luxury-brown/30 uppercase tracking-[0.3em] font-bold text-xs">
              No products found in inventory
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
