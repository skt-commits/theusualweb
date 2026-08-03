'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Edit2, Save, X } from 'lucide-react';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Processing': return '#f59e0b'; // Amber
    case 'Order Received': return '#3b82f6'; // Blue
    case 'Shipped': return '#8b5cf6'; // Purple
    case 'On the way': return '#06b6d4'; // Cyan
    case 'Delivered': return '#22c55e'; // Green
    case 'Cancelled': return '#ef4444'; // Red
    default: return 'var(--secondary)';
  }
};

export default function UserProfile() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [fetchingOrders, setFetchingOrders] = useState(true);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [fetchingWishlist, setFetchingWishlist] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    company: '',
    street: '',
    city: '',
    state: '',
    country: '',
    postalCode: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchUserOrders();
    }
    if (userData) {
      setEditForm({
        name: userData.name || '',
        phone: userData.phone || '',
        company: userData.company || '',
        street: userData.address?.street || '',
        city: userData.address?.city || '',
        state: userData.address?.state || '',
        country: userData.address?.country || 'India',
        postalCode: userData.address?.postalCode || ''
      });
    }
  }, [user, userData]);

  useEffect(() => {
    const fetchWishlist = async () => {
      setFetchingWishlist(true);
      try {
        const favs = JSON.parse(localStorage.getItem('favourites') || '[]');
        if (favs.length > 0) {
          const promises = favs.map((id: string) => getDoc(doc(db, 'products', id)));
          const docs = await Promise.all(promises);
          const products = docs.filter(d => d.exists()).map(d => ({ id: d.id, ...d.data() }));
          setWishlist(products);
        } else {
          setWishlist([]);
        }
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      }
      setFetchingWishlist(false);
    };
    fetchWishlist();
  }, []);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        name: editForm.name,
        phone: editForm.phone,
        company: editForm.company,
        address: {
          street: editForm.street,
          city: editForm.city,
          state: editForm.state,
          country: editForm.country,
          postalCode: editForm.postalCode
        }
      });
      setIsEditing(false);
      window.location.reload();
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    }
    setSavingProfile(false);
  };

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
    return <main style={{ paddingTop: '140px', minHeight: '80vh', textAlign: 'center' }}>Loading your profile...</main>;
  }

  return (
    <main style={{ paddingTop: '140px', paddingBottom: '4rem', minHeight: '80vh' }}>
      <div className="container">
        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>My <span className="text-gradient">Profile</span></h1>

        <div className="profile-grid">
          
          {/* Profile Details Card */}
          <div>
            <div className="glass-panel" style={{ padding: '2rem', position: 'relative' }}>
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="icon-btn" 
                  style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: 'var(--primary)' }}
                  title="Edit Profile"
                >
                  <Edit2 size={20} />
                </button>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
                  {userData?.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                </div>
                <div>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={editForm.name} 
                      onChange={e => setEditForm({...editForm, name: e.target.value})} 
                      className="form-input" 
                      style={{ padding: '0.4rem', marginBottom: '0.5rem' }} 
                      placeholder="Your Name"
                    />
                  ) : (
                    <h2 style={{ fontSize: '1.2rem', margin: 0 }}>{userData?.name || 'User'}</h2>
                  )}
                  <p style={{ color: 'var(--foreground)', margin: 0, fontSize: '0.9rem' }}>{user.email}</p>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#666' }}>Personal Details</h3>
                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <input type="tel" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="form-input" placeholder="Phone Number" />
                    <input type="text" value={editForm.company} onChange={e => setEditForm({...editForm, company: e.target.value})} className="form-input" placeholder="Company (Optional)" />
                  </div>
                ) : (
                  <>
                    <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}><strong>Phone:</strong> {userData?.phone || 'Not provided'}</p>
                    {(userData?.company) && <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}><strong>Company:</strong> {userData.company}</p>}
                  </>
                )}
              </div>
              
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#666' }}>Saved Address</h3>
                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <input type="text" value={editForm.street} onChange={e => setEditForm({...editForm, street: e.target.value})} className="form-input" placeholder="Street Address" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <input type="text" value={editForm.city} onChange={e => setEditForm({...editForm, city: e.target.value})} className="form-input" placeholder="City" />
                      <input type="text" value={editForm.state} onChange={e => setEditForm({...editForm, state: e.target.value})} className="form-input" placeholder="State" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <input type="text" value={editForm.country} onChange={e => setEditForm({...editForm, country: e.target.value})} className="form-input" placeholder="Country" />
                      <input type="text" value={editForm.postalCode} onChange={e => setEditForm({...editForm, postalCode: e.target.value})} className="form-input" placeholder="Postal Code" />
                    </div>
                  </div>
                ) : (
                  <>
                    {userData?.address ? (
                      <>
                        <p style={{ fontSize: '0.9rem', margin: '0.2rem 0' }}>{userData.address.street}</p>
                        <p style={{ fontSize: '0.9rem', margin: '0.2rem 0' }}>{userData.address.city}, {userData.address.state}</p>
                        <p style={{ fontSize: '0.9rem', margin: '0.2rem 0' }}>{userData.address.country} - {userData.address.postalCode}</p>
                      </>
                    ) : (
                      <p style={{ fontSize: '0.9rem', color: '#666' }}>No address saved.</p>
                    )}
                  </>
                )}
              </div>

              {isEditing && (
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                  <button onClick={handleSaveProfile} disabled={savingProfile} className="btn btn-primary" style={{ flex: 1, padding: '0.6rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                    <Save size={18} /> {savingProfile ? 'Saving...' : 'Save Profile'}
                  </button>
                  <button onClick={() => setIsEditing(false)} className="btn btn-outline" style={{ padding: '0.6rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <X size={18} /> Cancel
                  </button>
                </div>
              )}
            </div>
            
            {/* Wishlist Card */}
            <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem' }}>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>My Wishlist</h2>
              {fetchingWishlist ? (
                <p style={{ fontSize: '0.9rem', color: '#666' }}>Loading...</p>
              ) : wishlist.length === 0 ? (
                <p style={{ fontSize: '0.9rem', color: '#666' }}>Your wishlist is empty.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {wishlist.map(item => (
                    <Link href={`/product/${item.slug || item.id}`} key={item.id} style={{ display: 'flex', gap: '1rem', textDecoration: 'none', color: 'inherit' }}>
                      <div style={{ width: '60px', height: '80px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: '#eee', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <img src={item.image || (item.images && item.images[0])} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={item.name} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <h4 style={{ margin: '0 0 0.4rem 0', fontSize: '0.95rem', fontWeight: 'bold' }}>{item.name}</h4>
                        <p style={{ margin: 0, color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem' }}>{item.offerPrice || item.price}</p>
                      </div>
                    </Link>
                  ))}
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
                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                          <span style={{ 
                            padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.85rem',
                            background: getStatusColor(order.status || 'Processing'), 
                            color: 'white', fontWeight: 'bold'
                          }}>
                            {order.status || 'Processing'}
                          </span>
                          <a href={`https://shiprocket.co/tracking/${order.awb || ''}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'underline', fontWeight: 'bold' }}>
                            Track Parcel
                          </a>
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
