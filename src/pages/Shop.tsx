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

  const clearFilters = () => {
    setSelectedCategory('');
    setSortBy('');
    setPriceRange([0, 200000]);
    router.push('/shop');
  };

  return (
    <div className="section-padding">
      <div className="container-main">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-primary text-sm font-medium uppercase tracking-widest">Shop</p>
              <h1 className="text-3xl md:text-5xl font-serif text-foreground mt-2">Explore Our Collection</h1>
              <p className="text-muted-foreground text-sm mt-2 max-w-xl">
                Premium cashews and dry fruits, handpicked for freshness and quality.
              </p>
            </div>

            {!loading && (
              <div className="text-sm text-muted-foreground">
                {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-72 shrink-0">
            <div className="bg-card rounded-2xl border border-border p-6 space-y-6 lg:sticky lg:top-24">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-foreground">Filters</div>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear
                </button>
              </div>

              <div>
                <h3 className="font-sans font-semibold text-sm uppercase tracking-wider text-foreground mb-3">Category</h3>
                <div className="space-y-2">
                  <button onClick={() => handleCatChange('')} className={`block text-sm w-full text-left px-3 py-2.5 rounded-xl transition-colors border ${!selectedCategory ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border text-muted-foreground hover:text-foreground hover:border-primary/40'}`}>
                    All Products
                  </button>
                  {categories.map(c => (
                    <button key={c} onClick={() => handleCatChange(c)} className={`block text-sm w-full text-left px-3 py-2.5 rounded-xl transition-colors border ${selectedCategory === c ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border text-muted-foreground hover:text-foreground hover:border-primary/40'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-sans font-semibold text-sm uppercase tracking-wider text-foreground mb-3">Price Range</h3>
                <div className="flex gap-2 items-center text-sm">
                  <input type="number" value={priceRange[0]} onChange={e => setPriceRange([+e.target.value, priceRange[1]])}
                    className="w-24 px-3 py-2 rounded-xl border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Min" />
                  <span className="text-muted-foreground">–</span>
                  <input type="number" value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], +e.target.value])}
                    className="w-24 px-3 py-2 rounded-xl border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Max" />
                </div>
              </div>
            </div>
          </aside>

          {/* Products */}
          <div className="flex-1">
            {!loading && (
              <div className="mb-6 bg-card rounded-2xl border border-border p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="text-sm text-muted-foreground">
                  Showing <span className="text-foreground font-medium">{filtered.length}</span> result{filtered.length !== 1 ? 's' : ''}
                  {selectedCategory ? (
                    <>
                      {' '}in <span className="text-foreground font-medium">{selectedCategory}</span>
                    </>
                  ) : null}
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="w-full sm:w-56 px-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="">Sort: Default</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="best-selling">Best Selling</option>
                    <option value="newest">New Arrivals</option>
                  </select>
                  <button type="button" onClick={clearFilters} className="btn-outline-primary px-4 py-2.5 text-sm rounded-xl">
                    Clear
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="bg-card rounded-2xl border border-border p-10 text-center">
                <p className="text-muted-foreground">Loading products...</p>
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            ) : (
              <div className="bg-card rounded-2xl border border-border p-10 text-center">
                <p className="text-foreground font-medium">No products found</p>
                <p className="text-muted-foreground text-sm mt-1">Try changing category, sort, or price range.</p>
                <button type="button" onClick={clearFilters} className="btn-primary mt-5 px-6 py-2.5 text-sm rounded-xl">
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
