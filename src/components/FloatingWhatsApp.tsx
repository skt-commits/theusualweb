'use client';
import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FloatingWhatsApp() {
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ position: 'fixed', bottom: 'clamp(1rem, 3vw, 2rem)', right: 'clamp(1rem, 3vw, 2rem)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
      <AnimatePresence>
        {showTooltip && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{ 
              background: 'white', 
              padding: '0.8rem 1rem', 
              borderRadius: '8px', 
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              position: 'relative'
            }}
          >
            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#333' }}>Contact for any queries...</span>
            <button onClick={() => setShowTooltip(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
              <X size={14} color="#666" />
            </button>
            <div style={{ position: 'absolute', bottom: '-8px', right: '20px', width: '0', height: '0', borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '8px solid white' }} />
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
