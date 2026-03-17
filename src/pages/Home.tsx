'use client';

import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { subscribeNewsletter } from '@/store';
import { useMemo, useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Review, Product } from '@/types';
import { useApp } from '@/context/AppContext';
import { Leaf, ShieldCheck, Award, Truck, Heart, Star, X } from 'lucide-react';

const categoryEmoji: Record<string, string> = {
  'Herbal Juices': '🍃',
  'Natural Supplements': '💊',
  'Immunity Boosters': '🛡️',
  'Ayurvedic Powders': '🫙',
  'Natural Skincare': '🌿',
};

const commitments = [
  { icon: Leaf, title: '100% Natural', desc: 'Every ingredient is sourced from nature, no synthetics ever.' },
  { icon: ShieldCheck, title: 'Chemical-Free', desc: 'No harmful chemicals, preservatives, or artificial additives.' },
  { icon: Award, title: 'GMP Certified', desc: 'Manufactured in GMP certified facilities for quality assurance.' },
  { icon: Truck, title: 'Fast Delivery', desc: 'Quick and reliable delivery across India within 3-5 days.' },
  { icon: Heart, title: 'Trusted Brand', desc: 'Over 10,000+ happy customers trust Naturo for their wellness.' },
];

function InfiniteSlider({ items }: { items: { name: string; text: string; rating: number }[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let animId: number;
    let pos = 0;
    const speed = 0.5;
    const tick = () => {
      pos += speed;
      if (pos >= el.scrollWidth / 2) pos = 0;
      el.scrollLeft = pos;
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [items]);

  const doubled = [...items, ...items];

  return (
    <div ref={scrollRef} className="overflow-hidden whitespace-nowrap" style={{ scrollbarWidth: 'none' }}>
      <div className="inline-flex gap-6">
        {doubled.map((t, i) => (
          <div key={i} className="inline-block w-80 bg-card rounded-xl border border-border p-6 whitespace-normal shrink-0">
            <div className="flex gap-1 mb-3">
              {Array.from({ length: t.rating }).map((_, j) => <Star key={j} className="h-4 w-4 fill-gold text-gold" />)}
              {Array.from({ length: 5 - t.rating }).map((_, j) => <Star key={j} className="h-4 w-4 text-border" />)}
            </div>
            <p className="text-muted-foreground text-sm mb-4 italic leading-relaxed">"{t.text}"</p>
            <p className="font-serif text-foreground font-semibold">{t.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [email, setEmail] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: '', email: '', text: '', rating: 5 });
  const { user } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const featured = products.filter(p => p.featured || p.bestSeller).slice(0, 8);
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) {
      if (typeof p.category === 'string' && p.category.trim()) set.add(p.category.trim());
    }
    return Array.from(set)
      .sort((a, b) => a.localeCompare(b))
      .slice(0, 10)
      .map((name) => ({ name, emoji: categoryEmoji[name] ?? '🛍️' }));
  }, [products]);
  const allTestimonials = reviews.map(r => ({ name: r.name, text: r.text, rating: r.rating }));

  const heroAnim = useScrollAnimation(0.1);
  const catAnim = useScrollAnimation();
  const prodAnim = useScrollAnimation();
  const whyAnim = useScrollAnimation();
  const testAnim = useScrollAnimation();
  const newsAnim = useScrollAnimation();

  useEffect(() => {
    let mounted = true;
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
        setProducts([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    fetch('/api/reviews?approved=true', { cache: 'no-store' })
      .then(async (res) => {
        if (!res.ok) throw new Error('Request failed');
        return (await res.json()) as { reviews?: Review[] };
      })
      .then((data) => {
        if (!mounted) return;
        setReviews(data.reviews ?? []);
      })
      .catch(() => {
        if (!mounted) return;
        setReviews([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleSubscribe = () => {
    if (!email.trim() || !email.includes('@')) { toast.error('Please enter a valid email'); return; }
    subscribeNewsletter(email);
    toast.success('Subscribed successfully!');
    setEmail('');
  };

  const handleReviewSubmit = async () => {
    if (!reviewForm.name.trim() || !reviewForm.text.trim()) {
      toast.error('Please fill name and review');
      return;
    }
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: reviewForm.name,
          email: reviewForm.email,
          text: reviewForm.text,
          rating: reviewForm.rating,
        }),
      });

      if (!res.ok) throw new Error('Request failed');

      toast.success('Review submitted! It will appear after admin approval.');
      setShowReviewModal(false);
      setReviewForm({ name: '', email: '', text: '', rating: 5 });
    } catch {
      toast.error('Failed to submit review');
    }
  };

  return (
    <div>
      {/* Hero */}
      <section ref={heroAnim.ref} className="relative h-[85vh] min-h-[550px] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <video
            className="w-full h-full object-cover scale-105"
            src="/herovid.mp4"
            autoPlay
            muted
            loop
            playsInline
          />
        </div>
        <div className="absolute inset-0 " />
        <div className={`relative container-main w-full px-4 md:px-8 text-left transition-all duration-1000 ${heroAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <span className="inline-block bg-primary/20 text-primary-foreground px-4 py-1.5 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-primary/30">
            ✦ Premium Quality Since Day One
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-dark-green-foreground max-w-2xl leading-tight">
            Premium Cashews & Dry Fruits for <span className="text-gradient-gold">Your Loved Ones</span>
          </h1>
          <p className="mt-5 text-dark-green-foreground/80 text-lg md:text-xl font-sans max-w-xl leading-relaxed">
            100% Natural | Handpicked Quality | Perfect Gift Hampers,
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/shop" className="btn-primary px-8 py-3.5 text-base shadow-lg hover:shadow-xl transition-shadow">Shop Now</Link>
            <Link href="/shop" className="bg-dark-green-foreground/10 backdrop-blur-sm border border-dark-green-foreground/30 text-dark-green-foreground hover:bg-dark-green-foreground/20 px-8 py-3.5 text-base rounded-lg font-medium transition-all">
              Explore Products
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section ref={catAnim.ref} className="section-padding bg-card">
        <div className={`container-main transition-all duration-700 ${catAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center mb-12">
            <span className="text-primary text-sm font-medium uppercase tracking-widest">Categories</span>
            <h2 className="text-3xl md:text-4xl font-serif text-foreground mt-2">Shop by Category</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
            {categories.map((c, i) => (
              <Link key={c.name} href={`/shop?category=${encodeURIComponent(c.name)}`}
                className="bg-background rounded-xl border border-border p-6 text-center hover:border-primary hover:shadow-md transition-all duration-300 group"
                style={{ transitionDelay: `${i * 100}ms` }}>
                <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform duration-300">{c.emoji}</span>
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Best Selling */}
      <section ref={prodAnim.ref} className="section-padding">
        <div className={`container-main transition-all duration-700 ${prodAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center mb-12">
            <span className="text-primary text-sm font-medium uppercase tracking-widest">Best Sellers</span>
            <h2 className="text-3xl md:text-4xl font-serif text-foreground mt-2">Our Most Popular Products</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
          <div className="text-center mt-10">
            <Link href="/shop" className="btn-primary px-8 py-3">View All Products</Link>
          </div>
        </div>
      </section>

      {/* Why Choose */}
      <section ref={whyAnim.ref} className="section-padding bg-secondary">
        <div className={`container-main transition-all duration-700 ${whyAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center mb-14">
            <span className="text-primary text-sm font-medium uppercase tracking-widest">Why Us</span>
            <h2 className="text-3xl md:text-4xl font-serif text-foreground mt-2">Why Choose Naturo</h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto text-sm">We are committed to bringing you the purest herbal products, backed by Ayurvedic wisdom and modern quality standards.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {commitments.map((c, i) => (
              <div key={c.title} className="bg-card rounded-xl border border-border p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <c.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-serif text-lg text-foreground font-semibold mb-2">{c.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section ref={testAnim.ref} className="section-padding bg-card overflow-hidden">
        <div className={`container-main transition-all duration-700 ${testAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="text-center mb-12">
            <span className="text-primary text-sm font-medium uppercase tracking-widest">Testimonials</span>
            <h2 className="text-3xl md:text-4xl font-serif text-foreground mt-2">What Our Customers Say</h2>
          </div>
        </div>
        <InfiniteSlider items={allTestimonials} />
        <div className="text-center mt-8">
          <button onClick={() => {
            if (user) {
              setReviewForm({ name: user.name, email: user.email, text: '', rating: 5 });
            }
            setShowReviewModal(true);
          }} className="btn-outline-primary px-6 py-2.5 text-sm">
            ✍️ Add Your Review
          </button>
        </div>
      </section>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-xl text-foreground">Write a Review</h3>
              <button onClick={() => setShowReviewModal(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Name *</label>
                <input value={reviewForm.name} onChange={e => setReviewForm({ ...reviewForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                <input type="email" value={reviewForm.email} onChange={e => setReviewForm({ ...reviewForm, email: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: n })}>
                      <Star className={`h-6 w-6 ${n <= reviewForm.rating ? 'fill-gold text-gold' : 'text-border'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Your Review *</label>
                <textarea value={reviewForm.text} onChange={e => setReviewForm({ ...reviewForm, text: e.target.value })} rows={4}
                  className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
              </div>
              <button onClick={handleReviewSubmit} className="btn-primary w-full py-3 text-sm">Submit Review</button>
            </div>
          </div>
        </div>
      )}

      {/* Newsletter */}
      <section ref={newsAnim.ref} className="section-padding bg-primary">
        <div className={`container-main text-center transition-all duration-700 ${newsAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="text-3xl md:text-4xl font-serif text-primary-foreground mb-4">Stay Healthy with Naturo</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto">Subscribe for updates, wellness tips, and exclusive offers.</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email address"
              className="flex-1 px-4 py-3 rounded-lg text-foreground bg-card border-none outline-none text-sm" />
            <button onClick={handleSubscribe} className="bg-dark-green text-dark-green-foreground px-6 py-3 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
