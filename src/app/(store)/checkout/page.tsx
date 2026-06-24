'use client';

import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: ''
  });

  useEffect(() => {
    // Prefill email if logged in
    if (user && user.email) {
      setShippingInfo(prev => ({ ...prev, email: user.email! }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return alert('Your cart is empty!');
    
    if (!shippingInfo.firstName || !shippingInfo.email || !shippingInfo.phone || !shippingInfo.streetAddress) {
      return alert('Please fill in all required shipping details.');
    }

    setLoading(true);

    try {
      const docRef = await addDoc(collection(db, 'orders'), {
        userId: user ? user.uid : 'guest',
        userEmail: shippingInfo.email,
        items: items,
        totalAmount: totalPrice,
        shippingInfo,
        status: 'Processing',
        paymentMethod: 'UPI / Net Banking',
        transactionId: `MOCK_UPI_${Math.floor(Math.random() * 10000000)}`,
        createdAt: new Date().toISOString()
      });

      // Send the real confirmation email using our new API route
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: shippingInfo.email,
            subject: 'Your Order from The Usuals is Confirmed!',
            orderId: `...${docRef.id.slice(-8)}`,
            totalAmount: totalPrice,
            items: items
          })
        });
      } catch (err) {
        console.error("Failed to trigger email API:", err);
      }

      setSuccess(true);
      clearCart();
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order.");
    }
    
    setLoading(false);
  };

  if (success) {
    return (
      <main style={{ paddingTop: '120px', paddingBottom: '4rem', textAlign: 'center' }}>
        <div className="container">
          <div className="glass-panel auth-card">
            <CheckCircle size={64} color="#22c55e" style={{ margin: '0 auto 1.5rem' }} />
            <h2 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Order Confirmed!</h2>
            <p style={{ color: 'var(--foreground)', marginBottom: '2rem' }}>
              Thank you for your purchase. We have sent an order confirmation email to <strong>{shippingInfo.email}</strong>.<br/>
              <span style={{ fontSize: '0.9rem', color: '#666' }}>(Check your spam section too if not found)</span>
            </p>
            <Link href="/" className="btn btn-primary">Continue Shopping</Link>
          </div>
        </div>
      </main>
    );
  }

  if (authLoading) {
    return <main style={{ paddingTop: '120px', paddingBottom: '4rem', textAlign: 'center' }}>Loading checkout...</main>;
  }

  if (!user) {
    return (
      <main style={{ paddingTop: '120px', paddingBottom: '4rem', textAlign: 'center' }}>
        <div className="container">
          <div className="glass-panel auth-card" style={{ padding: '3rem' }}>
            <h2 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Registration Required</h2>
            <p style={{ color: 'var(--foreground)', marginBottom: '2rem', fontSize: '1.1rem' }}>
              Please register or log in to continue ordering and track your order status!
            </p>
            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1rem' }}>
              <Link 
                href="/register?redirect=/checkout" 
                className="btn btn-primary" 
                style={{ padding: '1rem 2.5rem', minWidth: '200px', whiteSpace: 'nowrap', fontSize: '1.1rem' }}
              >
                Register
              </Link>
              <Link 
                href="/login?redirect=/checkout" 
                className="btn btn-outline" 
                style={{ padding: '1rem 2.5rem', minWidth: '200px', whiteSpace: 'nowrap', fontSize: '1.1rem' }}
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ paddingTop: '140px', paddingBottom: '4rem' }}>
      <div className="container">
        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Secure <span className="text-gradient">Checkout</span></h1>
        
        <div className="checkout-grid">
          <div>
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Shipping Information</h3>
              <form>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">First Name *</label>
                    <input type="text" name="firstName" value={shippingInfo.firstName} onChange={handleChange} className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input type="text" name="lastName" value={shippingInfo.lastName} onChange={handleChange} className="form-input" />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input type="email" name="email" value={shippingInfo.email} onChange={handleChange} className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mobile Number *</label>
                    <input type="tel" name="phone" value={shippingInfo.phone} onChange={handleChange} className="form-input" placeholder="+91" required />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Street Address *</label>
                  <input type="text" name="streetAddress" value={shippingInfo.streetAddress} onChange={handleChange} className="form-input" required />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input type="text" name="city" value={shippingInfo.city} onChange={handleChange} className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input type="text" name="state" value={shippingInfo.state} onChange={handleChange} className="form-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Postal Code *</label>
                    <input type="text" name="postalCode" value={shippingInfo.postalCode} onChange={handleChange} className="form-input" required />
                  </div>
                </div>
              </form>
            </div>

            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Payment Method</h3>
              <div style={{ padding: '1.5rem', background: 'white', borderRadius: '8px', border: '1px solid var(--accent)', marginBottom: '1rem' }}>
                <input type="radio" id="upi" name="payment" defaultChecked style={{ marginRight: '10px' }} />
                <label htmlFor="upi" style={{ fontWeight: 'bold' }}>UPI / Net Banking (Razorpay Mock)</label>
                <div style={{ marginTop: '1rem', color: '#666', fontSize: '0.9rem' }}>
                  A mock UPI Transaction ID will be generated for testing. 
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="cart-summary" style={{ position: 'sticky', top: '100px' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>Order Summary</h3>
              
              <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '1.5rem' }}>
                {items.length === 0 ? (
                  <p>Your cart is empty.</p>
                ) : items.map(item => (
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
              
              <button onClick={handlePlaceOrder} className="btn btn-primary" style={{ width: '100%' }} disabled={loading || items.length === 0}>
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
