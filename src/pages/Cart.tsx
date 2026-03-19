import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import * as store from '@/store';
import { Trash2 } from 'lucide-react';

export default function Cart() {
  const { cart, cartTotal, refreshCart } = useApp();

  const handleQty = (productId: string, qty: number) => {
    store.updateCartQty(productId, qty);
    refreshCart();
  };

  const handleRemove = (productId: string) => {
    store.removeFromCart(productId);
    refreshCart();
  };

  if (cart.length === 0) return (
    <div className="section-padding text-center container-main">
      <h1 className="text-3xl font-serif text-foreground mb-4">Your Cart is Empty</h1>
      <Link href="/shop" className="btn-primary inline-block px-8 py-3">Continue Shopping</Link>
    </div>
  );

  return (
    <div className="section-padding">
      <div className="container-main">
        <h1 className="text-3xl md:text-4xl font-serif text-foreground mb-8">Shopping Cart</h1>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-4">
            {cart.map(item => (
              <div key={item.product.id} className="flex flex-col sm:flex-row sm:items-center gap-4 bg-card rounded-lg border border-border p-4">
                <img src={item.product.image} alt={item.product.name} className="w-20 h-20 rounded-md object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <Link href={`/product/${item.product.id}`} className="font-serif text-lg text-foreground hover:text-primary">{item.product.name}</Link>
                  <p className="text-sm text-muted-foreground">₹{item.product.price}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <div className="flex items-center border border-border rounded">
                      <button onClick={() => handleQty(item.product.id, item.quantity - 1)} className="px-2 py-1 text-sm text-foreground hover:bg-muted">−</button>
                      <span className="px-3 py-1 text-sm text-foreground">{item.quantity}</span>
                      <button onClick={() => handleQty(item.product.id, item.quantity + 1)} className="px-2 py-1 text-sm text-foreground hover:bg-muted">+</button>
                    </div>
                    <button onClick={() => handleRemove(item.product.id)} className="text-destructive hover:text-destructive/80 ml-auto">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="sm:text-right">
                  <span className="font-semibold text-foreground">₹{item.product.price * item.quantity}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:w-80 bg-card rounded-lg border border-border p-6 h-fit lg:sticky lg:top-24">
            <h3 className="font-serif text-xl text-foreground mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span><span>₹{cartTotal}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span><span>Free</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-semibold text-foreground">
                <span>Total</span><span>₹{cartTotal}</span>
              </div>
            </div>
            <Link href="/checkout" className="btn-primary block text-center mt-6 py-3">Proceed to Checkout</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
