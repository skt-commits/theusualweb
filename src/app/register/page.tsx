'use client';
import Link from 'next/link';

export default function Register() {
  return (
    <main style={{ paddingTop: '100px' }}>
      <div className="container">
        <div className="glass-panel auth-card" style={{ maxWidth: '550px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }} className="text-gradient">Create Account</h2>
          <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Join The Usuals for an exclusive shopping experience</p>
          
          <form onSubmit={(e) => e.preventDefault()}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input type="text" className="form-input" placeholder="John" required />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input type="text" className="form-input" placeholder="Doe" required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" placeholder="john@example.com" required />
            </div>
            
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-input" placeholder="••••••••" required />
            </div>
            
            {/* Captcha Placeholder */}
            <div className="form-group" style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.2)', textAlign: 'center' }}>
              <span style={{ color: '#cbd5e1' }}>[ Captcha Verification Module ]</span>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              Create Account
            </button>
            <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#94a3b8' }}>
              We will send an email verification link to confirm your account.
            </p>
          </form>
          
          <div style={{ marginTop: '2rem', color: '#cbd5e1' }}>
            Already have an account? <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Sign In</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
