import Link from 'next/link';

const categories = [
  { name: 'Herbal Juices', emoji: '🍃', description: 'Pure herbal juices for daily wellness and detoxification.' },
  { name: 'Natural Supplements', emoji: '💊', description: 'Organic supplements to support your health naturally.' },
  { name: 'Immunity Boosters', emoji: '🛡️', description: 'Strengthen your immune system with natural ingredients.' },
  { name: 'Ayurvedic Powders', emoji: '🫙', description: 'Traditional Ayurvedic formulations in powder form.' },
  { name: 'Natural Skincare', emoji: '🌿', description: 'Nourish your skin with pure, herbal skincare products.' },
];

export default function Categories() {
  return (
    <div className="section-padding">
      <div className="container-main">
        <h1 className="text-3xl md:text-4xl font-serif text-foreground mb-8">Shop by Category</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(c => (
            <Link key={c.name} href={`/shop?category=${encodeURIComponent(c.name)}`}
              className="bg-card rounded-lg border border-border p-8 hover:border-primary transition-colors group">
              <span className="text-5xl block mb-4">{c.emoji}</span>
              <h2 className="font-serif text-2xl text-foreground mb-2 group-hover:text-primary transition-colors">{c.name}</h2>
              <p className="text-muted-foreground text-sm">{c.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
