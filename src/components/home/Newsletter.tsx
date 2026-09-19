"use client";

import { useState } from "react";
import { Check } from "lucide-react";

type Status = "idle" | "submitting" | "success" | "error";

export default function Newsletter() {
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
        setMessage(data.message || "You're on the list — see you Sunday.");
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
    <section className="newsletter-editorial" aria-labelledby="newsletter-heading">
      <div className="newsletter-editorial-inner editorial-container">
        <div>
          <span className="kicker" style={{ background: "#F2A007" }}>Free every Sunday</span>
          <h2 id="newsletter-heading" className="mt-4">
            The <em>Sunday</em> supplement.
          </h2>
          <p>Fresh drops, little notes, first dibs. One mail a week, never the noise.</p>
        </div>

        {status === "success" ? (
          <div className="inline-flex items-center gap-2 text-sm text-[#F2A007] font-bold">
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
              <svg className="w-5 h-5 icon"><use href="#i-arrow" /></svg>
            </button>
          </form>
        )}
      </div>
      {status === "error" && (
        <p className="text-xs font-bold text-[#FFB4A2] editorial-container mt-2">{message}</p>
      )}
    </section>
  );
}
