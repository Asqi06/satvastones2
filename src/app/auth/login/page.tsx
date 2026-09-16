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
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <div className="editorial-container py-10 lg:py-14 flex flex-col items-center">
      <div className="w-full max-w-sm animate-luxury-fade">
        <Link href="/" className="inline-flex items-center gap-2 text-[var(--muted)] hover:text-[var(--ink)] mb-16 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] tracking-widest uppercase font-bold">Return to Gallery</span>
        </Link>

        <div className="mb-16">
          <h1 className="text-4xl lg:text-6xl font-serif font-normal tracking-[-0.03em] text-[var(--ink)] mb-4">Member Access</h1>
          <p className="eyebrow text-[var(--muted)]">Enter your credentials below</p>
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
                <label className="block text-[9px] font-bold text-[var(--muted)] mb-3 tracking-[0.2em] uppercase group-focus-within:text-[var(--olive)] transition-colors">Identity</label>
                <div className="relative">
                  <Mail className="absolute left-0 top-1/2 -translate-y-1/2 text-[var(--muted)] w-4 h-4 group-focus-within:text-[var(--olive)] transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="EMAIL ADDRESS"
                    className="w-full pl-8 pr-4 py-4 bg-[var(--paper)] border border-[var(--line)] text-[var(--ink)] text-sm placeholder:text-[var(--muted)] focus:border-[var(--olive)] focus:outline-none transition-all text-xs tracking-widest"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-[9px] font-bold text-[var(--muted)] mb-3 tracking-[0.2em] uppercase group-focus-within:text-[var(--olive)] transition-colors">Access Key</label>
                <div className="relative">
                  <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-[var(--muted)] w-4 h-4 group-focus-within:text-[var(--olive)] transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="PASSWORD"
                    className="w-full pl-8 pr-12 py-4 bg-[var(--paper)] border border-[var(--line)] text-[var(--ink)] text-sm placeholder:text-[var(--muted)] focus:border-[var(--olive)] focus:outline-none transition-all text-xs tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--ink)]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Link href="/auth/forgot-password" className="text-link text-[var(--olive)]">
                Lost Access Key?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="button w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Authorize Entry"}
            </button>
          </form>

          <div className="relative py-4 flex items-center justify-center">
            <div className="absolute inset-x-0 h-px bg-[var(--line)]"></div>
            <span className="relative z-10 px-6 bg-[var(--paper)] text-[9px] tracking-[0.5em] text-[var(--muted)] uppercase font-bold">Universal Entry</span>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full min-h-[52px] border border-[var(--line)] bg-[var(--white)] text-[var(--ink)] text-[11px] font-medium tracking-[0.035em] uppercase hover:border-[var(--olive)] transition-all duration-500 flex items-center justify-center gap-4"
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
          <span className="text-[var(--muted)]">New to the archive?</span>{" "}
          <Link href="/auth/register" className="text-link text-[var(--olive)]">
            Initiate Membership
          </Link>
        </p>
      </div>
      </div>
    </div>
  );
}
