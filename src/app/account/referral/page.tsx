import { auth } from "@/lib/auth";
import { Gift, Users, ExternalLink } from "lucide-react";
import Link from "next/link";
import AccountSidebar from "@/components/account/AccountSidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refer & Earn — Satvastones",
  description: "Refer friends and earn ₹500 per successful referral. Your friends get 10% off their first order.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

async function getReferralData(email: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "https://satvastones.in"}/api/referral?userId=${encodeURIComponent(email)}`);
    if (res.ok) return await res.json();
  } catch {
    return null;
  }
  return null;
}

export default async function ReferralPage() {
  const session = await auth();
  const referralData = session?.user?.email ? await getReferralData(session.user.email) : null;

  return (
    <div className="bg-[var(--paper)] text-[var(--ink)]">
      <div className="editorial-container py-10 lg:py-14">
        <div className="eyebrow">Give a little, get a little</div>
        <h1 className="font-serif font-normal tracking-[-0.03em] leading-[1.02] text-[clamp(42px,4.3vw,63px)] mt-3 mb-8">
          Refer <em className="text-[var(--olive)]">&amp; earn.</em>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          <div className="lg:col-span-1">
            <AccountSidebar userName={session?.user?.name} userEmail={session?.user?.email} />
          </div>

          <div className="lg:col-span-3">
            <div className="bg-[var(--white)] border border-[var(--line)] p-6 lg:p-8">
              <div className="flex items-center gap-3 mb-6">
                <Gift className="w-6 h-6 text-[var(--olive)]" />
                <h2 className="font-serif text-[28px] font-normal">How it works</h2>
              </div>

              {session ? (
                referralData ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[var(--paper)] p-5 text-center border border-[var(--line)]">
                        <div className="font-serif text-[32px] text-[var(--olive)]">{referralData.referredCount}</div>
                        <p className="text-[10px] text-[var(--muted)] mt-1 uppercase tracking-[0.14em]">Friends referred</p>
                      </div>
                      <div className="bg-[var(--paper)] p-5 text-center border border-[var(--line)]">
                        <div className="font-serif text-[32px] text-[var(--olive)]">₹{referralData.referralCommissions?.toLocaleString() || 0}</div>
                        <p className="text-[10px] text-[var(--muted)] mt-1 uppercase tracking-[0.14em]">Lifetime rewards</p>
                      </div>
                    </div>

                    <p className="text-sm text-[var(--muted)]">
                      Your referral code: <span className="font-semibold text-[var(--olive)]">{referralData.referralCode}</span>
                    </p>

                    <div className="p-5 bg-[var(--paper)] border border-[var(--line)]">
                      <ul className="space-y-3 text-[13px] text-[var(--muted)]">
                        <li className="flex items-start gap-2.5">
                          <Users className="w-4 h-4 text-[var(--olive)] mt-0.5 flex-shrink-0" />
                          <span>Your friend gets 10% off their first order.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <Gift className="w-4 h-4 text-[var(--olive)] mt-0.5 flex-shrink-0" />
                          <span>You earn ₹500 for every successful referral.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <ExternalLink className="w-4 h-4 text-[var(--olive)] mt-0.5 flex-shrink-0" />
                          <span>Rewards credited after their order ships.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p className="text-[var(--muted)] text-sm">Unable to load referral data. Please try again later.</p>
                )
              ) : (
                <div className="text-center py-10">
                  <p className="text-[var(--muted)] mb-5">Sign in to access your referral program</p>
                  <Link href="/auth/login" className="button inline-flex">
                    Sign in
                    <svg className="w-[19px] h-[19px]"><use href="#i-arrow" /></svg>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
