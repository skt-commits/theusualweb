'use client';

import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Script from 'next/script';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  
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

  useEffect(() => {
    const fetchShipping = async () => {
      if (shippingInfo.postalCode.length >= 6) {
        setCalculatingShipping(true);
        try {
          const totalWeight = items.reduce((acc, item) => acc + item.quantity, 0) || 1;
          const res = await fetch(`/api/shiprocket/shipping?pincode=${shippingInfo.postalCode}&weight=${totalWeight}`);
          if (res.ok) {
            const data = await res.json();
            setShippingCost(data.rate);
          } else {
            setShippingCost(50);
          }
        } catch (error) {
          setShippingCost(50);
        }
        setCalculatingShipping(false);
      } else {
        setShippingCost(null);
      }
    };
    
    const timeoutId = setTimeout(fetchShipping, 1000);
    return () => clearTimeout(timeoutId);
  }, [shippingInfo.postalCode, items]);

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
      if (shippingCost === null) {
        setLoading(false);
        return alert('Please enter a valid pincode to calculate shipping.');
      }
      
      const sgstAmount = Math.round(totalPrice * 0.025);
      const cgstAmount = Math.round(totalPrice * 0.025);
      const finalTotalAmount = totalPrice + sgstAmount + cgstAmount + shippingCost;

      // 1. Create order on server to get Razorpay order ID
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalTotalAmount })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to initialize payment');
      
      const { order } = data;

      // 2. Open Razorpay modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '', // Needs to be exposed to client
        amount: order.amount,
        currency: order.currency,
        name: 'The Usuals',
        description: 'Order Payment',
        order_id: order.id,
        handler: async function (response: any) {
          try {
            const docRef = await addDoc(collection(db, 'orders'), {
              userId: user ? user.uid : 'guest',
              userEmail: shippingInfo.email,
              items: items,
              subtotal: totalPrice,
              sgst: sgstAmount,
              cgst: cgstAmount,
              shippingCost: shippingCost,
              totalAmount: finalTotalAmount,
              shippingInfo,
              status: 'Processing',
              paymentMethod: 'Razorpay',
              transactionId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              createdAt: new Date().toISOString()
            });

            // Prepare Shiprocket payload
            const shiprocketPayload = {
              order_id: docRef.id,
              order_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
              pickup_location: 'warehouse', // Adjusted to match user's Shiprocket pickup location
              billing_customer_name: shippingInfo.firstName,
              billing_last_name: shippingInfo.lastName,
              billing_address: shippingInfo.streetAddress,
              billing_city: shippingInfo.city,
              billing_pincode: shippingInfo.postalCode,
              billing_state: shippingInfo.state,
              billing_country: 'India',
              billing_email: shippingInfo.email,
              billing_phone: shippingInfo.phone,
              shipping_is_billing: true,
              order_items: items.map(item => ({
                name: item.name,
                sku: item.id || 'SKU',
                units: item.quantity,
                selling_price: item.price
              })),
              payment_method: 'Prepaid',
              sub_total: finalTotalAmount,
              length: 10,
              breadth: 10,
              height: 10,
              weight: items.reduce((acc, item) => acc + item.quantity, 0) || 1
            };

            // 3. Verify Payment and Push to Shiprocket
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderDetails: shiprocketPayload
              })
            });

            const verifyData = await verifyRes.json();
            
            if (!verifyRes.ok) {
              console.error('Payment Verification Failed', verifyData);
              alert('Payment verification failed. Please contact support.');
              return;
            }

            // Send confirmation email
            try {
              await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  to: shippingInfo.email,
                  subject: 'Your Order from The Usuals is Confirmed!',
                  orderId: docRef.id,
                  totalAmount: finalTotalAmount,
                  items: items,
                  paymentMethod: 'Razorpay (Paid)',
                  transactionId: response.razorpay_payment_id,
                  paymentDate: new Date().toLocaleDateString('en-IN'),
                  paymentTime: new Date().toLocaleTimeString('en-IN')
                })
              });
            } catch (err) {
              console.error("Failed to trigger email API:", err);
            }

            setSuccess(true);
            clearCart();
          } catch (err) {
            console.error("Error finalizing order:", err);
            alert("Payment successful but failed to save order. Please contact support.");
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
          email: shippingInfo.email,
          contact: shippingInfo.phone
        },
        theme: {
          color: '#3b82f6'
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response: any) {
        alert(response.error.description);
        setLoading(false);
      });
      
      rzp1.open();

    } catch (error) {
      console.error("Error starting checkout:", error);
      alert("Failed to initialize payment.");
      setLoading(false);
    }
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
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
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
                <input type="radio" id="razorpay" name="payment" defaultChecked style={{ marginRight: '10px' }} />
                <label htmlFor="razorpay" style={{ fontWeight: 'bold' }}>Razorpay (UPI / Cards / Net Banking)</label>
                <div style={{ marginTop: '1rem', color: '#666', fontSize: '0.9rem' }}>
                  Secure payment via Razorpay. You will be redirected to complete your payment.
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
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                <span>SGST (2.5%)</span>
                <span>₹ {Math.round(totalPrice * 0.025).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.9rem', color: '#666' }}>
                <span>CGST (2.5%)</span>
                <span>₹ {Math.round(totalPrice * 0.025).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span>Shipping</span>
                {calculatingShipping ? (
                  <span style={{ color: '#666' }}>Calculating...</span>
                ) : shippingCost !== null ? (
                  <span>₹ {shippingCost}</span>
                ) : (
                  <span style={{ color: '#666' }}>Enter Pincode</span>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
                <span>Total</span>
                <span className="text-gradient">₹ {(totalPrice + Math.round(totalPrice * 0.025) * 2 + (shippingCost || 0)).toLocaleString()}</span>
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
