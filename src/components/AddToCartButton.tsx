'use client';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Plus, Minus } from 'lucide-react';

import Link from 'next/link';

type Product = {
  id: string;
  name: string;
  price: string;
  image: string;
};

export default function AddToCartButton({ product, fullWidth = false, showGoToCart = false, selectedSize }: { product: Product, fullWidth?: boolean, showGoToCart?: boolean, selectedSize?: string }) {
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  
  // If size is selected, create a unique variant ID for the cart
  const cartProductId = selectedSize ? `${product.id}-${selectedSize}` : product.id;
  const cartProductName = selectedSize ? `${product.name} (Size: ${selectedSize})` : product.name;
  
  const quantity = getItemQuantity(cartProductId);

  const handleContainerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  if (quantity > 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: fullWidth ? '100%' : '140px' }}>
        <div 
          onClick={handleContainerClick}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            background: 'white', 
            border: '1px solid var(--accent)',
            padding: '0.4rem',
            width: '100%',
            color: 'var(--accent)',
            borderRadius: '4px'
          }}
        >
          <button 
            onClick={() => updateQuantity(cartProductId, quantity - 1)}
            style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)', color: 'var(--accent)', border: '1px solid var(--border-color)', borderRadius: '4px' }}
          >
            <Minus size={16} />
          </button>
          <span style={{ fontWeight: 'bold', fontSize: '1.1rem', margin: '0 0.5rem' }}>{quantity}</span>
          <button 
            onClick={() => updateQuantity(cartProductId, quantity + 1)}
            style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)', color: 'var(--accent)', border: '1px solid var(--border-color)', borderRadius: '4px' }}
          >
            <Plus size={16} />
          </button>
        </div>
        
        {showGoToCart && (
          <Link href="/cart" className="btn btn-outline" style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '0.5rem', fontSize: '0.9rem', borderRadius: '4px' }}>
            Go to Cart
          </Link>
        )}
      </div>
    );
  }

  return (
    <button 
      onClick={(e) => {
        handleContainerClick(e);
        addToCart({ ...product, id: cartProductId, name: cartProductName });
      }}
      className="btn btn-primary" 
      style={{ width: fullWidth ? '100%' : 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.5rem', fontSize: '0.9rem', borderRadius: '4px' }}
    >
      <ShoppingCart size={16} /> ADD TO CART
    </button>
  );
}
