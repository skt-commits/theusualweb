'use client';

import Link from 'next/link';
import { ShoppingBag, Search, User, Menu, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { cartCount } = useCart();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

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
          
          <Link href="/login" className="icon-btn" style={{ transition: 'transform 0.2s', display: 'block' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}><User size={22} /></Link>
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
          <button className="icon-btn mobile-only" style={{ display: 'none' }}><Menu size={22} /></button>
        </div>
      </div>
    </nav>
  );
}
