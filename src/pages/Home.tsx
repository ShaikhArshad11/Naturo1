// 'use client';

// import Link from 'next/link';
// import ProductCard from '@/components/ProductCard';
// import { subscribeNewsletter } from '@/store';
// import { useMemo, useState, useEffect, useRef } from 'react';
// import { toast } from 'sonner';
// import { useScrollAnimation } from '@/hooks/useScrollAnimation';
// import { Review, Product } from '@/types';
// import { useApp } from '@/context/AppContext';
// import { Leaf, ShieldCheck, Award, Truck, Heart, Star, X } from 'lucide-react';

// const categoryEmoji: Record<string, string> = {
//   'Herbal Juices': '🍃',
//   'Natural Supplements': '💊',
//   'Immunity Boosters': '🛡️',
//   'Ayurvedic Powders': '🫙',
//   'Natural Skincare': '🌿',
// };

// const commitments = [
//   { icon: Leaf, title: '100% Natural', desc: 'Every ingredient is sourced from nature, no synthetics ever.' },
//   { icon: ShieldCheck, title: 'Chemical-Free', desc: 'No harmful chemicals, preservatives, or artificial additives.' },
//   { icon: Award, title: 'GMP Certified', desc: 'Manufactured in GMP certified facilities for quality assurance.' },
//   { icon: Truck, title: 'Fast Delivery', desc: 'Quick and reliable delivery across India within 3-5 days.' },
//   { icon: Heart, title: 'Trusted Brand', desc: 'Over 10,000+ happy customers trust Naturo for their wellness.' },
// ];

// function InfiniteSlider({ items }: { items: { name: string; text: string; rating: number }[] }) {
//   const scrollRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const el = scrollRef.current;
//     if (!el) return;
//     let animId: number;
//     let pos = 0;
//     const speed = 0.5;
//     const tick = () => {
//       pos += speed;
//       if (pos >= el.scrollWidth / 2) pos = 0;
//       el.scrollLeft = pos;
//       animId = requestAnimationFrame(tick);
//     };
//     animId = requestAnimationFrame(tick);
//     return () => cancelAnimationFrame(animId);
//   }, [items]);

//   const doubled = [...items, ...items];

//   return (
//     <div ref={scrollRef} className="overflow-hidden whitespace-nowrap" style={{ scrollbarWidth: 'none' }}>
//       <div className="inline-flex gap-6">
//         {doubled.map((t, i) => (
//           <div key={i} className="inline-block w-80 bg-card rounded-xl border border-border p-6 whitespace-normal shrink-0">
//             <div className="flex gap-1 mb-3">
//               {Array.from({ length: t.rating }).map((_, j) => <Star key={j} className="h-4 w-4 fill-gold text-gold" />)}
//               {Array.from({ length: 5 - t.rating }).map((_, j) => <Star key={j} className="h-4 w-4 text-border" />)}
//             </div>
//             <p className="text-muted-foreground text-sm mb-4 italic leading-relaxed">"{t.text}"</p>
//             <p className="font-serif text-foreground font-semibold">{t.name}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default function Home() {
//   const [email, setEmail] = useState('');
//   const [showReviewModal, setShowReviewModal] = useState(false);
//   const [reviewForm, setReviewForm] = useState({ name: '', email: '', text: '', rating: 5 });
//   const { user } = useApp();
//   const [products, setProducts] = useState<Product[]>([]);
//   const [reviews, setReviews] = useState<Review[]>([]);
//   const featured = products.filter(p => p.featured || p.bestSeller).slice(0, 8);
//   const categories = useMemo(() => {
//     const set = new Set<string>();
//     for (const p of products) {
//       if (typeof p.category === 'string' && p.category.trim()) set.add(p.category.trim());
//     }
//     return Array.from(set)
//       .sort((a, b) => a.localeCompare(b))
//       .slice(0, 10)
//       .map((name) => ({ name, emoji: categoryEmoji[name] ?? '🛍️' }));
//   }, [products]);
//   const allTestimonials = reviews.map(r => ({ name: r.name, text: r.text, rating: r.rating }));

//   const heroAnim = useScrollAnimation(0.1);
//   const catAnim = useScrollAnimation();
//   const prodAnim = useScrollAnimation();
//   const whyAnim = useScrollAnimation();
//   const testAnim = useScrollAnimation();
//   const newsAnim = useScrollAnimation();

//   useEffect(() => {
//     let mounted = true;
//     fetch('/api/products', { cache: 'no-store' })
//       .then(async (res) => {
//         if (!res.ok) throw new Error('Request failed');
//         return (await res.json()) as { products?: Product[] };
//       })
//       .then((data) => {
//         if (!mounted) return;
//         setProducts(data.products ?? []);
//       })
//       .catch(() => {
//         setProducts([]);
//       });

