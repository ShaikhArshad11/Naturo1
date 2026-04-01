import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import * as store from '@/store';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';
import type { Product } from '@/types';
import { ShieldCheck, Truck, RefreshCcw, Star } from 'lucide-react';

export default function ProductDetail() {
  const params = useParams<{ id: string }>();
  const id = typeof params?.id === 'string' ? params.id : '';
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const { refreshCart } = useApp();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    if (!id) {
      setLoading(false);
      setProduct(null);
      return;
    }

    setLoading(true);
    fetch(`/api/products/${encodeURIComponent(id)}`, { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) throw new Error('Request failed');
        return (await res.json()) as { product?: Product };
      })
      .then((data) => {
        if (!mounted) return;
        setProduct(data.product ?? null);
      })
      .catch(() => {
        toast.error('Failed to load product');
        setProduct(null);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) return (
    <div className="section-padding text-center container-main">
      <p className="text-muted-foreground">Loading...</p>
    </div>
  );

  if (!product) return (
    <div className="section-padding text-center container-main">
      <h1 className="text-2xl font-serif text-foreground">Product not found</h1>
      <Link href="/shop" className="btn-primary inline-block mt-4 px-6 py-2">Back to Shop</Link>
    </div>
  );

  const handleAddToCart = () => {
    store.addToCart(product, qty);
    refreshCart();
    toast.success(`${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    store.addToCart(product, qty);
    refreshCart();
    router.push('/cart');
  };

  return (
    <div className="section-padding">
      <div className="container-main">
        <div className="mb-6 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/shop" className="hover:text-foreground transition-colors">Shop</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left - Media */}
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden border border-border bg-card">
              <div className="relative w-full h-full">
                <Image src={product.image} alt={product.name} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-card rounded-2xl border border-border p-4 flex items-start gap-3">
                <Truck className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-foreground">Fast Delivery</div>
                  <div className="text-xs text-muted-foreground mt-1">Quick shipping across India</div>
                </div>
              </div>
              <div className="bg-card rounded-2xl border border-border p-4 flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-foreground">Premium Quality</div>
                  <div className="text-xs text-muted-foreground mt-1">Handpicked for freshness</div>
                </div>
              </div>
              <div className="bg-card rounded-2xl border border-border p-4 flex items-start gap-3">
                <RefreshCcw className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-foreground">Easy Support</div>
                  <div className="text-xs text-muted-foreground mt-1">Help available on request</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Details */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="bg-card rounded-2xl border border-border p-6">
              <p className="text-sm text-primary font-medium mb-2">{product.category}</p>
              <h1 className="text-3xl md:text-4xl font-serif text-foreground mb-3">{product.name}</h1>

              <div className="flex items-center gap-2 mb-5">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const filled = i < Math.round(product.rating);
                    return (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${filled ? 'fill-gold text-gold' : 'text-border'}`}
                      />
                    );
                  })}
                </div>
                <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
                <span className={`ml-auto inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold border ${product.inStock ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'}`}>
                  {product.inStock ? 'In stock' : 'Out of stock'}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-semibold text-foreground">₹{product.price}</span>
                {product.originalPrice && <span className="text-lg text-muted-foreground line-through">₹{product.originalPrice}</span>}
              </div>

              <p className="text-muted-foreground leading-relaxed">{product.description}</p>

              <div className="mt-6 flex items-center gap-4">
                <div className="flex items-center border border-border rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-3 py-2.5 text-foreground hover:bg-muted transition-colors"
                  >
                    −
                  </button>
                  <span className="px-4 py-2.5 text-foreground font-medium min-w-12 text-center">{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty(qty + 1)}
                    className="px-3 py-2.5 text-foreground hover:bg-muted transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <button onClick={handleAddToCart} disabled={!product.inStock} className="btn-primary px-6 py-3 flex-1 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed">
                  Add to Cart
                </button>
                <button onClick={handleBuyNow} disabled={!product.inStock} className="btn-outline-primary px-6 py-3 flex-1 rounded-xl disabled:opacity-60 disabled:cursor-not-allowed">
                  Buy Now
                </button>
              </div>
            </div>

            <div className="mt-6 bg-card rounded-2xl border border-border p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-sans font-semibold text-sm uppercase tracking-wider text-foreground mb-2">Benefits</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    {product.benefits.map(b => <li key={b}>{b}</li>)}
                  </ul>
                </div>

                <div>
                  <h3 className="font-sans font-semibold text-sm uppercase tracking-wider text-foreground mb-2">Ingredients</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{product.ingredients.join(', ')}</p>
                </div>

                <div>
                  <h3 className="font-sans font-semibold text-sm uppercase tracking-wider text-foreground mb-2">Usage</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{product.usage}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
