import { useEffect, useState } from 'react';
import { Order, User } from '@/types';
import { toast } from 'sonner';

const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] as const;
type OrderStatus = (typeof statuses)[number];

export default function AdminOrders() {
  const [orders, setOrders] = useState<(Order & { customer?: Pick<User, 'id' | 'name' | 'email' | 'phone'> | null })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = async () => {
    const res = await fetch('/api/admin/orders');
    if (!res.ok) {
      throw new Error('Request failed');
    }
    const data = (await res.json()) as {
      orders: (Order & { customer?: Pick<User, 'id' | 'name' | 'email' | 'phone'> | null })[];
    };
    setOrders(data.orders);
  };

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        await refresh();
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        toast.error('Failed to update order status');
        return;
      }

      setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o)));
      toast.success('Order status updated');
    } catch {
      toast.error('Failed to update order status');
    }
  };

  const sorted = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div>
      <h1 className="text-2xl font-serif text-foreground mb-6">Orders ({orders.length})</h1>
      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : sorted.length === 0 ? (
        <p className="text-muted-foreground">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {sorted.map(order => {
            const customer = order.customer;
            return (
              <div key={order.id} className="bg-card rounded-lg border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                  <div>
                    <p className="font-medium text-foreground">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select value={order.status} onChange={e => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      className="px-3 py-1 rounded-md border border-border bg-background text-foreground text-sm capitalize">
                      {statuses.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                    </select>
                    <span className="font-semibold text-foreground">₹{order.total}</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Customer</p>
                    <p className="text-foreground">{customer?.name || 'Unknown'}</p>
                    <p className="text-muted-foreground text-xs">{customer?.email || ''}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Items ({order.items.length})</p>
                    {order.items.map(item => (
                      <p key={item.product.id} className="text-foreground text-xs">{item.product.name} × {item.quantity}</p>
                    ))}
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Shipping</p>
                    <p className="text-foreground text-xs">
                      {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                    </p>
                    <p className="text-muted-foreground text-xs mt-1">Payment: <span className="capitalize">{order.paymentMethod === 'cod' ? 'COD' : order.paymentMethod.toUpperCase()}</span></p>
                    <p className="text-muted-foreground text-xs">Tracking: {order.trackingId}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
