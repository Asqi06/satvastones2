"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 bg-[var(--paper)] text-[var(--ink)]">
      <p className="eyebrow mb-4">A small interruption</p>
      <h2 className="font-serif text-4xl font-normal tracking-[-0.03em] mb-4">Something went wrong.</h2>
      <p className="text-sm text-[var(--muted)] max-w-md mb-8 leading-relaxed">
        We encountered an unexpected error. Please try again or return to the home page.
      </p>
      <div className="flex items-center gap-4">
        <button
          onClick={() => reset()}
          className="button"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="px-6 py-3.5 border border-[var(--line)] text-[var(--ink)] text-[11px] font-semibold uppercase tracking-[0.14em] hover:border-[var(--ink)] transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
