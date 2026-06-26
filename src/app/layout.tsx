import type { Metadata, Viewport } from 'next';
import './globals.css';
import './forms.css';
import Navbar from '@/components/Navbar';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'The Usuals - Premium Fashion for Everyone',
  description: 'Shop the latest collections of Boys, Girls, Mens, and Womens fashion at The Usuals.',
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
      <body>
        <AuthProvider>
          <CartProvider>
            <Navbar />
          <div style={{ minHeight: 'calc(100vh - 400px)' }}>
            {children}
          </div>
          
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
                  </div>
                </div>
                
                <div>
                  <h4 className="footer-heading">Help</h4>
                  <div className="footer-links">
                    <Link href="/track" className="footer-link">Track Order</Link>
                    <Link href="/returns" className="footer-link">Return & Exchange</Link>
                    <Link href="/contact" className="footer-link">Contact Us</Link>
                  </div>
                </div>
                
                <div>
                  <h4 className="footer-heading">Company</h4>
                  <div className="footer-links">
                    <Link href="/privacy" className="footer-link">Privacy Policy</Link>
                    <Link href="/terms" className="footer-link">Terms of Service</Link>
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
