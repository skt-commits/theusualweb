'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AddToCartButton from '@/components/AddToCartButton';

import { collection, getDocs, limit, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useState, useEffect } from 'react';

const HERO_SLIDES = [
  {
    id: 'boys',
    title: 'BOYS FASHION',
    desc: 'Discover the most vibrant and playful styles tailored for boys.',
    image: '/images/boys_vibrant.png',
    link: '/category/boys',
  },
  {
    id: 'girls',
    title: 'GIRLS FASHION',
    desc: 'Explore the latest trends and elegant styles for girls.',
    image: '/images/girls_vibrant.png',
    link: '/category/girls',
  },
  {
    id: 'mens',
    title: 'MENS FASHION',
    desc: 'Classic and modern wear designed for men of style.',
    image: '/images/mens.png',
    link: '/category/mens',
  },
  {
    id: 'womens',
    title: 'WOMENS FASHION',
    desc: 'Elegant, comfortable, and trendy fashion for women.',
    image: '/images/womens.png',
    link: '/category/womens',
  },
  {
    id: 'fabrics',
    title: 'PREMIUM FABRICS',
    desc: 'High-quality authentic materials for your custom creations.',
    image: '/images/fabric_vibrant.png',
    link: '/category/fabric',
  }
];

const CATEGORIES = [
  { id: 'girls', title: 'GIRLS FASHION', image: '/images/girls_vibrant.png', link: '/category/girls' },
  { id: 'boys', title: 'BOYS FASHION', image: '/images/boys_vibrant.png', link: '/category/boys' },
  { id: 'fabric', title: 'PREMIUM FABRICS', image: '/images/fabric_vibrant.png', link: '/category/fabric' },
];

const FALLBACK_NEW_ARRIVALS = [
  { id: 'na1', name: "Sparkle Princess Dress", price: "₹ 1,299", image: "/images/girls_vibrant.png" },
  { id: 'na2', name: "Urban Streetwear Jacket", price: "₹ 1,499", image: "/images/boys_vibrant.png" },
  { id: 'na3', name: "Cozy Bear Onesie", price: "₹ 899", image: "/images/toddlers_vibrant.png" },
];

export default function Home() {
  const [newArrivals, setNewArrivals] = useState<any[]>(FALLBACK_NEW_ARRIVALS);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(slideTimer);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch up to 3 most recent products
        const q = query(collection(db, 'products'), limit(3));
        const snapshot = await getDocs(q);
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        if (products.length > 0) {
          setNewArrivals(products);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);
  return (
    <main>
      <div style={{ paddingTop: '120px' }}>
      </div>

      <section className="hero" style={{ position: 'relative', background: 'var(--accent)', overflow: 'hidden', padding: '0' }}>
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(135deg, rgba(255, 71, 126, 0.8), rgba(58, 12, 163, 0.8)), url('${HERO_SLIDES[currentSlide].image}') center/cover no-repeat`,
              zIndex: 0
            }}
          />
        </AnimatePresence>

        <div className="container" style={{ position: 'relative', zIndex: 1, width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
          <motion.div 
            key={currentSlide + '-content'}
            className="hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            style={{ width: '100%' }}
          >
            <h1 className="hero-title">
              {HERO_SLIDES[currentSlide].title}
            </h1>
            <p className="hero-desc">
              {HERO_SLIDES[currentSlide].desc}
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link href={HERO_SLIDES[currentSlide].link} className="btn btn-white">EXPLORE &rarr;</Link>
            </div>
          </motion.div>
        </div>

        <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '12px', zIndex: 2 }}>
          {HERO_SLIDES.map((_, idx) => (
            <button 
              key={idx} 
              onClick={() => setCurrentSlide(idx)}
              style={{ 
                width: idx === currentSlide ? '36px' : '12px', 
                height: '12px', 
                borderRadius: '6px', 
                background: idx === currentSlide ? 'white' : 'rgba(255,255,255,0.4)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                padding: 0
              }} 
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <motion.h2 
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            CATEGORIES
          </motion.h2>
          
          <div className="grid grid-cols-3">
            {CATEGORIES.map((category, index) => (
              <motion.div 
                key={category.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <Link href={category.link}>
                  <div className="category-card">
                    <img src={category.image} alt={category.title} className="category-img" />
                    <div className="category-overlay">
                      <h3 className="category-title">{category.title}</h3>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--accent)', padding: '4rem 0', textAlign: 'center', color: 'white', overflow: 'hidden' }}>
        <motion.div 
          className="container"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <h2 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'white' }}>LIMITED TIME OFFER</h2>
          <p style={{ fontSize: '1.5rem', marginBottom: '2rem', color: 'var(--primary)' }}>Upto 50% Off on Selected Items</p>
          <Link href="/category/offer-zone" className="btn btn-white">SHOP SALE &rarr;</Link>
        </motion.div>
      </section>

      <section className="section" id="new-arrivals">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
            <motion.h2 
              className="section-title" 
              style={{ marginBottom: 0 }}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              NEW ARRIVALS
            </motion.h2>
          </div>
          
          <div className="horizontal-scroll">
            {newArrivals.map((product, index) => (
              <motion.div 
                key={product.id} 
                className="product-card"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
              >
                <div className="product-img-wrapper">
                  <Link href={`/product/${product.slug || product.id}`}>
                    <img src={product.image} alt={product.name} className="product-img" />
                  </Link>
                </div>
                <div className="product-info">
                  <Link href={`/product/${product.slug || product.id}`}>
                    <h4 className="product-name">{product.name}</h4>
                  </Link>
                  {product.offerPrice ? (
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
                      <span className="product-price" style={{ textDecoration: 'line-through', color: '#888', fontSize: '0.9rem' }}>{product.price}</span>
                      <span className="product-price" style={{ color: '#f43f5e' }}>{product.offerPrice}</span>
                    </div>
                  ) : (
                    <span className="product-price">{product.price}</span>
                  )}
                  <div className="product-add">
                    <AddToCartButton product={product} fullWidth />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
    </main>
  );
}
