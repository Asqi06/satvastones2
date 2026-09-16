import Link from "next/link";

export default function NotFound() {
  return (
    <div className="bg-[var(--paper)] text-[var(--ink)]">
      <div className="editorial-container py-16 lg:py-24 flex flex-col items-center justify-center text-center">
        <div className="eyebrow">Error 404</div>
        <h1 className="font-serif font-normal tracking-[-0.03em] leading-[1.02] text-[clamp(56px,8vw,120px)] mt-3 mb-4">
          Lost<em className="text-[var(--olive)]">?</em>
        </h1>
        <p className="text-[var(--muted)] text-sm mb-10 max-w-sm">
          This page does not exist. Let us guide you back.
        </p>
        <Link href="/" className="button inline-flex">
          Return home
          <svg className="w-[19px] h-[19px]"><use href="#i-arrow" /></svg>
        </Link>
      </div>
    </div>
  );
}
