'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { LayoutDashboard, Package, ShoppingCart, Users, Mail, LogOut, Star, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

const navItems = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
  { label: 'Products', to: '/admin/products', icon: Package },
  { label: 'Orders', to: '/admin/orders', icon: ShoppingCart },
  { label: 'Customers', to: '/admin/customers', icon: Users },
  { label: 'Messages', to: '/admin/messages', icon: Mail },
  { label: 'Reviews', to: '/admin/reviews', icon: Star },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (pathname === '/admin/login') return;
    if (!user || user.role !== 'admin') router.push('/admin/login');
  }, [router, user, pathname]);

  if (pathname === '/admin/login') return children;

  if (pathname !== '/admin/login' && (!user || user.role !== 'admin')) return null;

  const closeMobileNav = () => setMobileNavOpen(false);

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 bg-dark-green text-dark-green-foreground shrink-0 flex-col">
        <div className="p-4 flex items-center gap-2 border-b border-dark-green-foreground/10">
          <img src="/naturo1.PNG" alt="Logo" className="h-8 w-8 rounded-full object-cover" />
          <span className="font-serif text-lg font-semibold">Admin Panel</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                href={item.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${active ? 'bg-primary text-primary-foreground' : 'text-dark-green-foreground/70 hover:text-dark-green-foreground hover:bg-dark-green-foreground/5'}`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-dark-green-foreground/10">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-dark-green-foreground/70 hover:text-dark-green-foreground">
            View Store
          </Link>
          <button
            onClick={() => {
              logout();
              router.push('/');
            }}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-dark-green-foreground/70 hover:text-dark-green-foreground w-full"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 bg-background overflow-auto">
        {/* Mobile topbar */}
        <div className="md:hidden sticky top-0 z-40 bg-dark-green text-dark-green-foreground border-b border-dark-green-foreground/10">
          <div className="flex items-center justify-between px-4 h-14">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="inline-flex items-center justify-center w-10 h-10 rounded-md hover:bg-dark-green-foreground/10"
              aria-label="Open menu"
              type="button"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <img src="/naturo1.PNG" alt="Logo" className="h-7 w-7 rounded-full object-cover" />
              <span className="font-serif text-base font-semibold">Admin</span>
            </div>
            <button
              onClick={() => {
                logout();
                router.push('/');
              }}
              className="inline-flex items-center justify-center w-10 h-10 rounded-md hover:bg-dark-green-foreground/10"
              aria-label="Logout"
              type="button"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 md:p-8">
          {children}
        </div>
      </main>

      {/* Mobile nav drawer */}
      {mobileNavOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            onClick={closeMobileNav}
            aria-label="Close menu"
          />
          <div className="absolute left-0 top-0 h-full w-[80%] max-w-xs bg-dark-green text-dark-green-foreground shadow-2xl flex flex-col">
            <div className="p-4 flex items-center justify-between border-b border-dark-green-foreground/10">
              <div className="flex items-center gap-2">
                <img src="/naturo1.PNG" alt="Logo" className="h-8 w-8 rounded-full object-cover" />
                <span className="font-serif text-lg font-semibold">Admin Panel</span>
              </div>
              <button
                onClick={closeMobileNav}
                className="inline-flex items-center justify-center w-9 h-9 rounded-md hover:bg-dark-green-foreground/10"
                aria-label="Close menu"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-auto">
              {navItems.map(item => {
                const active = pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    href={item.to}
                    onClick={closeMobileNav}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${active ? 'bg-primary text-primary-foreground' : 'text-dark-green-foreground/70 hover:text-dark-green-foreground hover:bg-dark-green-foreground/5'}`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="p-3 border-t border-dark-green-foreground/10">
              <Link
                href="/"
                onClick={closeMobileNav}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-dark-green-foreground/70 hover:text-dark-green-foreground"
              >
                View Store
              </Link>
              <button
                onClick={() => {
                  closeMobileNav();
                  logout();
                  router.push('/');
                }}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-dark-green-foreground/70 hover:text-dark-green-foreground w-full"
                type="button"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
