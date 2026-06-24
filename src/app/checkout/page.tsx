'use client';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function Checkout() {
  const { items, totalPrice } = useCart();
  const [success, setSuccess] = useState(false);

  if (success) {
    return (
      <main style={{ paddingTop: '120px', paddingBottom: '4rem', textAlign: 'center' }}>
        <div className="container">
          <div className="glass-panel auth-card">
            <CheckCircle size={64} color="#22c55e" style={{ margin: '0 auto 1.5rem' }} />
            <h2 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Order Confirmed!</h2>
            <p style={{ color: 'var(--foreground)', marginBottom: '2rem' }}>Thank you for your purchase. We will send you an email confirmation shortly.</p>
            <Link href="/" className="btn btn-primary">Continue Shopping</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ paddingTop: '100px', paddingBottom: '4rem' }}>
      <div className="container">
        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Secure <span className="text-gradient">Checkout</span></h1>
        
        <div className="checkout-grid">
          <div>
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Shipping Address</h3>
              <form>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input type="text" className="form-input" required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input type="text" className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Postal Code</label>
                    <input type="text" className="form-input" required />
                  </div>
                </div>
              </form>
            </div>

            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Payment Method</h3>
              <div style={{ padding: '1.5rem', background: 'white', borderRadius: '8px', border: '1px solid var(--accent)', marginBottom: '1rem' }}>
                <input type="radio" id="card" name="payment" defaultChecked style={{ marginRight: '10px' }} />
                <label htmlFor="card" style={{ fontWeight: 'bold' }}>Credit / Debit Card</label>
                <div style={{ marginTop: '1rem' }}>
                  <input type="text" className="form-input" placeholder="Card Number" style={{ marginBottom: '1rem' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <input type="text" className="form-input" placeholder="MM/YY" />
                    <input type="text" className="form-input" placeholder="CVC" />
                  </div>
                </div>
              </div>
              <div style={{ padding: '1.5rem', background: 'white', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <input type="radio" id="upi" name="payment" style={{ marginRight: '10px' }} />
                <label htmlFor="upi" style={{ fontWeight: 'bold' }}>UPI / Net Banking</label>
              </div>
            </div>
          </div>
          
          <div>
            <div className="cart-summary" style={{ position: 'sticky', top: '100px' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>Order Summary</h3>
              
              <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1.5rem' }}>
                {items.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--foreground)', fontSize: '0.95rem' }}>{item.quantity}x {item.name}</span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>{item.price}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span>Subtotal</span>
                <span>₹ {totalPrice.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span>Shipping</span>
                <span style={{ color: '#22c55e' }}>Free</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
                <span>Total</span>
                <span className="text-gradient">₹ {totalPrice.toLocaleString()}</span>
              </div>
              
              <button onClick={() => setSuccess(true)} className="btn btn-primary" style={{ width: '100%' }}>
                Place Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
