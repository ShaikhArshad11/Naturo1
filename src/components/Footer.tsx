import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-dark-green text-dark-green-foreground">
      <div className="container-main section-padding">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
          <img src="/naturo1.PNG" alt="Naturo Logo" className="h-22 w-16 object-cover" />
        </Link>
            <p className="text-dark-green-foreground/70 text-sm leading-relaxed">
              Pure & natural herbal products inspired by Ayurveda for a healthier life.
            </p>
          </div>
          <div>
            <h4 className="font-sans font-semibold text-sm uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-dark-green-foreground/70">
              {[{l:'Home',t:'/'},{l:'Shop',t:'/shop'},{l:'Contact',t:'/contact'}].map(i=>(
                <li key={i.t}><Link href={i.t} className="hover:text-dark-green-foreground transition-colors">{i.l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-sans font-semibold text-sm uppercase tracking-wider mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-dark-green-foreground/70">
              <li>info@naturo.com</li>
              <li>+91 9607555963</li>
              <li>Mumbai, Maharashtra, India</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-dark-green-foreground/10 mt-12 pt-6 text-center text-sm text-dark-green-foreground/50">
          &copy; {new Date().getFullYear()} Naturo. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
