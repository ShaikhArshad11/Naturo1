import Link from 'next/link';
import { Product } from '@/types';
import { useApp } from '@/context/AppContext';
import * as store from '@/store';
import { toast } from 'sonner';
import { useEffect, useMemo, useState } from 'react';

export default function ProductCard({ product }: { product: Product }) {
  const { refreshCart } = useApp();

  const images = useMemo(() => {
    const list = [product.image, product.image2].filter((x): x is string => typeof x === 'string' && x.trim().length > 0);
    return list.length > 0 ? list : [''];
  }, [product.image, product.image2]);

  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    setImageIndex(0);
  }, [images.length, product.id]);

  useEffect(() => {
    if (images.length < 2) return;
    const id = window.setInterval(() => {
      setImageIndex((i) => (i + 1) % images.length);
    }, 3000);
    return () => window.clearInterval(id);
  }, [images]);

  const handleAdd = () => {
    store.addToCart(product);
    refreshCart();
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <Link href={`/product/${product.id}`}>
        <div className="aspect-square overflow-hidden relative">
          {images.map((src, idx) => (
            <img
              key={`${product.id}-${idx}-${src}`}
              src={src}
              alt={product.name}
              className={
                `absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ` +
                `${idx === imageIndex ? 'opacity-100' : 'opacity-0'} ` +
                `group-hover:scale-105 transition-transform duration-500`
              }
            />
          ))}
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