//     return () => {
//       mounted = false;
//     };
//   }, []);

//   useEffect(() => {
//     let mounted = true;
//     fetch('/api/reviews?approved=true', { cache: 'no-store' })
//       .then(async (res) => {
//         if (!res.ok) throw new Error('Request failed');
//         return (await res.json()) as { reviews?: Review[] };
//       })
//       .then((data) => {
//         if (!mounted) return;
//         setReviews(data.reviews ?? []);
//       })
//       .catch(() => {
//         if (!mounted) return;
//         setReviews([]);
//       });

//     return () => {
//       mounted = false;
//     };
//   }, []);

//   const handleSubscribe = () => {
//     if (!email.trim() || !email.includes('@')) { toast.error('Please enter a valid email'); return; }
//     subscribeNewsletter(email);
//     toast.success('Subscribed successfully!');
//     setEmail('');
//   };

//   const handleReviewSubmit = async () => {
//     if (!reviewForm.name.trim() || !reviewForm.text.trim()) {
//       toast.error('Please fill name and review');
//       return;
//     }
//     try {
//       const res = await fetch('/api/reviews', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           name: reviewForm.name,
//           email: reviewForm.email,
//           text: reviewForm.text,
//           rating: reviewForm.rating,
//         }),
//       });

//       if (!res.ok) throw new Error('Request failed');

//       toast.success('Review submitted! It will appear after admin approval.');
//       setShowReviewModal(false);
//       setReviewForm({ name: '', email: '', text: '', rating: 5 });
//     } catch {
//       toast.error('Failed to submit review');
//     }
//   };

//   return (
//     <div>
//       {/* Hero */}
//       <section ref={heroAnim.ref} className="relative h-[85vh] min-h-[550px] flex items-center overflow-hidden">
//         <div className="absolute inset-0">
//           <video
//             className="w-full h-full object-cover scale-105"
//             src="/herovid.mp4"
//             autoPlay
//             muted
//             loop
//             playsInline
//           />
//         </div>
//         <div className="absolute inset-0 " />
//         <div className={`relative container-main w-full px-4 md:px-8 text-left transition-all duration-1000 ${heroAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
//           <span className="inline-block bg-primary/20 text-primary-foreground px-4 py-1.5 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-primary/30">
//             ✦ Premium Quality Since Day One
//           </span>
//           <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-dark-green-foreground max-w-2xl leading-tight">
//             Premium Cashews & Dry Fruits for <span className="text-gradient-gold">Your Loved Ones</span>
//           </h1>
//           <p className="mt-5 text-dark-green-foreground/80 text-lg md:text-xl font-sans max-w-xl leading-relaxed">
//             100% Natural | Handpicked Quality | Perfect Gift Hampers,
//           </p>
//           <div className="mt-8 flex flex-wrap gap-4">
//             <Link href="/shop" className="btn-primary px-8 py-3.5 text-base shadow-lg hover:shadow-xl transition-shadow">Shop Now</Link>
//             <Link href="/shop" className="bg-dark-green-foreground/10 backdrop-blur-sm border border-dark-green-foreground/30 text-dark-green-foreground hover:bg-dark-green-foreground/20 px-8 py-3.5 text-base rounded-lg font-medium transition-all">
//               Explore Products
//             </Link>
//           </div>
//         </div>
//       </section>

//       {/* Categories */}
//       <section ref={catAnim.ref} className="section-padding bg-card">
//         <div className={`container-main transition-all duration-700 ${catAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
//           <div className="text-center mb-12">
//             <span className="text-primary text-sm font-medium uppercase tracking-widest">Categories</span>
//             <h2 className="text-3xl md:text-4xl font-serif text-foreground mt-2">Shop by Category</h2>
//           </div>
//           <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
//             {categories.map((c, i) => (
//               <Link key={c.name} href={`/shop?category=${encodeURIComponent(c.name)}`}
//                 className="bg-background rounded-xl border border-border p-6 text-center hover:border-primary hover:shadow-md transition-all duration-300 group"
//                 style={{ transitionDelay: `${i * 100}ms` }}>
//                 <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform duration-300">{c.emoji}</span>
//                 <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{c.name}</span>
//               </Link>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Best Selling */}
//       <section ref={prodAnim.ref} className="section-padding">
//         <div className={`container-main transition-all duration-700 ${prodAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
//           <div className="text-center mb-12">
//             <span className="text-primary text-sm font-medium uppercase tracking-widest">Best Sellers</span>
//             <h2 className="text-3xl md:text-4xl font-serif text-foreground mt-2">Our Most Popular Products</h2>
//           </div>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//             {featured.map(p => <ProductCard key={p.id} product={p} />)}
//           </div>
//           <div className="text-center mt-10">
//             <Link href="/shop" className="btn-primary px-8 py-3">View All Products</Link>
//           </div>
//         </div>
//       </section>

