'use client';

import Link from 'next/link';
import { ShoppingBag, User, Menu, X, LogOut } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { collection, query, getDocs } from 'firebase/firestore';

export default function Navbar() {
  const { cartCount } = useCart();
  const { user, isAdmin, userData } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [subcategories, setSubcategories] = useState<Record<string, string[]>>({});
  const [recentProducts, setRecentProducts] = useState<Record<string, any[]>>({});
  const router = useRouter();

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const q = query(collection(db, 'products'));
        const snapshot = await getDocs(q);
        const subs: Record<string, Set<string>> = {};
        
        const allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        allProducts.sort((a: any, b: any) => {
           const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
           const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
           return timeB - timeA;
        });

        const recentProdsMap: Record<string, any[]> = {};

        allProducts.forEach(prod => {
          if (prod.category && prod.subcategory) {
             const key = `${prod.category}-${prod.subcategory}`;
             if (!subs[prod.category]) subs[prod.category] = new Set();
             subs[prod.category].add(prod.subcategory);
             
             if (!recentProdsMap[key]) recentProdsMap[key] = [];
             if (recentProdsMap[key].length < 3) {
                 recentProdsMap[key].push(prod);
             }
          }
        });
        
        const finalSubs: Record<string, string[]> = {};
        for (const cat in subs) {
          finalSubs[cat] = Array.from(subs[cat]);
        }
        setSubcategories(finalSubs);
        setRecentProducts(recentProdsMap);
      } catch (error) {
        console.error("Error fetching subcategories:", error);
      }
    };
    fetchSubcategories();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  return (
    <>
      <div className="ticker-wrap" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1001, height: '36px', padding: '0.4rem 0', background: '#128C7E' }}>
        <div className="ticker" style={{ fontSize: '0.85rem', letterSpacing: '0.05em', color: 'white' }}>
          <span>If you want to give a bulk order to us, contact us through WhatsApp: <a href="https://wa.me/919092214148" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline', fontWeight: 'bold', color: 'white' }}>+91 90922 14148</a></span>
          <span style={{ margin: '0 3rem' }}>•</span>
          <span>If you want to give a bulk order to us, contact us through WhatsApp: <a href="https://wa.me/919092214148" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline', fontWeight: 'bold', color: 'white' }}>+91 90922 14148</a></span>
          <span style={{ margin: '0 3rem' }}>•</span>
          <span>If you want to give a bulk order to us, contact us through WhatsApp: <a href="https://wa.me/919092214148" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline', fontWeight: 'bold', color: 'white' }}>+91 90922 14148</a></span>
          <span style={{ margin: '0 3rem' }}>•</span>
          <span>If you want to give a bulk order to us, contact us through WhatsApp: <a href="https://wa.me/919092214148" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline', fontWeight: 'bold', color: 'white' }}>+91 90922 14148</a></span>
          <span style={{ margin: '0 3rem' }}>•</span>
          <span>If you want to give a bulk order to us, contact us through WhatsApp: <a href="https://wa.me/919092214148" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline', fontWeight: 'bold', color: 'white' }}>+91 90922 14148</a></span>
          <span style={{ margin: '0 3rem' }}>•</span>
          <span>If you want to give a bulk order to us, contact us through WhatsApp: <a href="https://wa.me/919092214148" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline', fontWeight: 'bold', color: 'white' }}>+91 90922 14148</a></span>
        </div>
      </div>
      <nav className="glass-nav" style={{ top: '36px' }}>
      <div className="container nav-content">
        <div className="nav-logo">
          <Link href="/">
            <span className="text-gradient">The Usuals</span>
          </Link>
        </div>
        
        <div className="nav-links">
          <div className="nav-item">
            <Link href="/" className="nav-link">Home</Link>
          </div>
          <div className="nav-item">
            <Link href="/category/boys" className="nav-link">Boys Fashion</Link>
            {subcategories['boys'] && subcategories['boys'].length > 0 && (
              <div className="dropdown-menu">
                {subcategories['boys'].map(sub => (
                  <div key={sub} className="dropdown-item-wrapper">
                    <Link href={`/category/boys?subcategory=${encodeURIComponent(sub)}`} className="dropdown-item">{sub}</Link>
                    {recentProducts[`boys-${sub}`] && recentProducts[`boys-${sub}`].length > 0 && (
                      <div className="sub-dropdown-menu">
                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--accent)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Recent in {sub}</div>
                        {recentProducts[`boys-${sub}`].map(prod => (
                           <Link href={`/product/${prod.id}`} key={prod.id} className="nav-product-card">
                             <img src={prod.image || (prod.images && prod.images[0]) || '/placeholder.png'} alt={prod.name} className="nav-product-img" />
                             <div className="nav-product-info">
                               <span className="nav-product-name">{prod.name.length > 20 ? prod.name.substring(0,20)+'...' : prod.name}</span>
                               <span className="nav-product-price">{prod.offerPrice || prod.price}</span>
                             </div>
                           </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="nav-item">
            <Link href="/category/girls" className="nav-link">Girls Fashion</Link>
            {subcategories['girls'] && subcategories['girls'].length > 0 && (
              <div className="dropdown-menu">
                {subcategories['girls'].map(sub => (
                  <div key={sub} className="dropdown-item-wrapper">
                    <Link href={`/category/girls?subcategory=${encodeURIComponent(sub)}`} className="dropdown-item">{sub}</Link>
                    {recentProducts[`girls-${sub}`] && recentProducts[`girls-${sub}`].length > 0 && (
                      <div className="sub-dropdown-menu">
                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--accent)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Recent in {sub}</div>
                        {recentProducts[`girls-${sub}`].map(prod => (
                           <Link href={`/product/${prod.id}`} key={prod.id} className="nav-product-card">
                             <img src={prod.image || (prod.images && prod.images[0]) || '/placeholder.png'} alt={prod.name} className="nav-product-img" />
                             <div className="nav-product-info">
                               <span className="nav-product-name">{prod.name.length > 20 ? prod.name.substring(0,20)+'...' : prod.name}</span>
                               <span className="nav-product-price">{prod.offerPrice || prod.price}</span>
                             </div>
                           </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="nav-item">
            <Link href="/category/fabric" className="nav-link">Fabric</Link>
            {subcategories['fabric'] && subcategories['fabric'].length > 0 && (
              <div className="dropdown-menu">
                {subcategories['fabric'].map(sub => (
                  <div key={sub} className="dropdown-item-wrapper">
                    <Link href={`/category/fabric?subcategory=${encodeURIComponent(sub)}`} className="dropdown-item">{sub}</Link>
                    {recentProducts[`fabric-${sub}`] && recentProducts[`fabric-${sub}`].length > 0 && (
                      <div className="sub-dropdown-menu">
                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--accent)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Recent in {sub}</div>
                        {recentProducts[`fabric-${sub}`].map(prod => (
                           <Link href={`/product/${prod.id}`} key={prod.id} className="nav-product-card">
                             <img src={prod.image || (prod.images && prod.images[0]) || '/placeholder.png'} alt={prod.name} className="nav-product-img" />
                             <div className="nav-product-info">
                               <span className="nav-product-name">{prod.name.length > 20 ? prod.name.substring(0,20)+'...' : prod.name}</span>
                               <span className="nav-product-price">{prod.offerPrice || prod.price}</span>
                             </div>
                           </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="nav-item">
            <Link href="/category/mens" className="nav-link">Men's Fashion</Link>
            {subcategories['mens'] && subcategories['mens'].length > 0 && (
              <div className="dropdown-menu">
                {subcategories['mens'].map(sub => (
                  <div key={sub} className="dropdown-item-wrapper">
                    <Link href={`/category/mens?subcategory=${encodeURIComponent(sub)}`} className="dropdown-item">{sub}</Link>
                    {recentProducts[`mens-${sub}`] && recentProducts[`mens-${sub}`].length > 0 && (
                      <div className="sub-dropdown-menu">
                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--accent)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Recent in {sub}</div>
                        {recentProducts[`mens-${sub}`].map(prod => (
                           <Link href={`/product/${prod.id}`} key={prod.id} className="nav-product-card">
                             <img src={prod.image || (prod.images && prod.images[0]) || '/placeholder.png'} alt={prod.name} className="nav-product-img" />
                             <div className="nav-product-info">
                               <span className="nav-product-name">{prod.name.length > 20 ? prod.name.substring(0,20)+'...' : prod.name}</span>
                               <span className="nav-product-price">{prod.offerPrice || prod.price}</span>
                             </div>
                           </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="nav-item">
            <Link href="/category/womens" className="nav-link">Women's Fashion</Link>
            {subcategories['womens'] && subcategories['womens'].length > 0 && (
              <div className="dropdown-menu">
                {subcategories['womens'].map(sub => (
                  <div key={sub} className="dropdown-item-wrapper">
                    <Link href={`/category/womens?subcategory=${encodeURIComponent(sub)}`} className="dropdown-item">{sub}</Link>
                    {recentProducts[`womens-${sub}`] && recentProducts[`womens-${sub}`].length > 0 && (
                      <div className="sub-dropdown-menu">
                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--accent)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Recent in {sub}</div>
                        {recentProducts[`womens-${sub}`].map(prod => (
                           <Link href={`/product/${prod.id}`} key={prod.id} className="nav-product-card">
                             <img src={prod.image || (prod.images && prod.images[0]) || '/placeholder.png'} alt={prod.name} className="nav-product-img" />
                             <div className="nav-product-info">
                               <span className="nav-product-name">{prod.name.length > 20 ? prod.name.substring(0,20)+'...' : prod.name}</span>
                               <span className="nav-product-price">{prod.offerPrice || prod.price}</span>
                             </div>
                           </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="nav-item">
            <Link href="/contact" className="nav-link">Contact Us</Link>
          </div>
        </div>
        
        <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          
          {user ? (
            <div className="nav-item profile-dropdown">
              <div className="icon-btn" title="My Account" style={{ transition: 'transform 0.2s', display: 'flex', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                <User size={22} />
              </div>
              <div className="dropdown-menu profile-menu">
                <Link href="/profile" className="dropdown-item">My Profile</Link>
                {isAdmin && <Link href="/admin" className="dropdown-item" style={{ color: 'var(--primary)' }}>Admin Panel</Link>}
                <button onClick={handleLogout} className="dropdown-item" style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer' }}>Logout</button>
              </div>
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
          <Link href="/category/boys" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Boys Fashion</Link>
          <Link href="/category/girls" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Girls Fashion</Link>
          <Link href="/category/fabric" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>Fabric</Link>
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
      <style dangerouslySetInnerHTML={{__html: `
        .profile-menu {
          left: auto;
          right: -10px;
          transform: translateY(10px) !important;
        }
        .profile-dropdown:hover .profile-menu {
          transform: translateY(0) !important;
        }
      `}} />
    </>
  );
}
