'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingCart, User, Menu, X, LogOut, Megaphone } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from "next/image"

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
  { label: 'Contact', to: '/contact' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, cartCount, logout } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const [announcement, setAnnouncement] = useState<{ enabled: boolean; text: string } | null>(null);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    let mounted = true;
    fetch('/api/site-settings/announcement', { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) throw new Error('Request failed');
        return (await res.json()) as { enabled?: boolean; text?: string };
      })
      .then((data) => {
        if (!mounted) return;
        setAnnouncement({ enabled: Boolean(data.enabled), text: typeof data.text === 'string' ? data.text : '' });
      })
      .catch(() => {
        if (!mounted) return;
        setAnnouncement(null);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const isActive = (to: string) => {
    if (!pathname) return false;
    if (to === '/') return pathname === '/';
    return pathname === to || pathname.startsWith(`${to}/`);
  };

  return (
    <header className="sticky top-0 z-50 bg-dark-green border-b border-dark-green-foreground/10">
      {announcement?.enabled && announcement.text ? (
        <div className="bg-black text-white">
          <div className="container-main px-4 md:px-8 h-9 flex items-center justify-center text-xs sm:text-sm font-medium tracking-wide">
            <span className="inline-flex items-center gap-2">
              <Megaphone className="h-4 w-4" />
              {announcement.text}
            </span>
          </div>
        </div>
      ) : null}

      <div className="container-main flex items-center justify-between h-auto px-4 md:px-8">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Naturo Logo" height={80} width={80} className='py-2' />
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(l => (
            <Link
              key={l.to}
              href={l.to}
              className={`text-sm font-medium transition-colors relative px-1 py-1 ${
                isActive(l.to)
                  ? 'text-dark-green-foreground after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-full after:bg-primary after:rounded-full'
                  : 'text-dark-green-foreground/75 hover:text-dark-green-foreground'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/cart" className="relative text-dark-green-foreground hover:text-dark-green-foreground/80 transition-colors">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="hidden md:flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="text-dark-green-foreground text-sm font-medium hover:text-dark-green-foreground/80">
                    {user.name}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">My Account</Link>
                  </DropdownMenuItem>
                  {user.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">Admin Panel</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      logout();
                      router.push('/');
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <LogOut className="h-4 w-4" /> Logout
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Link href="/login" className="hidden md:flex items-center gap-1 text-dark-green-foreground text-sm font-medium hover:text-dark-green-foreground/80">
              <User className="h-4 w-4" /> Login
            </Link>
          )}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-dark-green-foreground"
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        className={`md:hidden bg-dark-green border-t border-dark-green-foreground/10 overflow-hidden transition-all duration-300 ${mobileOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="px-4 pb-4 pt-3">
          {navLinks.map(l => (
            <Link
              key={l.to}
              href={l.to}
              className={`block py-2 text-sm font-medium transition-colors rounded-lg px-3 ${
                isActive(l.to)
                  ? 'text-dark-green-foreground bg-dark-green-foreground/10'
                  : 'text-dark-green-foreground/80 hover:text-dark-green-foreground hover:bg-dark-green-foreground/5'
              }`}
            >
              {l.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link href="/profile" className="block py-2 text-dark-green-foreground text-sm font-medium">My Account</Link>
              <button onClick={() => { logout(); router.push('/'); }} className="block py-2 text-dark-green-foreground/70 text-sm">
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="block py-2 text-dark-green-foreground text-sm font-medium">Login</Link>
          )}
        </div>
      </div>
    </header>
  );
}
