import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, CartItem } from '@/types';
import * as store from '@/store';

interface AppContextType {
  user: User | null;
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  register: (user: User) => Promise<boolean>;
  refreshCart: () => void;
  refreshUser: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  const refreshCart = useCallback(() => setCart(store.getCart()), []);
  const refreshUser = useCallback(() => setUser(store.getCurrentUser()), []);

  useEffect(() => {
    store.initStore();
    refreshUser();
    refreshCart();
  }, [refreshCart, refreshUser]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    const session = store.getAuthSession();
    if (!session?.expiresAt) return;

    const ms = session.expiresAt - Date.now();
    if (ms <= 0) {
      store.logoutUser();
      setUser(null);
      return;
    }

    const t = window.setTimeout(() => {
      store.logoutUser();
      setUser(null);
    }, ms);
    return () => window.clearTimeout(t);
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        return null;
      }

      const data = (await res.json()) as { user?: User };
      if (!data.user) return null;

      if (data.user.role === 'admin') {
        store.setAuthSession(data.user, 24 * 60 * 60 * 1000);
      } else {
        store.setCurrentUser(data.user);
      }
      setUser(data.user);
      return data.user;
    } catch {
      const u = store.loginUser(email, password);
      if (u) {
        if (u.role === 'admin') {
          store.setAuthSession(u, 24 * 60 * 60 * 1000);
        }
        setUser(u);
      }
      return u;
    }
  };

  const logout = () => {
    store.logoutUser();
    setUser(null);
  };

  const register = async (user: User) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          phone: user.phone,
          password: user.password,
        }),
      });

      if (!res.ok) {
        return false;
      }

      const data = (await res.json()) as { user?: User };
      if (!data.user) return false;

      store.setCurrentUser(data.user);
      setUser(data.user);
      return true;
    } catch {
      const ok = store.registerUser(user);
      if (ok) {
        store.loginUser(user.email, user.password);
        setUser(user);
      }
      return ok;
    }
  };

  return (
    <AppContext.Provider value={{
      user, cart, cartCount: cart.reduce((s, c) => s + c.quantity, 0),
      cartTotal: cart.reduce((s, c) => s + c.product.price * c.quantity, 0),
      login, logout, register, refreshCart, refreshUser,
    }}>
      {children}
    </AppContext.Provider>
  );
};
