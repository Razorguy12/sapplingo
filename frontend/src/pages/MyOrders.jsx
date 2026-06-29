import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Calendar, MapPin, ArrowLeft, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

const MyOrders = ({ currentUser }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser || currentUser.is_admin || currentUser.role === 'nursery') {
      navigate('/');
      return;
    }
    fetchOrders();
  }, [currentUser, navigate]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/orders/${currentUser.id}`);
      setOrders(res.data);
    } catch (error) {
      console.error('Error fetching orders', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container" style={{ padding: '40px', textAlign: 'center' }}>Loading orders...</div>;

  return (
    <div className="container animate-fade-in page-wrapper" style={{ paddingBottom: '80px', maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/" className="glass-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '30px', textDecoration: 'none', color: 'var(--text-dark)' }}>
        <ArrowLeft size={18} /> Back to Dashboard
      </Link>

      <h2 style={{ color: 'var(--primary-color)', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Package size={28} /> My Orders
      </h2>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-light)', borderRadius: '12px', color: 'var(--text-light)' }}>
          You have no orders yet.
          <div style={{ marginTop: '20px' }}>
            <Link to="/buy" className="btn btn-primary glass-btn">Browse Plants</Link>
          </div>
        </div>
      ) : (
        <div className="orders-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map(order => (
            <div key={order.id} className="glass-card animate-slide-up" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '15px' }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0' }}>Order #{order.id}</h3>
                  <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
                    Placed on {new Date(order.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ 
                  background: order.status === 'booked' ? '#dcfce7' : '#fef9c3', 
                  color: order.status === 'booked' ? '#166534' : '#854d0e', 
                  padding: '6px 14px', 
                  borderRadius: '20px', 
                  fontSize: '0.85rem', 
                  fontWeight: 'bold', 
                  textTransform: 'capitalize',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  {order.status === 'booked' ? (
                    <>Booked <CheckCircleIcon size={14} /></>
                  ) : (
                    <>Pending Approval <Clock size={14} /></>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <h4 style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-dark)' }}><Calendar size={16} /> Fulfillment Details</h4>
                  {order.pickup_date ? (
                    <div style={{ color: 'var(--text-light)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                      <strong>Date:</strong> {order.pickup_date}<br/>
                      <strong>Time:</strong> {order.pickup_time}<br/>
                      <strong>Type:</strong> {order.delivery_type === 'pickup' ? 'Pick Up' : 'Delivery'}
                    </div>
                  ) : (
                    <div style={{ color: 'var(--text-light)' }}>Standard processing</div>
                  )}
                </div>
                <div style={{ flex: 2, minWidth: '300px' }}>
                  <h4 style={{ marginBottom: '10px', color: 'var(--text-dark)' }}>Items</h4>
                  {order.items.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.95rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={item.plant.image_url} alt={item.plant.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
                        <span>{item.plant.name} <span style={{ color: 'var(--text-light)' }}>x{item.quantity}</span></span>
                      </div>
                      <span style={{ fontWeight: '500' }}>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed rgba(0,0,0,0.1)', fontWeight: 'bold', fontSize: '1.1rem' }}>
                    <span>Total</span>
                    <span style={{ color: 'var(--primary-color)' }}>${order.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CheckCircleIcon = ({ size }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

export default MyOrders;
