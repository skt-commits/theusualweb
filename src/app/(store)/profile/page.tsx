'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function UserProfile() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [fetchingOrders, setFetchingOrders] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchUserOrders();
    }
  }, [user]);

  const fetchUserOrders = async () => {
    setFetchingOrders(true);
    try {
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', user?.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const fetchedOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(fetchedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
    setFetchingOrders(false);
  };

  if (loading || !user) {
    return <main style={{ paddingTop: '100px', minHeight: '80vh', textAlign: 'center' }}>Loading your profile...</main>;
  }

  return (
    <main style={{ paddingTop: '140px', paddingBottom: '4rem', minHeight: '80vh' }}>
      <div className="container">
        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>My <span className="text-gradient">Profile</span></h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          
          {/* Profile Details Card */}
          <div>
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
                  {userData?.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 style={{ fontSize: '1.2rem', margin: 0 }}>{userData?.name || 'User'}</h2>
                  <p style={{ color: 'var(--foreground)', margin: 0, fontSize: '0.9rem' }}>{user.email}</p>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#666' }}>Personal Details</h3>
                <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}><strong>Phone:</strong> {userData?.phone || 'Not provided'}</p>
                {(userData?.company) && <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}><strong>Company:</strong> {userData.company}</p>}
              </div>
              
              {userData?.address && (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#666' }}>Saved Address</h3>
                  <p style={{ fontSize: '0.9rem', margin: '0.2rem 0' }}>{userData.address.street}</p>
                  <p style={{ fontSize: '0.9rem', margin: '0.2rem 0' }}>{userData.address.city}, {userData.address.state}</p>
                  <p style={{ fontSize: '0.9rem', margin: '0.2rem 0' }}>{userData.address.country} - {userData.address.postalCode}</p>
                </div>
              )}
            </div>
          </div>

          {/* Orders History */}
          <div>
            <div className="glass-panel" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Order History</h2>
              
              {fetchingOrders ? (
                <p>Loading your orders...</p>
              ) : orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: '#666' }}>
                  <p>You haven't placed any orders yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {orders.map(order => (
                    <div key={order.id} style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: '#fafafa' }}>
                      
                      {/* Order Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                        <div>
                          <p style={{ fontSize: '0.8rem', color: '#666', margin: 0 }}>ORDER PLACED</p>
                          <p style={{ fontWeight: 'bold', margin: 0 }}>{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '0.8rem', color: '#666', margin: 0 }}>TOTAL</p>
                          <p style={{ fontWeight: 'bold', margin: 0 }}>₹ {order.totalAmount?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '0.8rem', color: '#666', margin: 0 }}>ORDER ID</p>
                          <p style={{ fontWeight: 'bold', margin: 0 }}>...{order.id.slice(-8)}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ 
                            padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.85rem',
                            background: order.status === 'Delivered' ? '#22c55e' : 'var(--secondary)', 
                            color: 'white', fontWeight: 'bold'
                          }}>
                            {order.status || 'Processing'}
                          </span>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div>
                        {order.items?.map((item: any, idx: number) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: idx > 0 ? '1rem' : '0' }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', background: '#eee', flexShrink: 0 }}>
                              <img src={item.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={item.name} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontWeight: 'bold', margin: 0, fontSize: '1rem' }}>{item.name}</p>
                              <p style={{ color: '#666', margin: 0, fontSize: '0.9rem' }}>Qty: {item.quantity}</p>
                            </div>
                            <div style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
                              {item.price}
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </main>
  );
}
