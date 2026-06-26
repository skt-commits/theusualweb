'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AddToCartButton from '@/components/AddToCartButton';
import { Star } from 'lucide-react';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

export default function ClientPage({ id }: { id: string }) {
  const { user } = useAuth();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(5);
  const [reviews, setReviews] = useState<any[]>([]);

  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [showSizeChart, setShowSizeChart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Handle IDs coming from Cart which might have size suffixes (e.g. productID-M)
        let actualId = id;
        const sizes = ['S', 'M', 'L', 'XL', 'XXL', '18-24 Month', '2-3 Years', '3-4 Years', '4-5 Years', '5-6 Years', '6-7 Years', '10m', '20m', '30m', '40m', '50m', '60m', '70m', '80m', '90m', '100m'];
        for (const s of sizes) {
          if (id.endsWith(`-${s}`)) {
            actualId = id.substring(0, id.length - s.length - 1);
            break;
          }
        }

        const docRef = doc(db, 'products', actualId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProduct({ id: docSnap.id, ...data });
          setActiveImage(data.images && data.images.length > 0 ? data.images[0] : data.image);
          if (data.sizes && data.sizes.length > 0) {
            setSize(data.sizes[0]);
          }
          if (data.colors && data.colors.length > 0) {
            setColor(data.colors[0]);
          }
          if (data.reviews) {
            setReviews(data.reviews);
          }
        } else {
          // Handle Fallback Mock Products from Home Page
          if (actualId === 'na1') {
            const fakeData = { id: actualId, name: "Sparkle Princess Dress", price: "₹ 1,299", image: "/images/girls_vibrant.png", description: "A beautifully crafted dress for your little princess.", category: "girls", sizes: ['18-24 Month', '2-3 Years', '3-4 Years'] };
            setProduct(fakeData);
            setActiveImage(fakeData.image);
            setSize('18-24 Month');
          } else if (actualId === 'na2') {
            const fakeData = { id: actualId, name: "Urban Streetwear Jacket", price: "₹ 1,499", image: "/images/boys_vibrant.png", description: "Keep them warm and stylish with this modern jacket.", category: "boys", sizes: ['4-5 Years', '5-6 Years'] };
            setProduct(fakeData);
            setActiveImage(fakeData.image);
            setSize('4-5 Years');
          } else if (actualId === 'na3') {
            const fakeData = { id: actualId, name: "Cozy Bear Onesie", price: "₹ 899", image: "/images/toddlers_vibrant.png", description: "The softest, most adorable onesie for your toddler.", category: "toddlers", sizes: ['18-24 Month'] };
            setProduct(fakeData);
            setActiveImage(fakeData.image);
            setSize('18-24 Month');
          } else {
            console.error("No such product!");
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!review.trim()) return;
    
    const newReview = {
      id: Date.now(),
      author: user?.displayName || user?.email?.split('@')[0] || "Guest User",
      rating,
      text: review,
      date: new Date().toISOString()
    };

    setReviews([newReview, ...reviews]);
    setReview('');
    setRating(5);

    try {
      if (product.id && product.id !== 'na1' && product.id !== 'na2' && product.id !== 'na3') {
        const docRef = doc(db, 'products', product.id);
        await updateDoc(docRef, {
          reviews: arrayUnion(newReview)
        });
      }
    } catch (error) {
      console.error("Failed to save review:", error);
    }
  };

  if (loading) return <div style={{ paddingTop: '150px', paddingBottom: '4rem', textAlign: 'center', fontSize: '1.5rem' }}>Loading Product Details...</div>;
  if (!product) return <div style={{ paddingTop: '150px', paddingBottom: '4rem', textAlign: 'center', fontSize: '1.5rem' }}>Product not found.</div>;

  const allImages = product.images || (product.image ? [product.image] : []);
  const isKidsFashion = product.category === 'boys' || product.category === 'girls';

  return (
    <main style={{ paddingTop: '100px', paddingBottom: '4rem' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', marginBottom: '4rem' }} className="product-layout-grid">
          
          {/* Image Gallery */}
          <div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-panel" 
              style={{ overflow: 'hidden', borderRadius: '24px', marginBottom: '1rem' }}
            >
              {activeImage ? (
                <img src={activeImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', aspectRatio: '3/4' }} />
              ) : (
                <div style={{ width: '100%', aspectRatio: '3/4', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Image</div>
              )}
            </motion.div>
            
            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {allImages.map((img: string, index: number) => (
                  <div 
                    key={index} 
                    onClick={() => setActiveImage(img)}
                    style={{ 
                      width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer',
                      border: activeImage === img ? '3px solid var(--primary)' : '3px solid transparent',
                      opacity: activeImage === img ? 1 : 0.7, transition: 'all 0.2s'
                    }}
                  >
                    <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>
          
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
            
            {product.sizePrices && size && product.sizePrices[size] ? (
              <p style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', color: 'var(--primary)' }}>
                {product.sizePrices[size]}
              </p>
            ) : product.offerPrice ? (
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '2rem' }}>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{product.offerPrice}</p>
                <p style={{ fontSize: '1.2rem', textDecoration: 'line-through', color: '#888' }}>{product.price}</p>
              </div>
            ) : (
              <p style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>{product.price}</p>
            )}
            
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>About this product</h3>
              {product.description ? (
                <p style={{ color: 'var(--foreground)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {product.description}
                </p>
              ) : (
                <p style={{ color: 'var(--foreground)', lineHeight: 1.6, fontStyle: 'italic', opacity: 0.7 }}>
                  No description available.
                </p>
              )}
            </div>
            
            {product.features && product.features.length > 0 && (
              <ul style={{ color: 'var(--foreground)', marginBottom: '2rem', paddingLeft: '1.2rem', lineHeight: 1.8 }}>
                {product.features.map((feat: string, i: number) => <li key={i}>{feat}</li>)}
              </ul>
            )}

            {product.colors && product.colors.length > 0 && (
              <div style={{ marginBottom: '2.5rem' }}>
                <h4 style={{ fontWeight: 'bold', marginBottom: '0.8rem' }}>Select Color:</h4>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {product.colors.map((c: string) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        backgroundColor: c,
                        border: color === c ? '3px solid var(--accent)' : '1px solid #ccc',
                        cursor: 'pointer',
                        boxShadow: color === c ? '0 0 0 2px white inset' : 'none'
                      }}
                      aria-label={`Color ${c}`}
                    />
                  ))}
                </div>
              </div>
            )}
            
            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                <h4 style={{ fontWeight: 'bold', margin: 0 }}>Select Size:</h4>
                {isKidsFashion && (
                  <button 
                    onClick={() => setShowSizeChart(true)} 
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.9rem' }}
                  >
                    Explore your sizes here..
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                {(product.allSizes || (product.sizes && product.sizes.length ? Array.from(new Set(['S', 'M', 'L', 'XL', 'XXL', ...product.sizes])) : ['S', 'M', 'L', 'XL', 'XXL'])).map((sz: string) => {
                  const isAvailable = product.sizes ? product.sizes.includes(sz) : true;
                  return (
                    <div key={sz} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
                      <button 
                        disabled={!isAvailable}
                        onClick={() => setSize(sz)}
                        style={{ 
                          minWidth: '45px', height: '45px', borderRadius: '8px', padding: '0 0.5rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: size === sz ? '2px solid var(--accent)' : '1px solid var(--border-color)',
                          background: !isAvailable ? '#f3f4f6' : (size === sz ? 'var(--accent)' : 'white'),
                          color: !isAvailable ? '#9ca3af' : (size === sz ? 'white' : 'var(--foreground)'),
                          fontWeight: 'bold', 
                          cursor: isAvailable ? 'pointer' : 'not-allowed', 
                          transition: 'all 0.2s',
                          opacity: !isAvailable ? 0.6 : 1
                        }}
                      >
                        {sz}
                      </button>
                      {!isAvailable && <span style={{ fontSize: '0.65rem', color: '#ef4444', textAlign: 'center', whiteSpace: 'nowrap' }}>No stocks left</span>}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {product.inStock === false ? (
              <div style={{ maxWidth: '300px' }}>
                <div style={{ padding: '1rem', textAlign: 'center', background: '#fee2e2', color: '#dc2626', fontWeight: 'bold', borderRadius: '8px', border: '1px solid #f87171' }}>
                  OUT OF STOCK
                </div>
              </div>
            ) : (
              <div style={{ maxWidth: '300px' }}>
                <AddToCartButton product={product} fullWidth showGoToCart selectedSize={size} />
              </div>
            )}
          </motion.div>
        </div>
        
        {/* Reviews Section */}
        <div className="glass-panel" style={{ padding: '3rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Customer Reviews</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '3rem' }} className="review-grid">
            <div>
              <h3 style={{ marginBottom: '1rem' }}>Write a Review</h3>
              <form onSubmit={submitReview}>
                <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 'bold' }}>Rating:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      size={28} 
                      fill={star <= rating ? "#fbbf24" : "none"} 
                      stroke={star <= rating ? "#fbbf24" : "#ccc"}
                      style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                      onClick={() => setRating(star)}
                    />
                  ))}
                </div>
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
              {reviews.length === 0 ? (
                <p style={{ color: 'var(--foreground)' }}>No reviews yet. Be the first to review this product!</p>
              ) : (
                reviews.map(r => (
                  <div key={r.id} style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {r.author[0]?.toUpperCase()}
                      </div>
                      <div>
                        <h4 style={{ fontWeight: 'bold' }}>{r.author}</h4>
                        <div style={{ display: 'flex', color: '#fbbf24' }}>
                          {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < r.rating ? "#fbbf24" : "none"} stroke={i < r.rating ? "#fbbf24" : "#ccc"} />)}
                        </div>
                      </div>
                    </div>
                    <p style={{ color: 'var(--foreground)', marginTop: '1rem' }}>"{r.text}"</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      
      {showSizeChart && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel" style={{ background: 'white', padding: '2rem', width: '95%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', borderRadius: '16px' }}>
            <button onClick={() => setShowSizeChart(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: '#f3f4f6', border: 'none', width: '32px', height: '32px', borderRadius: '50%', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333' }}>&times;</button>
            
            <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', color: '#333' }}>Sets & Suits Size Chart</h2>
            
            <div style={{ overflowX: 'auto' }}>
              <h3 style={{ marginTop: '1.5rem', marginBottom: '0.8rem', textAlign: 'center', color: '#444' }}>Size Chart In Inch</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #ccc', textAlign: 'center', color: '#333' }}>
                <thead style={{ background: '#f9fafb' }}>
                  <tr>
                    <th style={{ border: '1px solid #ccc', padding: '10px' }}>Age Group</th>
                    <th style={{ border: '1px solid #ccc', padding: '10px' }}>18-24 Month</th>
                    <th style={{ border: '1px solid #ccc', padding: '10px' }}>2-3 Years</th>
                    <th style={{ border: '1px solid #ccc', padding: '10px' }}>3-4 Years</th>
                    <th style={{ border: '1px solid #ccc', padding: '10px' }}>4-5 Years</th>
                    <th style={{ border: '1px solid #ccc', padding: '10px' }}>5-6 Years</th>
                    <th style={{ border: '1px solid #ccc', padding: '10px' }}>6-7 Years</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Shoulder', '10.2', '10.6', '11.0', '11.4', '11.8', '12.6'],
                    ['Sleeve Length', '15.1', '15.3', '15.5', '15.7', '15.9', '17.3'],
                    ['Half Chest', '11.4', '11.8', '12.2', '12.6', '13.0', '13.8'],
                    ['Total Length', '15.0', '16.1', '16.9', '17.7', '18.5', '19.7'],
                    ['Half Waist', '8.5', '9.1', '9.4', '9.8', '10.2', '10.2'],
                    ['Bottom Length', '20.1', '21.7', '23.2', '24.8', '26.0', '28.3']
                  ].map(row => (
                    <tr key={row[0]}>
                      {row.map((cell, i) => <td key={i} style={{ border: '1px solid #ccc', padding: '10px', fontWeight: i === 0 ? 'bold' : 'normal' }}>{cell}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>

              <h3 style={{ marginTop: '2.5rem', marginBottom: '0.8rem', textAlign: 'center', color: '#444' }}>Size Chart In CM</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid #ccc', textAlign: 'center', color: '#333' }}>
                <thead style={{ background: '#f9fafb' }}>
                  <tr>
                    <th style={{ border: '1px solid #ccc', padding: '10px' }}>Age Group</th>
                    <th style={{ border: '1px solid #ccc', padding: '10px' }}>18-24 Month</th>
                    <th style={{ border: '1px solid #ccc', padding: '10px' }}>2-3 Years</th>
                    <th style={{ border: '1px solid #ccc', padding: '10px' }}>3-4 Years</th>
                    <th style={{ border: '1px solid #ccc', padding: '10px' }}>4-5 Years</th>
                    <th style={{ border: '1px solid #ccc', padding: '10px' }}>5-6 Years</th>
                    <th style={{ border: '1px solid #ccc', padding: '10px' }}>6-7 Years</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Shoulder', '25.0', '26.0', '27.0', '28.0', '30.0', '32.0'],
                    ['Sleeve Length', '30.0', '32.0', '34.0', '36.0', '40.0', '44.0'],
                    ['Half Chest', '33.0', '34.0', '35.0', '36.0', '33.0', '35.0'],
                    ['Total Length', '37.0', '41.0', '43.0', '45.0', '48.0', '50.0'],
                    ['Half Waist', '21.0', '22.0', '23.0', '24.0', '25.0', '26.0'],
                    ['Bottom Length', '51.0', '55.0', '59.0', '63.0', '65.0', '72.0']
                  ].map(row => (
                    <tr key={row[0]}>
                      {row.map((cell, i) => <td key={i} style={{ border: '1px solid #ccc', padding: '10px', fontWeight: i === 0 ? 'bold' : 'normal' }}>{cell}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 768px) {
          .product-layout-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
          .review-grid { grid-template-columns: 1fr !important; }
        }
      `}} />
    </main>
  );
}
