'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types';
import { toast } from 'sonner';

export default function Shop() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initCat = searchParams?.get('category') || '';
  const [selectedCategory, setSelectedCategory] = useState(initCat);
  const [sortBy, setSortBy] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200000]);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch('/api/products', { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) throw new Error('Request failed');
        return (await res.json()) as { products?: Product[] };
      })
      .then((data) => {
        if (!mounted) return;
        setProducts(data.products ?? []);
      })
      .catch(() => {
        toast.error('Failed to load products');
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) {
      if (typeof p.category === 'string' && p.category.trim()) set.add(p.category.trim());
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const filtered = useMemo(() => {
    let result = [...products];
    if (selectedCategory) result = result.filter(p => p.category === selectedCategory);
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (sortBy === 'price-asc') result.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);
    else if (sortBy === 'best-selling') result = result.filter(p => p.bestSeller);
    else if (sortBy === 'newest') result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return result;
  }, [products, selectedCategory, sortBy, priceRange]);

  const handleCatChange = (cat: string) => {
    setSelectedCategory(cat);
    if (cat) router.push(`/shop?category=${encodeURIComponent(cat)}`);
    else router.push('/shop');
  };

  return (
    <div className="section-padding">
      <div className="container-main">
        <h1 className="text-3xl md:text-4xl font-serif text-foreground mb-8">Shop</h1>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 shrink-0">
            <div className="space-y-6">
              <div>
                <h3 className="font-sans font-semibold text-sm uppercase tracking-wider text-foreground mb-3">Category</h3>
                <div className="space-y-2">
                  <button onClick={() => handleCatChange('')} className={`block text-sm w-full text-left px-3 py-2 rounded-md transition-colors ${!selectedCategory ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                    All Products
                  </button>
                  {categories.map(c => (
                    <button key={c} onClick={() => handleCatChange(c)} className={`block text-sm w-full text-left px-3 py-2 rounded-md transition-colors ${selectedCategory === c ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-sans font-semibold text-sm uppercase tracking-wider text-foreground mb-3">Sort By</h3>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full px-3 py-2 rounded-md border border-border bg-card text-sm text-foreground">
                  <option value="">Default</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="best-selling">Best Selling</option>
                  <option value="newest">New Arrivals</option>
                </select>
              </div>
              <div>
                <h3 className="font-sans font-semibold text-sm uppercase tracking-wider text-foreground mb-3">Price Range</h3>
                <div className="flex gap-2 items-center text-sm">
                  <input type="number" value={priceRange[0]} onChange={e => setPriceRange([+e.target.value, priceRange[1]])}
                    className="w-20 px-2 py-1 rounded border border-border bg-card text-foreground" placeholder="Min" />
                  <span className="text-muted-foreground">–</span>
                  <input type="number" value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], +e.target.value])}
                    className="w-20 px-2 py-1 rounded border border-border bg-card text-foreground" placeholder="Max" />
                </div>
              </div>
            </div>
          </aside>

          {/* Products */}
          <div className="flex-1">
            {loading ? (
              <p className="text-center text-muted-foreground py-16">Loading products...</p>
            ) : (
              <p className="text-sm text-muted-foreground mb-4">{filtered.length} product{filtered.length !== 1 ? 's' : ''} found</p>
            )}

            {!loading && filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            ) : !loading ? (
              <p className="text-center text-muted-foreground py-16">No products found matching your criteria.</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
