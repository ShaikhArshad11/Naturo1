import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Order } from '@/types';

export default function OrderSuccess() {
  const params = useParams<{ id: string }>();
  const id = typeof params?.id === 'string' ? params.id : '';
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/orders/${id}`);
        if (!res.ok) {
          setOrder(null);
          return;
        }
        const data = (await res.json()) as { order?: Order };
        setOrder(data.order ?? null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  if (isLoading) return (
    <div className="section-padding text-center container-main">
      <p className="text-muted-foreground">Loading...</p>
    </div>
  );

  if (!order) return (
    <div className="section-padding text-center container-main">
      <h1 className="text-2xl font-serif text-foreground">Order not found</h1>
      <Link href="/" className="btn-primary inline-block mt-4 px-6 py-2">Go Home</Link>
    </div>
  );

  return (
    <div className="section-padding">
      <div className="container-main max-w-lg text-center">
        <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-serif text-foreground mb-2">Order Placed!</h1>
        <p className="text-muted-foreground mb-2">Thank you for your purchase.</p>
        <p className="text-sm text-muted-foreground mb-1">Order ID: <span className="text-foreground font-medium">{order.id.slice(0, 8)}</span></p>
        <p className="text-sm text-muted-foreground mb-6">Tracking ID: <span className="text-foreground font-medium">{order.trackingId}</span></p>
        <div className="flex gap-3 justify-center">
          <Link href="/profile" className="btn-primary px-6 py-2">View My Orders</Link>
          <Link href="/shop" className="btn-outline-primary px-6 py-2">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
