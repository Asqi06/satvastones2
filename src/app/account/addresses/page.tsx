"use client";

import { useState, useEffect } from "react";
import { MapPin, Plus, Edit2, Trash2, Check } from "lucide-react";

interface Address {
  id: string;
  name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    isDefault: false,
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/addresses");
      const data = await res.json();
      setAddresses(data.addresses || []);
    } catch {
      console.error("Failed to fetch addresses");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await fetch(`/api/addresses/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        await fetch("/api/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }
      fetchAddresses();
      resetForm();
    } catch {
      console.error("Failed to save address");
    }
  };

  const deleteAddress = async (id: string) => {
    if (!confirm("Delete this address?")) return;
    try {
      await fetch(`/api/addresses/${id}`, { method: "DELETE" });
      fetchAddresses();
    } catch {
      console.error("Failed to delete");
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({
      name: "",
      phone: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
      isDefault: false,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl lg:text-3xl font-serif text-white">My Addresses</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#C9A96E] text-black font-semibold rounded-lg hover:bg-[#b8955d] transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Address
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a] mb-6">
          <h2 className="text-lg font-serif text-white mb-4">
            {editingId ? "Edit Address" : "New Address"}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Full Name *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#C9A96E]"
            />
            <input
              type="tel"
              placeholder="Phone *"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
              className="px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#C9A96E]"
            />
            <input
              type="text"
              placeholder="Address Line 1 *"
              value={form.line1}
              onChange={(e) => setForm({ ...form, line1: e.target.value })}
              required
              className="sm:col-span-2 px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#C9A96E]"
            />
            <input
              type="text"
              placeholder="Address Line 2"
              value={form.line2}
              onChange={(e) => setForm({ ...form, line2: e.target.value })}
              className="sm:col-span-2 px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#C9A96E]"
            />
            <input
              type="text"
              placeholder="City *"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              required
              className="px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#C9A96E]"
            />
            <input
              type="text"
              placeholder="State *"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              required
              className="px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#C9A96E]"
            />
            <input
              type="text"
              placeholder="PIN Code *"
              value={form.postalCode}
              onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
              required
              className="px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#C9A96E]"
            />
            <input
              type="text"
              placeholder="Country"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              className="px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#C9A96E]"
            />
            <label className="sm:col-span-2 flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                className="accent-[#C9A96E]"
              />
              Set as default address
            </label>
            <div className="sm:col-span-2 flex gap-3">
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#C9A96E] text-black font-semibold rounded-lg hover:bg-[#b8955d] transition-colors text-sm"
              >
                {editingId ? "Update" : "Save"} Address
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2.5 border border-[#2a2a2a] text-gray-400 rounded-lg hover:border-[#3a3a3a] text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Address List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a] relative"
          >
            {addr.isDefault && (
              <span className="absolute top-4 right-4 flex items-center gap-1 text-xs text-[#C9A96E]">
                <Check className="w-3 h-3" />
                Default
              </span>
            )}
            <div className="flex items-start gap-3 mb-3">
              <MapPin className="w-5 h-5 text-[#C9A96E] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white font-medium">{addr.name}</p>
                <p className="text-gray-400 text-sm">{addr.line1}</p>
                {addr.line2 && <p className="text-gray-400 text-sm">{addr.line2}</p>}
                <p className="text-gray-400 text-sm">
                  {addr.city}, {addr.state} {addr.postalCode}
                </p>
                <p className="text-gray-500 text-xs mt-1">{addr.phone}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setForm({
                    name: addr.name,
                    phone: addr.phone,
                    line1: addr.line1,
                    line2: addr.line2 || "",
                    city: addr.city,
                    state: addr.state,
                    postalCode: addr.postalCode,
                    country: addr.country,
                    isDefault: addr.isDefault,
                  });
                  setEditingId(addr.id);
                  setShowForm(true);
                }}
                className="flex items-center gap-1 text-sm text-gray-400 hover:text-[#C9A96E]"
              >
                <Edit2 className="w-3 h-3" />
                Edit
              </button>
              <button
                onClick={() => deleteAddress(addr.id)}
                className="flex items-center gap-1 text-sm text-gray-400 hover:text-red-400"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {!loading && addresses.length === 0 && !showForm && (
        <div className="text-center py-16 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]">
          <MapPin className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h2 className="text-lg font-serif text-white mb-2">No Addresses</h2>
          <p className="text-gray-400">Add your first shipping address.</p>
        </div>
      )}
    </div>
  );
}
