"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Tag,
  FolderTree,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-luxury-cream text-luxury-brown flex flex-col font-sans">
      {/* Horizontal Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-luxury-brown/10 h-20 shadow-sm animate-luxury-fade">
        <div className="container-premium h-full flex items-center justify-between">
          <div className="flex items-center gap-16">
            <Link href="/" className="text-2xl font-serif text-luxury-brown tracking-[0.2em] font-medium uppercase transition-all hover:text-luxury-gold">
              Satvastones
            </Link>
            
            <nav className="hidden lg:flex items-center gap-10">
              {[
                { href: "/admin", label: "Dashboard" },
                { href: "/admin/products", label: "Inventory" },
                { href: "/admin/orders", label: "Orders" },
                { href: "/admin/customers", label: "Customers" },
                { href: "/admin/reports", label: "Reports" },
              ].map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-[12px] font-bold tracking-widest uppercase transition-all duration-300 relative group ${
                      isActive ? "text-luxury-gold" : "text-luxury-brown/50 hover:text-luxury-brown"
                    }`}
                  >
                    {item.label}
                    {isActive && <div className="absolute -bottom-1 left-0 w-full h-[2px] bg-luxury-gold"></div>}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-8">
             <div className="w-10 h-10 rounded-full bg-luxury-cream border border-luxury-brown/10 flex items-center justify-center overflow-hidden grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
               <Users className="w-5 h-5 text-luxury-brown/40" />
             </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 pt-32 pb-20 container-premium animate-luxury-fade overflow-auto">
        {children}
      </main>
    </div>
  );
}
