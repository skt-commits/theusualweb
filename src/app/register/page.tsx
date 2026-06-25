'use client';

import { useState, Suspense } from 'react';
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ReCAPTCHA from 'react-google-recaptcha';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    taxId: '',
    streetAddress: '',
    city: '',
    country: 'India',
    state: '',
    postalCode: '',
    password: '',
    confirmPassword: '',
    googleUid: '' // Set if they use Google Login
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user already exists completely
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        // They already registered fully, just log them in
        router.push(redirectUrl);
        return;
      }

      // First time Google login - prefill the form and stay on page
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        firstName: user.displayName ? user.displayName.split(' ')[0] : '',
        lastName: user.displayName ? user.displayName.split(' ').slice(1).join(' ') : '',
        googleUid: user.uid
      }));
      
      setError('Please complete the rest of the form to finish your registration.');
      
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-blocked') {
        setError('Your browser blocked the Google login popup. Please allow popups for this site.');
      } else if (err.code === 'auth/cancelled-popup-request' || err.code === 'auth/popup-closed-by-user') {
        setError('Google login was cancelled. Please try again.');
      } else {
        setError('Failed to sign in with Google. Please try again.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 5 && !formData.googleUid) {
      return setError('Password must be at least 5 characters');
    }
    if (formData.password !== formData.confirmPassword && !formData.googleUid) {
      return setError('Passwords do not match');
    }

    if (!recaptchaToken) {
      return setError('Please complete the reCAPTCHA verification');
    }

    setLoading(true);

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

      let uid = formData.googleUid;
      let finalEmail = formData.email;

      if (!uid) {
        // Normal Email/Password Registration
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;
        uid = user.uid;
        
        await updateProfile(user, {
          displayName: `${formData.firstName} ${formData.lastName}`
        });

        // Send Verification Email
        await sendEmailVerification(user);
      }

      // Save complete profile to Firestore
      await setDoc(doc(db, 'users', uid), {
        uid: uid,
        name: `${formData.firstName} ${formData.lastName}`,
        email: finalEmail,
        phone: formData.phone,
        company: formData.company,
        taxId: formData.taxId,
        address: {
          street: formData.streetAddress,
          city: formData.city,
          country: formData.country,
          state: formData.state,
          postalCode: formData.postalCode
        },
        role: 'user',
        createdAt: new Date().toISOString()
      });

      if (formData.googleUid) {
        // Google login is already verified by Google, so redirect immediately
        router.push(redirectUrl);
      } else {
        // Show the verification sent screen
        setVerificationSent(true);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create account');
    }
    setLoading(false);
  };

  if (verificationSent) {
    return (
      <main style={{ paddingBottom: '4rem', paddingTop: '8rem', minHeight: '80vh' }}>
        <div className="container" style={{ maxWidth: '600px', textAlign: 'center' }}>
          <div className="glass-panel auth-card" style={{ padding: '4rem 2rem' }}>
            <div style={{ width: '80px', height: '80px', background: '#dcfce7', color: '#22c55e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/><path d="m16 19 2 2 4-4"/></svg>
            </div>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--primary)' }}>Verify Your Email</h1>
            <p style={{ color: 'var(--foreground)', marginBottom: '2rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
              We have sent a verification link to <strong>{formData.email}</strong>. 
              <br/><br/>
              Please check your inbox (and spam folder) and click the link to verify your account. Once verified, you can proceed to checkout!
            </p>
            <button onClick={() => router.push(redirectUrl)} className="btn btn-primary" style={{ padding: '1rem 2rem' }}>
              I have verified my email
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ paddingBottom: '4rem', paddingTop: '8rem' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="glass-panel auth-card" style={{ maxWidth: '100%', padding: '3rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', textAlign: 'center' }}>Create a New Account</h1>
          <p style={{ color: 'var(--foreground)', textAlign: 'center', marginBottom: '2rem' }}>Fill in your details to get started.</p>

          {!formData.googleUid && (
            <>
              <button onClick={handleGoogleSignIn} className="btn btn-outline" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
              <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
                <span style={{ padding: '0 1rem', color: '#666', fontSize: '0.9rem' }}>OR REGISTER WITH EMAIL</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
              </div>
            </>
          )}

          {error && <div style={{ background: '#fee2e2', color: '#ef4444', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center' }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--primary)' }}>Personal Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="form-input" required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input" required readOnly={!!formData.googleUid} style={formData.googleUid ? {background: '#f3f4f6', cursor: 'not-allowed'} : {}} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="form-input" placeholder="+91 81234 56789" required />
              </div>
            </div>

            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', marginTop: '1.5rem', color: 'var(--primary)' }}>Billing Address</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Company Name (Optional)</label>
                <input type="text" name="company" value={formData.company} onChange={handleChange} className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Tax ID (Optional)</label>
                <input type="text" name="taxId" value={formData.taxId} onChange={handleChange} className="form-input" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Street Address</label>
              <input type="text" name="streetAddress" value={formData.streetAddress} onChange={handleChange} className="form-input" required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">City</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">Country</label>
                <input type="text" name="country" value={formData.country} onChange={handleChange} className="form-input" required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">State</label>
                <input type="text" name="state" value={formData.state} onChange={handleChange} className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label">Postcode</label>
                <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} className="form-input" required />
              </div>
            </div>

            {!formData.googleUid && (
              <>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', marginTop: '1.5rem', color: 'var(--primary)' }}>Account Security</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} className="form-input" placeholder="At least 5 characters" required autoComplete="new-password" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="form-input" required />
                  </div>
                </div>
              </>
            )}
            
            <div style={{ margin: '1.5rem 0', display: 'flex', justifyContent: 'center' }}>
              <ReCAPTCHA
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
                onChange={(token) => setRecaptchaToken(token)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '1rem' }} disabled={loading}>
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>

          <p style={{ marginTop: '2rem', textAlign: 'center' }}>
            Already have an account? <Link href={`/login${searchParams.get('redirect') ? `?redirect=${searchParams.get('redirect')}` : ''}`} style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Login here</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ paddingTop: '8rem', textAlign: 'center' }}>Loading...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
