import Link from "next/link";

export default function NotFound() {
  return (
    <div className="bg-luxury-cream min-h-screen flex flex-col items-center justify-center px-4 pt-32 pb-20">
      <div className="max-w-lg text-center animate-luxury-fade">
        <p className="text-luxury-gold text-[10px] tracking-[0.5em] uppercase font-bold mb-8">Error 404</p>
        <h1 className="text-7xl lg:text-9xl font-serif text-luxury-brown mb-8">Lost?</h1>
        <p className="text-luxury-brown/50 text-base tracking-wide font-light mb-16 max-w-sm mx-auto">
          This page does not exist. Let us guide you back.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-6 px-12 py-5 bg-luxury-brown text-white text-[11px] font-bold tracking-[0.4em] uppercase hover:bg-luxury-gold transition-all shadow-xl"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
