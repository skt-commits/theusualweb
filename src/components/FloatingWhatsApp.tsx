'use client';
import { useState, useEffect } from 'react';
import { MessageCircle, X, Globe, BadgePercent } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function FloatingWhatsApp() {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (pathname !== '/contact') return null;

  const showMenu = showTooltip || isHovered;

  return (
    <div 
      style={{ position: 'fixed', bottom: 'clamp(1rem, 3vw, 2rem)', right: 'clamp(1rem, 3vw, 2rem)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setShowTooltip(false); }}
    >
      <AnimatePresence>
        {showMenu && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{ 
              background: '#111', 
              padding: '0.5rem 0', 
              borderRadius: '8px', 
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              minWidth: '220px'
            }}
          >
            <a 
              href="https://api.whatsapp.com/send/?phone=919092214148&text=Hi%2C+I+want+to+know+about+Bulk%2FCorporate+Orders.&type=phone_number&app_absent=0" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'white', padding: '0.8rem 1.2rem', textDecoration: 'none', fontSize: '0.9rem', transition: 'background 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <BadgePercent size={18} />
              Bulk/Corporate Orders
            </a>
            
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 1rem' }} />
            
            <a 
              href="https://api.whatsapp.com/send/?phone=919092214148&text=Hi%2C+I+want+to+know+about+International+Orders.&type=phone_number&app_absent=0" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'white', padding: '0.8rem 1.2rem', textDecoration: 'none', fontSize: '0.9rem', transition: 'background 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Globe size={18} />
              International Orders
            </a>

            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowTooltip(false); setIsHovered(false); }} style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'white', border: '1px solid #ccc', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
              <X size={14} color="#333" />
            </button>
            <div style={{ position: 'absolute', bottom: '-8px', right: '20px', width: '0', height: '0', borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '8px solid #111' }} />
          </motion.div>
        )}
      </AnimatePresence>
      <a 
        href="https://api.whatsapp.com/send/?phone=919092214148&text=Hi%2C+I+have+a+query.&type=phone_number&app_absent=0" 
        target="_blank" 
        rel="noopener noreferrer"
        style={{
          width: '60px', height: '60px', borderRadius: '50%', background: '#25D366', color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(37,211,102,0.4)',
          transition: 'transform 0.2s',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <MessageCircle size={32} />
      </a>
    </div>
  );
}