//       {/* Why Choose */}
//       <section ref={whyAnim.ref} className="section-padding bg-secondary">
//         <div className={`container-main transition-all duration-700 ${whyAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
//           <div className="text-center mb-14">
//             <span className="text-primary text-sm font-medium uppercase tracking-widest">Why Us</span>
//             <h2 className="text-3xl md:text-4xl font-serif text-foreground mt-2">Why Choose Naturo</h2>
//             <p className="text-muted-foreground mt-3 max-w-lg mx-auto text-sm">We are committed to bringing you the purest herbal products, backed by Ayurvedic wisdom and modern quality standards.</p>
//           </div>
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
//             {commitments.map((c, i) => (
//               <div key={c.title} className="bg-card rounded-xl border border-border p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
//                 style={{ transitionDelay: `${i * 100}ms` }}>
//                 <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
//                   <c.icon className="h-7 w-7 text-primary" />
//                 </div>
//                 <h3 className="font-serif text-lg text-foreground font-semibold mb-2">{c.title}</h3>
//                 <p className="text-muted-foreground text-xs leading-relaxed">{c.desc}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Testimonials */}
//       <section ref={testAnim.ref} className="section-padding bg-card overflow-hidden">
//         <div className={`container-main transition-all duration-700 ${testAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
//           <div className="text-center mb-12">
//             <span className="text-primary text-sm font-medium uppercase tracking-widest">Testimonials</span>
//             <h2 className="text-3xl md:text-4xl font-serif text-foreground mt-2">What Our Customers Say</h2>
//           </div>
//         </div>
//         <InfiniteSlider items={allTestimonials} />
//         <div className="text-center mt-8">
//           <button onClick={() => {
//             if (user) {
//               setReviewForm({ name: user.name, email: user.email, text: '', rating: 5 });
//             }
//             setShowReviewModal(true);
//           }} className="btn-outline-primary px-6 py-2.5 text-sm">
//             ✍️ Add Your Review
//           </button>
//         </div>
//       </section>

//       {/* Review Modal */}
//       {showReviewModal && (
//         <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center px-4">
//           <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md shadow-xl">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="font-serif text-xl text-foreground">Write a Review</h3>
//               <button onClick={() => setShowReviewModal(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
//             </div>
//             <div className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-foreground mb-1">Name *</label>
//                 <input value={reviewForm.name} onChange={e => setReviewForm({ ...reviewForm, name: e.target.value })}
//                   className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-foreground mb-1">Email</label>
//                 <input type="email" value={reviewForm.email} onChange={e => setReviewForm({ ...reviewForm, email: e.target.value })}
//                   className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-foreground mb-1">Rating</label>
//                 <div className="flex gap-1">
//                   {[1, 2, 3, 4, 5].map(n => (
//                     <button key={n} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: n })}>
//                       <Star className={`h-6 w-6 ${n <= reviewForm.rating ? 'fill-gold text-gold' : 'text-border'}`} />
//                     </button>
//                   ))}
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-foreground mb-1">Your Review *</label>
//                 <textarea value={reviewForm.text} onChange={e => setReviewForm({ ...reviewForm, text: e.target.value })} rows={4}
//                   className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
//               </div>
//               <button onClick={handleReviewSubmit} className="btn-primary w-full py-3 text-sm">Submit Review</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Newsletter */}
//       <section ref={newsAnim.ref} className="section-padding bg-primary">
//         <div className={`container-main text-center transition-all duration-700 ${newsAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
//           <h2 className="text-3xl md:text-4xl font-serif text-primary-foreground mb-4">Stay Healthy with Naturo</h2>
//           <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto">Subscribe for updates, wellness tips, and exclusive offers.</p>
//           <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
//             <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email address"
//               className="flex-1 px-4 py-3 rounded-lg text-foreground bg-card border-none outline-none text-sm" />
//             <button onClick={handleSubscribe} className="bg-dark-green text-dark-green-foreground px-6 py-3 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity">
//               Subscribe
//             </button>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }


'use client';

import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { subscribeNewsletter } from '@/store';
import { useMemo, useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Review, Product } from '@/types';
import { useApp } from '@/context/AppContext';
import { Leaf, ShieldCheck, Award, Truck, Heart, Star, X, ArrowRight, Sparkles } from 'lucide-react';

