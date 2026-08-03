'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { getUniqueSlug } from '@/lib/slug';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [subcategoriesMap, setSubcategoriesMap] = useState<Record<string, string[]>>({});
  const [migrating, setMigrating] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const prods: any[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const subsMap: Record<string, Set<string>> = {};
      prods.forEach(prod => {
        if (prod.category && prod.subcategory) {
          if (!subsMap[prod.category]) subsMap[prod.category] = new Set();
          subsMap[prod.category].add(prod.subcategory);
        }
      });
      const finalSubsMap: Record<string, string[]> = {};
      for (const cat in subsMap) {
        finalSubsMap[cat] = Array.from(subsMap[cat]);
      }
      setSubcategoriesMap(finalSubsMap);
      setProducts(prods);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
    setLoading(false);
  };

  const handleSubcategoryUpdate = async (productId: string, newSubcategory: string) => {
    setUpdatingId(productId);
    try {
      await updateDoc(doc(db, 'products', productId), { subcategory: newSubcategory });
      setProducts(products.map(p => p.id === productId ? { ...p, subcategory: newSubcategory } : p));
    } catch (error) {
      console.error("Error updating subcategory:", error);
      alert("Failed to update subcategory.");
    }
    setUpdatingId(null);
  };

  const handleMigrateSlugs = async () => {
    if (!confirm("Are you sure you want to generate slugs for all products that don't have one?")) {
      return;
    }
    setMigrating(true);
    try {
      let migratedCount = 0;
      const querySnapshot = await getDocs(collection(db, 'products'));
      for (const productDoc of querySnapshot.docs) {
        const data = productDoc.data();
        if (!data.slug) {
          const docId = productDoc.id;
          const uniqueSlug = await getUniqueSlug(data.name || 'product', docId);
          await updateDoc(doc(db, 'products', docId), { slug: uniqueSlug });
          migratedCount++;
        }
      }
      alert(`Successfully generated slugs for ${migratedCount} products!`);
      fetchProducts();
    } catch (error) {
      console.error("Error migrating slugs:", error);
      alert("Failed to migrate slugs. Check console.");
    }
    setMigrating(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteDoc(doc(db, 'products', id));
        fetchProducts(); // Refresh list
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem' }}>Manage Products</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={handleMigrateSlugs} className="btn btn-outline" disabled={migrating || loading}>
            {migrating ? 'Generating...' : 'Generate Missing Slugs'}
          </button>
          <Link href="/admin/stock" className="btn btn-outline">Manage Stock</Link>
          <Link href="/admin/products/new" className="btn btn-primary">Add New Product</Link>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1rem' }}>
        {loading ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p>No products found in the database. Add one to get started!</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ padding: '1rem' }}>Image</th>
                <th style={{ padding: '1rem' }}>Name</th>
                <th style={{ padding: '1rem' }}>Price</th>
                <th style={{ padding: '1rem' }}>Category</th>
                <th style={{ padding: '1rem' }}>Subcategory</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem' }}>
                    <img src={product.image} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} />
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>{product.name}</td>
                  <td style={{ padding: '1rem' }}>{product.price}</td>
                  <td style={{ padding: '1rem', textTransform: 'capitalize' }}>{product.category}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <select 
                        value={product.subcategory || ''} 
                        onChange={(e) => handleSubcategoryUpdate(product.id, e.target.value)}
                        disabled={updatingId === product.id}
                        style={{ padding: '0.3rem', borderRadius: '4px', border: '1px solid var(--border-color)', minWidth: '120px' }}
                      >
                        <option value="">-- None --</option>
                        {subcategoriesMap[product.category]?.map(sub => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                      {updatingId === product.id && <span style={{ fontSize: '0.8rem', color: '#666' }}>Saving...</span>}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <Link href={`/admin/products/edit?id=${product.id}`} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', marginRight: '0.5rem', display: 'inline-block' }}>Edit</Link>
                    <button onClick={() => handleDelete(product.id)} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: '#ef4444', border: 'none' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
