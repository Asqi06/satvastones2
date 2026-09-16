"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { User, Package, MapPin, Gift, Heart, LogOut } from "lucide-react";

const LINKS = [
  { href: "/account", label: "Profile", Icon: User, exact: true },
  { href: "/account/orders", label: "Orders", Icon: Package, exact: false },
  { href: "/account/addresses", label: "Addresses", Icon: MapPin, exact: false },
  { href: "/account/referral", label: "Refer & Earn", Icon: Gift, exact: false },
  { href: "/wishlist", label: "Saved pieces", Icon: Heart, exact: false },
];

export default function AccountSidebar({
  userName,
  userEmail,
}: {
  userName?: string | null;
  userEmail?: string | null;
}) {
  const pathname = usePathname();
  const initial = ((userName || userEmail || "U").charAt(0) || "U").toUpperCase();

  return (
    <div className="bg-[var(--white)] border border-[var(--line)] p-6">
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[var(--line)]">
        <div
          className="w-14 h-14 rounded-full bg-[var(--olive)] text-[var(--white)] flex items-center justify-center font-serif text-xl flex-shrink-0"
          aria-hidden="true"
        >
          {initial}
        </div>
        <div className="min-w-0">
          <p className="text-[var(--ink)] font-medium truncate">{userName || "Welcome"}</p>
          <p className="text-[var(--muted)] text-sm truncate">{userEmail || "Your account"}</p>
        </div>
      </div>

      <nav className="space-y-1" aria-label="Account">
        {LINKS.map(({ href, label, Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 px-4 py-3 border text-sm transition-colors ${
                active
                  ? "bg-[var(--paper)] text-[var(--ink)] font-medium border-[var(--line)]"
                  : "text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--paper)] border-transparent"
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${active ? "text-[var(--olive)]" : ""}`} />
              <span>{label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--muted)] hover:text-[#9b5144] transition-colors w-full cursor-pointer"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span>Sign Out</span>
        </button>
      </nav>
    </div>
  );
}
