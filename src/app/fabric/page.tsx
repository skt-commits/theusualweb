'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import AddToCartButton from '@/components/AddToCartButton';

const FABRIC_PRODUCTS = Array.from({ length: 8 }).map((_, i) => ({
  id: `fabric-${i}`,
  name: `Premium Textile ${i + 1}`,
  price: `₹ ${(Math.floor(Math.random() * 20) + 10) * 99}`,
  image: '/TheUsualsWeb/images/fabric_vibrant.png'
}));

export default function FabricPage() {
  return (
    <main style={{ paddingBottom: '4rem' }}>
      <div className="page-header" style={{ paddingTop: '8rem', paddingBottom: '4rem', background: 'var(--secondary)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-gradient" 
            style={{ fontSize: '3.5rem', marginBottom: '1rem' }}
          >
            PREMIUM FABRICS
          </motion.h1>
          <p style={{ color: 'var(--foreground)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto', fontWeight: 500 }}>
            Explore our curated selection of high-quality textiles and colorful fabrics for all your creative needs.
          </p>
        </div>
      </div>

      <div className="container" style={{ marginTop: '4rem' }}>
        <div className="grid grid-cols-4">
          {FABRIC_PRODUCTS.map((product, index) => (
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
                <div className="product-add" style={{ zIndex: 10 }}>
                  <AddToCartButton product={product} fullWidth />
                </div>
              </div>
              <div className="product-info">
                <Link href={`/product/${product.id}`}>
                  <h4 className="product-name">{product.name}</h4>
                </Link>
                <span className="product-price">{product.price}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
