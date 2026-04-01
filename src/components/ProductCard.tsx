import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { useApp } from '@/context/AppContext';
import * as store from '@/store';
import { toast } from 'sonner';
import { Star } from 'lucide-react';

export default function ProductCard({ product }: { product: Product }) {
  const { refreshCart } = useApp();

  const handleAdd = () => {
    store.addToCart(product);
    refreshCart();
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/product/${product.id}`} className="block">
        <div className="aspect-square overflow-hidden relative">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />

          <div className="absolute inset-x-0 top-0 p-3 flex items-start justify-between gap-2">
            <div className="flex flex-col gap-2">
              {product.bestSeller && (
                <span className="inline-flex w-fit items-center rounded-full bg-gold/15 text-gold border border-gold/30 px-2.5 py-1 text-[11px] font-semibold tracking-wide">
                  Best Seller
                </span>
              )}
              {product.featured && (
                <span className="inline-flex w-fit items-center rounded-full bg-primary/15 text-primary border border-primary/30 px-2.5 py-1 text-[11px] font-semibold tracking-wide">
                  Featured
                </span>
              )}
            </div>

            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold border ${product.inStock ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'}`}>
              {product.inStock ? 'In stock' : 'Out of stock'}
            </span>
          </div>
        </div>
      </Link>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <Link href={`/product/${product.id}`} className="min-w-0">
            <h3 className="font-serif text-lg font-semibold text-foreground leading-snug hover:text-primary transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          <div className="shrink-0 text-xs text-muted-foreground">
            {product.category}
          </div>
        </div>

        <div className="flex items-center gap-1 mb-3">
          {Array.from({ length: 5 }).map((_, i) => {
            const filled = i < Math.round(product.rating);
            return (
              <Star
                key={i}
                className={`h-4 w-4 ${filled ? 'fill-gold text-gold' : 'text-border'}`}
              />
            );
          })}
          <span className="text-xs text-muted-foreground ml-1">({product.reviews})</span>
        </div>

        <p className="text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed">{product.description}</p>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-foreground font-semibold text-base">₹{product.price}</span>
            {product.originalPrice && (
              <span className="text-muted-foreground text-sm line-through">₹{product.originalPrice}</span>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={!product.inStock}
            className="btn-primary px-4 py-2.5 text-sm rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
