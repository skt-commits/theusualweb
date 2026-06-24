'use client';
import Link from 'next/link';

export default function Login() {
  return (
    <main style={{ paddingTop: '100px' }}>
      <div className="container">
        <div className="glass-panel auth-card">
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }} className="text-gradient">Welcome Back</h2>
          <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Sign in to continue to The Usuals</p>
          
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" placeholder="john@example.com" required />
            </div>
            
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label className="form-label">Password</label>
                <Link href="#" style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>Forgot?</Link>
              </div>
              <input type="password" className="form-input" placeholder="••••••••" required />
            </div>
            
            {/* Captcha Placeholder */}
            <div className="form-group" style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.2)', textAlign: 'center' }}>
              <span style={{ color: '#cbd5e1' }}>[ Captcha Verification Module ]</span>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
              Sign In
            </button>
          </form>
          
          <div style={{ marginTop: '2rem', color: '#cbd5e1' }}>
            Don't have an account? <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Sign Up</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
