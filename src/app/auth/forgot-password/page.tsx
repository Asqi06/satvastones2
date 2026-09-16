"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to send reset email");
      } else {
        setSent(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--paper)] text-[var(--ink)] px-4 py-10 lg:py-14">
        <div className="w-full max-w-md text-center">
          <div className="bg-[var(--white)] border border-[var(--line)] p-8">
            <div className="w-16 h-16 bg-[var(--olive)]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-[var(--olive)]" />
            </div>
            <h2 className="text-2xl font-serif font-normal tracking-[-0.03em] text-[var(--ink)] mb-3">Check Your Email</h2>
            <p className="text-[var(--muted)] mb-6">
              We&apos;ve sent a password reset link to <span className="text-[var(--ink)]">{email}</span>
            </p>
            <Link
              href="/auth/login"
              className="text-link text-[var(--olive)]"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--paper)] text-[var(--ink)] px-4 py-10 lg:py-14">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-serif font-normal tracking-[-0.03em] text-[var(--olive)]">
            SATVASTONES
          </Link>
          <p className="eyebrow text-[var(--muted)] mt-2">Reset your password</p>
        </div>

        <div className="bg-[var(--white)] border border-[var(--line)] p-8">
          <p className="text-[var(--muted)] text-sm mb-6">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-800 px-4 py-3 mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-[var(--paper)] border border-[var(--line)] text-[var(--ink)] text-sm placeholder:text-[var(--muted)] focus:border-[var(--olive)] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="button w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        </div>

        <p className="text-center text-[var(--muted)] mt-6 text-sm">
          <Link href="/auth/login" className="text-link text-[var(--olive)] font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
