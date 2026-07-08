'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Save } from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    storeName: 'The Usuals',
    supportEmail: 'theusualsalem@gmail.com',
    supportPhone: '+91 9092214148',
    whatsappNumber: '919092214148',
    address: '56, Kudi Street,Anaigoundampatti, Kottagoundampatty, salem, Tamil Nadu 636011',
    maintenanceMode: false,
    shippingFee: 0,
    freeShippingThreshold: 500
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'store');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFormData({ ...formData, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'store'), formData);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error("Error saving settings:", error);
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading settings...</div>;

  return (
    <div style={{ maxWidth: '800px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Store Settings</h1>

      <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>General Details</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">Store Name</label>
            <input type="text" className="form-input" value={formData.storeName} onChange={e => setFormData({...formData, storeName: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Support Email</label>
            <input type="email" className="form-input" value={formData.supportEmail} onChange={e => setFormData({...formData, supportEmail: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Support Phone</label>
            <input type="text" className="form-input" value={formData.supportPhone} onChange={e => setFormData({...formData, supportPhone: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">WhatsApp API Number</label>
            <input type="text" className="form-input" value={formData.whatsappNumber} onChange={e => setFormData({...formData, whatsappNumber: e.target.value})} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Store Address</label>
          <textarea className="form-input" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} rows={3}></textarea>
        </div>

        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginTop: '1rem' }}>Shipping & Preferences</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">Default Shipping Fee (₹)</label>
            <input type="number" className="form-input" value={formData.shippingFee} onChange={e => setFormData({...formData, shippingFee: Number(e.target.value)})} />
          </div>
          <div className="form-group">
            <label className="form-label">Free Shipping Threshold (₹)</label>
            <input type="number" className="form-input" value={formData.freeShippingThreshold} onChange={e => setFormData({...formData, freeShippingThreshold: Number(e.target.value)})} />
          </div>
        </div>

        <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
          <input type="checkbox" id="maintenance" checked={formData.maintenanceMode} onChange={e => setFormData({...formData, maintenanceMode: e.target.checked})} style={{ width: '20px', height: '20px' }} />
          <label htmlFor="maintenance" className="form-label" style={{ marginBottom: 0, color: '#ef4444', fontWeight: 'bold' }}>Enable Maintenance Mode</label>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <button type="submit" className="btn btn-primary" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Save size={20} /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
