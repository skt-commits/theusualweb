'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/');
    }
  }, [user, isAdmin, loading, router]);

  if (loading) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading Admin Panel...</div>;
  }

  if (!user || !isAdmin) {
    return null; // Will redirect
  }

  return (
    <div style={{ display: 'flex', minHeight: '80vh', paddingTop: '80px' }}>
      {/* Admin Sidebar */}
      <div style={{ width: '250px', background: 'white', borderRight: '1px solid var(--border-color)', padding: '2rem', minHeight: 'calc(100vh - 80px)' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', color: 'var(--accent)' }}>Admin Panel</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link href="/admin/dashboard" className="nav-link" style={{ fontWeight: 'bold' }}>Dashboard</Link>
          <Link href="/admin/products" className="nav-link">Manage Products</Link>
          <Link href="/admin/orders" className="nav-link">Manage Orders</Link>
          <Link href="/admin/users" className="nav-link">Manage Users</Link>
          <Link href="/admin/coupons" className="nav-link">Coupons</Link>
          <Link href="/admin/analytics" className="nav-link">Analytics</Link>
          <Link href="/admin/settings" className="nav-link">Settings</Link>
        </nav>
      </div>

      {/* Admin Content */}
      <div style={{ flex: 1, padding: '3rem', background: 'var(--background)' }}>
        {children}
      </div>
    </div>
  );
}
