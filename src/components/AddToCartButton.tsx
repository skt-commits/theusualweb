'use client';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Plus, Minus } from 'lucide-react';

type Product = {
  id: string;
  name: string;
  price: string;
  image: string;
};

export default function AddToCartButton({ product, fullWidth = false }: { product: Product, fullWidth?: boolean }) {
  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  const quantity = getItemQuantity(product.id);

  const handleContainerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  if (quantity > 0) {
    return (
      <div 
        onClick={handleContainerClick}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          background: 'white', 
          border: '1px solid var(--accent)',
          padding: '0.4rem',
          width: fullWidth ? '100%' : '140px',
          color: 'var(--accent)',
          borderRadius: '4px'
        }}
      >
        <button 
          onClick={() => updateQuantity(product.id, quantity - 1)}
          style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)', color: 'var(--accent)', border: '1px solid var(--border-color)', borderRadius: '4px' }}
        >
          <Minus size={16} />
        </button>
        <span style={{ fontWeight: 'bold', fontSize: '1.1rem', margin: '0 0.5rem' }}>{quantity}</span>
        <button 
          onClick={() => updateQuantity(product.id, quantity + 1)}
          style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)', color: 'var(--accent)', border: '1px solid var(--border-color)', borderRadius: '4px' }}
        >
          <Plus size={16} />
        </button>
      </div>
    );
  }

  return (
    <button 
      onClick={(e) => {
        handleContainerClick(e);
        addToCart(product);
      }}
      className="btn btn-primary" 
      style={{ width: fullWidth ? '100%' : 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.5rem', fontSize: '0.9rem', borderRadius: '4px' }}
    >
      <ShoppingCart size={16} /> ADD TO CART
    </button>
  );
}