const commitments = [
  { icon: Leaf, title: '100% Natural', desc: 'Every ingredient is sourced from nature, no synthetics ever.', color: '#4ade80' },
  { icon: ShieldCheck, title: 'Chemical-Free', desc: 'No harmful chemicals, preservatives, or artificial additives.', color: '#60a5fa' },
  { icon: Award, title: 'GMP Certified', desc: 'Manufactured in GMP certified facilities for quality assurance.', color: '#f59e0b' },
  { icon: Truck, title: 'Fast Delivery', desc: 'Quick and reliable delivery across India within 3-5 days.', color: '#a78bfa' },
  { icon: Heart, title: 'Trusted Brand', desc: 'Over 10,000+ happy customers trust Naturo for their wellness.', color: '#f472b6' },
];

/* ── Floating particle background ── */
function ParticleField() {
  const particles = useMemo(() => {
    const symbols = ['✦', '◆', '●', '✿', '❋'] as const;
    const make = (i: number) => {
      const seed = 1337 + i * 101;
      const rand01 = (n: number) => {
        const x = Math.sin(n) * 10000;
        return x - Math.floor(x);
      };
      const left = rand01(seed) * 100;
      const animationDuration = 6 + rand01(seed + 1) * 10;
      const animationDelay = rand01(seed + 2) * 8;
      const opacity = 0.15 + rand01(seed + 3) * 0.25;
      const fontSize = 8 + rand01(seed + 4) * 14;
      const symbol = symbols[Math.floor(rand01(seed + 5) * symbols.length)];
      return { left, animationDuration, animationDelay, opacity, fontSize, symbol };
    };
    return Array.from({ length: 18 }, (_, i) => make(i));
  }, []);

  return (
    <div className="naturo-particles" aria-hidden="true">
      {particles.map((p, i) => (
        <span
          key={i}
          className="naturo-particle"
          style={{
            left: `${p.left}%`,
            animationDuration: `${p.animationDuration}s`,
            animationDelay: `${p.animationDelay}s`,
            opacity: p.opacity,
            fontSize: `${p.fontSize}px`,
          }}
        >
          {p.symbol}
        </span>
      ))}
    </div>
  );
}

