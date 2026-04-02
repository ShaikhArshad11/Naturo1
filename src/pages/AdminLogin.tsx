import { useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';
import { Shield } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useApp();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const user = await login(email.trim().toLowerCase(), password);
    if (user && user.role === 'admin') {
      toast.success('Welcome, Admin!');
      router.push('/admin');
    } else {
      toast.error('Invalid admin credentials');
    }
  };

  return (
    <div className="min-h-screen bg-dark-green flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Naturo" className="h-16 w-16 rounded-full mx-auto mb-4 object-cover" />
          <h1 className="text-3xl font-serif text-dark-green-foreground">Admin Panel</h1>
          <p className="text-dark-green-foreground/60 text-sm mt-2">Secure admin access only</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-card rounded-xl p-8 space-y-5 shadow-lg">
          <div className="flex items-center gap-2 text-primary mb-2">
            <Shield className="h-5 w-5" />
            <span className="text-sm font-medium">Admin Login</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" required />
          </div>
          <button type="submit" className="btn-primary w-full py-3 text-sm">Sign In as Admin</button>
        </form>
      </div>
    </div>
  );
}
