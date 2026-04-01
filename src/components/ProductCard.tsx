import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { useApp } from '@/context/AppContext';
import * as store from '@/store';
import { toast } from 'sonner';

export default function ProductCard({ product }: { product: Product }) {
  const { refreshCart } = useApp();

  const handleAdd = () => {
    store.addToCart(product);
    refreshCart();
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <Link href={`/product/${product.id}`}>
        <div className="aspect-square overflow-hidden relative">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      </Link>
      <div className="p-4">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-serif text-lg font-semibold text-foreground mb-1 hover:text-primary transition-colors">{product.name}</h3>
        </Link>
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-foreground font-semibold">₹{product.price}</span>
            {product.originalPrice && (
              <span className="text-muted-foreground text-sm line-through">₹{product.originalPrice}</span>
            )}
          </div>
          <button onClick={handleAdd} className="btn-primary px-4 py-2 text-sm">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
