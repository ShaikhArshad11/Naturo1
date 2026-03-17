export default function About() {
  return (
    <div className="section-padding">
      <div className="container-main max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-serif text-foreground mb-6">About Naturo</h1>
        <p className="text-muted-foreground leading-relaxed mb-8">
          Naturo is committed to delivering pure herbal wellness products inspired by Ayurveda and nature.
          We believe in the power of nature to heal, nourish, and transform lives. Every product is crafted
          with the finest organic ingredients, sourced responsibly and tested rigorously for purity.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="font-serif text-2xl text-foreground mb-3">Our Mission</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              To promote healthy living through natural and organic solutions. We strive to make authentic
              Ayurvedic wellness accessible to everyone, without compromising on quality or purity.
            </p>
          </div>
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="font-serif text-2xl text-foreground mb-3">Our Vision</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              To become India's most trusted herbal brand, known for our unwavering commitment to purity,
              sustainability, and the ancient wisdom of Ayurveda.
            </p>
          </div>
        </div>

        <div className="bg-secondary rounded-lg p-8">
          <h2 className="font-serif text-2xl text-foreground mb-4 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {['Purity in every product', 'Sustainability first', 'Customer wellness above all'].map(v => (
              <div key={v}>
                <h3 className="font-serif text-lg text-foreground">{v}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
