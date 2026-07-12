"use client";

import { useState, useEffect } from "react";
import { Save, Settings } from "lucide-react";

interface SettingsData {
  announcementText: string;
  storeName: string;
  storeEmail: string;
  freeShippingThreshold: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>({
    announcementText: "",
    storeName: "",
    storeEmail: "",
    freeShippingThreshold: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      setSettings({
        announcementText: data.announcementText || "",
        storeName: data.storeName || "",
        storeEmail: data.storeEmail || "",
        freeShippingThreshold: data.freeShippingThreshold || "",
      });
    } catch {
      console.error("Failed to fetch settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      console.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 border-b border-luxury-brown/5 pb-10">
        <div>
          <p className="text-luxury-gold text-[10px] tracking-[0.5em] uppercase font-bold mb-4">Configuration</p>
          <h1 className="text-4xl lg:text-6xl font-serif text-luxury-brown">Settings</h1>
        </div>
      </div>

      <div className="max-w-2xl">
        <div className="bg-white border border-luxury-brown/5 p-10 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-gold/5 blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 flex items-center justify-center border border-luxury-brown/5 text-luxury-gold">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif text-luxury-brown tracking-widest uppercase">Store Configuration</h2>
              <p className="text-luxury-brown/40 text-[10px] tracking-[0.3em] uppercase font-bold mt-1">Global parameters</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
            <div className="space-y-2">
              <label className="text-[9px] text-luxury-brown/30 tracking-[0.3em] font-bold uppercase">
                Announcement Banner Text
              </label>
              <textarea
                placeholder="ANNOUNCEMENT MESSAGE FOR CUSTOMERS"
                value={settings.announcementText}
                onChange={(e) => setSettings({ ...settings, announcementText: e.target.value })}
                rows={3}
                className="w-full bg-luxury-cream/20 border-b border-luxury-brown/10 px-4 py-4 text-luxury-brown text-xs tracking-widest transition-all focus:outline-none focus:border-luxury-gold placeholder-luxury-brown/20 resize-none"
              />
              <p className="text-[9px] text-luxury-brown/20 tracking-wider">Displayed at the top of the store as a scrolling announcement.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[9px] text-luxury-brown/30 tracking-[0.3em] font-bold uppercase">Store Name</label>
                <input
                  type="text"
                  placeholder="SATVASTONES"
                  value={settings.storeName}
                  onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                  className="w-full bg-luxury-cream/20 border-b border-luxury-brown/10 px-4 py-4 text-luxury-brown text-xs tracking-widest transition-all focus:outline-none focus:border-luxury-gold placeholder-luxury-brown/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] text-luxury-brown/30 tracking-[0.3em] font-bold uppercase">Store Email</label>
                <input
                  type="email"
                  placeholder="INFO@SATVASTONES.COM"
                  value={settings.storeEmail}
                  onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
                  className="w-full bg-luxury-cream/20 border-b border-luxury-brown/10 px-4 py-4 text-luxury-brown text-xs tracking-widest transition-all focus:outline-none focus:border-luxury-gold placeholder-luxury-brown/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] text-luxury-brown/30 tracking-[0.3em] font-bold uppercase">
                Free Shipping Threshold (₹)
              </label>
              <input
                type="number"
                placeholder="999"
                value={settings.freeShippingThreshold}
                onChange={(e) => setSettings({ ...settings, freeShippingThreshold: e.target.value })}
                min="0"
                className="w-full bg-luxury-cream/20 border-b border-luxury-brown/10 px-4 py-4 text-luxury-brown text-xs tracking-widest transition-all focus:outline-none focus:border-luxury-gold"
              />
              <p className="text-[9px] text-luxury-brown/20 tracking-wider">Orders above this amount qualify for free shipping.</p>
            </div>

            <div className="flex items-center gap-6 pt-6">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-3 px-10 py-5 bg-luxury-brown text-white text-[10px] tracking-[0.3em] font-bold uppercase hover:bg-luxury-gold transition-all duration-500 shadow-lg disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Settings"}
              </button>
              {saved && (
                <span className="text-emerald-600 text-[10px] tracking-[0.2em] uppercase font-bold animate-pulse">
                  Settings saved successfully
                </span>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
