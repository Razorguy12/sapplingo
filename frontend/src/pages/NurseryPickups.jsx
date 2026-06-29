import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, CheckCircle, MapPin, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

const NurseryPickups = ({ currentUser }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'nursery') {
      navigate('/');
      return;
    }
    fetchOrders();
  }, [currentUser, navigate]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/nursery/${currentUser.id}/pickups`);
      setOrders(res.data);
    } catch (error) {
      console.error('Error fetching pickups', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (orderId) => {
    try {
      await axios.put(`${API_URL}/api/orders/${orderId}/approve`);
      fetchOrders();
      alert('Order approved! Status updated to Booked.');
    } catch (error) {
      alert('Failed to approve order.');
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const approvedOrders = orders.filter(o => o.status === 'booked');

  const displayOrders = activeTab === 'pending' ? pendingOrders : approvedOrders;

  if (loading) return <div className="container" style={{ padding: '40px', textAlign: 'center' }}>Loading pickups...</div>;

  return (
    <div className="container animate-fade-in page-wrapper" style={{ paddingBottom: '80px', maxWidth: '1000px', margin: '0 auto' }}>
      <Link to="/" className="glass-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '30px', textDecoration: 'none', color: 'var(--text-dark)' }}>
        <ArrowLeft size={18} /> Back to Dashboard
      </Link>

      <h2 style={{ color: 'var(--primary-color)', marginBottom: '30px' }}>Pickup Slots</h2>

      <div className="tabs" style={{ display: 'flex', gap: '15px', marginBottom: '30px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
        <button 
          className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
          style={{ background: 'none', border: 'none', padding: '10px 20px', fontSize: '1rem', cursor: 'pointer', fontWeight: activeTab === 'pending' ? '600' : '400', color: activeTab === 'pending' ? 'var(--primary-color)' : 'var(--text-light)', borderBottom: activeTab === 'pending' ? '2px solid var(--primary-color)' : 'none' }}
        >
          Pending ({pendingOrders.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'approved' ? 'active' : ''}`}
          onClick={() => setActiveTab('approved')}
          style={{ background: 'none', border: 'none', padding: '10px 20px', fontSize: '1rem', cursor: 'pointer', fontWeight: activeTab === 'approved' ? '600' : '400', color: activeTab === 'approved' ? 'var(--primary-color)' : 'var(--text-light)', borderBottom: activeTab === 'approved' ? '2px solid var(--primary-color)' : 'none' }}
        >
          Approved ({approvedOrders.length})
        </button>
      </div>

      <div className="orders-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {displayOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-light)', borderRadius: '12px', color: 'var(--text-light)' }}>
            No {activeTab} pickups found.
          </div>
        ) : (
          displayOrders.map(order => (
            <div key={order.id} className="glass-card animate-slide-up" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '15px' }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0' }}>Order #{order.id}</h3>
                  <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Customer ID: {order.user_id}</div>
                </div>
                <div style={{ background: order.status === 'booked' ? '#dcfce7' : '#fef9c3', color: order.status === 'booked' ? '#166534' : '#854d0e', padding: '5px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'capitalize' }}>
                  {order.status === 'booked' ? 'Booked' : 'Pending'}
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <h4 style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-dark)' }}><Calendar size={16} /> Pickup Details</h4>
                  {order.pickup_date ? (
                    <>
                      <div>Date: {order.pickup_date}</div>
                      <div>Time: {order.pickup_time}</div>
                      <div>Type: {order.delivery_type}</div>
                    </>
                  ) : (
                    <div style={{ color: 'var(--text-light)' }}>No pickup slot specified</div>
                  )}
                </div>
                <div style={{ flex: 2, minWidth: '300px' }}>
                  <h4 style={{ marginBottom: '10px', color: 'var(--text-dark)' }}>Items</h4>
                  {order.items.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.95rem' }}>
                      <span>{item.plant.name} x{item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed rgba(0,0,0,0.1)', fontWeight: 'bold' }}>
                    <span>Total</span>
                    <span>${order.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {order.status === 'pending' && (
                <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => handleApprove(order.id)} className="btn btn-primary glass-btn" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <CheckCircle size={18} /> Approve Availability
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NurseryPickups;
