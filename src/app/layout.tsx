import type { Metadata, Viewport } from 'next';
import './globals.css';
import './forms.css';
import Navbar from '@/components/Navbar';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import Link from 'next/link';
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import Script from 'next/script';
import CleanUrl from '@/components/CleanUrl';

export const metadata: Metadata = {
  title: 'The Usuals - Premium Fashion for Everyone',
  description: 'Shop the latest collections of Boys, Girls, Mens, and Womens fashion at The Usuals.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://theusuals.in'),
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || 'chkR2hFY8CyH-I8tYDf8bfYL_jZSDqyhJ5NbYT4u8Yo',
  },
  icons: {
    icon: [
      { url: '/favicon/favicon.ico' },
      { url: '/favicon/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/favicon/apple-touch-icon.png' },
    ],
  },
  manifest: '/favicon/site.webmanifest',
  alternates: {
    canonical: '/',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-ELC0HSCYLN"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-ELC0HSCYLN');
          `}
        </Script>
      </head>
      <body>
        <AuthProvider>
          <CartProvider>
            <CleanUrl />
            <Navbar />
          <div style={{ minHeight: 'calc(100vh - 400px)' }}>
            {children}
          </div>
          
          <FloatingWhatsApp />

          <footer className="footer">
            <div className="container">
              <div className="footer-grid">
                <div>
                  <h3 className="nav-logo" style={{ marginBottom: '1rem', color: 'white' }}>The Usuals</h3>
                  <p style={{ color: 'white', marginBottom: '1.5rem' }}>
                    Premium fashion for every generation. Born from love, styled for joy.
                  </p>
                  <p style={{ color: 'white' }}>
                    Email: theusualsalem@gmail.com
                  </p>
                </div>
                
                <div>
                  <h4 className="footer-heading">Shop</h4>
                  <div className="footer-links">
                    <Link href="/category/boys" className="footer-link">Boys Fashion</Link>
                    <Link href="/category/girls" className="footer-link">Girls Fashion</Link>
                    <Link href="/category/mens" className="footer-link">Men's Fashion</Link>
                    <Link href="/category/womens" className="footer-link">Women's Fashion</Link>
                    <Link href="/category/accessories" className="footer-link">Accessories</Link>
                  </div>
                </div>
                
                <div>
                  <h4 className="footer-heading">Help</h4>
                  <div className="footer-links">
                    <a href="https://shiprocket.co/tracking/" target="_blank" rel="noopener noreferrer" className="footer-link">Track Order</a>
                    <Link href="/returns" className="footer-link">Return & Exchange</Link>
                    <Link href="/contact" className="footer-link">Contact Us</Link>
                  </div>
                </div>
                
                <div>
                  <h4 className="footer-heading">Company</h4>
                  <div className="footer-links">
                    <Link href="/privacy" className="footer-link">Privacy Policy</Link>
                    <Link href="/refund" className="footer-link">Refund Policy</Link>
                    <Link href="/terms" className="footer-link">Terms of Service</Link>
                  </div>
                </div>

                <div>
                  <h4 className="footer-heading">Follow Us</h4>
                  <div className="footer-links" style={{ display: 'flex', flexDirection: 'row', gap: '1.5rem', alignItems: 'center' }}>
                    <a href="https://www.instagram.com/tamildhoti/" target="_blank" rel="noopener noreferrer" className="footer-link" aria-label="Instagram">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                    </a>
                    <a href="https://www.facebook.com/profile.php?id=61590181986419" target="_blank" rel="noopener noreferrer" className="footer-link" aria-label="Facebook">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                    </a>
                    <a href="https://www.youtube.com/@usualwear?sub_confirmation=1" target="_blank" rel="noopener noreferrer" className="footer-link" aria-label="YouTube">
                      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} The Usuals. All rights reserved.</p>
              </div>
            </div>
          </footer>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
