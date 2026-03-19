export default function About() {
  return (
    <div className="section-padding">
      <div className="container-main max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-serif text-foreground mb-6">About Naturo</h1>
        <p className="text-muted-foreground leading-relaxed mb-8">
          Naturo is committed to delivering premium cashews and dry fruits, handpicked for freshness and quality.
          We believe great taste and great nutrition start with better sourcing. Every product is selected,
          packed, and delivered with care so you can enjoy trusted quality in every bite.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="font-serif text-2xl text-foreground mb-3">Our Mission</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              To make premium dry fruits and cashews accessible to everyone, without compromising on freshness,
              quality, or customer experience.
            </p>
          </div>
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="font-serif text-2xl text-foreground mb-3">Our Vision</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              To become a most trusted dry fruits and cashews brand, known for consistent quality,
              reliable delivery, and delightful gifting experiences.
            </p>
          </div>
        </div>

        <div className="bg-secondary rounded-lg p-8">
          <h2 className="font-serif text-2xl text-foreground mb-4 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {['Quality in every bite', 'Customer delight above all', 'Sourcing with care'].map(v => (
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
