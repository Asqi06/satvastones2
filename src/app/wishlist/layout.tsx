import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Wishlist",
  description: "View your saved favorites and add them to your cart.",
  robots: { index: false, follow: false },
};

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return children;
}
