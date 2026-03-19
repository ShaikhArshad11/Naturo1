import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import * as store from '@/store';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';
import type { Product } from '@/types';

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
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left - Image */}
          <div className="lg:w-1/2">
            <div className="aspect-square rounded-lg overflow-hidden border border-border bg-card">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Right - Details (sticky) */}
          <div className="lg:w-1/2 lg:sticky lg:top-24 lg:self-start">
            <p className="text-sm text-primary font-medium mb-2">{product.category}</p>
            <h1 className="text-3xl md:text-4xl font-serif text-foreground mb-2">{product.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-gold">{'★'.repeat(Math.round(product.rating))}</span>
              <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
            </div>
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl font-semibold text-foreground">₹{product.price}</span>
              {product.originalPrice && <span className="text-lg text-muted-foreground line-through">₹{product.originalPrice}</span>}
            </div>
            <p className="text-muted-foreground mb-6">{product.description}</p>

            <div className="mb-6">
              <h3 className="font-sans font-semibold text-sm uppercase tracking-wider text-foreground mb-2">Benefits</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                {product.benefits.map(b => <li key={b}>{b}</li>)}
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="font-sans font-semibold text-sm uppercase tracking-wider text-foreground mb-2">Ingredients</h3>
              <p className="text-sm text-muted-foreground">{product.ingredients.join(', ')}</p>
            </div>

            <div className="mb-6">
              <h3 className="font-sans font-semibold text-sm uppercase tracking-wider text-foreground mb-2">Usage</h3>
              <p className="text-sm text-muted-foreground">{product.usage}</p>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-border rounded-lg">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 text-foreground hover:bg-muted transition-colors">−</button>
                <span className="px-4 py-2 text-foreground font-medium">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="px-3 py-2 text-foreground hover:bg-muted transition-colors">+</button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={handleAddToCart} className="btn-primary px-6 py-3 flex-1">Add to Cart</button>
              <button onClick={handleBuyNow} className="btn-outline-primary px-6 py-3 flex-1">Buy Now</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
