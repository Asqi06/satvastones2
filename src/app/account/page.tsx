import Link from "next/link";
import { auth } from "@/lib/auth";
import { Package, MapPin, Heart } from "lucide-react";
import AccountSidebar from "@/components/account/AccountSidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Account",
  description: "Manage your account, view orders, and manage saved addresses.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await auth();

  return (
    <div className="bg-[var(--paper)] text-[var(--ink)]">
      <div className="editorial-container py-10 lg:py-14">
        <div className="eyebrow">Your little collection, managed</div>
        <h1 className="font-serif font-normal tracking-[-0.03em] leading-[1.02] text-[clamp(42px,4.3vw,63px)] mt-3 mb-8">
          My <em className="text-[var(--olive)]">account.</em>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <AccountSidebar userName={session?.user?.name} userEmail={session?.user?.email} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-[var(--white)] border border-[var(--line)] p-6 lg:p-8">
              <h2 className="font-serif text-[28px] font-normal mb-6">Profile information</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.14em] text-[var(--muted)] mb-2">Full name</label>
                  <div className="px-4 py-3 bg-[var(--paper)] border border-[var(--line)] text-[var(--ink)] text-sm">
                    {session?.user?.name || "Not set"}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.14em] text-[var(--muted)] mb-2">Email address</label>
                  <div className="px-4 py-3 bg-[var(--paper)] border border-[var(--line)] text-[var(--ink)] text-sm">
                    {session?.user?.email}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link
                  href="/account/orders"
                  className="bg-[var(--paper)] border border-[var(--line)] p-6 hover:bg-[var(--white)] transition-colors text-center"
                >
                  <Package className="w-7 h-7 text-[var(--olive)] mx-auto mb-3" />
                  <p className="text-[var(--ink)] font-medium">My Orders</p>
                  <p className="text-[var(--muted)] text-sm mt-1">Track &amp; manage</p>
                </Link>
                <Link
                  href="/account/addresses"
                  className="bg-[var(--paper)] border border-[var(--line)] p-6 hover:bg-[var(--white)] transition-colors text-center"
                >
                  <MapPin className="w-7 h-7 text-[var(--olive)] mx-auto mb-3" />
                  <p className="text-[var(--ink)] font-medium">Addresses</p>
                  <p className="text-[var(--muted)] text-sm mt-1">Manage saved</p>
                </Link>
                <Link
                  href="/wishlist"
                  className="bg-[var(--paper)] border border-[var(--line)] p-6 hover:bg-[var(--white)] transition-colors text-center"
                >
                  <Heart className="w-7 h-7 text-[var(--olive)] mx-auto mb-3" />
                  <p className="text-[var(--ink)] font-medium">Saved pieces</p>
                  <p className="text-[var(--muted)] text-sm mt-1">View saved</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
