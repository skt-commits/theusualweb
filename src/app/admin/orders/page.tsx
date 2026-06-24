'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { X } from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' or 'asc'

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Fetch all, we'll sort client-side to easily support dynamic toggling
      const querySnapshot = await getDocs(collection(db, 'orders'));
      const fetchedOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(fetchedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
    setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      // Update local state
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update order status.");
    }
  };

  // 1. Filter
  const filteredOrders = filterStatus === 'All' 
    ? orders 
    : orders.filter(o => o.status === filterStatus);

  // 2. Sort
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  return (
    <div>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem' }}>Manage Orders</h1>
          <p style={{ color: 'var(--foreground)' }}>View and manage customer orders.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', color: '#666' }}>Filter Status</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="form-input" style={{ padding: '0.5rem', minWidth: '150px' }}>
              <option value="All">All Orders</option>
              <option value="Processing">Processing</option>
              <option value="Order Received">Order Received</option>
              <option value="Shipped">Shipped</option>
              <option value="On the way">On the way</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.3rem', color: '#666' }}>Sort by Date</label>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="form-input" style={{ padding: '0.5rem', minWidth: '150px' }}>
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1rem', overflowX: 'auto' }}>
        {loading ? (
          <p style={{ padding: '1rem' }}>Loading orders...</p>
        ) : sortedOrders.length === 0 ? (
          <p style={{ padding: '1rem' }}>No orders found.</p>
        ) : (
          <table style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ padding: '1rem' }}>Order ID</th>
                <th style={{ padding: '1rem' }}>Customer</th>
                <th style={{ padding: '1rem' }}>Total</th>
                <th style={{ padding: '1rem' }}>Date</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedOrders.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '1rem', fontWeight: 'bold', fontSize: '0.9rem' }}>...{order.id.slice(-6)}</td>
                  <td style={{ padding: '1rem' }}>
                    <div>{order.shippingInfo?.firstName} {order.shippingInfo?.lastName || order.shippingInfo?.fullName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--foreground)' }}>{order.userEmail}</div>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                    ₹ {order.totalAmount?.toLocaleString()}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <select 
                      value={order.status || 'Processing'}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className="form-input"
                      style={{ padding: '0.3rem', fontSize: '0.85rem', width: 'auto', minWidth: '130px' }}
                    >
                      <option value="Processing">Processing</option>
                      <option value="Order Received">Order Received</option>
                      <option value="Shipped">Shipped</option>
                      <option value="On the way">On the way</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button 
                      onClick={() => setSelectedOrder(order)} 
                      className="btn btn-outline" 
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-panel" style={{ 
            width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', 
            padding: '2rem', position: 'relative', background: '#fff' 
          }}>
            <button 
              onClick={() => setSelectedOrder(null)} 
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.8rem', color: 'var(--primary)' }}>Order Details</h2>
              <span style={{ 
                padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.85rem',
                background: 'var(--secondary)', color: 'white', fontWeight: 'bold'
              }}>
                {selectedOrder.status || 'Processing'}
              </span>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#666' }}>Customer Information</h3>
                <p><strong>Name:</strong> {selectedOrder.shippingInfo?.firstName} {selectedOrder.shippingInfo?.lastName || selectedOrder.shippingInfo?.fullName}</p>
                <p><strong>Email:</strong> {selectedOrder.userEmail}</p>
                <p><strong>Phone:</strong> {selectedOrder.shippingInfo?.phone || 'N/A'}</p>
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#666' }}>Payment Details</h3>
                <p><strong>Method:</strong> {selectedOrder.paymentMethod || 'UPI / Net Banking'}</p>
                <p><strong>Transaction ID:</strong> {selectedOrder.transactionId || `TXN${selectedOrder.id.slice(0, 8).toUpperCase()}`}</p>
                <p><strong>Status:</strong> <span style={{ color: 'green', fontWeight: 'bold' }}>Paid</span></p>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#666' }}>Shipping Address</h3>
              <p>{selectedOrder.shippingInfo?.address || selectedOrder.shippingInfo?.streetAddress}</p>
              <p>{selectedOrder.shippingInfo?.city}, {selectedOrder.shippingInfo?.state}</p>
              <p>{selectedOrder.shippingInfo?.country} - {selectedOrder.shippingInfo?.postalCode}</p>
              {(selectedOrder.shippingInfo?.companyName) && <p><strong>Company:</strong> {selectedOrder.shippingInfo.companyName}</p>}
              {(selectedOrder.shippingInfo?.taxId) && <p><strong>Tax ID:</strong> {selectedOrder.shippingInfo.taxId}</p>}
            </div>

            <div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#666', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Items Ordered</h3>
              {selectedOrder.items?.map((item: any, idx: number) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', background: '#eee' }}>
                      <img src={item.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={item.name} />
                    </div>
                    <span>{item.name} x {item.quantity}</span>
                  </div>
                  <span style={{ fontWeight: 'bold' }}>{item.price}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '2px solid #eee', fontSize: '1.2rem', fontWeight: 'bold' }}>
                <span>Total Amount:</span>
                <span className="text-gradient">₹ {selectedOrder.totalAmount?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
