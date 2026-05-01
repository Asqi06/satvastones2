"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passcodes must align precisely.");
      return;
    }

    if (password.length < 6) {
      setError("Security key must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration sequence failed.");
      } else {
        router.push("/auth/login?registered=true");
      }
    } catch {
      setError("An unexpected error occurred during encryption.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-luxury-cream flex flex-col pt-32 pb-20 px-4 items-center">
      <div className="w-full max-w-sm animate-luxury-fade">
        <Link href="/" className="inline-flex items-center gap-2 text-luxury-brown/30 hover:text-luxury-brown mb-16 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] tracking-widest uppercase font-bold">Return to Gallery</span>
        </Link>

        <div className="mb-16">
          <h1 className="text-4xl lg:text-6xl font-serif text-luxury-brown mb-4">Membership</h1>
          <p className="text-luxury-brown/30 text-[10px] tracking-[0.4em] uppercase font-bold">Initialize your archival access</p>
        </div>

        <div className="space-y-12">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-800 text-[11px] font-bold tracking-wider uppercase text-center animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="group">
                <label className="block text-[9px] font-bold text-luxury-brown/30 mb-3 tracking-[0.2em] uppercase group-focus-within:text-luxury-gold transition-colors">Full Designation</label>
                <div className="relative">
                  <User className="absolute left-0 top-1/2 -translate-y-1/2 text-luxury-brown/10 w-4 h-4 group-focus-within:text-luxury-gold transition-colors" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="FULL NAME"
                    className="w-full pl-8 pr-4 py-4 bg-transparent border-b border-luxury-brown/10 text-luxury-brown placeholder-luxury-brown/5 focus:outline-none focus:border-luxury-gold transition-all text-xs tracking-widest uppercase"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-[9px] font-bold text-luxury-brown/30 mb-3 tracking-[0.2em] uppercase group-focus-within:text-luxury-gold transition-colors">Digital ID</label>
                <div className="relative">
                  <Mail className="absolute left-0 top-1/2 -translate-y-1/2 text-luxury-brown/10 w-4 h-4 group-focus-within:text-luxury-gold transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="EMAIL ADDRESS"
                    className="w-full pl-8 pr-4 py-4 bg-transparent border-b border-luxury-brown/10 text-luxury-brown placeholder-luxury-brown/5 focus:outline-none focus:border-luxury-gold transition-all text-xs tracking-widest uppercase"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-[9px] font-bold text-luxury-brown/30 mb-3 tracking-[0.2em] uppercase group-focus-within:text-luxury-gold transition-colors">Encrypted Key</label>
                <div className="relative">
                  <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-luxury-brown/10 w-4 h-4 group-focus-within:text-luxury-gold transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="CREATE PASSWORD"
                    className="w-full pl-8 pr-12 py-4 bg-transparent border-b border-luxury-brown/10 text-luxury-brown placeholder-luxury-brown/5 focus:outline-none focus:border-luxury-gold transition-all text-xs tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-luxury-brown/20 hover:text-luxury-brown"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="group">
                <label className="block text-[9px] font-bold text-luxury-brown/30 mb-3 tracking-[0.2em] uppercase group-focus-within:text-luxury-gold transition-colors">Verification</label>
                <div className="relative">
                  <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-luxury-brown/10 w-4 h-4 group-focus-within:text-luxury-gold transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="CONFIRM PASSWORD"
                    className="w-full pl-8 pr-4 py-4 bg-transparent border-b border-luxury-brown/10 text-luxury-brown placeholder-luxury-brown/5 focus:outline-none focus:border-luxury-gold transition-all text-xs tracking-widest"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-16 bg-luxury-brown text-white text-[11px] font-bold tracking-[0.4em] uppercase hover:bg-luxury-gold transition-all duration-500 disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Commence Membership"}
            </button>
          </form>

          <p className="text-center text-[8px] tracking-[0.3em] text-luxury-brown/20 uppercase font-bold leading-relaxed">
            By initiating membership, you agree to our<br />
            <Link href="/terms" className="text-luxury-brown/40 hover:text-luxury-gold transition-colors underline">Usage Protocol</Link> and <Link href="/privacy" className="text-luxury-brown/40 hover:text-luxury-gold transition-colors underline">Data Ethics</Link>.
          </p>
        </div>

        <p className="text-center mt-20 text-[10px] tracking-[0.2em] font-bold uppercase">
          <span className="text-luxury-brown/30">Existing member?</span>{" "}
          <Link href="/auth/login" className="text-luxury-gold hover:text-luxury-brown transition-colors">
            Authorize Entry
          </Link>
        </p>
      </div>
    </div>
  );
}
