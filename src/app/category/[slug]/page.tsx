'use client';

import { use } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import AddToCartButton from '@/components/AddToCartButton';

// Using dummy products based on slug
const getProducts = (slug: string) => {
  const titles: Record<string, string> = {
    'mens': "Men's Premium Collection",
    'womens': "Women's Elegant Collection",
    'children': "Kids & Children Fashion",
    'new-arrivals': "Fresh New Arrivals",
  };

  const images: Record<string, string> = {
    'mens': '/TheUsualsWeb/images/mens.png',
    'womens': '/TheUsualsWeb/images/womens.png',
    'children': '/TheUsualsWeb/images/boys.png', 
    'new-arrivals': '/TheUsualsWeb/images/girls.png',
  };

  const baseTitle = titles[slug] || "Collection";
  const baseImg = images[slug] || '/TheUsualsWeb/images/mens.png';

  return {
    title: baseTitle,
    products: Array.from({ length: 8 }).map((_, i) => ({
      id: `${slug}-${i}`,
      name: `${slug === 'mens' ? 'Classic' : 'Premium'} Item ${i + 1}`,
      price: `₹ ${(Math.floor(Math.random() * 20) + 10) * 99}`,
      image: baseImg
    }))
  };
};

export function generateStaticParams() {
  return [
    { slug: 'mens' },
    { slug: 'womens' },
    { slug: 'children' },
    { slug: 'new-arrivals' },
    { slug: 'accessories' },
    { slug: 'offer-zone' },
    { slug: 'search' }
  ];
}

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { title, products } = getProducts(slug);

  return (
    <main style={{ paddingBottom: '4rem' }}>
      <div className="page-header">
        <div className="container">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-gradient" 
            style={{ fontSize: '3rem', marginBottom: '1rem' }}
          >
            {title}
          </motion.h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.2rem' }}>Discover the perfect styles tailored for you.</p>
        </div>
      </div>

      <div className="container">
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
