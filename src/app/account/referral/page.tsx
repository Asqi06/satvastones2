import { auth } from "@/lib/auth";
import { Gift, Share2, Copy, Check, Users, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refer & Earn — Satvastones",
  description: "Refer friends and earn ₹500 per successful referral. Your friends get 10% off their first order.",
  robots: { index: false, follow: false },
};

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/account" className="text-gray-400 hover:text-white transition-colors">
          My Account
        </Link>
        <span className="text-gray-600">/</span>
        <span className="text-white">Refer & Earn</span>
      </div>

      <div className="bg-[#1a1a1a] rounded-xl p-8 border border-[#2a2a2a]">
        <div className="flex items-center gap-3 mb-6">
          <Gift className="w-6 h-6 text-[#C9A96E]" />
          <h1 className="text-2xl lg:text-3xl font-serif text-white">Refer &amp; Earn</h1>
        </div>

        {session ? (
          referralData ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0f0f0f] p-4 rounded-lg text-center border border-[#2a2a2a]">
                  <div className="text-2xl font-bold text-[#C9A96E]">{referralData.referredCount}</div>
                  <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">Friends Referred</p>
                </div>
                <div className="bg-[#0f0f0f] p-4 rounded-lg text-center border border-[#2a2a2a]">
                  <div className="text-2xl font-bold text-[#C9A96E]">₹{referralData.referralCommissions?.toLocaleString() || 0}</div>
                  <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">Lifetime Rewards</p>
                </div>
              </div>

              <p className="text-sm text-gray-400">
                Your referral code: <span className="font-bold text-[#C9A96E]">{referralData.referralCode}</span>
              </p>

              <div className="p-4 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg">
                <h3 className="text-sm font-bold text-white mb-3">How it works</h3>
                <ul className="space-y-2 text-[11px] text-gray-400">
                  <li className="flex items-start gap-2">
                    <Users className="w-3 h-3 text-[#C9A96E] mt-0.5 flex-shrink-0" />
                    <span>Your friend gets 10% off their first order.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Gift className="w-3 h-3 text-[#C9A96E] mt-0.5 flex-shrink-0" />
                    <span>You earn ₹500 for every successful referral.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ExternalLink className="w-3 h-3 text-[#C9A96E] mt-0.5 flex-shrink-0" />
                    <span>Rewards credited after their order ships.</span>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-gray-400">Unable to load referral data. Please try again later.</p>
          )
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">Sign in to access your referral program</p>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#C9A96E] text-black font-bold rounded-lg hover:bg-[#C9A96E]/90 transition-all"
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
