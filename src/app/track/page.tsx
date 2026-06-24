'use client';
import { PackageSearch } from 'lucide-react';

export default function TrackOrderPage() {
  return (
    <main style={{ paddingBottom: '4rem' }}>
      <div className="page-header">
        <div className="container">
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Track Order</h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.2rem' }}>Follow your styles from our store to your door.</p>
        </div>
      </div>
      <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <PackageSearch size={64} color="var(--accent)" style={{ margin: '0 auto 1.5rem' }} />
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Track Your Delivery</h2>
          <form style={{ textAlign: 'left' }}>
            <div className="form-group">
              <label className="form-label">Order ID</label>
              <input type="text" className="form-input" placeholder="e.g. ORD-123456789" required />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" placeholder="Email used for the order" required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Track Status</button>
          </form>
        </div>
      </div>
    </main>
  );
}
