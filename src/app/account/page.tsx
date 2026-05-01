import Link from "next/link";
import { auth } from "@/lib/auth";
import { User, Package, MapPin, LogOut, ChevronRight } from "lucide-react";
import { signOut } from "@/lib/auth";

export default async function AccountPage() {
  const session = await auth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl lg:text-3xl font-serif text-white mb-8">My Account</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a]">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-[#C9A96E]/20 flex items-center justify-center text-[#C9A96E] font-serif text-xl">
                {session?.user?.name?.charAt(0) || "U"}
              </div>
              <div>
                <p className="text-white font-medium">{session?.user?.name}</p>
                <p className="text-gray-500 text-sm">{session?.user?.email}</p>
              </div>
            </div>

            <nav className="space-y-1">
              <Link
                href="/account"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#C9A96E]/10 text-[#C9A96E]"
              >
                <User className="w-5 h-5" />
                <span className="text-sm font-medium">Profile</span>
              </Link>
              <Link
                href="/account/orders"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-[#2a2a2a] hover:text-white transition-colors"
              >
                <Package className="w-5 h-5" />
                <span className="text-sm">Orders</span>
                <ChevronRight className="w-4 h-4 ml-auto" />
              </Link>
              <Link
                href="/account/addresses"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-[#2a2a2a] hover:text-white transition-colors"
              >
                <MapPin className="w-5 h-5" />
                <span className="text-sm">Addresses</span>
                <ChevronRight className="w-4 h-4 ml-auto" />
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors w-full"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm">Sign Out</span>
                </button>
              </form>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-[#1a1a1a] rounded-xl p-8 border border-[#2a2a2a]">
            <h2 className="text-xl font-serif text-white mb-6">Profile Information</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Full Name</label>
                <div className="px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white">
                  {session?.user?.name || "Not set"}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email Address</label>
                <div className="px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white">
                  {session?.user?.email}
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                href="/account/orders"
                className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-6 hover:border-[#C9A96E]/30 transition-colors text-center"
              >
                <Package className="w-8 h-8 text-[#C9A96E] mx-auto mb-3" />
                <p className="text-white font-medium">My Orders</p>
                <p className="text-gray-500 text-sm mt-1">Track & manage</p>
              </Link>
              <Link
                href="/account/addresses"
                className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-6 hover:border-[#C9A96E]/30 transition-colors text-center"
              >
                <MapPin className="w-8 h-8 text-[#C9A96E] mx-auto mb-3" />
                <p className="text-white font-medium">Addresses</p>
                <p className="text-gray-500 text-sm mt-1">Manage saved</p>
              </Link>
              <Link
                href="/wishlist"
                className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-6 hover:border-[#C9A96E]/30 transition-colors text-center"
              >
                <svg className="w-8 h-8 text-[#C9A96E] mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <p className="text-white font-medium">Wishlist</p>
                <p className="text-gray-500 text-sm mt-1">Saved items</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
