"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Edit,
  Trash2,
  X,
  Search,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  Copy,
  Check,
} from "lucide-react";
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
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    code: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    minOrder: "0",
    maxUses: "",
    expiresAt: "",
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const filteredCoupons = useMemo(() => {
    if (!search) return coupons;
    const q = search.toLowerCase();
    return coupons.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.discountType.toLowerCase().includes(q)
    );
  }, [coupons, search]);

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

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.code.trim()) errors.code = "Code is required";
    if (!form.discountValue || parseFloat(form.discountValue) <= 0)
      errors.discountValue = "Valid discount value required";
    if (
      form.discountType === "PERCENTAGE" &&
      parseFloat(form.discountValue) > 100
    )
      errors.discountValue = "Percentage cannot exceed 100%";
    if (parseFloat(form.minOrder) < 0)
      errors.minOrder = "Min order cannot be negative";
    if (form.maxUses && parseInt(form.maxUses) < 1)
      errors.maxUses = "Must be at least 1";
    if (form.expiresAt && new Date(form.expiresAt) < new Date())
      errors.expiresAt = "Expiry date cannot be in the past";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setForm({
      code: "",
      discountType: "PERCENTAGE",
      discountValue: "",
      minOrder: "0",
      maxUses: "",
      expiresAt: "",
      isActive: true,
    });
    setFormErrors({});
    setEditingCoupon(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      code: form.code.toUpperCase().trim(),
      discountType: form.discountType,
      discountValue: parseFloat(form.discountValue),
      minOrder: parseFloat(form.minOrder),
      maxUses: form.maxUses ? parseInt(form.maxUses) : null,
      expiresAt: form.expiresAt || null,
      isActive: form.isActive,
    };

    try {
      if (editingCoupon) {
        await fetch(`/api/coupons/${editingCoupon.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/coupons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      fetchCoupons();
      setShowForm(false);
      resetForm();
    } catch {
      console.error("Failed to save coupon");
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minOrder: coupon.minOrder.toString(),
      maxUses: coupon.maxUses?.toString() || "",
      expiresAt: coupon.expiresAt
        ? new Date(coupon.expiresAt).toISOString().split("T")[0]
        : "",
      isActive: coupon.isActive,
    });
    setShowForm(true);
  };

  const handleToggleActive = async (coupon: Coupon) => {
    setTogglingId(coupon.id);
    try {
      await fetch(`/api/coupons/${coupon.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });
      setCoupons((prev) =>
        prev.map((c) =>
          c.id === coupon.id ? { ...c, isActive: !c.isActive } : c
        )
      );
    } catch {
      console.error("Failed to toggle coupon");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/coupons/${id}`, { method: "DELETE" });
      fetchCoupons();
      setDeleteConfirm(null);
    } catch {
      console.error("Failed to delete");
    }
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isExpired = (expiresAt: string | null): boolean => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const getUsagePercentage = (coupon: Coupon): number => {
    if (!coupon.maxUses) return 0;
    return Math.min((coupon.usedCount / coupon.maxUses) * 100, 100);
  };

  const resetFormAndClose = () => {
    resetForm();
    setShowForm(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-luxury-brown/5 pb-8">
        <div>
          <p className="text-luxury-gold text-[10px] tracking-[0.5em] uppercase font-bold mb-3">
            Promotions
          </p>
          <h1 className="text-3xl lg:text-5xl font-serif text-luxury-brown">
            Coupons
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-luxury-brown/40" />
            <input
              type="text"
              placeholder="Search codes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-luxury-brown/10 rounded-lg text-luxury-brown text-sm placeholder-luxury-brown/40 focus:outline-none focus:border-luxury-gold w-56 transition-colors"
            />
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-luxury-gold text-black font-semibold rounded-lg hover:bg-luxury-brown transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Coupon
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-luxury-brown/10 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-serif text-luxury-brown">
              {editingCoupon ? "Edit Coupon" : "New Coupon"}
            </h2>
            <button
              onClick={resetFormAndClose}
              className="text-luxury-brown/40 hover:text-luxury-brown transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Coupon Code *"
                  value={form.code}
                  onChange={(e) => {
                    setForm({ ...form, code: e.target.value.toUpperCase() });
                    if (formErrors.code) setFormErrors({ ...formErrors, code: "" });
                  }}
                  className={`w-full px-4 py-3 bg-white border rounded-lg text-luxury-brown text-sm placeholder-luxury-brown/40 focus:outline-none focus:border-luxury-gold transition-colors ${
                    formErrors.code ? "border-red-500" : "border-luxury-brown/10"
                  }`}
                />
                {formErrors.code && (
                  <p className="text-red-600 text-xs mt-1">{formErrors.code}</p>
                )}
              </div>
              <div>
                <select
                  value={form.discountType}
                  onChange={(e) =>
                    setForm({ ...form, discountType: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white border border-luxury-brown/10 rounded-lg text-luxury-brown text-sm focus:outline-none focus:border-luxury-gold"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount (₹)</option>
                </select>
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Discount Value *"
                  value={form.discountValue}
                  onChange={(e) => {
                    setForm({ ...form, discountValue: e.target.value });
                    if (formErrors.discountValue)
                      setFormErrors({ ...formErrors, discountValue: "" });
                  }}
                  min="0"
                  max={form.discountType === "PERCENTAGE" ? "100" : undefined}
                  className={`w-full px-4 py-3 bg-white border rounded-lg text-luxury-brown text-sm placeholder-luxury-brown/40 focus:outline-none focus:border-luxury-gold transition-colors ${
                    formErrors.discountValue
                      ? "border-red-500"
                      : "border-luxury-brown/10"
                  }`}
                />
                {formErrors.discountValue && (
                  <p className="text-red-600 text-xs mt-1">
                    {formErrors.discountValue}
                  </p>
                )}
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Min Order Amount"
                  value={form.minOrder}
                  onChange={(e) => {
                    setForm({ ...form, minOrder: e.target.value });
                    if (formErrors.minOrder)
                      setFormErrors({ ...formErrors, minOrder: "" });
                  }}
                  min="0"
                  className={`w-full px-4 py-3 bg-white border rounded-lg text-luxury-brown text-sm placeholder-luxury-brown/40 focus:outline-none focus:border-luxury-gold transition-colors ${
                    formErrors.minOrder
                      ? "border-red-500"
                      : "border-luxury-brown/10"
                  }`}
                />
                {formErrors.minOrder && (
                  <p className="text-red-600 text-xs mt-1">
                    {formErrors.minOrder}
                  </p>
                )}
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Max Uses (unlimited if empty)"
                  value={form.maxUses}
                  onChange={(e) => {
                    setForm({ ...form, maxUses: e.target.value });
                    if (formErrors.maxUses)
                      setFormErrors({ ...formErrors, maxUses: "" });
                  }}
                  min="1"
                  className={`w-full px-4 py-3 bg-white border rounded-lg text-luxury-brown text-sm placeholder-luxury-brown/40 focus:outline-none focus:border-luxury-gold transition-colors ${
                    formErrors.maxUses
                      ? "border-red-500"
                      : "border-luxury-brown/10"
                  }`}
                />
                {formErrors.maxUses && (
                  <p className="text-red-600 text-xs mt-1">
                    {formErrors.maxUses}
                  </p>
                )}
              </div>
              <div>
                <input
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) => {
                    setForm({ ...form, expiresAt: e.target.value });
                    if (formErrors.expiresAt)
                      setFormErrors({ ...formErrors, expiresAt: "" });
                  }}
                  className={`w-full px-4 py-3 bg-white border rounded-lg text-luxury-brown text-sm focus:outline-none focus:border-luxury-gold transition-colors ${
                    formErrors.expiresAt
                      ? "border-red-500"
                      : "border-luxury-brown/10"
                  }`}
                />
                {formErrors.expiresAt && (
                  <p className="text-red-600 text-xs mt-1">
                    {formErrors.expiresAt}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, isActive: !form.isActive })}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  form.isActive
                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                    : "bg-luxury-cream/20 text-luxury-brown/50 border border-luxury-brown/10"
                }`}
              >
                {form.isActive ? (
                  <ToggleRight className="w-5 h-5" />
                ) : (
                  <ToggleLeft className="w-5 h-5" />
                )}
                {form.isActive ? "Active" : "Inactive"}
              </button>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-luxury-gold text-black font-semibold rounded-lg hover:bg-luxury-brown transition-colors text-sm"
              >
                {editingCoupon ? "Update Coupon" : "Create Coupon"}
              </button>
              <button
                type="button"
                onClick={resetFormAndClose}
                className="px-6 py-2.5 border border-luxury-brown/10 text-luxury-brown/50 rounded-lg text-sm hover:text-luxury-brown hover:border-luxury-brown/20 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {deleteConfirm && (
        <div className="bg-white rounded-xl border border-red-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-luxury-brown font-bold text-sm">
                Delete this coupon permanently?
              </p>
              <p className="text-luxury-brown/50 text-xs mt-1">
                This action cannot be undone. All usage history will be lost.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-luxury-brown/10 text-luxury-brown/50 text-sm rounded-lg hover:text-luxury-brown transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-luxury-brown/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-luxury-brown/5 bg-luxury-cream/30">
                <th className="text-left text-[9px] text-luxury-brown/60 uppercase tracking-[0.3em] px-8 py-6 font-bold">
                  Code
                </th>
                <th className="text-left text-[9px] text-luxury-brown/60 uppercase tracking-[0.3em] px-8 py-6 font-bold">
                  Discount
                </th>
                <th className="text-left text-[9px] text-luxury-brown/60 uppercase tracking-[0.3em] px-8 py-6 font-bold">
                  Min Order
                </th>
                <th className="text-left text-[9px] text-luxury-brown/60 uppercase tracking-[0.3em] px-8 py-6 font-bold">
                  Usage
                </th>
                <th className="text-left text-[9px] text-luxury-brown/60 uppercase tracking-[0.3em] px-8 py-6 font-bold">
                  Expires
                </th>
                <th className="text-left text-[9px] text-luxury-brown/60 uppercase tracking-[0.3em] px-8 py-6 font-bold">
                  Status
                </th>
                <th className="text-right text-[9px] text-luxury-brown/60 uppercase tracking-[0.3em] px-8 py-6 font-bold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-brown/5">
              {filteredCoupons.map((coupon) => {
                const expired = isExpired(coupon.expiresAt);
                const usagePercent = getUsagePercentage(coupon);
                const atLimit =
                  coupon.maxUses && coupon.usedCount >= coupon.maxUses;

                return (
                  <tr
                    key={coupon.id}
                    className={`hover:bg-luxury-cream/20 transition-colors ${
                      expired || atLimit ? "opacity-60" : ""
                    }`}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <span className="text-luxury-gold font-mono text-sm font-bold">
                          {coupon.code}
                        </span>
                        <button
                          onClick={() => handleCopyCode(coupon.code, coupon.id)}
                          className="text-luxury-brown/30 hover:text-luxury-gold transition-colors"
                          title="Copy code"
                        >
                          {copiedId === coupon.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-luxury-brown text-sm font-bold">
                      {coupon.discountType === "PERCENTAGE"
                        ? `${coupon.discountValue}%`
                        : `₹${coupon.discountValue}`}
                    </td>
                    <td className="px-8 py-6 text-luxury-brown/50 text-sm">
                      {coupon.minOrder > 0 ? `₹${coupon.minOrder}` : "—"}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 max-w-[120px]">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-luxury-brown/50 text-xs">
                              {coupon.usedCount}
                              {coupon.maxUses ? ` / ${coupon.maxUses}` : ""}
                            </span>
                            {coupon.maxUses && (
                              <span className="text-luxury-brown/40 text-[10px]">
                                {Math.round(usagePercent)}%
                              </span>
                            )}
                          </div>
                          {coupon.maxUses && (
                            <div className="h-1.5 bg-luxury-cream/30 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  atLimit
                                    ? "bg-red-500"
                                    : usagePercent > 70
                                      ? "bg-yellow-500"
                                      : "bg-luxury-gold"
                                }`}
                                style={{ width: `${usagePercent}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm ${
                            expired ? "text-red-600" : "text-luxury-brown/50"
                          }`}
                        >
                          {coupon.expiresAt
                            ? formatDate(coupon.expiresAt)
                            : "Never"}
                        </span>
                        {expired && (
                          <span className="text-[9px] px-2 py-0.5 bg-red-50 text-red-600 rounded-full uppercase tracking-wider font-bold">
                            Expired
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <button
                        onClick={() => handleToggleActive(coupon)}
                        disabled={togglingId === coupon.id}
                        className={`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
                          coupon.isActive
                            ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                            : "bg-luxury-cream/20 text-luxury-brown/50 hover:bg-luxury-cream/30"
                        } ${togglingId === coupon.id ? "opacity-50" : ""}`}
                      >
                        {coupon.isActive ? (
                          <ToggleRight className="w-4 h-4" />
                        ) : (
                          <ToggleLeft className="w-4 h-4" />
                        )}
                        {coupon.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(coupon)}
                          className="p-2 text-luxury-brown/40 hover:text-luxury-gold transition-colors rounded-lg hover:bg-luxury-gold/10"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(coupon.id)}
                          className="p-2 text-luxury-brown/40 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredCoupons.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-luxury-brown/40 text-sm tracking-wider">
                {search
                  ? `No coupons match "${search}"`
                  : "No coupons yet"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
