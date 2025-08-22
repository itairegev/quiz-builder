import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '../components/Providers';
import '@shopify/polaris/build/esm/styles.css';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Shopify Quiz Builder',
  description: 'An intuitive, no-code quiz builder for Shopify merchants',
  keywords: ['shopify', 'quiz', 'builder', 'ecommerce', 'personalization'],
  authors: [{ name: 'Shopify Quiz Builder Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
