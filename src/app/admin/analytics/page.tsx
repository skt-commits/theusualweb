'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TrendingUp, Users, ShoppingBag, DollarSign } from 'lucide-react';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    averageOrderValue: 0
  });
  
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        
        let revenue = 0;
        const uniqueCustomers = new Set();
        const orders: any[] = [];
        
        snapshot.forEach(doc => {
          const data = doc.data();
          revenue += data.totalAmount || 0;
          if (data.email) uniqueCustomers.add(data.email);
          orders.push({ id: doc.id, ...data });
        });

        setStats({
          totalRevenue: revenue,
          totalOrders: orders.length,
          totalCustomers: uniqueCustomers.size,
          averageOrderValue: orders.length > 0 ? Math.round(revenue / orders.length) : 0
        });
        
        setRecentOrders(orders.slice(0, 10)); // Just for a mini-chart/table
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, []);

  if (loading) return <div>Loading analytics...</div>;

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Store Analytics</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ padding: '1rem', background: '#dbeafe', color: '#2563eb', borderRadius: '50%' }}>
            <DollarSign size={32} />
          </div>
          <div>
            <p style={{ color: '#64748b', fontWeight: 'bold', fontSize: '0.9rem' }}>TOTAL REVENUE</p>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#0f172a' }}>₹{stats.totalRevenue.toLocaleString()}</h2>
          </div>
        </div>
        
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ padding: '1rem', background: '#fef3c7', color: '#d97706', borderRadius: '50%' }}>
            <ShoppingBag size={32} />
          </div>
          <div>
            <p style={{ color: '#64748b', fontWeight: 'bold', fontSize: '0.9rem' }}>TOTAL ORDERS</p>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#0f172a' }}>{stats.totalOrders}</h2>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ padding: '1rem', background: '#f3e8ff', color: '#9333ea', borderRadius: '50%' }}>
            <Users size={32} />
          </div>
          <div>
            <p style={{ color: '#64748b', fontWeight: 'bold', fontSize: '0.9rem' }}>UNIQUE CUSTOMERS</p>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#0f172a' }}>{stats.totalCustomers}</h2>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ padding: '1rem', background: '#d1fae5', color: '#059669', borderRadius: '50%' }}>
            <TrendingUp size={32} />
          </div>
          <div>
            <p style={{ color: '#64748b', fontWeight: 'bold', fontSize: '0.9rem' }}>AVERAGE ORDER</p>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#0f172a' }}>₹{stats.averageOrderValue.toLocaleString()}</h2>
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Recent Order Volume</h2>
        
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '200px', padding: '1rem 0', borderBottom: '1px solid #e2e8f0' }}>
          {/* Simple CSS Bar Chart representing last 10 orders visually */}
          {recentOrders.reverse().map((order, i) => {
            const heightPercentage = Math.max(10, Math.min(100, (order.totalAmount / (stats.averageOrderValue * 2 || 1)) * 100));
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', group: 'true' }}>
                <div style={{ width: '100%', background: 'var(--primary)', height: `${heightPercentage}%`, borderRadius: '4px 4px 0 0', opacity: 0.8, transition: 'all 0.3s' }}></div>
              </div>
            );
          })}
        </div>
        <p style={{ textAlign: 'center', marginTop: '1rem', color: '#64748b', fontSize: '0.9rem' }}>Visual representation of recent order values</p>
      </div>
    </div>
  );
}
