"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  BarChart3,
  Package,
  FolderTree,
  Image,
  LayoutTemplate,
  TrendingUp,
  Star,
  Sparkles,
  Zap,
  Tag,
  ShoppingBag,
  Users,
  MessageSquare,
  HelpCircle,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    title: "MAIN",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "CATALOG",
    items: [
      { label: "Products", href: "/admin/products", icon: Package },
      { label: "Categories", href: "/admin/categories", icon: FolderTree },
    ],
  },
  {
    title: "CONTENT",
    items: [
      { label: "Banners", href: "/admin/banners", icon: Image },
      { label: "Homepage Sections", href: "/admin/homepage-sections", icon: LayoutTemplate },
      { label: "Trends", href: "/admin/trends", icon: TrendingUp },
      { label: "Best Sellers", href: "/admin/best-sellers", icon: Star },
      { label: "New Collection", href: "/admin/new-collection", icon: Sparkles },
    ],
  },
  {
    title: "SALES",
    items: [
      { label: "Sale Sections", href: "/admin/sales", icon: Zap },
      { label: "Coupons", href: "/admin/coupons", icon: Tag },
    ],
  },
  {
    title: "ORDERS & CUSTOMERS",
    items: [
      { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
      { label: "Customers", href: "/admin/customers", icon: Users },
    ],
  },
  {
    title: "CONTENT CMS",
    items: [
      { label: "Reviews", href: "/admin/reviews", icon: MessageSquare },
      { label: "FAQs", href: "/admin/faqs", icon: HelpCircle },
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

export default function AdminSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-luxury-cream text-luxury-brown flex font-sans">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-white border-r border-luxury-brown/10 shadow-lg flex flex-col transition-all duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:sticky lg:z-auto
          ${collapsed ? "lg:w-[72px]" : "lg:w-[280px]"}
          w-[280px]`}
      >
        {/* Logo header */}
        <div className={`h-20 flex items-center border-b border-luxury-brown/10 px-6 ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed && (
            <Link href="/" className="text-xl font-serif text-luxury-brown tracking-[0.2em] font-medium uppercase hover:text-luxury-gold transition-colors">
              Satvastones
            </Link>
          )}
          {collapsed && (
            <Link href="/" className="text-lg font-serif text-luxury-brown font-medium uppercase hover:text-luxury-gold transition-colors">
              S
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-luxury-brown/60 hover:text-luxury-brown transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav sections */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navSections.map((section) => (
            <div key={section.title} className="mb-6">
              {!collapsed && (
                <p className="px-3 mb-2 text-[10px] font-bold tracking-[0.2em] text-luxury-brown/40 uppercase">
                  {section.title}
                </p>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        title={collapsed ? item.label : undefined}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative
                          ${active
                            ? "bg-luxury-gold/10 text-luxury-gold font-semibold"
                            : "text-luxury-brown/60 hover:text-luxury-brown hover:bg-luxury-cream/80"
                          }
                          ${collapsed ? "justify-center" : ""}`}
                      >
                        {active && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-luxury-gold rounded-r" />
                        )}
                        <Icon className={`w-5 h-5 flex-shrink-0 ${active ? "text-luxury-gold" : "text-luxury-brown/40 group-hover:text-luxury-brown/70"}`} />
                        {!collapsed && <span>{item.label}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer actions */}
        <div className={`border-t border-luxury-brown/10 p-3 ${collapsed ? "px-2" : ""}`}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-full items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm text-luxury-brown/50 hover:text-luxury-brown hover:bg-luxury-cream/80 transition-all"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft className={`w-5 h-5 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
            {!collapsed && <span>Collapse</span>}
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-luxury-brown/60 hover:text-red-600 hover:bg-red-50 transition-all ${collapsed ? "justify-center" : ""}`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Top header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-luxury-brown/10 h-16">
          <div className="flex items-center justify-between h-full px-4 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-luxury-brown/60 hover:text-luxury-brown transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="hidden lg:block">
                <h1 className="text-sm font-semibold tracking-wide uppercase text-luxury-brown/60">
                  Admin Panel
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/"
                target="_blank"
                className="text-xs font-bold tracking-widest uppercase text-luxury-brown/40 hover:text-luxury-gold transition-colors"
              >
                View Site
              </Link>
              <div className="w-9 h-9 rounded-full bg-luxury-cream border border-luxury-brown/10 flex items-center justify-center cursor-pointer hover:border-luxury-gold/30 transition-colors">
                <Users className="w-4 h-4 text-luxury-brown/40" />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-8 animate-luxury-fade">
          {children}
        </main>
      </div>
    </div>
  );
}
