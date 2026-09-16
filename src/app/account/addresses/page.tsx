"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { MapPin, Plus, Edit2, Trash2, Check } from "lucide-react";
import AccountSidebar from "@/components/account/AccountSidebar";

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

const inputClass =
  "px-4 py-3 bg-[var(--paper)] border border-[var(--line)] text-[var(--ink)] text-sm placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--olive)] w-full";

export default function AddressesPage() {
  const { data: session } = useSession();
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
    <div className="bg-[var(--paper)] text-[var(--ink)]">
      <div className="editorial-container py-10 lg:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <div className="eyebrow">Faster checkout</div>
            <h1 className="font-serif font-normal tracking-[-0.03em] leading-[1.02] text-[clamp(42px,4.3vw,63px)] mt-3">
              Saved <em className="text-[var(--olive)]">addresses.</em>
            </h1>
          </div>
          <button onClick={() => setShowForm(true)} className="button">
            <Plus className="w-4 h-4" />
            Add address
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          <div className="lg:col-span-1">
            <AccountSidebar userName={session?.user?.name} userEmail={session?.user?.email} />
          </div>

          <div className="lg:col-span-3">
            {/* Form */}
            {showForm && (
              <div className="bg-[var(--white)] border border-[var(--line)] p-6 mb-6">
                <h2 className="font-serif text-[24px] font-normal mb-5">
                  {editingId ? "Edit address" : "New address"}
                </h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Full Name *"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className={inputClass}
                  />
                  <input
                    type="tel"
                    placeholder="Phone *"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    required
                    className={inputClass}
                  />
                  <input
                    type="text"
                    placeholder="Address Line 1 *"
                    value={form.line1}
                    onChange={(e) => setForm({ ...form, line1: e.target.value })}
                    required
                    className={`${inputClass} sm:col-span-2`}
                  />
                  <input
                    type="text"
                    placeholder="Address Line 2"
                    value={form.line2}
                    onChange={(e) => setForm({ ...form, line2: e.target.value })}
                    className={`${inputClass} sm:col-span-2`}
                  />
                  <input
                    type="text"
                    placeholder="City *"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    required
                    className={inputClass}
                  />
                  <input
                    type="text"
                    placeholder="State *"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    required
                    className={inputClass}
                  />
                  <input
                    type="text"
                    placeholder="PIN Code *"
                    value={form.postalCode}
                    onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                    required
                    className={inputClass}
                  />
                  <input
                    type="text"
                    placeholder="Country"
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    className={inputClass}
                  />
                  <label className="sm:col-span-2 flex items-center gap-2 text-sm text-[var(--muted)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isDefault}
                      onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                      className="accent-[#505a3d]"
                    />
                    Set as default address
                  </label>
                  <div className="sm:col-span-2 flex flex-wrap gap-3">
                    <button type="submit" className="button">
                      {editingId ? "Update" : "Save"} address
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-3 border border-[var(--line)] text-sm text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--ink)] transition-colors"
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
                  className="bg-[var(--white)] border border-[var(--line)] p-6 relative"
                >
                  {addr.isDefault && (
                    <span className="absolute top-4 right-4 flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] text-[var(--olive)]">
                      <Check className="w-3 h-3" />
                      Default
                    </span>
                  )}
                  <div className="flex items-start gap-3 mb-4">
                    <MapPin className="w-5 h-5 text-[var(--olive)] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[var(--ink)] font-medium">{addr.name}</p>
                      <p className="text-[var(--muted)] text-sm">{addr.line1}</p>
                      {addr.line2 && <p className="text-[var(--muted)] text-sm">{addr.line2}</p>}
                      <p className="text-[var(--muted)] text-sm">
                        {addr.city}, {addr.state} {addr.postalCode}
                      </p>
                      <p className="text-[var(--muted)] text-xs mt-1">{addr.phone}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 pt-4 border-t border-[var(--line)]">
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
                      className="flex items-center gap-1.5 text-[13px] text-[var(--muted)] hover:text-[var(--olive)] transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => deleteAddress(addr.id)}
                      className="flex items-center gap-1.5 text-[13px] text-[var(--muted)] hover:text-[#9b5144] transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {!loading && addresses.length === 0 && !showForm && (
              <div className="text-center py-16 bg-[var(--white)] border border-[var(--line)]">
                <MapPin className="w-10 h-10 text-[var(--olive)] mx-auto mb-4 opacity-60" />
                <h2 className="font-serif text-[24px] font-normal mb-2">No addresses yet</h2>
                <p className="text-[var(--muted)] text-sm">Add your first shipping address.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
