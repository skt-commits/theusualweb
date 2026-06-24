'use client';

import Link from 'next/link';
import { ShoppingBag, Search, User, Menu, X, LogOut } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

export default function Navbar() {
  const { cartCount } = useCart();
  const { user, isAdmin, userData } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/category/search?q=${searchQuery}`);
      setIsSearchOpen(false);
    }
  };

  return (
    <nav className="glass-nav">
      <div className="container nav-content">
        <div className="nav-logo">
          <Link href="/">
            <span className="text-gradient">The Usuals</span>
          </Link>
        </div>
        
        <div className="nav-links">
          <Link href="/" className="nav-link">Home</Link>
          <Link href="/category/new-arrivals" className="nav-link">New Arrivals</Link>
          <Link href="/fabric" className="nav-link">Fabric</Link>
          <Link href="/category/children" className="nav-link">Children</Link>
          <Link href="/category/mens" className="nav-link">Men's Fashion</Link>
          <Link href="/category/womens" className="nav-link">Women's Fashion</Link>
          <Link href="/contact" className="nav-link">Contact Us</Link>
        </div>
        
        <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {isSearchOpen ? (
            <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--accent)', paddingBottom: '2px' }}>
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', width: '120px', fontSize: '0.9rem' }}
                autoFocus
              />
              <button type="button" onClick={() => setIsSearchOpen(false)} style={{ cursor: 'pointer', color: 'var(--accent)' }}>
                <X size={18} />
              </button>
            </form>
          ) : (
            <button className="icon-btn" onClick={() => setIsSearchOpen(true)} style={{ transition: 'transform 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}><Search size={22} /></button>
          )}
          
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {isAdmin && <Link href="/admin" className="nav-link" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Admin</Link>}
              <Link href="/profile" className="icon-btn" title="My Profile" style={{ transition: 'transform 0.2s', display: 'block' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                <User size={22} />
              </Link>
              <button onClick={handleLogout} className="icon-btn" title="Logout" style={{ transition: 'transform 0.2s', display: 'block' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                <LogOut size={22} />
              </button>
            </div>
          ) : (
            <Link href="/login" className="icon-btn" style={{ transition: 'transform 0.2s', display: 'block' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}><User size={22} /></Link>
          )}

          <Link href="/cart" className="icon-btn" style={{ position: 'relative', transition: 'transform 0.2s', display: 'block' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
            <ShoppingBag size={22} />
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: -8, right: -8, 
                background: 'var(--primary)', color: 'white', 
                fontSize: '0.7rem', fontWeight: 'bold',
                width: '18px', height: '18px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {cartCount}
              </span>
            )}
          </Link>
          <button className="icon-btn mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <Link href="/" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
          <Link href="/category/new-arrivals" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>New Arrivals</Link>
          <Link href="/fabric" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Fabric</Link>
          <Link href="/category/children" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Children</Link>
          <Link href="/category/mens" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Men's Fashion</Link>
          <Link href="/category/womens" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Women's Fashion</Link>
          <Link href="/contact" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Contact Us</Link>
          
          {user ? (
            <>
              {isAdmin && <Link href="/admin" className="nav-link" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Admin Panel</Link>}
              <Link href="/profile" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>My Profile & Orders</Link>
              <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="nav-link" style={{ textAlign: 'left' }}>Logout</button>
            </>
          ) : (
            <Link href="/login" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Login / Register</Link>
          )}
        </div>
      )}
    </nav>
  );
}
