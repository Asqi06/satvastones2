"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Coupon {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  minOrder: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    minOrder: "0",
    maxUses: "",
    expiresAt: "",
    isActive: true,
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/coupons");
      const data = await res.json();
      setCoupons(data.coupons || []);
    } catch {
      console.error("Failed to fetch coupons");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          discountValue: parseFloat(form.discountValue),
          minOrder: parseFloat(form.minOrder),
          maxUses: form.maxUses ? parseInt(form.maxUses) : null,
        }),
      });
      fetchCoupons();
      setShowForm(false);
      setForm({ code: "", discountType: "PERCENTAGE", discountValue: "", minOrder: "0", maxUses: "", expiresAt: "", isActive: true });
    } catch {
      console.error("Failed to create coupon");
    }
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    try {
      await fetch(`/api/coupons/${id}`, { method: "DELETE" });
      fetchCoupons();
    } catch {
      console.error("Failed to delete");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl lg:text-3xl font-serif text-white">Coupons</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#C9A96E] text-black font-semibold rounded-lg hover:bg-[#b8955d] transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Coupon
        </button>
      </div>

      {showForm && (
        <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-6 mb-6">
          <h2 className="text-lg font-serif text-white mb-4">New Coupon</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Coupon Code *"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              required
              className="px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#C9A96E]"
            />
            <select
              value={form.discountType}
              onChange={(e) => setForm({ ...form, discountType: e.target.value })}
              className="px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white text-sm focus:outline-none focus:border-[#C9A96E]"
            >
              <option value="PERCENTAGE">Percentage (%)</option>
              <option value="FIXED">Fixed Amount (₹)</option>
            </select>
            <input
              type="number"
              placeholder="Discount Value *"
              value={form.discountValue}
              onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
              required
              min="0"
              className="px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#C9A96E]"
            />
            <input
              type="number"
              placeholder="Min Order Amount"
              value={form.minOrder}
              onChange={(e) => setForm({ ...form, minOrder: e.target.value })}
              className="px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#C9A96E]"
            />
            <input
              type="number"
              placeholder="Max Uses (leave empty for unlimited)"
              value={form.maxUses}
              onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
              className="px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#C9A96E]"
            />
            <input
              type="date"
              value={form.expiresAt}
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
              className="px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white text-sm focus:outline-none focus:border-[#C9A96E]"
            />
            <div className="sm:col-span-2 lg:col-span-3 flex gap-3">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#C9A96E] text-black font-semibold rounded-lg hover:bg-[#b8955d] transition-colors text-sm"
              >
                Create Coupon
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2.5 border border-[#2a2a2a] text-gray-400 rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a2a2a]">
                <th className="text-left text-xs text-gray-500 uppercase px-6 py-4">Code</th>
                <th className="text-left text-xs text-gray-500 uppercase px-6 py-4">Discount</th>
                <th className="text-left text-xs text-gray-500 uppercase px-6 py-4">Min Order</th>
                <th className="text-left text-xs text-gray-500 uppercase px-6 py-4">Uses</th>
                <th className="text-left text-xs text-gray-500 uppercase px-6 py-4">Expires</th>
                <th className="text-left text-xs text-gray-500 uppercase px-6 py-4">Status</th>
                <th className="text-right text-xs text-gray-500 uppercase px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-[#0f0f0f]/50">
                  <td className="px-6 py-4">
                    <span className="text-[#C9A96E] font-mono text-sm">{coupon.code}</span>
                  </td>
                  <td className="px-6 py-4 text-white text-sm">
                    {coupon.discountType === "PERCENTAGE"
                      ? `${coupon.discountValue}%`
                      : `₹${coupon.discountValue}`}
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">₹{coupon.minOrder}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {coupon.usedCount}{coupon.maxUses ? ` / ${coupon.maxUses}` : ""}
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {coupon.expiresAt ? formatDate(coupon.expiresAt) : "Never"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        coupon.isActive ? "bg-green-500/10 text-green-400" : "bg-gray-500/10 text-gray-400"
                      }`}
                    >
                      {coupon.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => deleteCoupon(coupon.id)}
                      className="p-2 text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {coupons.length === 0 && (
            <p className="text-center text-gray-500 py-12">No coupons yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
