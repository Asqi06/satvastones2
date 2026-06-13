import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Join and discover premium Korean and aesthetic jewelry collections.",
  robots: { index: false, follow: false },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
