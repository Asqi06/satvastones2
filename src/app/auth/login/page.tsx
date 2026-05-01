"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials. Please verify your access.");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred during authorization.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    await signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen bg-luxury-cream flex flex-col pt-32 pb-20 px-4 items-center">
      <div className="w-full max-w-sm animate-luxury-fade">
        <Link href="/" className="inline-flex items-center gap-2 text-luxury-brown/30 hover:text-luxury-brown mb-16 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] tracking-widest uppercase font-bold">Return to Gallery</span>
        </Link>

        <div className="mb-16">
          <h1 className="text-4xl lg:text-6xl font-serif text-luxury-brown mb-4">Member Access</h1>
          <p className="text-luxury-brown/30 text-[10px] tracking-[0.4em] uppercase font-bold">Enter your credentials below</p>
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
                <label className="block text-[9px] font-bold text-luxury-brown/30 mb-3 tracking-[0.2em] uppercase group-focus-within:text-luxury-gold transition-colors">Identity</label>
                <div className="relative">
                  <Mail className="absolute left-0 top-1/2 -translate-y-1/2 text-luxury-brown/10 w-4 h-4 group-focus-within:text-luxury-gold transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="EMAIL ADDRESS"
                    className="w-full pl-8 pr-4 py-4 bg-transparent border-b border-luxury-brown/10 text-luxury-brown placeholder-luxury-brown/5 focus:outline-none focus:border-luxury-gold transition-all text-xs tracking-widest"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-[9px] font-bold text-luxury-brown/30 mb-3 tracking-[0.2em] uppercase group-focus-within:text-luxury-gold transition-colors">Access Key</label>
                <div className="relative">
                  <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-luxury-brown/10 w-4 h-4 group-focus-within:text-luxury-gold transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="PASSWORD"
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
            </div>

            <div className="flex items-center justify-between">
              <Link href="/auth/forgot-password" className="text-[10px] text-luxury-brown/30 hover:text-luxury-gold tracking-widest uppercase font-bold transition-colors">
                Lost Access Key?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-16 bg-luxury-brown text-white text-[11px] font-bold tracking-[0.4em] uppercase hover:bg-luxury-gold transition-all duration-500 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Authorize Entry"}
            </button>
          </form>

          <div className="relative py-4 flex items-center justify-center">
            <div className="absolute inset-x-0 h-px bg-luxury-brown/5"></div>
            <span className="relative z-10 px-6 bg-luxury-cream text-[9px] tracking-[0.5em] text-luxury-brown/20 uppercase font-bold">Universal Entry</span>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full h-16 border border-luxury-brown/10 text-luxury-brown text-[10px] font-bold tracking-[0.4em] uppercase hover:bg-luxury-brown hover:text-white transition-all duration-500 flex items-center justify-center gap-4"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google Identity
          </button>
        </div>

        <p className="text-center mt-20 text-[10px] tracking-[0.2em] font-bold uppercase">
          <span className="text-luxury-brown/30">New to the archive?</span>{" "}
          <Link href="/auth/register" className="text-luxury-gold hover:text-luxury-brown transition-colors">
            Initiate Membership
          </Link>
        </p>
      </div>
    </div>
  );
}
