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
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-[#1a1a1a] rounded-2xl p-8 border border-[#2a2a2a]">
            <div className="w-16 h-16 bg-[#C9A96E]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-[#C9A96E]" />
            </div>
            <h2 className="text-2xl font-serif text-white mb-3">Check Your Email</h2>
            <p className="text-gray-400 mb-6">
              We&apos;ve sent a password reset link to <span className="text-white">{email}</span>
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-[#C9A96E] hover:underline"
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
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-serif text-[#C9A96E] tracking-wider">
            SATVASTONES
          </Link>
          <p className="text-gray-400 mt-2">Reset your password</p>
        </div>

        <div className="bg-[#1a1a1a] rounded-2xl p-8 border border-[#2a2a2a]">
          <p className="text-gray-400 text-sm mb-6">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A96E] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#C9A96E] text-black font-semibold rounded-lg hover:bg-[#b8955d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-400 mt-6 text-sm">
          <Link href="/auth/login" className="text-[#C9A96E] hover:underline font-medium flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
