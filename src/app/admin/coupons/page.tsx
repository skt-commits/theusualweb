'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Plus, Trash, Edit } from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  isActive: boolean;
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: 0,
    minOrderValue: 0,
    isActive: true
  });

  const fetchCoupons = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'coupons'));
      const fetched = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Coupon[];
      setCoupons(fetched);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || formData.discountValue <= 0) return alert('Invalid coupon details');
    
    setLoading(true);
    try {
      const dataToSave = {
        ...formData,
        code: formData.code.toUpperCase(),
        discountValue: Number(formData.discountValue),
        minOrderValue: Number(formData.minOrderValue)
      };

      if (editingId) {
        await updateDoc(doc(db, 'coupons', editingId), dataToSave);
      } else {
        await addDoc(collection(db, 'coupons'), dataToSave);
      }
      
      setShowForm(false);
      setEditingId(null);
      setFormData({ code: '', discountType: 'percentage', discountValue: 0, minOrderValue: 0, isActive: true });
      fetchCoupons();
    } catch (error) {
      console.error("Error saving coupon:", error);
      alert('Failed to save coupon');
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await deleteDoc(doc(db, 'coupons', id));
      setCoupons(coupons.filter(c => c.id !== id));
    } catch (error) {
      console.error("Error deleting coupon:", error);
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderValue: coupon.minOrderValue || 0,
      isActive: coupon.isActive
    });
    setEditingId(coupon.id);
    setShowForm(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Manage Coupons</h1>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ code: '', discountType: 'percentage', discountValue: 0, minOrderValue: 0, isActive: true }); }} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={20} /> {showForm ? 'Cancel' : 'New Coupon'}
        </button>
      </div>

      {showForm && (
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', fontWeight: 'bold' }}>{editingId ? 'Edit Coupon' : 'Create Coupon'}</h2>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Coupon Code</label>
              <input type="text" className="form-input" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Discount Type</label>
              <select className="form-input" value={formData.discountType} onChange={e => setFormData({...formData, discountType: e.target.value as any})}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Discount Value</label>
              <input type="number" className="form-input" value={formData.discountValue} onChange={e => setFormData({...formData, discountValue: Number(e.target.value)})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Minimum Order Value (₹)</label>
              <input type="number" className="form-input" value={formData.minOrderValue} onChange={e => setFormData({...formData, minOrderValue: Number(e.target.value)})} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} />
              <label htmlFor="isActive" className="form-label" style={{ marginBottom: 0 }}>Coupon is Active</label>
            </div>
            <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Coupon'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '1rem', fontWeight: 'bold' }}>Code</th>
              <th style={{ padding: '1rem', fontWeight: 'bold' }}>Discount</th>
              <th style={{ padding: '1rem', fontWeight: 'bold' }}>Min Order</th>
              <th style={{ padding: '1rem', fontWeight: 'bold' }}>Status</th>
              <th style={{ padding: '1rem', fontWeight: 'bold' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No coupons found.</td></tr>
            ) : coupons.map(coupon => (
              <tr key={coupon.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '1rem', fontWeight: 'bold' }}>{coupon.code}</td>
                <td style={{ padding: '1rem' }}>{coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}</td>
                <td style={{ padding: '1rem' }}>₹{coupon.minOrderValue}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem', background: coupon.isActive ? '#dcfce7' : '#fee2e2', color: coupon.isActive ? '#166534' : '#991b1b' }}>
                    {coupon.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleEdit(coupon)} style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}><Edit size={18} /></button>
                  <button onClick={() => handleDelete(coupon.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
