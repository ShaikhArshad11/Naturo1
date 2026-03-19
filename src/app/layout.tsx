import type { Metadata } from 'next';
import '../index.css';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'Suraj Naturo',
  description: 'Premium Cashews & Dry Fruits',
  icons: {
    icon: '/naturo1.PNG',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
