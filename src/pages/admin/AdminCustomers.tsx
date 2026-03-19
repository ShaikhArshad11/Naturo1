import { useEffect, useState } from 'react';
import { User } from '@/types';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/customers');
        if (!res.ok) {
          setCustomers([]);
          return;
        }
        const data = (await res.json()) as { customers: User[] };
        setCustomers(data.customers);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-serif text-foreground mb-6">Customers ({customers.length})</h1>
      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : customers.length === 0 ? (
        <p className="text-muted-foreground">No customers yet.</p>
      ) : (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="min-w-[720px] w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-foreground">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-foreground">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-foreground">Phone</th>
                  <th className="text-left px-4 py-3 font-medium text-foreground">Joined</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id} className="border-t border-border">
                    <td className="px-4 py-3 text-foreground font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.phone || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
