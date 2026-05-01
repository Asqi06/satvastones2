"use client";

import { useState } from "react";
import { Mail, ArrowRight, Check } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Subscription failure.");
      } else {
        setSubscribed(true);
        setEmail("");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-32 lg:py-48 bg-luxury-cream border-t border-luxury-brown/5">
      <div className="container-premium">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-20 h-20 bg-luxury-gold/10 rounded-full flex items-center justify-center mx-auto mb-10 animate-luxury-fade">
            <Mail className="w-8 h-8 text-luxury-gold" />
          </div>
          <h2 className="text-4xl lg:text-6xl font-serif text-luxury-brown mb-8 animate-luxury-fade">
            The Inner Circle
          </h2>
          <p className="text-luxury-brown/50 text-base lg:text-lg font-light tracking-wide mb-16 max-w-xl mx-auto leading-relaxed">
            Join our curated registry to receive exclusive collection previews, cultural insights, and privileged access.
          </p>

          {subscribed ? (
            <div className="flex items-center justify-center gap-4 text-luxury-gold bg-luxury-gold/5 px-8 py-6 rounded-sm border border-luxury-gold/20 animate-luxury-fade mx-auto max-w-md">
              <Check className="w-6 h-6" />
              <span className="font-bold tracking-[0.2em] uppercase text-xs">Access Granted. Welcome.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="relative max-w-lg mx-auto group">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="YOUR DIGITAL ADDRESS"
                className="w-full bg-transparent border-b border-luxury-brown/20 py-6 pr-12 text-luxury-brown placeholder-luxury-brown/20 focus:outline-none focus:border-luxury-brown transition-all text-sm tracking-[0.2em] uppercase font-medium"
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-luxury-brown/40 hover:text-luxury-gold transition-all disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-luxury-brown/20 border-t-luxury-gold rounded-full animate-spin" />
                ) : (
                  <ArrowRight className="w-6 h-6" />
                )}
              </button>
            </form>
          )}

          {error && (
            <p className="text-red-800 text-[10px] tracking-[0.2em] font-bold uppercase mt-6 animate-shake">{error}</p>
          )}
        </div>
      </div>
    </section>
  );
}
