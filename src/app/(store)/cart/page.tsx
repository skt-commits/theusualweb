'use client';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Trash2, ArrowRight } from 'lucide-react';
import AddToCartButton from '@/components/AddToCartButton';

export default function Cart() {
  const { items, removeFromCart, totalPrice } = useCart();

  return (
    <main style={{ paddingTop: '100px', paddingBottom: '4rem' }}>
      <div className="container">
        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Your <span className="text-gradient">Cart</span></h1>
        
        {items.length === 0 ? (
          <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Your cart is empty</h3>
            <p style={{ color: 'var(--foreground)', marginBottom: '2rem' }}>Looks like you haven't added anything to your cart yet.</p>
            <Link href="/" className="btn btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="checkout-grid">
            <div className="glass-panel" style={{ padding: '2rem' }}>
              {items.map((item) => (
                <div key={item.id} className="cart-item" style={{ alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <Link href={`/product/${item.id}`}>
                      <img src={item.image} alt={item.name} />
                    </Link>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingBottom: '0.5rem' }}>
                      <div>
                        <Link href={`/product/${item.id}`}>
                          <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{item.name}</h4>
                        </Link>
                        <p className="text-gradient" style={{ fontWeight: 'bold', marginBottom: '1rem' }}>{item.price}</p>
                      </div>
                      <div style={{ marginTop: 'auto' }}>
                        <AddToCartButton product={item} />
                      </div>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="icon-btn" style={{ color: '#ef4444' }}>
                    <Trash2 size={24} />
                  </button>
                </div>
              ))}
            </div>
            
            <div>
              <div className="cart-summary">
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>Order Summary</h3>
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
                
                <Link href="/checkout" className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                  Proceed to Checkout <ArrowRight size={20} />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
