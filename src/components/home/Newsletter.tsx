"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, Mail } from "lucide-react";

type Status = "idle" | "submitting" | "success" | "error";

export default function Newsletter() {
  const reduce = useReducedMotion();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    setMessage("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "You're subscribed — welcome to SatvaStones.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <section className="newsletter-editorial">
      <div className="newsletter-editorial-inner editorial-container">
        <div>
          <h2>A good thing in your inbox.</h2>
          <p>Fresh drops, little notes, and first dibs. Never the noise.</p>
        </div>

        {status === "success" ? (
          <div className="inline-flex items-center gap-2 text-sm text-[var(--olive)] font-medium">
            <Check className="w-4 h-4" /> {message}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="email-form">
            <input
              type="email"
              name="email"
              placeholder="Your email address"
              aria-label="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={status === "submitting"}
            />
            <button
              type="submit"
              disabled={status === "submitting"}
              aria-label="Join the mailing list"
            >
              <svg className="w-5 h-5 text-[var(--ink)]"><use href="#i-arrow" /></svg>
            </button>
          </form>
        )}
      </div>
      {status === "error" && (
        <p className="text-xs text-red-700 editorial-container mt-2">{message}</p>
      )}
    </section>
  );
}
