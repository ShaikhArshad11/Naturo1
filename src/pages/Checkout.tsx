import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import * as store from '@/store';
import { Address, Order } from '@/types';
import { toast } from 'sonner';

type RazorpayResponse = {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id?: string;
  modal?: {
    ondismiss?: () => void;
  };
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: { color?: string };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: string, handler: (resp: unknown) => void) => void;
    };
  }
}

export default function Checkout() {
  const { user, cart, cartTotal, refreshCart } = useApp();
  const router = useRouter();

  const [shipping, setShipping] = useState<Address>({ street: '', city: '', state: '', pincode: '', country: 'India' });
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [billing, setBilling] = useState<Address>({ street: '', city: '', state: '', pincode: '', country: 'India' });
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cod' | 'razorpay'>('cod');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  useEffect(() => {
    if (cart.length === 0) {
      router.push('/cart');
    }
  }, [cart.length, router]);

  if (cart.length === 0) return null;

  const createOrderObj = (): Order => ({
    id: crypto.randomUUID(),
    userId: user!.id,
    items: [...cart],
    total: cartTotal,
    status: 'pending',
    shippingAddress: shipping,
    billingAddress: sameAsBilling ? shipping : billing,
    paymentMethod,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    trackingId: `NTR${Date.now().toString(36).toUpperCase()}`,
  });

  const persistOrder = async (order: Order) => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    });
    if (!res.ok) {
      throw new Error('Request failed');
    }
    const data = (await res.json()) as { order?: Order };
    return data.order ?? order;
  };

  const loadRazorpaySdk = async () => {
    if (window.Razorpay) return true;
    return await new Promise<boolean>((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const createRazorpayOrder = async (receipt: string, amountInPaise: number) => {
    const res = await fetch('/api/razorpay/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ receipt, amount: amountInPaise }),
    });

    if (!res.ok) {
      throw new Error('Failed to create Razorpay order');
    }

    return (await res.json()) as { orderId: string; amount: number; currency: string };
  };

  const verifyRazorpayPayment = async (payload: RazorpayResponse) => {
    const res = await fetch('/api/razorpay/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      return false;
    }

    const data = (await res.json()) as { ok?: boolean };
    return Boolean(data.ok);
  };

  const handleRazorpay = async () => {
    try {
      setIsPlacingOrder(true);

      const ok = await loadRazorpaySdk();
      if (!ok) {
        toast.error('Failed to load Razorpay. Please try again.');
        return;
      }

      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!keyId) {
        toast.error('Razorpay key not configured');
        return;
      }

      const order = createOrderObj();
      const amountInPaise = Math.round(cartTotal * 100);
      const rpOrder = await createRazorpayOrder(order.id, amountInPaise);

      type RazorpayCheckoutOptions = RazorpayOptions & {
        order_id: string;
        modal?: {
          ondismiss?: () => void;
        };
      };

      const options: RazorpayCheckoutOptions = {
        key: keyId,
        amount: rpOrder.amount,
        currency: rpOrder.currency,
        name: 'Naturo',
        description: 'Order Payment',
        order_id: rpOrder.orderId,
        modal: {
          ondismiss: () => {
            toast.error('Payment cancelled');
            setIsPlacingOrder(false);
          },
        },
        handler: async (response: RazorpayResponse) => {
          try {
            const verified = await verifyRazorpayPayment(response);
            if (!verified) {
              toast.error('Payment verification failed');
              return;
            }

            const paidOrder: Order = {
              ...order,
              paymentMethod: 'razorpay',
              status: 'confirmed',
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
            };

            await persistOrder(paidOrder);
            store.clearCart();
            refreshCart();
            toast.success('Payment successful!');
            router.push(`/order-success/${order.id}`);
          } catch {
            toast.error('Failed to save order');
          } finally {
            setIsPlacingOrder(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: { color: '#2D6A4F' },
      };

      const RazorpayCtor = window.Razorpay;
      if (!RazorpayCtor) {
        toast.error('Razorpay not available');
        return;
      }

      const rzp = new RazorpayCtor(options);

      rzp.on('payment.failed', (resp: unknown) => {
        console.error('Razorpay payment failed', resp);
        toast.error('Payment failed. Please try again.');
        setIsPlacingOrder(false);
      });

      rzp.open();
    } catch {
      toast.error('Failed to start payment');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isPlacingOrder) return;
    if (!shipping.street || !shipping.city || !shipping.state || !shipping.pincode) {
      toast.error('Please fill in all shipping details');
      return;
    }
    if (!user) {
      toast.error('Please login to place an order');
      router.push('/login');
      return;
    }

    if (paymentMethod === 'razorpay') {
      await handleRazorpay();
      return;
    }

    try {
      setIsPlacingOrder(true);
      const order = createOrderObj();
      await persistOrder(order);
      store.clearCart();
      refreshCart();
      toast.success('Order placed successfully!');
      router.push(`/order-success/${order.id}`);
    } catch {
      toast.error('Failed to place order');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="section-padding">
      <div className="container-main">
        <h1 className="text-3xl md:text-4xl font-serif text-foreground mb-8">Checkout</h1>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-6">
              {/* Shipping */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-serif text-xl text-foreground mb-4">Shipping Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-1">Street Address</label>
                    <input value={shipping.street} onChange={e => setShipping({ ...shipping, street: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">City</label>
                    <input value={shipping.city} onChange={e => setShipping({ ...shipping, city: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">State</label>
                    <input value={shipping.state} onChange={e => setShipping({ ...shipping, state: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Pincode</label>
                    <input value={shipping.pincode} onChange={e => setShipping({ ...shipping, pincode: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Country</label>
                    <input value={shipping.country} onChange={e => setShipping({ ...shipping, country: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm" />
                  </div>
                </div>
              </div>

              {/* Billing */}
              <div className="bg-card rounded-xl border border-border p-6">
                <label className="flex items-center gap-2 mb-4">
                  <input type="checkbox" checked={sameAsBilling} onChange={e => setSameAsBilling(e.target.checked)} className="accent-primary" />
                  <span className="text-sm text-foreground">Billing address same as shipping</span>
                </label>
                {!sameAsBilling && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-foreground mb-1">Street Address</label>
                      <input value={billing.street} onChange={e => setBilling({ ...billing, street: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">City</label>
                      <input value={billing.city} onChange={e => setBilling({ ...billing, city: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">State</label>
                      <input value={billing.state} onChange={e => setBilling({ ...billing, state: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Pincode</label>
                      <input value={billing.pincode} onChange={e => setBilling({ ...billing, pincode: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Country</label>
                      <input value={billing.country} onChange={e => setBilling({ ...billing, country: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm" />
                    </div>
                  </div>
                )}
              </div>

              {/* Payment */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-serif text-xl text-foreground mb-4">Payment Method</h3>
                <div className="space-y-3">
                  {([
                    { key: 'cod', label: 'Cash on Delivery' },
                    { key: 'upi', label: 'UPI' },
                    { key: 'card', label: 'Card' },
                    { key: 'razorpay', label: 'Pay with Razorpay' },
                  ] as const).map(m => (
                    <label key={m.key} className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-border hover:border-primary/30 transition-colors">
                      <input type="radio" name="payment" checked={paymentMethod === m.key} onChange={() => setPaymentMethod(m.key)} className="accent-primary" />
                      <span className="text-sm text-foreground">{m.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="lg:w-80 bg-card rounded-xl border border-border p-6 h-fit lg:sticky lg:top-24">
              <h3 className="font-serif text-xl text-foreground mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4">
                {cart.map(item => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.product.name} × {item.quantity}</span>
                    <span className="text-foreground">₹{item.product.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>₹{cartTotal}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span>Free</span></div>
                <div className="border-t border-border pt-2 flex justify-between font-semibold text-foreground"><span>Total</span><span>₹{cartTotal}</span></div>
              </div>
              <button type="submit" disabled={isPlacingOrder} className="btn-primary w-full mt-6 py-3 text-sm disabled:opacity-70">
                {paymentMethod === 'razorpay' ? (isPlacingOrder ? 'Opening Razorpay...' : 'Pay with Razorpay') : (isPlacingOrder ? 'Placing Order...' : 'Place Order')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
