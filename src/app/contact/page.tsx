'use client';
import { useState } from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ReCAPTCHA from 'react-google-recaptcha';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recaptchaToken) {
      return setStatus('Please complete the reCAPTCHA');
    }
    setStatus('Sending...');
    try {
      const recaptchaRes = await fetch('/api/verify-recaptcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: recaptchaToken })
      });
      const recaptchaData = await recaptchaRes.json();
      
      if (!recaptchaData.success) {
        throw new Error('reCAPTCHA verification failed. Please try again.');
      }
      await addDoc(collection(db, 'messages'), {
        ...formData,
        status: 'unread',
        createdAt: new Date().toISOString()
      });
      setStatus('Message sent successfully!');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error: any) {
      console.error(error);
      setStatus(error.message === 'reCAPTCHA verification failed. Please try again.' ? error.message : 'Failed to send message.');
    }
  };

  return (
    <main style={{ paddingBottom: '4rem' }}>
      <div className="page-header">
        <div className="container">
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Contact Us</h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.2rem' }}>We'd love to hear from you. Get in touch with our team.</p>
        </div>
      </div>
      <div className="container">
        <div className="contact-grid">
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Send us a message</h2>
            <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2rem' }}>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input required type="text" className="form-input" placeholder="Your Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input required type="email" className="form-input" placeholder="your@email.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Mobile Number *</label>
                <input required type="tel" className="form-input" placeholder="+91" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Message *</label>
                <textarea required className="form-input" rows={5} placeholder="How can we help you?" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}></textarea>
              </div>

              <div style={{ margin: '1.5rem 0', display: 'flex', justifyContent: 'center' }}>
                <ReCAPTCHA
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
                  onChange={(token) => setRecaptchaToken(token)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '1rem' }} disabled={status === 'Sending...'}>Send Message</button>
              {status && <p style={{ color: (status.includes('success') || status === 'Sending...') ? '#22c55e' : '#ef4444', textAlign: 'center', fontWeight: 'bold' }}>{status}</p>}
            </form>
          </div>
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Contact Information</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}><Mail /></div>
                <div>
                  <h4 style={{ fontWeight: 'bold' }}>Email</h4>
                  <p>theusualsalem@gmail.com</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}><Phone /></div>
                <div>
                  <h4 style={{ fontWeight: 'bold' }}>Phone</h4>
                  <p>+91 9092214148</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}><MapPin /></div>
                <div>
                  <h4 style={{ fontWeight: 'bold' }}>Office</h4>
                  <p>123 Fashion Street, Salem, Tamil Nadu, India</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
