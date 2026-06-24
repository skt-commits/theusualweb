'use client';

import { use, useState } from 'react';
import { motion } from 'framer-motion';
import AddToCartButton from '@/components/AddToCartButton';
import { Star } from 'lucide-react';

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  // Dummy data generator
  const getProduct = () => {
    // In a real app we fetch from Firebase using id
    return {
      id: id,
      name: id.includes('mens') ? "Men's Classic Selection" : 
            id.includes('womens') ? "Women's Elegant Signature" : 
            "Premium Quality Signature Collection Item",
      price: "₹ 1,499",
      image: id.includes('girls') ? '/TheUsualsWeb/images/girls.png' : 
             id.includes('womens') ? '/TheUsualsWeb/images/womens.png' : 
             id.includes('mens') ? '/TheUsualsWeb/images/mens.png' : '/TheUsualsWeb/images/boys.png',
      description: "Experience the ultimate in comfort and style with our Premium Signature Collection. Crafted from the finest materials, this piece features a modern silhouette that seamlessly blends elegance with everyday wearability. Perfect for any occasion, its durable construction ensures it remains a staple in your wardrobe for seasons to come.",
      features: [
        "100% Premium Organic Cotton",
        "Breathable and lightweight fabric",
        "Machine washable, tumble dry low",
        "Designed and crafted with love"
      ]
    };
  };

  const product = getProduct();
  const [review, setReview] = useState('');
  const [reviews, setReviews] = useState([
    { id: 1, author: "Priya S.", rating: 5, text: "Absolutely love the quality! It fits perfectly and the material is so soft." },
    { id: 2, author: "Rahul M.", rating: 4, text: "Great product for the price. The color is exactly as shown in the pictures." }
  ]);

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!review.trim()) return;
    
    setReviews([
      { id: Date.now(), author: "You", rating: 5, text: review },
      ...reviews
    ]);
    setReview('');
  };

  return (
    <main style={{ paddingTop: '100px', paddingBottom: '4rem' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', marginBottom: '4rem' }} className="product-layout-grid">
          {/* Image */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel" 
            style={{ overflow: 'hidden', borderRadius: '24px' }}
          >
            <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', aspectRatio: '3/4' }} />
          </motion.div>
          
          {/* Details */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
          >
            <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '1rem', lineHeight: 1.1 }}>{product.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: '#fbbf24' }}>
              <Star size={20} fill="#fbbf24" /><Star size={20} fill="#fbbf24" /><Star size={20} fill="#fbbf24" /><Star size={20} fill="#fbbf24" /><Star size={20} fill="#fbbf24" />
              <span style={{ color: 'var(--foreground)', marginLeft: '0.5rem' }}>({reviews.length} reviews)</span>
            </div>
            
            <p style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>{product.price}</p>
            
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>About this product</h3>
              <p style={{ color: 'var(--foreground)', lineHeight: 1.6 }}>{product.description}</p>
            </div>
            
            <ul style={{ color: 'var(--foreground)', marginBottom: '3rem', paddingLeft: '1.2rem', lineHeight: 1.8 }}>
              {product.features.map((feat, i) => <li key={i}>{feat}</li>)}
            </ul>
            
            <div style={{ maxWidth: '300px' }}>
              <AddToCartButton product={product} fullWidth />
            </div>
          </motion.div>
        </div>
        
        {/* Reviews Section */}
        <div className="glass-panel" style={{ padding: '3rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Customer Reviews</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '3rem' }} className="review-grid">
            <div>
              <h3 style={{ marginBottom: '1rem' }}>Write a Review</h3>
              <form onSubmit={submitReview}>
                <textarea 
                  className="form-input" 
                  rows={4} 
                  placeholder="Share your thoughts about this product..."
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  style={{ marginBottom: '1rem', resize: 'none' }}
                />
                <button type="submit" className="btn btn-primary">Submit Review</button>
              </form>
            </div>
            
            <div>
              {reviews.map(r => (
                <div key={r.id} style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {r.author[0]}
                    </div>
                    <div>
                      <h4 style={{ fontWeight: 'bold' }}>{r.author}</h4>
                      <div style={{ display: 'flex', color: '#fbbf24' }}>
                        {[...Array(r.rating)].map((_, i) => <Star key={i} size={14} fill="#fbbf24" />)}
                      </div>
                    </div>
                  </div>
                  <p style={{ color: 'var(--foreground)', marginTop: '1rem' }}>"{r.text}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          .product-layout-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
          .review-grid { grid-template-columns: 1fr !important; }
        }
      `}} />
    </main>
  );
}
