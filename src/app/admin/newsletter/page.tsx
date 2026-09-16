"use client";

import { useState, useEffect, useMemo } from "react";
import { Download, Search, Mail } from "lucide-react";

interface Subscriber {
  id: string;
  email: string;
  isActive: boolean;
  subscribedAt: string;
}

export default function NewsletterAdminPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        const res = await fetch("/api/newsletter");
        const data = await res.json();
        setSubscribers(data.subscribers || []);
      } catch {
        console.error("Failed to fetch subscribers");
      } finally {
        setLoading(false);
      }
    };
    fetchSubscribers();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return subscribers;
    return subscribers.filter((s) => s.email.toLowerCase().includes(q));
  }, [subscribers, search]);

  const exportCsv = () => {
    const rows = [
      ["email", "isActive", "subscribedAt"],
      ...filtered.map((s) => [s.email, String(s.isActive), s.subscribedAt]),
    ];
    const csv = rows
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 border-b border-luxury-brown/5 pb-10">
        <div>
          <p className="text-luxury-gold text-[10px] tracking-[0.5em] uppercase font-bold mb-4">
            Audience
          </p>
          <h1 className="text-4xl lg:text-6xl font-serif text-luxury-brown">Newsletter</h1>
          <p className="text-luxury-brown/40 text-[11px] tracking-widest uppercase font-bold mt-4">
            {subscribers.length} total subscribers
          </p>
        </div>
        <button
          onClick={exportCsv}
          disabled={filtered.length === 0}
          className="inline-flex items-center gap-3 px-8 py-4 bg-luxury-gold text-white text-[11px] font-bold tracking-widest uppercase hover:bg-luxury-brown transition-all duration-500 shadow-lg disabled:opacity-40"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-luxury-brown/20" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="SEARCH BY EMAIL"
          className="w-full bg-luxury-cream/20 border-b border-luxury-brown/10 pl-12 pr-4 py-4 text-luxury-brown text-xs tracking-widest transition-all focus:outline-none focus:border-luxury-gold placeholder-luxury-brown/20"
        />
      </div>

      <div className="bg-white border border-luxury-brown/5 overflow-hidden shadow-sm">
        <div className="divide-y divide-luxury-brown/5">
          {filtered.map((sub) => (
            <div
              key={sub.id}
              className="flex items-center gap-6 px-8 py-5 hover:bg-luxury-cream/20 transition-colors"
            >
              <Mail className="w-4 h-4 text-luxury-brown/20 shrink-0" />
              <a
                href={`mailto:${sub.email}`}
                className="flex-1 text-luxury-brown text-sm tracking-tight truncate hover:text-luxury-gold transition-colors"
              >
                {sub.email}
              </a>
              <span className="text-luxury-brown/30 text-[10px] tracking-widest uppercase shrink-0">
                {new Date(sub.subscribedAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              <span
                className={`px-3 py-1.5 text-[9px] tracking-[0.2em] font-bold uppercase border shrink-0 ${
                  sub.isActive
                    ? "border-emerald-500/30 text-emerald-600 bg-emerald-50"
                    : "border-luxury-brown/10 text-luxury-brown/30 bg-luxury-cream"
                }`}
              >
                {sub.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          ))}
        </div>
        {filtered.length === 0 && !loading && (
          <div className="py-32 text-center">
            <p className="text-luxury-brown/10 text-xs tracking-[0.5em] uppercase font-bold">
              {search ? "No matching subscribers" : "No subscribers yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
