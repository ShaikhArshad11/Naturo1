import { useApp } from '@/context/AppContext';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Order } from '@/types';
import { Package, ChevronDown, ChevronUp } from 'lucide-react';

const statusColors: Record<string, string> = {
  pending: 'bg-gold/20 text-gold',
  confirmed: 'bg-primary/20 text-primary',
  processing: 'bg-primary/20 text-primary',
  shipped: 'bg-primary/20 text-primary',
  delivered: 'bg-primary/20 text-primary',
  cancelled: 'bg-destructive/20 text-destructive',
};

export default function Profile() {
  const { user } = useApp();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push('/login');
  }, [router, user]);

  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/orders?userId=${encodeURIComponent(user.id)}`);
        if (!res.ok) {
          setOrders([]);
          return;
        }
        const data = (await res.json()) as { orders?: Order[] };
        setOrders(data.orders ?? []);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [user]);

  if (!user) return null;

  return (
    <div className="section-padding">
      <div className="container-main">
        <h1 className="text-3xl md:text-4xl font-serif text-foreground mb-8">My Profile</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="font-serif text-xl text-foreground mb-4">Account Details</h3>
            <div className="space-y-3 text-sm">
              <div><span className="text-muted-foreground">Name:</span> <span className="text-foreground font-medium">{user.name}</span></div>
              <div><span className="text-muted-foreground">Email:</span> <span className="text-foreground font-medium">{user.email}</span></div>
              <div><span className="text-muted-foreground">Phone:</span> <span className="text-foreground font-medium">{user.phone || 'Not set'}</span></div>
              <div><span className="text-muted-foreground">Member since:</span> <span className="text-foreground font-medium">{new Date(user.createdAt).toLocaleDateString()}</span></div>
            </div>
          </div>

          {/* Orders */}
          <div className="lg:col-span-2">
            <h3 className="font-serif text-xl text-foreground mb-4">My Orders ({orders.length})</h3>
            {isLoading ? (
              <div className="bg-card rounded-lg border border-border p-8 text-center">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-card rounded-lg border border-border p-8 text-center">
                <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">No orders yet</p>
                <Link href="/shop" className="btn-primary inline-block px-6 py-2">Start Shopping</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(order => (
                  <div key={order.id} className="bg-card rounded-lg border border-border overflow-hidden">
                    <button onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                      className="w-full flex items-center justify-between p-4 text-left">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-sm font-medium text-foreground">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColors[order.status] || ''}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-foreground">₹{order.total}</span>
                        {expandedOrder === order.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    </button>
                    {expandedOrder === order.id && (
                      <div className="border-t border-border p-4 space-y-4">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Tracking ID: <span className="text-foreground">{order.trackingId}</span></p>
                          <p className="text-xs text-muted-foreground">Payment: <span className="text-foreground capitalize">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod.toUpperCase()}</span></p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-foreground mb-2">Items:</p>
                          {order.items.map(item => (
                            <div key={item.product.id} className="flex items-center gap-3 mb-2">
                              <Image src={item.product.image} alt={item.product.name} width={40} height={40} className="w-10 h-10 rounded object-cover" />
                              <div className="flex-1">
                                <p className="text-sm text-foreground">{item.product.name}</p>
                                <p className="text-xs text-muted-foreground">Qty: {item.quantity} × ₹{item.product.price}</p>
                              </div>
                              <span className="text-sm font-medium text-foreground">₹{item.product.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-foreground mb-1">Shipping Address:</p>
                          <p className="text-xs text-muted-foreground">
                            {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
