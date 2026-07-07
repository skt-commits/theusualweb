'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

export default function StockManagement() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'products'));
    
    // Realtime listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedProducts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Optional: Sort manually here if orderBy isn't used
      fetchedProducts.sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });
      setProducts(fetchedProducts);
      setLoading(false);
    }, (error) => {
      console.error("Error listening to products:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStockUpdate = async (productId: string, newStock: number) => {
    if (newStock < 0) return;
    setUpdatingId(productId);
    try {
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, {
        stock: newStock,
        inStock: newStock > 0
      });
    } catch (error) {
      console.error("Failed to update stock:", error);
      alert("Failed to update stock");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Stock Data...</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem' }}>Stock Management</h1>
        <Link href="/admin/products" className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
          Back to Products
        </Link>
      </div>

      <div className="glass-panel" style={{ overflowX: 'auto', padding: '1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
              <th style={{ padding: '1rem' }}>Product</th>
              <th style={{ padding: '1rem' }}>Category</th>
              <th style={{ padding: '1rem' }}>Price</th>
              <th style={{ padding: '1rem' }}>Current Stock</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem' }}>Update Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => {
              const stockCount = typeof product.stock === 'number' ? product.stock : 0;
              const isLowStock = stockCount > 0 && stockCount <= 5;
              const isOut = stockCount === 0;

              return (
                <tr key={product.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <img 
                        src={product.image || (product.images && product.images[0]) || '/placeholder.png'} 
                        alt={product.name} 
                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }}
                      />
                      <div>
                        <p style={{ fontWeight: 'bold' }}>{product.name}</p>
                        {product.subcategory && <span style={{ fontSize: '0.85rem', color: '#666' }}>{product.subcategory}</span>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', textTransform: 'capitalize' }}>{product.category}</td>
                  <td style={{ padding: '1rem' }}>{product.offerPrice || product.price}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      fontWeight: 'bold', 
                      fontSize: '1.2rem',
                      color: isOut ? '#dc2626' : (isLowStock ? '#d97706' : '#16a34a')
                    }}>
                      {stockCount}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {isOut ? (
                      <span style={{ background: '#fee2e2', color: '#dc2626', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>Out of Stock</span>
                    ) : isLowStock ? (
                      <span style={{ background: '#fef3c7', color: '#d97706', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>Low Stock</span>
                    ) : (
                      <span style={{ background: '#dcfce7', color: '#16a34a', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>In Stock</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input 
                        type="number" 
                        min="0"
                        defaultValue={stockCount}
                        className="form-input"
                        style={{ width: '80px', padding: '0.3rem', height: '36px' }}
                        onBlur={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val) && val !== stockCount) {
                            handleStockUpdate(product.id, val);
                          }
                        }}
                        disabled={updatingId === product.id}
                      />
                      {updatingId === product.id && <span style={{ fontSize: '0.8rem', color: '#666' }}>Saving...</span>}
                    </div>
                  </td>
                </tr>
              );
            })}
            
            {products.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
