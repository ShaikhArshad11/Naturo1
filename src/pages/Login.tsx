import { useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { User } from '@/types';
import { toast } from 'sonner';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const { login, register } = useApp();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isRegister) {
      if (!name.trim() || !email.trim() || !password.trim()) { toast.error('All fields are required'); return; }
      const user: User = {
        id: crypto.randomUUID(), name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim(),
        password, role: 'customer', createdAt: new Date().toISOString(),
      };
      const ok = await register(user);
      if (ok) { toast.success('Account created!'); router.push('/'); }
      else toast.error('Email already exists');
    } else {
      const user = await login(email.trim().toLowerCase(), password);
      if (user) {
        if (user.role === 'admin') {
          toast.error('Please use admin login page');
          return;
        }
        toast.success('Welcome back!');
        router.push('/');
      } else toast.error('Invalid credentials');
    }
  };

  return (
    <div className="section-padding min-h-[60vh] flex items-center">
      <div className="container-main max-w-md w-full mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-foreground">{isRegister ? 'Create Account' : 'Welcome Back'}</h1>
          <p className="text-muted-foreground text-sm mt-2">{isRegister ? 'Join the Naturo wellness family' : 'Sign in to your account'}</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-8 space-y-5 shadow-sm">
          {isRegister && (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
                <input value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Phone</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" required />
          </div>
          <button type="submit" className="btn-primary w-full py-3 text-sm">{isRegister ? 'Create Account' : 'Sign In'}</button>
          <p className="text-center text-sm text-muted-foreground">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button type="button" onClick={() => setIsRegister(!isRegister)} className="text-primary font-medium hover:underline">
              {isRegister ? 'Sign In' : 'Register'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
