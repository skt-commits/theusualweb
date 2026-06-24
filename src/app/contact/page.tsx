'use client';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactPage() {
  return (
    <main style={{ paddingBottom: '4rem' }}>
      <div className="page-header">
        <div className="container">
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Contact Us</h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.2rem' }}>We'd love to hear from you. Get in touch with our team.</p>
        </div>
      </div>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem' }}>
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Send us a message</h2>
            <form className="glass-panel" style={{ padding: '2rem' }}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input type="text" className="form-input" placeholder="Your Name" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" placeholder="your@email.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea className="form-input" rows={5} placeholder="How can we help you?"></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Send Message</button>
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
                  <p>+91 98765 43210</p>
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
