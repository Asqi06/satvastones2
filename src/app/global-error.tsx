"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-[var(--paper)] text-[var(--ink)]">
        <p className="eyebrow mb-4">A small interruption</p>
        <h2 className="text-4xl font-serif font-normal tracking-[-0.03em] mb-6">Something went wrong.</h2>
        <button
          onClick={() => reset()}
          className="button"
        >
          Try Again
        </button>
      </body>
    </html>
  );
}
