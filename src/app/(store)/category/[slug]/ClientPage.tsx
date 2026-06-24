'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import AddToCartButton from '@/components/AddToCartButton';
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const getTitle = (slug: string) => {
  const titles: Record<string, string> = {
    'mens': "Men's Premium Collection",
    'womens': "Women's Elegant Collection",
    'children': "Kids & Children Fashion",
    'new-arrivals': "Fresh New Arrivals",
    'fabric': "Premium Fabrics Collection",
  };
  return titles[slug] || "Collection";
};

export default function ClientPage({ slug }: { slug: string }) {
  const title = getTitle(slug);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let q;
        if (slug === 'new-arrivals') {
          q = query(collection(db, 'products')); // Fetch all or recent for new-arrivals
        } else {
          q = query(collection(db, 'products'), where('category', '==', slug));
        }
        
        const querySnapshot = await getDocs(q);
        const fetchedProducts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
      setLoading(false);
    };

    fetchProducts();
  }, [slug]);

  return (
    <main style={{ paddingBottom: '4rem' }}>
      <div className="page-header">
        <div className="container">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-gradient" 
            style={{ fontSize: '3rem', marginBottom: '1rem', color: 'white' }}
          >
            {title}
          </motion.h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.2rem' }}>Discover the perfect styles tailored for you.</p>
        </div>
      </div>

      <div className="container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>Loading products...</div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>No products found</h3>
            <p style={{ color: 'var(--foreground)' }}>There are currently no products in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-4">
            {products.map((product, index) => (
              <motion.div 
                key={product.id}
                className="product-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (index % 4) * 0.1 }}
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
        )}
      </div>
    </main>
  );
}
