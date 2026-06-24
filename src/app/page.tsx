'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import AddToCartButton from '@/components/AddToCartButton';

import { collection, getDocs, limit, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useState, useEffect } from 'react';

const CATEGORIES = [
  { id: 'girls', title: 'GIRLS FASHION', image: '/images/girls_vibrant.png', link: '/category/girls' },
  { id: 'boys', title: 'BOYS FASHION', image: '/images/boys_vibrant.png', link: '/category/boys' },
  { id: 'toddlers', title: 'TODDLERS & INFANTS', image: '/images/toddlers_vibrant.png', link: '/category/toddlers' },
];

const FALLBACK_NEW_ARRIVALS = [
  { id: 'na1', name: "Sparkle Princess Dress", price: "₹ 1,299", image: "/images/girls_vibrant.png" },
  { id: 'na2', name: "Urban Streetwear Jacket", price: "₹ 1,499", image: "/images/boys_vibrant.png" },
  { id: 'na3', name: "Cozy Bear Onesie", price: "₹ 899", image: "/images/toddlers_vibrant.png" },
];

export default function Home() {
  const [newArrivals, setNewArrivals] = useState<any[]>(FALLBACK_NEW_ARRIVALS);

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
      <div style={{ paddingTop: '80px' }}>
        <div className="ticker-wrap">
          <div className="ticker">
            THE USUALS &nbsp;&nbsp; || &nbsp;&nbsp; KIDS FASHION &nbsp;&nbsp; || &nbsp;&nbsp; UPTO 50% OFF &nbsp;&nbsp; || &nbsp;&nbsp; THE USUALS &nbsp;&nbsp; || &nbsp;&nbsp; KIDS FASHION &nbsp;&nbsp; || &nbsp;&nbsp; UPTO 50% OFF &nbsp;&nbsp; || &nbsp;&nbsp; THE USUALS &nbsp;&nbsp; || &nbsp;&nbsp; KIDS FASHION &nbsp;&nbsp; || &nbsp;&nbsp; UPTO 50% OFF
          </div>
        </div>
      </div>

      <section className="hero">
        <div className="container">
          <motion.div 
            className="hero-content"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.h1 
              className="hero-title"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              KIDS FASHION
            </motion.h1>
            <motion.p 
              className="hero-desc"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Discover the most vibrant and playful styles tailored for kids of all ages.
            </motion.p>
            <motion.div 
              style={{ display: 'flex', gap: '1rem' }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              <Link href="/category/new-arrivals" className="btn btn-white">EXPLORE &rarr;</Link>
            </motion.div>
          </motion.div>
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

      <section className="section">
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
                  <Link href={`/product/${product.id}`}>
                    <img src={product.image} alt={product.name} className="product-img" />
                  </Link>
                </div>
                <div className="product-info">
                  <Link href={`/product/${product.id}`}>
                    <h4 className="product-name">{product.name}</h4>
                  </Link>
                  <span className="product-price">{product.price}</span>
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
