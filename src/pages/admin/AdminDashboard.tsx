import { useMemo, useState, useEffect } from 'react';
import type { ContactMessage, Order, Product, Review, User } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

type AdminOrder = Order & {
  customer?: { id: string; name: string; email: string; phone: string } | null;
};

export default function AdminDashboard() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/products', { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as { products?: Product[] };
        setProducts(data.products ?? []);
      } catch {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/orders', { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as { orders?: AdminOrder[] };
        setOrders(data.orders ?? []);
      } catch {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/customers', { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as { customers?: User[] };
        setCustomers(data.customers ?? []);
      } catch {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/reviews', { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as { reviews?: Review[] };
        setReviews(data.reviews ?? []);
      } catch {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/contact');
        if (!res.ok) {
          return;
        }
        const data = (await res.json()) as { messages: ContactMessage[] };
        setMessages(data.messages);
      } catch {
        // ignore
      }
    })();
  }, []);

  const revenue = useMemo(() => orders.reduce((s, o) => s + (typeof o.total === 'number' ? o.total : 0), 0), [orders]);

  const months = useMemo(() => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], []);

  const years = useMemo(() => {
    const y = new Set<number>();
    for (const o of orders) {
      const d = new Date(o.createdAt);
      if (!Number.isNaN(d.getTime())) y.add(d.getFullYear());
    }
    const list = Array.from(y).sort((a, b) => b - a);
    if (list.length === 0) list.push(new Date().getFullYear());
    return list;
  }, [orders]);

  const chartData = useMemo(() => {
    const byMonth = new Map<string, { revenue: number; orders: number }>();
    for (const m of months) byMonth.set(m, { revenue: 0, orders: 0 });

    for (const o of orders) {
      const d = new Date(o.createdAt);
      if (Number.isNaN(d.getTime())) continue;
      if (d.getFullYear() !== selectedYear) continue;
      const month = months[d.getMonth()];
      const prev = byMonth.get(month);
      if (!prev) continue;
      prev.revenue += typeof o.total === 'number' ? o.total : 0;
      prev.orders += 1;
    }

    return months.map((m) => ({ month: m, revenue: byMonth.get(m)?.revenue ?? 0, orders: byMonth.get(m)?.orders ?? 0 }));
  }, [months, orders, selectedYear]);

  const stats = [
    { label: 'Total Products', value: products.length },
    { label: 'Total Orders', value: orders.length },
    { label: 'Customers', value: customers.length },
    { label: 'Revenue', value: `₹${revenue.toLocaleString()}` },
    { label: 'Unread Messages', value: messages.filter(m => !m.read).length },
    { label: 'Pending Reviews', value: reviews.filter(r => !r.approved).length },
  ];

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div>
      <h1 className="text-2xl font-serif text-foreground mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-card rounded-xl border border-border p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-serif font-semibold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-card rounded-xl border border-border p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-serif text-foreground">Monthly Revenue</h2>
          <select value={selectedYear} onChange={e => setSelectedYear(+e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-sm">
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 15%, 85%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(150, 15%, 40%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(150, 15%, 40%)" />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(40, 15%, 85%)', fontSize: '12px' }}
                formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
              />
              <Bar dataKey="revenue" fill="hsl(152, 45%, 30%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Orders Chart */}
      <div className="bg-card rounded-xl border border-border p-6 mb-8">
        <h2 className="text-xl font-serif text-foreground mb-6">Monthly Orders</h2>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 15%, 85%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(150, 15%, 40%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(150, 15%, 40%)" />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(40, 15%, 85%)', fontSize: '12px' }} />
              <Line type="monotone" dataKey="orders" stroke="hsl(38, 75%, 40%)" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <h2 className="text-xl font-serif text-foreground mb-4">Recent Orders</h2>
      {recentOrders.length === 0 ? (
        <p className="text-muted-foreground text-sm">No orders yet.</p>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-foreground">Order ID</th>
                <th className="text-left px-4 py-3 font-medium text-foreground">Date</th>
                <th className="text-left px-4 py-3 font-medium text-foreground">Total</th>
                <th className="text-left px-4 py-3 font-medium text-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(o => (
                <tr key={o.id} className="border-t border-border">
                  <td className="px-4 py-3 text-foreground">#{o.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-foreground font-medium">₹{o.total}</td>
                  <td className="px-4 py-3"><span className="capitalize text-primary font-medium">{o.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
