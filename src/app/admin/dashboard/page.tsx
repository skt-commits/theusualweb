'use client';

import { useState, useEffect } from 'react';
import { collection, getCountFromServer, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ChevronDown, ChevronUp, MessageSquare, Table, Users, ShoppingBag, Package, Download } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({ products: '-', users: '-', orders: '-' });
  const [messages, setMessages] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [expandedSection, setExpandedSection] = useState<string | null>('spreadsheet');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodSnapshot = await getCountFromServer(collection(db, 'products'));
        const userSnapshot = await getCountFromServer(collection(db, 'users'));
        const orderSnapshot = await getCountFromServer(collection(db, 'orders'));

        setMetrics({
          products: prodSnapshot.data().count.toString(),
          users: userSnapshot.data().count.toString(),
          orders: orderSnapshot.data().count.toString()
        });

        const msgQuery = query(collection(db, 'messages'), orderBy('createdAt', 'desc'), limit(5));
        const msgSnapshot = await getDocs(msgQuery);
        setMessages(msgSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        
        const orderQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const ordersSnap = await getDocs(orderQuery);
        setOrders(ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleDownloadCSV = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (orders.length === 0) {
      alert("No orders to export.");
      return;
    }
    
    const headers = ["Order ID", "Date", "Customer Name", "Customer Email", "Total Amount", "Status", "Payment Method"];
    const rows = orders.map(order => [
      order.id,
      new Date(order.createdAt).toLocaleDateString(),
      `"${order.shippingInfo?.firstName || ''} ${order.shippingInfo?.lastName || order.shippingInfo?.fullName || ''}"`,
      order.userEmail,
      order.totalAmount,
      order.status || 'Processing',
      order.paymentMethod || 'UPI / Net Banking'
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem' }}>Dashboard Overview</h1>
        <p style={{ color: 'var(--foreground)' }}>Welcome back to your central command center.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: '#e0e7ff', color: '#4f46e5', borderRadius: '12px' }}><Package size={24}/></div>
          <div><h3 style={{ fontSize: '0.9rem', color: 'var(--foreground)' }}>Products</h3><p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{metrics.products}</p></div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: '#dcfce7', color: '#16a34a', borderRadius: '12px' }}><Users size={24}/></div>
          <div><h3 style={{ fontSize: '0.9rem', color: 'var(--foreground)' }}>Users</h3><p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{metrics.users}</p></div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: '#fae8ff', color: '#c026d3', borderRadius: '12px' }}><ShoppingBag size={24}/></div>
          <div><h3 style={{ fontSize: '0.9rem', color: 'var(--foreground)' }}>Orders</h3><p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{metrics.orders}</p></div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* Spreadsheet View Section */}
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <div onClick={() => toggleSection('spreadsheet')} style={{ padding: '1.5rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: expandedSection === 'spreadsheet' ? 'rgba(0,0,0,0.02)' : 'transparent' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}><Table size={20}/> Sales Spreadsheet View</h2>
              <button onClick={handleDownloadCSV} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                <Download size={16} /> Export to CSV (Excel)
              </button>
            </div>
            {expandedSection === 'spreadsheet' ? <ChevronUp /> : <ChevronDown />}
          </div>
          {expandedSection === 'spreadsheet' && (
            <div style={{ padding: '0', borderTop: '1px solid var(--border-color)', overflowX: 'auto', maxHeight: '400px' }}>
              <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead style={{ background: '#f8fafc', position: 'sticky', top: 0, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                  <tr>
                    <th style={{ padding: '1rem', borderBottom: '2px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>Order ID</th>
                    <th style={{ padding: '1rem', borderBottom: '2px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>Date</th>
                    <th style={{ padding: '1rem', borderBottom: '2px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>Customer</th>
                    <th style={{ padding: '1rem', borderBottom: '2px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>Amount</th>
                    <th style={{ padding: '1rem', borderBottom: '2px solid #e2e8f0' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: '1rem', textAlign: 'center' }}>No orders found.</td></tr>
                  ) : (
                    orders.map((order, i) => (
                      <tr key={order.id} style={{ borderBottom: '1px solid #e2e8f0', background: i % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                        <td style={{ padding: '0.8rem 1rem', borderRight: '1px solid #e2e8f0', fontFamily: 'monospace' }}>...{order.id.slice(-6)}</td>
                        <td style={{ padding: '0.8rem 1rem', borderRight: '1px solid #e2e8f0' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: '0.8rem 1rem', borderRight: '1px solid #e2e8f0' }}>{order.shippingInfo?.firstName} {order.shippingInfo?.lastName || order.shippingInfo?.fullName}</td>
                        <td style={{ padding: '0.8rem 1rem', borderRight: '1px solid #e2e8f0', fontWeight: 'bold' }}>₹ {order.totalAmount?.toLocaleString()}</td>
                        <td style={{ padding: '0.8rem 1rem' }}>
                          <span style={{ padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem', background: order.status === 'Delivered' ? '#dcfce7' : '#f1f5f9', color: order.status === 'Delivered' ? '#16a34a' : '#475569' }}>
                            {order.status || 'Processing'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Contact Messages Section */}
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <div onClick={() => toggleSection('messages')} style={{ padding: '1.5rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: expandedSection === 'messages' ? 'rgba(0,0,0,0.02)' : 'transparent' }}>
            <h2 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <MessageSquare size={20}/> Recent Customer Messages
              {messages.length > 0 && (
                <span style={{ background: '#ef4444', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold', marginLeft: '0.5rem' }}>
                  {messages.length}
                </span>
              )}
            </h2>
            {expandedSection === 'messages' ? <ChevronUp /> : <ChevronDown />}
          </div>
          {expandedSection === 'messages' && (
            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
              {messages.length === 0 ? (
                <p>No messages yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {messages.map(msg => (
                    <div key={msg.id} style={{ padding: '1rem', background: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <strong style={{ color: 'var(--primary)' }}>{msg.name}</strong>
                        <span style={{ fontSize: '0.8rem', color: '#666' }}>{new Date(msg.createdAt).toLocaleString()}</span>
                      </div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--foreground)', marginBottom: '0.5rem' }}>{msg.email}</div>
                      <p style={{ background: 'white', padding: '1rem', borderRadius: '4px', fontStyle: 'italic' }}>"{msg.message}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
