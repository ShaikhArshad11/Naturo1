'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { LayoutDashboard, Package, ShoppingCart, Users, Mail, LogOut, Star } from 'lucide-react';
import { useEffect } from 'react';
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

  useEffect(() => {
    if (pathname === '/admin/login') return;
    if (!user || user.role !== 'admin') router.push('/admin/login');
  }, [router, user, pathname]);

  if (pathname === '/admin/login') return children;

  if (pathname !== '/admin/login' && (!user || user.role !== 'admin')) return null;

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 bg-dark-green text-dark-green-foreground shrink-0 flex flex-col">
        <div className="p-4 flex items-center gap-2 border-b border-dark-green-foreground/10">
          <img src="/naturo1.PNG" alt="Logo" className="h-8 w-8 rounded-full object-cover" />
          <span className="font-serif text-lg font-semibold">Admin Panel</span>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => {
            const active = pathname === item.to;
            return (
              <Link key={item.to} href={item.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${active ? 'bg-primary text-primary-foreground' : 'text-dark-green-foreground/70 hover:text-dark-green-foreground hover:bg-dark-green-foreground/5'}`}>
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
          <button onClick={() => { logout(); router.push('/'); }} className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-dark-green-foreground/70 hover:text-dark-green-foreground w-full">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 bg-background overflow-auto">
        <div className="p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
