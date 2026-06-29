import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Package, TrendingUp, Archive, Plus, LogOut, Calendar } from 'lucide-react';
import { API_URL } from '../config';

const NurseryDashboard = ({ currentUser }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ plants_sold: 0, plants_present: 0, total_earned: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser || currentUser.role !== 'nursery') {
        navigate('/login');
        return;
      }
      
      try {
        setLoading(true);
        const statsRes = await axios.get(`${API_URL}/api/nursery/${currentUser.id}/stats`);
        setStats(statsRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="container animate-fade-in page-wrapper" style={{ paddingBottom: '80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
        <h2 style={{ margin: 0 }}>Welcome, {currentUser?.nursery_name}</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/nursery-pickups" className="btn glass-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--text-dark)' }}>
            <Calendar size={16} /> Pick up slots
          </Link>
          <button onClick={handleLogout} className="btn glass-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      <div className="dashboard-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div className="glass-card stat-card" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ color: 'var(--primary-color)', marginBottom: '10px' }}><Package size={32} /></div>
          <h3>{stats.plants_present}</h3>
          <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Plants Present</p>
        </div>
        <div className="glass-card stat-card" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ color: '#F59E0B', marginBottom: '10px' }}><Archive size={32} /></div>
          <h3>{stats.plants_sold}</h3>
          <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Plants Sold</p>
        </div>
        <div className="glass-card stat-card" style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ color: '#10B981', marginBottom: '10px' }}><TrendingUp size={32} /></div>
          <h3>${stats.total_earned.toFixed(2)}</h3>
          <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Total Earned</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px', maxWidth: '1000px', margin: '0 auto' }}>
        <Link to="/nursery-inventory" style={{ textDecoration: 'none' }}>
          <div className="glass-card hover-lift" style={{ 
            minHeight: '240px', 
            borderRadius: '24px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            cursor: 'pointer',
            background: 'linear-gradient(145deg, #e6f4ea, #cce8d5)',
            border: '1px solid rgba(116, 198, 157, 0.3)',
            boxShadow: '0 12px 40px rgba(116, 198, 157, 0.2)'
          }}>
            <div style={{ background: 'var(--primary-color)', padding: '24px', borderRadius: '50%', marginBottom: '20px', color: 'white', boxShadow: '0 8px 16px rgba(116, 198, 157, 0.4)' }}>
              <Archive size={48} />
            </div>
            <h3 style={{ color: '#1b4332', fontSize: '1.6rem', margin: 0, fontWeight: '700' }}>My Plants</h3>
            <p style={{ color: '#2d6a4f', marginTop: '10px', textAlign: 'center', padding: '0 20px', fontWeight: '500' }}>Manage your inventory, update stock, and track sales</p>
          </div>
        </Link>

        <Link to="/nursery-list" style={{ textDecoration: 'none' }}>
          <div className="glass-card hover-lift" style={{ 
            minHeight: '240px', 
            borderRadius: '24px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            cursor: 'pointer',
            background: 'linear-gradient(145deg, #40916c, #1b4332)',
            border: '1px solid rgba(0,0,0,0.2)',
            boxShadow: '0 12px 40px rgba(27, 67, 50, 0.4)'
          }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '24px', borderRadius: '50%', marginBottom: '20px', color: 'white', boxShadow: '0 8px 16px rgba(0,0,0,0.2)', backdropFilter: 'blur(5px)' }}>
              <Plus size={48} />
            </div>
            <h3 style={{ color: 'white', fontSize: '1.6rem', margin: 0, fontWeight: '700' }}>List a New Plant</h3>
            <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '10px', textAlign: 'center', padding: '0 20px', fontWeight: '500' }}>Add new plants to your store and set initial stock</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default NurseryDashboard;