/* ── Magnetic button wrapper ── */
function MagneticBtn({ children, className, href }: { children: React.ReactNode; className?: string; href: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const handleMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`;
  };
  const handleLeave = () => {
    if (ref.current) ref.current.style.transform = '';
  };
  return (
    <Link ref={ref} href={href} className={className}
      onMouseMove={handleMove} onMouseLeave={handleLeave}
      style={{ transition: 'transform 0.25s cubic-bezier(0.23,1,0.32,1)' }}>
      {children}
    </Link>
  );
}

/* ── Infinite testimonial slider ── */
function InfiniteSlider({ items }: { items: { name: string; text: string; rating: number }[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const paused = useRef(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let animId: number;
    let pos = 0;
    const speed = 0.45;
    const tick = () => {
      if (!paused.current) {
        pos += speed;
        if (pos >= el.scrollWidth / 2) pos = 0;
        el.scrollLeft = pos;
      }
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [items]);

  const doubled = [...items, ...items];

  return (
    <div
      ref={scrollRef}
      className="overflow-hidden whitespace-nowrap naturo-slider"
      style={{ scrollbarWidth: 'none' }}
      onMouseEnter={() => { paused.current = true; }}
      onMouseLeave={() => { paused.current = false; }}
    >
      <div className="inline-flex gap-6 py-2">
        {doubled.map((t, i) => (
          <div key={i} className="naturo-review-card inline-block w-80 bg-card rounded-2xl border border-border p-6 whitespace-normal shrink-0">
            <div className="flex gap-1 mb-3">
              {Array.from({ length: t.rating }).map((_, j) => (
                <Star key={j} className="h-4 w-4 fill-gold text-gold" style={{ filter: 'drop-shadow(0 0 3px #f59e0b88)' }} />
              ))}
              {Array.from({ length: 5 - t.rating }).map((_, j) => <Star key={j} className="h-4 w-4 text-border" />)}
            </div>
            <p className="text-muted-foreground text-sm mb-4 italic leading-relaxed">"{t.text}"</p>
            <div className="flex items-center gap-3">
              <div className="naturo-avatar w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white">
                {t.name.charAt(0)}
              </div>
              <p className="font-serif text-foreground font-semibold text-sm">{t.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Counter animation ── */
function AnimatedCounter({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const duration = 1800;
        const step = 16;
        const increment = end / (duration / step);
        const timer = setInterval(() => {
          start = Math.min(start + increment, end);
          setCount(Math.floor(start));
          if (start >= end) clearInterval(timer);
        }, step);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

export default function Home() {
  const [email, setEmail] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: '', email: '', text: '', rating: 5 });
  const { user } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const featured = products.filter(p => p.featured || p.bestSeller).slice(0, 8);

  const allTestimonials = reviews.map(r => ({ name: r.name, text: r.text, rating: r.rating }));

  const heroAnim = useScrollAnimation(0.1);
  const prodAnim = useScrollAnimation();
  const whyAnim = useScrollAnimation();
  const testAnim = useScrollAnimation();
  const newsAnim = useScrollAnimation();
  const statsAnim = useScrollAnimation();

  useEffect(() => {
    let mounted = true;
    fetch('/api/products', { cache: 'no-store' })
      .then(async res => { if (!res.ok) throw new Error(); return (await res.json()) as { products?: Product[] }; })
      .then(data => { if (mounted) setProducts(data.products ?? []); })
      .catch(() => { setProducts([]); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    fetch('/api/reviews?approved=true', { cache: 'no-store' })
      .then(async res => { if (!res.ok) throw new Error(); return (await res.json()) as { reviews?: Review[] }; })
      .then(data => { if (mounted) setReviews(data.reviews ?? []); })
      .catch(() => { if (mounted) setReviews([]); });
    return () => { mounted = false; };
  }, []);

  const handleSubscribe = () => {
    if (!email.trim() || !email.includes('@')) { toast.error('Please enter a valid email'); return; }
    subscribeNewsletter(email);
    toast.success('Subscribed successfully!');
    setEmail('');
  };

  const handleReviewSubmit = async () => {
    if (!reviewForm.name.trim() || !reviewForm.text.trim()) { toast.error('Please fill name and review'); return; }
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewForm),
      });
      if (!res.ok) throw new Error();
      toast.success('Review submitted! It will appear after admin approval.');
      setShowReviewModal(false);
      setReviewForm({ name: '', email: '', text: '', rating: 5 });
    } catch { toast.error('Failed to submit review'); }
  };

  return (
    <>
      {/* ── Global styles injected once ── */}
      <style>{`
        /* Particle field */
        .naturo-particles { position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:1; }
        .naturo-particle { position:absolute;bottom:-20px;color:var(--color-primary,#4ade80);animation:naturoFloat linear infinite; }
        @keyframes naturoFloat {
          0%   { transform: translateY(0) rotate(0deg); opacity:0; }
          10%  { opacity:1; }
          90%  { opacity:.6; }
          100% { transform: translateY(-110vh) rotate(360deg); opacity:0; }
        }

        /* Hero title word reveal */
        .naturo-hero-word { display:inline-block; animation: wordReveal 0.7s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes wordReveal {
          from { opacity:0; transform: translateY(40px) skewY(3deg); }
          to   { opacity:1; transform: translateY(0) skewY(0); }
        }

        /* Shimmer badge */
        .naturo-badge {
          position:relative;overflow:hidden;background:rgba(255,255,255,0.12);
          backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.25);
        }
        .naturo-badge::after {
          content:'';position:absolute;inset:0;
          background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.35) 50%,transparent 60%);
          transform:translateX(-100%);animation:shimmer 3s ease-in-out infinite 1s;
        }
        @keyframes shimmer { to { transform:translateX(200%); } }

        /* CTA buttons */
        .naturo-btn-primary {
          position:relative;overflow:hidden;
          background:linear-gradient(135deg,#2d6a4f,#40916c);
          color:#fff;padding:14px 32px;border-radius:12px;
          font-weight:600;font-size:0.95rem;letter-spacing:0.02em;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 20px rgba(45,106,79,0.4);
        }
        .naturo-btn-primary::before {
          content:'';position:absolute;inset:0;
          background:linear-gradient(135deg,#40916c,#74c69d);
          opacity:0;transition:opacity 0.3s;
        }
        .naturo-btn-primary:hover { transform:translateY(-2px) scale(1.02); box-shadow:0 8px 30px rgba(45,106,79,0.5); }
        .naturo-btn-primary:hover::before { opacity:1; }
        .naturo-btn-primary span { position:relative;z-index:1; }
        .naturo-btn-primary .arrow-icon { display:inline-block;transition:transform 0.3s;margin-left:6px; }
        .naturo-btn-primary:hover .arrow-icon { transform:translateX(4px); }

        .naturo-btn-ghost {
          background:rgba(255,255,255,0.08);backdrop-filter:blur(10px);
          border:1px solid rgba(255,255,255,0.25);color:inherit;
          padding:14px 32px;border-radius:12px;font-weight:500;
          transition:background 0.3s,border-color 0.3s,transform 0.2s;
        }
        .naturo-btn-ghost:hover { background:rgba(255,255,255,0.18);border-color:rgba(255,255,255,0.5);transform:translateY(-2px); }

        /* Category cards */
        .naturo-cat-card {
          position:relative;overflow:hidden;
          background:var(--color-background);border:1.5px solid var(--color-border);
          border-radius:16px;padding:24px 16px;text-align:center;
          transition:transform 0.35s cubic-bezier(0.34,1.56,0.64,1),
                      border-color 0.3s, box-shadow 0.35s;
        }
        .naturo-cat-card::before {
          content:'';position:absolute;inset:0;
          background:radial-gradient(circle at 50% 80%,var(--color-primary,#4ade80)22%,transparent 70%);
          opacity:0;transition:opacity 0.4s;
        }
        .naturo-cat-card:hover { transform:translateY(-8px) scale(1.03);border-color:var(--color-primary);box-shadow:0 16px 40px rgba(0,0,0,0.12); }
        .naturo-cat-card:hover::before { opacity:0.08; }
        .naturo-cat-emoji { display:block;font-size:2.5rem;margin-bottom:10px;transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1); }
        .naturo-cat-card:hover .naturo-cat-emoji { transform:scale(1.25) rotate(-5deg); }

        /* Commitment cards */
        .naturo-commit-card {
          position:relative;background:var(--color-card);
          border:1.5px solid var(--color-border);border-radius:20px;
          padding:28px 20px;text-align:center;overflow:hidden;
          transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s;
        }
        .naturo-commit-card::after {
          content:'';position:absolute;bottom:-60px;left:50%;
          transform:translateX(-50%);width:120px;height:120px;border-radius:50%;
          background:var(--card-glow,#4ade80);filter:blur(40px);
          opacity:0;transition:opacity 0.4s,transform 0.4s;
        }
        .naturo-commit-card:hover { transform:translateY(-10px);box-shadow:0 20px 50px rgba(0,0,0,0.15); }
        .naturo-commit-card:hover::after { opacity:0.3;transform:translateX(-50%) translateY(-10px); }
        .naturo-commit-icon {
          width:56px;height:56px;margin:0 auto 16px;border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          transition:transform 0.4s cubic-bezier(0.34,1.56,0.64,1),background 0.3s;
        }
        .naturo-commit-card:hover .naturo-commit-icon { transform:scale(1.2) rotate(10deg); }

        /* Review card */
        .naturo-review-card {
          transition:transform 0.3s, box-shadow 0.3s;
          cursor:default;
        }
        .naturo-review-card:hover { transform:translateY(-6px) scale(1.02);box-shadow:0 16px 40px rgba(0,0,0,0.12); }

        /* Avatar gradient */
        .naturo-avatar { background:linear-gradient(135deg,#2d6a4f,#74c69d); }

        /* Stats section */
        .naturo-stat-card {
          text-align:center;padding:32px 20px;position:relative;
        }
        .naturo-stat-card::after {
          content:'';position:absolute;right:0;top:20%;height:60%;
          width:1px;background:var(--color-border);
        }
        .naturo-stat-card:last-child::after { display:none; }

        /* Newsletter section */
        .naturo-news-bg {
          position:relative;overflow:hidden;
        }
        .naturo-news-bg::before {
          content:'';position:absolute;inset:0;
          background:radial-gradient(ellipse at 20% 50%,rgba(255,255,255,0.06) 0%,transparent 60%),
                      radial-gradient(ellipse at 80% 50%,rgba(255,255,255,0.04) 0%,transparent 60%);
        }
        .naturo-news-input {
          flex:1;padding:14px 20px;border-radius:12px;border:none;
          background:rgba(255,255,255,0.95);color:#1a1a1a;font-size:0.9rem;
          outline:none;transition:box-shadow 0.3s;
        }
        .naturo-news-input:focus { box-shadow:0 0 0 3px rgba(255,255,255,0.3); }
        .naturo-news-btn {
          padding:14px 28px;border-radius:12px;font-weight:600;
          background:#1a3a2a;color:#fff;font-size:0.9rem;
          transition:background 0.3s,transform 0.2s,box-shadow 0.3s;
          white-space:nowrap;
        }
        .naturo-news-btn:hover { background:#0d2117;transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,0.3); }

        /* Section reveal */
        .naturo-reveal { transition:opacity 0.8s cubic-bezier(0.16,1,0.3,1),transform 0.8s cubic-bezier(0.16,1,0.3,1); }
        .naturo-reveal.hidden { opacity:0;transform:translateY(40px); }

        /* Stagger children */
        .naturo-stagger > * { animation: staggerIn 0.6s cubic-bezier(0.16,1,0.3,1) both; }
        @keyframes staggerIn {
          from { opacity:0;transform:translateY(30px) scale(0.96); }
          to   { opacity:1;transform:translateY(0) scale(1); }
        }

        /* Scroll indicator */
        .naturo-scroll-hint {
          position:absolute;bottom:32px;left:50%;transform:translateX(-50%);
          display:flex;flex-direction:column;align-items:center;gap:6px;
          color:rgba(255,255,255,0.6);font-size:0.7rem;letter-spacing:0.1em;text-transform:uppercase;
          animation:scrollBob 2s ease-in-out infinite;z-index:2;
        }
        .naturo-scroll-line {
          width:1px;height:40px;background:linear-gradient(to bottom,rgba(255,255,255,0.6),transparent);
        }
        @keyframes scrollBob { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(6px)} }

        /* Modal overlay */
        .naturo-modal-overlay {
          animation: fadeOverlay 0.25s ease both;
        }
        @keyframes fadeOverlay { from{opacity:0} to{opacity:1} }
        .naturo-modal-card {
          animation: modalPop 0.35s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        @keyframes modalPop { from{opacity:0;transform:scale(0.88) translateY(20px)} to{opacity:1;transform:scale(1) translateY(0)} }
      `}</style>

      <div>
        {/* ── HERO ── */}
        <section
          ref={heroAnim.ref}
          className="relative flex items-center overflow-hidden"
          style={{ height: '92vh', minHeight: 580 }}
        >
          <div className="absolute inset-0">
            <video className="w-full h-full object-cover" src="/herovid.mp4" autoPlay muted loop playsInline style={{ transform: 'scale(1.06)' }} />
            <div className="absolute inset-0"  />
          </div>

          {/* <ParticleField /> */}

          <div className="relative z-10 container-main w-full px-4 md:px-8">
            {/* Badge */}
            <div className={`naturo-badge inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 text-white transition-all duration-700 ${heroAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              style={{ transitionDelay: '100ms' }}>
              <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
              Premium Quality Since Day One
              <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
            </div>

            {/* Headline — word-by-word reveal */}
            <h1 className="text-5xl md:text-7xl font-serif text-white max-w-3xl leading-tight mb-6">
              {heroAnim.isVisible && (
                <>
                  {'Premium Cashews &'.split(' ').map((w, i) => (
                    <span key={i} className="naturo-hero-word mr-[0.22em]"
                      style={{ animationDelay: `${200 + i * 80}ms` }}>{w}</span>
                  ))}
                  <br />
                  {'Dry Fruits for'.split(' ').map((w, i) => (
                    <span key={i} className="naturo-hero-word mr-[0.22em]"
                      style={{ animationDelay: `${480 + i * 80}ms` }}>{w}</span>
                  ))}
                  <br />
                  <span className="naturo-hero-word" style={{ animationDelay: '680ms', background: 'linear-gradient(135deg,#f59e0b,#fcd34d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Your Loved Ones
                  </span>
                </>
              )}
            </h1>

            <p className={`text-white/75 text-lg md:text-xl max-w-md mb-8 leading-relaxed transition-all duration-700 ${heroAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              style={{ transitionDelay: '900ms' }}>
              100% Natural · Handpicked Quality · Perfect Gift Hampers
            </p>

            <div className={`flex flex-wrap gap-4 transition-all duration-700 ${heroAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              style={{ transitionDelay: '1050ms' }}>
              <MagneticBtn href="/shop" className="naturo-btn-primary">
                <span>Shop Now <span className="arrow-icon"><ArrowRight className="inline h-4 w-4" /></span></span>
              </MagneticBtn>
              <MagneticBtn href="/shop" className="naturo-btn-ghost text-white">
                Explore Products
              </MagneticBtn>
            </div>
          </div>

          <div className="naturo-scroll-hint">
            <span>Scroll</span>
            <div className="naturo-scroll-line" />
          </div>
        </section>

        {/* ── STATS STRIP ── */}
        <section ref={statsAnim.ref} className="bg-card border-y border-border">
          <div className={`container-main grid grid-cols-2 md:grid-cols-4 naturo-reveal ${statsAnim.isVisible ? '' : 'hidden'}`}>
            {[
              { value: 10000, suffix: '+', label: 'Happy Customers' },
              { value: 50, suffix: '+', label: 'Products' },
              { value: 5, suffix: ' yrs', label: 'Experience' },
              { value: 100, suffix: '%', label: 'Natural' },
            ].map((s, i) => (
              <div key={i} className="naturo-stat-card" style={{ animationDelay: `${i * 120}ms` }}>
                <div className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-1">
                  <AnimatedCounter end={s.value} suffix={s.suffix} />
                </div>
                <div className="text-muted-foreground text-xs uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── BEST SELLERS ── */}
        <section ref={prodAnim.ref} className="section-padding">
          <div className={`container-main naturo-reveal ${prodAnim.isVisible ? '' : 'hidden'}`}>
            <div className="text-center mb-12">
              <span className="text-primary text-sm font-medium uppercase tracking-widest">Best Sellers</span>
              <h2 className="text-3xl md:text-4xl font-serif text-foreground mt-2">Our Most Popular Products</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 naturo-stagger">
              {featured.map((p, i) => (
                <div key={p.id} style={{ animationDelay: `${i * 80}ms` }}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/shop" className="naturo-btn-primary inline-block">
                <span>View All Products <span className="arrow-icon"><ArrowRight className="inline h-4 w-4" /></span></span>
              </Link>
            </div>
          </div>
        </section>

        {/* ── WHY CHOOSE ── */}
        <section ref={whyAnim.ref} className="section-padding bg-secondary">
          <div className={`container-main naturo-reveal ${whyAnim.isVisible ? '' : 'hidden'}`}>
            <div className="text-center mb-14">
              <span className="text-primary text-sm font-medium uppercase tracking-widest">Why Us</span>
              <h2 className="text-3xl md:text-4xl font-serif text-foreground mt-2">Why Choose Naturo</h2>
              <p className="text-muted-foreground mt-3 max-w-lg mx-auto text-sm">
                We are committed to bringing you the purest herbal products, backed by Ayurvedic wisdom and modern quality standards.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 naturo-stagger">
              {commitments.map((c, i) => (
                <div key={c.title} className="naturo-commit-card"
                  style={{ animationDelay: `${i * 100}ms`, ['--card-glow' as string]: c.color } as React.CSSProperties}>
                  <div className="naturo-commit-icon" style={{ background: `${c.color}22` }}>
                    <c.icon className="h-7 w-7" style={{ color: c.color }} />
                  </div>
                  <h3 className="font-serif text-lg text-foreground font-semibold mb-2">{c.title}</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section ref={testAnim.ref} className="section-padding bg-card overflow-hidden">
          <div className={`container-main naturo-reveal ${testAnim.isVisible ? '' : 'hidden'}`}>
            <div className="text-center mb-12">
              <span className="text-primary text-sm font-medium uppercase tracking-widest">Testimonials</span>
              <h2 className="text-3xl md:text-4xl font-serif text-foreground mt-2">What Our Customers Say</h2>
            </div>
          </div>
          <InfiniteSlider items={allTestimonials} />
          <div className="text-center mt-8">
            <button
              onClick={() => {
                if (user) setReviewForm({ name: user.name, email: user.email, text: '', rating: 5 });
                setShowReviewModal(true);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-primary text-primary font-medium text-sm
                         transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:scale-105 hover:shadow-lg active:scale-95"
            >
              ✍️ Add Your Review
            </button>
          </div>
        </section>

        {/* ── REVIEW MODAL ── */}
        {showReviewModal && (
          <div className="naturo-modal-overlay fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}>
            <div className="naturo-modal-card bg-card rounded-2xl border border-border p-7 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-serif text-xl text-foreground">Write a Review</h3>
                <button onClick={() => setShowReviewModal(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-4">
                {[{ label: 'Name *', key: 'name', type: 'text' }, { label: 'Email', key: 'email', type: 'email' }].map(f => (
                  <div key={f.key}>
                    <label className="block text-sm font-medium text-foreground mb-1.5">{f.label}</label>
                    <input type={f.type} value={reviewForm[f.key as keyof typeof reviewForm]}
                      onChange={e => setReviewForm({ ...reviewForm, [f.key]: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm
                                 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all
                                 hover:border-primary/50" />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Rating</label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: n })}
                        className="transition-transform hover:scale-125 active:scale-110">
                        <Star className={`h-7 w-7 transition-all ${n <= reviewForm.rating ? 'fill-gold text-gold drop-shadow-sm' : 'text-border'}`}
                          style={n <= reviewForm.rating ? { filter: 'drop-shadow(0 0 4px #f59e0b66)' } : {}} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Your Review *</label>
                  <textarea value={reviewForm.text} onChange={e => setReviewForm({ ...reviewForm, text: e.target.value })} rows={4}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm resize-none
                               focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all hover:border-primary/50" />
                </div>
                <button onClick={handleReviewSubmit} className="naturo-btn-primary w-full text-center block">
                  <span>Submit Review</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── NEWSLETTER ── */}
        <section ref={newsAnim.ref} className="section-padding naturo-news-bg bg-primary">
          <div className={`container-main text-center naturo-reveal ${newsAnim.isVisible ? '' : 'hidden'}`}>
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-white/80 text-xs font-medium mb-4 border border-white/20">
              <Sparkles className="h-3 w-3" /> Exclusive Offers Inside
            </div>
            <h2 className="text-3xl md:text-4xl font-serif text-primary-foreground mb-3">Stay Healthy with Naturo</h2>
            <p className="text-primary-foreground/75 mb-8 max-w-md mx-auto">Subscribe for updates, wellness tips, and exclusive member-only offers.</p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto relative z-10">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Your email address"
                className="naturo-news-input" />
              <button onClick={handleSubscribe} className="naturo-news-btn">Subscribe</button>
            </div>
            <p className="text-primary-foreground/50 text-xs mt-4">No spam. Unsubscribe any time.</p>
          </div>
        </section>
      </div>
    </>
  );
}