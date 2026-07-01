'use client';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Plus, Minus, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AddToCartButton({ product, fullWidth = false, showGoToCart = false, selectedSize }: { product: any, fullWidth?: boolean, showGoToCart?: boolean, selectedSize?: string }) {
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  const [showQuickView, setShowQuickView] = useState(false);
  const [localSize, setLocalSize] = useState('');

  const activeSize = selectedSize || localSize;
  const cartProductId = activeSize ? `${product.id}-${activeSize}` : product.id;
  const cartProductName = activeSize ? `${product.name} (Size: ${activeSize})` : product.name;
  
  const quantity = getItemQuantity(cartProductId);
  const isDirect = !!selectedSize;

  const getEffectivePrice = (size: string) => {
    let basePriceStr = (product.sizePrices && product.sizePrices[size]) 
      ? product.sizePrices[size] 
      : (product.offerPrice || product.price);
      
    if (product.category === 'fabric' && size && size.endsWith('m')) {
      const meters = parseInt(size.replace('m', ''), 10);
      if (!isNaN(meters) && meters > 0) {
        const numPrice = Number(basePriceStr.replace(/[^0-9.]/g, ''));
        if (!isNaN(numPrice)) {
          return `₹ ${numPrice * meters}`;
        }
      }
    }
    return basePriceStr;
  };

  const handleAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDirect) {
      if (quantity === 0) {
        addToCart({ ...product, id: cartProductId, name: cartProductName, price: getEffectivePrice(activeSize) });
      }
    } else {
      setShowQuickView(true);
      if (!localSize) {
        if (product.sizes && product.sizes.length > 0) {
          setLocalSize(product.sizes[0]);
        } else if (product.category === 'fabric') {
          setLocalSize('10m'); // fallback
        } else {
          setLocalSize('M'); // fallback
        }
      }
    }
  };

  const renderQuantityControl = (width = '100%') => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width }}>
      <div 
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
          background: 'white', border: '1px solid var(--accent)', padding: '0.4rem',
          width: '100%', color: 'var(--accent)', borderRadius: '4px'
        }}
      >
        <button onClick={() => updateQuantity(cartProductId, quantity - 1)} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)', color: 'var(--accent)', border: '1px solid var(--border-color)', borderRadius: '4px' }}><Minus size={16} /></button>
        <span style={{ fontWeight: 'bold', fontSize: '1.1rem', margin: '0 0.5rem' }}>{quantity}</span>
        <button onClick={() => updateQuantity(cartProductId, quantity + 1)} style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)', color: 'var(--accent)', border: '1px solid var(--border-color)', borderRadius: '4px' }}><Plus size={16} /></button>
      </div>
      {showGoToCart && (
        <Link href="/cart" className="btn btn-outline" style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '0.5rem', fontSize: '0.9rem', borderRadius: '4px' }}>
          Go to Cart
        </Link>
      )}
    </div>
  );

  // If in direct mode and item is in cart, show quantity control
  if (isDirect && quantity > 0) {
    return renderQuantityControl(fullWidth ? '100%' : '140px');
  }

  const renderQuickView = () => {
    if (!showQuickView) return null;
    
    let availableSizes = product.sizes && product.sizes.length > 0 ? product.sizes : [];

    const currentPrice = getEffectivePrice(localSize);

    return (
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 99999, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'flex-end' }} onClick={(e) => { e.stopPropagation(); setShowQuickView(false); }}>
        <div style={{ width: '400px', maxWidth: '100%', height: '100%', background: 'white', display: 'flex', flexDirection: 'column', boxShadow: '-5px 0 25px rgba(0,0,0,0.1)', animation: 'slideInRight 0.3s forwards' }} onClick={e => e.stopPropagation()}>
          <div style={{ padding: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => setShowQuickView(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
          </div>
          
          <div style={{ padding: '0 1.5rem 1.5rem', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            
            <img src={product.image || (product.images && product.images[0])} alt={product.name} style={{ width: '180px', height: '220px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1.5rem' }} />
            
            <h4 style={{ fontWeight: 'bold', fontSize: '1.4rem', marginBottom: '0.5rem', textAlign: 'center', color: '#1a1a2e' }}>{product.name}</h4>
            <p style={{ color: '#f43f5e', fontWeight: 'bold', fontSize: '1.5rem', marginBottom: '1rem' }}>{currentPrice}</p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontSize: '0.9rem', marginBottom: '2rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div> Item is in stock
            </div>

            <div style={{ width: '100%', marginBottom: '2rem' }}>
              <p style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '1rem', color: '#4b5563', textAlign: 'center' }}>SIZE</p>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {availableSizes.map((sz: string) => {
                  return (
                    <button 
                      key={sz}
                      onClick={() => setLocalSize(sz)}
                      style={{ 
                        minWidth: '45px', height: '40px', padding: '0 0.5rem', borderRadius: '6px',
                        border: localSize === sz ? '2px solid #4338ca' : '1px solid #e5e7eb',
                        background: localSize === sz ? '#4338ca' : 'white',
                        color: localSize === sz ? 'white' : '#374151',
                        cursor: 'pointer',
                        fontSize: '0.9rem', fontWeight: '500'
                      }}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ width: '100%', marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <p style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '1rem', color: '#4b5563', textAlign: 'center' }}>QUANTITY</p>
              {quantity > 0 ? (
                <div style={{ width: '140px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', border: '1px solid #4338ca', padding: '0.3rem', width: '100%', color: '#4338ca', borderRadius: '6px' }}>
                    <button onClick={() => updateQuantity(cartProductId, quantity - 1)} style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', color: '#4338ca', border: '1px solid #e5e7eb', borderRadius: '4px' }}><Minus size={18} /></button>
                    <span style={{ fontWeight: 'bold', fontSize: '1.2rem', margin: '0 0.5rem' }}>{quantity}</span>
                    <button onClick={() => updateQuantity(cartProductId, quantity + 1)} style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', color: '#4338ca', border: '1px solid #e5e7eb', borderRadius: '4px' }}><Plus size={18} /></button>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: '1.1rem', color: '#4b5563', fontWeight: 'bold' }}>1</p>
              )}
            </div>
            
            {product.description && (
              <p style={{ fontSize: '0.9rem', color: '#6b7280', lineHeight: 1.6, textAlign: 'center' }}>{product.description.substring(0, 120)}...</p>
            )}
          </div>
          
          <div style={{ padding: '1.5rem', borderTop: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'white' }}>
            {quantity === 0 ? (
              <button 
                onClick={() => addToCart({ ...product, id: cartProductId, name: cartProductName, price: currentPrice })}
                style={{ width: '100%', padding: '1rem', background: '#f43f5e', color: 'white', border: 'none', borderRadius: '30px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(244,63,94,0.3)' }}
              >
                ADD TO CART
              </button>
            ) : (
              <Link href="/cart" style={{ width: '100%', padding: '1rem', background: '#f43f5e', color: 'white', border: 'none', borderRadius: '30px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', textAlign: 'center', boxShadow: '0 4px 14px rgba(244,63,94,0.3)', textDecoration: 'none', display: 'block' }}>
                GO TO CART
              </Link>
            )}
            <Link href="/checkout" style={{ width: '100%', padding: '1rem', background: 'white', color: '#4338ca', border: '2px solid #4338ca', borderRadius: '30px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', textAlign: 'center', textDecoration: 'none', display: 'block' }}>
              BUY NOW
            </Link>
          </div>
        </div>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        `}} />
      </div>
    );
  };

  return (
    <>
      <button 
        onClick={handleAction}
        className="btn btn-primary" 
        style={{ width: fullWidth ? '100%' : 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.5rem', fontSize: '0.9rem', borderRadius: '4px' }}
      >
        <ShoppingCart size={16} /> ADD TO CART
      </button>
      {renderQuickView()}
    </>
  );
}
